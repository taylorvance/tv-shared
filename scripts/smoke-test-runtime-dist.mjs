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
const distCodecsUrl = pathToFileURL(path.join(packageRoot, 'dist', 'codecs.js')).href;
const distStorageUrl = pathToFileURL(path.join(packageRoot, 'dist', 'storage.js')).href;
const distStorageDevUrl = pathToFileURL(path.join(packageRoot, 'dist', 'storage-dev.js')).href;
const distWordmarkUrl = pathToFileURL(path.join(packageRoot, 'dist', 'TvProgramsWordmark.js')).href;

const pkg = JSON.parse(await fs.readFile(packageJsonPath, 'utf8'));
const runtimePackage = await import(distIndexUrl);
const assets = await import(distAssetsUrl);
const brandBadgeModule = await import(distBrandBadgeUrl);
const codecsModule = await import(distCodecsUrl);
const storageModule = await import(distStorageUrl);
const storageDevModule = await import(distStorageDevUrl);
const wordmarkModule = await import(distWordmarkUrl);
const distIndexSource = await fs.readFile(path.join(packageRoot, 'dist', 'index.js'), 'utf8');

assert.equal(typeof runtimePackage.BrandBadge, 'function');
assert.equal(typeof runtimePackage.TvProgramsMark, 'function');
assert.equal(typeof runtimePackage.TvProgramsWordmark, 'function');
assert.equal(runtimePackage.TVPROGRAMS_URL, 'https://tvprograms.tech');
assert.equal(typeof runtimePackage.createProjectStorage, 'function');
assert.equal(typeof runtimePackage.usePersistentState, 'function');
assert.equal(typeof runtimePackage.useUrlState, 'function');
assert.equal(typeof runtimePackage.useDebugFlag, 'function');
assert.equal(typeof runtimePackage.useShortcutRegistry, 'function');
assert.equal(typeof runtimePackage.ShortcutPanel, 'function');
assert.equal(typeof runtimePackage.writeClipboardText, 'function');
assert.equal(typeof runtimePackage.serializeSnapshot, 'function');
assert.equal(typeof runtimePackage.useThemePreference, 'function');
assert.equal(typeof runtimePackage.LiveAnnouncer, 'function');
assert.equal(typeof brandBadgeModule.BrandBadge, 'function');
assert.equal(typeof codecsModule.createStringCodec, 'function');
assert.equal(typeof storageModule.createProjectStorage, 'function');
assert.equal(typeof storageDevModule.ProjectStorageInspector, 'function');
assert.equal(typeof wordmarkModule.TvProgramsWordmark, 'function');
assert.equal('TVPROGRAMS_MARK_SVG_URL' in runtimePackage, false);
assert.equal('TVPROGRAMS_MARK_PNG_URL' in runtimePackage, false);
assert.match(pkg.exports['./BrandBadge'].import, /dist\/BrandBadge\.js$/);
assert.match(pkg.exports['./TvProgramsWordmark'].import, /dist\/TvProgramsWordmark\.js$/);
assert.match(pkg.exports['./assets'].import, /dist\/assets\.js$/);
assert.match(pkg.exports['./codecs'].import, /dist\/codecs\.js$/);
assert.match(pkg.exports['./persistent-state'].import, /dist\/persistent-state\.js$/);
assert.match(pkg.exports['./url-state'].import, /dist\/url-state\.js$/);
assert.match(pkg.exports['./debug-flags'].import, /dist\/debug-flags\.js$/);
assert.match(pkg.exports['./shortcuts'].import, /dist\/shortcuts\.js$/);
assert.match(pkg.exports['./storage'].import, /dist\/storage\.js$/);
assert.match(pkg.exports['./share'].import, /dist\/share\.js$/);
assert.match(pkg.exports['./snapshots'].import, /dist\/snapshots\.js$/);
assert.match(pkg.exports['./theme'].import, /dist\/theme\.js$/);
assert.match(pkg.exports['./a11y'].import, /dist\/a11y\.js$/);
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
const wordmarkMarkup = renderToStaticMarkup(React.createElement(runtimePackage.TvProgramsWordmark));
assert.match(wordmarkMarkup, /TV Programs/);

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
assert.equal(codecsModule.createBooleanCodec().parse('true'), true);
assert.deepEqual(
  runtimePackage.parseSnapshot(
    runtimePackage.serializeSnapshot(
      { selectedGame: 'Onitama' },
      { capturedAt: '2026-04-18T12:00:00.000Z' },
    ),
  ),
  {
    capturedAt: '2026-04-18T12:00:00.000Z',
    value: { selectedGame: 'Onitama' },
  },
);

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
