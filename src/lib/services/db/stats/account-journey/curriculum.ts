import { DP_CURRICULUM_CONTESTS } from './constants';
import {
  buildProblemUrl,
  classifyJoiContest,
  compareCurriculumRows,
  formatEpochDate,
  getRatingBand,
  resolveRatingAtEpoch,
  toPercentage,
} from './utils';
import type {
  CurriculumProblemProgress,
  CurriculumRow,
  CurriculumSectionProgress,
  FirstAcceptedProblem,
  RatingHistoryRow,
  SubmissionRow,
} from './types';

const TYPICAL90_STAR_PATTERN = /★(\d+)/;

export function buildFirstAcceptedByProblem(submissions: SubmissionRow[]) {
  return submissions.reduce((acceptedMap, submission) => {
    if (submission.result !== 'AC' || acceptedMap.has(submission.problemId)) {
      return acceptedMap;
    }

    return new Map(acceptedMap).set(submission.problemId, {
      problemId: submission.problemId,
      contestId: submission.contestId,
      title: submission.problem.name,
      difficulty: submission.problem.difficulty,
      epochSecond: submission.epochSecond,
    });
  }, new Map<string, FirstAcceptedProblem>());
}

export function buildCurriculumSections(
  curriculumRows: CurriculumRow[],
  firstAcceptedByProblem: Map<string, FirstAcceptedProblem>,
  ratingHistory: RatingHistoryRow[]
): CurriculumSectionProgress[] {
  const rowsByContest = groupRowsByContest(curriculumRows);
  const dpSections = buildDpCurriculumSections(
    rowsByContest,
    firstAcceptedByProblem,
    ratingHistory
  );
  const typical90Problems = buildCurriculumProblemsFromRows(
    rowsByContest.get('typical90') ?? [],
    firstAcceptedByProblem,
    ratingHistory
  );
  const typical90Section =
    typical90Problems.length > 0
      ? buildCurriculumSection({
          key: 'typical90',
          title: '競プロ典型90問',
          description: 'DBの問題名に含まれる★難易度ごとに到達度を見るセット',
          problems: typical90Problems,
          groups: buildStarGroups(typical90Problems),
        })
      : null;
  const optionalSections = buildOptionalCurriculumSections({
    rowsByContest,
    curriculumRows,
    firstAcceptedByProblem,
    ratingHistory,
  });

  return [
    ...optionalSections.slice(0, 1),
    ...dpSections,
    typical90Section,
    ...optionalSections.slice(1),
  ].filter((section): section is CurriculumSectionProgress => section !== null);
}

function buildDpCurriculumSections(
  rowsByContest: Map<string, CurriculumRow[]>,
  firstAcceptedByProblem: Map<string, FirstAcceptedProblem>,
  ratingHistory: RatingHistoryRow[]
) {
  return DP_CURRICULUM_CONTESTS.map((contest) => {
    const problems = buildCurriculumProblemsFromRows(
      rowsByContest.get(contest.contestId) ?? [],
      firstAcceptedByProblem,
      ratingHistory
    );

    if (problems.length === 0) return null;

    return buildCurriculumSection({
      key: contest.key,
      title: contest.title,
      description: '',
      problems,
      groups: buildPrefixGroups(problems),
    });
  }).filter((section): section is CurriculumSectionProgress => section !== null);
}

function buildOptionalCurriculumSections({
  rowsByContest,
  curriculumRows,
  firstAcceptedByProblem,
  ratingHistory,
}: {
  rowsByContest: Map<string, CurriculumRow[]>;
  curriculumRows: CurriculumRow[];
  firstAcceptedByProblem: Map<string, FirstAcceptedProblem>;
  ratingHistory: RatingHistoryRow[];
}) {
  const absProblems = buildCurriculumProblemsFromRows(
    rowsByContest.get('abs') ?? [],
    firstAcceptedByProblem,
    ratingHistory
  );
  const tessokuProblems = buildCurriculumProblemsFromRows(
    rowsByContest.get('tessoku-book') ?? [],
    firstAcceptedByProblem,
    ratingHistory
  );
  const mathProblems = buildCurriculumProblemsFromRows(
    rowsByContest.get('math-and-algorithm') ?? [],
    firstAcceptedByProblem,
    ratingHistory
  );
  const joiProblems = buildCurriculumProblemsFromRows(
    curriculumRows.filter((row) => row.contestId.startsWith('joi')),
    firstAcceptedByProblem,
    ratingHistory
  );

  return [
    absProblems.length > 0
      ? buildCurriculumSection({
          key: 'abs',
          title: 'AtCoder Beginners Selection',
          description: 'AtCoder公式の初心者向け問題セット',
          problems: absProblems,
          groups: [
            {
              key: 'abs-all',
              label: `全${absProblems.length}問`,
              problems: absProblems,
            },
          ],
        })
      : null,
    mathProblems.length > 0
      ? buildCurriculumSection({
          key: 'math-and-algorithm',
          title: 'アルゴリズムと数学',
          description: '基礎数学と基本アルゴリズムを横断する問題セット',
          problems: mathProblems,
          groups: buildNumericRangeGroups(mathProblems, 20),
        })
      : null,
    tessokuProblems.length > 0
      ? buildCurriculumSection({
          key: 'tessoku-book',
          title: '競技プログラミングの鉄則',
          description: '章立てで基礎から総合問題まで進める演習問題集',
          problems: tessokuProblems,
          groups: buildPrefixGroups(tessokuProblems),
        })
      : null,
    joiProblems.length > 0
      ? buildCurriculumSection({
          key: 'joi',
          title: 'JOI過去問',
          description: '日本情報オリンピックの予選・本選・春季系の過去問',
          problems: joiProblems,
          groups: buildJoiGroups(joiProblems),
        })
      : null,
  ].filter((section): section is CurriculumSectionProgress => section !== null);
}

