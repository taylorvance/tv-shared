import type { ComponentPropsWithoutRef, ReactNode } from 'react';
import type { IconType } from 'react-icons';
import {
  FiCode,
  FiGitBranch,
  FiGithub,
} from 'react-icons/fi';
import {
  LinkBadgeBase,
  type LinkBadgeDefaultIconProps,
} from './LinkBadgeBase.js';

export const sourceBadgeClassNames = {
  root: 'tv-shared-source-badge',
  icon: 'tv-shared-source-badge__icon',
  label: 'tv-shared-source-badge__label',
} as const;

export type SourceBadgeIconName = 'code' | 'git-branch' | 'github';

const sourceBadgeIcons = {
  code: FiCode,
  'git-branch': FiGitBranch,
  github: FiGithub,
} satisfies Record<SourceBadgeIconName, IconType>;

const GITHUB_HOSTNAMES = new Set(['github.com', 'www.github.com']);

export type SourceBadgeProps = Omit<ComponentPropsWithoutRef<'a'>, 'children' | 'href'> & {
  href: string;
  icon?: ReactNode;
  iconClassName?: string;
  iconName?: SourceBadgeIconName;
  label?: ReactNode;
  labelClassName?: string;
  unstyled?: boolean;
};

function resolveSourceBadgeIconName(
  href: string,
  iconName: SourceBadgeIconName | undefined,
): SourceBadgeIconName {
  if (iconName) {
    return iconName;
  }

  try {
    const url = new URL(href, 'https://tvprograms.tech');

    if (GITHUB_HOSTNAMES.has(url.hostname.toLowerCase())) {
      return 'github';
    }
  } catch {
    return 'code';
  }

  return 'code';
}

function renderSourceBadgeIcon(
  iconName: SourceBadgeIconName,
): (props: LinkBadgeDefaultIconProps) => ReactNode {
  return ({ className, style }) => {
    const Icon = sourceBadgeIcons[iconName];

    return <Icon className={className} focusable="false" style={style} />;
  };
}

export function SourceBadge({
  className,
  href,
  icon,
  iconClassName,
  iconName,
  label = 'Source',
  labelClassName,
  rel = 'noreferrer',
  style,
  target = '_blank',
  unstyled = false,
  ...props
}: SourceBadgeProps) {
  return (
    <LinkBadgeBase
      className={className}
      classNames={sourceBadgeClassNames}
      href={href}
      icon={icon}
      iconClassName={iconClassName}
      label={label}
      labelClassName={labelClassName}
      rel={rel}
      renderDefaultIcon={renderSourceBadgeIcon(resolveSourceBadgeIconName(href, iconName))}
      style={style}
      target={target}
      unstyled={unstyled}
      {...props}
    />
  );
}
