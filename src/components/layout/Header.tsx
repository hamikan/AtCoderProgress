import { Button } from '@/components/ui/button';
import { Bell, Code2, Home } from 'lucide-react';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/options';
import UserMenu from './UserMenu';

export default async function DashboardHeader() {
  const session = await getServerSession(authOptions);
  const user = session?.user;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center space-x-8">
          <div className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-slate-600 to-slate-800">
              <Code2 className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-800">AtCoder Progress</span>
          </div>
          <nav className="hidden md:flex items-center space-x-6">
            <a href="/dashboard" className="flex items-center space-x-2 text-sm font-medium text-slate-900">
              <Home className="h-4 w-4" />
              <span>ダッシュボード</span>
            </a>
            <a href="/problems" className="text-sm font-medium text-slate-600 hover:text-slate-900">問題一覧</a>
            <a href="/solutions" className="text-sm font-medium text-slate-600 hover:text-slate-900">解法記録</a>
            <a href="/analytics" className="text-sm font-medium text-slate-600 hover:text-slate-900">分析</a>
          </nav>
        </div>
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" className="relative">
            <Bell className="h-4 w-4" />
            <span className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full"></span>
          </Button>
          {user && <UserMenu user={user} />}
        </div>
      </div>
    </header>
  );
}