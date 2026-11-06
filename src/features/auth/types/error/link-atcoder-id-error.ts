export type LinkAtCoderIdError =
  | { code: 'UNAUTHENTICATED'; message: string }
  | { code: 'INVALID_INPUT'; message: string }
  | { code: 'CHANGE_BLOCKED'; message: string }
  | { code: 'USER_NOT_FOUND'; message: string }
  | { code: 'UPSTREAM_UNAVAILABLE'; message: string }
  | { code: 'CONFLICT'; message: string }
  | { code: 'INTERNAL_ERROR'; message: string };
