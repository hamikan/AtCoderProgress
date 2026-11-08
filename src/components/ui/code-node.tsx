'use client';

import * as React from 'react';

import type { PlateLeafProps } from 'platejs/react';

import { PlateLeaf } from 'platejs/react';

export function CodeLeaf(props: PlateLeafProps) {
  // 空の行では Slate が文字の中に改行を入れるため、枠の終わりが次の行へ押し出されて1行増えて見える。その改行だけを隠す
  return (
    <PlateLeaf
      {...props}
      as="code"
      className="[&_br]:hidden whitespace-pre-wrap rounded-md bg-muted px-[0.3em] py-[0.2em] font-mono text-sm"
    >
      {props.children}
    </PlateLeaf>
  );
}
