import { Problem } from '@/types/problem';

export interface Contest {
  id: string;
  startEpochSecond: number;
  durationSecond: number;
  problems: { [key: string]: Problem | null };
}
