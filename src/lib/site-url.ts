type SiteUrlEnv = Readonly<Record<string, string | undefined>>;

export function getSiteUrl(env: SiteUrlEnv = process.env): URL | undefined {
  const candidates = [
    env.NEXTAUTH_URL,
    env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${env.VERCEL_PROJECT_PRODUCTION_URL}`
      : undefined,
  ];

  for (const candidate of candidates) {
    if (!candidate) continue;
    try {
      return new URL(candidate);
    } catch {
      continue;
    }
  }
  return undefined;
}
