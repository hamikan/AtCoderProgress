/**
 * 独自 difficulty（irt5_time）の推定値を生成するスクリプト。
 *
 * 使い方:
 *   npm run difficulty:estimate -- <順位表JSONのディレクトリ>
 *
 * 順位表JSONは AtCoder のコンテスト順位表（/contests/<id>/standings/json）を
 * <contestId>.json という名前で保存したものを想定する。
 * 取得時は AtCoder への負荷に注意し、レート制限の兆候があれば即座に止めること。
 *
 * 対象は ABC212以降 / ARC104以降のコンテスト。それ以外は生成しない
 * （アプリ側で AtCoder Problems の difficulty 表示値をそのまま使う）。
 * 結果は src/features/problems/functions/estimated-difficulties.ts に書き出す。
 */
import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

import {
  estimateContestDifficulties,
  type ContestStandings,
} from '../src/lib/atcoder/estimation/estimate-difficulty';

const ABC_MIN = 212;
const ARC_MIN = 104;

const OUTPUT_PATH =
  process.env.ESTIMATE_OUTPUT ??
  path.join(
    process.cwd(),
    'src/features/problems/functions/estimated-difficulties.ts'
  );

function isTargetContest(contestId: string): boolean {
  const match = /^(abc|arc)(\d+)$/.exec(contestId);
  if (!match) return false;
  const number = Number(match[2]);
  return match[1] === 'abc' ? number >= ABC_MIN : number >= ARC_MIN;
}

function renderOutputFile(estimates: Record<string, number>): string {
  const lines = [
    '/**',
    ' * 独自 difficulty（irt5_time）の推定値。生成ファイル（手で編集しないこと）。',
    ' *',
    ' * 生成方法: npm run difficulty:estimate -- <順位表JSONのディレクトリ>',
    ' * 対象: ABC212以降 / ARC104以降の問題のみ。それ以外の問題は',
    ' * AtCoder Problems の difficulty を使う（normalize-contest-data.ts）。',
    ' * 値は表示用の clipDifficulty 適用前の推定値。',
    ' */',
    'export const ESTIMATED_DIFFICULTIES: Readonly<Record<string, number>> = {',
  ];
  for (const taskId of Object.keys(estimates).sort()) {
    lines.push(`  '${taskId}': ${estimates[taskId]},`);
  }
  lines.push('};', '');
  return lines.join('\n');
}

async function main(): Promise<void> {
  const standingsDir = process.argv[2] ?? process.env.STANDINGS_DIR;
  if (!standingsDir) {
    console.error(
      'Usage: npm run difficulty:estimate -- <standings directory>'
    );
    process.exitCode = 1;
    return;
  }

  const files = (await readdir(standingsDir))
    .filter((file) => file.endsWith('.json'))
    .map((file) => file.replace(/\.json$/, ''))
    .filter(isTargetContest)
    .sort();
  console.log(`Target contests: ${files.length}`);

  const estimates: Record<string, number> = {};
  let boundaryCount = 0;
  for (const contestId of files) {
    const raw = await readFile(path.join(standingsDir, `${contestId}.json`), 'utf8');
    const standings = JSON.parse(raw) as ContestStandings;
    const contestEstimates = estimateContestDifficulties(standings);
    if (contestEstimates.size === 0) {
      console.warn(`${contestId}: no selected users, skipped`);
      continue;
    }
    for (const [taskId, estimate] of contestEstimates) {
      if (taskId in estimates) {
        console.warn(`${taskId}: already estimated, keeping the first value`);
        continue;
      }
      estimates[taskId] = Math.round(estimate.difficulty);
      if (estimate.atBoundary) boundaryCount++;
    }
    console.log(
      `${contestId}: ${contestEstimates.size} problems estimated`
    );
  }

  await writeFile(OUTPUT_PATH, renderOutputFile(estimates));
  console.log(
    `Wrote ${Object.keys(estimates).length} estimates (${boundaryCount} at search boundary) to ${OUTPUT_PATH}`
  );
}

void main();
