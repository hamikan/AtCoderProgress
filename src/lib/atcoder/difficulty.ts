export function getDifficultyColor(difficulty: number | null): string {
  if (difficulty === null || difficulty < 400) return 'text-[#808080]';
  if (difficulty < 800) return 'text-[#804000]';
  if (difficulty < 1200) return 'text-[#008000]';
  if (difficulty < 1600) return 'text-[#00C0C0]';
  if (difficulty < 2000) return 'text-[#0000FF]';
  if (difficulty < 2400) return 'text-[#C0C000]';
  if (difficulty < 2800) return 'text-[#FF8000]';
  return 'text-[#FF0000]';
}

export function getDifficultyOrbColor(difficulty: number | null): string {
  if (difficulty === null || difficulty < 400) return 'bg-[#808080]';
  if (difficulty < 800) return 'bg-[#804000]';
  if (difficulty < 1200) return 'bg-[#008000]';
  if (difficulty < 1600) return 'bg-[#00C0C0]';
  if (difficulty < 2000) return 'bg-[#0000FF]';
  if (difficulty < 2400) return 'bg-[#C0C000]';
  if (difficulty < 2800) return 'bg-[#FF8000]';
  return 'bg-[#FF0000]';
}
