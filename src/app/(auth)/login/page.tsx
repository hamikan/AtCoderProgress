
'use client';

import { signIn } from 'next-auth/react';
import { FaGithub } from 'react-icons/fa';

export default function LoginPage() {
  const handleSignIn = () => {
    signIn('github', { callbackUrl: '/link-atcoder' });
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-sm p-8 space-y-6 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">ログイン</h1>
          <p className="mt-2 text-gray-600">さあ、始めましょう</p>
        </div>
        <button
          onClick={handleSignIn}
          className="w-full inline-flex items-center justify-center px-4 py-3 font-semibold text-white bg-gray-800 rounded-md hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-800"
        >
          <FaGithub className="w-6 h-6 mr-3" />
          GitHubでログイン
        </button>
      </div>
    </div>
  );
}

