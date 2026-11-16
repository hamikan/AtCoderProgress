import assert from 'node:assert/strict';
import test from 'node:test';

import { getContestCellStatus } from './contest-cell-status';

const START = 1_700_000_000;
const DURATION = 6_000;

test('getContestCellStatus tells AC during the contest from AC afterwards', () => {
  assert.equal(getContestCellStatus({ result: 'AC', epochSecond: START }, START, DURATION), 'ac-in-contest');
  assert.equal(
    getContestCellStatus({ result: 'AC', epochSecond: START + DURATION - 1 }, START, DURATION),
    'ac-in-contest'
  );
  assert.equal(
    getContestCellStatus({ result: 'AC', epochSecond: START + DURATION }, START, DURATION),
    'ac-after-contest'
  );
  assert.equal(
    getContestCellStatus({ result: 'AC', epochSecond: START - 1 }, START, DURATION),
    'ac-after-contest'
  );
});

test('getContestCellStatus marks submissions without AC and ignores missing ones', () => {
  assert.equal(getContestCellStatus({ result: 'WA', epochSecond: START }, START, DURATION), 'tried');
  assert.equal(getContestCellStatus(undefined, START, DURATION), null);
});
