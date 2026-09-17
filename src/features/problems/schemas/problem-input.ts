import { z } from 'zod';

export const MAX_PROBLEM_SEARCH_QUERY_LENGTH = 80;
export const MAX_PROBLEM_FILTER_TAG_LENGTH = 50;

export const contestKindSchema = z.enum(['abc', 'arc', 'agc']);
export const contestOrderSchema = z.enum(['asc', 'desc']);

export const problemSearchQuerySchema = z
  .string()
  .trim()
  .min(2)
  .max(MAX_PROBLEM_SEARCH_QUERY_LENGTH);

export const problemFilterTagSchema = z
  .string()
  .trim()
  .min(1)
  .max(MAX_PROBLEM_FILTER_TAG_LENGTH);
