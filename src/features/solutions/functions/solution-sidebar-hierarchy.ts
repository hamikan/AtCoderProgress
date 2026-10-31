import type {
  SolutionListItem,
  SolutionSidebarTypeGroup,
} from '@/features/solutions/types';

interface ParsedContestId {
  type: string;
  label: string;
  sortKey: number;
}

const TYPE_PRIORITY = ['ABC', 'ARC', 'AGC'];

function parseContestId(contestId: string): ParsedContestId {
  // AtCoder Daily Training: adt_<kind>_<YYYYMMDD>_<slot>
  const dailyTraining = contestId.match(/^(adt_[a-z]+)_(\d{4})(\d{2})(\d{2})_(\d+)$/);
  if (dailyTraining) {
    const [, kind, year, month, day, slot] = dailyTraining;
    return {
      type: kind.toUpperCase(),
      label: `${year}/${month}/${day} #${slot}`,
      sortKey: Number(`${year}${month}${day}`) * 100 + Number(slot),
    };
  }

  const match = contestId.match(/^([a-zA-Z]+)(\d+)$/);
  if (!match) {
    return { type: contestId.toUpperCase(), label: '', sortKey: 0 };
  }

  return {
    type: match[1].toUpperCase(),
    label: match[2],
    sortKey: Number(match[2]),
  };
}

function compareTypes(a: string, b: string): number {
  const priorityA = TYPE_PRIORITY.indexOf(a);
  const priorityB = TYPE_PRIORITY.indexOf(b);

  if (priorityA !== -1 && priorityB !== -1) {
    return priorityA - priorityB;
  }

  if (priorityA !== -1) {
    return -1;
  }

  if (priorityB !== -1) {
    return 1;
  }

  return a.localeCompare(b);
}

export function buildSolutionSidebarHierarchy(
  solutions: SolutionListItem[]
): SolutionSidebarTypeGroup[] {
  const typeMap = new Map<string, Map<string, SolutionListItem[]>>();

  for (const solution of solutions) {
    const { type } = parseContestId(solution.contestId);
    const contestMap = typeMap.get(type) ?? new Map<string, SolutionListItem[]>();
    const problems = contestMap.get(solution.contestId) ?? [];

    contestMap.set(solution.contestId, [...problems, solution]);
    typeMap.set(type, contestMap);
  }

  return [...typeMap.entries()]
    .sort(([a], [b]) => compareTypes(a, b))
    .map(([type, contestMap]) => ({
      type,
      contests: [...contestMap.entries()]
        .map(([contestId, problems]) => ({ contestId, problems, ...parseContestId(contestId) }))
        .sort((a, b) => b.sortKey - a.sortKey)
        .map(({ contestId, label, problems }) => ({
          contestId,
          label,
          problems: [...problems].sort((a, b) => a.problemIndex.localeCompare(b.problemIndex)),
        })),
    }));
}
