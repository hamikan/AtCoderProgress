'use client';

import { useEffect, type RefObject } from 'react';

export function useDismissOnOutside({
  enabled,
  onDismiss,
  ref,
}: {
  enabled: boolean;
  onDismiss: (reason: 'outside' | 'escape') => void;
  ref: RefObject<HTMLElement | null>;
}) {
  useEffect(() => {
    if (!enabled) {
      return;
    }
    // Safari はボタンを押してもフォーカスが移らず blur では外側を押したか判別できないため、押した場所で判断する
    const handlePointerDown = (event: PointerEvent) => {
      if (!ref.current?.contains(event.target as Node)) {
        onDismiss('outside');
      }
    };
    // 小さい画面でサイドバーを閉じる Esc より先に受け取り、開いているものだけを閉じる
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        onDismiss('escape');
      }
    };
    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [enabled, onDismiss, ref]);
}
