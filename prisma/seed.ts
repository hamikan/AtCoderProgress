import { prisma } from '@/lib/prisma';
import axios from 'axios';

async function main() {
  console.log('Start seeding...');

  let problemsData: any[] = [];
  try {
    // AtCoder Problems APIから問題データを取得
    const problemsResponse = await axios.get('https://kenkoooo.com/atcoder/resources/merged-problems.json');
    problemsData = problemsResponse.data;
    console.log(`Fetched ${problemsData.length} problems.`);
  } catch (error: any) {
    console.error('Error fetching problems data:', error.message);
    process.exit(1); // 問題データ取得失敗時はシード処理を中断
  }

  let problemModelData: { [problemId: string]: { difficulty: number | null } } = {};
  try {
    // 難易度データを取得
    const problemModelResponse = await axios.get('https://kenkoooo.com/atcoder/resources/problem-models.json');
    problemModelData = problemModelResponse.data;
    console.log(`Fetched problem models for ${Object.keys(problemModelData).length} problems.`);
  } catch (error: any) {
    console.error('Error fetching problem models data:', error.message);
    process.exit(1); // 難易度データ取得失敗時はシード処理を中断
  }

  for (const problem of problemsData) {
    const problemId = problem.id;
    const rawDifficulty = problemModelData[problemId]?.difficulty;
    const difficulty = (typeof rawDifficulty === 'number') ? Math.floor(rawDifficulty) : null;

    try {
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
    } catch (error: any) {
      console.error(`Error upserting problem ${problemId}:`, error.message);
      // 個別の問題のupsertエラーはログに記録するだけで、処理を続行
    }
  }

  console.log('Seeding finished.');
}

main().catch(e => {
  console.error('Error during seeding:', e);
  process.exit(1);
});