import { Problem } from '@/types/problem';

export interface Contest {
  id: string;
  name: string;
  // number: number;
  // startEpochSecond: number;
  // durationSecond: number;
  problems: { [key: string]: Problem | null };
}
