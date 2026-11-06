import { getCurrentUser } from '@/features/auth/api/get-current-user';
import LinkAtCoderForm from '@/features/auth/components/LinkAtCoderForm';
import LoginPrompt from '@/features/auth/components/LoginPrompt';

export default async function LinkAtCoderPage() {
  const user = await getCurrentUser();

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="mx-auto max-w-md space-y-4">
        {!user && (
          <LoginPrompt
            returnTo="/link-atcoder"
            description="AtCoder IDを保存するにはログインが必要です。"
          />
        )}
        <LinkAtCoderForm canSubmit={Boolean(user)} />
      </div>
    </div>
  );
}
