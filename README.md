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

`npm run test:coverage` は、Unit Testの対象である `features/*/functions`、`features/*/schemas` と共有の検証・AtCoder変換関数を `--all` で数え、未実行ファイルも含めて80%以上を要求します。Reactコンポーネント、DB、Server Actionなどを含むプロジェクト全体のカバレッジを意味するものではありません。
