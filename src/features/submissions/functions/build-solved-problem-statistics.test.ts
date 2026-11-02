import assert from 'node:assert/strict';
import test from 'node:test';

import { buildSolvedProblemStatistics } from './build-solved-problem-statistics';

function epoch(year: number, monthIndex: number, day: number): number {
  return Math.floor(new Date(year, monthIndex, day, 12).getTime() / 1000);
}

test('buildSolvedProblemStatistics calculates unique totals, monthly change, and streak', () => {
  const now = new Date(2026, 3, 15, 12);
  const result = buildSolvedProblemStatistics(
    [
      { epochSecond: epoch(2026, 0, 1), problemId: 'old' },
      { epochSecond: epoch(2026, 3, 14), problemId: 'old' },
      { epochSecond: epoch(2026, 3, 1), problemId: 'new' },
      { epochSecond: epoch(2026, 2, 10), problemId: 'last-month' },
      { epochSecond: epoch(2026, 3, 15), problemId: 'today' },
      { epochSecond: epoch(2026, 3, 13), problemId: 'two-days-ago' },
    ],
    now
  );

  assert.deepEqual(result, {
    acCount: 5,
    acCountChange: 3,
    currentStreak: 3,
    monthlySolved: 4,
    monthlySolvedChange: 3,
  });
});

test('buildSolvedProblemStatistics uses Tokyo month boundaries', () => {
  // Nov 2, 01:00 JST. The submission at Oct 31, 16:30 UTC is Nov 1,
  // 01:30 JST, so it belongs to November in Tokyo (a UTC server would
  // count it in October).
  const now = new Date(Date.UTC(2026, 10, 1, 16));
  const result = buildSolvedProblemStatistics(
    [
      {
        epochSecond: Math.floor(Date.UTC(2026, 9, 31, 16, 30) / 1000),
        problemId: 'november-in-tokyo',
      },
    ],
    now
  );

  assert.equal(result.monthlySolved, 1);
  assert.equal(result.acCountChange, 1);
  assert.equal(result.currentStreak, 1);
});

test('buildSolvedProblemStatistics returns an empty anonymous state', () => {
  assert.deepEqual(buildSolvedProblemStatistics([], new Date(2026, 3, 15, 12)), {
    acCount: 0,
    acCountChange: 0,
    currentStreak: 0,
    monthlySolved: 0,
    monthlySolvedChange: 0,
  });
});
