import { execFileSync, spawnSync } from 'node:child_process';

import { describe, expect, it } from 'vitest';

const scriptPath = 'scripts/release-workflows.mjs';

describe('workflow release script', () => {
  it('prints a dry-run plan for immutable and floating workflow tags', () => {
    const output = execFileSync(process.execPath, [
      scriptPath,
      'v999.998.997',
      '--skip-verify',
      '--allow-dirty',
      '--allow-non-main',
      '--skip-remote-check',
    ], {
      encoding: 'utf8',
    });

    expect(output).toContain('Workflow release: v999.998.997');
    expect(output).toContain('Floating major tag: v999');
    expect(output).toContain('Mode: dry-run');
    expect(output).toContain('git tag -a v999.998.997 -m v999.998.997');
    expect(output).toContain('git tag -fa v999 -m v999');
    expect(output).toContain('git push origin v999.998.997');
    expect(output).toContain('git push --force origin v999');
  });

  it('rejects non-immutable workflow release tags', () => {
    const result = spawnSync(process.execPath, [
      scriptPath,
      'v1',
      '--skip-verify',
      '--allow-dirty',
      '--allow-non-main',
      '--skip-remote-check',
    ], {
      encoding: 'utf8',
    });

    expect(result.status).toBe(1);
    expect(result.stderr).toContain('Workflow release version must be an immutable semver tag');
  });
});
