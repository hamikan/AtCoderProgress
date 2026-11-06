import assert from 'node:assert/strict';
import test from 'node:test';

import { getLoginErrorMessage } from './get-login-error-message';

test('getLoginErrorMessage returns null when there is no error', () => {
  assert.equal(getLoginErrorMessage(undefined), null);
  assert.equal(getLoginErrorMessage(''), null);
  assert.equal(getLoginErrorMessage(42), null);
});

test('getLoginErrorMessage explains a denied authorization', () => {
  assert.equal(
    getLoginErrorMessage('AccessDenied'),
    'GitHubでのログインが許可されなかったため、ログインできませんでした。'
  );
});

test('getLoginErrorMessage falls back to a generic message', () => {
  assert.equal(
    getLoginErrorMessage('OAuthCallback'),
    'ログインに失敗しました。もう一度お試しください。'
  );
  assert.equal(
    getLoginErrorMessage('SomethingUnexpected'),
    'ログインに失敗しました。もう一度お試しください。'
  );
});
