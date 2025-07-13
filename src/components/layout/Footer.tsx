import Link from "next/link"
import { Code2, Github, Twitter, Mail } from "lucide-react"

export default function Footer() {
  const currentYear = new Date().getFullYear()

  const footerLinks = {
    product: [
      { href: "/features", label: "機能紹介" },
      { href: "/pricing", label: "料金プラン" },
      { href: "/roadmap", label: "ロードマップ" },
    ],
    support: [
      { href: "/help", label: "ヘルプ" },
      { href: "/contact", label: "お問い合わせ" },
      { href: "/faq", label: "よくある質問" },
    ],
    legal: [
      { href: "/privacy", label: "プライバシーポリシー" },
      { href: "/terms", label: "利用規約" },
      { href: "/security", label: "セキュリティ" },
    ],
  }

  const socialLinks = [
    { href: "https://github.com", icon: Github, label: "GitHub" },
    { href: "https://twitter.com", icon: Twitter, label: "Twitter" },
    { href: "mailto:contact@example.com", icon: Mail, label: "Email" },
  ]

  return (
    <footer className="border-t bg-slate-50/50">
      <div className="container px-4 py-12">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
          {/* ブランド情報 */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center space-x-2 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-white">
                <Code2 className="h-5 w-5" />
              </div>
              <span className="text-xl font-bold text-slate-900">AtCoder Progress</span>
            </Link>
            <p className="text-sm text-slate-600 mb-4 max-w-md">
              AtCoderでの精進を記録・可視化し、苦手分野を特定して最適な問題を推薦。
              あなたの競技プログラミングスキル向上を最短距離でサポートします。
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((social) => (
                <Link
                  key={social.label}
                  href={social.href}
                  className="text-slate-400 hover:text-slate-600 transition-colors"
                  aria-label={social.label}
                >
                  <social.icon className="h-5 w-5" />
                </Link>
              ))}
            </div>
          </div>

          {/* プロダクト */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-4">プロダクト</h3>
            <ul className="space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-slate-600 hover:text-slate-900 transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* サポート */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-4">サポート</h3>
            <ul className="space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-slate-600 hover:text-slate-900 transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* 法的情報 */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-4">法的情報</h3>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-slate-600 hover:text-slate-900 transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* 下部のコピーライト */}
        <div className="border-t border-slate-200 mt-12 pt-8">
          <div className="flex flex-col sm:flex-row justify-between items-center">
            <p className="text-sm text-slate-500">© {currentYear} AtCoder Progress. All rights reserved.</p>
            <p className="text-sm text-slate-500 mt-2 sm:mt-0">Made with ❤️ for competitive programmers</p>
          </div>
        </div>
      </div>
    </footer>
  )
}
