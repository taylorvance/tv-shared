import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useHotkeys, useKonami } from './hotkeys.js';

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

    expect(onTrigger).toHaveBeenCalledTimes(1);
  });
});
