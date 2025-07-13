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
import { Menu, Code2, LogIn } from 'lucide-react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const { data: session } = useSession();
  const router = useRouter();

  const navigation = [
    { name: '機能', href: '#features' },
    { name: '料金', href: '#pricing' },
    { name: 'ヘルプ', href: '#help' },
    { name: 'お問い合わせ', href: '#contact' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center space-x-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-slate-600 to-slate-800">
            <Code2 className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold text-slate-800">AtCoder Progress</span>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          {navigation.map((item) => (
            <a
              key={item.name}
              href={item.href}
              className="text-sm font-medium text-slate-600 transition-colors hover:text-slate-900"
            >
              {item.name}
            </a>
          ))}
        </nav>

        <div className="flex items-center space-x-4">
          {/* Existing Login Button (Desktop) */}
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

          {/* "始める" Button (Desktop) - Modified */}
          {session ? (
            <Button
              size="sm"
              className="bg-gradient-to-r from-slate-600 to-slate-800 hover:from-slate-700 hover:to-slate-900"
              onClick={() => router.push('/dashboard')}
            >
              始める
            </Button>
          ) : (
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
          )}

          {/* Mobile Menu */}
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
                {/* Mobile Login Button - Modified */}
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
        </div>
      </div>
    </header>
  );
}