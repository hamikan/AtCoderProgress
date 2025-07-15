import { prisma } from '@/lib/prisma';
import axios from 'axios';

async function main() {
  console.log('Start seeding...');

  // AtCoder Problems APIから問題データを取得
  const problemsResponse = await axios.get('https://kenkoooo.com/atcoder/resources/merged-problems.json');
  const problemsData = problemsResponse.data;

  // 難易度データを取得
  const problemModelResponse = await axios.get('https://kenkoooo.com/atcoder/resources/problem-models.json');
  const problemModelData: { [problemId: string]: { difficulty: number } } = problemModelResponse.data;

  for (const problem of problemsData) {
    const problemId = problem.id;
    const rawDifficulty = problemModelData[problemId]?.difficulty;
    const difficulty = (typeof rawDifficulty === 'number' && rawDifficulty !== null) ? Math.floor(rawDifficulty) : null;

    await prisma.problem.upsert({
      where: { id: problemId },
      update: {
        contestId: problem.contest_id,
        problemIndex: problem.problem_index,
        name: problem.name,
        difficulty: difficulty,
      },
      create: {
        id: problemId,
        contestId: problem.contest_id,
        problemIndex: problem.problem_index,
        name: problem.name,
        difficulty: difficulty,
      }
    });
  }

  console.log('Seeding finished.');
}

main().catch(e => {
  console.error('Error during seeding:', e);
  process.exit(1);
});