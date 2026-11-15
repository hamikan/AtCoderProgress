import { createLogger } from '@/lib/logger';

type Environment = Readonly<Record<string, string | undefined>>;

export const REQUIRED_ENVIRONMENT_VARIABLES = [
  'DATABASE_URL',
  'NEXTAUTH_SECRET',
  'GITHUB_ID',
  'GITHUB_SECRET',
  'GOOGLE_ID',
  'GOOGLE_SECRET',
] as const;

// なくても起動はできるが、本番では画像のアップロードや定期実行が動かなくなる
export const PRODUCTION_ENVIRONMENT_VARIABLES = ['UPLOADTHING_TOKEN', 'CRON_SECRET'] as const;

export function findMissingEnvironmentVariables(
  names: readonly string[],
  environment: Environment
): string[] {
  return names.filter((name) => !environment[name] || environment[name]?.trim() === '');
}

// 足りない変数は、最初のリクエストで分かりにくいエラーになる（DATABASE_URL がないと localhost につなぎに行く）。起動のときにまとめて知らせる
export function assertServerEnvironment(environment: Environment = process.env): void {
  const logger = createLogger('env');
  if (environment.NODE_ENV === 'production') {
    const missingInProduction = findMissingEnvironmentVariables(
      PRODUCTION_ENVIRONMENT_VARIABLES,
      environment
    );
    if (missingInProduction.length > 0) {
      logger.warn('some features will not work without these variables', {
        missing: missingInProduction,
      });
    }
  }

  const missing = findMissingEnvironmentVariables(REQUIRED_ENVIRONMENT_VARIABLES, environment);
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}
