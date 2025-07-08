
import Link from 'next/link';

export default function Header() {
  return (
    <header className="bg-white shadow-md">
      <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-gray-800">
          AtCoder Progress
        </Link>
        <div className="space-x-4">
          <Link href="/login" className="px-4 py-2 text-gray-800 hover:text-indigo-600">
            ログイン
          </Link>
          <Link href="/register" className="px-4 py-2 text-white bg-indigo-600 rounded-md hover:bg-indigo-700">
            新規登録
          </Link>
        </div>
      </nav>
    </header>
  );
}
