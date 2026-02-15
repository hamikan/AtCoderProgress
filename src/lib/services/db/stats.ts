import { prisma } from '@/lib/prisma';
import { startOfMonth, subDays, format, differenceInDays } from 'date-fns';

export interface UserStats {
    acCount: number;
    acCountChange: number;
    currentRating: number;
    currentRatingChange: number;
    highestRating: number;
    monthlySolved: number;
    monthlySolvedChange: number;
    currentStreak: number;
    currentStreakChange: number;
}

export async function getUserStats(userId: string): Promise<UserStats> {
    const now = new Date();
    const startOfCurrentMonth = startOfMonth(now);
    const startOfLastMonth = startOfMonth(subDays(startOfCurrentMonth, 1));
    const startOfCurrentMonthEpoch = Math.floor(startOfCurrentMonth.getTime() / 1000);
    const startOfLastMonthEpoch = Math.floor(startOfLastMonth.getTime() / 1000);

    // 1. Total AC Count (Unique Problems) & Monthly/Last Month Solved
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
            epochSecond: 'asc', // Ascending order required for First AC logic
        },
    });

    const uniqueAcProblemIds = new Set<string>();
    const firstAcMap = new Map<string, number>(); // problemId -> epochSecond

    acSubmissions.forEach(s => {
        if (!firstAcMap.has(s.problemId)) {
            firstAcMap.set(s.problemId, s.epochSecond);
            uniqueAcProblemIds.add(s.problemId);
        }
    });

    const acCount = uniqueAcProblemIds.size;

    // 1. Monthly Solved (Activity: Unique Problems solved IN this month, regardless of past)
    const monthlyActivitySet = new Set<string>();
    const lastMonthActivitySet = new Set<string>();

    acSubmissions.forEach(s => {
        if (s.epochSecond >= startOfCurrentMonthEpoch) {
            monthlyActivitySet.add(s.problemId);
        } else if (s.epochSecond >= startOfLastMonthEpoch) {
            lastMonthActivitySet.add(s.problemId);
        }
    });

    const monthlySolved = monthlyActivitySet.size;
    const lastMonthSolved = lastMonthActivitySet.size;
    const monthlySolvedChange = monthlySolved - lastMonthSolved;

    // 2. AC Count Change (Growth: New Unique Problems added to Total this month)
    // This equals count of First ACs that occurred this month.
    let newUniqueThisMonth = 0;
    for (const epoch of firstAcMap.values()) {
        if (epoch >= startOfCurrentMonthEpoch) {
            newUniqueThisMonth++;
        }
    }
    const acCountChange = newUniqueThisMonth;

    // 2. Rating Info
    const ratingHistory = await prisma.userRatingHistory.findMany({
        where: { userId },
        orderBy: { endTime: 'desc' },
    });

    const currentRating = ratingHistory.length > 0 ? ratingHistory[0].newRating : 0;
    const highestRating = ratingHistory.reduce((max, r) => Math.max(max, r.newRating), 0);

    // Rating Change (vs End of Last Month)
    // Find latest rating before start of current month
    const lastMonthRatingEntry = ratingHistory.find(r => r.endTime < startOfCurrentMonth);
    const lastMonthRating = lastMonthRatingEntry ? lastMonthRatingEntry.newRating : 0; // Or 0 if no history before
    // If no history before this month, and we have rating now, change is (current - 0) or (current - initial)? 
    // Usually (current - last_known_before_period).
    const currentRatingChange = currentRating - lastMonthRating;

    // 4. Current Streak (Simplified Logic as before)
    // Streak is based on Activity (Any AC), not necessarily First AC.
    const acDates = new Set<string>();
    acSubmissions.forEach(s => {
        const date = new Date(s.epochSecond * 1000);
        acDates.add(format(date, 'yyyy-MM-dd'));
    });

    let currentStreak = 0;

    // Check from today or yesterday
    let sDate = now;
    if (!acDates.has(format(sDate, 'yyyy-MM-dd'))) {
        sDate = subDays(sDate, 1);
    }

    if (acDates.has(format(sDate, 'yyyy-MM-dd'))) {
        currentStreak = 1;
        while (true) {
            sDate = subDays(sDate, 1);
            if (acDates.has(format(sDate, 'yyyy-MM-dd'))) {
                currentStreak++;
            } else {
                break;
            }
        }
    } else {
        currentStreak = 0;
    }

    // Streak Change is tricky. Usually we just show current streak. 
    // Let's return 0 or maybe just "same" logic handling in UI?
    // For now, let's say change is 0 (neutral) or +1 if active? 
    // Let's just pass 0 and handle text in UI.
    const currentStreakChange = 0;

    return {
        acCount,
        acCountChange,
        currentRating,
        currentRatingChange,
        highestRating,
        monthlySolved,
        monthlySolvedChange,
        currentStreak,
        currentStreakChange,
    };
}

