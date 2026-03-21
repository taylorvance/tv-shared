import type { CSSProperties, ComponentPropsWithoutRef, ReactNode } from 'react';
import {
  TVPROGRAMS_DEFAULT_LABEL,
  TVPROGRAMS_URL,
} from './constants.js';
import { TvProgramsMark } from './TvProgramsMark.js';

const DEFAULT_ROOT_STYLE: CSSProperties = {
  alignItems: 'center',
  backgroundColor: '#ffffff',
  border: '1px solid #d1d5db',
  borderRadius: '999px',
  boxShadow: '0 1px 2px rgba(15, 23, 42, 0.08)',
  color: '#374151',
  display: 'inline-flex',
  fontFamily: 'inherit',
  fontSize: '0.875rem',
  fontWeight: 600,
  gap: '0.5rem',
  lineHeight: 1,
  padding: '0.45rem 0.8rem',
  textDecoration: 'none',
};

const DEFAULT_ICON_STYLE: CSSProperties = {
  display: 'block',
  flexShrink: 0,
  height: '1rem',
  width: '1rem',
};

export const brandBadgeClassNames = {
  root: 'tv-shared-brand-badge',
  icon: 'tv-shared-brand-badge__icon',
  label: 'tv-shared-brand-badge__label',
} as const;

export type BrandBadgeProps = Omit<ComponentPropsWithoutRef<'a'>, 'children'> & {
  icon?: ReactNode;
  iconClassName?: string;
  label?: ReactNode;
  labelClassName?: string;
  unstyled?: boolean;
};

export function BrandBadge({
  className,
  href = TVPROGRAMS_URL,
  icon,
  iconClassName,
  label = TVPROGRAMS_DEFAULT_LABEL,
  labelClassName,
  rel = 'noreferrer',
  style,
  target = '_blank',
  unstyled = false,
  ...props
}: BrandBadgeProps) {
  const rootClassName = [brandBadgeClassNames.root, className].filter(Boolean).join(' ');
  const iconSlotClassName = [brandBadgeClassNames.icon, iconClassName].filter(Boolean).join(' ');
  const labelSlotClassName = [brandBadgeClassNames.label, labelClassName].filter(Boolean).join(' ');
  const mergedStyle = unstyled ? style : { ...DEFAULT_ROOT_STYLE, ...style };

  return (
    <a
      className={rootClassName}
      href={href}
      rel={rel}
      style={mergedStyle}
      target={target}
      {...props}
    >
      <span
        aria-hidden="true"
        className={iconSlotClassName}
        style={unstyled ? undefined : DEFAULT_ICON_STYLE}
      >
        {icon ?? <TvProgramsMark className={iconSlotClassName} style={unstyled ? undefined : DEFAULT_ICON_STYLE} />}
      </span>
      <span className={labelSlotClassName}>{label}</span>
    </a>
  );
}
