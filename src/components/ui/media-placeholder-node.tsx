'use client';

import * as React from 'react';

import type { TPlaceholderElement } from 'platejs';
import type { PlateElementProps } from 'platejs/react';

import {
  PlaceholderPlugin,
  PlaceholderProvider,
  updateUploadHistory,
} from '@platejs/media/react';
import { ImageIcon, Loader2Icon } from 'lucide-react';
import { KEYS } from 'platejs';
import { PlateElement, useEditorPlugin, withHOC } from 'platejs/react';
import { toast } from 'sonner';
import { useFilePicker } from 'use-file-picker';

import { cn } from '@/lib/utils';
import { useUploadFile } from '@/hooks/use-upload-file';
import {
  createFileList,
  EDITOR_IMAGE_ACCEPT,
  filterValidEditorImageFiles,
} from '@/components/editor/image-upload-files';
import { validateEditorImageFile } from '@/lib/validation/editor-image-upload';

const IMAGE_CONTENT = {
  accept: [...EDITOR_IMAGE_ACCEPT],
  content: 'Add an image',
  icon: <ImageIcon />,
};

export const PlaceholderElement = withHOC(
  PlaceholderProvider,
  function PlaceholderElement(props: PlateElementProps<TPlaceholderElement>) {
    const { editor, element } = props;

    const { api } = useEditorPlugin(PlaceholderPlugin);

    const { isUploading, progress, uploadedFile, uploadFile, uploadingFile } =
      useUploadFile();

    const loading = isUploading && !!uploadingFile;

    const imageRef = React.useRef<HTMLImageElement>(null);

    const { openFilePicker } = useFilePicker({
      accept: IMAGE_CONTENT.accept,
      multiple: true,
      onFilesSelected: ({ plainFiles: updatedFiles }) => {
        const { acceptedFiles, rejectedFiles } = filterValidEditorImageFiles(updatedFiles);
        rejectedFiles.forEach(({ message }) => toast.error(message));

        const firstFile = acceptedFiles[0];
        const restFiles = acceptedFiles.slice(1);

        if (!firstFile) return;

        replaceCurrentPlaceholder(firstFile);

        if (restFiles.length > 0) {
          editor.getTransforms(PlaceholderPlugin).insert.media(createFileList(restFiles));
        }
      },
    });

    const replaceCurrentPlaceholder = React.useCallback(
      (file: File) => {
        const validation = validateEditorImageFile(file);
        if (!validation.ok) {
          toast.error(validation.message);
          return;
        }

        void uploadFile(file);
        api.placeholder.addUploadingFile(element.id as string, file);
      },
      [api.placeholder, element.id, uploadFile]
    );

    React.useEffect(() => {
      if (!uploadedFile) return;

      const path = editor.api.findPath(element);

      editor.tf.withoutSaving(() => {
        editor.tf.removeNodes({ at: path });

        const node = {
          children: [{ text: '' }],
          initialHeight: imageRef.current?.height,
          initialWidth: imageRef.current?.width,
          isUpload: true,
          name: '',
          placeholderId: element.id as string,
          type: KEYS.img,
          url: uploadedFile.url,
        };

        editor.tf.insertNodes(node, { at: path });

        updateUploadHistory(editor, node);
      });

      api.placeholder.removeUploadingFile(element.id as string);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [uploadedFile, element.id]);

    // React dev mode will call React.useEffect twice
    const isReplaced = React.useRef(false);

    /** Paste and drop */
    React.useEffect(() => {
      if (isReplaced.current) return;

      isReplaced.current = true;
      const currentFiles = api.placeholder.getUploadingFile(
        element.id as string
      );

      if (!currentFiles) return;

      replaceCurrentPlaceholder(currentFiles);

      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isReplaced]);

    return (
      <PlateElement className="my-1" {...props}>
        {!loading && (
          <div
            className={cn(
              'flex cursor-pointer select-none items-center rounded-sm bg-muted p-3 pr-9 hover:bg-primary/10'
            )}
            onClick={() => !loading && openFilePicker()}
            contentEditable={false}
          >
            <div className="relative mr-3 flex text-muted-foreground/80 [&_svg]:size-6">
              {IMAGE_CONTENT.icon}
            </div>
            <div className="whitespace-nowrap text-muted-foreground text-sm">
              <div>
                {loading ? uploadingFile?.name : IMAGE_CONTENT.content}
              </div>
            </div>
          </div>
        )}

        {loading && uploadingFile && (
          <ImageProgress
            file={uploadingFile}
            imageRef={imageRef}
            progress={progress}
          />
        )}

        {props.children}
      </PlateElement>
    );
  }
);

export function ImageProgress({
  className,
  file,
  imageRef,
  progress = 0,
}: {
  file: File;
  className?: string;
  imageRef?: React.RefObject<HTMLImageElement | null>;
  progress?: number;
}) {
  const [objectUrl, setObjectUrl] = React.useState<string | null>(null);

  React.useEffect(() => {
    const url = URL.createObjectURL(file);
    setObjectUrl(url);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [file]);

  if (!objectUrl) {
    return null;
  }

  return (
    <div className={cn('relative', className)} contentEditable={false}>
      {/* eslint-disable-next-line @next/next/no-img-element -- upload previews use temporary blob URLs that are not Next-managed assets. */}
      <img
        ref={imageRef}
        className="h-auto w-full rounded-sm object-cover"
        alt={file.name}
        src={objectUrl}
      />
      {progress < 100 && (
        <div className="absolute right-1 bottom-1 flex items-center space-x-2 rounded-full bg-black/50 px-1 py-0.5">
          <Loader2Icon className="size-3.5 animate-spin text-muted-foreground" />
          <span className="font-medium text-white text-xs">
            {Math.round(progress)}%
          </span>
        </div>
      )}
    </div>
  );
}
