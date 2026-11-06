'use client';

import { usePathname, useSearchParams } from 'next/navigation';

import LoginMenuButton from './LoginMenuButton';

export default function LoginLink() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const query = searchParams.toString();
  const returnTo = query ? `${pathname}?${query}` : pathname;

  return <LoginMenuButton callbackUrl={returnTo} variant="outline" />;
}
