import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { TvProgramsMark } from './TvProgramsMark.js';

describe('TvProgramsMark', () => {
  it('is hidden from assistive tech when no title is provided', () => {
    const { container } = render(<TvProgramsMark data-testid="mark" />);
    const mark = container.querySelector('svg');

    expect(mark).toHaveAttribute('aria-hidden', 'true');
    expect(mark).toHaveAttribute('height', '1em');
    expect(mark).not.toHaveAttribute('role');
    expect(mark).toHaveAttribute('width', '1em');
  });

  it('is exposed as an image when a title is provided', () => {
    render(<TvProgramsMark title="TV Programs" />);

    expect(screen.getByRole('img', { name: 'TV Programs' })).toBeInTheDocument();
  });

  it('renders the transformed path group from the shared source asset', () => {
    const { container } = render(<TvProgramsMark data-testid="mark" />);
    const group = container.querySelector('svg > g');

    expect(group).toHaveAttribute('transform', 'translate(0,998) scale(0.1,-0.1)');
    expect(group).toHaveAttribute('fill', 'currentColor');
  });

  it('allows consumers to override the default dimensions', () => {
    const { container } = render(<TvProgramsMark height="24" width="24" />);
    const mark = container.querySelector('svg');

    expect(mark).toHaveAttribute('height', '24');
    expect(mark).toHaveAttribute('width', '24');
  });
});
