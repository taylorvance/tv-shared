import { describe, expect, it, vi } from 'vitest';
import {
  formatShareContent,
  shareContent,
  writeClipboardText,
} from './share.js';

describe('share helpers', () => {
  it('formats share content in a clipboard-friendly order', () => {
    expect(formatShareContent({
      text: 'Puzzle solved in 42 moves.',
      title: 'Wordlink',
      url: 'https://example.com/run/42',
    })).toBe('Wordlink\n\nPuzzle solved in 42 moves.\n\nhttps://example.com/run/42');
  });

  it('writes to the clipboard when available', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);

    await expect(writeClipboardText('hello', {
      navigator: { clipboard: { writeText } },
    })).resolves.toBe(true);
    expect(writeText).toHaveBeenCalledWith('hello');
  });

  it('prefers the Web Share API and falls back to the clipboard when needed', async () => {
    const share = vi.fn().mockRejectedValue(new Error('no share target'));
    const writeText = vi.fn().mockResolvedValue(undefined);

    await expect(shareContent(
      { text: 'seed=123', title: 'Train Game' },
      { navigator: { clipboard: { writeText }, share } },
    )).resolves.toBe('copied');
    expect(share).toHaveBeenCalledTimes(1);
    expect(writeText).toHaveBeenCalledWith('Train Game\n\nseed=123');
  });
});
