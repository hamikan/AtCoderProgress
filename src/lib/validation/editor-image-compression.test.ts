import assert from 'node:assert/strict';
import test from 'node:test';

import {
  EDITOR_IMAGE_COMPRESSION_TARGET_BYTES,
  EDITOR_IMAGE_COMPRESSION_MAX_WIDTH_OR_HEIGHT,
  compressEditorImageFile,
  shouldCompressEditorImage,
} from './editor-image-compression';

function imageFile(size: number, type = 'image/jpeg', name = 'photo.jpg') {
  return new File([new Uint8Array(size)], name, { lastModified: 12345, type });
}

function pngFile(animated: boolean): File {
  const chunk = (type: string, size: number) => {
    const length = Buffer.alloc(4);
    length.writeUInt32BE(size);
    return Buffer.concat([length, Buffer.from(type), Buffer.alloc(size + 4)]);
  };

  return new File([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk('IHDR', 13),
    chunk('tEXt', 32),
    ...(animated ? [chunk('acTL', 8)] : []),
    chunk('IDAT', OVER_TARGET),
  ], 'image.png', { type: 'image/png' });
}

function webpFile(animated: boolean): File {
  const header = Buffer.alloc(30);
  header.write('RIFF');
  header.writeUInt32LE(OVER_TARGET + 22, 4);
  header.write('WEBPVP8X', 8);
  header.writeUInt32LE(10, 16);
  header[20] = animated ? 0x02 : 0;

  return new File([header, new Uint8Array(OVER_TARGET)], 'image.webp', { type: 'image/webp' });
}

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

test('compressEditorImageFile compresses photos locally and preserves original metadata', async () => {
  for (const [name, type] of [
    ['photo.jpg', 'image/jpeg'],
    ['photo.png', 'image/png'],
    ['photo.webp', 'image/webp'],
  ]) {
    const original = imageFile(OVER_TARGET, type, name);
    const compressed = new File(['compressed'], 'renamed.jpg', { lastModified: 98765, type });
    let calls = 0;

    const result = await compressEditorImageFile(original, async (file, options) => {
      calls += 1;
      assert.equal(file, original);
      assert.deepEqual(options, {
        fileType: type,
        maxSizeMB: 1,
        maxWidthOrHeight: EDITOR_IMAGE_COMPRESSION_MAX_WIDTH_OR_HEIGHT,
        useWebWorker: false,
      });
      return compressed;
    });

    assert.equal(calls, 1);
    assert.equal(result.name, original.name);
    assert.equal(result.lastModified, original.lastModified);
    assert.equal(result.type, original.type);
    assert.equal(await result.text(), 'compressed');
  }
});

test('compressEditorImageFile preserves metadata when the compressor returns a same-named File', async () => {
  const original = imageFile(OVER_TARGET);
  const result = await compressEditorImageFile(original, async () =>
    new File(['compressed'], original.name, { lastModified: 98765, type: original.type })
  );

  assert.equal(await result.text(), 'compressed');
  assert.equal(result.lastModified, original.lastModified);
});

test('compressEditorImageFile restores the original MIME type when a compressed Blob omits it', async () => {
  const original = imageFile(OVER_TARGET);
  const result = await compressEditorImageFile(original, async () => new Blob(['compressed']));

  assert.equal(await result.text(), 'compressed');
  assert.equal(result.type, original.type);
  assert.equal(result.name, original.name);
  assert.equal(result.lastModified, original.lastModified);
});

test('compressEditorImageFile preserves animated PNG and WebP without running the compressor', async () => {
  for (const original of [pngFile(true), webpFile(true)]) {
    let calls = 0;
    const result = await compressEditorImageFile(original, async () => {
      calls += 1;
      return new Blob(['flattened']);
    });

    assert.equal(result, original);
    assert.equal(calls, 0);
  }
});

test('compressEditorImageFile still compresses static PNG and extended WebP images', async () => {
  for (const original of [pngFile(false), webpFile(false)]) {
    let calls = 0;
    const result = await compressEditorImageFile(original, async () => {
      calls += 1;
      return new Blob(['compressed'], { type: original.type });
    });

    assert.equal(calls, 1);
    assert.equal(await result.text(), 'compressed');
  }
});

test('compressEditorImageFile keeps the original when a browser cannot preserve its format', async () => {
  const original = imageFile(OVER_TARGET, 'image/webp', 'photo.webp');
  const result = await compressEditorImageFile(original, async () => new Blob(['png'], { type: 'image/png' }));

  assert.equal(result, original);
});

test('compressEditorImageFile keeps the original when compression fails or would increase its size', async () => {
  const original = imageFile(OVER_TARGET);

  assert.equal(await compressEditorImageFile(original, async () => { throw new Error('decode failed'); }), original);
  assert.equal(await compressEditorImageFile(original, async () => imageFile(OVER_TARGET + 1)), original);
  assert.equal(await compressEditorImageFile(original, async () => imageFile(OVER_TARGET)), original);
});

test('compressEditorImageFile skips the compressor for small images and animated GIF', async () => {
  for (const original of [
    imageFile(EDITOR_IMAGE_COMPRESSION_TARGET_BYTES),
    imageFile(OVER_TARGET, 'image/gif', 'animation.gif'),
  ]) {
    const result = await compressEditorImageFile(original, async () => {
      assert.fail('the compressor must not run for these files');
    });

    assert.equal(result, original);
  }
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
