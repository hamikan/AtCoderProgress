/**
 * Formats a problem reference the way it is shown across the app,
 * e.g. ("abc269", "abc269_f", "Numbered Cards") -> "ABC 269 F - Numbered Cards".
 */
export function formatProblemDisplayName(
  contestId: string,
  problemId: string,
  problemName: string
): string {
  const contestLabel = formatContestLabel(contestId);
  const problemIndex = getProblemIndex(contestId, problemId);

  if (!problemIndex) {
    return `${contestLabel} - ${problemName}`;
  }
  return `${contestLabel} ${problemIndex} - ${problemName}`;
}

function formatContestLabel(contestId: string): string {
  const match = contestId.match(/^([a-z]+)(\d+)$/i);
  if (!match) {
    return contestId.toUpperCase();
  }
  return `${match[1].toUpperCase()} ${match[2]}`;
}

function getProblemIndex(contestId: string, problemId: string): string | null {
  const prefix = `${contestId}_`;
  if (!problemId.startsWith(prefix)) {
    return null;
  }
  const suffix = problemId.slice(prefix.length);
  if (!suffix) {
    return null;
  }
  return suffix.charAt(0).toUpperCase() + suffix.slice(1).toLowerCase();
}
