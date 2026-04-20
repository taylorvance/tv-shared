import { act, fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { createStringCodec } from './codecs.js';
import { useUrlState } from './url-state.js';

describe('useUrlState', () => {
  beforeEach(() => {
    window.history.replaceState({}, '', '/');
  });

  it('keeps query-param state in sync across multiple hook instances', () => {
    const ValueView = ({ label }: { label: string }) => {
      const [panel, setPanel, controls] = useUrlState('panel', {
        codec: createStringCodec(),
        defaultValue: 'home',
      });

      return (
        <div>
          <span>{`${label}:${panel}:${controls.source}`}</span>
          <button type="button" onClick={() => setPanel('about')}>
            {`Set ${label}`}
          </button>
          <button type="button" onClick={controls.clear}>
            {`Clear ${label}`}
          </button>
        </div>
      );
    };

    render(
      <>
        <ValueView label="A" />
        <ValueView label="B" />
      </>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Set A' }));

    expect(window.location.search).toBe('?panel=about');
    expect(screen.getByText('A:about:url')).toBeInTheDocument();
    expect(screen.getByText('B:about:url')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Clear B' }));

    expect(window.location.search).toBe('');
    expect(screen.getByText('A:home:default')).toBeInTheDocument();
    expect(screen.getByText('B:home:default')).toBeInTheDocument();
  });

  it('supports hash-param state and external history changes', () => {
    const Example = () => {
      const [tab] = useUrlState('tab', {
        codec: createStringCodec(),
        defaultValue: 'overview',
        mode: 'hash',
      });

      return <span>{tab}</span>;
    };

    render(<Example />);

    expect(screen.getByText('overview')).toBeInTheDocument();

    act(() => {
      window.history.pushState({}, '', '/#tab=history');
      window.dispatchEvent(new HashChangeEvent('hashchange'));
    });

    expect(screen.getByText('history')).toBeInTheDocument();
  });
});
