export interface RecentSubmission {
  id: number;
  epochSecond: number;
  problemId: string;
  contestId: string;
  title: string;
  result: string;
  difficulty: number | null;
}
