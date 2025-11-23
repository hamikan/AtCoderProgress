export interface HeatmapDay {
  date: string; // YYYY-MM-DD
  level: number; // 0-4
  count: number; // 0以上の整数
}

const DEFAULT_SEED = 12345;

const createDeterministicRandom = (seed: number) => {
  let current = seed;
  return () => {
    // Park-Miller LCG
    current = (current * 48271) % 0x7fffffff;
    return current / 0x7fffffff;
  };
};

export const generateHeatmapData = (seed: number = DEFAULT_SEED): HeatmapDay[] => {
  const rand = createDeterministicRandom(seed);
  const today = new Date();
  const data: HeatmapDay[] = [];

  for (let i = 364; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);

    const level = Math.floor(rand() * 5);
    const countBase = Math.max(0, Math.round(rand() * 3));
    const count = level === 0 ? 0 : Math.max(1, level + countBase);

    data.push({
      date: date.toISOString().split('T')[0],
      level,
      count,
    });
  }

  return data;
};
