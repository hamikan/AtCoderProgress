import assert from 'node:assert/strict';
import test from 'node:test';

import {
  formatTokyoDate,
  getTokyoDateStartEpochSecond,
  getTokyoMonthStartEpochSecond,
  shiftTokyoDateParts,
} from './tokyo-date';

// テストを動かすマシンのタイムゾーンに左右されないよう、時刻はすべて UTC で書く

test('formatTokyoDate uses the Asia/Tokyo calendar day', () => {
  // UTC 2026-11-01 23:30 は、日本時間ではもう 2026-11-02 08:30
  assert.equal(
    formatTokyoDate(new Date(Date.UTC(2026, 10, 1, 23, 30))),
    '2026-11-02'
  );
  // UTC 2026-11-02 14:59 は、日本時間ではまだ 2026-11-02 23:59
  assert.equal(
    formatTokyoDate(new Date(Date.UTC(2026, 10, 2, 14, 59))),
    '2026-11-02'
  );
  // UTC 2026-11-02 15:00 は、日本時間で 2026-11-03 00:00
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
  const now = new Date(Date.UTC(2026, 10, 15, 12, 0)); // 日本時間でも 11/15
  assert.equal(
    getTokyoMonthStartEpochSecond(now),
    Math.floor(Date.UTC(2026, 9, 31, 15, 0) / 1000) // 日本時間 11/1 00:00
  );
  assert.equal(
    getTokyoMonthStartEpochSecond(now, -1),
    Math.floor(Date.UTC(2026, 8, 30, 15, 0) / 1000) // 日本時間 10/1 00:00
  );
  // UTC ではまだ10月だが、日本時間ではもう11月の時刻
  const boundary = new Date(Date.UTC(2026, 9, 31, 16, 0)); // 日本時間 11/1 01:00
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
