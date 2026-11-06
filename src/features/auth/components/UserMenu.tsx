'use client';

import { Check, LogOut } from 'lucide-react';
import { signIn, signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { FaGithub } from 'react-icons/fa';
import { FcGoogle } from 'react-icons/fc';

import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const LOGIN_PROVIDERS = [
  { id: 'google', name: 'Google', Icon: FcGoogle },
  { id: 'github', name: 'GitHub', Icon: FaGithub },
] as const;

interface UserMenuProps {
  user: {
    name?: string | null;
    image?: string | null;
    atcoderId?: string | null;
  };
  linkedProviders: string[];
}

export default function UserMenu({ user, linkedProviders }: UserMenuProps) {
  const pathname = usePathname();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.image || undefined} alt={user.name || 'User'} />
            <AvatarFallback>{user.name?.substring(0, 2).toUpperCase() || 'U'}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-60" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.name || 'Unknown'}</p>
            {user.atcoderId && (
              <p className="text-xs leading-none text-muted-foreground mt-1">AtCoder: {user.atcoderId}</p>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
          ログイン方法
        </DropdownMenuLabel>
        {LOGIN_PROVIDERS.map(({ id, name, Icon }) =>
          linkedProviders.includes(id) ? (
            <div key={id} className="flex items-center px-2 py-1.5 text-sm">
              <Icon className="mr-2 h-4 w-4" />
              <span>{name}</span>
              <span className="ml-auto inline-flex items-center gap-1 text-xs text-muted-foreground">
                <Check className="h-3.5 w-3.5" />
                連携済み
              </span>
            </div>
          ) : (
            <DropdownMenuItem key={id} onSelect={() => signIn(id, { callbackUrl: pathname })}>
              <Icon className="mr-2 h-4 w-4" />
              <span>{name}</span>
              <span className="ml-auto text-xs text-blue-600">連携する</span>
            </DropdownMenuItem>
          )
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => signOut()}>
          <LogOut className="mr-2 h-4 w-4" /><span>ログアウト</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
