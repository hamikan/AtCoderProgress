import LoginPanel from '@/features/auth/components/LoginPanel';
import { getLoginErrorMessage } from '@/features/auth/functions/get-login-error-message';
import { normalizeLoginCallbackUrl } from '@/features/auth/functions/normalize-login-callback-url';
import type { LoginSearchParamsInput } from '@/features/auth/types';

interface LoginPageProps {
  searchParams: Promise<LoginSearchParamsInput>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const callbackUrl = normalizeLoginCallbackUrl(
    params.callbackUrl,
    process.env.NEXTAUTH_URL
  );
  const errorMessage = getLoginErrorMessage(params.error);

  return <LoginPanel callbackUrl={callbackUrl} errorMessage={errorMessage} />;
}
