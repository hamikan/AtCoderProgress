
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('--- Users ---');
    const users = await prisma.user.findMany({
        include: {
            _count: {
                select: { submissions: true, userTags: true }
            }
        }
    });
    console.table(users.map(u => ({
        id: u.id,
        name: u.name,
        submissions: u._count.submissions,
        userTags: u._count.userTags
    })));

    if (users.length === 0) {
        console.log('No users found.');
        return;
    }

    // Pick the user with most submissions or tags
    const targetUser = users.sort((a, b) => b._count.userTags - a._count.userTags)[0];
    console.log(`\nAnalyzing user: ${targetUser.name} (${targetUser.id})`);

    const userTags = await prisma.userTag.findMany({
        where: { createdById: targetUser.id, tagId: { not: null } },
        include: { parentTag: true }
    });

    console.log(`Found ${userTags.length} UserTags linked to MasterTags.`);

    for (const ut of userTags) {
        console.log(`\nTag: ${ut.name} (ID: ${ut.tagId})`);

        // Total problems with this tag
        const total = await prisma.problemTag.count({
            where: { tagId: ut.tagId! }
        });
        console.log(`  - Total Problems with Tag: ${total}`);

        // Solved problems with this tag
        const solved = await prisma.problem.count({
            where: {
                problemTags: { some: { tagId: ut.tagId! } },
                submissions: {
                    some: {
                        userId: targetUser.id,
                        result: 'AC'
                    }
                }
            }
        });
        console.log(`  - Solved Problems with Tag: ${solved}`);
        console.log(`  - Calculated Score: ${total > 0 ? Math.round(solved / total * 100) : 0}%`);

        // Check if there are ANY ACs for this user
        if (solved === 0 && total > 0) {
            // Debug: list a few ACs and a few Tagged problems to see why no overlap
            const someAcs = await prisma.submission.findMany({
                where: { userId: targetUser.id, result: 'AC' },
                take: 3,
                select: { problemId: true }
            });
            const someTagged = await prisma.problemTag.findMany({
                where: { tagId: ut.tagId! },
                take: 3,
                select: { problemId: true }
            });
            console.log('    (Debug) Sample AC ProblemIds:', someAcs.map(s => s.problemId));
            console.log('    (Debug) Sample Tagged ProblemIds:', someTagged.map(t => t.problemId));
        }
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
