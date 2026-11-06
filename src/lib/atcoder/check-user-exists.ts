import 'server-only';

// unknown は「確かめられなかった」で、「いない」ではない。呼び出し側はいない扱いにしないこと
export type AtCoderUserExistence = 'exists' | 'not-found' | 'unknown';

type FetchLike = (
  url: string,
  init?: RequestInit
) => Promise<Pick<Response, 'status'>>;

const USER_PAGE_TIMEOUT_MS = 10_000;

// AtCoder へのアクセスは1回だけで、429 や 5xx でも再試行しない
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
