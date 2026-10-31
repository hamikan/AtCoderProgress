export type SolutionSidebarLookupError =
  | { code: 'UNAUTHENTICATED'; message: string }
  | { code: 'INVALID_INPUT'; message: string }
  | { code: 'INTERNAL_ERROR'; message: string };
