import { prisma } from '@/lib/prisma';
import { subDays, format } from 'date-fns';

export interface HeatmapData {
    date: string;
    count: number;
    level: number;
}

export async function getHeatmapData(userId: string): Promise<HeatmapData[]> {
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
            problemId: true,
        },
    });

    const dailyCounts = new Map<string, Set<string>>();

    acSubmissions.forEach(s => {
        const dateStr = format(new Date(s.epochSecond * 1000), 'yyyy-MM-dd');
        if (!dailyCounts.has(dateStr)) dailyCounts.set(dateStr, new Set());
        dailyCounts.get(dateStr)?.add(s.problemId);
    });

    const data: HeatmapData[] = [];

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
