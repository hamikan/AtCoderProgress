export const formatSigned = (value: number | null) => {
  if (value === null) return '-';
  const sign = value > 0 ? '+' : '';
  return `${sign}${value.toLocaleString()}`;
};

export const formatDifficulty = (difficulty: number | null) =>
  difficulty === null ? 'N/A' : difficulty.toLocaleString();
