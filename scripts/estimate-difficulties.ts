/**
 * 独自 difficulty（irt5_time）を推定して、データベースに書くスクリプト。
 *
 * 使い方:
 *   npm run difficulty:estimate                  # まだ推定していないコンテストを最大 10 個
 *   npm run difficulty:estimate -- --limit=30
 *
 * 1. scripts/data/custom-difficulty-seed.ts の値を、custom_difficulty がまだない問題に入れる
 * 2. 終わった ABC212 以降・ARC104 以降で、まだ推定していないコンテストの順位表を取って推定する
 *
 * 順位表 JSON はログインしないと取れない。AtCoder にログインしたブラウザのクッキー
 * REVEL_SESSION の値を、環境変数 ATCODER_REVEL_SESSION に入れて動かす。
 * ログインそのものの値なので、自分の PC にだけ置き、サーバーやリポジトリには置かない。
 * 本番のデータベースに書くときは、DATABASE_URL を本番のものにして動かす。
 */
import './load-env';

import {
  clipDifficulty,
  isCustomDifficultyTargetContest,
} from '@/features/problems/functions/difficulty';
import {
  estimateContestDifficulties,
  type ContestStandings,
} from '@/lib/atcoder/estimation/estimate-difficulty';
import { contestStandingsSchema } from '@/lib/atcoder/estimation/standings-schema';
import { prisma } from '@/lib/prisma';

import { CUSTOM_DIFFICULTY_SEED } from './data/custom-difficulty-seed';
import { describeDatabaseTarget } from './database-target';

const DEFAULT_LIMIT = 10;
// AtCoder に負荷をかけないよう、順位表は間を空けて 1 つずつ取る
const FETCH_DELAY_MS = 3000;
const FETCH_TIMEOUT_MS = 30_000;
const SESSION_ENV = 'ATCODER_REVEL_SESSION';

interface TargetContest {
  id: string;
}

function parseLimit(argv: string[]): number {
  let limit = DEFAULT_LIMIT;
  for (const arg of argv) {
    if (!arg.startsWith('--limit=')) {
      throw new Error(`不明な引数です: ${arg}`);
    }
    const value = Number(arg.slice('--limit='.length));
    if (!Number.isInteger(value) || value < 1) {
      throw new Error(`--limit の値が不正です: ${arg}`);
    }
    limit = value;
  }
  return limit;
}

async function applySeed(): Promise<void> {
  const ids = Object.keys(CUSTOM_DIFFICULTY_SEED);
  const customs = ids.map((id) => CUSTOM_DIFFICULTY_SEED[id]);
  const displays = customs.map((custom) => clipDifficulty(custom) ?? custom);
  const seededCount = await prisma.$executeRaw`
    UPDATE problems AS p
    SET custom_difficulty = v.custom, difficulty = v.display
    FROM unnest(${ids}::text[], ${customs}::int[], ${displays}::int[]) AS v(id, custom, display)
    WHERE p.id = v.id AND p.custom_difficulty IS NULL`;

  const seededContests = await prisma.contestProblem.findMany({
    where: { problemId: { in: ids } },
    select: { contestId: true },
    distinct: ['contestId'],
  });
  const marked = await prisma.contest.updateMany({
    where: {
      id: {
        in: seededContests
          .map((row) => row.contestId)
          .filter(isCustomDifficultyTargetContest),
      },
      customDifficultyEstimatedAt: null,
    },
    data: { customDifficultyEstimatedAt: new Date() },
  });
  if (seededCount > 0 || marked.count > 0) {
    console.log(
      `最初の推定値を ${seededCount} 問に入れ、${marked.count} 個のコンテストを推定済みにしました`
    );
  }
}

