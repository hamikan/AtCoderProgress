import { syncContestAndProblems } from '@/lib/services/sync/contest';
import { syncRatingHistory } from '@/lib/services/sync/rating';

async function main() {
  console.log('Start seeding...');
  await syncContestAndProblems();
  await syncRatingHistory("cmlc050eh0000boj0t6e78lr8", "Mikankyan");
  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error('Final seeding failure:', e);
    process.exit(1);
  });