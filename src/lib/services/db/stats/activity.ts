import { prisma } from '@/lib/prisma';

export interface ActivityData {
    id: number;
    epochSecond: number;
    problemId: string;
    contestId: string;
    title: string;
    result: string;
    difficulty: number | null;
}

export async function getRecentActivity(userId: string): Promise<ActivityData[]> {
    const submissions = await prisma.submission.findMany({
        where: { userId },
        take: 10,
        orderBy: { epochSecond: 'desc' },
        include: {
            problem: true,
        },
    });

    return submissions.map(s => ({
        id: s.id,
        epochSecond: s.epochSecond,
        problemId: s.problemId,
        contestId: s.contestId,
        title: s.problem.name,
        result: s.result,
        difficulty: s.problem.difficulty,
    }));
}
