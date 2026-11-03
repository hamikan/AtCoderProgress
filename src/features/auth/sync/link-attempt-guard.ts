import 'server-only';

/**
 * In-process exclusion for AtCoder ID link attempts (issue #118).
 * A link attempt fetches the user's whole submission history, which
 * takes minutes for active users; without a guard, a double click or
 * a retry runs several of those full fetches at once. The guard is
 * per process, which matches the single-server deployment.
 */
const linkAttemptsInFlight = new Set<string>();

/** Starts a link attempt for the user; false if one is already running. */
export function tryBeginLinkAttempt(userId: string): boolean {
  if (linkAttemptsInFlight.has(userId)) {
    return false;
  }
  linkAttemptsInFlight.add(userId);
  return true;
}

export function endLinkAttempt(userId: string): void {
  linkAttemptsInFlight.delete(userId);
}
