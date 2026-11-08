import assert from 'node:assert/strict';
import test from 'node:test';

import {
  DELETE_ACCOUNT_CONFIRMATION,
  isDeleteAccountConfirmed,
} from './delete-account-confirmation';

test('accepts only the exact confirmation phrase', () => {
  assert.equal(isDeleteAccountConfirmed(DELETE_ACCOUNT_CONFIRMATION), true);
  assert.equal(isDeleteAccountConfirmed(`  ${DELETE_ACCOUNT_CONFIRMATION} `), true);
  assert.equal(isDeleteAccountConfirmed('退会'), false);
  assert.equal(isDeleteAccountConfirmed(''), false);
  assert.equal(isDeleteAccountConfirmed('退会するよ'), false);
});
