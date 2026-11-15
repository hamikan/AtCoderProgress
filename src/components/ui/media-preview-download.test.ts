import assert from 'node:assert/strict';
import test from 'node:test';

import { getMediaFileName, isHttpUrl, withImageExtension } from './media-preview-download';

test('getMediaFileName uses the last path segment of the URL', () => {
  assert.equal(
    getMediaFileName('https://utfs.io/f/abc123-photo.png'),
    'abc123-photo.png'
  );
  assert.equal(
    getMediaFileName('https://example.com/images/diagram.webp?w=800#frag'),
    'diagram.webp'
  );
});

test('getMediaFileName decodes percent-encoded names', () => {
  assert.equal(
    getMediaFileName('https://example.com/%E5%9B%B3.png'),
    '図.png'
  );
});

test('getMediaFileName falls back to image when there is no usable segment', () => {
  assert.equal(getMediaFileName('https://example.com/'), 'image');
  assert.equal(getMediaFileName('https://example.com'), 'image');
});

test('getMediaFileName never returns a path', () => {
  assert.equal(
    getMediaFileName('https://example.com/a%2Fb.png'),
    'a_b.png'
  );
});

test('withImageExtension appends an extension from the blob type', () => {
  assert.equal(withImageExtension('abc123', 'image/png'), 'abc123.png');
  assert.equal(withImageExtension('abc123', 'image/jpeg'), 'abc123.jpg');
  assert.equal(
    withImageExtension('abc123', 'image/webp; charset=binary'),
    'abc123.webp'
  );
});

test('withImageExtension keeps existing extensions and unknown types', () => {
  assert.equal(withImageExtension('photo.gif', 'image/png'), 'photo.gif');
  assert.equal(withImageExtension('abc123', 'application/octet-stream'), 'abc123');
});

test('isHttpUrl accepts only http and https URLs', () => {
  const base = 'https://app.example/solutions/1';

  assert.equal(isHttpUrl('https://x.ufs.sh/f/abc', base), true);
  assert.equal(isHttpUrl('http://localhost:1207/image.png', base), true);
  assert.equal(isHttpUrl('/images/a.png', base), true);
  assert.equal(isHttpUrl('javascript:alert(1)', base), false);
  assert.equal(isHttpUrl('data:text/html,<script>alert(1)</script>', base), false);
  assert.equal(isHttpUrl('blob:https://app.example/1234', base), false);
});
