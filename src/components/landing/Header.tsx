import { Code2 } from 'lucide-react';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/options';
import AuthButtons from './AuthButtons';
import MobileMenu from './MobileMenu';

export default async function Header() {
  const session = await getServerSession(authOptions);

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
          <AuthButtons session={session} />
          <MobileMenu session={session} navigation={navigation} />
        </div>
      </div>
    </header>
  );
}
