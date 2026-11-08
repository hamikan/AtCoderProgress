export const DELETE_ACCOUNT_CONFIRMATION = '退会する';

export function isDeleteAccountConfirmed(value: string): boolean {
  return value.trim() === DELETE_ACCOUNT_CONFIRMATION;
}
