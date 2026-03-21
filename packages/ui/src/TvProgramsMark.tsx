import type { ComponentPropsWithoutRef } from 'react';

export type TvProgramsMarkProps = Omit<ComponentPropsWithoutRef<'svg'>, 'children'> & {
  title?: string;
};

export function TvProgramsMark({
  title,
  ...props
}: TvProgramsMarkProps) {
  const accessibleProps = title
    ? { role: 'img' as const }
    : { 'aria-hidden': true as const };

  return (
    <svg
      viewBox="0 0 998 998"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      {...accessibleProps}
      {...props}
    >
      {title ? <title>{title}</title> : null}
      <path d="M7844 6005c-472-1180-861-2145-864-2145-3 0-379 932-834 2070L5318 8000H4809 2390v-500-500h1000 1000V4000 1500h500 500V4000 6500l582-2 582-3 1165-2913c641-1601 1168-2912 1171-2912 3 0 595 1473 1315 3273 720 1799 1314 3286 1322 3304l13 31-418 167c-229 92-438 175-464 186l-46 18-858-2144z" />
    </svg>
  );
}
