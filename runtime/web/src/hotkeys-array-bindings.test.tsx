import { render } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { mockUseLibraryHotkeys } = vi.hoisted(() => ({
  mockUseLibraryHotkeys: vi.fn(() => ({ current: null })),
}));

vi.mock('react-hotkeys-hook', () => ({
  useHotkeys: mockUseLibraryHotkeys,
}));

import { useHotkeys } from './hotkeys.js';

describe('useHotkeys array bindings', () => {
  beforeEach(() => {
    mockUseLibraryHotkeys.mockClear();
  });

  it('matches literal punctuation keys without remapping them to different keys', () => {
    const onLetter = vi.fn();
    const onMinus = vi.fn();

    const Example = () => {
      useHotkeys([
        { keys: 'r', callback: onLetter },
        { keys: '-', callback: onMinus },
      ]);

      return <div>Hotkeys</div>;
    };

    render(<Example />);

    const [flattenedKeys, callback] = mockUseLibraryHotkeys.mock.calls[0] as [
      string[],
      (event: KeyboardEvent, hotkeyEvent: {
        alt?: boolean;
        ctrl?: boolean;
        keys?: readonly string[];
        meta?: boolean;
        mod?: boolean;
        shift?: boolean;
      }) => void,
    ];

    expect(flattenedKeys).toEqual(['r', '-']);

    callback(new KeyboardEvent('keydown', { key: '-' }), {
      alt: false,
      ctrl: false,
      keys: ['-'],
      meta: false,
      mod: false,
      shift: false,
    });

    expect(onMinus).toHaveBeenCalledTimes(1);
    expect(onLetter).not.toHaveBeenCalled();
  });

  it('supports literal plus bindings when the consumer overrides the combination separator', () => {
    const onZoom = vi.fn();

    const Example = () => {
      useHotkeys(
        [{ keys: 'ctrl-+', callback: onZoom }],
        { combinationKey: '-' },
      );

      return <div>Hotkeys</div>;
    };

    render(<Example />);

    const [flattenedKeys, callback] = mockUseLibraryHotkeys.mock.calls[0] as [
      string[],
      (event: KeyboardEvent, hotkeyEvent: {
        alt?: boolean;
        ctrl?: boolean;
        keys?: readonly string[];
        meta?: boolean;
        mod?: boolean;
        shift?: boolean;
      }) => void,
    ];

    expect(flattenedKeys).toEqual(['ctrl-+']);

    callback(new KeyboardEvent('keydown', { key: '+' }), {
      alt: false,
      ctrl: true,
      keys: ['+'],
      meta: false,
      mod: false,
      shift: false,
    });

    expect(onZoom).toHaveBeenCalledTimes(1);
  });
});
