import assert from 'node:assert/strict';
import test from 'node:test';

import { TIME_CURVE_BINS } from './time-curve-data';
import { lookupTimeCurve } from './time-curve';

test('lookupTimeCurve returns the bin values at a bin center', () => {
  const bin = TIME_CURVE_BINS[10];
  assert.ok(bin);
  const point = lookupTimeCurve(bin.center);
  assert.equal(point.m, bin.medianLogTime);
  assert.equal(point.s, bin.scale);
});

test('lookupTimeCurve holds the end values outside the range', () => {
  const first = TIME_CURVE_BINS[0];
  const last = TIME_CURVE_BINS[TIME_CURVE_BINS.length - 1];
  assert.ok(first && last);
  assert.deepEqual(lookupTimeCurve(first.center - 3), {
    m: first.medianLogTime,
    s: first.scale,
  });
  assert.deepEqual(lookupTimeCurve(last.center + 3), {
    m: last.medianLogTime,
    s: last.scale,
  });
});

test('lookupTimeCurve interpolates linearly between bin centers', () => {
  const a = TIME_CURVE_BINS[20];
  const b = TIME_CURVE_BINS[21];
  assert.ok(a && b);
  const point = lookupTimeCurve((a.center + b.center) / 2);
  assert.ok(Math.abs(point.m - (a.medianLogTime + b.medianLogTime) / 2) < 1e-12);
  assert.ok(Math.abs(point.s - (a.scale + b.scale) / 2) < 1e-12);
});
