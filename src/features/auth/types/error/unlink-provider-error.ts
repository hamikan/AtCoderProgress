export type UnlinkProviderError =
  | { code: 'UNAUTHENTICATED'; message: string }
  | { code: 'INVALID_INPUT'; message: string }
  | { code: 'NOT_LINKED'; message: string }
  | { code: 'LAST_PROVIDER'; message: string }
  | { code: 'CONFLICT'; message: string }
  | { code: 'INTERNAL_ERROR'; message: string };
