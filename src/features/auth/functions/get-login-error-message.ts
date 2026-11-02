/**
 * Maps the `error` query parameter NextAuth appends after a failed
 * sign-in (e.g. when the user cancels on GitHub) to a message for the
 * login page. Returns null when there is nothing to show.
 */
export function getLoginErrorMessage(error: unknown): string | null {
  if (typeof error !== 'string' || error.trim() === '') {
    return null;
  }

  if (error === 'AccessDenied') {
    return 'GitHubでのログインが許可されなかったため、ログインできませんでした。';
  }

  return 'ログインに失敗しました。もう一度お試しください。';
}
