export const DELETE_ACCOUNT_CONFIRMATION = 'アカウント削除';

export function isDeleteAccountConfirmed(value: string): boolean {
  return value.trim() === DELETE_ACCOUNT_CONFIRMATION;
}
