import './load-env';

import { UTApi } from 'uploadthing/server';

import { prisma } from '@/lib/prisma';
import {
  extractUploadThingFileKeys,
  formatBytes,
  selectCleanupCandidates,
  type UploadThingFileInfo,
} from '@/lib/uploadthing-cleanup';

const LIST_PAGE_SIZE = 500;
const DELETE_CHUNK_SIZE = 100;
const DEFAULT_MIN_AGE_DAYS = 7;

interface CliOptions {
  execute: boolean;
  minAgeDays: number;
}

function parseArgs(argv: string[]): CliOptions {
  let execute = false;
  let minAgeDays = DEFAULT_MIN_AGE_DAYS;

  for (const arg of argv) {
    if (arg === '--execute') {
      execute = true;
    } else if (arg.startsWith('--days=')) {
      const value = Number(arg.slice('--days='.length));
      if (!Number.isFinite(value) || value < 0) {
        throw new Error(`--days の値が不正です: ${arg}`);
      }
      minAgeDays = value;
    } else {
      throw new Error(`不明な引数です: ${arg}`);
    }
  }

  return { execute, minAgeDays };
}

function describeDatabaseTarget(): string {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    return 'DATABASE_URL が未設定です';
  }
  try {
    const parsed = new URL(databaseUrl);
    const database = parsed.pathname.replace(/^\//, '');
    return `${parsed.hostname}:${parsed.port || '5432'} / ${database}`;
  } catch {
    return 'DATABASE_URL の形式を解釈できませんでした';
  }
}

interface UploadThingTokenInfo {
  apiKey?: string;
  appId?: string;
}

// UPLOADTHING_TOKEN は apiKey と appId を含む base64 の JSON。v6 の sk_ 形式ならそのまま API キーとして使う
function parseUploadThingToken(
  token: string | undefined
): UploadThingTokenInfo {
  if (!token) {
    return {};
  }
  if (token.startsWith('sk_')) {
    return { apiKey: token };
  }
  try {
    const decoded = JSON.parse(
      Buffer.from(token, 'base64').toString('utf-8')
    ) as { apiKey?: string; appId?: string };
    return { apiKey: decoded.apiKey, appId: decoded.appId };
  } catch {
    return {};
  }
}

interface RawFileEntry {
  key?: unknown;
  name?: unknown;
  size?: unknown;
  uploadedAt?: unknown;
  status?: unknown;
}

// SDK の UTApi.listFiles は size と uploadedAt を返さないので、同じ REST API を直接呼ぶ
async function listAllFiles(apiKey: string): Promise<UploadThingFileInfo[]> {
  const files: UploadThingFileInfo[] = [];
  let offset = 0;

  for (;;) {
    const response = await fetch('https://uploadthing.com/api/listFiles', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-uploadthing-api-key': apiKey,
      },
      body: JSON.stringify({ limit: LIST_PAGE_SIZE, offset }),
    });
    if (!response.ok) {
      throw new Error(
        `UploadThing の一覧取得に失敗しました (HTTP ${response.status})`
      );
    }

    const data = (await response.json()) as {
      hasMore?: boolean;
      files?: RawFileEntry[];
    };
    const page = data.files ?? [];

    for (const entry of page) {
      if (
        typeof entry.key !== 'string' ||
        typeof entry.size !== 'number' ||
        typeof entry.uploadedAt !== 'number'
      ) {
        throw new Error(
          'UploadThing の一覧応答に size / uploadedAt が含まれていません。' +
            'サイズと日数を判定できないため、安全のため中止します。'
        );
      }
      files.push({
        key: entry.key,
        name: typeof entry.name === 'string' ? entry.name : '',
        size: entry.size,
        // API が秒単位で返す場合はミリ秒へそろえる（1e12 未満は秒とみなす）。
        uploadedAt: entry.uploadedAt < 1e12 ? entry.uploadedAt * 1000 : entry.uploadedAt,
        status: typeof entry.status === 'string' ? entry.status : '',
      });
    }

    if (!data.hasMore || page.length === 0) {
      break;
    }
    offset += page.length;
  }

  return files;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const tokenInfo = parseUploadThingToken(process.env.UPLOADTHING_TOKEN);

  console.log('=== UploadThing 未使用画像クリーンアップ ===');
  console.log(`DB 接続先: ${describeDatabaseTarget()}`);
  console.log(
    `UploadThing アプリID: ${tokenInfo.appId ?? '（トークンから判別できませんでした）'}`
  );
  console.log(
    `モード: ${options.execute ? '削除を実行します (--execute)' : 'dry-run（候補の表示のみ）'}`
  );
  console.log(
    `条件: どの解法にも使われておらず、アップロードから ${options.minAgeDays} 日以上たった画像`
  );

  if (!tokenInfo.apiKey) {
    throw new Error(
      'UPLOADTHING_TOKEN から API キーを取り出せませんでした。.env.local か .env を確認してください。'
    );
  }

  const solutions = await prisma.solution.findMany({
    select: { content: true },
  });
  const usedKeys = extractUploadThingFileKeys(
    solutions.map((solution) => solution.content)
  );
  console.log(
    `解法 ${solutions.length} 件の本文から、使用中の画像キー ${usedKeys.size} 件を検出しました。`
  );

  const files = await listAllFiles(tokenInfo.apiKey);
  console.log(`UploadThing のファイル総数: ${files.length} 件`);

  const candidates = selectCleanupCandidates(files, usedKeys, {
    now: Date.now(),
    minAgeDays: options.minAgeDays,
  }).sort((a, b) => a.uploadedAt - b.uploadedAt);

  if (candidates.length === 0) {
    console.log('削除候補はありません。');
    return;
  }

  const totalBytes = candidates.reduce((sum, file) => sum + file.size, 0);
  console.log(`\n削除候補: ${candidates.length} 件（合計 ${formatBytes(totalBytes)}）`);
  for (const file of candidates) {
    const uploadedDate = new Date(file.uploadedAt).toISOString().slice(0, 10);
    console.log(
      `- ${file.key}  ${file.name}  ${formatBytes(file.size)}  ${uploadedDate}`
    );
  }

  if (!options.execute) {
    console.log(
      '\ndry-run のため削除はしていません。実際に消すには --execute を付けてください。'
    );
    return;
  }

  const utapi = new UTApi();
  let deletedCount = 0;
  for (let i = 0; i < candidates.length; i += DELETE_CHUNK_SIZE) {
    const chunk = candidates.slice(i, i + DELETE_CHUNK_SIZE);
    const result = await utapi.deleteFiles(chunk.map((file) => file.key));
    if (!result.success) {
      throw new Error(
        `削除に失敗しました（${deletedCount} 件は削除済み）。再実行すると残りの候補が表示されます。`
      );
    }
    deletedCount += result.deletedCount;
    console.log(`削除中... ${deletedCount} / ${candidates.length} 件`);
  }
  console.log(`削除が完了しました: ${deletedCount} 件`);
}

main()
  .catch((error) => {
    console.error('クリーンアップに失敗しました:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
