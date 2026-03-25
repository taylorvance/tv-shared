import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

const scriptsDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptsDir, '..');
const packageRoot = path.join(repoRoot, 'runtime', 'node', 'tv-shared-runtime');
const packageJsonPath = path.join(packageRoot, 'package.json');
const distIndexUrl = pathToFileURL(path.join(packageRoot, 'dist', 'index.js')).href;
const distAssetsUrl = pathToFileURL(path.join(packageRoot, 'dist', 'assets.js')).href;
const distBrandBadgeUrl = pathToFileURL(path.join(packageRoot, 'dist', 'BrandBadge.js')).href;

const pkg = JSON.parse(await fs.readFile(packageJsonPath, 'utf8'));
const runtimePackage = await import(distIndexUrl);
const assets = await import(distAssetsUrl);
const brandBadgeModule = await import(distBrandBadgeUrl);
const distIndexSource = await fs.readFile(path.join(packageRoot, 'dist', 'index.js'), 'utf8');

assert.equal(typeof runtimePackage.BrandBadge, 'function');
assert.equal(typeof runtimePackage.TvProgramsMark, 'function');
assert.equal(runtimePackage.TVPROGRAMS_URL, 'https://tvprograms.tech');
assert.equal(typeof brandBadgeModule.BrandBadge, 'function');
assert.equal('TVPROGRAMS_MARK_SVG_URL' in runtimePackage, false);
assert.equal('TVPROGRAMS_MARK_PNG_URL' in runtimePackage, false);
assert.match(pkg.exports['./BrandBadge'].import, /dist\/BrandBadge\.js$/);
assert.match(pkg.exports['./assets'].import, /dist\/assets\.js$/);
assert.equal(pkg.exports['./tv.svg'], './assets/tv.svg');
assert.equal(pkg.exports['./tv.png'], './assets/tv.png');
assert.doesNotMatch(distIndexSource, /assets\.js/);

for (const assetUrl of [assets.TVPROGRAMS_MARK_SVG_URL, assets.TVPROGRAMS_MARK_PNG_URL]) {
  const assetPath = fileURLToPath(assetUrl);
  await fs.access(assetPath);
}

const badgeMarkup = renderToStaticMarkup(React.createElement(runtimePackage.BrandBadge));
assert.match(badgeMarkup, /tvprograms\.tech/);
assert.match(badgeMarkup, /https:\/\/tvprograms\.tech/);

console.log('Built package smoke test passed.');
