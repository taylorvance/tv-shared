import type { ComponentPropsWithoutRef, ReactNode } from 'react';
import {
  TVPROGRAMS_DEFAULT_LABEL,
  TVPROGRAMS_URL,
} from './constants.js';
import {
  LinkBadgeBase,
  type LinkBadgeDefaultIconProps,
} from './LinkBadgeBase.js';
import { TvProgramsMark } from './TvProgramsMark.js';

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

function renderDefaultBrandBadgeIcon({ className, style }: LinkBadgeDefaultIconProps) {
  return <TvProgramsMark className={className} style={style} />;
}

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
  return (
    <LinkBadgeBase
      className={className}
      classNames={brandBadgeClassNames}
      href={href}
      icon={icon}
      iconClassName={iconClassName}
      label={label}
      labelClassName={labelClassName}
      rel={rel}
      renderDefaultIcon={renderDefaultBrandBadgeIcon}
      style={style}
      target={target}
      unstyled={unstyled}
      {...props}
    />
  );
}