async function findTargetContests(): Promise<TargetContest[]> {
  const nowSecond = Math.floor(Date.now() / 1000);
  // 問題データがまだないコンテストを推定済みにすると、あとで問題が入っても推定されなくなる
  const contests = await prisma.contest.findMany({
    where: { customDifficultyEstimatedAt: null, problems: { some: {} } },
    select: { id: true, startEpochSecond: true, durationSecond: true },
    orderBy: { startEpochSecond: 'asc' },
  });
  return contests.filter(
    (contest) =>
      isCustomDifficultyTargetContest(contest.id) &&
      contest.startEpochSecond + Number(contest.durationSecond) <= nowSecond
  );
}

async function fetchStandings(
  contestId: string,
  session: string
): Promise<ContestStandings | null> {
  const response = await fetch(`https://atcoder.jp/contests/${contestId}/standings/json`, {
    headers: { Cookie: `REVEL_SESSION=${session}` },
    redirect: 'manual',
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  });
  if (response.status === 404) {
    return null;
  }
  if (response.headers.get('location')?.includes('/login')) {
    throw new Error(
      `ログインの情報が切れています。${SESSION_ENV} を、ログインし直したブラウザの REVEL_SESSION の値に入れ直してください`
    );
  }
  if (!response.ok) {
    throw new Error(`${contestId}: 順位表を取れませんでした（status ${response.status}）`);
  }
  return contestStandingsSchema.parse(await response.json());
}

async function saveEstimates(
  contestId: string,
  standings: ContestStandings | null
): Promise<string> {
  if (!standings) {
    await markEstimated(contestId);
    return `${contestId}: 順位表がないので飛ばしました`;
  }
  const estimates = estimateContestDifficulties(standings);
  if (estimates.size === 0) {
    await markEstimated(contestId);
    return `${contestId}: 推定に使える参加者がいないので飛ばしました`;
  }

  const savedCount = await prisma.$transaction(async (transaction) => {
    let count = 0;
    for (const [taskId, estimate] of estimates) {
      const custom = Math.round(estimate.difficulty);
      // 別のコンテストと共有している問題は、先に推定した値を残す
      const result = await transaction.problem.updateMany({
        where: { id: taskId, customDifficulty: null },
        data: { customDifficulty: custom, difficulty: clipDifficulty(custom) },
      });
      count += result.count;
    }
    await transaction.contest.update({
      where: { id: contestId },
      data: { customDifficultyEstimatedAt: new Date() },
    });
    return count;
  });
  const boundaryCount = [...estimates.values()].filter((estimate) => estimate.atBoundary).length;
  return (
    `${contestId}: ${estimates.size} 問を推定し、${savedCount} 問に書きました` +
    (boundaryCount > 0 ? `（探索範囲の端: ${boundaryCount} 問）` : '')
  );
}

async function markEstimated(contestId: string): Promise<void> {
  await prisma.contest.update({
    where: { id: contestId },
    data: { customDifficultyEstimatedAt: new Date() },
  });
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main(): Promise<void> {
  const limit = parseLimit(process.argv.slice(2));
  console.log(`DB 接続先: ${describeDatabaseTarget()}`);

  await applySeed();

  const targets = await findTargetContests();
  if (targets.length === 0) {
    console.log('推定するコンテストはありません');
    return;
  }
  const session = process.env[SESSION_ENV];
  if (!session) {
    throw new Error(
      `まだ推定していないコンテストが ${targets.length} 個あります（${targets
        .slice(0, 5)
        .map((contest) => contest.id)
        .join(', ')} など）。` +
        `順位表を取るには、AtCoder にログインしたブラウザのクッキー REVEL_SESSION の値を ${SESSION_ENV} に入れてください`
    );
  }

  const batch = targets.slice(0, limit);
  for (const [index, contest] of batch.entries()) {
    if (index > 0) {
      await sleep(FETCH_DELAY_MS);
    }
    const standings = await fetchStandings(contest.id, session);
    console.log(await saveEstimates(contest.id, standings));
  }
  if (targets.length > batch.length) {
    console.log(`残りの ${targets.length - batch.length} 個は、もう一度動かすと推定します`);
  }
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
