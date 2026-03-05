import { syncContestAndProblems } from '@/lib/services/sync/contest';
import { syncRatingHistory } from '@/lib/services/sync/rating';

async function main() {
  console.log('Start seeding...');
  // await syncContestAndProblems();
  // await syncRatingHistory("cmltde7h20000boo40a7hx7nm", "Mikankyan");
  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error('Final seeding failure:', e);
    process.exit(1);
  });