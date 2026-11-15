export type ApplyAtCoderIdChangeResult =
  | { status: 'changed'; startedFetch: boolean }
  | { availableAt: Date; status: 'blocked' }
  | { status: 'unchanged' };
