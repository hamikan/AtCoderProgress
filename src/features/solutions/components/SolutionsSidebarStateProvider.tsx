'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from 'react';

// ページ遷移でワークスペースが再マウントされるため、状態は solutions の layout で保持する。
interface SolutionsSidebarState {
  // マウントまでは null にして、SSR とハイドレーションで開くグループを一致させる。
  openGroupKeys: ReadonlySet<string> | null;
  setGroupOpen: (key: string, open: boolean) => void;
  revealGroups: (keys: string[]) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  scrollTopRef: RefObject<number>;
}

const SolutionsSidebarStateContext = createContext<SolutionsSidebarState | null>(null);

export function useSolutionsSidebarState(): SolutionsSidebarState {
  const state = useContext(SolutionsSidebarStateContext);
  if (!state) {
    throw new Error('useSolutionsSidebarState must be used within SolutionsSidebarStateProvider');
  }

  return state;
}

export default function SolutionsSidebarStateProvider({ children }: { children: ReactNode }) {
  const [openGroupKeys, setOpenGroupKeys] = useState<ReadonlySet<string> | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const scrollTopRef = useRef(0);

  const setGroupOpen = useCallback((key: string, open: boolean) => {
    setOpenGroupKeys((current) => {
      const next = new Set(current ?? []);
      if (open) {
        next.add(key);
      } else {
        next.delete(key);
      }
      return next;
    });
  }, []);

  const revealGroups = useCallback((keys: string[]) => {
    setOpenGroupKeys((current) => {
      if (current && keys.every((key) => current.has(key))) {
        return current;
      }
      return new Set([...(current ?? []), ...keys]);
    });
  }, []);

  const state = useMemo(
    () => ({
      openGroupKeys,
      setGroupOpen,
      revealGroups,
      searchQuery,
      setSearchQuery,
      sidebarOpen,
      setSidebarOpen,
      scrollTopRef,
    }),
    [openGroupKeys, revealGroups, searchQuery, setGroupOpen, sidebarOpen]
  );

  return (
    <SolutionsSidebarStateContext.Provider value={state}>
      {children}
    </SolutionsSidebarStateContext.Provider>
  );
}
