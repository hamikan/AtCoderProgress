export const ATCODER_ID_CHANGE_COOLDOWN_MS = 7 * 24 * 60 * 60 * 1000;

type AtCoderIdChangeDecision =
  | {
      status: 'allowed';
    }
  | {
      availableAt: Date;
      status: 'blocked';
    }
  | {
      status: 'unchanged';
    };

export function decideAtCoderIdChange(
  currentAtCoderId: string | null,
  changedAt: Date | null,
  nextAtCoderId: string,
  now: Date
): AtCoderIdChangeDecision {
  if (currentAtCoderId === nextAtCoderId) {
    return { status: 'unchanged' };
  }

  if (!currentAtCoderId || !changedAt) {
    return { status: 'allowed' };
  }

  const availableAt = new Date(
    changedAt.getTime() + ATCODER_ID_CHANGE_COOLDOWN_MS
  );

  if (now.getTime() >= availableAt.getTime()) {
    return { status: 'allowed' };
  }

  return {
    availableAt,
    status: 'blocked',
  };
}
