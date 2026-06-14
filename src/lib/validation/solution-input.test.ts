import assert from 'node:assert/strict';
import test from 'node:test';

import { SolutionStatus } from '@prisma/client';

import {
  MAX_SOLUTION_TAGS,
  normalizeSolutionInput,
  normalizeSolutionTagNames,
} from './solution-input';

const VALID_CONTENT = JSON.stringify([{ type: 'p', children: [{ text: 'memo' }] }]);

test('normalizeSolutionInput normalizes save payloads', () => {
  assert.deepEqual(
    normalizeSolutionInput({
      contestId: 'abc001',
      content: VALID_CONTENT,
      problemId: 'abc001_a',
      solutionId: ' solution-1 ',
      status: SolutionStatus.AC,
      tagNames: [' dp ', 'DP', 'graph'],
      title: '  title  ',
    }),
    {
      contestId: 'abc001',
      content: VALID_CONTENT,
      problemId: 'abc001_a',
      solutionId: 'solution-1',
      status: SolutionStatus.AC,
      tagNames: ['dp', 'graph'],
      title: 'title',
    }
  );
});

test('normalizeSolutionInput rejects invalid ids and status', () => {
  assert.throws(
    () =>
      normalizeSolutionInput({
        contestId: 'abc/001',
        content: VALID_CONTENT,
        problemId: 'abc001_a',
        status: SolutionStatus.AC,
        tagNames: [],
        title: null,
      }),
    { message: 'Invalid contest ID' }
  );

  assert.throws(
    () =>
      normalizeSolutionInput({
        contestId: 'abc001',
        content: VALID_CONTENT,
        problemId: 'abc001_a',
        status: 'BAD_STATUS',
        tagNames: [],
        title: null,
      }),
    { message: 'Invalid solution status' }
  );
});

test('normalizeSolutionInput rejects invalid rich text content', () => {
  assert.throws(
    () =>
      normalizeSolutionInput({
        contestId: 'abc001',
        content: '{"type":"p"}',
        problemId: 'abc001_a',
        status: SolutionStatus.AC,
        tagNames: [],
        title: null,
      }),
    { message: 'Invalid solution content' }
  );
});

test('normalizeSolutionTagNames enforces tag boundaries', () => {
  assert.throws(() => normalizeSolutionTagNames(Array.from({ length: MAX_SOLUTION_TAGS + 1 }, (_, index) => `tag${index}`)), {
    message: 'Too many tags',
  });

  assert.throws(() => normalizeSolutionTagNames(['a'.repeat(51)]), {
    message: 'Tag name is too long',
  });
});
