import assert from 'node:assert/strict';
import test from 'node:test';

import { isAuthorizedCronRequest } from './authorize';

test('isAuthorizedCronRequest accepts only the exact bearer secret', () => {
  assert.equal(isAuthorizedCronRequest('Bearer s3cret', 's3cret'), true);
  assert.equal(isAuthorizedCronRequest('Bearer wrong!', 's3cret'), false);
  assert.equal(isAuthorizedCronRequest('Bearer s3cret-longer', 's3cret'), false);
  assert.equal(isAuthorizedCronRequest('s3cret', 's3cret'), false);
  assert.equal(isAuthorizedCronRequest(null, 's3cret'), false);
});

test('isAuthorizedCronRequest refuses everything when the secret is not set', () => {
  assert.equal(isAuthorizedCronRequest('Bearer ', undefined), false);
  assert.equal(isAuthorizedCronRequest('Bearer ', ''), false);
  assert.equal(isAuthorizedCronRequest('Bearer undefined', undefined), false);
});
