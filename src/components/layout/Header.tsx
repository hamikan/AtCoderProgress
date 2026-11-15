import { Code2 } from 'lucide-react';
import Link from 'next/link';

import HeaderNav from './HeaderNav';

interface HeaderProps {
  account: React.ReactNode;
}

export default function Header({ account }: HeaderProps) {

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center space-x-8">
          <Link href="/dashboard" className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-slate-600 to-slate-800">
              <Code2 className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-800">AtCoder Progress</span>
          </Link>
          <HeaderNav />
        </div>
        <div className="flex items-center space-x-4">
          {account}
        </div>
      </div>
    </header>
  );
}
