export interface Problem {
  id: string;
  contestId: string;
  problemIndex: string;
  name: string;
  difficulty: number | null;
  totalSolutionsCount: number;
}