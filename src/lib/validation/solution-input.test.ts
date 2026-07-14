import assert from 'node:assert/strict';
import test from 'node:test';

import { SolutionStatus } from '@prisma/client';

import {
  MAX_SOLUTION_CONTENT_LENGTH,
  MAX_SOLUTION_CONTENT_NODE_COUNT,
  MAX_SOLUTION_CONTENT_NODE_DEPTH,
  MAX_SOLUTION_TAGS,
  MAX_SOLUTION_TAG_NAME_LENGTH,
  MAX_SOLUTION_TITLE_LENGTH,
  normalizeSolutionContent,
  normalizeSolutionInput,
  normalizeSolutionTagNames,
  normalizeSolutionTitle,
} from './solution-input';

const VALID_CONTENT = createPlateDocument('memo');

type SolutionInputFixture = Parameters<typeof normalizeSolutionInput>[0];

function createPlateDocument(text: string): string {
  return JSON.stringify([{ type: 'p', children: [{ text }] }]);
}

function createNestedPlateDocument(depth: number): string {
  let node: unknown = { text: 'memo' };

  for (let index = 0; index < depth; index += 1) {
    node = { type: 'p', children: [node] };
  }

  return JSON.stringify([node]);
}

function solutionInput(overrides: Partial<SolutionInputFixture> = {}): SolutionInputFixture {
  return {
    contestId: 'abc001',
    content: VALID_CONTENT,
    problemId: 'abc001_a',
    status: SolutionStatus.AC,
    tagNames: [],
    title: null,
    ...overrides,
  };
}

test('normalizeSolutionInput normalizes save payloads', () => {
  assert.deepEqual(
    normalizeSolutionInput(solutionInput({
      solutionId: ' solution-1 ',
      tagNames: [' dp ', 'DP', 'graph'],
      title: '  title  ',
    })),
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

test('normalizeSolutionInput defaults blank optional fields for new saves', () => {
  assert.deepEqual(
    normalizeSolutionInput(solutionInput({
      solutionId: undefined,
      tagNames: ['  dynamic   programming  ', 'Dynamic Programming', 'math'],
      title: '   ',
    })),
    {
      contestId: 'abc001',
      content: VALID_CONTENT,
      problemId: 'abc001_a',
      solutionId: null,
      status: SolutionStatus.AC,
      tagNames: ['dynamic programming', 'math'],
      title: null,
    }
  );
});

test('normalizeSolutionInput rejects invalid ids and status', () => {
  assert.throws(
    () =>
      normalizeSolutionInput(solutionInput({
        contestId: 'abc/001',
      })),
    { message: 'Invalid contest ID' }
  );

  assert.throws(
    () =>
      normalizeSolutionInput(solutionInput({
        problemId: '../abc001_a',
      })),
    { message: 'Invalid problem ID' }
  );

  assert.throws(
    () =>
      normalizeSolutionInput(solutionInput({
        solutionId: '../solution',
      })),
    { message: 'Invalid solution ID' }
  );

  assert.throws(
    () =>
      normalizeSolutionInput(solutionInput({
        status: 'BAD_STATUS',
      })),
    { message: 'Invalid solution status' }
  );
});

test('normalizeSolutionInput rejects invalid rich text content', () => {
  assert.throws(
    () =>
      normalizeSolutionInput(solutionInput({
        content: '{"type":"p"}',
      })),
    { message: 'Invalid solution content' }
  );
});

test('normalizeSolutionContent canonicalizes valid rich text documents', () => {
  assert.equal(
    normalizeSolutionContent(' [ { "type": "p", "children": [ { "text": "memo" } ] } ] '),
    VALID_CONTENT
  );
});

test('normalizeSolutionContent rejects oversized or structurally unsafe content', () => {
  assert.throws(() => normalizeSolutionContent('x'.repeat(MAX_SOLUTION_CONTENT_LENGTH + 1)), {
    message: 'Invalid solution content',
  });

  assert.throws(
    () => normalizeSolutionContent(createNestedPlateDocument(MAX_SOLUTION_CONTENT_NODE_DEPTH + 1)),
    { message: 'Invalid solution content' }
  );

  assert.throws(
    () =>
      normalizeSolutionContent(
        JSON.stringify(
          Array.from(
            { length: MAX_SOLUTION_CONTENT_NODE_COUNT + 1 },
            () => ({ text: 'memo' })
          )
        )
      ),
    { message: 'Invalid solution content' }
  );
});

test('normalizeSolutionTitle normalizes optional titles and rejects invalid titles', () => {
  assert.equal(normalizeSolutionTitle(undefined), null);
  assert.equal(normalizeSolutionTitle(null), null);
  assert.equal(normalizeSolutionTitle('   '), null);
  assert.equal(normalizeSolutionTitle('  My solution  '), 'My solution');

  assert.throws(() => normalizeSolutionTitle(123), {
    message: 'Invalid solution title',
  });

  assert.throws(() => normalizeSolutionTitle('a'.repeat(MAX_SOLUTION_TITLE_LENGTH + 1)), {
    message: 'Title is too long',
  });
});

test('normalizeSolutionTagNames enforces tag boundaries', () => {
  assert.deepEqual(
    normalizeSolutionTagNames([' dp ', 'DP', 'two   pointers', '']),
    ['dp', 'two pointers']
  );

  assert.throws(() => normalizeSolutionTagNames('dp'), {
    message: 'Invalid solution tags',
  });

  assert.throws(() => normalizeSolutionTagNames(['dp', 123]), {
    message: 'Invalid solution tag',
  });

  assert.throws(
    () =>
      normalizeSolutionTagNames(
        Array.from({ length: MAX_SOLUTION_TAGS + 1 }, (_, index) => `tag${index}`)
      ),
    { message: 'Too many tags' }
  );

  assert.throws(() => normalizeSolutionTagNames(['a'.repeat(MAX_SOLUTION_TAG_NAME_LENGTH + 1)]), {
    message: 'Tag name is too long',
  });
});
