'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { useDismissOnOutside } from '@/features/solutions/hooks/use-dismiss-on-outside';

export function useInlineDisclosure<
  TToggle extends HTMLElement = HTMLButtonElement,
  TPanel extends HTMLElement = HTMLDivElement,
>() {
  const [isOpen, setIsOpen] = useState(false);
  const toggleRef = useRef<TToggle>(null);
  const panelRef = useRef<TPanel>(null);
  // 外側を押して閉じたときは、押した先のフォーカスを奪わない
  const shouldRestoreFocusRef = useRef(false);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback((restoreFocus: boolean) => {
    shouldRestoreFocusRef.current = restoreFocus;
    setIsOpen(false);
  }, []);
  const dismiss = useCallback(
    (reason: 'outside' | 'escape') => close(reason === 'escape'),
    [close]
  );

  useDismissOnOutside({ enabled: isOpen, onDismiss: dismiss, ref: panelRef });

  useEffect(() => {
    if (!isOpen && shouldRestoreFocusRef.current) {
      shouldRestoreFocusRef.current = false;
      toggleRef.current?.focus();
    }
  }, [isOpen]);

  return { close, isOpen, open, panelRef, toggleRef };
}
