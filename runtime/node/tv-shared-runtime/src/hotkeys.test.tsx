import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useHotkeys, useKonami, useKeySequence } from './hotkeys.js';

const fireKonamiKeys = () => {
  for (const [key, code] of [
    ['ArrowUp', 'ArrowUp'],
    ['ArrowUp', 'ArrowUp'],
    ['ArrowDown', 'ArrowDown'],
    ['ArrowDown', 'ArrowDown'],
    ['ArrowLeft', 'ArrowLeft'],
    ['ArrowRight', 'ArrowRight'],
    ['ArrowLeft', 'ArrowLeft'],
    ['ArrowRight', 'ArrowRight'],
    ['b', 'KeyB'],
    ['a', 'KeyA'],
  ] as const) {
    fireEvent.keyDown(document, { code, key });
  }
};

describe('useHotkeys', () => {
  it('registers a global hotkey with the single-binding signature', () => {
    const onTrigger = vi.fn();

    const Example = () => {
      useHotkeys('r', onTrigger);

      return <div>Hotkeys</div>;
    };

    render(<Example />);
    fireEvent.keyDown(document, { code: 'KeyR', key: 'r' });

    expect(onTrigger).toHaveBeenCalledTimes(1);
  });

  it('scopes multiple bindings to the returned ref and keeps descendants active', () => {
    const onReset = vi.fn();
    const onHistory = vi.fn();

    const Example = () => {
      const ref = useHotkeys<HTMLDivElement>([
        { keys: 'r', callback: onReset },
        { keys: 'h', callback: onHistory },
      ]);

      return (
        <div>
          <button type="button">Outside</button>
          <div ref={ref} tabIndex={-1}>
            <button type="button">Inside</button>
          </div>
        </div>
      );
    };

    render(<Example />);

    const inside = screen.getByRole('button', { name: 'Inside' });
    inside.focus();
    fireEvent.keyDown(inside, { code: 'KeyR', key: 'r' });
    fireEvent.keyDown(inside, { code: 'KeyH', key: 'h' });

    const outside = screen.getByRole('button', { name: 'Outside' });
    outside.focus();
    fireEvent.keyDown(outside, { code: 'KeyR', key: 'r' });

    expect(onReset).toHaveBeenCalledTimes(1);
    expect(onHistory).toHaveBeenCalledTimes(1);
  });

  it('ignores form fields by default', () => {
    const onTrigger = vi.fn();

    const Example = () => {
      const ref = useHotkeys<HTMLInputElement>([
        { keys: 'r', callback: onTrigger },
      ]);

      return <input ref={ref} aria-label="Search" />;
    };

    render(<Example />);

    const input = screen.getByRole('textbox', { name: 'Search' });
    input.focus();
    fireEvent.keyDown(input, { code: 'KeyR', key: 'r' });

    expect(onTrigger).not.toHaveBeenCalled();
  });
});

describe('useKonami', () => {
  it('fires after the full konami sequence', () => {
    const onTrigger = vi.fn();

    const Example = () => {
      useKonami(onTrigger);

      return <div>Konami</div>;
    };

    render(<Example />);
    fireKonamiKeys();

    expect(onTrigger).toHaveBeenCalledTimes(1);
  });

  it('supports the same scoped-ref model as shared hotkeys', () => {
    const onTrigger = vi.fn();

    const Example = () => {
      const ref = useKonami<HTMLDivElement>(onTrigger);

      return (
        <div>
          <button type="button">Outside</button>
          <div ref={ref} tabIndex={-1}>
            <button type="button">Inside</button>
          </div>
        </div>
      );
    };

    render(<Example />);

    const outside = screen.getByRole('button', { name: 'Outside' });
    outside.focus();
    fireEvent.keyDown(document, { code: 'ArrowUp', key: 'ArrowUp' });

    const inside = screen.getByRole('button', { name: 'Inside' });
    inside.focus();
    fireKonamiKeys();

    expect(onTrigger).toHaveBeenCalledTimes(1);
  });
});

describe('useKeySequence', () => {
  it('fires after a custom key sequence', () => {
    const onTrigger = vi.fn();

    const Example = () => {
      useKeySequence(['g', 'g'], onTrigger);

      return <div>Sequence</div>;
    };

    render(<Example />);
    fireEvent.keyDown(document, { code: 'KeyG', key: 'g' });
    fireEvent.keyDown(document, { code: 'KeyG', key: 'g' });

    expect(onTrigger).toHaveBeenCalledTimes(1);
  });

  it('supports multiple sequence bindings in one listener', () => {
    const onDebug = vi.fn();
    const onRainbow = vi.fn();

    const Example = () => {
      useKeySequence([
        { sequence: ['d', 'e', 'b', 'u', 'g'], callback: onDebug },
        { sequence: ['r', 'g', 'b'], callback: onRainbow },
      ]);

      return <div>Sequences</div>;
    };

    render(<Example />);

    for (const [key, code] of [
      ['d', 'KeyD'],
      ['e', 'KeyE'],
      ['b', 'KeyB'],
      ['u', 'KeyU'],
      ['g', 'KeyG'],
      ['r', 'KeyR'],
      ['g', 'KeyG'],
      ['b', 'KeyB'],
    ] as const) {
      fireEvent.keyDown(document, { code, key });
    }

    expect(onDebug).toHaveBeenCalledTimes(1);
    expect(onRainbow).toHaveBeenCalledTimes(1);
  });

  it('uses a between-key timeout with a 1000ms default', () => {
    vi.useFakeTimers();
    vi.setSystemTime(0);

    try {
      const onTrigger = vi.fn();

      const Example = () => {
        useKeySequence(['a', 'b'], onTrigger);

        return <div>Sequence</div>;
      };

      render(<Example />);
      fireEvent.keyDown(document, { code: 'KeyA', key: 'a' });
      vi.advanceTimersByTime(1_001);
      vi.setSystemTime(1_001);
      fireEvent.keyDown(document, { code: 'KeyB', key: 'b' });

      expect(onTrigger).not.toHaveBeenCalled();

      fireEvent.keyDown(document, { code: 'KeyA', key: 'a' });
      vi.advanceTimersByTime(1_000);
      vi.setSystemTime(2_001);
      fireEvent.keyDown(document, { code: 'KeyB', key: 'b' });

      expect(onTrigger).toHaveBeenCalledTimes(1);
    } finally {
      vi.useRealTimers();
    }
  });

  it('allows overriding the between-key timeout', () => {
    vi.useFakeTimers();
    vi.setSystemTime(0);

    try {
      const onTrigger = vi.fn();

      const Example = () => {
        useKeySequence(['a', 'b'], onTrigger, { timeoutMs: 1_500 });

        return <div>Sequence</div>;
      };

      render(<Example />);
      fireEvent.keyDown(document, { code: 'KeyA', key: 'a' });
      vi.advanceTimersByTime(1_200);
      vi.setSystemTime(1_200);
      fireEvent.keyDown(document, { code: 'KeyB', key: 'b' });

      expect(onTrigger).toHaveBeenCalledTimes(1);
    } finally {
      vi.useRealTimers();
    }
  });
});
