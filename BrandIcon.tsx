import type { SVGProps } from "react";

/** Scalable recreation of the supplied house, window and sweeping check. */
export function BrandIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 128 128" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M18 99V49c0-4 2-7 5-9L65 12c5-3 9-3 14 0l43 28-17 7-31-22c-2-1-4-1-6 0L34 48c-2 1-3 3-3 5v46H18Z" />
      {/* Each pane and the check sit in their own <g> so CSS can animate them (transform-box: fill-box). */}
      <g className="logo-pane"><rect x="59" y="44" width="8" height="9" rx="1" /></g>
      <g className="logo-pane"><rect x="70" y="44" width="8" height="9" rx="1" /></g>
      <g className="logo-pane"><rect x="59" y="56" width="8" height="9" rx="1" /></g>
      <g className="logo-pane"><rect x="70" y="56" width="8" height="9" rx="1" /></g>
      <g className="logo-check">
        <path d="M38 75c10-1 19 5 27 13C88 68 108 50 132 46c-22 18-43 37-64 64-2 3-5 3-8 0C50 99 43 87 38 75Z" transform="translate(-4 0)" />
      </g>
    </svg>
  );
}
