import { prisma } from '@/lib/prisma';
import ProblemsClientContent from '@/components/problems/ProblemsClientContent';

export default async function ProblemsPage() {
  const problems = await prisma.problem.findMany({
    orderBy: {
      contestId: 'desc', // 新しいコンテストから表示
    },
  });

  return (
    <ProblemsClientContent problems={problems} />
  );
}
