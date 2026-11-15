import 'server-only'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@/generated/prisma/client'

// PrismaClientのインスタンスをグローバルに宣言
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient() {
  // Prisma 7 ではドライバアダプタ経由の接続が必須
  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL,
    // サーバーレスでは動いているインスタンスの数だけ接続が増えるので、1つあたりの数を絞り、使わない接続は早く返す
    max: 5,
    idleTimeoutMillis: 5_000,
    // 眠っている DB が起きるのを待つ時間。上限がないと、つながらないときに処理が打ち切られるまで待ち続ける
    connectionTimeoutMillis: 10_000,
  })
  return new PrismaClient({ adapter })
}

// グローバルにインスタンスが存在しない場合のみ、新しく作成する
export const prisma = globalForPrisma.prisma ?? createPrismaClient()

// 開発環境でのみ、グローバルにインスタンスを保存する
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
