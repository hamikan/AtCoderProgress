import { Code2, Github, Twitter, Mail } from 'lucide-react';

export default function Footer() {
  const navigation = {
    main: [
      { name: 'ホーム', href: '#' },
      { name: '機能', href: '#features' },
      { name: '料金', href: '#pricing' },
      { name: 'ヘルプ', href: '#help' },
    ],
    support: [
      { name: 'お問い合わせ', href: '#contact' },
      { name: 'ヘルプセンター', href: '#help' },
      { name: 'ガイド', href: '#guide' },
      { name: 'ステータス', href: '#status' },
    ],
    legal: [
      { name: '利用規約', href: '#terms' },
      { name: 'プライバシーポリシー', href: '#privacy' },
      { name: '特定商取引法', href: '#commerce' },
      { name: 'クッキーポリシー', href: '#cookies' },
    ],
    social: [
      {
        name: 'Twitter',
        href: '#',
        icon: Twitter,
      },
      {
        name: 'GitHub',
        href: '#',
        icon: Github,
      },
      {
        name: 'Email',
        href: 'mailto:support@competitivegrow.com',
        icon: Mail,
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
              <span className="text-xl font-bold text-white">CompetitiveGrow</span>
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
          <div className="mt-12 grid grid-cols-2 gap-8 xl:col-span-2 xl:mt-0">
            <div className="md:grid md:grid-cols-2 md:gap-8">
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
              <div className="mt-10 md:mt-0">
                <h3 className="text-sm font-semibold leading-6 text-white">サポート</h3>
                <ul role="list" className="mt-6 space-y-4">
                  {navigation.support.map((item) => (
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
            <div className="md:grid md:grid-cols-1 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold leading-6 text-white">法的情報</h3>
                <ul role="list" className="mt-6 space-y-4">
                  {navigation.legal.map((item) => (
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
        </div>

        {/* Bottom Section */}
        <div className="mt-12 border-t border-slate-700 pt-8">
          <div className="flex flex-col items-center justify-between lg:flex-row">
            <p className="text-sm text-slate-400">
              &copy; 2025 CompetitiveGrow. All rights reserved.
            </p>
            <div className="mt-4 flex space-x-6 lg:mt-0">
              <a href="#" className="text-sm text-slate-400 hover:text-slate-300 transition-colors">
                AtCoder 非公式
              </a>
              <span className="text-slate-400">|</span>
              <a href="#" className="text-sm text-slate-400 hover:text-slate-300 transition-colors">
                Made with ❤️ for CP community
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}