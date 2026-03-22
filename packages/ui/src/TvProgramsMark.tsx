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
      xmlns="http://www.w3.org/2000/svg"
      {...accessibleProps}
      {...props}
    >
      {title ? <title>{title}</title> : null}
      <g
        transform="translate(0,998) scale(0.1,-0.1)"
        fill="currentColor"
        stroke="none"
      >
        <path d="M7844 6005 c-472 -1180 -861 -2145 -864 -2145 -3 0 -379 932 -834 2070 l-828 2070 -2419 0 -2419 0 0 -500 0 -500 1000 0 1000 0 0 -2500 0 -2500 500 0 500 0 0 2500 0 2500 582 -2 582 -3 1165 -2913 c641 -1601 1168 -2912 1171 -2912 3 0 595 1473 1315 3273 720 1799 1314 3286 1322 3304 l13 31 -418 167 c-229 92 -438 175 -464 186 l-46 18 -858 -2144z" />
      </g>
    </svg>
  );
}
