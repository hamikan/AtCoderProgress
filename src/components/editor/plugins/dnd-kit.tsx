'use client';

import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

import { DndPlugin } from '@platejs/dnd';
import { PlaceholderPlugin } from '@platejs/media/react';
import { toast } from 'sonner';

import { BlockDraggable } from '@/components/ui/block-draggable';
import {
  createFileList,
  filterValidEditorImageFiles,
} from '@/components/editor/image-upload-files';

export const DndKit = [
  DndPlugin.configure({
    options: {
      enableScroller: true,
      onDropFiles: ({ dragItem, editor, target }) => {
        const { acceptedFiles, rejectedFiles } = filterValidEditorImageFiles(dragItem.files);
        rejectedFiles.forEach(({ message }) => toast.error(message));

        if (acceptedFiles.length === 0) {
          return;
        }

        editor
          .getTransforms(PlaceholderPlugin)
          .insert.media(createFileList(acceptedFiles), { at: target, nextBlock: false });
      },
    },
    render: {
      aboveNodes: BlockDraggable,
      aboveSlate: ({ children }) => (
        <DndProvider backend={HTML5Backend}>{children}</DndProvider>
      ),
    },
  }),
];
