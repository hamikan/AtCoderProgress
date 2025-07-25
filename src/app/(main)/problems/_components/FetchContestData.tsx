import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import ContestTable from '@/components/problem/ContestTable';
import { Problem } from '@/types/problem'
import { Contest } from '@/types/contest';

interface ProblemsPageProps {
  searchParams: {
    contest: 'abc' | 'arc' | 'agc';
    order: 'asc' | 'desc';
  }
}

export async function FetchContestData({ searchParams }: ProblemsPageProps) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  const {
    contest = 'abc', 
    order,
  } = searchParams;

  const where: Prisma.ProblemWhereInput = {};
  where.OR = [
    {
      id: {
        startsWith: contest
      }
    },
    {
      contestId: {
        startsWith: contest,
      },
    },
  ];
    
  const [problems, totalProblems] = await Promise.all([
    prisma.problem.findMany({
      where
    }),
    prisma.problem.count({ where })
  ]);

  const contestMap = new Map<string, Contest>();
  const uniqueProblemIndexes: Set<string> = new Set<string>();

  problems.forEach(problem => {
    let contest = contestMap.get(problem.contestId);
    if(!contest) {
      contest = {
        id: problem.contestId,
        name: `${problem.contestId}`,
        problems: {}
      };
      contestMap.set(problem.contestId, contest);
    }
    // 参照渡しのため代入するだけでMapに追加される
    contest.problems[problem.problemIndex] = problem;
    uniqueProblemIndexes.add(problem.problemIndex);
  });
  
  const contests: Contest[] = Array.from(contestMap.values()).sort((a, b) => {
    const comparison = a.id.localeCompare(b.id);
    return order === 'asc' ? comparison : -comparison;
  });

  const problemIndexes = Array.from(uniqueProblemIndexes).sort((a, b) => {
    if (a.length !== b.length) return a.length - b.length;
    return a.localeCompare(b);
  })

  const contestTableProps = {
    contests,
    problemIndexes,
    totalProblems,
  }

  return (
    <ContestTable {...contestTableProps} />
  )
}