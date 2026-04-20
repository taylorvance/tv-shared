import { act, fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import {
  LiveAnnouncer,
  useLiveAnnouncer,
  usePrefersReducedMotion,
} from './a11y.js';

const createMediaWindow = (initialMatch: boolean) => {
  let matches = initialMatch;
  const listeners = new Set<(event: MediaQueryListEvent) => void>();

  return {
    setMatches(nextMatch: boolean) {
      matches = nextMatch;
      const event = { matches } as MediaQueryListEvent;

      for(const listener of listeners) {
        listener(event);
      }
    },
    window: {
      matchMedia: () => ({
        addEventListener: (_eventName: string, listener: (event: MediaQueryListEvent) => void) => {
          listeners.add(listener);
        },
        get matches() {
          return matches;
        },
        media: '(prefers-reduced-motion: reduce)',
        removeEventListener: (_eventName: string, listener: (event: MediaQueryListEvent) => void) => {
          listeners.delete(listener);
        },
      }),
    } as unknown as Window,
  };
};

describe('a11y helpers', () => {
  it('tracks prefers-reduced-motion changes', () => {
    const mediaWindow = createMediaWindow(false);

    const Example = () => {
      const prefersReducedMotion = usePrefersReducedMotion({ window: mediaWindow.window });

      return <span>{prefersReducedMotion ? 'reduce' : 'full'}</span>;
    };

    render(<Example />);

    expect(screen.getByText('full')).toBeInTheDocument();

    act(() => {
      mediaWindow.setMatches(true);
    });

    expect(screen.getByText('reduce')).toBeInTheDocument();
  });

  it('announces live region updates through the provider hook', () => {
    const Example = () => {
      const { announce } = useLiveAnnouncer();

      return (
        <button type="button" onClick={() => announce('Saved game state')}>
          Announce
        </button>
      );
    };

    render(
      <LiveAnnouncer>
        <Example />
      </LiveAnnouncer>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Announce' }));

    expect(screen.getAllByRole('status').at(-1)).toHaveTextContent('Saved game state');
  });
});
