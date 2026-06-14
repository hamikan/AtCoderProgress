'use client';

import { PlaceholderPlugin } from '@platejs/media/react';
import { ImageIcon } from 'lucide-react';
import { KEYS } from 'platejs';
import { useEditorRef } from 'platejs/react';
import { toast } from 'sonner';
import { useFilePicker } from 'use-file-picker';

import {
  createFileList,
  EDITOR_IMAGE_ACCEPT,
  filterValidEditorImageFiles,
} from '@/components/editor/image-upload-files';

import { ToolbarButton } from './toolbar';

export function MediaToolbarButton({
  nodeType,
}: {
  nodeType: string;
}) {
  const editor = useEditorRef();

  const { openFilePicker } = useFilePicker({
    accept: [...EDITOR_IMAGE_ACCEPT],
    multiple: true,
    onFilesSelected: ({ plainFiles: updatedFiles }) => {
      const { acceptedFiles, rejectedFiles } = filterValidEditorImageFiles(updatedFiles);
      rejectedFiles.forEach(({ message }) => toast.error(message));

      if (acceptedFiles.length > 0) {
        editor.getTransforms(PlaceholderPlugin).insert.media(createFileList(acceptedFiles));
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
