'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, LogIn } from 'lucide-react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface MobileMenuProps {
  isAuthenticated: boolean;
  navigation: { name: string; href: string }[];
}

export default function MobileMenu({ isAuthenticated, navigation }: MobileMenuProps) {
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
          {isAuthenticated ? (
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
            <Button
              variant="ghost"
              className="justify-start p-0 text-slate-600"
              onClick={() => signIn('github', { callbackUrl: '/dashboard' })}
            >
              <LogIn className="mr-2 h-4 w-4" />
              GitHubでログイン
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
