'use client';

import { LogIn } from 'lucide-react';
import { signIn } from 'next-auth/react';
import { usePathname, useSearchParams } from 'next/navigation';

import { Button } from '@/components/ui/button';

export default function LoginLink() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const query = searchParams.toString();
  const returnTo = query ? `${pathname}?${query}` : pathname;

  return (
    <Button
      size="sm"
      variant="outline"
      onClick={() => signIn('github', { callbackUrl: returnTo })}
    >
      <LogIn className="h-4 w-4" />
      ログイン
    </Button>
  );
}
