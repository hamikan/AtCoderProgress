import assert from 'node:assert/strict';
import test from 'node:test';

import { buildSubmissionSummary } from './build-submission-summary';

test('buildSubmissionSummary prefers AC and keeps the first accepted time', () => {
  assert.deepEqual(
    buildSubmissionSummary([
      { problemId: 'abc001_a', result: 'WA', epochSecond: 30 },
      { problemId: 'abc001_a', result: 'AC', epochSecond: 20 },
      { problemId: 'abc001_a', result: 'AC', epochSecond: 10 },
      { problemId: 'abc001_b', result: 'TLE', epochSecond: 40 },
    ]),
    {
      statusMap: {
        abc001_a: { result: 'AC', epochSecond: 10 },
        abc001_b: { result: 'TLE', epochSecond: 40 },
      },
      acCount: 1,
      tryingCount: 1,
    }
  );
});
