export type SaveSolutionError =
  | { code: 'UNAUTHENTICATED'; message: string }
  | { code: 'INVALID_INPUT'; message: string }
  | { code: 'NOT_FOUND'; message: string }
  | { code: 'INTERNAL_ERROR'; message: string };
