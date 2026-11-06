export type UnlinkProviderResult =
  | { status: 'unlinked' }
  | { status: 'not-linked' }
  | { status: 'last-provider' };
