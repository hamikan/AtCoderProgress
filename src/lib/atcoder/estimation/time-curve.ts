import { TIME_CURVE_BINS } from './time-curve-data';

export interface TimeCurvePoint {
  /** log(増分時間[分]) の中央値 m(x) */
  m: number;
  /** Laplace 分布のスケール s(x) */
  s: number;
}

/**
 * x = (D - A) / 400 に対する典型時間カーブの値を返す。
 * 区間の中心間は線形補間し、範囲外は端の値で一定にする。
 */
export function lookupTimeCurve(x: number): TimeCurvePoint {
  const bins = TIME_CURVE_BINS;
  const first = bins[0];
  const last = bins[bins.length - 1];
  if (!first || !last) {
    throw new Error('TIME_CURVE_BINS must not be empty');
  }
  if (x <= first.center) {
    return { m: first.medianLogTime, s: first.scale };
  }
  if (x >= last.center) {
    return { m: last.medianLogTime, s: last.scale };
  }
  let lo = 0;
  let hi = bins.length - 1;
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1;
    const bin = bins[mid];
    if (bin && bin.center <= x) {
      lo = mid;
    } else {
      hi = mid;
    }
  }
  const a = bins[lo];
  const b = bins[hi];
  if (!a || !b) {
    throw new Error('TIME_CURVE_BINS must not be empty');
  }
  const ratio = (x - a.center) / (b.center - a.center);
  return {
    m: a.medianLogTime + (b.medianLogTime - a.medianLogTime) * ratio,
    s: a.scale + (b.scale - a.scale) * ratio,
  };
}
