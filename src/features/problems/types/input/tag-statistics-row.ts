export interface UserTagStatisticsRow {
  id: string;
  name: string;
  tagId: string | null;
}

export interface MasterTagStatisticsRow {
  id: string;
  name: string;
}

export interface TagCountRow {
  tagId: string;
  _count: { _all: number };
}

export interface SolutionUserTagProblemRow {
  userTagId: string;
  solution: { problemId: string };
}