export async function getRatingHistoryData(userId: string) {
    const history = await prisma.userRatingHistory.findMany({
        where: { userId },
        orderBy: { endTime: 'asc' },
        select: {
            endTime: true,
            newRating: true,
            contestName: true,
        },
    });

    return history.map((h) => ({
        date: format(h.endTime, 'yyyy-MM-dd'),
        rating: h.newRating,
        contestName: h.contestName,
    }));
}

export async function getDifficultyPieData(userId: string) {
    // Need to join Submission with Problem to get difficulty
    // Only Unique ACs
    const acSubmissions = await prisma.submission.findMany({
        where: {
            userId,
            result: 'AC',
        },
        include: {
            problem: true, // Need difficulty
        },
        orderBy: {
            id: 'desc' // Latest first
        }
    });

    // Unique problems only
    const uniqueProblems = new Map<string, number>(); // problemId -> difficulty
    acSubmissions.forEach(s => {
        if (s.problem.difficulty !== null) {
            uniqueProblems.set(s.problemId, s.problem.difficulty);
        }
    });

    // Aggregation by color
    // Colors: 
    // Gray: 0-399
    // Brown: 400-799
    // Green: 800-1199
    // Cyan: 1200-1599
    // Blue: 1600-1999
    // Yellow: 2000-2399
    // Orange: 2400-2799
    // Red: 2800+
    const counts = {
        Gray: 0,
        Brown: 0,
        Green: 0,
        Cyan: 0,
        Blue: 0,
        Yellow: 0,
        Orange: 0,
        Red: 0,
    };

    uniqueProblems.forEach((diff) => {
        if (diff < 400) counts.Gray++;
        else if (diff < 800) counts.Brown++;
        else if (diff < 1200) counts.Green++;
        else if (diff < 1600) counts.Cyan++;
        else if (diff < 2000) counts.Blue++;
        else if (diff < 2400) counts.Yellow++;
        else if (diff < 2800) counts.Orange++;
        else counts.Red++;
    });

    // Check if non-zero to return
    const result = [];
    const colors: Record<string, string> = {
        Gray: '#808080',
        Brown: '#804000',
        Green: '#008000',
        Cyan: '#00C0C0',
        Blue: '#0000FF',
        Yellow: '#C0C000',
        Orange: '#FF8000',
        Red: '#FF0000',
    };

    for (const [key, value] of Object.entries(counts)) {
        if (value > 0) {
            result.push({
                name: key,
                value,
                fill: colors[key],
            });
        }
    }

    return result;
}

