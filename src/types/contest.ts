export interface Problem {
  id: string;
  contestId: string;
  problemIndex: string;
  name: string;
  difficulty: number | null;
  tags: { [algorithm: string]: number };
}

export interface Contest {
  id: string;
  name: string;
  type: 'ABC' | 'ARC' | 'AGC' | 'AHC' | 'Other';
  number: number;
  date: string;
  problems: { [key: string]: Problem | null }; // A, B, C, D, E, F, G
}
