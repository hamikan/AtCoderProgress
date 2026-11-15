import assert from 'node:assert/strict';
import test from 'node:test';

import { stripOAuthTokens } from './strip-oauth-tokens';

test('stripOAuthTokens drops the provider tokens and keeps what identifies the login', () => {
  const account = {
    userId: 'user-1',
    type: 'oauth',
    provider: 'github',
    providerAccountId: '12345',
    access_token: 'gho_secret',
    refresh_token: 'refresh-secret',
    id_token: 'id-secret',
    token_type: 'bearer',
    scope: 'read:user,user:email',
  };

  assert.deepEqual(stripOAuthTokens(account), {
    userId: 'user-1',
    type: 'oauth',
    provider: 'github',
    providerAccountId: '12345',
    token_type: 'bearer',
    scope: 'read:user,user:email',
  });
  assert.equal(account.access_token, 'gho_secret');
});
