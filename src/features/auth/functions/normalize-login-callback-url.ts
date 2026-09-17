const DEFAULT_LOGIN_CALLBACK_URL = '/dashboard';

export function normalizeLoginCallbackUrl(value: unknown): string {
  if (typeof value !== 'string') {
    return DEFAULT_LOGIN_CALLBACK_URL;
  }

  const callbackUrl = value.trim();
  if (!callbackUrl.startsWith('/') || callbackUrl.startsWith('//')) {
    return DEFAULT_LOGIN_CALLBACK_URL;
  }

  try {
    const parsed = new URL(callbackUrl, 'https://atcoder-progress.local');
    if (parsed.origin !== 'https://atcoder-progress.local') {
      return DEFAULT_LOGIN_CALLBACK_URL;
    }
  } catch {
    return DEFAULT_LOGIN_CALLBACK_URL;
  }

  return callbackUrl;
}
