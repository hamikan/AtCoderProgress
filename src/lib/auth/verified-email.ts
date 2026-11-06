export interface GitHubEmail {
  email: string;
  primary: boolean;
  verified: boolean;
}

export function pickVerifiedGitHubEmail(emails: readonly GitHubEmail[]): string | null {
  const verified = emails.filter((entry) => entry.verified);
  return (verified.find((entry) => entry.primary) ?? verified[0])?.email ?? null;
}
