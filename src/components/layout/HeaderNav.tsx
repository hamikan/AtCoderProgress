'use client';

import { Home, Menu } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

import { isActiveNavLink } from './is-active-nav-link';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'ダッシュボード', icon: Home },
  { href: '/problems/contest', label: '問題一覧', alsoActiveOn: ['/problems/list'] },
  { href: '/solutions', label: '解法記録' },
  { href: '/analytics', label: '分析' },
] as const;

type NavItem = (typeof NAV_ITEMS)[number];

function isActive(pathname: string, item: NavItem): boolean {
  return isActiveNavLink(pathname, item.href, 'alsoActiveOn' in item ? item.alsoActiveOn : []);
}

export default function HeaderNav() {
  const pathname = usePathname();

  return (
    <>
      <nav className="hidden items-center space-x-6 lg:flex">
        {NAV_ITEMS.map((item) => {
          const active = isActive(pathname, item);
          const Icon = 'icon' in item ? item.icon : null;

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'text-sm font-medium',
                Icon && 'flex items-center space-x-2',
                active ? 'text-slate-900' : 'text-slate-600 hover:text-slate-900',
              )}
            >
              {Icon && <Icon className="h-4 w-4" />}
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="lg:hidden">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="メニューを開く">
              <Menu className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48">
            {NAV_ITEMS.map((item) => {
              const active = isActive(pathname, item);

              return (
                <DropdownMenuItem key={item.href} asChild>
                  <Link
                    href={item.href}
                    aria-current={active ? 'page' : undefined}
                    className={cn(
                      'text-sm font-medium',
                      active ? 'text-slate-900' : 'text-slate-600 hover:text-slate-900',
                    )}
                  >
                    {item.label}
                  </Link>
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </>
  );
}
