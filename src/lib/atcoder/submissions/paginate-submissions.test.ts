import assert from 'node:assert/strict';
import test from 'node:test';

import { collectSubmissions, forEachSubmissionPage } from './paginate-submissions';
import type { RawSubmission } from './types';

function submission(id: number, epochSecond: number): RawSubmission {
  return {
    id,
    epoch_second: epochSecond,
    problem_id: 'abc001_a',
    contest_id: 'abc001',
    user_id: 'someone',
    language: 'Python',
    point: 100,
    length: 10,
    result: 'AC',
    execution_time: 10,
  };
}

function range(from: number, to: number, epochSecond: number): RawSubmission[] {
  return Array.from({ length: to - from + 1 }, (_, i) =>
    submission(from + i, epochSecond)
  );
}

test('collectSubmissions keeps submissions that share the page-boundary second', async () => {
  // 1ページ目が 200 秒の途中（id 4, 5）で終わり、同じ秒の id 6 は次のページにある。+1 だと id 6 を取りこぼしていた
  const pages = new Map<number, RawSubmission[]>([
    [0, [...range(1, 3, 100), ...range(4, 5, 200)]],
    [200, [...range(4, 5, 200), submission(6, 200)]],
  ]);
  const fetchPage = async (cursor: number) => pages.get(cursor) ?? [];

  const result = await collectSubmissions(fetchPage, 0, { pageSize: 5 });

  assert.deepEqual(
    result.map((item) => item.id),
    [1, 2, 3, 4, 5, 6]
  );
});

test('collectSubmissions deduplicates repeated ids inside one page', async () => {
  const fetchPage = async () => [
    submission(1, 100),
    submission(1, 100),
    submission(2, 100),
  ];

  const result = await collectSubmissions(fetchPage, 0, { pageSize: 500 });

  assert.deepEqual(
    result.map((item) => item.id),
    [1, 2]
  );
});

test('collectSubmissions stops when a full page makes no progress', async () => {
  let calls = 0;
  const fetchPage = async () => {
    calls += 1;
    return range(1, 5, 300);
  };

  const result = await collectSubmissions(fetchPage, 0, { pageSize: 5 });

  assert.equal(result.length, 5);
  assert.equal(calls, 2);
});

test('collectSubmissions throws when the page limit is exceeded', async () => {
  let nextId = 1;
  const fetchPage = async () => {
    const items = range(nextId, nextId + 4, nextId * 10);
    nextId += 5;
    return items;
  };

  await assert.rejects(
    collectSubmissions(fetchPage, 0, { pageSize: 5, maxPages: 3 }),
    /pagination limit exceeded/
  );
});

test('collectSubmissions throws when the response goes backwards', async () => {
  const fetchPage = async () => range(1, 5, 50);

  await assert.rejects(
    collectSubmissions(fetchPage, 100, { pageSize: 5 }),
    /Invalid submission pagination response/
  );
});

test('forEachSubmissionPage hands over each page as soon as it arrives', async () => {
  const pages = [
    [submission(1, 10), submission(2, 20)],
    [submission(2, 20), submission(3, 30)],
    [submission(3, 30)],
  ];
  const handled: number[][] = [];
  let index = 0;

  await forEachSubmissionPage(
    async () => pages[index++],
    0,
    (newSubmissions) => {
      handled.push(newSubmissions.map((item) => item.id));
    },
    { pageSize: 2 }
  );

  assert.deepEqual(handled, [[1, 2], [3]]);
});

test('forEachSubmissionPage stops fetching when the handler throws', async () => {
  let fetchCount = 0;

  await assert.rejects(
    forEachSubmissionPage(
      async () => {
        fetchCount += 1;
        return [submission(fetchCount, fetchCount), submission(fetchCount + 100, fetchCount)];
      },
      0,
      () => {
        throw new Error('stop');
      },
      { pageSize: 2 }
    ),
    /stop/
  );

  assert.equal(fetchCount, 1);
});
