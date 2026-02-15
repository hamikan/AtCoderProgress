'use server';

import { searchProblemsFromDB } from '@/lib/services/db/problem';

/**
 * 問題検索用の Server Action
 */
export async function searchProblems(query: string) {
  try {
    return await searchProblemsFromDB(query);
  } catch (error) {
    console.error('Failed to search problems:', error);
    throw new Error('検索に失敗しました。');
  }
}
