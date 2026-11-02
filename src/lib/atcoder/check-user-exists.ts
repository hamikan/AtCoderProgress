import 'server-only';

/**
 * Whether an AtCoder user page exists. `unknown` covers every case
 * where existence could not be confirmed (network errors, timeouts,
 * and throttling or server errors from AtCoder): callers must not
 * treat `unknown` as "does not exist".
 */
export type AtCoderUserExistence = 'exists' | 'not-found' | 'unknown';

type FetchLike = (
  url: string,
  init?: RequestInit
) => Promise<Pick<Response, 'status'>>;

const USER_PAGE_TIMEOUT_MS = 10_000;

/**
 * Checks the public AtCoder profile page for the ID. Exactly one
 * request is made; on 429/5xx the result is `unknown` and no retry
 * happens (per the project's AtCoder access rule).
 */
export async function checkAtCoderUserExists(
  atcoderId: string,
  fetchImpl: FetchLike = fetch
): Promise<AtCoderUserExistence> {
  let status: number;
  try {
    const response = await fetchImpl(
      `https://atcoder.jp/users/${encodeURIComponent(atcoderId)}`,
      {
        cache: 'no-store',
        signal: AbortSignal.timeout(USER_PAGE_TIMEOUT_MS),
      }
    );
    status = response.status;
  } catch {
    return 'unknown';
  }

  if (status === 200) {
    return 'exists';
  }
  if (status === 404) {
    return 'not-found';
  }
  return 'unknown';
}
