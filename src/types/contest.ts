import { Problem } from '@/types/problem';

export type ContestType = 'ALL' | 'ABC' | 'ARC' | 'AGC';
export type ContestKind = 'abc' | 'arc' | 'agc';
export type ContestOrder = 'asc' | 'desc';

export interface Contest {
  id: string;
  startEpochSecond: number;
  durationSecond: number;
  problems: Record<string, Problem | null>;
}
