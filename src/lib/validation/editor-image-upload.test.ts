import assert from 'node:assert/strict';
import test from 'node:test';

import {
  EDITOR_IMAGE_UPLOAD_MAX_BYTES,
  validateEditorImageFile,
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
