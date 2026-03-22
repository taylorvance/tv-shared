import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { BrandBadge, brandBadgeClassNames } from './BrandBadge.js';

describe('BrandBadge', () => {
  it('renders the default destination and label', () => {
    render(<BrandBadge />);

    const link = screen.getByRole('link', { name: 'tvprograms.tech' });

    expect(link).toHaveAttribute('href', 'https://tvprograms.tech');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noreferrer');
    expect(link).toHaveClass(brandBadgeClassNames.root);
    expect(link.style.display).toBe('inline-flex');
  });

  it('supports unstyled usage with consumer-owned classes', () => {
    render(
      <BrandBadge
        className="consumer-root"
        iconClassName="consumer-icon"
        labelClassName="consumer-label"
        unstyled
      />,
    );

    const link = screen.getByRole('link', { name: 'tvprograms.tech' });
    const label = screen.getByText('tvprograms.tech');
    const iconSlot = link.querySelector(`.${brandBadgeClassNames.icon}`);

    expect(link).toHaveClass(brandBadgeClassNames.root, 'consumer-root');
    expect(link.style.display).toBe('');
    expect(label).toHaveClass(brandBadgeClassNames.label, 'consumer-label');
    expect(iconSlot).toHaveClass(brandBadgeClassNames.icon, 'consumer-icon');
    expect(iconSlot).not.toHaveAttribute('style');
  });

  it('allows consumer overrides for href and label', () => {
    render(<BrandBadge href="https://example.com" label="Example" target="_self" />);

    const link = screen.getByRole('link', { name: 'Example' });

    expect(link).toHaveAttribute('href', 'https://example.com');
    expect(link).toHaveAttribute('target', '_self');
  });
});
