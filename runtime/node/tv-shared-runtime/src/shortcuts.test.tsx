import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import {
  ShortcutPanel,
  useShortcutRegistry,
} from './shortcuts.js';

describe('shortcut helpers', () => {
  it('registers scoped shortcuts and hides secret bindings from the panel', () => {
    const onReset = vi.fn();
    const onSecret = vi.fn();

    const Example = () => {
      const { ref, visibleShortcuts } = useShortcutRegistry<HTMLDivElement>([
        {
          id: 'reset',
          keys: 'r',
          label: 'Reset board',
          onTrigger: onReset,
        },
        {
          hidden: true,
          id: 'secret',
          label: 'Secret debug mode',
          onTrigger: onSecret,
          sequence: ['d', 'e', 'b', 'u', 'g'],
        },
      ]);

      return (
        <div>
          <button type="button">Outside</button>
          <div ref={ref} tabIndex={-1}>
            <button type="button">Inside</button>
          </div>
          <ShortcutPanel shortcuts={visibleShortcuts} />
        </div>
      );
    };

    render(<Example />);

    const inside = screen.getByRole('button', { name: 'Inside' });

    inside.focus();
    fireEvent.keyDown(inside, { code: 'KeyR', key: 'r' });
    fireEvent.keyDown(inside, { code: 'KeyD', key: 'd' });
    fireEvent.keyDown(inside, { code: 'KeyE', key: 'e' });
    fireEvent.keyDown(inside, { code: 'KeyB', key: 'b' });
    fireEvent.keyDown(inside, { code: 'KeyU', key: 'u' });
    fireEvent.keyDown(inside, { code: 'KeyG', key: 'g' });

    expect(onReset).toHaveBeenCalledTimes(1);
    expect(onSecret).toHaveBeenCalledTimes(1);
    expect(screen.getByText('Reset board')).toBeInTheDocument();
    expect(screen.queryByText('Secret debug mode')).not.toBeInTheDocument();
    expect(screen.getByText('r')).toBeInTheDocument();
  });
});
