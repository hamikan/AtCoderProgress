import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import ContestTable from '@/components/problem/ContestTable';
import ProblemStats from '@/components/problem/ProblemStats';
import { Problem } from '@/types/problem';
import { Contest } from '@/types/contest';
import { SubmissionStatus } from '@/types/submission';
import fetchSubmission from '@/lib/services/submission';
import { unstable_cache } from 'next/cache';

interface ProblemsPageProps {
  filters: {
    contestType?: 'abc' | 'arc' | 'agc';
    order?: 'asc' | 'desc';
  }
}

const getContestData = (
  contestType: 'abc' | 'arc' | 'agc',
  order?: 'asc' | 'desc'
) =>
  unstable_cache(
    async () => {
      const where: Prisma.ContestWhereInput = {
        id: { startsWith: contestType },
      };

      const contestsFromDB = await prisma.contest.findMany({
        where,
        include: {
          problems: {
            include: {
              problem: true,
            },
          },
        },
      });

      contestsFromDB.sort((a, b) => {
        const comparison = a.id.localeCompare(b.id);
        return order === 'asc' ? comparison : -comparison;
      });

      let totalProblems = 0;

      const contests: Contest[] = contestsFromDB.map((contest) => {
        const problemsResult: { [key: string]: Problem | null } = {};
        for (const contestProblem of contest.problems) {
          const problemIndex = contestProblem.problemIndex;
          problemsResult[problemIndex] = contestProblem.problem;
        }

        totalProblems += contest.problems.length;
        return {
          id: contest.id,
          startEpochSecond: contest.startEpochSecond,
          durationSecond: contest.durationSecond,
          problems: problemsResult,
        };
      });
      
      let problemIndexes: string[] = [];

      switch(contestType) {
        case 'abc':
          problemIndexes = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H/Ex']
          break;
        case 'arc':
          problemIndexes = ['A', 'B', 'C', 'D', 'E', 'F', 'F2'];
          break;
        case 'agc':
          problemIndexes = ['A', 'B', 'C', 'D', 'E', 'F', 'F2'];
          break;
        default:
          problemIndexes = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H/Ex']
      }

      return { contests, problemIndexes, totalProblems };
    },
    ['contest-data', contestType, order ?? 'desc'],
    { revalidate: 300 }
  )();

const getSubmissionData = (
  userId: string,
  contestType: 'abc' | 'arc' | 'agc'
) =>
  unstable_cache(
    async () => fetchSubmission(userId, contestType),
    ['submission-data', userId, contestType],
    { revalidate: 300 }
  )();

export async function FetchContestData({ filters }: ProblemsPageProps) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  const atcoderId = session?.user?.atcoderId;

  const {
    contestType = 'abc', 
    order,
  } = filters;

  const { contests, problemIndexes, totalProblems } = await getContestData(contestType, order);

  const stats = {
    total: totalProblems,
    ac: 0,
    trying: 0,
    unsolved: totalProblems,
  };

  const submissionStatusMap: Record<string, SubmissionStatus> = {};
  if (userId) {
    const allSubmissionFromDB = await getSubmissionData(userId, contestType);
    for (const sub of allSubmissionFromDB.submissions) {
      const existing = submissionStatusMap[sub.problemId];
      if (existing) {
        const result = existing.result;
        const epochSecond = existing.epochSecond;
        if (!result || !epochSecond) continue;
        if (sub.result === 'AC') {
          if (result !== 'AC') {
            stats.ac++;
            stats.trying--;
            submissionStatusMap[sub.problemId] = { result: 'AC', epochSecond: sub.epochSecond };
          } else {
            submissionStatusMap[sub.problemId] = { result: 'AC', epochSecond: Math.min(epochSecond, sub.epochSecond) };
          }
        }
      } else {
        stats.unsolved--;
        if (sub.result === 'AC') {
          stats.ac++;
        } else {
          stats.trying++;
        }
        submissionStatusMap[sub.problemId] = { result: sub.result, epochSecond: sub.epochSecond };
      }
    }
  }

  const contestTableProps = {
    contests,
    problemIndexes,
    totalProblems,
    submissionStatusMap,
  }

  return (
    <div className="flex space-x-4">
      <div className="flex-1">
        <ContestTable {...contestTableProps} />
      </div>
      <div className="w-72">
        <ProblemStats stats={stats}/>
      </div>
    </div>
  )
}
