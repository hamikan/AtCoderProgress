import '../scripts/load-env';

import { syncContestsAndProblems } from '@/features/problems/sync/sync-contests-and-problems';
import { prisma } from '@/lib/prisma';

import { describeDatabaseTarget } from '../scripts/database-target';

// コンテストと問題だけを取り込む。新しい DB への最初の取り込みや、定期実行を待たずに取り込みたいときに使う
async function main() {
  console.log(`DB 接続先: ${describeDatabaseTarget()}`);
  await syncContestsAndProblems();
}

main()
  .catch((error) => {
    console.error('取り込みに失敗しました:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
