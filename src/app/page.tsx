
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import Header from '@/components/landing/Header';
import Hero from '@/components/landing/Hero';
import Features from '@/components/landing/Features';
import Footer from '@/components/landing/Footer';

export default async function TopPage() {
  const session = await getServerSession(authOptions);

  // 認証済みの場合、ダッシュボードにリダイレクト
  if (session) {
    // redirect('/dashboard');
  }

  // 未認証の場合、ランディングページを表示
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Header />
      <Hero />
      <Features />
      <Footer />
    </main>
  );
}
