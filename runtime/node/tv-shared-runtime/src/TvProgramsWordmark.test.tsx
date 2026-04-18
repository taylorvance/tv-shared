import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import {
  TvProgramsWordmark,
  tvProgramsWordmarkClassNames,
} from './TvProgramsWordmark.js';

describe('TvProgramsWordmark', () => {
  it('renders the default brand label with the shared slot class names', () => {
    render(<TvProgramsWordmark />);

    const label = screen.getByText('TV Programs');
    const root = label.parentElement;
    const mark = root?.querySelector(`.${tvProgramsWordmarkClassNames.mark}`);

    expect(root).toHaveClass(tvProgramsWordmarkClassNames.root);
    expect(root?.style.display).toBe('inline-flex');
    expect(label).toHaveClass(tvProgramsWordmarkClassNames.label);
    expect(mark).toHaveStyle({ height: '1.15em', width: '1.15em' });
  });

  it('supports unstyled consumer-owned classes and copy', () => {
    render(
      <TvProgramsWordmark
        className="consumer-root"
        label="TV Shared Runtime"
        labelClassName="consumer-label"
        markClassName="consumer-mark"
        unstyled
      />,
    );

    const label = screen.getByText('TV Shared Runtime');
    const root = label.parentElement;
    const mark = root?.querySelector('svg');

    expect(root).toHaveClass(tvProgramsWordmarkClassNames.root, 'consumer-root');
    expect(label).toHaveClass(tvProgramsWordmarkClassNames.label, 'consumer-label');
    expect(mark).toHaveClass(tvProgramsWordmarkClassNames.mark, 'consumer-mark');
    expect(root?.style.display).toBe('');
    expect(mark).not.toHaveAttribute('style');
  });
});
