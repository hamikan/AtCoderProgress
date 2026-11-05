const DEFAULT_LOGIN_CALLBACK_URL = '/dashboard';
const PLACEHOLDER_ORIGIN = 'https://atcoder-progress.local';

export function normalizeLoginCallbackUrl(
  value: unknown,
  appOrigin?: string
): string {
  if (typeof value !== 'string') {
    return DEFAULT_LOGIN_CALLBACK_URL;
  }

  const callbackUrl = value.trim();
  if (callbackUrl === '') {
    return DEFAULT_LOGIN_CALLBACK_URL;
  }

  if (callbackUrl.startsWith('/') && !callbackUrl.startsWith('//')) {
    try {
      const parsed = new URL(callbackUrl, PLACEHOLDER_ORIGIN);
      if (parsed.origin !== PLACEHOLDER_ORIGIN) {
        return DEFAULT_LOGIN_CALLBACK_URL;
      }
    } catch {
      return DEFAULT_LOGIN_CALLBACK_URL;
    }

    return callbackUrl;
  }

  // ログインに失敗すると next-auth は戻り先を絶対 URL で渡してくるため、このアプリの URL ならパスだけを使う
  const allowedOrigin = parseOrigin(appOrigin);
  if (allowedOrigin) {
    try {
      const parsed = new URL(callbackUrl);
      if (parsed.origin === allowedOrigin) {
        // `//evil.com` のようなパスが外部の URL として扱われないよう、同じチェックに通す
        return normalizeLoginCallbackUrl(
          `${parsed.pathname}${parsed.search}${parsed.hash}`
        );
      }
    } catch {
      return DEFAULT_LOGIN_CALLBACK_URL;
    }
  }

  return DEFAULT_LOGIN_CALLBACK_URL;
}

function parseOrigin(value: string | undefined): string | null {
  if (!value) {
    return null;
  }
  try {
    return new URL(value).origin;
  } catch {
    return null;
  }
}
