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
const distStorageUrl = pathToFileURL(path.join(packageRoot, 'dist', 'storage.js')).href;
const distStorageDevUrl = pathToFileURL(path.join(packageRoot, 'dist', 'storage-dev.js')).href;

const pkg = JSON.parse(await fs.readFile(packageJsonPath, 'utf8'));
const runtimePackage = await import(distIndexUrl);
const assets = await import(distAssetsUrl);
const brandBadgeModule = await import(distBrandBadgeUrl);
const storageModule = await import(distStorageUrl);
const storageDevModule = await import(distStorageDevUrl);
const distIndexSource = await fs.readFile(path.join(packageRoot, 'dist', 'index.js'), 'utf8');

assert.equal(typeof runtimePackage.BrandBadge, 'function');
assert.equal(typeof runtimePackage.TvProgramsMark, 'function');
assert.equal(runtimePackage.TVPROGRAMS_URL, 'https://tvprograms.tech');
assert.equal(typeof runtimePackage.createProjectStorage, 'function');
assert.equal(typeof brandBadgeModule.BrandBadge, 'function');
assert.equal(typeof storageModule.createProjectStorage, 'function');
assert.equal(typeof storageDevModule.ProjectStorageInspector, 'function');
assert.equal('TVPROGRAMS_MARK_SVG_URL' in runtimePackage, false);
assert.equal('TVPROGRAMS_MARK_PNG_URL' in runtimePackage, false);
assert.match(pkg.exports['./BrandBadge'].import, /dist\/BrandBadge\.js$/);
assert.match(pkg.exports['./assets'].import, /dist\/assets\.js$/);
assert.match(pkg.exports['./storage'].import, /dist\/storage\.js$/);
assert.match(pkg.exports['./storage-dev'].import, /dist\/storage-dev\.js$/);
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

const memoryStorage = new Map();
const storage = storageModule.createProjectStorage('mcts-web', {
  storage: {
    get length() {
      return memoryStorage.size;
    },
    getItem(key) {
      return memoryStorage.get(key) ?? null;
    },
    key(index) {
      return [...memoryStorage.keys()].sort()[index] ?? null;
    },
    setItem(key, value) {
      memoryStorage.set(key, value);
    },
    removeItem(key) {
      memoryStorage.delete(key);
    },
  },
  version: 1,
});

storage.writeJson({ selectedGame: 'Onitama' }, 'app');
assert.equal(memoryStorage.get('mcts-web:v1:app'), '{"selectedGame":"Onitama"}');
assert.deepEqual(storage.readJson('app'), { selectedGame: 'Onitama' });
assert.deepEqual(storage.list(), [{
  fullKey: 'mcts-web:v1:app',
  keyParts: ['app'],
  rawValue: '{"selectedGame":"Onitama"}',
  relativeKey: 'app',
}]);

const inspectorMarkup = renderToStaticMarkup(React.createElement(
  storageDevModule.ProjectStorageInspector,
  {
    projectKey: 'mcts-web',
    storage: {
      get length() {
        return memoryStorage.size;
      },
      getItem(key) {
        return memoryStorage.get(key) ?? null;
      },
      key(index) {
        return [...memoryStorage.keys()].sort()[index] ?? null;
      },
      removeItem(key) {
        memoryStorage.delete(key);
      },
      setItem(key, value) {
        memoryStorage.set(key, value);
      },
    },
    version: 1,
  },
));
assert.match(inspectorMarkup, /Project Storage Inspector/);

console.log('Built package smoke test passed.');
