import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

const workflowPaths = [
  '.github/workflows/verify.yml',
  '.github/workflows/deploy-pages.yml',
];

function getIndent(line: string) {
  return line.match(/^\s*/)?.[0].length ?? 0;
}

function extractStepRunBlock(contents: string, stepName: string) {
  const lines = contents.split('\n');
  const stepIndex = lines.findIndex((line) => line.trim() === `- name: ${stepName}`);

  if (stepIndex === -1) {
    throw new Error(`Could not find step: ${stepName}`);
  }

  const runIndex = lines.findIndex((line, index) => (
    index > stepIndex && line.trim() === 'run: |'
  ));

  if (runIndex === -1) {
    throw new Error(`Could not find run block for step: ${stepName}`);
  }

  const runIndent = getIndent(lines[runIndex]);
  const blockIndent = runIndent + 2;
  const blockLines: string[] = [];

  for (let index = runIndex + 1; index < lines.length; index += 1) {
    const line = lines[index];

    if (line === '') {
      blockLines.push('');
      continue;
    }

    if (getIndent(line) <= runIndent) {
      break;
    }

    blockLines.push(line.slice(blockIndent));
  }

  return blockLines.join('\n');
}

function parseGithubOutput(outputPath: string) {
  if (!existsSync(outputPath)) {
    return {};
  }

  return Object.fromEntries(
    readFileSync(outputPath, 'utf8')
      .split('\n')
      .filter(Boolean)
      .map((line) => {
        const separatorIndex = line.indexOf('=');
        return [line.slice(0, separatorIndex), line.slice(separatorIndex + 1)];
      }),
  );
}

function runResolver(
  script: string,
  {
    lockfiles = [],
    packageManager = 'auto',
    workingDirectory = 'app',
  }: {
    lockfiles?: string[];
    packageManager?: string;
    workingDirectory?: string;
  } = {},
) {
  const workspace = mkdtempSync(path.join(tmpdir(), 'tv-shared-workflow-'));
  const projectDir = path.join(workspace, workingDirectory);
  const githubOutput = path.join(workspace, 'github-output');

  try {
    mkdirSync(projectDir, { recursive: true });

    for (const lockfile of lockfiles) {
      const lockfilePath = path.join(projectDir, lockfile);
      writeFileSync(lockfilePath, '');
    }

    const result = spawnSync('bash', ['-c', script], {
      encoding: 'utf8',
      env: {
        ...process.env,
        GITHUB_OUTPUT: githubOutput,
        GITHUB_WORKSPACE: workspace,
        PACKAGE_MANAGER_INPUT: packageManager,
        WORKING_DIRECTORY: workingDirectory,
      },
    });

    return {
      output: parseGithubOutput(githubOutput),
      status: result.status,
      text: `${result.stdout}${result.stderr}`,
    };
  } finally {
    rmSync(workspace, { force: true, recursive: true });
  }
}

describe.each(workflowPaths)('%s package manager support', (workflowPath) => {
  const contents = readFileSync(workflowPath, 'utf8');
  const resolverScript = extractStepRunBlock(contents, 'Resolve package manager');

  it('exposes compatible npm and pnpm inputs', () => {
    expect(contents).toContain('package-manager:');
    expect(contents).toContain('default: auto');
    expect(contents).toContain('pnpm-version:');
    expect(contents).toContain('package_json_file: ${{ inputs.working-directory }}/package.json');
  });

  it('uses the resolved package manager for setup-node cache configuration', () => {
    expect(contents).toContain('cache: ${{ steps.package_manager.outputs.manager }}');
    expect(contents).toContain(
      'cache-dependency-path: ${{ steps.package_manager.outputs.cache_dependency_path }}',
    );
  });

  it('installs pnpm explicitly without Corepack', () => {
    expect(contents).toContain('uses: pnpm/action-setup@v6');
    expect(contents).toContain("inputs.pnpm-version == ''");
    expect(contents).toContain('version: ${{ inputs.pnpm-version }}');
    expect(contents).not.toContain('corepack');
  });

  it('keeps package-manager-specific default install commands', () => {
    expect(contents).toContain('run: npm ci');
    expect(contents).toContain('run: pnpm install --frozen-lockfile');
    expect(contents).toContain("inputs.install-command != ''");
  });

  it('auto-detects pnpm from pnpm-lock.yaml', () => {
    const result = runResolver(resolverScript, { lockfiles: ['pnpm-lock.yaml'] });

    expect(result.status).toBe(0);
    expect(result.output).toEqual({
      cache_dependency_path: 'app/pnpm-lock.yaml',
      manager: 'pnpm',
    });
  });

  it('auto-detects npm from package-lock.json', () => {
    const result = runResolver(resolverScript, { lockfiles: ['package-lock.json'] });

    expect(result.status).toBe(0);
    expect(result.output).toEqual({
      cache_dependency_path: 'app/package-lock.json',
      manager: 'npm',
    });
  });

  it('auto-detects npm from npm-shrinkwrap.json', () => {
    const result = runResolver(resolverScript, { lockfiles: ['npm-shrinkwrap.json'] });

    expect(result.status).toBe(0);
    expect(result.output).toEqual({
      cache_dependency_path: 'app/npm-shrinkwrap.json',
      manager: 'npm',
    });
  });

  it('prefers pnpm-lock.yaml when auto sees multiple lockfiles', () => {
    const result = runResolver(resolverScript, {
      lockfiles: ['package-lock.json', 'pnpm-lock.yaml'],
    });

    expect(result.status).toBe(0);
    expect(result.output).toEqual({
      cache_dependency_path: 'app/pnpm-lock.yaml',
      manager: 'pnpm',
    });
  });

  it('lets explicit npm override auto detection', () => {
    const result = runResolver(resolverScript, {
      lockfiles: ['package-lock.json', 'pnpm-lock.yaml'],
      packageManager: 'npm',
    });

    expect(result.status).toBe(0);
    expect(result.output).toEqual({
      cache_dependency_path: 'app/package-lock.json',
      manager: 'npm',
    });
  });

  it('lets explicit pnpm override auto detection', () => {
    const result = runResolver(resolverScript, {
      lockfiles: ['package-lock.json', 'pnpm-lock.yaml'],
      packageManager: 'pnpm',
    });

    expect(result.status).toBe(0);
    expect(result.output).toEqual({
      cache_dependency_path: 'app/pnpm-lock.yaml',
      manager: 'pnpm',
    });
  });

  it('fails clearly when auto cannot decide', () => {
    const result = runResolver(resolverScript);

    expect(result.status).toBe(1);
    expect(result.text).toContain('Cannot detect package manager');
  });

  it('fails clearly for invalid package-manager input', () => {
    const result = runResolver(resolverScript, { packageManager: 'yarn' });

    expect(result.status).toBe(1);
    expect(result.text).toContain('Invalid package-manager');
  });

  it('fails clearly when explicit npm has no npm lockfile', () => {
    const result = runResolver(resolverScript, {
      lockfiles: ['pnpm-lock.yaml'],
      packageManager: 'npm',
    });

    expect(result.status).toBe(1);
    expect(result.text).toContain('Missing npm lockfile');
  });

  it('fails clearly when explicit pnpm has no pnpm lockfile', () => {
    const result = runResolver(resolverScript, {
      lockfiles: ['package-lock.json'],
      packageManager: 'pnpm',
    });

    expect(result.status).toBe(1);
    expect(result.text).toContain('Missing pnpm lockfile');
  });
});
