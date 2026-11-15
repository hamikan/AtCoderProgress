import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import test from 'node:test';

import { buildAnalyticsSummary } from './analytics-summary';
import {
  buildCurriculumSections,
  buildFirstAcceptedByProblem,
} from './curriculum';
import { buildRatingBandSummaries } from './rating-band-summaries';
import { buildRatingFitness } from './rating-fitness';
import type {
  CurriculumRow,
  RatingHistoryRow,
  SubmissionRow,
} from '@/features/ratings/types';

const START_EPOCH = 1_577_836_800;
const DAY_SECONDS = 24 * 60 * 60;
const WEEK_SECONDS = 7 * DAY_SECONDS;
const NON_AC_RESULTS = ['WA', 'TLE', 'RE', 'CE'];

interface AccountShape {
  seed: number;
  contestCount: number;
  problemCount: number;
  submissionCount: number;
}

function createRandom(seed: number) {
  let state = seed >>> 0;

  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let mixed = state;
    mixed = Math.imul(mixed ^ (mixed >>> 15), mixed | 1);
    mixed ^= mixed + Math.imul(mixed ^ (mixed >>> 7), mixed | 61);
    return ((mixed ^ (mixed >>> 14)) >>> 0) / 4_294_967_296;
  };
}

function curriculumRow(
  contestId: string,
  problemIndex: string,
  name: string,
  difficulty: number | null
): CurriculumRow {
  return {
    contestId,
    problemId: `${contestId}_${problemIndex.toLowerCase()}`,
    problemIndex,
    problem: { name, difficulty },
  };
}

function buildSyntheticAccount({
  seed,
  contestCount,
  problemCount,
  submissionCount,
}: AccountShape) {
  const random = createRandom(seed);
  const int = (min: number, max: number) =>
    min + Math.floor(random() * (max - min + 1));
  const difficulty = () => (random() < 0.12 ? null : int(-300, 3200));
  const letters = (count: number) =>
    Array.from({ length: count }, (_, index) => String.fromCharCode(65 + index));
  const numbers = (count: number, width: number) =>
    Array.from({ length: count }, (_, index) => String(index + 1).padStart(width, '0'));

  const ratingHistory: RatingHistoryRow[] = [];
  for (let index = 0; index < contestCount; index += 1) {
    const oldRating = ratingHistory.at(-1)?.newRating ?? 0;
    ratingHistory.push({
      oldRating,
      newRating: Math.max(0, oldRating + int(-40, 110)),
      performance: Math.max(0, oldRating + int(-300, 500)),
      contestName: `Contest ${index + 1}`,
      contestScreenName: `abc${100 + index}.contest.atcoder.jp`,
      endTime: new Date(
        (START_EPOCH + (index + 4) * WEEK_SECONDS + int(0, 3600)) * 1000
      ),
    });
  }

  const curriculumRows: CurriculumRow[] = [
    ...letters(11).map((index) => curriculumRow('abs', index, `ABS ${index}`, difficulty())),
    ...letters(26).map((index) => curriculumRow('dp', index, `EDPC ${index}`, difficulty())),
    ...letters(20).map((index) => curriculumRow('tdpc', index, `TDPC ${index}`, difficulty())),
    curriculumRow('tdpc', '0', 'TDPC extra', null),
    ...letters(8).map((index) => curriculumRow('ndpc', index, `NDPC ${index}`, difficulty())),
    ...numbers(90, 3).map((index, order) =>
      curriculumRow(
        'typical90',
        index,
        order % 13 === 0 ? `Typical ${index}` : `Typical ${index} ★${int(1, 7)}`,
        difficulty()
      )
    ),
    ...numbers(104, 3).map((index) =>
      curriculumRow('math-and-algorithm', index, `Math ${index}`, difficulty())
    ),
    ...['A', 'B', 'C'].flatMap((chapter) =>
      numbers(25, 2).map((index) =>
        curriculumRow('tessoku-book', `${chapter}${index}`, `Tessoku ${chapter}${index}`, difficulty())
      )
    ),
    ...['joi2022yo1a', 'joi2023ho', 'joisc2021', 'joi2020spring', 'joi2019final'].flatMap(
      (contestId) =>
        letters(6).map((index) =>
          curriculumRow(contestId, index, `${contestId} ${index}`, difficulty())
        )
    ),
  ];
  // DB は順不同で返すので、並べ替えの結果も入力順に依存しないことを含めて固定する
  const shuffledCurriculumRows = curriculumRows
    .map((row) => ({ row, order: random() }))
    .toSorted((a, b) => a.order - b.order)
    .map(({ row }) => row);

  const curriculumProblemCount = Math.min(
    curriculumRows.length,
    Math.floor(problemCount * 0.3)
  );
  const problems = Array.from({ length: problemCount }, (_, index) => {
    if (index < curriculumProblemCount) {
      const row = shuffledCurriculumRows[index];
      return {
        contestId: row.contestId,
        problem: { id: row.problemId, name: row.problem.name, difficulty: row.problem.difficulty },
      };
    }

    const contestId = `abc${100 + Math.floor(index / 7)}`;
    const id = `${contestId}_${String.fromCharCode(97 + (index % 7))}`;
    return { contestId, problem: { id, name: `Problem ${id}`, difficulty: difficulty() } };
  });

  const timelineSeconds = (contestCount + 7) * WEEK_SECONDS;
  const epochs = Array.from({ length: submissionCount }, (_, index) => {
    // レート確定の瞬間ちょうどの提出がどちらの帯に入るかも固定する
    if (index % 97 === 0 && ratingHistory.length > 0) {
      return Math.floor(ratingHistory[int(0, ratingHistory.length - 1)].endTime.getTime() / 1000);
    }
    return START_EPOCH + int(0, timelineSeconds);
  }).toSorted((a, b) => a - b);
  const submissions: SubmissionRow[] = epochs.map((epochSecond) => {
    const { contestId, problem } = problems[Math.floor(problemCount * random() ** 1.5)];
    return {
      problemId: problem.id,
      contestId,
      result: random() < 0.45 ? 'AC' : NON_AC_RESULTS[int(0, NON_AC_RESULTS.length - 1)],
      epochSecond,
      problem,
    };
  });

  return {
    ratingHistory,
    submissions,
    curriculumRows: shuffledCurriculumRows,
    now: new Date((START_EPOCH + timelineSeconds + 40 * DAY_SECONDS) * 1000),
  };
}

