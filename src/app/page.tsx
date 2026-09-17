
import { getCurrentUser } from '@/features/auth/api/get-current-user';
import Header from '@/components/landing/Header';
import Hero from '@/components/landing/Hero';
import Features from '@/components/landing/Features';
import Footer from '@/components/landing/Footer';

export default async function TopPage() {
  const user = await getCurrentUser();

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Header isAuthenticated={Boolean(user)} />
      <Hero />
      <Features />
      <Footer />
    </main>
  );
}
