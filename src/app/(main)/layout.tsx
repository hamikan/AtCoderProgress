import Header from "@/components/layout/Header";
import LoginLink from '@/components/layout/LoginLink';
import { getCurrentUser } from '@/features/auth/api/get-current-user';
import UserMenu from '@/features/auth/components/UserMenu';

export default async function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getCurrentUser();

  return (
    <div className="flex flex-col h-svh overflow-hidden">
      <Header account={user ? <UserMenu user={user} /> : <LoginLink />} />
      <main className="min-h-0 flex-1 overflow-clip contain-layout">
        {children}
      </main>
    </div>
  );
}
