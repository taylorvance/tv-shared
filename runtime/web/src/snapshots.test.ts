import { describe, expect, it, vi } from 'vitest';
import {
  copySnapshotToClipboard,
  parseSnapshot,
  serializeSnapshot,
} from './snapshots.js';

describe('snapshot helpers', () => {
  it('serializes and parses snapshots with kind and version metadata', () => {
    const rawSnapshot = serializeSnapshot(
      { moves: ['A1-B2'], seed: '123' },
      {
        capturedAt: '2026-04-18T12:00:00.000Z',
        kind: 'session',
        version: 2,
      },
    );
    const parsedSnapshot = parseSnapshot<{ moves: string[]; seed: string }>(rawSnapshot, {
      kind: 'session',
      version: 2,
    });

    expect(parsedSnapshot).toEqual({
      capturedAt: '2026-04-18T12:00:00.000Z',
      kind: 'session',
      value: {
        moves: ['A1-B2'],
        seed: '123',
      },
      version: 2,
    });
  });

  it('copies the serialized snapshot to the clipboard', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);

    await expect(copySnapshotToClipboard(
      { score: 87 },
      {
        capturedAt: '2026-04-18T12:00:00.000Z',
        navigator: { clipboard: { writeText } },
      },
    )).resolves.toBe(true);

    expect(writeText).toHaveBeenCalledTimes(1);
    expect(JSON.parse(writeText.mock.calls[0]?.[0] ?? '{}')).toMatchObject({
      payload: '{"score":87}',
    });
  });
});
