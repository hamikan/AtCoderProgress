import {
  EDITOR_IMAGE_ACCEPT,
  validateEditorImageFile,
} from '@/lib/validation/editor-image-upload';

export { EDITOR_IMAGE_ACCEPT };

export function filterValidEditorImageFiles(files: ArrayLike<File> | Iterable<File>): {
  acceptedFiles: File[];
  rejectedFiles: Array<{ file: File; message: string }>;
} {
  return Array.from(files).reduce<{
    acceptedFiles: File[];
    rejectedFiles: Array<{ file: File; message: string }>;
  }>(
    (result, file) => {
      const validation = validateEditorImageFile(file);

      if (validation.ok) {
        return {
          ...result,
          acceptedFiles: [...result.acceptedFiles, file],
        };
      }

      return {
        ...result,
        rejectedFiles: [...result.rejectedFiles, { file, message: validation.message }],
      };
    },
    { acceptedFiles: [], rejectedFiles: [] }
  );
}

export function createFileList(files: File[]): FileList {
  const dataTransfer = new DataTransfer();
  files.forEach((file) => dataTransfer.items.add(file));

  return dataTransfer.files;
}
