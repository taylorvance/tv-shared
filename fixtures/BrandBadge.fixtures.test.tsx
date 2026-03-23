import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it } from 'vitest';
import { PlainCssBrandBadge } from './plain-css/PlainCssBrandBadge.js';
import { UtilityClassBrandBadge } from './utility-classes/UtilityClassBrandBadge.js';

describe('fixture consumers', () => {
  it('supports a plain CSS consumer fixture', () => {
    render(<PlainCssBrandBadge />);

    const link = screen.getByRole('link', { name: 'tvprograms.tech' });

    expect(link).toHaveClass('fixture-brand-badge');
    expect(screen.getByText('tvprograms.tech')).toHaveClass('fixture-brand-badge-label');
  });

  it('supports a utility-class consumer fixture', () => {
    render(<UtilityClassBrandBadge />);

    const link = screen.getByRole('link', { name: 'tvprograms.tech' });

    expect(link).toHaveClass('inline-flex', 'items-center', 'rounded-full');
    expect(screen.getByText('tvprograms.tech')).toHaveClass('tracking-tight');
  });
});
