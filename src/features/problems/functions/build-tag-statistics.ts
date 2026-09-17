import type {
  MasterTagStatisticsRow,
  SolutionUserTagProblemRow,
  TagCountRow,
  TagStat,
  UserTagStatisticsRow,
} from '@/features/problems/types';

export function buildOfficialTagStatistics({
  masterTags,
  solvedCounts,
  totalCounts,
  userTags,
}: {
  masterTags: MasterTagStatisticsRow[];
  solvedCounts: TagCountRow[];
  totalCounts: TagCountRow[];
  userTags: UserTagStatisticsRow[];
}): { stats: TagStat[]; unlinkedUserTags: UserTagStatisticsRow[] } {
  const totalMap = new Map(
    totalCounts.map((row) => [row.tagId, row._count._all])
  );
  const solvedMap = new Map(
    solvedCounts.map((row) => [row.tagId, row._count._all])
  );
  const linkedUserTags = userTags.filter(
    (tag): tag is UserTagStatisticsRow & { tagId: string } =>
      tag.tagId !== null
  );
  const unlinkedUserTags = userTags.filter((tag) => tag.tagId === null);
  const linkedTagIds = new Set(linkedUserTags.map((tag) => tag.tagId));
  const visibleTags = [
    ...linkedUserTags.map((tag) => ({
      id: tag.tagId,
      name: tag.name,
    })),
    ...masterTags.filter((tag) => !linkedTagIds.has(tag.id)),
  ];
  const stats = visibleTags.flatMap<TagStat>((tag) => {
    const total = totalMap.get(tag.id) ?? 0;
    if (total === 0) return [];

    const solved = solvedMap.get(tag.id) ?? 0;
    return [{
      tagId: tag.id,
      name: tag.name,
      score: Math.round((solved / total) * 100),
      total,
      solved,
      type: 'official',
    }];
  });

  return { stats, unlinkedUserTags };
}

export function getProblemIdsByUserTag(
  rows: SolutionUserTagProblemRow[]
): Map<string, Set<string>> {
  return rows.reduce((problemIdsByTag, row) => {
    const current = problemIdsByTag.get(row.userTagId) ?? new Set<string>();
    return new Map(problemIdsByTag).set(
      row.userTagId,
      new Set([...current, row.solution.problemId])
    );
  }, new Map<string, Set<string>>());
}

export function buildUnlinkedTagStatistics({
  problemIdsByTag,
  solvedProblemIds,
  userTags,
}: {
  problemIdsByTag: Map<string, Set<string>>;
  solvedProblemIds: ReadonlySet<string>;
  userTags: UserTagStatisticsRow[];
}): TagStat[] {
  const tagNames = new Map(userTags.map((tag) => [tag.id, tag.name]));

  return [...problemIdsByTag.entries()].flatMap<TagStat>(
    ([tagId, problemIds]) => {
      if (problemIds.size === 0) return [];
      const solved = [...problemIds].filter((problemId) =>
        solvedProblemIds.has(problemId)
      ).length;

      return [{
        tagId,
        name: tagNames.get(tagId) ?? tagId,
        score: Math.round((solved / problemIds.size) * 100),
        total: problemIds.size,
        solved,
        type: 'unofficial',
      }];
    }
  );
}
