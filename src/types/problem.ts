export interface ProblemFromPrisma {
  id: string;
  contestId: string;
  problemIndex: string;
  name: string;
  difficulty: number | null;
}
