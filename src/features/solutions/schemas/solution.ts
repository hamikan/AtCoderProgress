import { z } from 'zod';

import type { SolutionInput, SolutionStatus } from '@/features/solutions/types';

export const MAX_SOLUTION_TITLE_LENGTH = 120;
export const MAX_SOLUTION_TAGS = 20;
export const MAX_SOLUTION_TAG_NAME_LENGTH = 50;
export const MAX_SOLUTION_CONTENT_LENGTH = 1_000_000;
export const MAX_SOLUTION_CONTENT_NODE_DEPTH = 20;
export const MAX_SOLUTION_CONTENT_NODE_COUNT = 5000;

const DATABASE_ID_PATTERN = /^[A-Za-z0-9_-]{1,100}$/;
export const solutionStatusSchema = z.enum([
  'SELF_AC',
  'EXPLANATION_AC',
  'REVIEW_AC',
  'AC',
  'TRYING',
  'UNSOLVED',
]);

const databaseIdSchema = z.string().trim().regex(DATABASE_ID_PATTERN);
const solutionInputBoundarySchema = z.object({
  contestId: z.unknown(),
  content: z.unknown(),
  problemId: z.unknown(),
  solutionId: z.unknown().optional(),
  status: z.unknown(),
  tagNames: z.unknown(),
  title: z.unknown(),
});

interface ParsedSolutionInput {
  contestId: string;
  content: string;
  problemId: string;
  solutionId: string | null;
  status: SolutionStatus;
  tagNames: string[];
  title: string | null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function parseDatabaseId(value: unknown, message: string): string {
  const parsed = databaseIdSchema.safeParse(value);
  if (!parsed.success) {
    throw new Error(message);
  }
  return parsed.data;
}

export function parseContestId(value: unknown): string {
  return parseDatabaseId(value, 'Invalid contest ID');
}

export function parseProblemId(value: unknown): string {
  return parseDatabaseId(value, 'Invalid problem ID');
}

export function parseSolutionId(value: unknown): string {
  return parseDatabaseId(value, 'Invalid solution ID');
}

function isValidPlateNode(
  node: unknown,
  depth: number,
  state: { count: number }
): boolean {
  if (depth > MAX_SOLUTION_CONTENT_NODE_DEPTH) {
    return false;
  }

  state.count += 1;
  if (state.count > MAX_SOLUTION_CONTENT_NODE_COUNT) {
    return false;
  }

  if (isRecord(node) && typeof node.text === 'string') {
    return true;
  }

  if (!isRecord(node) || typeof node.type !== 'string' || !Array.isArray(node.children)) {
    return false;
  }

  return node.children.every((child) => isValidPlateNode(child, depth + 1, state));
}

export function parseSolutionContent(content: unknown): string {
  if (typeof content !== 'string' || content.length > MAX_SOLUTION_CONTENT_LENGTH) {
    throw new Error('Invalid solution content');
  }

  let parsed: unknown;

  try {
    parsed = JSON.parse(content);
  } catch {
    throw new Error('Invalid solution content');
  }

  const state = { count: 0 };
  if (!Array.isArray(parsed) || !parsed.every((node) => isValidPlateNode(node, 0, state))) {
    throw new Error('Invalid solution content');
  }

  return JSON.stringify(parsed);
}

export function normalizeSolutionTitle(title: unknown): string | null {
  if (title !== null && title !== undefined && typeof title !== 'string') {
    throw new Error('Invalid solution title');
  }

  const normalizedTitle = title?.trim() || null;
  if (normalizedTitle && normalizedTitle.length > MAX_SOLUTION_TITLE_LENGTH) {
    throw new Error('Title is too long');
  }

  return normalizedTitle;
}

export function parseSolutionStatus(status: unknown): SolutionStatus {
  const parsed = solutionStatusSchema.safeParse(status);
  if (!parsed.success) {
    throw new Error('Invalid solution status');
  }
  return parsed.data;
}

export function normalizeSolutionTagNames(tagNames: unknown): string[] {
  if (!Array.isArray(tagNames)) {
    throw new Error('Invalid solution tags');
  }

  const normalizedTagNames = tagNames.reduce<string[]>((tags, tagName) => {
    if (typeof tagName !== 'string') {
      throw new Error('Invalid solution tag');
    }

    const normalizedTagName = tagName.trim().replace(/\s+/g, ' ');
    if (!normalizedTagName) {
      return tags;
    }

    if (normalizedTagName.length > MAX_SOLUTION_TAG_NAME_LENGTH) {
      throw new Error('Tag name is too long');
    }

    const hasSameTag = tags.some(
      (tag) => tag.toLocaleLowerCase() === normalizedTagName.toLocaleLowerCase()
    );

    return hasSameTag ? tags : [...tags, normalizedTagName];
  }, []);

  if (normalizedTagNames.length > MAX_SOLUTION_TAGS) {
    throw new Error('Too many tags');
  }

  return normalizedTagNames;
}

export function parseSolutionInput(input: SolutionInput): ParsedSolutionInput {
  const boundary = solutionInputBoundarySchema.parse(input);
  const solutionId =
    boundary.solutionId === null || boundary.solutionId === undefined
      ? null
      : parseSolutionId(boundary.solutionId);

  return {
    contestId: parseContestId(boundary.contestId),
    content: parseSolutionContent(boundary.content),
    problemId: parseProblemId(boundary.problemId),
    solutionId,
    status: parseSolutionStatus(boundary.status),
    tagNames: normalizeSolutionTagNames(boundary.tagNames),
    title: normalizeSolutionTitle(boundary.title),
  };
}
