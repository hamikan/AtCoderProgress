import { prisma } from '@/lib/prisma';
import { syncContestAndProblems } from '@/lib/services/sync/contest';
import { syncRatingHistory } from '@/lib/services/sync/rating';
import { syncSubmission } from '@/lib/services/sync/submission';

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
  await syncContestAndProblems();

  console.log('2/3 Syncing submissions...');
  await syncSubmission(user.id, user.atcoderId, 0);
  await prisma.user.update({
    where: { id: user.id },
    data: { submissionsLastFetchedAt: new Date() },
  });

  console.log('3/3 Syncing rating history...');
  await syncRatingHistory(user.id, user.atcoderId);

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
