import assert from 'node:assert/strict';
import test from 'node:test';

import {
  ATCODER_ID_VALIDATION_MESSAGE,
  ATCODER_ID_REQUIRED_MESSAGE,
  normalizeAtCoderId,
  validateAtCoderId,
} from './atcoder-id';

test('normalizeAtCoderId trims valid AtCoder IDs', () => {
  assert.equal(normalizeAtCoderId('  Mikankyan  '), 'Mikankyan');
});

test('validateAtCoderId accepts 3 to 16 alphanumeric characters and underscores', () => {
  assert.deepEqual(validateAtCoderId('abc'), { ok: true, value: 'abc' });
  assert.deepEqual(validateAtCoderId('A1b2C3d4E5f6G7h8'), {
    ok: true,
    value: 'A1b2C3d4E5f6G7h8',
  });
  assert.deepEqual(validateAtCoderId('Night_Glory'), {
    ok: true,
    value: 'Night_Glory',
  });
  assert.deepEqual(validateAtCoderId('Li__'), {
    ok: true,
    value: 'Li__',
  });
});

test('validateAtCoderId rejects blank values', () => {
  assert.deepEqual(validateAtCoderId('   '), {
    error: ATCODER_ID_REQUIRED_MESSAGE,
    ok: false,
  });
});

test('validateAtCoderId rejects invalid length and characters', () => {
  assert.deepEqual(validateAtCoderId('ab'), {
    error: ATCODER_ID_VALIDATION_MESSAGE,
    ok: false,
  });
  assert.deepEqual(validateAtCoderId('a'.repeat(17)), {
    error: ATCODER_ID_VALIDATION_MESSAGE,
    ok: false,
  });
  assert.deepEqual(validateAtCoderId('abc-def'), {
    error: ATCODER_ID_VALIDATION_MESSAGE,
    ok: false,
  });
  assert.deepEqual(validateAtCoderId('abc/def'), {
    error: ATCODER_ID_VALIDATION_MESSAGE,
    ok: false,
  });
});

test('normalizeAtCoderId throws the validation message for invalid IDs', () => {
  assert.throws(() => normalizeAtCoderId('abc-def'), {
    message: ATCODER_ID_VALIDATION_MESSAGE,
  });
});
