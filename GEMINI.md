【アプリ内容】
日々の精進を記録・可視化するだけでなく、苦手分野を自動で特定し、現在の実力に最適な**「次の課題」を提示する**ことで、ユーザーの成長を最短距離でサポートする。

【ユーザー機能】
1. 登録・ログイン・AtCoder ID連携

（変更なし）Google/GitHubログイン後、AtCoder IDを連携。
2. マイページ（ダッシュボード）

主要指標:
生涯AC数
現在のレート（APIで取得可能か調査し、実装。できなければDifficulty合計値などで代替）
学習のサマリー:
カレンダーヒートマップ（草）
アルゴリズムタグごとのAC数レーダーチャート（得意・不得意分野の可視化）
3. 精進記録・解法管理機能（最重要機能）

解法の記録:
問題ごとにコードや思考メモを記録。（公開、非公開は選択可能）
ステータス管理機能:
各問題に対して、ユーザーは以下のステータスを設定できる。
自力AC
解説AC
挑戦中
本番で解けなかった問題（コンテスト参加後に自動または手動で記録）
アルゴリズムタグ機能（NEW!）:
解法を記録する際に、その問題で使ったアルゴリズムを自分でタグ付けできる。（例：「DP」「二分探索」「Union-Find」）
4. 弱点克服・問題推薦システム（サイトの核となる新機能！）

苦手分野の自動分析:
システムは「解説AC」「本番で解けなかった問題」に付けられたアルゴリズムタグを集計し、ユーザーの**「苦手タグ」を特定**する。
パーソナライズド問題推薦:
マイページの「次に解くべき問題」セクションで、以下の条件に基づいて問題を推薦する。
苦手タグに合致する問題。
かつ、まだ未ACまたは「解説AC」の問題。
かつ、ユーザーの現在のレートを考慮し、「少し頑張れば解けそう」なDifficultyの問題を優先的に表示。
5. ソーシャル機能

お気に入り機能:
参考にしたいユーザーの進捗と比較できる。
解法の公開・共有:
記録した解法は任意で公開可能。他のユーザーは「いいね」やコメントができる。
有料記事販売:
（変更なし）オプションとして提供。

