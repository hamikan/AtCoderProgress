'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

import AtCoderIdForm from '@/features/auth/components/AtCoderIdForm';

interface LinkAtCoderFormProps {
  canSubmit: boolean;
}

export default function LinkAtCoderForm({ canSubmit }: LinkAtCoderFormProps) {
  const router = useRouter();
  const { update } = useSession();

  return (
    <div className="flex items-center justify-center">
      <div className="w-full space-y-6 rounded-lg bg-white p-8 shadow-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">メインAtCoder IDを設定</h1>
          <p className="mt-2 text-gray-600">あなたの分析に使うAtCoder IDを入力してください。</p>
        </div>
        <AtCoderIdForm
          canSubmit={canSubmit}
          submitLabel="設定して始める"
          onLinked={async () => {
            await update();
            router.push('/dashboard');
          }}
        />
      </div>
    </div>
  );
}
