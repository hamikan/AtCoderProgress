'use client';

import type { KeyboardEvent } from 'react';

interface SolutionTitleInputProps {
  value: string;
  placeholder: string;
  onChange: (title: string) => void;
  onMoveToBody: () => void;
}

export default function SolutionTitleInput({
  value,
  placeholder,
  onChange,
  onMoveToBody,
}: SolutionTitleInputProps) {
  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    // 変換を確定する Enter で本文へ移らないようにする
    if (event.key !== 'Enter' || event.nativeEvent.isComposing) {
      return;
    }
    event.preventDefault();
    onMoveToBody();
  }

  return (
    <input
      type="text"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      onKeyDown={handleKeyDown}
      maxLength={120}
      placeholder={placeholder}
      aria-label="タイトル"
      className="w-full shrink-0 bg-transparent px-4 pt-5 text-2xl font-bold text-slate-900 outline-none placeholder:text-slate-300 sm:px-6 sm:pt-7"
    />
  );
}
