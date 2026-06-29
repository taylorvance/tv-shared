import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { SourceBadge, sourceBadgeClassNames } from './SourceBadge.js';

describe('SourceBadge', () => {
  it('renders a required source destination with default label and GitHub icon for GitHub links', () => {
    render(<SourceBadge href="https://github.com/taylorvance/mcts-web" />);

    const link = screen.getByRole('link', { name: 'Source' });
    const iconSlot = link.querySelector(`.${sourceBadgeClassNames.icon}`);
    const icon = link.querySelector('svg');

    expect(link).toHaveAttribute('href', 'https://github.com/taylorvance/mcts-web');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noreferrer');
    expect(link).toHaveClass(sourceBadgeClassNames.root);
    expect(link.style.display).toBe('inline-flex');
    expect(iconSlot).toHaveStyle({ color: 'inherit' });
    expect(icon).toHaveClass(sourceBadgeClassNames.icon);
    expect(icon?.innerHTML).toContain('M9 19c-5 1.5-5-2.5-7-3m14 6');
  });

  it('uses the generic code icon for non-GitHub source links', () => {
    render(<SourceBadge href="https://git.example.com/taylorvance/mcts-web" />);

    const icon = screen.getByRole('link', { name: 'Source' }).querySelector('svg');

    expect(icon?.innerHTML).toContain('16 18 22 12 16 6');
  });

  it('allows explicit icon presets to override href detection', () => {
    const { rerender } = render(
      <SourceBadge href="https://github.com/taylorvance/mcts-web" iconName="code" />,
    );

    let icon = screen.getByRole('link', { name: 'Source' }).querySelector('svg');

    expect(icon).toHaveClass(sourceBadgeClassNames.icon);
    expect(icon?.innerHTML).toContain('16 18 22 12 16 6');

    rerender(
      <SourceBadge href="https://github.com/taylorvance/mcts-web" iconName="git-branch" />,
    );

    icon = screen.getByRole('link', { name: 'Source' }).querySelector('svg');

    expect(icon).toHaveClass(sourceBadgeClassNames.icon);
    expect(icon?.innerHTML).toContain('M18 9a9 9 0 0 1-9 9');
  });

  it('supports unstyled usage with consumer-owned classes', () => {
    render(
      <SourceBadge
        className="consumer-root"
        href="https://github.com/taylorvance/wordlink"
        iconClassName="consumer-icon"
        labelClassName="consumer-label"
        unstyled
      />,
    );

    const link = screen.getByRole('link', { name: 'Source' });
    const label = screen.getByText('Source');
    const iconSlot = link.querySelector(`.${sourceBadgeClassNames.icon}`);
    const icon = link.querySelector('svg');

    expect(link).toHaveClass(sourceBadgeClassNames.root, 'consumer-root');
    expect(link.style.display).toBe('');
    expect(label).toHaveClass(sourceBadgeClassNames.label, 'consumer-label');
    expect(iconSlot).toHaveClass(sourceBadgeClassNames.icon, 'consumer-icon');
    expect(iconSlot).not.toHaveAttribute('style');
    expect(icon).toHaveClass(sourceBadgeClassNames.icon, 'consumer-icon');
  });

  it('allows consumer overrides for label, target, and icon', () => {
    render(
      <SourceBadge
        href="https://example.com/source"
        icon={<span data-testid="custom-icon" />}
        label="Repository"
        target="_self"
      />,
    );

    const link = screen.getByRole('link', { name: 'Repository' });

    expect(link).toHaveAttribute('href', 'https://example.com/source');
    expect(link).toHaveAttribute('target', '_self');
    expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
  });
});
