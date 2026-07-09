import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptsDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptsDir, '..');

function usage() {
  console.log(`Usage: npm run release:workflows -- vX.Y.Z [options]

Options:
  --execute            Create local git tags. Without this flag, only print the plan.
  --push               Push tags to origin. Requires --execute.
  --skip-verify        Skip npm run verify.
  --allow-dirty        Allow a dirty worktree.
  --allow-non-main     Allow releasing from a branch other than main.
  --skip-remote-check  Skip checking origin for an existing immutable tag.
`);
}

function fail(message) {
  console.error(message);
  process.exit(1);
}

function run(command, args, options = {}) {
  return execFileSync(command, args, {
    cwd: repoRoot,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    ...options,
  }).trim();
}

function runInherited(command, args) {
  execFileSync(command, args, {
    cwd: repoRoot,
    stdio: 'inherit',
  });
}

function hasFlag(flags, flag) {
  return flags.includes(flag);
}

function formatCommand(command, args) {
  return [command, ...args].join(' ');
}

const [versionArg, ...flags] = process.argv.slice(2);

if (!versionArg || hasFlag(flags, '--help') || hasFlag(flags, '-h')) {
  usage();
  process.exit(versionArg ? 0 : 1);
}

const unknownFlag = flags.find((flag) => ![
  '--execute',
  '--push',
  '--skip-verify',
  '--allow-dirty',
  '--allow-non-main',
  '--skip-remote-check',
].includes(flag));

if (unknownFlag) {
  fail(`Unknown option: ${unknownFlag}`);
}

const versionMatch = /^v([1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/.exec(versionArg);

if (!versionMatch) {
  fail('Workflow release version must be an immutable semver tag like v1.2.3.');
}

const majorTag = `v${versionMatch[1]}`;
const execute = hasFlag(flags, '--execute');
const push = hasFlag(flags, '--push');
const skipVerify = hasFlag(flags, '--skip-verify');
const allowDirty = hasFlag(flags, '--allow-dirty');
const allowNonMain = hasFlag(flags, '--allow-non-main');
const skipRemoteCheck = hasFlag(flags, '--skip-remote-check');

if (push && !execute) {
  fail('--push requires --execute.');
}

const currentBranch = run('git', ['branch', '--show-current']);

if (execute && currentBranch !== 'main' && !allowNonMain) {
  fail(`Workflow releases must be created from main. Current branch: ${currentBranch || '(detached)'}.`);
}

const status = run('git', ['status', '--porcelain']);

if (execute && status && !allowDirty) {
  fail('Working tree must be clean before creating workflow release tags.');
}

const localExactTag = run('git', ['tag', '--list', versionArg]);

if (localExactTag) {
  fail(`Tag ${versionArg} already exists locally.`);
}

if (execute && !skipRemoteCheck) {
  const remoteExactTag = run('git', ['ls-remote', '--tags', 'origin', versionArg]);

  if (remoteExactTag) {
    fail(`Tag ${versionArg} already exists on origin.`);
  }
}

const commands = [
  ['git', ['tag', '-a', versionArg, '-m', versionArg]],
  ['git', ['tag', '-fa', majorTag, '-m', majorTag]],
  ['git', ['push', 'origin', versionArg]],
  ['git', ['push', '--force', 'origin', majorTag]],
];

console.log(`Workflow release: ${versionArg}`);
console.log(`Floating major tag: ${majorTag}`);
console.log(`Mode: ${execute ? 'execute' : 'dry-run'}`);
console.log('');

if (!skipVerify) {
  console.log('Verification: npm run verify');

  if (execute) {
    runInherited('npm', ['run', 'verify']);
  }
} else {
  console.log('Verification: skipped');
}

console.log('');
console.log('Tag commands:');

for (const [command, args] of commands.slice(0, 2)) {
  console.log(formatCommand(command, args));

  if (execute) {
    runInherited(command, args);
  }
}

console.log('');
console.log('Push commands:');

for (const [command, args] of commands.slice(2)) {
  console.log(formatCommand(command, args));

  if (push) {
    runInherited(command, args);
  }
}

if (!execute) {
  console.log('');
  console.log('Dry run only. Add --execute to create local tags.');
} else if (!push) {
  console.log('');
  console.log('Local tags created. Add --push to push release tags to origin.');
}
