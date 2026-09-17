export type ApplyAtCoderIdChangeResult =
  | { status: 'changed' }
  | { availableAt: Date; status: 'blocked' }
  | { status: 'unchanged' };
