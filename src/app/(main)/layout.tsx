import Header from "@/components/layout/Header";
import { getCurrentUser } from '@/features/auth/api/get-current-user';

export default async function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getCurrentUser();

  return (
    <div className="flex flex-col h-svh overflow-hidden">
      <Header user={user} />
      <main className="flex-1 overflow-hidden contain-layout">
        {children}
      </main>
    </div>
  );
}
