import { SolutionStatus } from '@prisma/client';

export const MAX_SOLUTION_TITLE_LENGTH = 120;
export const MAX_SOLUTION_TAGS = 20;
export const MAX_SOLUTION_TAG_NAME_LENGTH = 50;
export const MAX_SOLUTION_CONTENT_LENGTH = 1_000_000;

const MAX_PLATE_NODE_DEPTH = 20;
const MAX_PLATE_NODE_COUNT = 5000;
const DATABASE_ID_PATTERN = /^[A-Za-z0-9_-]{1,100}$/;
const VALID_SOLUTION_STATUSES = new Set<SolutionStatus>(
  Object.values(SolutionStatus) as SolutionStatus[]
);

interface SolutionInput {
  contestId: unknown;
  content: unknown;
  problemId: unknown;
  solutionId?: unknown;
  status: unknown;
  tagNames: unknown;
  title: unknown;
}

interface NormalizedSolutionInput {
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

function normalizeDatabaseId(value: unknown, message: string): string {
  if (typeof value !== 'string') {
    throw new Error(message);
  }

  const normalizedValue = value.trim();
  if (!DATABASE_ID_PATTERN.test(normalizedValue)) {
    throw new Error(message);
  }

  return normalizedValue;
}

export function normalizeContestId(value: unknown): string {
  return normalizeDatabaseId(value, 'Invalid contest ID');
}

export function normalizeProblemId(value: unknown): string {
  return normalizeDatabaseId(value, 'Invalid problem ID');
}

export function normalizeSolutionId(value: unknown): string {
  return normalizeDatabaseId(value, 'Invalid solution ID');
}

function isValidPlateNode(
  node: unknown,
  depth: number,
  state: { count: number }
): boolean {
  if (depth > MAX_PLATE_NODE_DEPTH) {
    return false;
  }

  state.count += 1;
  if (state.count > MAX_PLATE_NODE_COUNT) {
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

export function normalizeSolutionContent(content: unknown): string {
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

export function normalizeSolutionStatus(status: unknown): SolutionStatus {
  if (!VALID_SOLUTION_STATUSES.has(status as SolutionStatus)) {
    throw new Error('Invalid solution status');
  }

  return status as SolutionStatus;
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

export function normalizeSolutionInput(input: SolutionInput): NormalizedSolutionInput {
  const solutionId =
    input.solutionId === null || input.solutionId === undefined
      ? null
      : normalizeSolutionId(input.solutionId);

  return {
    contestId: normalizeContestId(input.contestId),
    content: normalizeSolutionContent(input.content),
    problemId: normalizeProblemId(input.problemId),
    solutionId,
    status: normalizeSolutionStatus(input.status),
    tagNames: normalizeSolutionTagNames(input.tagNames),
    title: normalizeSolutionTitle(input.title),
  };
}
