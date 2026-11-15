import 'server-only';

import { planContestDataWrites } from '@/features/problems/functions/plan-contest-data-writes';
import type {
  PersistContestDataResult,
  StoredContestData,
} from '@/features/problems/types/input/contest-data-write-plan';
import type { NormalizedContestData } from '@/features/problems/types/input/normalized-contest-data';
import { prisma } from '@/lib/prisma';

// 全件（約6万行）を1行ずつ書くと定期実行の時間の上限に収まらないので、まとめて書く
const WRITE_CHUNK_SIZE = 1000;

function chunk<T>(rows: T[]): T[][] {
  return Array.from({ length: Math.ceil(rows.length / WRITE_CHUNK_SIZE) }, (_, index) =>
    rows.slice(index * WRITE_CHUNK_SIZE, (index + 1) * WRITE_CHUNK_SIZE)
  );
}

async function loadStoredContestData(): Promise<StoredContestData> {
  const [contests, problems, contestProblems] = await Promise.all([
    prisma.contest.findMany({
      select: { id: true, startEpochSecond: true, durationSecond: true },
    }),
    prisma.problem.findMany({
      select: { id: true, name: true, difficulty: true, customDifficulty: true, firstContestId: true },
    }),
    prisma.contestProblem.findMany({
      select: { contestId: true, problemId: true, problemIndex: true },
    }),
  ]);
  return {
    contests: contests.map((contest) => ({ ...contest, durationSecond: Number(contest.durationSecond) })),
    problems,
    contestProblems,
  };
}

export async function persistContestsAndProblems(
  data: NormalizedContestData
): Promise<PersistContestDataResult> {
  const plan = planContestDataWrites(await loadStoredContestData(), data);

  // 問題は最初のコンテストを、対応は両方を参照するので、コンテスト → 問題 → 対応の順に書く
  for (const rows of chunk(plan.contestsToCreate)) {
    await prisma.contest.createMany({ data: rows, skipDuplicates: true });
  }
  for (const rows of chunk(plan.contestsToUpdate)) {
    await prisma.$executeRaw`
      UPDATE contests AS c
      SET start_epoch_second = v.start_epoch_second, duration_second = v.duration_second
      FROM unnest(
        ${rows.map((row) => row.id)}::text[],
        ${rows.map((row) => row.startEpochSecond)}::int[],
        ${rows.map((row) => row.durationSecond)}::bigint[]
      ) AS v(id, start_epoch_second, duration_second)
      WHERE c.id = v.id`;
  }

  for (const rows of chunk(plan.problemsToCreate)) {
    await prisma.problem.createMany({ data: rows, skipDuplicates: true });
  }
  for (const rows of chunk(plan.problemsToUpdate)) {
    await prisma.$executeRaw`
      UPDATE problems AS p
      SET name = v.name, difficulty = v.difficulty, first_contest_id = v.first_contest_id
      FROM unnest(
        ${rows.map((row) => row.id)}::text[],
        ${rows.map((row) => row.name)}::text[],
        ${rows.map((row) => row.difficulty)}::int[],
        ${rows.map((row) => row.firstContestId)}::text[]
      ) AS v(id, name, difficulty, first_contest_id)
      WHERE p.id = v.id`;
  }

  for (const rows of chunk(plan.contestProblemsToCreate)) {
    await prisma.contestProblem.createMany({ data: rows, skipDuplicates: true });
  }
  for (const rows of chunk(plan.contestProblemsToUpdate)) {
    await prisma.$executeRaw`
      UPDATE contest_problems AS cp
      SET problem_index = v.problem_index
      FROM unnest(
        ${rows.map((row) => row.contestId)}::text[],
        ${rows.map((row) => row.problemId)}::text[],
        ${rows.map((row) => row.problemIndex)}::text[]
      ) AS v(contest_id, problem_id, problem_index)
      WHERE cp.contest_id = v.contest_id AND cp.problem_id = v.problem_id`;
  }

  return {
    createdContestCount: plan.contestsToCreate.length,
    updatedContestCount: plan.contestsToUpdate.length,
    createdProblemCount: plan.problemsToCreate.length,
    updatedProblemCount: plan.problemsToUpdate.length,
    createdContestProblemCount: plan.contestProblemsToCreate.length,
    updatedContestProblemCount: plan.contestProblemsToUpdate.length,
    skippedProblemCount: plan.skippedProblemCount,
    skippedContestProblemCount: plan.skippedContestProblemCount,
  };
}
