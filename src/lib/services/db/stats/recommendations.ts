import { prisma } from '@/lib/prisma';
import { SolutionStatus, Prisma } from '@prisma/client';
import { subDays } from 'date-fns';
import { getUserStats } from './user';
import { getTagStats } from './tags';

export interface RecommendedProblem {
    id: string;
    name: string;
    difficulty: number | null;
    contestId: string;
    reason: string;
}

export async function getRecommendedProblems(userId: string): Promise<{ unsolved: RecommendedProblem[]; solved: RecommendedProblem[] }> {
    const userStats = await getUserStats(userId);
    const currentRating = userStats.currentRating;

    const difficultyFilter = {
        gte: Math.max(0, currentRating - 100),
        lte: currentRating + 400,
    };

    const [unsolved, solved] = await Promise.all([
        getUnsolvedRecommendations(userId, difficultyFilter),
        getSolvedRecommendations(userId, difficultyFilter)
    ]);

    return { unsolved, solved };
}

async function getUnsolvedRecommendations(userId: string, difficultyFilter: Prisma.IntFilter): Promise<RecommendedProblem[]> {
    const rangeTagStats = await getTagStats(userId, { difficulty: difficultyFilter });

    const validTags = rangeTagStats.filter(t => t.total >= 5 && t.type === 'official');
    validTags.sort((a, b) => a.score - b.score);

    const tagBonusMap = new Map(validTags.map(tag => [tag.tagId, (100 - tag.score) / 100]));

    const unsolvedWhere = {
        difficulty: difficultyFilter,
        NOT: {
            OR: [
                { submissions: { some: { userId, result: 'AC' } } },
                { solutions: { some: { userId, status: { in: [SolutionStatus.AC, SolutionStatus.SELF_AC, SolutionStatus.EXPLANATION_AC, SolutionStatus.REVIEW_AC] } } } }
            ]
        }
    };

    const [unsolvedProblems, starsAgg] = await Promise.all([
        prisma.problem.findMany({
            where: unsolvedWhere,
            include: { problemTags: { select: { tagId: true } } }
        }),
        prisma.problemReview.groupBy({
            by: ['problemId'],
            where: { problem: unsolvedWhere },
            _avg: { stars: true }
        })
    ]);

    if (unsolvedProblems.length === 0) return [];

    const starsMap = new Map(starsAgg.map(s => [s.problemId, s._avg.stars ?? 3]));

    const scoredCandidates = unsolvedProblems.map(problem => {
        const stars = starsMap.get(problem.id) ?? 3;
        const tagBonus = problem.problemTags.reduce((max, pt) => Math.max(max, tagBonusMap.get(pt.tagId) ?? 0), 0);
        const score = stars + tagBonus + (Math.random() * 0.5);
        return { problem, score, stars, tagBonus };
    });

    scoredCandidates.sort((a, b) => b.score - a.score);

    return scoredCandidates.slice(0, 2).map(c => ({
        id: c.problem.id,
        name: c.problem.name,
        difficulty: c.problem.difficulty,
        contestId: c.problem.firstContestId,
        reason: `★:${c.stars.toFixed(1)}`,
    }));
}



async function getSolvedRecommendations(userId: string, difficultyFilter: Prisma.IntFilter): Promise<RecommendedProblem[]> {
    const oneMonthAgoEpoch = Math.floor(subDays(new Date(), 30).getTime() / 1000);

    const [acSubmissions, myReviews, starsAgg] = await Promise.all([
        prisma.submission.groupBy({
            by: ['problemId'],
            where: { userId, result: 'AC', problem: { difficulty: difficultyFilter } },
            _max: { epochSecond: true }
        }),
        prisma.problemReview.findMany({ where: { userId } }),
        prisma.problemReview.groupBy({
            by: ['problemId'],
            _avg: { stars: true }
        })
    ]);

    const candidateIds = acSubmissions
        .filter(s => s._max.epochSecond! < oneMonthAgoEpoch)
        .map(s => s.problemId);

    if (candidateIds.length === 0) return [];

    const problems = await prisma.problem.findMany({ where: { id: { in: candidateIds } } });

    const lastAcMap = new Map(acSubmissions.map(s => [s.problemId, s._max.epochSecond ?? 0]));
    const myPriorityMap = new Map(myReviews.map(r => [r.problemId, r.reviewPriority]));
    const avgStarsMap = new Map(starsAgg.map(s => [s.problemId, s._avg.stars ?? 3]));
    const currentEpoch = Math.floor(Date.now() / 1000);

    const scoredCandidates = problems.map(problem => {
        const lastEpoch = lastAcMap.get(problem.id) ?? 0;
        const priority = myPriorityMap.get(problem.id) ?? 3;
        const avgStars = avgStarsMap.get(problem.id) ?? 3;
        const days = Math.floor((currentEpoch - lastEpoch) / 86400);
        const score = (priority * 100) + (avgStars * 10) + days;
        return { problem, score, priority, avgStars, days };
    });

    scoredCandidates.sort((a, b) => b.score - a.score);

    return scoredCandidates.slice(0, 2).map(c => ({
        id: c.problem.id,
        name: c.problem.name,
        difficulty: c.problem.difficulty,
        contestId: c.problem.firstContestId,
        reason: `振り返り優先度:${c.priority},  ★:${c.avgStars.toFixed(1)}, ${c.days}d ago`,
    }));
}

