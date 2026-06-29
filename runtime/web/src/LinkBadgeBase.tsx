import type { CSSProperties, ComponentPropsWithoutRef, ReactNode } from 'react';

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
  color: 'inherit',
  display: 'block',
  flexShrink: 0,
  height: '1rem',
  width: '1rem',
};

export type LinkBadgeClassNames = {
  readonly root: string;
  readonly icon: string;
  readonly label: string;
};

export type LinkBadgeDefaultIconProps = {
  className: string;
  style: CSSProperties | undefined;
};

export type LinkBadgeBaseProps = Omit<ComponentPropsWithoutRef<'a'>, 'children'> & {
  classNames: LinkBadgeClassNames;
  icon?: ReactNode;
  iconClassName?: string | undefined;
  label: ReactNode;
  labelClassName?: string | undefined;
  renderDefaultIcon: (props: LinkBadgeDefaultIconProps) => ReactNode;
  unstyled?: boolean;
};

export function LinkBadgeBase({
  className,
  classNames,
  icon,
  iconClassName,
  label,
  labelClassName,
  renderDefaultIcon,
  rel = 'noreferrer',
  style,
  target = '_blank',
  unstyled = false,
  ...props
}: LinkBadgeBaseProps) {
  const rootClassName = [classNames.root, className].filter(Boolean).join(' ');
  const iconSlotClassName = [classNames.icon, iconClassName].filter(Boolean).join(' ');
  const labelSlotClassName = [classNames.label, labelClassName].filter(Boolean).join(' ');
  const iconStyle = unstyled ? undefined : DEFAULT_ICON_STYLE;
  const mergedStyle = unstyled ? style : { ...DEFAULT_ROOT_STYLE, ...style };

  return (
    <a
      className={rootClassName}
      rel={rel}
      style={mergedStyle}
      target={target}
      {...props}
    >
      <span aria-hidden="true" className={iconSlotClassName} style={iconStyle}>
        {icon ?? renderDefaultIcon({ className: iconSlotClassName, style: iconStyle })}
      </span>
      <span className={labelSlotClassName}>{label}</span>
    </a>
  );
}
