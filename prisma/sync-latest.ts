import { prisma } from '@/lib/prisma';
import { syncContestsAndProblems } from '@/features/problems/sync/sync-contests-and-problems';
import { syncRatingHistory } from '@/features/ratings/sync/sync-rating-history';
import { syncSubmissions } from '@/features/submissions/sync/sync-submissions';

const DEFAULT_ATCODER_ID = 'Mikankyan';

async function main() {
  const atcoderId = process.argv[2] ?? DEFAULT_ATCODER_ID;

  console.log(`Starting manual sync for AtCoder ID: ${atcoderId}`);

  const user = await prisma.user.findUnique({
    where: { atcoderId },
    select: { id: true, name: true, atcoderId: true },
  });

  if (!user?.atcoderId) {
    throw new Error(`User with atcoderId "${atcoderId}" was not found.`);
  }

  console.log('1/3 Syncing contests and problems...');
  await syncContestsAndProblems();

  console.log('2/3 Syncing submissions...');
  const submissionsSynced = await syncSubmissions(user.id, user.atcoderId, 0);
  if (!submissionsSynced) {
    throw new Error('AtCoder ID changed while submissions were syncing.');
  }
  console.log('3/3 Syncing rating history...');
  const ratingSynced = await syncRatingHistory(user.id, user.atcoderId);
  if (!ratingSynced) {
    throw new Error('AtCoder ID changed while rating history was syncing.');
  }

  console.log(`Manual sync finished for ${user.name ?? user.atcoderId}.`);
}

main()
  .catch((error) => {
    console.error('Manual sync failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
