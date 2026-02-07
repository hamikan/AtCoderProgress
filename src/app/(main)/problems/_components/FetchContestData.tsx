import { getContestsFromDB } from '@/lib/services/db/contest'
import ContestTable from '@/components/problem/ContestTable';
import ProblemStats from '@/components/problem/ProblemStats';
import { getSubmissionSummary } from '@/lib/services/db/submission';

const getProblemIndexes = (contestType: 'abc' | 'arc' | 'agc') => {
  switch (contestType) {
    case 'abc': return ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H/Ex'];
    case 'arc': return ['A', 'B', 'C', 'D', 'E', 'F', 'F2'];
    case 'agc': return ['A', 'B', 'C', 'D', 'E', 'F', 'F2'];
  }
};

interface ProblemsPageProps {
  filters: {
    contestType?: 'abc' | 'arc' | 'agc';
    order?: 'asc' | 'desc';
  };
  userId?: string;
}

export async function FetchContestData({ filters, userId }: ProblemsPageProps) {
  const {
    contestType = 'abc',
    order = 'desc'
  } = filters;

  const { contests, totalProblems } = await getContestsFromDB(contestType, order);
  const problemIndexes = getProblemIndexes(contestType)

  let submissionStatusMap = {};
  let acCount = 0;
  let tryingCount = 0;

  if (userId) {
    const summary = await getSubmissionSummary(userId, contestType);
    submissionStatusMap = summary.statusMap;
    acCount = summary.acCount;
    tryingCount = summary.tryingCount;
  }

  const stats = {
    total: totalProblems,
    ac: acCount,
    trying: tryingCount,
    unsolved: totalProblems - acCount - tryingCount,
  };

  const contestTableProps = {
    contests,
    problemIndexes,
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
