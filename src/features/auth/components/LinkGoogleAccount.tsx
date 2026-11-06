'use client';

import { signIn } from 'next-auth/react';
import { FcGoogle } from 'react-icons/fc';

interface LinkGoogleAccountProps {
  isLinked: boolean;
}

export default function LinkGoogleAccount({ isLinked }: LinkGoogleAccountProps) {
  return (
    <div className="flex items-center justify-center">
      <div className="w-full space-y-4 rounded-lg bg-white p-8 shadow-md">
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-900">Googleアカウント連携</h2>
          <p className="mt-2 text-gray-600">
            連携すると、Googleでもこのアカウントにログインできます。
          </p>
        </div>
        {isLinked ? (
          <p className="rounded-md bg-green-50 px-4 py-3 text-center text-sm text-green-700">
            Googleアカウントは連携済みです
          </p>
        ) : (
          <button
            type="button"
            onClick={() => signIn('google', { callbackUrl: '/link-atcoder' })}
            className="inline-flex w-full items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-3 font-semibold text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
          >
            <FcGoogle className="mr-3 h-6 w-6" />
            Googleアカウントを連携
          </button>
        )}
      </div>
    </div>
  );
}
