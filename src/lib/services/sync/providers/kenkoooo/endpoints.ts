export const CONTEST_ENDPOINTS = {
  CONTESTS: 'https://kenkoooo.com/atcoder/resources/contests.json',
  CONTEST_PROBLEMS: 'https://kenkoooo.com/atcoder/resources/contest-problem.json',
  MERGED_PROBLEMS: 'https://kenkoooo.com/atcoder/resources/merged-problems.json',
  PROBLEM_MODELS: 'https://kenkoooo.com/atcoder/resources/problem-models.json',
} as const;

export const SUBMISSION_ENDPOINTS = {
  SUBMISSIONS: 'https://kenkoooo.com/atcoder/atcoder-api/v3/user/submissions?user=',
} as const;