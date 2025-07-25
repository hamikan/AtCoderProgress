import { prisma } from '@/lib/prisma';
import axios from 'axios';

interface ProblemDataFromAPI {
  id: string;
  contest_id: string;
  problem_index: string;
  name: string;
  title: string;
  shortest_submission_id?: string;
  shortest_contest_id?: string;
  shortest_user_id?: string;
  fastest_submission_id?: string;
  fastest_contest_id?: string;
  fastest_user_id?: string;
  first_submission_id?: string;
  first_contest_id?: string;
  first_user_id?: string;
  source_code_length?: number;
  execution_time?: number;
  point?: number;
  solver_count?: number;
}

interface ContestDataFromAPI {
  id: string;
  start_epoch_second: number;
  duration_second: number;
}

interface ContestProblem {
  contest_id: string;
  problem_id: string;
  problem_index: string;
}

async function main() {
  console.log('Start seeding...');

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  let problemsData: ProblemDataFromAPI[] = [];
  try {
    // AtCoder Problems APIから問題データを取得
    const problemsResponse = await axios.get('https://kenkoooo.com/atcoder/resources/merged-problems.json');
    problemsData = problemsResponse.data;
    console.log(`Fetched ${problemsData.length} problems.`);
  } catch (error: any) {
    console.error('Error fetching problems data:', error.message);
    process.exit(1); // 問題データ取得失敗時はシード処理を中断
  }

  await sleep(1500);

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
        update: {},
        create: {
          id: problemId,
          name: problem.name,
          difficulty: difficulty,
        }
      });
    } catch (error: any) {
      console.error(`Error upserting problem ${problemId}:`, error.message);
      // 個別の問題のupsertエラーはログに記録するだけで、処理を続行
    }
  }

  await sleep(1500);
  
  let contestsData: ContestDataFromAPI[] = [];
  try {
    // AtCoder Contests APIからコンテストデータを取得
    const contestsResponse = await axios.get('https://kenkoooo.com/atcoder/resources/contests.json');
    contestsData = contestsResponse.data;
    console.log(`Fetched ${contestsData.length} contests.`);
  } catch (error: any) {
    console.error('Error fetching contests data:', error.message);
    process.exit(1); // コンテストデータ取得失敗時はシード処理を中断
  }

  for (const contest of contestsData) {
    const contestId = contest.id;
    const startEpochSecond = contest.start_epoch_second;
    const durationSecond = contest.duration_second;

    try {
      await prisma.contest.upsert({
        where: { id: contestId },
        update: {},
        create: {
          id: contestId,
          startEpochSecond: startEpochSecond,
          durationSecond: durationSecond,
        }
      });
    } catch (error: any) {
      console.error(`Error upserting contest ${contestId}:`, error.message);
      // 個別のコンテストのupsertエラーはログに記録するだけで、処理を続行
    }
  }
  
  await sleep(1500);

  let contestProblemData: ContestProblem[] = [];
  try {
    // コンテストと問題の紐付けデータを取得
    const contestProblemsResponse = await axios.get('https://kenkoooo.com/atcoder/resources/contest-problem.json');
    contestProblemData = contestProblemsResponse.data;
    console.log(`Fetched ${contestProblemData.length} contest problems.`);
  } catch (error: any) {
    console.error('Error fetching contest problems data:', error.message);
    process.exit(1); // コンテストと問題の紐付けデータ取得失敗時はシード処理を中断
  }

  for (const contestProblem of contestProblemData) {
    const { contest_id, problem_id, problem_index } = contestProblem;

    try {
      await prisma.contestProblem.upsert({
        where: {
          contestId_problemId: {
            contestId: contest_id,
            problemId: problem_id,
          }
        },
        update: {},
        create: {
          contestId: contest_id,
          problemId: problem_id,
          problemIndex: problem_index,
        }
      });
    } catch (error: any) {
      console.error(`Error upserting contest problem ${contest_id}-${problem_id}:`, error.message);
      // 個別のコンテスト問題のupsertエラーはログに記録するだけで、処理を続行
    }
  }

  console.log('Seeding finished.');
}

main().catch(e => {
  console.error('Error during seeding:', e);
  process.exit(1);
});