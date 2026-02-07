import { syncContestAndProblems } from '@/lib/services/sync/contest';

async function main() {
  console.log('Start seeding...');
  await syncContestAndProblems();
  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error('Final seeding failure:', e);
    process.exit(1);
  });