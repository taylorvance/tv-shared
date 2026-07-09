import { readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

const workflowDocPaths = [
  'README.md',
  ...listDocsFiles('docs'),
];

function listDocsFiles(directory) {
  return readdirSync(directory)
    .flatMap((entry) => {
      const filePath = path.join(directory, entry);
      const stat = statSync(filePath);

      if (stat.isDirectory()) {
        return listDocsFiles(filePath);
      }

      return /\.(md|ya?ml)$/.test(entry) ? [filePath] : [];
    });
}

describe('documented reusable workflow refs', () => {
  it('does not recommend tracking tv-shared main', () => {
    const trackedMainPattern = /taylorvance\/tv-shared\/\.github\/workflows\/.+@main/g;

    const matches = workflowDocPaths.flatMap((filePath) => {
      const contents = readFileSync(filePath, 'utf8');
      return Array.from(contents.matchAll(trackedMainPattern), (match) => (
        `${filePath}: ${match[0]}`
      ));
    });

    expect(matches).toEqual([]);
  });

  it('uses the floating major workflow release tag in copyable examples', () => {
    const workflowRefPattern = /taylorvance\/tv-shared\/\.github\/workflows\/.+@(v\d+)/g;

    const refs = [
      'docs/examples/ci.yml',
      'docs/examples/deploy.yml',
    ].flatMap((filePath) => {
      const contents = readFileSync(filePath, 'utf8');
      return Array.from(contents.matchAll(workflowRefPattern), (match) => match[1]);
    });

    expect(refs).toEqual(['v1', 'v1']);
  });
});
