export type DeleteAccountError =
  | { code: 'UNAUTHENTICATED'; message: string }
  | { code: 'NOT_CONFIRMED'; message: string }
  | { code: 'INTERNAL_ERROR'; message: string };
