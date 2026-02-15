
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ------------------------------------------------------------------
// CONFIGURATION
// ------------------------------------------------------------------
// ここに追加したいタグを定義してください。
// name: タグ名
// probability: 全問題のうち、このタグが付与される確率（0.0 ~ 1.0）
//              ※ 実際の運用では外部データ等を使いますが、
//                 今回はテスト用にランダムに問題に紐付けます。
const TARGET_TAGS = [
    { name: 'DP', probability: 0.2 },
    { name: 'DFS', probability: 0.15 },
    { name: 'BFS', probability: 0.1 },
    { name: 'UF', probability: 0.15 },
    { name: 'BIT', probability: 0.05 },
    { name: '実装', probability: 0.2 },
    { name: 'ローリングハッシュ', probability: 0.1 },
    { name: '二分探索', probability: 0.1 },
    { name: 'FPS', probability: 0.15 },
    { name: '幾何', probability: 0.05 },
];

// ユーザーID（自分のIDを指定することで、ユーザータグも同時に作成します）
// ※ Prisma Studioなどで確認した自分のUser IDに変更してください。
//   デフォルトではシードで作成されるユーザーIDなどを想定していますが、
//   既存のユーザーがいる場合はそのIDを使用します。
const TARGET_USER_ID = "cmlc050eh0000boj0t6e78lr8"; // Default seed user ID based on prisma/seed.ts

// ------------------------------------------------------------------

async function main() {
    console.info('Start seeding tags...');

    // 1. Get all problems to randomly assign tags
    const problems = await prisma.problem.findMany({
        select: { id: true },
    });
    console.info(`Found ${problems.length} problems.`);

    // 2. Process each tag
    for (const tagConfig of TARGET_TAGS) {
        console.info(`Processing tag: ${tagConfig.name}`);

        // 2-1. Upsert Tag (Master)
        const tag = await prisma.tag.upsert({
            where: { name: tagConfig.name },
            update: {},
            create: { name: tagConfig.name },
        });

        // 2-2. Create UserTag linked to this Tag (if userId is provided)
        if (TARGET_USER_ID) {
            // Check if user exists
            const user = await prisma.user.findUnique({ where: { id: TARGET_USER_ID } });
            if (user) {
                await prisma.userTag.upsert({
                    where: {
                        createdById_name: {
                            createdById: user.id,
                            name: tagConfig.name,
                        },
                    },
                    update: {
                        tagId: tag.id, // Link to master tag
                    },
                    create: {
                        createdById: user.id,
                        name: tagConfig.name,
                        tagId: tag.id,
                    },
                });
            } else {
                console.warn(`User ${TARGET_USER_ID} not found. Skipping UserTag creation.`);
            }
        }

        // 2-3. Link Tag to Problems (ProblemTag)
        // Randomly select problems based on probability
        const targetProblems = problems.filter(() => Math.random() < tagConfig.probability);

        console.info(`  - Assigning to ${targetProblems.length} problems...`);

        let count = 0;
        for (const problem of targetProblems) {
            await prisma.problemTag.upsert({
                where: {
                    problemId_tagId: {
                        problemId: problem.id,
                        tagId: tag.id,
                    },
                },
                update: {},
                create: {
                    problemId: problem.id,
                    tagId: tag.id,
                },
            });
            count++;
        }
        console.info(`  - Assigned.`);
    }

    console.info('Seeding tags finished.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
