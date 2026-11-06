export function getLoginErrorMessage(error: unknown): string | null {
  if (typeof error !== 'string' || error.trim() === '') {
    return null;
  }

  if (error === 'AccessDenied') {
    return 'ログインが許可されなかったため、ログインできませんでした。';
  }

  if (error === 'OAuthAccountNotLinked') {
    return 'このメールアドレスは別のログイン方法で登録されています。いつもの方法でログインしてから、AtCoder ID設定の画面で連携してください。';
  }

  return 'ログインに失敗しました。もう一度お試しください。';
}
