'use client';

import type { PlateEditor } from 'platejs/react';

import { insertCallout } from '@platejs/callout';
import { insertCodeBlock, toggleCodeBlock } from '@platejs/code-block';
import { triggerFloatingLink } from '@platejs/link/react';
import { insertEquation, insertInlineEquation } from '@platejs/math';
import { insertMedia } from '@platejs/media';
import { SuggestionPlugin } from '@platejs/suggestion/react';
import { TablePlugin } from '@platejs/table/react';
import { insertToc } from '@platejs/toc';
import {
  type NodeEntry,
  type Path,
  type TElement,
  PathApi,
} from 'platejs';
import { KEYS } from '@/lib/plate/constants';

const insertList = (editor: PlateEditor, type: string) => {
  editor.tf.insertNodes(
    editor.api.create.block({
      indent: 1,
      listStyleType: type,
    }),
    { select: true }
  );
};

const insertBlockMap: Record<
  string,
  (editor: PlateEditor, type: string) => void
> = {
  [KEYS.listTodo]: insertList,
  [KEYS.ol]: insertList,
  [KEYS.ul]: insertList,
  [KEYS.callout]: (editor) => insertCallout(editor, { select: true }),
  [KEYS.codeBlock]: (editor) => insertCodeBlock(editor, { select: true }),
  [KEYS.equation]: (editor) => insertEquation(editor, { select: true }),
  [KEYS.img]: (editor) =>
    insertMedia(editor, {
      select: true,
      type: KEYS.img,
    }),
  [KEYS.table]: (editor) =>
    editor.getTransforms(TablePlugin).insert.table({}, { select: true }),
  [KEYS.toc]: (editor) => insertToc(editor, { select: true }),
};

const insertInlineMap: Record<
  string,
  (editor: PlateEditor, type: string) => void
> = {
  [KEYS.inlineEquation]: (editor) =>
    insertInlineEquation(editor, '', { select: true }),
  [KEYS.link]: (editor) => triggerFloatingLink(editor, { focused: true }),
};

type InsertBlockOptions = {
  upsert?: boolean;
};

export const insertBlock = (
  editor: PlateEditor,
  type: string,
  options: InsertBlockOptions = {}
) => {
  const { upsert = false } = options;

  editor.tf.withoutNormalizing(() => {
    const block = editor.api.block();

    if (!block) return;

    const [currentNode, path] = block;
    const isCurrentBlockEmpty = editor.api.isEmpty(currentNode);
    const currentBlockType = getBlockType(currentNode);

    const isSameBlockType = type === currentBlockType;

    if (upsert && isCurrentBlockEmpty && isSameBlockType) {
      return;
    }

    if (type in insertBlockMap) {
      insertBlockMap[type](editor, type);
    } else {
      editor.tf.insertNodes(editor.api.create.block({ type }), {
        at: PathApi.next(path),
        select: true,
      });
    }

    if (!isSameBlockType) {
      editor.getApi(SuggestionPlugin).suggestion.withoutSuggestions(() => {
        editor.tf.removeNodes({ previousEmptyBlock: true });
      });
    }
  });
};

export const insertInlineElement = (editor: PlateEditor, type: string) => {
  if (insertInlineMap[type]) {
    insertInlineMap[type](editor, type);
  }
};

const setList = (
  editor: PlateEditor,
  type: string,
  entry: NodeEntry<TElement>
) => {
  editor.tf.setNodes(
    editor.api.create.block({
      indent: 1,
      listStyleType: type,
    }),
    {
      at: entry[1],
    }
  );
};

const setBlockMap: Record<
  string,
  (editor: PlateEditor, type: string, entry: NodeEntry<TElement>) => void
> = {
  [KEYS.listTodo]: setList,
  [KEYS.ol]: setList,
  [KEYS.ul]: setList,
  [KEYS.codeBlock]: (editor) => toggleCodeBlock(editor),
};

const setBlockEntry = (
  editor: PlateEditor,
  type: string,
  entry: NodeEntry<TElement>
) => {
  const [node, path] = entry;

  if (node[KEYS.listType]) {
    editor.tf.unsetNodes([KEYS.listType, 'indent'], { at: path });
  }
  if (type in setBlockMap) {
    return setBlockMap[type](editor, type, entry);
  }
  if (node.type !== type) {
    editor.tf.setNodes({ type }, { at: path });
  }
};

const setBlockEntries = (
  editor: PlateEditor,
  type: string,
  entries: NodeEntry<TElement>[]
) => {
  const pathRefs = entries.map(([, path]) => editor.api.pathRef(path));
  try {
    pathRefs.forEach((pathRef) => {
      const entry = pathRef.current && editor.api.node<TElement>(pathRef.current);
      if (entry) setBlockEntry(editor, type, entry);
    });
  } finally {
    pathRefs.forEach((pathRef) => pathRef.unref());
  }
};

export const setBlockType = (
  editor: PlateEditor,
  type: string,
  { at }: { at?: Path } = {}
) => {
  if (type === KEYS.blockquote) {
    editor.tf.toggleBlock(type, { ...(at ? { at } : {}), wrap: true });
    return;
  }

  editor.tf.withoutNormalizing(() => {
    const location = at ?? editor.selection;
    if (!location) return;

    const initialRange = editor.api.range(location);
    if (!initialRange) return;

    const rangeRef = editor.api.rangeRef(initialRange);
    try {
      // Lift only the selected blocks out of quote containers, keeping neighbors quoted.
      editor.tf.unwrapNodes({
        at: location,
        match: { type: editor.getType(KEYS.blockquote) },
        mode: 'all',
        split: true,
      });

      const range = rangeRef.current;
      if (!range) return;

      setBlockEntries(editor, type, editor.api.blocks({ at: range, mode: 'lowest' }));
    } finally {
      rangeRef.unref();
    }
  });
};

export const getBlockType = (block: TElement) => {
  if (block[KEYS.listType]) {
    if (block[KEYS.listType] === KEYS.ol) {
      return KEYS.ol;
    }
    if (block[KEYS.listType] === KEYS.listTodo) {
      return KEYS.listTodo;
    }
    return KEYS.ul;
  }

  return block.type;
};
