import type { CSSProperties, ComponentPropsWithoutRef, ReactNode } from 'react';
import { TvProgramsMark } from './TvProgramsMark.js';

const DEFAULT_ROOT_STYLE: CSSProperties = {
  alignItems: 'center',
  color: 'inherit',
  display: 'inline-flex',
  fontFamily: 'inherit',
  fontWeight: 700,
  gap: '0.5rem',
  lineHeight: 1,
};

const DEFAULT_MARK_STYLE: CSSProperties = {
  display: 'block',
  flexShrink: 0,
  height: '1.15em',
  width: '1.15em',
};

export const tvProgramsWordmarkClassNames = {
  root: 'tv-shared-tvprograms-wordmark',
  mark: 'tv-shared-tvprograms-wordmark__mark',
  label: 'tv-shared-tvprograms-wordmark__label',
} as const;

export type TvProgramsWordmarkProps = Omit<ComponentPropsWithoutRef<'span'>, 'children'> & {
  label?: ReactNode;
  labelClassName?: string;
  markClassName?: string;
  unstyled?: boolean;
};

export function TvProgramsWordmark({
  className,
  label = 'TV Programs',
  labelClassName,
  markClassName,
  style,
  unstyled = false,
  ...props
}: TvProgramsWordmarkProps) {
  const rootClassName = [tvProgramsWordmarkClassNames.root, className].filter(Boolean).join(' ');
  const nextMarkClassName = [tvProgramsWordmarkClassNames.mark, markClassName].filter(Boolean).join(' ');
  const nextLabelClassName = [tvProgramsWordmarkClassNames.label, labelClassName].filter(Boolean).join(' ');

  return (
    <span
      className={rootClassName}
      style={unstyled ? style : { ...DEFAULT_ROOT_STYLE, ...style }}
      {...props}
    >
      <TvProgramsMark
        aria-hidden="true"
        className={nextMarkClassName}
        style={unstyled ? undefined : DEFAULT_MARK_STYLE}
      />
      <span className={nextLabelClassName}>{label}</span>
    </span>
  );
}
