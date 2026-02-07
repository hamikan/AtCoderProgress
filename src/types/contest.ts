import { Problem } from '@/types/problem';

export interface Contest {
  id: string;
  startEpochSecond: number;
  durationSecond: bigint;
  problems: Record<string, Problem | null>;
}
