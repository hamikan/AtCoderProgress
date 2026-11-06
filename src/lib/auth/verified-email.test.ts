import assert from 'node:assert/strict';
import test from 'node:test';

import { pickVerifiedGitHubEmail } from './verified-email';

test('pickVerifiedGitHubEmail prefers the verified primary email', () => {
  assert.equal(
    pickVerifiedGitHubEmail([
      { email: 'other@example.com', primary: false, verified: true },
      { email: 'main@example.com', primary: true, verified: true },
    ]),
    'main@example.com'
  );
});

test('pickVerifiedGitHubEmail never returns an unverified email', () => {
  assert.equal(
    pickVerifiedGitHubEmail([
      { email: 'main@example.com', primary: true, verified: false },
      { email: 'backup@example.com', primary: false, verified: true },
    ]),
    'backup@example.com'
  );
  assert.equal(
    pickVerifiedGitHubEmail([{ email: 'main@example.com', primary: true, verified: false }]),
    null
  );
  assert.equal(pickVerifiedGitHubEmail([]), null);
});
