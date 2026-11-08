const CUSTOM_DIFFICULTY_MIN_CONTEST = { abc: 212, arc: 104 } as const;

// 次のコードを引用・編集して使用しています。
// https://github.com/kenkoooo/AtCoderProblems/blob/master/atcoder-problems-frontend/src/utils/index.ts
export const clipDifficulty = (difficulty: number | null) => {
  if (difficulty === null) return null;
  return Math.round(
    difficulty >= 400 ? difficulty : 400 / Math.exp(1.0 - difficulty / 400)
  );
};

export function isCustomDifficultyTargetContest(contestId: string): boolean {
  const match = /^(abc|arc)(\d+)$/.exec(contestId);
  if (!match) return false;
  const kind = match[1] as keyof typeof CUSTOM_DIFFICULTY_MIN_CONTEST;
  return Number(match[2]) >= CUSTOM_DIFFICULTY_MIN_CONTEST[kind];
}

/**
 * 画面に出す difficulty を決める。独自推定があればそれを、なければ AtCoder Problems の値を使う。
 * null のときは、前の値を空で上書きしないよう、書き込まずに残す。
 */
export function resolveProblemDifficulty(
  customDifficulty: number | null,
  atcoderProblemsDifficulty: number | null
): number | null {
  if (customDifficulty !== null) return clipDifficulty(customDifficulty);
  return atcoderProblemsDifficulty;
}
