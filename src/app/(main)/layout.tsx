import Header from "@/components/layout/Header";
import LoginLink from '@/components/layout/LoginLink';
import { getCurrentUser } from '@/features/auth/api/get-current-user';
import { getLinkedAtCoderFetchStatus } from '@/features/auth/api/get-linked-atcoder-fetch-status';
import { getLinkedProviders } from '@/features/auth/api/get-linked-providers';
import AtCoderIdSwitcher from '@/features/auth/components/AtCoderIdSwitcher';
import UserMenu from '@/features/auth/components/UserMenu';

export default async function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getCurrentUser();
  const [fetchStatus, linkedProviders] = await Promise.all([
    getLinkedAtCoderFetchStatus(user?.atcoderAccountId),
    user ? getLinkedProviders(user.id) : [],
  ]);

  return (
    <div className="flex flex-col h-svh overflow-hidden">
      <Header
        account={
          user ? (
            <>
              <AtCoderIdSwitcher
                currentAtCoderId={user.atcoderId}
                fetchStatus={fetchStatus}
              />
              <UserMenu user={user} linkedProviders={linkedProviders} />
            </>
          ) : (
            <LoginLink />
          )
        }
      />
      <main className="min-h-0 flex-1 overflow-clip contain-layout">
        {children}
      </main>
    </div>
  );
}
