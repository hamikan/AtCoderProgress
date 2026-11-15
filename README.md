# AtCoder Progress

AtCoder の学習状況を記録・可視化する Next.js アプリケーションです。

## 開発

```bash
npm install
npm run dev
```

開発サーバーは [http://localhost:1207](http://localhost:1207) で起動します。

主な検証コマンドは次のとおりです。

```bash
npm run typecheck
npm run lint:strict
npm test
npm run test:coverage
npm run build
```

## 定期実行

本番（Vercel）では、`vercel.json` の Cron が 1 日 1 回、次の 2 つを呼びます。Vercel の無料プランでは、時刻は 1 時間ほどずれることがあります。

| 呼ぶ先 | 時刻（日本時間） | すること |
| --- | --- | --- |
| `/api/cron/sync-problems` | 3:00 ごろ | AtCoder Problems から新しいコンテストと問題を取り込み、問題データ待ちだった提出を数に入れる |
| `/api/cron/cleanup-sessions` | 3:30 ごろ | 期限が切れたログインのセッションを消す |

- Vercel の環境変数 `CRON_SECRET` が必要です。設定されていないと、どちらも 401 で断られます。
- 手元では定期実行は動きません。問題データは、必要なときに `npm run db:sync:problems`（問題とコンテストだけ）か `npm run db:sync:latest`（提出とレート履歴も）で取り込みます。
- 独自 difficulty の推定は定期実行に含まれません。新しい ABC・ARC のあとに `npm run difficulty:estimate` を実行します。

## デプロイ（Vercel と Neon）

環境変数の一覧と説明は `.env.example` にあります。

### 1. データベース（Neon）

- 接続先の URL は 2 つあります。
  - 接続プール越し（ホスト名に `-pooler` が付く）：アプリが使う `DATABASE_URL`
  - 直接：マイグレーションに使う `DATABASE_URL_UNPOOLED`。Prisma の CLI は、これがあればこちらを使います
- Vercel の Neon 連携を使うと、両方が自動で入ります。

### 2. Vercel の環境変数

| 変数 | 必要か | 補足 |
| --- | --- | --- |
| `DATABASE_URL` | 必須 | プール越しの URL |
| `DATABASE_URL_UNPOOLED` | あるとよい | 直接の URL |
| `NEXTAUTH_SECRET` | 必須 | `openssl rand -base64 32` などで作る |
| `GITHUB_ID`・`GITHUB_SECRET` | 必須 | コールバックは `https://<ドメイン>/api/auth/callback/github` |
| `GOOGLE_ID`・`GOOGLE_SECRET` | 必須 | リダイレクト URI は `https://<ドメイン>/api/auth/callback/google` |
| `UPLOADTHING_TOKEN` | 画像に必要 | 手元と本番で UploadThing のアプリを分ける（下の「手元から本番に触るとき」） |
| `CRON_SECRET` | 定期実行に必要 | 好きな長い文字列 |
| `NEXTAUTH_URL` | 設定しない | Vercel では自動で決まる。設定するなら Production だけにする |

必須の変数が足りないと、起動のときに足りない名前をまとめてログに出して止まります。

### 3. ログインの設定

- GitHub の OAuth App はコールバック URL を 1 つしか持てないので、手元用と本番用を分けて作ります。
- Google は、OAuth の同意画面を「本番」にしないと、テストユーザーしかログインできません。

### 4. Vercel の設定

- **Fluid compute は有効のままにします**（新しいプロジェクトでは既定で有効）。1 回の処理が 300 秒まで動けます。AtCoder ID を連携したときの全件取得は、最長 240 秒動きます。
- **関数のリージョンを、Neon と同じ地域にします**（既定は米国の `iad1`）。ページを 1 つ出すのに DB へ何度も問い合わせるので、離れていると遅くなります。`vercel.json` に `"regions": ["<リージョン>"]` を足すか、プロジェクトの設定で選びます。

### 5. 最初のデプロイの順番

デプロイしただけでは、DB に表も問題データもありません。自分の PC から、本番の URL をコマンドの頭で渡して実行します。

```bash
# 表を作る（直接の URL で）
DATABASE_URL="<直接の URL>" npx prisma migrate deploy

# コンテストと問題を取り込む
DATABASE_URL="<本番の URL>" npm run db:sync:problems

# 独自 difficulty を入れる（.env.local に ATCODER_REVEL_SESSION が要る）
DATABASE_URL="<本番の URL>" npm run difficulty:estimate
```

そのあとは、マイグレーションを含む変更をデプロイするたびに、1 行目だけを実行します。ビルドではマイグレーションは動きません。

### プレビューのデプロイ

- `*.vercel.app` のプレビューでは、OAuth のコールバック URL が合わないのでログインできません。
- プレビューに本番の `DATABASE_URL` を渡さないでください。マージ前のコードが本番のデータに触ります。

### 手元から本番に触るとき

- 本番の URL は `.env.local` に書かず、上のようにコマンドの頭で渡します。`.env.local` に書くと、`prisma migrate dev` や `npm run images:cleanup` が本番に向きます。
- `npm run images:cleanup` は、つないだ DB から「使われていない画像」を決めて UploadThing から消します。手元と本番で同じ UploadThing のアプリを使っていると、手元の DB を見て本番の画像を消してしまいます。アプリを分けてください。
- どのスクリプトも、最初に接続先の DB を表示します。

### デプロイしたあとに確かめること

- AtCoder ID を連携できるか。連携の前に AtCoder のユーザーページを見に行くので、Vercel からの問い合わせを AtCoder が断ると連携できません。
- Vercel のログに、`[problem-sync]` や `[atcoder-refresh]` の行が出ているか（下の「ログ」）。

## ログ

サーバー側のログは `src/lib/logger.ts` の `createLogger('<処理の名前>')` で出します。`src/` の中で `console.*` を直接使うと lint で止まります。

- 形は `[処理の名前] メッセージ {文脈の JSON}` の 1 行です。Vercel のログで、処理の名前や ID で検索できます。
- `info`：普段の記録（取り込みや取り直しの結果）
- `warn`：失敗したが、あとで取り直せば済むもの
- `error`：利用者の操作が失敗した、またはデータが失われうるもの
- 文脈には ID や件数を入れます。トークン、メールアドレス、解法の本文は入れません。

## 設計方針

URL、機能、共通基盤という大きな単位から、必要になった場所だけを小さく分けます。呼び出し側では「何をするか」が読め、細かな実装事情は各機能の内側に収まる構成を目指します。

```text
src/
├── app/          URL とレイアウト。page.tsx は機能を組み合わせる場所
├── features/     problems、solutions など、プロダクトの機能
├── components/   複数機能から使える表示部品とエディター基盤
├── hooks/        機能に依存しない React hooks
├── lib/          Prisma、認証、外部サービス、汎用関数
└── types/        グローバル型・ambient declaration のみ
```

機能の中には、実際に必要なディレクトリだけを置きます。

```text
features/<feature>/
├── api/          サーバー内部の読み取り処理
├── actions/      UI から呼ぶ Server Action の更新処理
├── components/   その機能固有の表示
├── functions/    副作用のない計算・変換
├── hooks/        その機能固有の hooks
├── schemas/      Zod による境界入力の検証
├── sync/         外部データの同期と永続化
└── types/
    ├── input/    入力・内部処理用の型
    ├── output/   UI へ渡せる直列化済みの型
    ├── error/    期待される失敗の型
    └── index.ts  type-only export
```

空のディレクトリを将来のために先に作ることはしません。ファイルが増えて責務が混ざり始めた時点で分割します。

### 依存方向

基本の依存方向は `app → features → lib` です。

- `app` は URL を表し、機能の API とコンポーネントを直接組み合わせます。
- `components` と `lib` は `features` に依存しません。
- 機能間の依存は一方向に限定し、循環させません。
- 実行コードは具体的なファイルから import します。barrel export は `types/index.ts` の type-only export に限定します。
- Prisma のモデルを UI へ渡さず、機能の `output` 型へ変換します。

これらの機械的に判定できる規則は `npm run test:architecture` で検証します。

`next-env.d.ts` は Next.js が生成・管理するためプロジェクトルートに置きます。それ以外のプロジェクト固有の ambient declaration は `src/types/` に置きます。

### `api` と `actions`

`features/*/api` は React Server Component など、サーバー内部から呼ぶ読み取り関数です。ここに `route.ts` は置かず、外部公開もしません。

`features/*/actions` はフォームなどの UI から呼ぶ更新処理です。`"use server"` を付け、想定内の失敗は `Result<T, E>` で返します。

本当に HTTP として公開する必要がある処理だけを `app/api/**/route.ts` に置きます。

### 認証とデータ境界

- ページは `getCurrentUser()` の `null` を許容し、未ログインでも UI と公開データを表示します。
- 未ログイン時の個人データは空の状態として扱い、ページからログイン画面へ強制遷移しません。
- 更新を伴う Server Action は認証を必須とし、ログイン後は操作前のページへ戻します。
- 外部 API と UI 入力は Zod で検証します。
- 外部データは検証・正規化してから DB に保存し、ページは原則として DB から読み取ります。
- Server Component を標準とし、操作が必要な末端だけを Client Component にします。

### Unit Testカバレッジ

`npm run test:coverage` は、Unit Testの対象である `features/*/functions`、`features/*/schemas` と共有の検証・AtCoder変換・コードハイライト処理を `--all` で数え、未実行ファイルも含めて80%以上を要求します。Reactコンポーネント、DB、Server Actionなどを含むプロジェクト全体のカバレッジを意味するものではありません。
