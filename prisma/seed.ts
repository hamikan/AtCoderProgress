async function main() {
  console.log('Start seeding...');
  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error('Final seeding failure:', e);
    process.exit(1);
  });
