import type { FileRouter } from 'uploadthing/next';

import { getServerSession } from 'next-auth/next';
import { createUploadthing } from 'uploadthing/next';
import { UploadThingError } from 'uploadthing/server';

import { authOptions } from '@/lib/auth/options';

const f = createUploadthing();

export const ourFileRouter = {
  editorUploader: f({
    image: { maxFileSize: '4MB', maxFileCount: 1 },
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
