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
振り返りAC
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

6. データ整合性に関する最終確認
(最重要)この問題について、Submissionは残しておく理由がないので削除するのですが、Solutionとそれに付随するタグは他のユーザーの参考になるため残しておこうと思っています。しかし、セキュリティーの観点からユーザーが退会する際に、そのユーザーが作成した投稿とタグを削除するか確認するつもりです。

geminiの立ち振る舞いについて
・私がコードの修正をお願いしますというような指示を出すまでコードの修正をしないようにしてください
・git関連のコマンドは私が打ちます
・1回のリクエストにつき変更は1ファイルまでにしてください

このアプリに使用されているライブラリやフレームワークのバージョン
Auth.js: v4
tailwindcss: v4

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
│   │   │   │   ├── 16.pack.gz
│   │   │   │   ├── 17.pack.gz
│   │   │   │   ├── 18.pack.gz
│   │   │   │   ├── 19.pack.gz
│   │   │   │   ├── 2.pack.gz
│   │   │   │   ├── 20.pack.gz
│   │   │   │   ├── 21.pack.gz
│   │   │   │   ├── 22.pack.gz
│   │   │   │   ├── 23.pack.gz
│   │   │   │   ├── 24.pack.gz
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
│   │   │   │   ├── 2.pack.gz
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
│   │   │       ├── 19.pack.gz
│   │   │       ├── 2.pack.gz
│   │   │       ├── 20.pack.gz
│   │   │       ├── 21.pack.gz
│   │   │       ├── 22.pack.gz
│   │   │       ├── 23.pack.gz
│   │   │       ├── 24.pack.gz
│   │   │       ├── 25.pack.gz
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
│   │   ├── app-paths-manifest.json
│   │   ├── interception-route-rewrite-manifest.js
│   │   ├── middleware-build-manifest.js
│   │   ├── middleware-manifest.json
│   │   ├── middleware-react-loadable-manifest.js
│   │   ├── next-font-manifest.js
│   │   ├── next-font-manifest.json
│   │   ├── pages-manifest.json
│   │   ├── server-reference-manifest.js
│   │   └── server-reference-manifest.json
│   ├── static
│   │   ├── chunks
│   │   │   └── polyfills.js
│   │   └── development
│   │       ├── _buildManifest.js
│   │       └── _ssgManifest.js
│   ├── types
│   │   ├── cache-life.d.ts
│   │   └── package.json
│   ├── app-build-manifest.json
│   ├── build-manifest.json
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
│   │   │   ├── analytics
│   │   │   │   └── page.tsx
│   │   │   ├── dashboard
│   │   │   │   └── page.tsx
│   │   │   ├── problems
│   │   │   │   ├── [problemId]
│   │   │   │   │   └── page.tsx
│   │   │   │   └── page.tsx
│   │   │   ├── solutions
│   │   │   │   └── page.tsx
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
│   │   │   └── layout.tsx
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
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components
│   │   ├── analytics
│   │   │   ├── ActivityPatterns.tsx
│   │   │   ├── AlgorithmAnalysis.tsx
│   │   │   ├── ComparisonBenchmark.tsx
│   │   │   ├── GoalPrediction.tsx
│   │   │   ├── GrowthTrends.tsx
│   │   │   └── LearningEfficiency.tsx
│   │   ├── dashboard
│   │   │   ├── ActivityHeatmap.tsx
│   │   │   ├── AlgorithmRadar.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   ├── RecentActivity.tsx
│   │   │   ├── RecommendedProblems.tsx
│   │   │   ├── StatsOverview.tsx
│   │   │   └── WeaknessAnalysis.tsx
│   │   ├── landing
│   │   │   ├── Features.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── Header.tsx
│   │   │   └── Hero.tsx
│   │   ├── layout
│   │   │   ├── Footer.tsx
│   │   │   └── Header.tsx
│   │   ├── problems
│   │   │   ├── ContestTable.tsx
│   │   │   ├── ProblemsFilters.tsx
│   │   │   └── ProblemStats.tsx
│   │   ├── solutions
│   │   │   ├── SolutionEditor.tsx
│   │   │   ├── SolutionsFilters.tsx
│   │   │   └── SolutionsList.tsx
│   │   ├── ui
│   │   │   ├── avatar.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── dropdown-menu.tsx
│   │   │   ├── input.tsx
│   │   │   ├── label.tsx
│   │   │   ├── popover.tsx
│   │   │   ├── progress.tsx
│   │   │   ├── select.tsx
│   │   │   ├── separator.tsx
│   │   │   ├── sheet.tsx
│   │   │   ├── sidebar.tsx
│   │   │   ├── skeleton.tsx
│   │   │   ├── slider.tsx
│   │   │   ├── switch.tsx
│   │   │   ├── table.tsx
│   │   │   ├── tabs.tsx
│   │   │   ├── textarea.tsx
│   │   │   └── tooltip.tsx
│   │   └── Providers.tsx
│   ├── hooks
│   │   └── use-mobile.ts
│   ├── lib
│   │   └── utils.ts
│   └── types
│       └── submission.ts
├── .DS_Store
├── .env
├── .env.local
├── .gitignore
├── components.json
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
├── tmp.txt
└── tsconfig.json