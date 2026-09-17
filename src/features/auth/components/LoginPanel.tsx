'use client';

import { signIn } from 'next-auth/react';
import { FaGithub } from 'react-icons/fa';

interface LoginPanelProps {
  callbackUrl: string;
}

export default function LoginPanel({ callbackUrl }: LoginPanelProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-sm space-y-6 rounded-lg bg-white p-8 shadow-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">ログイン</h1>
          <p className="mt-2 text-gray-600">さあ、始めましょう</p>
        </div>
        <button
          type="button"
          onClick={() => signIn('github', { callbackUrl })}
          className="inline-flex w-full items-center justify-center rounded-md bg-gray-800 px-4 py-3 font-semibold text-white hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-800 focus:ring-offset-2"
        >
          <FaGithub className="mr-3 h-6 w-6" />
          GitHubでログイン
        </button>
      </div>
    </div>
  );
}
