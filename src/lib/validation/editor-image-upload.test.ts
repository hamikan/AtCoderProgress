import assert from 'node:assert/strict';
import test from 'node:test';

import {
  EDITOR_IMAGE_UPLOAD_MAX_BYTES,
  validateEditorImageFile,
  validateEditorImageFileBeforeCompression,
} from './editor-image-upload';

function file(input: { name: string; size?: number; type: string }) {
  return {
    name: input.name,
    size: input.size ?? 1024,
    type: input.type,
  };
}

test('validateEditorImageFile accepts supported image files', () => {
  assert.deepEqual(validateEditorImageFile(file({ name: 'memo.png', type: 'image/png' })), {
    ok: true,
  });
  assert.deepEqual(validateEditorImageFile(file({ name: 'memo.webp', type: 'image/webp' })), {
    ok: true,
  });
});

test('pre-compression validation accepts large photos while final validation enforces 4MB', () => {
  for (const [name, type] of [
    ['photo.jpg', 'image/jpeg'],
    ['photo.png', 'image/png'],
    ['photo.webp', 'image/webp'],
  ]) {
    const photo = file({ name, size: EDITOR_IMAGE_UPLOAD_MAX_BYTES + 1, type });

    assert.deepEqual(validateEditorImageFileBeforeCompression(photo), { ok: true });
    assert.equal(validateEditorImageFile(photo).ok, false);
  }
});

test('pre-compression validation limits source photos to 64MB', () => {
  const sourceMaxBytes = 64 * 1024 * 1024;

  for (const [name, type] of [
    ['photo.jpg', 'image/jpeg'],
    ['photo.png', 'image/png'],
    ['photo.webp', 'image/webp'],
  ]) {
    assert.deepEqual(
      validateEditorImageFileBeforeCompression(file({ name, type, size: sourceMaxBytes })),
      { ok: true }
    );
    assert.deepEqual(
      validateEditorImageFileBeforeCompression(file({ name, type, size: sourceMaxBytes + 1 })),
      { message: '圧縮前の画像サイズは64MB以下にしてください。', ok: false }
    );
  }
});

test('pre-compression validation rejects oversized GIF and unsupported file formats', () => {
  assert.deepEqual(
    validateEditorImageFileBeforeCompression(
      file({ name: 'animation.gif', size: EDITOR_IMAGE_UPLOAD_MAX_BYTES + 1, type: 'image/gif' })
    ),
    { message: '画像サイズは4MB以下にしてください。', ok: false }
  );

  for (const input of [
    { name: 'photo.txt', type: 'image/png' },
    { name: 'photo.svg', type: 'image/svg+xml' },
    { name: 'photo.png', type: 'application/pdf' },
  ]) {
    const invalidFile = file({ ...input, size: EDITOR_IMAGE_UPLOAD_MAX_BYTES + 1 });
    assert.equal(validateEditorImageFileBeforeCompression(invalidFile).ok, false);
  }
});

test('pre-compression validation accepts supported images at the upload size limit', () => {
  assert.deepEqual(
    validateEditorImageFileBeforeCompression(
      file({ name: 'animation.gif', size: EDITOR_IMAGE_UPLOAD_MAX_BYTES, type: 'image/gif' })
    ),
    { ok: true }
  );
});

test('validateEditorImageFile rejects SVG images explicitly', () => {
  assert.deepEqual(validateEditorImageFile(file({ name: 'memo.svg', type: 'image/svg+xml' })), {
    message: 'SVG画像はアップロードできません。PNG、JPEG、WebP、GIFを使用してください。',
    ok: false,
  });
});

test('validateEditorImageFile rejects unsupported MIME types', () => {
  assert.deepEqual(validateEditorImageFile(file({ name: 'memo.png', type: 'application/pdf' })), {
    message: 'PNG、JPEG、WebP、GIF形式の画像だけアップロードできます。',
    ok: false,
  });
});

test('validateEditorImageFile rejects mismatched extensions and oversized files', () => {
  assert.deepEqual(validateEditorImageFile(file({ name: 'memo.txt', type: 'image/png' })), {
    message: '画像ファイルの拡張子は .png、.jpg、.jpeg、.webp、.gif のいずれかにしてください。',
    ok: false,
  });
  assert.deepEqual(
    validateEditorImageFile(file({ name: 'memo.png', size: EDITOR_IMAGE_UPLOAD_MAX_BYTES + 1, type: 'image/png' })),
    {
      message: '画像サイズは4MB以下にしてください。',
      ok: false,
    }
  );
});