このアプリの現在のディレクトリ構造　(機能の追加とともにディレクトリ構造は変化する)
.
├── .next
│   ├── cache
│   │   ├── eslint
│   │   │   └── .cache_cttyop
│   │   ├── swc
│   │   │   └── plugins
│   │   │       └── v7_macos_aarch64_9.0.0
│   │   ├── webpack
│   │   │   ├── client-development
│   │   │   │   ├── 0.pack.gz
│   │   │   │   ├── 1.pack.gz
│   │   │   │   ├── 10.pack.gz
│   │   │   │   ├── 11.pack.gz
│   │   │   │   ├── 12.pack.gz
│   │   │   │   ├── 13.pack.gz
│   │   │   │   ├── 14.pack.gz
│   │   │   │   ├── 15.pack.gz
│   │   │   │   ├── 16.pack.gz
│   │   │   │   ├── 17.pack.gz
│   │   │   │   ├── 2.pack.gz
│   │   │   │   ├── 3.pack.gz
│   │   │   │   ├── 4.pack.gz
│   │   │   │   ├── 5.pack.gz
│   │   │   │   ├── 6.pack.gz
│   │   │   │   ├── 7.pack.gz
│   │   │   │   ├── 8.pack.gz
│   │   │   │   ├── 9.pack.gz
│   │   │   │   ├── index.pack.gz
│   │   │   │   └── index.pack.gz.old
│   │   │   ├── client-development-fallback
│   │   │   │   ├── 0.pack.gz
│   │   │   │   ├── 1.pack.gz
│   │   │   │   ├── index.pack.gz
│   │   │   │   └── index.pack.gz.old
│   │   │   ├── client-production
│   │   │   │   ├── 0.pack
│   │   │   │   ├── 1.pack
│   │   │   │   ├── 2.pack
│   │   │   │   ├── 3.pack
│   │   │   │   ├── index.pack
│   │   │   │   └── index.pack.old
│   │   │   ├── edge-server-production
│   │   │   │   ├── 0.pack
│   │   │   │   └── index.pack
│   │   │   ├── server-development
│   │   │   │   ├── 0.pack.gz
│   │   │   │   ├── 1.pack.gz
│   │   │   │   ├── 10.pack.gz
│   │   │   │   ├── 11.pack.gz
│   │   │   │   ├── 12.pack.gz
│   │   │   │   ├── 13.pack.gz
│   │   │   │   ├── 14.pack.gz
│   │   │   │   ├── 15.pack.gz
│   │   │   │   ├── 16.pack.gz
│   │   │   │   ├── 17.pack.gz
│   │   │   │   ├── 18.pack.gz
│   │   │   │   ├── 19.pack.gz
│   │   │   │   ├── 2.pack.gz
│   │   │   │   ├── 20.pack.gz
│   │   │   │   ├── 21.pack.gz
│   │   │   │   ├── 3.pack.gz
│   │   │   │   ├── 4.pack.gz
│   │   │   │   ├── 5.pack.gz
│   │   │   │   ├── 6.pack.gz
│   │   │   │   ├── 7.pack.gz
│   │   │   │   ├── 8.pack.gz
│   │   │   │   ├── 9.pack.gz
│   │   │   │   ├── index.pack.gz
│   │   │   │   └── index.pack.gz.old
│   │   │   └── server-production
│   │   │       ├── 0.pack
│   │   │       ├── 1.pack
│   │   │       ├── 2.pack
│   │   │       ├── 3.pack
│   │   │       ├── index.pack
│   │   │       └── index.pack.old
│   │   ├── .rscinfo
│   │   └── .tsbuildinfo
│   ├── server
│   │   ├── app
│   │   │   ├── _not-found
│   │   │   │   ├── page_client-reference-manifest.js
│   │   │   │   └── page.js
│   │   │   ├── (main)
│   │   │   │   ├── dashboard
│   │   │   │   │   ├── page_client-reference-manifest.js
│   │   │   │   │   └── page.js
│   │   │   │   ├── page_client-reference-manifest.js
│   │   │   │   └── page.js
│   │   │   └── api
│   │   │       ├── auth
│   │   │       │   └── [...nextauth]
│   │   │       │       ├── route_client-reference-manifest.js
│   │   │       │       └── route.js
│   │   │       └── users
│   │   │           └── [atcoderId]
│   │   │               └── submissions
│   │   │                   ├── route_client-reference-manifest.js
│   │   │                   └── route.js
│   │   ├── pages
│   │   │   ├── _app.js
│   │   │   ├── _document.js
│   │   │   └── _error.js
│   │   ├── vendor-chunks
│   │   │   ├── @babel.js
│   │   │   ├── @floating-ui.js
│   │   │   ├── @heroicons.js
│   │   │   ├── @next-auth.js
│   │   │   ├── @panva.js
│   │   │   ├── @swc.js
│   │   │   ├── classnames.js
│   │   │   ├── cookie.js
│   │   │   ├── jose.js
│   │   │   ├── lru-cache.js
│   │   │   ├── lucide-react.js
│   │   │   ├── next-auth.js
│   │   │   ├── next.js
│   │   │   ├── oauth.js
│   │   │   ├── object-hash.js
│   │   │   ├── oidc-token-hash.js
│   │   │   ├── openid-client.js
│   │   │   ├── preact-render-to-string.js
│   │   │   ├── preact.js
│   │   │   ├── react-calendar-heatmap.js
│   │   │   ├── react-tooltip.js
│   │   │   └── uuid.js
│   │   ├── _error.js
│   │   ├── app-paths-manifest.json
│   │   ├── interception-route-rewrite-manifest.js
│   │   ├── middleware-build-manifest.js
│   │   ├── middleware-manifest.json
│   │   ├── middleware-react-loadable-manifest.js
│   │   ├── next-font-manifest.js
│   │   ├── next-font-manifest.json
│   │   ├── pages-manifest.json
│   │   ├── server-reference-manifest.js
│   │   ├── server-reference-manifest.json
│   │   └── webpack-runtime.js
│   ├── static
│   │   ├── chunks
│   │   │   ├── app
│   │   │   │   ├── _not-found
│   │   │   │   │   └── page.js
│   │   │   │   ├── (main)
│   │   │   │   │   ├── dashboard
│   │   │   │   │   │   └── page.js
│   │   │   │   │   └── page.js
│   │   │   │   ├── api
│   │   │   │   │   ├── auth
│   │   │   │   │   │   └── [...nextauth]
│   │   │   │   │   │       └── route.js
│   │   │   │   │   └── users
│   │   │   │   │       └── [atcoderId]
│   │   │   │   │           └── submissions
│   │   │   │   │               └── route.js
│   │   │   │   └── layout.js
│   │   │   ├── fallback
│   │   │   │   ├── pages
│   │   │   │   │   ├── _app.js
│   │   │   │   │   └── _error.js
│   │   │   │   ├── amp.js
│   │   │   │   ├── main-app.js
│   │   │   │   ├── main.js
│   │   │   │   ├── react-refresh.js
│   │   │   │   └── webpack.js
│   │   │   ├── pages
│   │   │   │   ├── _app.js
│   │   │   │   └── _error.js
│   │   │   ├── _error.js
│   │   │   ├── app-pages-internals.js
│   │   │   ├── main-app.js
│   │   │   ├── main.js
│   │   │   ├── polyfills.js
│   │   │   ├── react-refresh.js
│   │   │   └── webpack.js
│   │   ├── css
│   │   │   └── app
│   │   │       ├── (main)
│   │   │       │   └── dashboard
│   │   │       │       └── page.css
│   │   │       └── layout.css
│   │   ├── development
│   │   │   ├── _buildManifest.js
│   │   │   └── _ssgManifest.js
│   │   ├── media
│   │   │   ├── 569ce4b8f30dc480-s.p.woff2
│   │   │   ├── 747892c23ea88013-s.woff2
│   │   │   ├── 8d697b304b401681-s.woff2
│   │   │   ├── 93f479601ee12b01-s.p.woff2
│   │   │   ├── 9610d9e46709d722-s.woff2
│   │   │   └── ba015fad6dcf6784-s.woff2
│   │   └── webpack
│   │       ├── app
│   │       │   ├── layout.070d988f49e48631.hot-update.js
│   │       │   ├── layout.1e9f59cee6cc1ff2.hot-update.js
│   │       │   ├── layout.5d2ad6f595cf3fb4.hot-update.js
│   │       │   ├── layout.7a50d33e2f968004.hot-update.js
│   │       │   ├── layout.b632fcc929d9c19e.hot-update.js
│   │       │   └── layout.c91c5e7f92ef6858.hot-update.js
│   │       ├── 070d988f49e48631.webpack.hot-update.json
│   │       ├── 0f24087baae89475.webpack.hot-update.json
│   │       ├── 11e83c88307c931d.webpack.hot-update.json
│   │       ├── 1e9f59cee6cc1ff2.webpack.hot-update.json
│   │       ├── 5d2ad6f595cf3fb4.webpack.hot-update.json
│   │       ├── 633457081244afec._.hot-update.json
│   │       ├── 7a50d33e2f968004.webpack.hot-update.json
│   │       ├── 80d7e09c84ee9662.webpack.hot-update.json
│   │       ├── b632fcc929d9c19e.webpack.hot-update.json
│   │       ├── c91c5e7f92ef6858.webpack.hot-update.json
│   │       ├── e1360e546a4a13d8.webpack.hot-update.json
│   │       ├── webpack.070d988f49e48631.hot-update.js
│   │       ├── webpack.0f24087baae89475.hot-update.js
│   │       ├── webpack.11e83c88307c931d.hot-update.js
│   │       ├── webpack.1e9f59cee6cc1ff2.hot-update.js
│   │       ├── webpack.5d2ad6f595cf3fb4.hot-update.js
│   │       ├── webpack.7a50d33e2f968004.hot-update.js
│   │       ├── webpack.80d7e09c84ee9662.hot-update.js
│   │       ├── webpack.b632fcc929d9c19e.hot-update.js
│   │       ├── webpack.c91c5e7f92ef6858.hot-update.js
│   │       └── webpack.e1360e546a4a13d8.hot-update.js
│   ├── types
│   │   ├── app
│   │   │   ├── (main)
│   │   │   │   ├── dashboard
│   │   │   │   │   └── page.ts
│   │   │   │   └── page.ts
│   │   │   ├── api
│   │   │   │   ├── auth
│   │   │   │   │   └── [...nextauth]
│   │   │   │   │       └── route.ts
│   │   │   │   └── users
│   │   │   │       └── [atcoderId]
│   │   │   │           └── submissions
│   │   │   │               └── route.ts
│   │   │   └── layout.ts
│   │   ├── cache-life.d.ts
│   │   └── package.json
│   ├── app-build-manifest.json
│   ├── build-manifest.json
│   ├── fallback-build-manifest.json
│   ├── package.json
│   ├── react-loadable-manifest.json
│   └── trace
├── prisma
│   ├── migrations
│   │   ├── 20250708035249_init
│   │   │   └── migration.sql
│   │   ├── 20250709140015_add_submission_model
│   │   │   └── migration.sql
│   │   └── migration_lock.toml
│   └── schema.prisma
├── public
├── src
│   ├── app
│   │   ├── (auth)
│   │   │   ├── link-atcoder
│   │   │   │   └── page.tsx
│   │   │   ├── login
│   │   │   │   └── page.tsx
│   │   │   └── register
│   │   │       └── page.tsx
│   │   ├── (main)
│   │   │   ├── [atcoderId]
│   │   │   ├── dashboard
│   │   │   │   └── page.tsx
│   │   │   ├── problems
│   │   │   │   └── [problemId]
│   │   │   │       └── page.tsx
│   │   │   ├── submissions
│   │   │   │   └── new
│   │   │   │       └── page.tsx
│   │   │   ├── users
│   │   │   │   ├── [userId]
│   │   │   │   │   ├── submissions
│   │   │   │   │   │   └── [submissionId]
│   │   │   │   │   │       └── page.tsx
│   │   │   │   │   └── page.tsx
│   │   │   │   └── page.tsx
│   │   │   └── page.tsx
│   │   ├── api
│   │   │   ├── auth
│   │   │   │   └── [...nextauth]
│   │   │   │       └── route.ts
│   │   │   ├── user
│   │   │   │   └── atcoder
│   │   │   │       └── route.ts
│   │   │   └── users
│   │   │       └── [atcoderId]
│   │   │           └── submissions
│   │   │               └── route.ts
│   │   ├── globals.css
│   │   └── layout.tsx
│   ├── components
│   │   ├── dashboard
│   │   │   └── Dashboard.tsx
│   │   ├── landing
│   │   │   ├── Features.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── Header.tsx
│   │   │   └── Hero.tsx
│   │   ├── layout
│   │   │   ├── Footer.tsx
│   │   │   └── Header.tsx
│   │   └── Providers.tsx
│   └── types
│       └── submission.ts
├── .env
├── .env.local
├── .gitignore
├── docker-compose.yml
├── eslint.config.mjs
├── GEMINI.md
├── next-auth.d.ts
├── next-env.d.ts
├── next.config.ts
├── package-lock.json
├── package.json
├── postcss.config.mjs
├── README.md
├── tailwind.config.ts
└── tsconfig.json