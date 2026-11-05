import assert from 'node:assert/strict';
import test from 'node:test';

import { getNextRatingBand } from './get-next-rating-band';

test('getNextRatingBand returns the band above the current rating', () => {
  assert.deepEqual(getNextRatingBand(1523), {
    threshold: 1600,
    colorName: '青',
    pointsNeeded: 77,
  });
  assert.deepEqual(getNextRatingBand(0), {
    threshold: 400,
    colorName: '茶',
    pointsNeeded: 400,
  });
  assert.deepEqual(getNextRatingBand(1600), {
    threshold: 2000,
    colorName: '黄',
    pointsNeeded: 400,
  });
});

test('getNextRatingBand returns null in the top band', () => {
  assert.equal(getNextRatingBand(2800), null);
  assert.equal(getNextRatingBand(3200), null);
});
