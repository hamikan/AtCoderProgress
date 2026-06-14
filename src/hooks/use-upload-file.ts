import * as React from 'react';

import type { OurFileRouter } from '@/lib/uploadthing';
import type { ClientUploadedFileData } from 'uploadthing/types';

import { generateReactHelpers } from '@uploadthing/react';
import { toast } from 'sonner';
import { z } from 'zod';

import { validateEditorImageFile } from '@/lib/validation/editor-image-upload';

export type UploadedFile<T = unknown> = ClientUploadedFileData<T>;

const mockUploadsEnabled = process.env.NEXT_PUBLIC_MOCK_UPLOADS === 'true';

interface UseUploadFileProps {
  headers?: HeadersInit | (() => HeadersInit | Promise<HeadersInit>);
  onUploadBegin?: (opts: { file: string }) => void;
  onUploadComplete?: (file: UploadedFile) => void;
  onUploadError?: (error: unknown) => void;
  onUploadProgress?: (opts: { file: string; progress: number }) => void;
  skipPolling?: boolean;
}

export function useUploadFile({
  onUploadComplete,
  onUploadError,
  ...props
}: UseUploadFileProps = {}) {
  const [uploadedFile, setUploadedFile] = React.useState<UploadedFile>();
  const [uploadingFile, setUploadingFile] = React.useState<File>();
  const [progress, setProgress] = React.useState<number>(0);
  const [isUploading, setIsUploading] = React.useState(false);

  async function uploadThing(file: File) {
    const validation = validateEditorImageFile(file);
    if (!validation.ok) {
      const error = new Error(validation.message);
      toast.error(validation.message);
      onUploadError?.(error);
      return undefined;
    }

    setIsUploading(true);
    setUploadingFile(file);

    try {
      const res = await uploadFiles('editorUploader', {
        ...props,
        files: [file],
        onUploadProgress: ({ progress }) => {
          setProgress(Math.min(progress, 100));
        },
      });

      setUploadedFile(res[0]);

      onUploadComplete?.(res[0]);

      return res[0];
    } catch (error) {
      const errorMessage = getErrorMessage(error);

      const message =
        errorMessage.length > 0
          ? errorMessage
          : 'Something went wrong, please try again later.';

      toast.error(message);

      onUploadError?.(error);

      if (!mockUploadsEnabled) {
        return undefined;
      }

      // Blob URLs are only useful for explicit local mock mode; they do not
      // survive navigation and must not be treated as persisted uploads.
      toast.info('Mocking upload. This file will not persist after navigation.');

      const mockUploadedFile = {
        key: 'mock-key-0',
        customId: null,
        name: file.name,
        serverData: null,
        size: file.size,
        type: file.type,
        url: URL.createObjectURL(file),
      } as UploadedFile;

      // Simulate upload progress
      let progress = 0;

      const simulateProgress = async () => {
        while (progress < 100) {
          await new Promise((resolve) => setTimeout(resolve, 50));
          progress += 2;
          setProgress(Math.min(progress, 100));
        }
      };

      await simulateProgress();

      setUploadedFile(mockUploadedFile);

      return mockUploadedFile;
    } finally {
      setProgress(0);
      setIsUploading(false);
      setUploadingFile(undefined);
    }
  }

  return {
    isUploading,
    progress,
    uploadedFile,
    uploadFile: uploadThing,
    uploadingFile,
  };
}

export const { uploadFiles, useUploadThing } =
  generateReactHelpers<OurFileRouter>();

export function getErrorMessage(err: unknown) {
  const unknownError = 'Something went wrong, please try again later.';

  if (err instanceof z.ZodError) {
    const errors = err.issues.map((issue) => issue.message);

    return errors.join('\n');
  }
  if (err instanceof Error) {
    return err.message;
  }
  return unknownError;
}

export function showErrorToast(err: unknown) {
  const errorMessage = getErrorMessage(err);

  return toast.error(errorMessage);
}
