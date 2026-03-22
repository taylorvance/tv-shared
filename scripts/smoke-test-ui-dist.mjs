import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

const scriptsDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptsDir, '..');
const packageRoot = path.join(repoRoot, 'packages', 'ui');
const packageJsonPath = path.join(packageRoot, 'package.json');
const distIndexUrl = pathToFileURL(path.join(packageRoot, 'dist', 'index.js')).href;

const pkg = JSON.parse(await fs.readFile(packageJsonPath, 'utf8'));
const ui = await import(distIndexUrl);

assert.equal(typeof ui.BrandBadge, 'function');
assert.equal(typeof ui.TvProgramsMark, 'function');
assert.equal(ui.TVPROGRAMS_URL, 'https://tvprograms.tech');
assert.equal(pkg.exports['./tv.svg'], './assets/tv.svg');
assert.equal(pkg.exports['./tv.png'], './assets/tv.png');

for (const assetUrl of [ui.TVPROGRAMS_MARK_SVG_URL, ui.TVPROGRAMS_MARK_PNG_URL]) {
  const assetPath = fileURLToPath(assetUrl);
  await fs.access(assetPath);
}

const badgeMarkup = renderToStaticMarkup(React.createElement(ui.BrandBadge));
assert.match(badgeMarkup, /tvprograms\.tech/);
assert.match(badgeMarkup, /https:\/\/tvprograms\.tech/);

console.log('Built package smoke test passed.');
