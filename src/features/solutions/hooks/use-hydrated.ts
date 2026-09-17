'use client';

import { useSyncExternalStore } from 'react';

function subscribeHydration(onStoreChange: () => void) {
  queueMicrotask(onStoreChange);
  return () => {};
}

export function useHydrated(): boolean {
  return useSyncExternalStore(
    subscribeHydration,
    () => true,
    () => false
  );
}
