interface SolutionSaveHintInput {
  hasCurrentContest: boolean;
  hasProblemAndContest: boolean;
  isAuthenticated: boolean;
}

export function getSolutionSaveHint({
  hasCurrentContest,
  hasProblemAndContest,
  isAuthenticated,
}: SolutionSaveHintInput): string | null {
  if (!isAuthenticated) {
    return 'ログインすると、記録を保存できます。';
  }
  if (!hasProblemAndContest) {
    return '問題とコンテストを選ぶと、保存されます。';
  }
  if (!hasCurrentContest) {
    return 'この問題が入っているコンテストを選んでください。';
  }
  return null;
}
