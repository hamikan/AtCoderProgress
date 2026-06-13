'use client';

import { PlaceholderPlugin } from '@platejs/media/react';
import { ImageIcon } from 'lucide-react';
import { KEYS } from 'platejs';
import { useEditorRef } from 'platejs/react';
import { useFilePicker } from 'use-file-picker';

import { ToolbarButton } from './toolbar';

export function MediaToolbarButton({
  nodeType,
}: {
  nodeType: string;
}) {
  const editor = useEditorRef();

  const { openFilePicker } = useFilePicker({
    accept: ['image/*'],
    multiple: true,
    onFilesSelected: ({ plainFiles: updatedFiles }) => {
      const imageFiles = updatedFiles.filter((file: File) =>
        file.type.startsWith('image/')
      );

      if (imageFiles.length > 0) {
        editor.getTransforms(PlaceholderPlugin).insert.media(imageFiles);
      }
    },
  });

  if (nodeType !== KEYS.img) return null;

  return (
    <ToolbarButton onClick={() => openFilePicker()} tooltip="Image">
      <ImageIcon />
    </ToolbarButton>
  );
}
