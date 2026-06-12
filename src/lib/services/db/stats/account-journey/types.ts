export type RatingBandKey =
  | 'gray'
  | 'brown'
  | 'green'
  | 'cyan'
  | 'blue'
  | 'yellow'
  | 'orange'
  | 'red';

export interface RatingBandDefinition {
  key: RatingBandKey;
  label: string;
  rangeLabel: string;
  min: number;
  max: number | null;
  textColor: string;
  bgColor: string;
  borderColor: string;
  barColor: string;
}

export interface DifficultyBucketSummary {
  key: string;
  label: string;
  rangeLabel: string;
  count: number;
  percentage: number;
  textColor: string;
  bgColor: string;
  barColor: string;
}

export interface RatingBandSummary {
  band: RatingBandDefinition;
  contestCount: number;
  totalDays: number;
  periodLabel: string;
  activeDays: number;
  submissionCount: number;
  acSubmissionCount: number;
  attemptedCount: number;
  acceptedCount: number;
  averageDifficulty: number | null;
  medianDifficulty: number | null;
  minDifficulty: number | null;
  maxDifficulty: number | null;
  averageAttemptedDifficulty: number | null;
  acceptanceRate: number;
  solveRate: number;
  bestPerformance: number | null;
  firstActivityDate: string | null;
  lastActivityDate: string | null;
  difficultyDistribution: DifficultyBucketSummary[];
}

export interface CurriculumProblemProgress {
  index: string;
  contestId: string | null;
  problemId: string | null;
  title: string;
  difficulty: number | null;
  star: number | null;
  solved: boolean;
  solvedAt: string | null;
  solvedBand: RatingBandDefinition | null;
  url: string | null;
}

export interface CurriculumGroupProgress {
  key: string;
  label: string;
  total: number;
  solved: number;
  percentage: number;
  problems: CurriculumProblemProgress[];
}

export interface CurriculumSectionProgress {
  key: string;
  title: string;
  description: string;
  total: number;
  solved: number;
  percentage: number;
  groups: CurriculumGroupProgress[];
  problems: CurriculumProblemProgress[];
}

export interface RatingFitness {
  currentRating: number;
  highestRating: number;
  currentBand: RatingBandDefinition;
  nextBand: RatingBandDefinition | null;
  weightedAveragePerformance: number | null;
  weightedPerformanceStdDev: number | null;
  performanceContestCount: number;
  performanceDecayDays: number;
  fitnessScore: number | null;
  growthPressure: number | null;
  growthPressureStdDev: number | null;
  growthScore: number | null;
  label: string;
  description: string;
  growthLabel: string;
  growthDescription: string;
}

export interface AnalyticsSummary {
  acCount: number;
  attemptedCount: number;
  activeDays: number;
  ratedContestCount: number;
  activeBandCount: number;
}

export interface AccountJourneyAnalytics {
  summary: AnalyticsSummary;
  ratingFitness: RatingFitness;
  bandSummaries: RatingBandSummary[];
  curriculumSections: CurriculumSectionProgress[];
}

export type RatingHistoryRow = {
  oldRating: number;
  newRating: number;
  performance: number;
  contestName: string;
  contestScreenName: string;
  endTime: Date;
};

export type SubmissionRow = {
  problemId: string;
  contestId: string;
  result: string;
  epochSecond: number;
  problem: {
    id: string;
    name: string;
    difficulty: number | null;
  };
};

export type CurriculumRow = {
  contestId: string;
  problemId: string;
  problemIndex: string;
  problem: {
    name: string;
    difficulty: number | null;
  };
};

export interface FirstAcceptedProblem {
  problemId: string;
  contestId: string;
  title: string;
  difficulty: number | null;
  epochSecond: number;
}
