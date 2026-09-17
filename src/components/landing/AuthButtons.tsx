'use client';

import { Button } from '@/components/ui/button';
import { LogIn } from 'lucide-react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface AuthButtonsProps {
  isAuthenticated: boolean;
}

export default function AuthButtons({ isAuthenticated }: AuthButtonsProps) {
  const router = useRouter();

  if (isAuthenticated) {
    return (
      <Button
        size="sm"
        className="bg-gradient-to-r from-slate-600 to-slate-800 hover:from-slate-700 hover:to-slate-900"
        onClick={() => router.push('/dashboard')}
      >
        始める
      </Button>
    );
  }

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        className="hidden items-center space-x-2 text-slate-600 hover:text-slate-900 md:flex"
        onClick={() => signIn('github', { callbackUrl: '/dashboard' })}
      >
        <LogIn className="h-4 w-4" />
        <span>ログイン</span>
      </Button>

      <Button
        size="sm"
        className="bg-gradient-to-r from-slate-600 to-slate-800 hover:from-slate-700 hover:to-slate-900"
        onClick={() => signIn('github', { callbackUrl: '/dashboard' })}
      >
        始める
      </Button>
    </>
  );
}
