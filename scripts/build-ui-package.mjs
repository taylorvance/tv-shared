import { spawnSync } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptsDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptsDir, '..');
const packageRoot = path.join(repoRoot, 'packages', 'ui');
const distDir = path.join(packageRoot, 'dist');
const tsbuildinfoPath = path.join(packageRoot, 'tsconfig.tsbuildinfo');
const tscCliPath = path.join(repoRoot, 'node_modules', 'typescript', 'bin', 'tsc');

await fs.rm(distDir, { force: true, recursive: true });
await fs.rm(tsbuildinfoPath, { force: true });

const result = spawnSync(process.execPath, [tscCliPath, '-p', 'tsconfig.json'], {
  cwd: packageRoot,
  stdio: 'inherit',
});

if (result.status !== 0) {
  process.exit(result.status ?? 1);
}
