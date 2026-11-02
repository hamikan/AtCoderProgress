const DEFAULT_LOGIN_CALLBACK_URL = '/dashboard';
const PLACEHOLDER_ORIGIN = 'https://atcoder-progress.local';

/**
 * Normalizes the post-login redirect target.
 *
 * Plain internal paths are kept as they are. NextAuth sometimes hands
 * back an absolute URL for the page the user originally wanted; when it
 * points at this app itself (its origin matches `appOrigin`, e.g.
 * NEXTAUTH_URL), only the path part is used so the user returns to the
 * original page. Anything else falls back to the dashboard, so an
 * external URL can never become the redirect target.
 */
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

  const allowedOrigin = parseOrigin(appOrigin);
  if (allowedOrigin) {
    try {
      const parsed = new URL(callbackUrl);
      if (parsed.origin === allowedOrigin) {
        return `${parsed.pathname}${parsed.search}${parsed.hash}`;
      }
    } catch {
      // Not an absolute URL; fall through to the default.
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
