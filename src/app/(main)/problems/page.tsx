import { Suspense } from 'react';
import ProblemsFilters from '@/components/problem/ProblemsFilters';
import ProblemsDisplay from '@/components/problem/ProblemsDisplay';
import ProblemStats from '@/components/problem/ProblemStats';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { Problem } from '@/types/problem'
import { Contest } from '@/types/contest';
import { FetchContestData } from '@/app/(main)/problems/_components/FetchContestData';

// DBから利用可能なタグを取得
const getAvailableTags = async (userId: string | null | undefined) => {
  return await prisma.tag.findMany({
    where: {
      OR: [
        { isOfficial: true },
        { createdById: userId }
      ]
    },
    orderBy: { name: 'asc' },
  });
};

interface ProblemsPageProps {
  searchParams: {
    search?: string;
    tags?: string;
    difficulty_min?: string;
    difficulty_max?: string;
    status?: string;
    contestType: 'abc' | 'arc' | 'agc';
    sort: string;
    order: 'asc' | 'desc';
    view?: 'contest' | 'list' | 'grid';
    page?: string;
  };
}

export default async function ProblemsPage({ searchParams }: ProblemsPageProps) {
  // const session = await getServerSession(authOptions);
  // const userId = session?.user?.id;

  const {
    search,
    tags,
    difficulty_min = "-4229",
    difficulty_max = "4229",
    status,
    contestType,
    sort,
    order,
    view = 'contest',
    page = '1',
  } = searchParams;

  // const currentPage = parseInt(page);
  // const itemsPerPage = view === 'grid' ? 24 : 50;

  // // フィルタリング条件
  // const where: Prisma.ProblemWhereInput = {};
  // const conditions: Prisma.ProblemWhereInput[] = [];

  // if (search) {
  //   conditions.push({
  //     OR: [
  //       { name: { contains: search, mode: 'insensitive' } },
  //       { contestId: { contains: search, mode: 'insensitive' } },
  //       { id: { contains: search, mode: 'insensitive' } },
  //     ],
  //   });
  // }

  // if (tags) {
  //   const tagList = tags.split(',');
  //   const tagOrConditions: Prisma.TagWhereInput[] = [
  //     { isOfficial: true },
  //   ];
  //   if (userId) {
  //     tagOrConditions.push({ createdById: userId });
  //   }
  //   conditions.push({
  //     solutions: {
  //       some: {
  //         tags: {
  //           some: {
  //             tag: { 
  //               name: { in: tagList },
  //               OR: tagOrConditions,
  //             },
  //           },
  //         },
  //       },
  //     },
  //   });
  // }

  // if (difficulty_min !== undefined || difficulty_max !== undefined) {
  //   const difficultyQuery: Prisma.IntFilter = {};
  //   if (difficulty_min !== undefined) difficultyQuery.gte = parseInt(difficulty_min);
  //   if (difficulty_max !== undefined) difficultyQuery.lte = parseInt(difficulty_max);
  //   conditions.push({
  //     OR: [
  //       {
  //         difficulty: difficultyQuery
  //       },
  //       {
  //         difficulty: null
  //       },
  //     ],
  //   });
  // }

  // if (contest) {
  //   conditions.push({ contestId: { startsWith: contest } });
  // }

  // if (userId && status) {
  //   const statuses = status.split(',');
  //   conditions.push({
  //     solutions: {
  //       some: {
  //         userId: userId,
  //         status: {
  //           in: statuses
  //         }
  //       }
  //     }
  //   })
  //   // if (status === 'ac') {
  //   //   conditions.push({
  //   //     OR: [
  //   //       { solutions: { some: { userId, status: { in: ['SELF_AC', 'EXPLANATION_AC', 'REVIEW_AC'] } } } },
  //   //       { submissions: { some: { userId, result: 'AC' } } },
  //   //     ],
  //   //   });
  //   // } else if (status === 'trying') {
  //   //   conditions.push({ solutions: { some: { userId, status: 'TRYING' } } });
  //   // } else if (status === 'unsolved') {
  //   //   conditions.push({
  //   //     AND: [
  //   //       { solutions: { none: { userId } } },
  //   //       { submissions: { none: { userId, result: 'AC' } } },
  //   //     ],
  //   //   });
  //   // }
  // }
  
  // if (conditions.length > 0) {
  //   where.AND = conditions;
  // }

  // // ソート条件
  // const orderBy: Prisma.ProblemOrderByWithRelationInput = {};
  // const sortKey = sort || 'difficulty';

  // if (sortKey === 'difficulty') orderBy.difficulty = order;
  // else if (sortKey === 'problemId') orderBy.id = order;


  // // データ取得
  // const [rawProblems, totalProblems, availableTags] = await Promise.all([
  //   prisma.problem.findMany({
  //     where,
  //     orderBy,
  //     include: {
  //       solutions: {
  //         where: { userId },
  //         include: {
  //           tags: { include: { tag: true } },
  //         },
  //       },
  //       submissions: userId ? {
  //         where: { userId: userId },
  //       }: false,
  //     },
  //     // skip: (currentPage - 1) * itemsPerPage,
  //     // take: itemsPerPage,
  //   }),
  //   prisma.problem.count({ where }),
  //   getAvailableTags(userId),
  // ]);

  // let problems: Problem[] | Contest[] = rawProblems.map(problem => ({
  //   ...problem,
  //   solutions: problem.solutions || [],
  //   submissions: problem.submissions || [],
  // }))

  // // 統計情報 (ログインユーザーに紐づく)
  // const stats = userId ? {
  //   total: await prisma.problem.count(),
  //   ac: await prisma.problem.count({ where: { OR: [ { solutions: { some: { userId, status: { in: ['SELF_AC', 'EXPLANATION_AC', 'REVIEW_AC'] } } } }, { submissions: { some: { userId, result: 'AC' } } } ] } }),
  //   trying: await prisma.problem.count({ where: { solutions: { some: { userId, status: 'TRYING' } } } }),
  //   unsolved: await prisma.problem.count({ where: { AND: [ { solutions: { none: { userId } } }, { submissions: { none: { userId, result: 'AC' } } } ] } }),
  // } : {
  //   total: await prisma.problem.count(),
  //   ac: 0,
  //   trying: 0,
  //   unsolved: await prisma.problem.count(),
  // };

  // let problemIndexes: string[] = [];
  // if(view === 'contest') {
  //   const uniqueProblemIndexes: Set<string> = new Set<string>();
  //   const contestMap = new Map<string, Contest>();
  //   problems.forEach(problem => {
  //     let contest = contestMap.get(problem.contestId);
  //     if (!contest) {
  //       // const contestNumber = parseInt(problem.contestId.replace(/[^0-9]/g, '') || '0');
  //       contest = {
  //         id: problem.contestId,
  //         name: `${problem.contestId}`,
  //         problems: {},
  //       };
  //     }
  //     if(contest) {
  //       contest.problems[problem.problemIndex] = problem;
  //       contestMap.set(problem.contestId, contest);
  //       uniqueProblemIndexes.add(problem.problemIndex);
  //     }
  //   });
    
  //   problems = Array.from(contestMap.values()).sort((a, b) => {
  //     const comparison = a.id.localeCompare(b.id);
  //     return order === 'asc' ? comparison : -comparison;
  //   });

  //   problemIndexes = Array.from(uniqueProblemIndexes).sort((a, b) => {
  //     const isANumber = !isNaN(parseInt(a));
  //     const isBNumber = !isNaN(parseInt(b));

  //     if (isANumber && !isBNumber) return -1;
  //     if (!isANumber && isBNumber) return 1;

  //     if (a.length !== b.length) {
  //       return a.length - b.length
  //     }

  //     return a.localeCompare(b);
  //   })
  // }

  // // return (
  // //   <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
  // //     <main className="container mx-auto px-4 py-8 space-y-8">
  // //       <ProblemStats stats={stats} />
  // //       <Suspense fallback={<div>Loading filters...</div>}>
  // //         <ProblemsFilters 
  // //           searchParams={searchParams}
  // //           availableTags={availableTags}
  // //         />
  // //       </Suspense>
  // //       <Suspense fallback={<div>Loading problems...</div>}>
  // //         <ProblemsDisplay
  // //           problems={problems}
  // //           problemIndexes={problemIndexes}
  // //           totalProblems={totalProblems}
  // //           viewMode={view}
  // //           currentPage={currentPage}
  // //           itemsPerPage={itemsPerPage}
  // //           searchParams={searchParams}
  // //         />
  // //       </Suspense>
  // //     </main>
  // //   </div>
  // // );

  return (
    <div className="bg-gradient-to-br from-slate-50 to-blue-50 h-full">
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* <ProblemStats stats={stats} />
        <Suspense fallback={<div>Loading filters...</div>}>
          <ProblemsFilters 
            searchParams={searchParams}
            availableTags={availableTags}
          />
        </Suspense> */}
        <Suspense fallback={<div className="text-center p-8">Loading problems...</div>}>
          {view === 'contest' && <FetchContestData searchParams={searchParams} />}
        </Suspense>
      </div>
    </div>
  )
}