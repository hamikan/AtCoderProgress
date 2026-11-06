import 'dotenv/config';
import { prisma } from '@/lib/prisma';
import { syncContestsAndProblems } from '@/features/problems/sync/sync-contests-and-problems';
import { syncRatingHistory } from '@/features/ratings/sync/sync-rating-history';
import { syncSubmissions } from '@/features/submissions/sync/sync-submissions';

const DEFAULT_ATCODER_ID = 'Mikankyan';

async function main() {
  const atcoderId = process.argv[2] ?? DEFAULT_ATCODER_ID;

  console.log(`Starting manual sync for AtCoder ID: ${atcoderId}`);

  console.log('1/3 Syncing contests and problems...');
  await syncContestsAndProblems();

  console.log('2/3 Syncing submissions...');
  await syncSubmissions(atcoderId, 0);

  console.log('3/3 Syncing rating history...');
  await syncRatingHistory(atcoderId);

  console.log(`Manual sync finished for ${atcoderId}.`);
}

main()
  .catch((error) => {
    console.error('Manual sync failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
