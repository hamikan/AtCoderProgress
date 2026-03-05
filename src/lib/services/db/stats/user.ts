import { prisma } from '@/lib/prisma';
import { startOfMonth, subDays, format } from 'date-fns';

export interface UserStats {
    acCount: number;
    acCountChange: number;
    currentRating: number;
    currentRatingChange: number;
    highestRating: number;
    monthlySolved: number;
    monthlySolvedChange: number;
    currentStreak: number;
}

export async function getUserStats(userId: string): Promise<UserStats> {
    const now = new Date();
    const startOfCurrentMonth = startOfMonth(now);
    const startOfLastMonth = startOfMonth(subDays(startOfCurrentMonth, 1));
    const startOfCurrentMonthEpoch = Math.floor(startOfCurrentMonth.getTime() / 1000);
    const startOfLastMonthEpoch = Math.floor(startOfLastMonth.getTime() / 1000);

    const acSubmissions = await prisma.submission.findMany({
        where: {
            userId,
            result: 'AC',
        },
        select: {
            problemId: true,
            epochSecond: true,
        },
        orderBy: {
            epochSecond: 'asc',
        },
    });

    const uniqueAcProblemIds = new Set<string>();
    const firstAcMap = new Map<string, number>();
    const monthlyActivitySet = new Set<string>();
    const lastMonthActivitySet = new Set<string>();
    let newUniqueThisMonth = 0;
    const acDates = new Set<string>();

    acSubmissions.forEach(s => {
        if (!firstAcMap.has(s.problemId)) {
            firstAcMap.set(s.problemId, s.epochSecond);
            uniqueAcProblemIds.add(s.problemId);
            if (s.epochSecond >= startOfCurrentMonthEpoch) {
                newUniqueThisMonth++;
            }
        }
        if (s.epochSecond >= startOfCurrentMonthEpoch) {
            monthlyActivitySet.add(s.problemId);
        } else if (s.epochSecond >= startOfLastMonthEpoch) {
            lastMonthActivitySet.add(s.problemId);
        }
        acDates.add(format(new Date(s.epochSecond * 1000), 'yyyy-MM-dd'));
    });

    const acCount = uniqueAcProblemIds.size;
    const monthlySolved = monthlyActivitySet.size;
    const lastMonthSolved = lastMonthActivitySet.size;
    const monthlySolvedChange = monthlySolved - lastMonthSolved;
    const acCountChange = newUniqueThisMonth;

    const ratingHistory = await prisma.userRatingHistory.findMany({
        where: { userId },
        orderBy: { endTime: 'desc' },
    });

    const currentRating = ratingHistory.length > 0 ? ratingHistory[0].newRating : 0;
    const highestRating = ratingHistory.reduce((max, r) => Math.max(max, r.newRating), 0);

    const lastMonthRatingEntry = ratingHistory.find(r => r.endTime < startOfCurrentMonth);
    const lastMonthRating = lastMonthRatingEntry ? lastMonthRatingEntry.newRating : 0;
    const currentRatingChange = currentRating - lastMonthRating;

    let currentStreak = 0;

    let sDate = now;
    if (!acDates.has(format(sDate, 'yyyy-MM-dd'))) {
        sDate = subDays(sDate, 1);
    }
    while (acDates.has(format(sDate, 'yyyy-MM-dd'))) {
        currentStreak++;
        sDate = subDays(sDate, 1);
    }

    return {
        acCount,
        acCountChange,
        currentRating,
        currentRatingChange,
        highestRating,
        monthlySolved,
        monthlySolvedChange,
        currentStreak,
    };
}
