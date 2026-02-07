import { Problem } from '@/types/problem';

export type ContestType = 'ALL' | 'ABC' | 'ARC' | 'AGC';

export interface Contest {
  id: string;
  startEpochSecond: number;
  durationSecond: bigint;
  problems: Record<string, Problem | null>;
}
