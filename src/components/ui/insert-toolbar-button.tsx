'use client';

import * as React from 'react';

import type { DropdownMenuProps } from '@radix-ui/react-dropdown-menu';

import {
  ChevronRightIcon,
  FileCodeIcon,
  Heading1Icon,
  Heading2Icon,
  Heading3Icon,
  ImageIcon,
  Link2Icon,
  ListIcon,
  ListOrderedIcon,
  MinusIcon,
  PilcrowIcon,
  PlusIcon,
  QuoteIcon,
  RadicalIcon,
  SquareIcon,
  TableIcon,
  TableOfContentsIcon,
} from 'lucide-react';
import { KEYS } from '@/lib/plate/constants';
import { type PlateEditor, useEditorRef } from 'platejs/react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  insertBlock,
  insertInlineElement,
} from '@/components/editor/transforms';

import { ToolbarButton, ToolbarMenuGroup } from './toolbar';

type Group = {
  group: string;
  items: Item[];
};

type Item = {
  icon: React.ReactNode;
  value: string;
  onSelect: (editor: PlateEditor, value: string) => void;
  focusEditor?: boolean;
  label?: string;
};

const groups: Group[] = [
  {
    group: '基本ブロック',
    items: [
      {
        icon: <PilcrowIcon />,
        label: 'テキスト',
        value: KEYS.p,
      },
      {
        icon: <Heading1Icon />,
        label: '見出し 1',
        value: 'h1',
      },
      {
        icon: <Heading2Icon />,
        label: '見出し 2',
        value: 'h2',
      },
      {
        icon: <Heading3Icon />,
        label: '見出し 3',
        value: 'h3',
      },
      {
        icon: <TableIcon />,
        label: '表',
        value: KEYS.table,
      },
      {
        icon: <FileCodeIcon />,
        label: 'コードブロック',
        value: KEYS.codeBlock,
      },
      {
        icon: <QuoteIcon />,
        label: '引用',
        value: KEYS.blockquote,
      },
      {
        icon: <MinusIcon />,
        label: '区切り線',
        value: KEYS.hr,
      },
    ].map((item) => ({
      ...item,
      onSelect: (editor, value) => {
        insertBlock(editor, value);
      },
    })),
  },
  {
    group: 'Lists',
    items: [
      {
        icon: <ListIcon />,
        label: '箇条書き',
        value: KEYS.ul,
      },
      {
        icon: <ListOrderedIcon />,
        label: '番号付きリスト',
        value: KEYS.ol,
      },
      {
        icon: <SquareIcon />,
        label: 'チェックリスト',
        value: KEYS.listTodo,
      },
      {
        icon: <ChevronRightIcon />,
        label: '折りたたみ',
        value: KEYS.toggle,
      },
    ].map((item) => ({
      ...item,
      onSelect: (editor, value) => {
        insertBlock(editor, value);
      },
    })),
  },
  {
    group: 'Media',
    items: [
      {
        icon: <ImageIcon />,
        label: '画像',
        value: KEYS.img,
      },
    ].map((item) => ({
      ...item,
      onSelect: (editor, value) => {
        insertBlock(editor, value);
      },
    })),
  },
  {
    group: '応用ブロック',
    items: [
      {
        icon: <TableOfContentsIcon />,
        label: '目次',
        value: KEYS.toc,
      },
      {
        focusEditor: false,
        icon: <RadicalIcon />,
        label: '数式',
        value: KEYS.equation,
      },
    ].map((item) => ({
      ...item,
      onSelect: (editor, value) => {
        insertBlock(editor, value);
      },
    })),
  },
  {
    group: '文中',
    items: [
      {
        icon: <Link2Icon />,
        label: 'リンク',
        value: KEYS.link,
      },
      {
        focusEditor: false,
        icon: <RadicalIcon />,
        label: '文中の数式',
        value: KEYS.inlineEquation,
      },
    ].map((item) => ({
      ...item,
      onSelect: (editor, value) => {
        insertInlineElement(editor, value);
      },
    })),
  },
];

export function InsertToolbarButton(props: DropdownMenuProps) {
  const editor = useEditorRef();
  const [open, setOpen] = React.useState(false);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen} modal={false} {...props}>
      <DropdownMenuTrigger asChild>
        <ToolbarButton pressed={open} tooltip="挿入" isDropdown>
          <PlusIcon />
        </ToolbarButton>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="flex max-h-[500px] min-w-0 flex-col overflow-y-auto"
        align="start"
      >
        {groups.map(({ group, items: nestedItems }) => (
          <ToolbarMenuGroup key={group} label={group}>
            {nestedItems.map(({ icon, label, value, onSelect }) => (
              <DropdownMenuItem
                key={value}
                className="min-w-[180px]"
                onSelect={() => {
                  onSelect(editor, value);
                  editor.tf.focus();
                }}
              >
                {icon}
                {label}
              </DropdownMenuItem>
            ))}
          </ToolbarMenuGroup>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
