'use client';

import { LogIn } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';

import { Button } from '@/components/ui/button';

export default function LoginLink() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const query = searchParams.toString();
  const returnTo = query ? `${pathname}?${query}` : pathname;
  const href = `/login?callbackUrl=${encodeURIComponent(returnTo)}`;

  return (
    <Button asChild size="sm" variant="outline">
      <Link href={href}>
        <LogIn className="h-4 w-4" />
        ログイン
      </Link>
    </Button>
  );
}
