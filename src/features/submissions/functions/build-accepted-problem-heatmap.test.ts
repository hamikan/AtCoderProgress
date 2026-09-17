import assert from 'node:assert/strict';
import test from 'node:test';

import { format, subDays } from 'date-fns';

import {
  buildAcceptedProblemHeatmap,
  getAcceptedProblemHeatmapStartEpoch,
} from './build-accepted-problem-heatmap';

test('getAcceptedProblemHeatmapStartEpoch returns the inclusive range start', () => {
  const now = new Date(2026, 0, 10, 12);

  assert.equal(
    getAcceptedProblemHeatmapStartEpoch(now),
    Math.floor(subDays(now, 365).getTime() / 1000)
  );
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
