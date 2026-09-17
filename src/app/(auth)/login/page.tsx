import LoginPanel from '@/features/auth/components/LoginPanel';
import { normalizeLoginCallbackUrl } from '@/features/auth/functions/normalize-login-callback-url';
import type { LoginSearchParamsInput } from '@/features/auth/types';

interface LoginPageProps {
  searchParams: Promise<LoginSearchParamsInput>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const callbackUrl = normalizeLoginCallbackUrl(
    (await searchParams).callbackUrl
  );

  return <LoginPanel callbackUrl={callbackUrl} />;
}
