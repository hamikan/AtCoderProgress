import 'server-only';

type AuthEnvironmentVariable =
  | 'GITHUB_ID'
  | 'GITHUB_SECRET'
  | 'NEXTAUTH_SECRET';

type AuthEnvironment = Readonly<
  Partial<Record<AuthEnvironmentVariable, string | undefined>>
>;

export function getRequiredAuthEnvironmentVariable(
  name: AuthEnvironmentVariable,
  environment: AuthEnvironment = process.env
): string {
  const value = environment[name];

  if (!value || value.trim().length === 0) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}
