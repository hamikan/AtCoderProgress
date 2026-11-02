import assert from 'node:assert/strict';
import test from 'node:test';

import {
  extractUploadThingFileKeys,
  formatBytes,
  selectCleanupCandidates,
  type UploadThingFileInfo,
} from './uploadthing-cleanup';

test('extractUploadThingFileKeys finds keys in current ufs.sh URLs inside editor JSON', () => {
  const content = JSON.stringify([
    {
      type: 'img',
      url: 'https://abc123xyz.ufs.sh/f/KEYone111',
      children: [{ text: '' }],
    },
    { type: 'p', children: [{ text: 'メモ https://def456.ufs.sh/f/KEYtwo222 です' }] },
  ]);

  assert.deepEqual(
    [...extractUploadThingFileKeys([content])].sort(),
    ['KEYone111', 'KEYtwo222']
  );
});

test('extractUploadThingFileKeys also recognizes legacy utfs.io URLs and escaped slashes', () => {
  const legacy = '{"url":"https://utfs.io/f/legacyKEY99"}';
  const escaped = '{"url":"https:\\/\\/app42.ufs.sh\\/f\\/escapedKEY7"}';

  assert.deepEqual(
    [...extractUploadThingFileKeys([legacy, escaped])].sort(),
    ['escapedKEY7', 'legacyKEY99']
  );
});

test('extractUploadThingFileKeys ignores null contents, other hosts and non-file paths', () => {
  const keys = extractUploadThingFileKeys([
    null,
    undefined,
    'https://atcoder.jp/contests/abc269/tasks/abc269_f',
    'https://example.com/f/notuploadthing',
    'https://abc123.ufs.sh/other/path',
    'リンクなしの本文',
  ]);

  assert.equal(keys.size, 0);
});

const NOW = Date.UTC(2026, 10, 2, 0, 0, 0);
const DAY_MS = 24 * 60 * 60 * 1000;

function file(partial: Partial<UploadThingFileInfo>): UploadThingFileInfo {
  return {
    key: 'key',
    name: 'image.png',
    size: 1024,
    uploadedAt: NOW - 30 * DAY_MS,
    status: 'Uploaded',
    ...partial,
  };
}

test('selectCleanupCandidates picks unused files at or past the age threshold', () => {
  const oldUnused = file({ key: 'old-unused' });
  const exactlyThreshold = file({
    key: 'exactly-threshold',
    uploadedAt: NOW - 7 * DAY_MS,
  });

  const selected = selectCleanupCandidates(
    [oldUnused, exactlyThreshold],
    new Set(),
    { now: NOW, minAgeDays: 7 }
  );

  assert.deepEqual(
    selected.map((f) => f.key),
    ['old-unused', 'exactly-threshold']
  );
});

test('selectCleanupCandidates never picks used, young or not-fully-uploaded files', () => {
  const used = file({ key: 'used-key' });
  const young = file({ key: 'young', uploadedAt: NOW - 6 * DAY_MS });
  const justUploaded = file({ key: 'just-now', uploadedAt: NOW });
  const uploading = file({ key: 'uploading', status: 'Uploading' });
  const deletionPending = file({
    key: 'deletion-pending',
    status: 'Deletion Pending',
  });

  const selected = selectCleanupCandidates(
    [used, young, justUploaded, uploading, deletionPending],
    new Set(['used-key']),
    { now: NOW, minAgeDays: 7 }
  );

  assert.deepEqual(selected, []);
});

test('formatBytes renders human readable sizes', () => {
  assert.equal(formatBytes(0), '0 B');
  assert.equal(formatBytes(512), '512 B');
  assert.equal(formatBytes(1024), '1 KB');
  assert.equal(formatBytes(1536), '1.5 KB');
  assert.equal(formatBytes(2_500_000), '2.4 MB');
  assert.equal(formatBytes(2 * 1024 * 1024 * 1024), '2 GB');
});
