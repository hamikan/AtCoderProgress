'use client';

import { LogIn } from 'lucide-react';
import { signIn } from 'next-auth/react';
import { FaGithub } from 'react-icons/fa';
import { FcGoogle } from 'react-icons/fc';

import { Button, type ButtonProps } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface LoginMenuButtonProps {
  callbackUrl: string;
  variant?: ButtonProps['variant'];
}

export default function LoginMenuButton({ callbackUrl, variant }: LoginMenuButtonProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="sm" variant={variant}>
          <LogIn className="h-4 w-4" />
          ログイン
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuItem onSelect={() => signIn('google', { callbackUrl })}>
          <FcGoogle className="mr-2 h-4 w-4" />
          <span>Googleでログイン</span>
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => signIn('github', { callbackUrl })}>
          <FaGithub className="mr-2 h-4 w-4" />
          <span>GitHubでログイン</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
