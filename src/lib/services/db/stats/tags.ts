import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export interface TagStat {
    tagId: string;
    name: string;
    score: number;
    total: number;
    solved: number;
    type: 'official' | 'unofficial';
}

export async function getTagStats(userId: string, problemWhere?: Prisma.ProblemWhereInput): Promise<TagStat[]> {
    const stats: TagStat[] = [];
    const processedTagIds = new Set<string>();

    const userTags = await prisma.userTag.findMany({
        where: { createdById: userId },
        include: { parentTag: true }
    });

    const masterTags = await prisma.tag.findMany();

    const totalsByTag = await prisma.problemTag.groupBy({
        by: ['tagId'],
        _count: { _all: true },
        where: { problem: problemWhere }
    });

    const solvedByTag = await prisma.problemTag.groupBy({
        by: ['tagId'],
        _count: { _all: true },
        where: {
            problem: {
                ...problemWhere,
                OR: [
                    { submissions: { some: { userId, result: 'AC' } } },
                    { solutions: { some: { userId, status: { in: ['AC', 'SELF_AC', 'EXPLANATION_AC', 'REVIEW_AC'] } } } }
                ]
            }
        }
    });

    const totalMap = new Map(totalsByTag.map(t => [t.tagId, t._count._all]));
    const solvedMap = new Map(solvedByTag.map(t => [t.tagId, t._count._all]));

    const unlinkedUserTags: typeof userTags = [];

    for (const userTag of userTags) {
        if (!userTag.tagId) {
            unlinkedUserTags.push(userTag);
            continue;
        }
        processedTagIds.add(userTag.tagId);

        const total = totalMap.get(userTag.tagId) || 0;
        if (total === 0) continue;

        const solved = solvedMap.get(userTag.tagId) || 0;
        const score = Math.round((solved / total) * 100);

        stats.push({
            tagId: userTag.tagId,
            name: userTag.name,
            score,
            total,
            solved,
            type: 'official'
        });
    }

    for (const masterTag of masterTags) {
        if (processedTagIds.has(masterTag.id)) continue;

        const total = totalMap.get(masterTag.id) || 0;
        if (total === 0) continue;

        const solved = solvedMap.get(masterTag.id) || 0;
        const score = Math.round((solved / total) * 100);

        stats.push({
            tagId: masterTag.id,
            name: masterTag.name,
            score,
            total,
            solved,
            type: 'official'
        });
    }

    if (unlinkedUserTags.length > 0) {
        const idToName = new Map(unlinkedUserTags.map(ut => [ut.id, ut.name]));

        const allSolutionUserTags = await prisma.solutionUserTag.findMany({
            where: { userTagId: { in: unlinkedUserTags.map(ut => ut.id) } },
            include: { solution: { select: { problemId: true } } }
        });

        const problemsByTagId = new Map<string, Set<string>>();
        const allProblemIds = new Set<string>();
        for (const sut of allSolutionUserTags) {
            if (!problemsByTagId.has(sut.userTagId)) problemsByTagId.set(sut.userTagId, new Set());
            problemsByTagId.get(sut.userTagId)!.add(sut.solution.problemId);
            allProblemIds.add(sut.solution.problemId);
        }

        const solvedIds = new Set(
            allProblemIds.size > 0
                ? (await prisma.problem.findMany({
                    where: {
                        id: { in: [...allProblemIds] },
                        ...problemWhere,
                        OR: [
                            { submissions: { some: { userId, result: 'AC' } } },
                            { solutions: { some: { userId, status: { in: ['AC', 'SELF_AC', 'EXPLANATION_AC', 'REVIEW_AC'] } } } }
                        ]
                    },
                    select: { id: true }
                })).map(p => p.id)
                : []
        );

        for (const [tagId, pids] of problemsByTagId) {
            if (pids.size === 0) continue;
            const solved = [...pids].filter(id => solvedIds.has(id)).length;
            const score = Math.round((solved / pids.size) * 100);
            stats.push({
                tagId,
                name: idToName.get(tagId)!,
                score,
                total: pids.size,
                solved,
                type: 'unofficial'
            });
        }
    }

    return stats.sort((a, b) => b.score - a.score);
}
