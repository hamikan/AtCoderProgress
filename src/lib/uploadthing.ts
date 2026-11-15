import 'server-only';

import type { FileRouter } from 'uploadthing/next';

import { createUploadthing } from 'uploadthing/next';
import { UploadThingError } from 'uploadthing/server';

import { getAuthSession } from '@/lib/auth/session';
import {
  EDITOR_IMAGE_ACCEPT,
  EDITOR_IMAGE_UPLOAD_MAX_FILE_SIZE,
} from '@/lib/validation/editor-image-upload';

const uploadThing = createUploadthing();

// `image` とだけ書くと SVG（スクリプトを入れられる）も通るので、画面側と同じ種類だけをサーバーでも許す
const editorImageRouteConfig = Object.fromEntries(
  EDITOR_IMAGE_ACCEPT.map((mimeType) => [
    mimeType,
    { maxFileSize: EDITOR_IMAGE_UPLOAD_MAX_FILE_SIZE, maxFileCount: 1 },
  ])
) as Record<
  (typeof EDITOR_IMAGE_ACCEPT)[number],
  { maxFileSize: typeof EDITOR_IMAGE_UPLOAD_MAX_FILE_SIZE; maxFileCount: 1 }
>;

export const ourFileRouter = {
  editorUploader: uploadThing(editorImageRouteConfig)
    .middleware(async () => {
      const session = await getAuthSession();

      if (!session?.user?.id) {
        throw new UploadThingError('Unauthorized');
      }

      return { userId: session.user.id };
    })
    .onUploadComplete(({ file, metadata }) => ({
      key: file.key,
      name: file.name,
      size: file.size,
      type: file.type,
      userId: metadata.userId,
      url: file.ufsUrl,
    })),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
