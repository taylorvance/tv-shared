import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

const scriptsDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptsDir, '..');
const webPackageRoot = path.join(repoRoot, 'runtime', 'web');
const devPackageRoot = path.join(repoRoot, 'dev', 'node');
const webPackageJsonPath = path.join(webPackageRoot, 'package.json');
const devPackageJsonPath = path.join(devPackageRoot, 'package.json');
const distIndexUrl = pathToFileURL(path.join(webPackageRoot, 'dist', 'index.js')).href;
const distAssetsUrl = pathToFileURL(path.join(webPackageRoot, 'dist', 'assets.js')).href;
const distBrandBadgeUrl = pathToFileURL(path.join(webPackageRoot, 'dist', 'BrandBadge.js')).href;
const distCodecsUrl = pathToFileURL(path.join(webPackageRoot, 'dist', 'codecs.js')).href;
const distStorageUrl = pathToFileURL(path.join(webPackageRoot, 'dist', 'storage.js')).href;
const distStorageDevUrl = pathToFileURL(path.join(webPackageRoot, 'dist', 'storage-dev.js')).href;
const distWordmarkUrl = pathToFileURL(path.join(webPackageRoot, 'dist', 'TvProgramsWordmark.js')).href;
const devPackageIndexUrl = pathToFileURL(path.join(devPackageRoot, 'index.js')).href;

const webPkg = JSON.parse(await fs.readFile(webPackageJsonPath, 'utf8'));
const devPkg = JSON.parse(await fs.readFile(devPackageJsonPath, 'utf8'));
const webPackage = await import(distIndexUrl);
const devPackage = await import(devPackageIndexUrl);
const assets = await import(distAssetsUrl);
const brandBadgeModule = await import(distBrandBadgeUrl);
const codecsModule = await import(distCodecsUrl);
const storageModule = await import(distStorageUrl);
const storageDevModule = await import(distStorageDevUrl);
const wordmarkModule = await import(distWordmarkUrl);
const distIndexSource = await fs.readFile(path.join(webPackageRoot, 'dist', 'index.js'), 'utf8');

assert.equal(typeof webPackage.BrandBadge, 'function');
assert.equal(typeof webPackage.TvProgramsMark, 'function');
assert.equal(typeof webPackage.TvProgramsWordmark, 'function');
assert.equal(webPackage.TVPROGRAMS_URL, 'https://tvprograms.tech');
assert.equal(typeof webPackage.createProjectStorage, 'function');
assert.equal(typeof webPackage.usePersistentState, 'function');
assert.equal(typeof webPackage.useUrlState, 'function');
assert.equal(typeof webPackage.useDebugFlag, 'function');
assert.equal(typeof webPackage.useShortcutRegistry, 'function');
assert.equal(typeof webPackage.ShortcutPanel, 'function');
assert.equal(typeof webPackage.writeClipboardText, 'function');
assert.equal(typeof webPackage.serializeSnapshot, 'function');
assert.equal(typeof webPackage.useThemePreference, 'function');
assert.equal(typeof webPackage.LiveAnnouncer, 'function');
assert.equal(typeof brandBadgeModule.BrandBadge, 'function');
assert.equal(typeof codecsModule.createStringCodec, 'function');
assert.equal(typeof storageModule.createProjectStorage, 'function');
assert.equal(typeof storageDevModule.ProjectStorageInspector, 'function');
assert.equal(typeof wordmarkModule.TvProgramsWordmark, 'function');
assert.equal('TVPROGRAMS_MARK_SVG_URL' in webPackage, false);
assert.equal('TVPROGRAMS_MARK_PNG_URL' in webPackage, false);
assert.match(webPkg.exports['./BrandBadge'].import, /dist\/BrandBadge\.js$/);
assert.match(webPkg.exports['./TvProgramsWordmark'].import, /dist\/TvProgramsWordmark\.js$/);
assert.match(webPkg.exports['./assets'].import, /dist\/assets\.js$/);
assert.match(webPkg.exports['./codecs'].import, /dist\/codecs\.js$/);
assert.match(webPkg.exports['./persistent-state'].import, /dist\/persistent-state\.js$/);
assert.match(webPkg.exports['./url-state'].import, /dist\/url-state\.js$/);
assert.match(webPkg.exports['./debug-flags'].import, /dist\/debug-flags\.js$/);
assert.match(webPkg.exports['./shortcuts'].import, /dist\/shortcuts\.js$/);
assert.match(webPkg.exports['./storage'].import, /dist\/storage\.js$/);
assert.match(webPkg.exports['./share'].import, /dist\/share\.js$/);
assert.match(webPkg.exports['./snapshots'].import, /dist\/snapshots\.js$/);
assert.match(webPkg.exports['./theme'].import, /dist\/theme\.js$/);
assert.match(webPkg.exports['./a11y'].import, /dist\/a11y\.js$/);
assert.match(webPkg.exports['./storage-dev'].import, /dist\/storage-dev\.js$/);
assert.equal(webPkg.exports['./tv.svg'], './assets/tv.svg');
assert.equal(webPkg.exports['./tv.png'], './assets/tv.png');
assert.equal(typeof devPackage.defineReactAppConfig, 'function');
assert.deepEqual(devPackage.prettierConfig, {
  semi: true,
  singleQuote: true,
  trailingComma: 'all',
});
assert.equal(devPkg.exports['./tsconfig/react-app.json'], './tsconfig/react-app.json');
assert.equal(devPkg.exports['./tsconfig/vite-node.json'], './tsconfig/vite-node.json');
assert.doesNotMatch(distIndexSource, /assets\.js/);

for (const assetUrl of [assets.TVPROGRAMS_MARK_SVG_URL, assets.TVPROGRAMS_MARK_PNG_URL]) {
  const assetPath = fileURLToPath(assetUrl);
  await fs.access(assetPath);
}

const badgeMarkup = renderToStaticMarkup(React.createElement(webPackage.BrandBadge));
assert.match(badgeMarkup, /tvprograms\.tech/);
assert.match(badgeMarkup, /https:\/\/tvprograms\.tech/);
const wordmarkMarkup = renderToStaticMarkup(React.createElement(webPackage.TvProgramsWordmark));
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
  webPackage.parseSnapshot(
    webPackage.serializeSnapshot(
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

const reactAppTsconfig = JSON.parse(
  await fs.readFile(path.join(devPackageRoot, 'tsconfig', 'react-app.json'), 'utf8'),
);
const viteNodeTsconfig = JSON.parse(
  await fs.readFile(path.join(devPackageRoot, 'tsconfig', 'vite-node.json'), 'utf8'),
);
const eslintConfig = devPackage.defineReactAppConfig();

assert.equal(Array.isArray(eslintConfig), true);
assert.equal(eslintConfig[0].ignores.includes('dist/**'), true);
assert.equal(reactAppTsconfig.compilerOptions.moduleResolution, 'Bundler');
assert.equal(viteNodeTsconfig.compilerOptions.composite, true);

console.log('Shared package smoke test passed.');
