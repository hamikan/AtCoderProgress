export function getLoginErrorMessage(error: unknown): string | null {
  if (typeof error !== 'string' || error.trim() === '') {
    return null;
  }

  if (error === 'AccessDenied') {
    return 'GitHubでのログインが許可されなかったため、ログインできませんでした。';
  }

  return 'ログインに失敗しました。もう一度お試しください。';
}
