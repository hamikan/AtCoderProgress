import type { SubmissionStatus } from './submission';

export interface SubmissionSummary {
  statusMap: Record<string, SubmissionStatus>;
  acCount: number;
  tryingCount: number;
}
