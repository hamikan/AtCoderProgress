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
│   │   │   └── server-development
│   │   │       ├── 0.pack.gz
│   │   │       ├── 1.pack.gz
│   │   │       ├── 10.pack.gz
│   │   │       ├── 11.pack.gz
│   │   │       ├── 12.pack.gz
│   │   │       ├── 13.pack.gz
│   │   │       ├── 14.pack.gz
│   │   │       ├── 15.pack.gz
│   │   │       ├── 16.pack.gz
│   │   │       ├── 17.pack.gz
│   │   │       ├── 18.pack.gz
│   │   │       ├── 2.pack.gz
│   │   │       ├── 3.pack.gz
│   │   │       ├── 4.pack.gz
│   │   │       ├── 5.pack.gz
│   │   │       ├── 6.pack.gz
│   │   │       ├── 7.pack.gz
│   │   │       ├── 8.pack.gz
│   │   │       ├── 9.pack.gz
│   │   │       ├── index.pack.gz
│   │   │       └── index.pack.gz.old
│   │   └── .rscinfo
│   ├── server
│   │   ├── app
│   │   │   ├── (auth)
│   │   │   │   ├── login
│   │   │   │   │   ├── page_client-reference-manifest.js
│   │   │   │   │   └── page.js
│   │   │   │   └── register
│   │   │   │       ├── page_client-reference-manifest.js
│   │   │   │       └── page.js
│   │   │   ├── (main)
│   │   │   │   ├── [atcoderId]
│   │   │   │   │   ├── page_client-reference-manifest.js
│   │   │   │   │   └── page.js
│   │   │   │   ├── page_client-reference-manifest.js
│   │   │   │   └── page.js
│   │   │   └── api
│   │   │       └── auth
│   │   │           └── [...nextauth]
│   │   │               ├── route_client-reference-manifest.js
│   │   │               └── route.js
│   │   ├── pages
│   │   │   ├── _app.js
│   │   │   ├── _document.js
│   │   │   └── _error.js
│   │   ├── vendor-chunks
│   │   │   ├── @babel.js
│   │   │   ├── @heroicons.js
│   │   │   ├── @kurkle.js
│   │   │   ├── @panva.js
│   │   │   ├── @swc.js
│   │   │   ├── chart.js.js
│   │   │   ├── cookie.js
│   │   │   ├── jose.js
│   │   │   ├── lru-cache.js
│   │   │   ├── next-auth.js
│   │   │   ├── next.js
│   │   │   ├── oauth.js
│   │   │   ├── object-hash.js
│   │   │   ├── oidc-token-hash.js
│   │   │   ├── openid-client.js
│   │   │   ├── preact-render-to-string.js
│   │   │   ├── preact.js
│   │   │   ├── react-calendar-heatmap.js
│   │   │   ├── react-chartjs-2.js
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
│   │   │   │   ├── (auth)
│   │   │   │   │   ├── login
│   │   │   │   │   │   └── page.js
│   │   │   │   │   └── register
│   │   │   │   │       └── page.js
│   │   │   │   ├── (main)
│   │   │   │   │   ├── [atcoderId]
│   │   │   │   │   │   └── page.js
│   │   │   │   │   └── page.js
│   │   │   │   ├── api
│   │   │   │   │   └── auth
│   │   │   │   │       └── [...nextauth]
│   │   │   │   │           └── route.js
│   │   │   │   └── layout.js
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
│   │   │       │   └── [atcoderId]
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
│   │       │   └── layout.f91c8cc66bde116b.hot-update.js
│   │       ├── 2520d0964d852b69.webpack.hot-update.json
│   │       ├── 633457081244afec._.hot-update.json
│   │       ├── 6b200fa56a80c539.webpack.hot-update.json
│   │       ├── e0cf187b5b20878c.webpack.hot-update.json
│   │       ├── f2f73c5294099771.webpack.hot-update.json
│   │       ├── f91c8cc66bde116b.webpack.hot-update.json
│   │       ├── webpack.2520d0964d852b69.hot-update.js
│   │       ├── webpack.6b200fa56a80c539.hot-update.js
│   │       ├── webpack.e0cf187b5b20878c.hot-update.js
│   │       ├── webpack.f2f73c5294099771.hot-update.js
│   │       └── webpack.f91c8cc66bde116b.hot-update.js
│   ├── types
│   │   ├── app
│   │   │   ├── (auth)
│   │   │   │   ├── login
│   │   │   │   │   └── page.ts
│   │   │   │   └── register
│   │   │   │       └── page.ts
│   │   │   ├── (main)
│   │   │   │   ├── [atcoderId]
│   │   │   │   │   └── page.ts
│   │   │   │   └── page.ts
│   │   │   ├── api
│   │   │   │   └── auth
│   │   │   │       └── [...nextauth]
│   │   │   │           └── route.ts
│   │   │   └── layout.ts
│   │   ├── cache-life.d.ts
│   │   └── package.json
│   ├── app-build-manifest.json
│   ├── build-manifest.json
│   ├── package.json
│   ├── react-loadable-manifest.json
│   └── trace
├── public
├── src
│   ├── app
│   │   ├── (auth)
│   │   │   ├── api
│   │   │   ├── link-atcoder
│   │   │   │   └── page.tsx
│   │   │   ├── login
│   │   │   │   └── page.tsx
│   │   │   └── register
│   │   │       └── page.tsx
│   │   ├── (main)
│   │   │   ├── [atcoderId]
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
│   │   │   ├── recommendations
│   │   │   │   └── route.ts
│   │   │   └── submissions
│   │   │       ├── [submissionId]
│   │   │       │   └── publish
│   │   │       │       └── route.ts
│   │   │       └── route.ts
│   │   ├── globals.css
│   │   └── layout.tsx
│   └── components
│       ├── landing
│       │   ├── Features.tsx
│       │   ├── Footer.tsx
│       │   ├── Header.tsx
│       │   └── Hero.tsx
│       └── Providers.tsx
├── .gitignore
├── eslint.config.mjs
├── GEMINI.md
├── next-env.d.ts
├── next.config.ts
├── package-lock.json
├── package.json
├── postcss.config.mjs
├── README.md
└── tsconfig.json