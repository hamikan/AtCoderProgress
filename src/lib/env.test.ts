import assert from 'node:assert/strict';
import test from 'node:test';

import {
  assertServerEnvironment,
  findMissingEnvironmentVariables,
  REQUIRED_ENVIRONMENT_VARIABLES,
} from './env';

const COMPLETE = Object.fromEntries(REQUIRED_ENVIRONMENT_VARIABLES.map((name) => [name, 'value']));

test('findMissingEnvironmentVariables treats unset and blank values as missing', () => {
  assert.deepEqual(
    findMissingEnvironmentVariables(['A', 'B', 'C', 'D'], { A: 'x', B: '', C: '   ' }),
    ['B', 'C', 'D']
  );
});

test('assertServerEnvironment passes when every required variable is set', () => {
  assert.doesNotThrow(() => assertServerEnvironment(COMPLETE));
});

test('assertServerEnvironment names every missing required variable at once', () => {
  assert.throws(
    () => assertServerEnvironment({ ...COMPLETE, DATABASE_URL: undefined, GOOGLE_SECRET: '' }),
    { message: 'Missing required environment variables: DATABASE_URL, GOOGLE_SECRET' }
  );
});

test('assertServerEnvironment does not fail on variables that only some features need', () => {
  assert.doesNotThrow(() => assertServerEnvironment({ ...COMPLETE, NODE_ENV: 'production' }));
});