// get-account-journey-analytics.ts と同じ組み立て方にする
function buildAnalytics({
  ratingHistory,
  submissions,
  curriculumRows,
}: ReturnType<typeof buildSyntheticAccount>) {
  const firstAcceptedByProblem = buildFirstAcceptedByProblem(submissions);
  const bandSummaries = buildRatingBandSummaries(
    ratingHistory,
    submissions,
    firstAcceptedByProblem
  );

  return {
    summary: buildAnalyticsSummary(
      ratingHistory,
      submissions,
      bandSummaries,
      firstAcceptedByProblem
    ),
    ratingFitness: buildRatingFitness(ratingHistory),
    bandSummaries,
    curriculumSections: buildCurriculumSections(
      curriculumRows,
      firstAcceptedByProblem,
      ratingHistory
    ),
  };
}

function digest(value: unknown) {
  return createHash('sha256').update(JSON.stringify(value)).digest('hex');
}

// expected は最適化前の実装で記録した出力のハッシュ。出力を意図して変えたときだけ取り直す
const CASES: Array<{ name: string; shape: AccountShape; expected: string }> = [
  {
    name: 'a heavy account across several rating bands',
    shape: { seed: 20_260_101, contestCount: 60, problemCount: 600, submissionCount: 3000 },
    expected: 'c694d8d3e788e34fb3f966686a897fdb6107a192ebdba06b8903734cba75d8af',
  },
  {
    name: 'an account without rated contests',
    shape: { seed: 7, contestCount: 0, problemCount: 120, submissionCount: 400 },
    expected: 'da767f8274ec66d99e93ab345368b4128e816329e51ed10e374fecfd736dd2b3',
  },
  {
    name: 'a long rating history with few submissions',
    shape: { seed: 11, contestCount: 40, problemCount: 40, submissionCount: 60 },
    expected: '3ee60678a5b86aaef8d11f8060dae7c40c7559ee011b4f77b2bd545b6dec1814',
  },
];

for (const { name, shape, expected } of CASES) {
  test(`account journey analytics stay identical for ${name}`, (t) => {
    const account = buildSyntheticAccount(shape);
    // 最後のレート帯の日数は現在時刻までで数えるので、時計を止めないと結果が毎回変わる
    t.mock.timers.enable({ apis: ['Date'], now: account.now });

    assert.equal(digest(buildAnalytics(account)), expected);
  });
}

test('account journey builders give the same result when the first AC map is omitted', (t) => {
  const account = buildSyntheticAccount(CASES[0].shape);
  t.mock.timers.enable({ apis: ['Date'], now: account.now });

  const { ratingHistory, submissions } = account;
  const expected = buildAnalytics(account);
  const bandSummaries = buildRatingBandSummaries(ratingHistory, submissions);

  assert.deepEqual(bandSummaries, expected.bandSummaries);
  assert.deepEqual(
    buildAnalyticsSummary(ratingHistory, submissions, bandSummaries),
    expected.summary
  );
});
