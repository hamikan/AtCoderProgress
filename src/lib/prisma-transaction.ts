// Prisma の既定（待ち 2 秒・実行 5 秒）では、数百件の提出をまとめて書く処理が本番の DB で時間切れになりうる
export const LONG_TRANSACTION_OPTIONS = {
  maxWait: 10_000,
  timeout: 30_000,
} as const;
