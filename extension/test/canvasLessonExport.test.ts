import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { buildCanvasLessonExports, buildStoredZip } from '../scripts/canvasLessonExport';

describe('Canvas accessible lecture export', () => {
  it('generates one Canvas-safe page and standalone document per lecture', () => {
    const pages = buildCanvasLessonExports();
    assert.equal(pages.length, 13);
    assert.equal(new Set(pages.map((page) => page.pageTitle)).size, 13);
    for (const page of pages) {
      assert.match(page.canvasBody, /^<!-- Canvas Page title:/);
      assert.doesNotMatch(page.canvasBody, /<h1\b/i, 'Canvas supplies the page h1');
      assert.ok((page.canvasBody.match(/<h2>/g) ?? []).length >= 10);
      assert.ok((page.canvasBody.match(/<h3>/g) ?? []).length >= 4);
      assert.doesNotMatch(page.canvasBody, /<(?:script|style|img|table|iframe)\b/i);
      assert.doesNotMatch(page.canvasBody, /\b(?:click here|read more|follow this link)\b/i);
      assert.doesNotMatch(page.canvasBody, /SystemStudio|Presentation evidence used to prepare/i);
      assert.match(page.canvasBody, /This Canvas Page is the primary lecture format designed for digital accessibility/);
      assert.match(page.standaloneHtml, /<!doctype html>/i);
      assert.match(page.standaloneHtml, /<html lang="en">/);
      assert.equal((page.standaloneHtml.match(/<h1>/g) ?? []).length, 1);
      assert.match(page.standaloneHtml, /class="skip-link" href="#lecture-content"/);
      assert.equal(page.canvasBodySha256.length, 64);
      assert.equal(page.standaloneSha256.length, 64);
    }
  });

  it('creates a valid deterministic stored ZIP envelope', () => {
    const zip = buildStoredZip([
      { name: 'one.txt', data: Buffer.from('one') },
      { name: 'folder/two.html', data: Buffer.from('<p>two</p>') }
    ]);
    assert.equal(zip.readUInt32LE(0), 0x04034b50);
    assert.equal(zip.readUInt32LE(zip.length - 22), 0x06054b50);
    assert.equal(zip.readUInt16LE(zip.length - 14), 2);
    assert.equal(zip.readUInt16LE(zip.length - 12), 2);
    assert.deepEqual(zip, buildStoredZip([
      { name: 'one.txt', data: Buffer.from('one') },
      { name: 'folder/two.html', data: Buffer.from('<p>two</p>') }
    ]));
  });
});
