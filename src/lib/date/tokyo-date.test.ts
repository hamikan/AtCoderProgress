import assert from 'node:assert/strict';
import test from 'node:test';

import {
  formatTokyoDate,
  getTokyoDateStartEpochSecond,
  getTokyoMonthStartEpochSecond,
  shiftTokyoDateParts,
} from './tokyo-date';

// All instants below are written in UTC so the expectations hold no
// matter which timezone the machine running the tests is in.

test('formatTokyoDate uses the Asia/Tokyo calendar day', () => {
  // 2026-11-01 23:30 UTC is already 2026-11-02 08:30 in Tokyo.
  assert.equal(
    formatTokyoDate(new Date(Date.UTC(2026, 10, 1, 23, 30))),
    '2026-11-02'
  );
  // 2026-11-02 14:59 UTC is still 2026-11-02 23:59 in Tokyo.
  assert.equal(
    formatTokyoDate(new Date(Date.UTC(2026, 10, 2, 14, 59))),
    '2026-11-02'
  );
  // 2026-11-02 15:00 UTC is 2026-11-03 00:00 in Tokyo.
  assert.equal(
    formatTokyoDate(new Date(Date.UTC(2026, 10, 2, 15, 0))),
    '2026-11-03'
  );
});

test('getTokyoDateStartEpochSecond returns Tokyo midnight', () => {
  assert.equal(
    getTokyoDateStartEpochSecond({ year: 2026, month: 11, day: 2 }),
    Math.floor(Date.UTC(2026, 10, 1, 15, 0) / 1000)
  );
});

test('getTokyoMonthStartEpochSecond returns the Tokyo month boundary', () => {
  const now = new Date(Date.UTC(2026, 10, 15, 12, 0)); // Nov 15 in Tokyo too
  assert.equal(
    getTokyoMonthStartEpochSecond(now),
    Math.floor(Date.UTC(2026, 9, 31, 15, 0) / 1000) // Nov 1 00:00 JST
  );
  assert.equal(
    getTokyoMonthStartEpochSecond(now, -1),
    Math.floor(Date.UTC(2026, 8, 30, 15, 0) / 1000) // Oct 1 00:00 JST
  );
  // An instant that is still October in UTC but already November in Tokyo.
  const boundary = new Date(Date.UTC(2026, 9, 31, 16, 0)); // Nov 1 01:00 JST
  assert.equal(
    getTokyoMonthStartEpochSecond(boundary),
    Math.floor(Date.UTC(2026, 9, 31, 15, 0) / 1000)
  );
});

test('shiftTokyoDateParts crosses month and year boundaries', () => {
  assert.deepEqual(
    shiftTokyoDateParts({ year: 2026, month: 1, day: 1 }, -1),
    { year: 2025, month: 12, day: 31 }
  );
  assert.deepEqual(
    shiftTokyoDateParts({ year: 2026, month: 11, day: 2 }, 365),
    { year: 2027, month: 11, day: 2 }
  );
});
