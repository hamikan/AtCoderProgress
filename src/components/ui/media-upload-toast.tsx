'use client';

import * as React from 'react';

import { PlaceholderPlugin, UploadErrorCode } from '@platejs/media/react';
import { usePluginOption } from 'platejs/react';
import { toast } from 'sonner';

export function MediaUploadToast() {
  useUploadErrorToast();

  return null;
}

const useUploadErrorToast = () => {
  const uploadError = usePluginOption(PlaceholderPlugin, 'error');

  React.useEffect(() => {
    if (!uploadError) return;

    const { code, data } = uploadError;

    switch (code) {
      case UploadErrorCode.INVALID_FILE_SIZE: {
        toast.error(
          `ファイルのサイズが正しくありません: ${data.files
            .map((f) => f.name)
            .join(', ')}`
        );

        break;
      }
      case UploadErrorCode.INVALID_FILE_TYPE: {
        toast.error(
          `ファイルの形式が正しくありません: ${data.files
            .map((f) => f.name)
            .join(', ')}`
        );

        break;
      }
      case UploadErrorCode.TOO_LARGE: {
        toast.error(
          `ファイルのサイズが上限 ${data.maxFileSize} を超えています: ${data.files
            .map((f) => f.name)
            .join(', ')}`
        );

        break;
      }
      case UploadErrorCode.TOO_LESS_FILES: {
        toast.error(
          `${data.fileType}は${data.minFileCount}個以上のファイルが必要です`
        );

        break;
      }
      case UploadErrorCode.TOO_MANY_FILES: {
        toast.error(
          `${data.fileType ? `${data.fileType}の` : ''}ファイルは最大${data.maxFileCount}個までです`
        );

        break;
      }
    }
  }, [uploadError]);
};
