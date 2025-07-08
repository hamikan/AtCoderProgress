
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import Dashboard from '@/components/dashboard/Dashboard';
import Header from '@/components/landing/Header';
import Hero from '@/components/landing/Hero';
import Features from '@/components/landing/Features';
import Footer from '@/components/landing/Footer';

export default async function TopPage() {
  const session = await getServerSession(authOptions);

  // 認証状態に応じて表示するコンポーネントを切り替える
  if (session) {
    return (
      <>
        <Header />
        <main>
          <Dashboard />
        </main>
        <Footer />
      </>
    );
  } else {
    return (
      <div className="bg-white">
        <Header />
        <main>
          <Hero />
          <Features />
        </main>
        <Footer />
      </div>
    );
  }
}
