import { prisma } from '@/lib/prisma';
import { revalidateTag } from 'next/cache';

const CONTESTS_ENDPOINT = 'https://kenkoooo.com/atcoder/resources/contests.json';
const CONTEST_PROBLEMS_ENDPOINT = 'https://kenkoooo.com/atcoder/resources/contest-problem.json';
const MERGED_PROBLEMS_ENDPOINT = 'https://kenkoooo.com/atcoder/resources/merged-problems.json';
const PROBLEM_MODELS_ENDPOINT = 'https://kenkoooo.com/atcoder/resources/problem-models.json';

interface RawContest {
  id: string;
  start_epoch_second: number;
  duration_second: number;
}

interface RawContestProblem {
  contest_id: string;
  problem_id: string;
  problem_index: string;
}

interface RawMergedProblem {
  id: string;
  title: string;
}

interface RawProblemModel {
  difficulty?: number | null;
}

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Failed to fetch ${url}: ${res.status} ${res.statusText} ${body}`);
  }
  return res.json();
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function syncContestAndProblems(contestIds?: string[]) {
  const contestsRaw = await fetchJson<RawContest[]>(CONTESTS_ENDPOINT);
  await sleep(2000);
  const contestProblemsRaw = await fetchJson<RawContestProblem[]>(CONTEST_PROBLEMS_ENDPOINT);
  await sleep(2000);
  const mergedProblemsRaw = await fetchJson<RawMergedProblem[]>(MERGED_PROBLEMS_ENDPOINT);
  await sleep(2000);
  const problemModels = await fetchJson<Record<string, RawProblemModel>>(PROBLEM_MODELS_ENDPOINT);

  const targetContestIds = contestIds ? new Set(contestIds) : null;

  const filteredContestProblems = contestProblemsRaw.filter((cp) => {
    const isValid =
      typeof cp.contest_id === 'string' &&
      typeof cp.problem_id === 'string' &&
      typeof cp.problem_index === 'string';
    if (!isValid) return false;
    return targetContestIds ? targetContestIds.has(cp.contest_id) : true;
  });

  // contest-problem に存在するコンテストだけを対象にする
  const contestIdsFromProblems = new Set(filteredContestProblems.map((cp) => cp.contest_id));

  const filteredContests = contestsRaw.filter((contest) => {
    const isValid =
      typeof contest.id === 'string' &&
      typeof contest.start_epoch_second === 'number' &&
      typeof contest.duration_second === 'number';
    if (!isValid) return false;
    const inRequested = targetContestIds ? targetContestIds.has(contest.id) : true;
    return inRequested && contestIdsFromProblems.has(contest.id);
  });

  // problem_id に紐づくタイトルを用意
  const mergedProblemMap = new Map(
    mergedProblemsRaw
      .filter((p) => typeof p.id === 'string' && typeof p.title === 'string')
      .map((p) => [p.id, p.title]),
  );

  const problemIdsInScope = new Set(filteredContestProblems.map((cp) => cp.problem_id));

  if (filteredContests.length === 0 && problemIdsInScope.size === 0) {
    return;
  }

  await prisma.$transaction(async (tx) => {
    for (const contest of filteredContests) {
      await tx.contest.upsert({
        where: { id: contest.id },
        update: {
          startEpochSecond: contest.start_epoch_second,
          durationSecond: contest.duration_second,
        },
        create: {
          id: contest.id,
          startEpochSecond: contest.start_epoch_second,
          durationSecond: contest.duration_second,
        },
      });
    }

    if (problemIdsInScope.size > 0) {
      // Problem upsert
      for (const problemId of problemIdsInScope) {
        const model = problemModels[problemId];
        const difficulty =
          model && typeof model.difficulty === 'number' ? Math.floor(model.difficulty) : null;
        const name = mergedProblemMap.get(problemId) ?? '';
        await tx.problem.upsert({
          where: { id: problemId },
          update: {
            name,
            difficulty,
          },
          create: {
            id: problemId,
            name,
            difficulty,
            totalSolutionCount: 0,
          },
        });
      }

      // ContestProblem createMany
      const contestProblemData = filteredContestProblems.map((cp) => ({
        contestId: cp.contest_id,
        problemId: cp.problem_id,
        problemIndex: cp.problem_index,
      }));

      if (contestProblemData.length > 0) {
        await tx.contestProblem.createMany({
          data: contestProblemData,
          skipDuplicates: true,
        });
      }
    }
  });

  revalidateTag('contest-data');
}
