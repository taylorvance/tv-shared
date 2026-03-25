import React from 'react';
import { BrandBadge } from '../../runtime/node/tv-shared-runtime/src/index.js';

export function UtilityClassBrandBadge() {
  return (
    <BrandBadge
      className="inline-flex items-center gap-2 rounded-full border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700"
      iconClassName="h-4 w-4 shrink-0"
      labelClassName="tracking-tight"
      unstyled
    />
  );
}
