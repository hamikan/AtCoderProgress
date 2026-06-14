'use server';

import { searchProblemsFromDB } from '@/lib/services/db/problem';
import { normalizeProblemSearchQuery } from '@/lib/validation/problem-search';

/**
 * 問題検索用の Server Action
 */
export async function searchProblems(query: string) {
  try {
    const normalizedQuery = normalizeProblemSearchQuery(query);
    if (!normalizedQuery) {
      return [];
    }

    return await searchProblemsFromDB(normalizedQuery);
  } catch (error) {
    console.error('Failed to search problems:', error);
    throw new Error('検索に失敗しました。');
  }
}
