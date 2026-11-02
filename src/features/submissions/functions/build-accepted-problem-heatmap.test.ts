import assert from 'node:assert/strict';
import test from 'node:test';

import { format, subDays } from 'date-fns';

import {
  buildAcceptedProblemHeatmap,
  getAcceptedProblemHeatmapStartEpoch,
} from './build-accepted-problem-heatmap';

test('getAcceptedProblemHeatmapStartEpoch returns Tokyo midnight 365 days before today in Tokyo', () => {
  // 2026-01-10 12:00 UTC is 2026-01-10 21:00 in Tokyo, so the range
  // starts at 2025-01-10 00:00 JST = 2025-01-09 15:00 UTC.
  const now = new Date(Date.UTC(2026, 0, 10, 12));

  assert.equal(
    getAcceptedProblemHeatmapStartEpoch(now),
    Math.floor(Date.UTC(2025, 0, 9, 15) / 1000)
  );
});

test('buildAcceptedProblemHeatmap buckets submissions by the Tokyo calendar day', () => {
  const now = new Date(Date.UTC(2026, 10, 2, 12)); // Nov 2, 21:00 JST
  const result = buildAcceptedProblemHeatmap(
    [
      // Nov 1, 23:30 UTC = Nov 2, 08:30 JST: counts on Nov 2 in Tokyo,
      // even though a UTC server would file it under Nov 1.
      {
        epochSecond: Math.floor(Date.UTC(2026, 10, 1, 23, 30) / 1000),
        problemId: 'morning',
      },
    ],
    now
  );

  assert.equal(result.find(({ date }) => date === '2026-11-02')?.count, 1);
  assert.equal(result.find(({ date }) => date === '2026-11-01')?.count, 0);
});

test('buildAcceptedProblemHeatmap counts unique accepted problems and assigns levels', () => {
  const now = new Date(2026, 0, 10, 12);
  const submission = (daysAgo: number, problemId: string) => ({
    epochSecond: Math.floor(subDays(now, daysAgo).getTime() / 1000),
    problemId,
  });
  const submissions = [
    submission(0, 'today'),
    submission(0, 'today'),
    submission(1, 'one'),
    submission(1, 'two'),
    ...['a', 'b', 'c', 'd'].map((problemId) => submission(2, problemId)),
    ...['a', 'b', 'c', 'd', 'e', 'f'].map((problemId) => submission(3, problemId)),
  ];

  const result = buildAcceptedProblemHeatmap(submissions, now);
  const day = (daysAgo: number) =>
    result.find(({ date }) => date === format(subDays(now, daysAgo), 'yyyy-MM-dd'));

  assert.equal(result.length, 366);
  assert.deepEqual(day(0), { date: format(now, 'yyyy-MM-dd'), count: 1, level: 1 });
  assert.equal(day(1)?.level, 2);
  assert.equal(day(2)?.level, 3);
  assert.equal(day(3)?.level, 4);
  assert.equal(day(4)?.level, 0);
});
