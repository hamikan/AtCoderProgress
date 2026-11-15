import assert from 'node:assert/strict';
import test from 'node:test';

import { formatLogLine } from './logger';

test('formatLogLine prefixes the scope and keeps the context on one line', () => {
  assert.equal(formatLogLine('problem-sync', 'finished'), '[problem-sync] finished');
  assert.equal(formatLogLine('problem-sync', 'finished', {}), '[problem-sync] finished');
  assert.equal(
    formatLogLine('atcoder-refresh', 'finished', { atcoderAccountId: 'tourist', storedCount: 3 }),
    '[atcoder-refresh] finished {"atcoderAccountId":"tourist","storedCount":3}'
  );
});

test('formatLogLine serializes errors with their name, message and code', () => {
  const error = Object.assign(new Error('first line\nsecond line'), { code: 'P2034' });
  const line = formatLogLine('solution-save', 'failed', { userId: 'u1', error });
  const context = JSON.parse(line.slice(line.indexOf('{')));

  assert.equal(line.includes('\n'), false);
  assert.equal(context.userId, 'u1');
  assert.equal(context.error.name, 'Error');
  assert.equal(context.error.message, 'first line\nsecond line');
  assert.equal(context.error.code, 'P2034');
  assert.equal(typeof context.error.stack, 'string');
});

test('formatLogLine truncates very long error messages and handles bigint', () => {
  const line = formatLogLine('solution-save', 'failed', {
    error: new Error('x'.repeat(5000)),
    durationSecond: BigInt(6000),
  });
  const context = JSON.parse(line.slice(line.indexOf('{')));

  assert.equal(context.error.message.length, 2000);
  assert.equal(context.durationSecond, '6000');
});
