'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Menu, LogIn } from 'lucide-react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface MobileMenuProps {
  session: any;
  navigation: { name: string; href: string }[];
}

export default function MobileMenu({ session, navigation }: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild className="md:hidden">
        <Button variant="ghost" size="sm">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent>
        <div className="flex flex-col space-y-4 mt-8">
          {navigation.map((item) => (
            <a
              key={item.name}
              href={item.href}
              className="text-sm font-medium text-slate-600 hover:text-slate-900"
              onClick={() => setIsOpen(false)}
            >
              {item.name}
            </a>
          ))}
          {session ? (
            <Button
              variant="ghost"
              className="justify-start p-0 text-slate-600"
              onClick={() => {
                router.push('/dashboard');
                setIsOpen(false);
              }}
            >
              始める
            </Button>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="justify-start p-0 text-slate-600">
                  <LogIn className="h-4 w-4 mr-2" />
                  ログイン
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
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
