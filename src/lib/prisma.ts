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
  })
  return new PrismaClient({ adapter })
}

// グローバルにインスタンスが存在しない場合のみ、新しく作成する
export const prisma = globalForPrisma.prisma ?? createPrismaClient()

// 開発環境でのみ、グローバルにインスタンスを保存する
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
