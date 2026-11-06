export function getLoginErrorMessage(error: unknown): string | null {
  if (typeof error !== 'string' || error.trim() === '') {
    return null;
  }

  if (error === 'AccessDenied') {
    return 'ログインが許可されなかったため、ログインできませんでした。';
  }

  if (error === 'OAuthAccountNotLinked') {
    return 'このアカウントは、別のログイン方法で作ったアカウントとつながっていません。いつもの方法でログインしてから、右上のメニューで連携してください。';
  }

  return 'ログインに失敗しました。もう一度お試しください。';
}