function buildCurriculumProblem({
  star,
  row,
  firstAcceptedByProblem,
  ratingHistory,
}: {
  star: number | null;
  row: CurriculumRow;
  firstAcceptedByProblem: Map<string, FirstAcceptedProblem>;
  ratingHistory: RatingHistoryRow[];
}): CurriculumProblemProgress {
  const accepted = firstAcceptedByProblem.get(row.problemId);
  const ratingAtAccepted = accepted
    ? resolveRatingAtEpoch(accepted.epochSecond, ratingHistory)
    : null;

  return {
    index: row.problemIndex,
    contestId: row.contestId,
    problemId: row.problemId,
    title: row.problem.name,
    difficulty: row.problem.difficulty,
    star,
    solved: Boolean(accepted),
    solvedAt: accepted ? formatEpochDate(accepted.epochSecond) : null,
    solvedBand: ratingAtAccepted === null ? null : getRatingBand(ratingAtAccepted),
    url: buildProblemUrl(row.contestId, row.problemId),
  };
}

function buildCurriculumProblemsFromRows(
  rows: CurriculumRow[],
  firstAcceptedByProblem: Map<string, FirstAcceptedProblem>,
  ratingHistory: RatingHistoryRow[]
) {
  return rows
    .toSorted(compareCurriculumRows)
    .map((row) =>
      buildCurriculumProblem({
        star: row.contestId === 'typical90' ? extractTypical90Star(row.problem.name) : null,
        row,
        firstAcceptedByProblem,
        ratingHistory,
      })
    );
}

function extractTypical90Star(title: string) {
  const matched = title.match(TYPICAL90_STAR_PATTERN);
  if (!matched) return null;

  const star = Number.parseInt(matched[1], 10);
  return Number.isFinite(star) ? star : null;
}

function buildCurriculumSection({
  key,
  title,
  description,
  problems,
  groups,
}: {
  key: string;
  title: string;
  description: string;
  problems: CurriculumProblemProgress[];
  groups: Array<{ key: string; label: string; problems: CurriculumProblemProgress[] }>;
}): CurriculumSectionProgress {
  const solved = problems.filter((problem) => problem.solved).length;

  return {
    key,
    title,
    description,
    total: problems.length,
    solved,
    percentage: toPercentage(solved, problems.length),
    groups: groups.map((group) => {
      const groupSolved = group.problems.filter((problem) => problem.solved).length;

      return {
        key: group.key,
        label: group.label,
        total: group.problems.length,
        solved: groupSolved,
        percentage: toPercentage(groupSolved, group.problems.length),
        problems: group.problems,
      };
    }),
    problems,
  };
}

function groupRowsByContest(rows: CurriculumRow[]) {
  return rows.reduce((grouped, row) => {
    const current = grouped.get(row.contestId) ?? [];
    return new Map(grouped).set(row.contestId, [...current, row]);
  }, new Map<string, CurriculumRow[]>());
}

function buildNumericRangeGroups(
  problems: CurriculumProblemProgress[],
  rangeSize: number
) {
  const maxIndex = Math.max(
    0,
    ...problems.map((problem) => Number.parseInt(problem.index, 10)).filter(Number.isFinite)
  );
  const groupCount = Math.ceil(maxIndex / rangeSize);

  return Array.from({ length: groupCount }, (_, groupIndex) => {
    const start = groupIndex * rangeSize + 1;
    const end = (groupIndex + 1) * rangeSize;

    return {
      key: `range-${start}-${end}`,
      label: `${String(start).padStart(3, '0')}-${String(end).padStart(3, '0')}`,
      problems: problems.filter((problem) => {
        const index = Number.parseInt(problem.index, 10);
        return Number.isFinite(index) && index >= start && index <= end;
      }),
    };
  }).filter((group) => group.problems.length > 0);
}

function buildPrefixGroups(problems: CurriculumProblemProgress[]) {
  const grouped = problems.reduce((groups, problem) => {
    const prefix = problem.index.match(/^[A-Z]+/)?.[0] ?? 'その他';
    const current = groups.get(prefix) ?? [];

    return new Map(groups).set(prefix, [...current, problem]);
  }, new Map<string, CurriculumProblemProgress[]>());

  return Array.from(grouped.entries()).map(([prefix, groupProblems]) => ({
    key: `prefix-${prefix}`,
    label: prefix === 'その他' ? prefix : `${prefix}問題`,
    problems: groupProblems,
  }));
}

function buildStarGroups(problems: CurriculumProblemProgress[]) {
  const stars = Array.from(
    new Set(
      problems
        .map((problem) => problem.star)
        .filter((star): star is number => star !== null)
    )
  ).toSorted((a, b) => a - b);

  return stars.map((star) => ({
    key: `star-${star}`,
    label: `★${star}`,
    problems: problems.filter((problem) => problem.star === star),
  }));
}

function buildJoiGroups(problems: CurriculumProblemProgress[]) {
  const labels = {
    yo: '予選・一次予選',
    ho: '本選',
    sc: '春季・春合宿',
    other: 'その他',
  };
  const grouped = problems.reduce((groups, problem) => {
    const groupKey = classifyJoiContest(problem.contestId ?? '');
    const current = groups.get(groupKey) ?? [];

    return new Map(groups).set(groupKey, [...current, problem]);
  }, new Map<keyof typeof labels, CurriculumProblemProgress[]>());

  return (Object.keys(labels) as Array<keyof typeof labels>)
    .map((key) => ({
      key: `joi-${key}`,
      label: labels[key],
      problems: grouped.get(key) ?? [],
    }))
    .filter((group) => group.problems.length > 0);
}
