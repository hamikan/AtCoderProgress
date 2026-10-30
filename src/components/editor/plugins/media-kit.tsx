'use client';

import { CaptionPlugin } from '@platejs/caption/react';
import {
  ImagePlugin,
  PlaceholderPlugin,
} from '@platejs/media/react';
import { KEYS } from 'platejs';

import { ImageElement } from '@/components/ui/media-image-node';
import { PlaceholderElement } from '@/components/ui/media-placeholder-node';
import { MediaPreviewDialog } from '@/components/ui/media-preview-dialog';
import { MediaUploadToast } from '@/components/ui/media-upload-toast';
import { EDITOR_IMAGE_UPLOAD_SOURCE_MAX_FILE_SIZE } from '@/lib/validation/editor-image-upload';

export const MediaKit = [
  ImagePlugin.configure({
    options: { disableUploadInsert: true },
    render: { afterEditable: MediaPreviewDialog, node: ImageElement },
  }),
  PlaceholderPlugin.configure({
    options: {
      disableEmptyPlaceholder: true,
      uploadConfig: {
        image: {
          maxFileCount: 3,
          maxFileSize: EDITOR_IMAGE_UPLOAD_SOURCE_MAX_FILE_SIZE,
          mediaType: KEYS.img,
          minFileCount: 1,
        },
      },
    },
    render: { afterEditable: MediaUploadToast, node: PlaceholderElement },
  }),
  CaptionPlugin.configure({
    options: {
      query: {
        allow: [KEYS.img],
      },
    },
  }),
];
