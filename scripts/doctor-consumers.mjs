import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptsDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptsDir, '..');
const workspaceRoot = path.resolve(repoRoot, '..');

const repoNames = [
  'tvprograms',
  'mcts-web',
  'wordlink',
  'bog',
  'traingame',
  'dice',
  'timers',
  'yajilin',
];

const readFileIfPresent = async (filePath) => {
  try {
    return await fs.readFile(filePath, 'utf8');
  } catch {
    return null;
  }
};

const readJsonIfPresent = async (filePath) => {
  const fileContents = await readFileIfPresent(filePath);

  if(fileContents === null) {
    return null;
  }

  return JSON.parse(fileContents);
};

const listFilesIfPresent = async (directoryPath) => {
  try {
    return await fs.readdir(directoryPath, { withFileTypes: true });
  } catch {
    return [];
  }
};

const getWorkflowStatus = async (repoPath) => {
  const workflowEntries = await listFilesIfPresent(path.join(repoPath, '.github', 'workflows'));
  const workflowFiles = await Promise.all(
    workflowEntries
      .filter((entry) => entry.isFile() && entry.name.endsWith('.yml'))
      .map(async (entry) => ({
        contents: await readFileIfPresent(path.join(repoPath, '.github', 'workflows', entry.name)),
        name: entry.name,
      })),
  );
  const sharedVerifyWorkflow = workflowFiles.some((file) => (
    file.contents?.includes('taylorvance/tv-shared/.github/workflows/verify.yml')
  ));
  const sharedDeployWorkflow = workflowFiles.some((file) => (
    file.contents?.includes('taylorvance/tv-shared/.github/workflows/deploy-pages.yml')
  ));

  return {
    sharedDeployWorkflow,
    sharedVerifyWorkflow,
  };
};

const getAppSourceStatus = async (repoPath) => {
  const srcEntries = await listFilesIfPresent(path.join(repoPath, 'src'));
  const candidateFiles = srcEntries
    .filter((entry) => entry.isFile() && /\.(ts|tsx|js|jsx|mjs|cjs)$/.test(entry.name))
    .map((entry) => path.join(repoPath, 'src', entry.name));
  const fileContents = await Promise.all(candidateFiles.map((filePath) => readFileIfPresent(filePath)));
  const joinedSource = fileContents.filter(Boolean).join('\n');

  return {
    usesWebPackage: joinedSource.includes('@taylorvance/tv-shared-web'),
    usesUiPackage: joinedSource.includes('@taylorvance/tv-shared-ui'),
  };
};

const formatFlag = (value) => value ? 'yes' : 'no';

console.log('tv-shared consumer doctor');
console.log('');

for(const repoName of repoNames) {
  const repoPath = path.join(workspaceRoot, repoName);
  const packageJson = await readJsonIfPresent(path.join(repoPath, 'package.json'));

  if(packageJson === null) {
    console.log(`${repoName}: missing package.json or repo not found`);
    console.log('');
    continue;
  }

  const dependencies = {
    ...(packageJson.dependencies ?? {}),
    ...(packageJson.devDependencies ?? {}),
  };
  const workflowStatus = await getWorkflowStatus(repoPath);
  const sourceStatus = await getAppSourceStatus(repoPath);

  console.log(`${repoName}:`);
  console.log(`  web package: ${dependencies['@taylorvance/tv-shared-web'] ?? 'no'}`);
  console.log(`  dev package: ${dependencies['@taylorvance/tv-shared-dev'] ?? 'no'}`);
  console.log(`  legacy ui package: ${dependencies['@taylorvance/tv-shared-ui'] ?? 'no'}`);
  console.log(`  legacy config package: ${dependencies['@taylorvance/tv-shared-config'] ?? 'no'}`);
  console.log(`  verify script: ${formatFlag(Boolean(packageJson.scripts?.verify))}`);
  console.log(`  shared verify workflow: ${formatFlag(workflowStatus.sharedVerifyWorkflow)}`);
  console.log(`  shared deploy workflow: ${formatFlag(workflowStatus.sharedDeployWorkflow)}`);
  console.log(`  source imports web: ${formatFlag(sourceStatus.usesWebPackage)}`);
  console.log(`  source imports legacy ui: ${formatFlag(sourceStatus.usesUiPackage)}`);
  console.log('');
}

console.log('Note: this is a read-only audit. It does not modify sibling repos.');
