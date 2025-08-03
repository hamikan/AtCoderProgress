
export interface Submission {
  id: number;
  epochSecond: number;
  problemId: string;
  contestId: string;
  userId: string;
  language: string;
  point: number;
  length: number;
  result: string;
  executionTime: number | null;
}

export interface SubmissionStatus {
  result: string;
  epochSecond: number;
}