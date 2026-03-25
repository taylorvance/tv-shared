import React from 'react';
import { BrandBadge } from '../../runtime/node/tv-shared-runtime/src/index.js';
import './brand-badge.css';

export function PlainCssBrandBadge() {
  return (
    <BrandBadge
      className="fixture-brand-badge"
      iconClassName="fixture-brand-badge-icon"
      labelClassName="fixture-brand-badge-label"
      unstyled
    />
  );
}
