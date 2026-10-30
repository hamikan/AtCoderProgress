import assert from 'node:assert/strict';
import test from 'node:test';

import {
  EDITOR_IMAGE_COMPRESSION_TARGET_BYTES,
  shouldCompressEditorImage,
} from './editor-image-compression';

function file(input: { name: string; size?: number; type: string }) {
  return {
    name: input.name,
    size: input.size ?? 1024,
    type: input.type,
  };
}

const OVER_TARGET = EDITOR_IMAGE_COMPRESSION_TARGET_BYTES + 1;

test('shouldCompressEditorImage compresses large JPEG, PNG and WebP files', () => {
  assert.equal(
    shouldCompressEditorImage(file({ name: 'photo.jpg', size: OVER_TARGET, type: 'image/jpeg' })),
    true
  );
  assert.equal(
    shouldCompressEditorImage(file({ name: 'photo.png', size: OVER_TARGET, type: 'image/png' })),
    true
  );
  assert.equal(
    shouldCompressEditorImage(file({ name: 'photo.webp', size: OVER_TARGET, type: 'image/webp' })),
    true
  );
});

test('shouldCompressEditorImage keeps files at or under the target size as-is', () => {
  assert.equal(
    shouldCompressEditorImage(
      file({ name: 'photo.jpg', size: EDITOR_IMAGE_COMPRESSION_TARGET_BYTES, type: 'image/jpeg' })
    ),
    false
  );
  assert.equal(shouldCompressEditorImage(file({ name: 'photo.png', type: 'image/png' })), false);
});

test('shouldCompressEditorImage never compresses GIF or unsupported types', () => {
  assert.equal(
    shouldCompressEditorImage(file({ name: 'anim.gif', size: OVER_TARGET, type: 'image/gif' })),
    false
  );
  assert.equal(
    shouldCompressEditorImage(file({ name: 'memo.svg', size: OVER_TARGET, type: 'image/svg+xml' })),
    false
  );
  assert.equal(
    shouldCompressEditorImage(file({ name: 'doc.pdf', size: OVER_TARGET, type: 'application/pdf' })),
    false
  );
});
