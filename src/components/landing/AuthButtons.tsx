'use client';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LogIn } from 'lucide-react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface AuthButtonsProps {
  session: any;
}

export default function AuthButtons({ session }: AuthButtonsProps) {
  const router = useRouter();

  if (session) {
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
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="hidden md:flex items-center space-x-2 text-slate-600 hover:text-slate-900"
          >
            <LogIn className="h-4 w-4" />
            <span>ログイン</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56">
          <DropdownMenuItem onClick={() => signIn('google')}>
            Googleでログイン
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => signIn('github', { callbackUrl: '/link-atcoder' })}>
            GitHubでログイン
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            size="sm"
            className="bg-gradient-to-r from-slate-600 to-slate-800 hover:from-slate-700 hover:to-slate-900"
          >
            始める
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56">
          <DropdownMenuItem onClick={() => signIn('google')}>
            Googleで始める
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => signIn('github', { callbackUrl: '/link-atcoder' })}>
            GitHubで始める
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
