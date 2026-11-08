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

const DIFFICULTY_BAND_COLORS = [
  '#808080',
  '#804000',
  '#008000',
  '#00C0C0',
  '#0000FF',
  '#C0C000',
  '#FF8000',
  '#FF0000',
] as const;
const DIFFICULTY_BAND_WIDTH = 400;

const METAL_COLORS = {
  bronze: { base: '#965C2C', highlight: '#FFDABD' },
  silver: { base: '#808080', highlight: '#FFFFFF' },
  gold: { base: '#FFD700', highlight: '#FFFFFF' },
} as const;

// AtCoder Problems と同じく、色の帯の中でどこまで進んだかを、下から塗る割合で表す。3200 以上は銅・銀・金の丸にする
export function getDifficultyCircleStyle(difficulty: number): {
  borderColor: string;
  background: string;
} {
  if (difficulty >= 3200) {
    const metal =
      difficulty >= 4000
        ? METAL_COLORS.gold
        : difficulty >= 3600
          ? METAL_COLORS.silver
          : METAL_COLORS.bronze;
    return {
      borderColor: metal.base,
      background: `linear-gradient(to right, ${metal.base}, ${metal.highlight}, ${metal.base})`,
    };
  }

  const clamped = Math.max(difficulty, 0);
  const color = DIFFICULTY_BAND_COLORS[Math.floor(clamped / DIFFICULTY_BAND_WIDTH)];
  const fillPercent = Math.round(((clamped % DIFFICULTY_BAND_WIDTH) / DIFFICULTY_BAND_WIDTH) * 100);
  return {
    borderColor: color,
    background: `linear-gradient(to top, ${color} ${fillPercent}%, transparent ${fillPercent}%)`,
  };
}