export async function getHeatmapData(userId: string) {
    // Last 365 days
    const now = new Date();
    const start = subDays(now, 365);
    const startEpoch = Math.floor(start.getTime() / 1000);

    const acSubmissions = await prisma.submission.findMany({
        where: {
            userId,
            result: 'AC',
            epochSecond: { gte: startEpoch },
        },
        select: {
            epochSecond: true,
            problemId: true, // For uniqueness check per day if needed? Actually heatmap usually counts total submissions or unique ACs/day. 
            // AtCoder usually counts unique ACs per day for "Streak", but let's count unique ACs per day.
        },
    });

    // Map: YYYY-MM-DD -> count
    const dailyCounts = new Map<string, Set<string>>(); // date -> Set<problemId>

    acSubmissions.forEach(s => {
        const dateStr = format(new Date(s.epochSecond * 1000), 'yyyy-MM-dd');
        if (!dailyCounts.has(dateStr)) dailyCounts.set(dateStr, new Set());
        dailyCounts.get(dateStr)?.add(s.problemId);
    });

    const data: { date: string; count: number; level: number }[] = [];

    // Fill all days? Or just present ones? Component handles missing days usually, but let's return sparse or full?
    // Existing heatmap component expects array of days. Let's return sparse data and let component handle or simple array.
    // The existing mock returned full 365 days. Let's stick to that for safety.

    for (let i = 0; i <= 365; i++) {
        const d = subDays(now, 365 - i);
        const dateStr = format(d, 'yyyy-MM-dd');
        const count = dailyCounts.get(dateStr)?.size || 0;

        let level = 0;
        if (count === 0) level = 0;
        else if (count <= 1) level = 1;
        else if (count <= 3) level = 2;
        else if (count <= 5) level = 3;
        else level = 4;

        data.push({ date: dateStr, count, level });
    }

    return data;
}

export async function getRecentActivity(userId: string) {
    // Recent submissions (AC or not? User asked for "Recent Activity". Usually ACs or Attempts)
    // Let's fetch last 10 submissions.
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
        title: s.problem.name || s.problemId,
        result: s.result,
        language: s.language,
        point: s.point,
        difficulty: s.problem.difficulty,
    }));
}

export interface TagStat {
    name: string;
    score: number;
    total: number;
    solved: number;
}

export async function getTagStats(userId: string): Promise<TagStat[]> {
    // 1. Get all UserTags created by the user that are linked to a master Tag
    const userTags = await prisma.userTag.findMany({
        where: {
            createdById: userId,
            tagId: { not: null }
        },
        include: { parentTag: true }
    });

    const stats: TagStat[] = [];
    const processedTagIds = new Set<string>();

    // Process UserTags (Custom tags linked to master tags)
    for (const userTag of userTags) {
        if (!userTag.tagId) continue;
        if (processedTagIds.has(userTag.tagId)) continue;
        processedTagIds.add(userTag.tagId);

        const stat = await calculateTagStats(userId, userTag.tagId, userTag.name);
        if (stat) stats.push(stat);
    }

    // 2. Get all Master Tags and process those NOT yet processed (Unlinked tags)
    const allMasterTags = await prisma.tag.findMany();

    for (const masterTag of allMasterTags) {
        if (processedTagIds.has(masterTag.id)) continue;

        // Use master tag name for unlinked tags
        const stat = await calculateTagStats(userId, masterTag.id, masterTag.name);
        if (stat) stats.push(stat);
    }

    // Sort by score descending
    return stats.sort((a, b) => b.score - a.score);
}

async function calculateTagStats(userId: string, tagId: string, displayName: string): Promise<TagStat | null> {
    // Denominator: Total problems associated with the tag
    const totalProblemsCount = await prisma.problemTag.count({
        where: { tagId: tagId }
    });

    if (totalProblemsCount === 0) return null;

    // Numerator: Problems with this tag AND solved by the user
    const solvedCount = await prisma.problem.count({
        where: {
            problemTags: {
                some: { tagId: tagId }
            },
            OR: [
                {
                    submissions: {
                        some: {
                            userId: userId,
                            result: 'AC'
                        }
                    }
                },
                {
                    solutions: {
                        some: {
                            userId: userId,
                            status: {
                                in: ['AC', 'SELF_AC', 'EXPLANATION_AC', 'REVIEW_AC']
                            }
                        }
                    }
                }
            ]
        }
    });

    // Calculate score (percentage)
    const score = Math.round((solvedCount / totalProblemsCount) * 100);

    return {
        name: displayName,
        score,
        total: totalProblemsCount,
        solved: solvedCount
    };

}
