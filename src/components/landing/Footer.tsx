import { Code2, Github } from 'lucide-react';

export default function Footer() {
  const navigation = {
    main: [
      { name: 'ホーム', href: '/' },
      { name: '機能', href: '#features' },
    ],
    social: [
      {
        name: 'GitHub',
        href: 'https://github.com/hamikan/AtCoderProgress',
        icon: Github,
      },
    ],
  };

  return (
    <footer className="bg-slate-900">
      <div className="container mx-auto px-4 py-12 lg:py-16">
        <div className="xl:grid xl:grid-cols-3 xl:gap-8">
          {/* Brand Section */}
          <div className="space-y-8">
            <div className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-slate-400 to-slate-600">
                <Code2 className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">AtCoder Progress</span>
            </div>
            <p className="text-base text-slate-300 max-w-md">
              競技プログラミングの精進を記録・可視化し、最適な課題提示で成長をサポートするプラットフォームです。
            </p>
            <div className="flex space-x-6">
              {navigation.social.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="text-slate-400 hover:text-slate-300 transition-colors"
                >
                  <span className="sr-only">{item.name}</span>
                  <item.icon className="h-6 w-6" aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>

          {/* Navigation Links */}
          <div className="mt-12 xl:col-span-2 xl:mt-0">
            <div>
              <h3 className="text-sm font-semibold leading-6 text-white">サービス</h3>
              <ul role="list" className="mt-6 space-y-4">
                {navigation.main.map((item) => (
                  <li key={item.name}>
                    <a
                      href={item.href}
                      className="text-sm leading-6 text-slate-300 hover:text-white transition-colors"
                    >
                      {item.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-12 border-t border-slate-700 pt-8">
          <div className="flex flex-col items-center justify-between lg:flex-row">
            <p className="text-sm text-slate-400">
              &copy; 2025 AtCoder Progress. All rights reserved.
            </p>
            <div className="mt-4 flex space-x-6 lg:mt-0">
              <a href="#" className="text-sm text-slate-400 hover:text-slate-300 transition-colors">
                このサイトはAtCoder非公式です。
                ここで起きた問題についてはAtCoder運営は一切関与しません。
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}