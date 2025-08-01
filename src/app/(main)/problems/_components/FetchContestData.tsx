import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import ContestTable from '@/components/problem/ContestTable';
import ProblemStats from '@/components/problem/ProblemStats';
import { Problem } from '@/types/problem';
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

  const where: Prisma.ContestWhereInput = {};
  where.id = {
    startsWith: contest
  }
    
  const contestsFromDB = await prisma.contest.findMany({
    where,
    include: {
      problems: {
        include: {
          problem: true
        }
      }
    }
  })
  
  contestsFromDB.sort((a, b) => {
    const comparison = a.id.localeCompare(b.id);
    return order === 'asc' ? comparison : -comparison;
  });

  let totalProblems: number = 0;

  const contests: Contest[] = contestsFromDB.map(contest => {
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
    }
  })
  
  let problemIndexes: string[] = [];

  switch(contest) {
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

  const contestTableProps = {
    contests,
    problemIndexes,
    totalProblems,
  }

  const stats = userId ? {
    total: totalProblems,
    ac: await prisma.problem.count({ where: { OR: [ { solutions: { some: { userId, status: { in: ['SELF_AC', 'EXPLANATION_AC', 'REVIEW_AC'] } } } }, { submissions: { some: { userId, result: 'AC' } } } ] } }),
    trying: await prisma.problem.count({ where: { solutions: { some: { userId, status: 'TRYING' } } } }),
    unsolved: await prisma.problem.count({ where: { AND: [ { solutions: { none: { userId } } }, { submissions: { none: { userId, result: 'AC' } } } ] } }),
  } : {
    total: await prisma.problem.count(),
    ac: 0,
    trying: 0,
    unsolved: await prisma.problem.count(),
  };

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