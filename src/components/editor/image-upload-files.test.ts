import assert from 'node:assert/strict';
import test from 'node:test';

import { EDITOR_IMAGE_UPLOAD_MAX_BYTES } from '@/lib/validation/editor-image-upload';

import { filterValidEditorImageFiles } from './image-upload-files';

function imageFile(name: string, type: string, size: number): File {
  return new File([new Uint8Array(size)], name, { type });
}

test('file selection preserves large compressible photos for the upload preparation step', () => {
  const files = [
    imageFile('photo.jpg', 'image/jpeg', EDITOR_IMAGE_UPLOAD_MAX_BYTES + 1),
    imageFile('photo.png', 'image/png', EDITOR_IMAGE_UPLOAD_MAX_BYTES + 1),
    imageFile('photo.webp', 'image/webp', EDITOR_IMAGE_UPLOAD_MAX_BYTES + 1),
  ];

  const result = filterValidEditorImageFiles(files);

  assert.deepEqual(result.acceptedFiles, files);
  assert.deepEqual(result.rejectedFiles, []);
});

test('file selection rejects large GIF and invalid formats while retaining valid images', () => {
  const smallGif = imageFile('animation.gif', 'image/gif', 1024);
  const largeGif = imageFile('large.gif', 'image/gif', EDITOR_IMAGE_UPLOAD_MAX_BYTES + 1);
  const invalidExtension = imageFile('photo.txt', 'image/png', EDITOR_IMAGE_UPLOAD_MAX_BYTES + 1);
  const svg = imageFile('photo.svg', 'image/svg+xml', EDITOR_IMAGE_UPLOAD_MAX_BYTES + 1);

  const result = filterValidEditorImageFiles(new Set([smallGif, largeGif, invalidExtension, svg]));

  assert.deepEqual(result.acceptedFiles, [smallGif]);
  assert.deepEqual(result.rejectedFiles.map(({ file }) => file), [largeGif, invalidExtension, svg]);
  assert.ok(result.rejectedFiles.every(({ message }) => message.length > 0));
});
