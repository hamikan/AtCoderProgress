import type { FileRouter } from 'uploadthing/next';

import { getServerSession } from 'next-auth/next';
import { createUploadthing } from 'uploadthing/next';
import { UploadThingError } from 'uploadthing/server';

import { authOptions } from '@/lib/auth/options';
import { EDITOR_IMAGE_UPLOAD_MAX_FILE_SIZE } from '@/lib/validation/editor-image-upload';

const uploadThing = createUploadthing();

export const ourFileRouter = {
  editorUploader: uploadThing({
    image: { maxFileSize: EDITOR_IMAGE_UPLOAD_MAX_FILE_SIZE, maxFileCount: 1 },
  })
    .middleware(async () => {
      const session = await getServerSession(authOptions);

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
      url: file.url,
    })),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
