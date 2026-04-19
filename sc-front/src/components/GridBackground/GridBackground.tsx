import type { ReactElement } from "react";

interface GridBackgroundProps {
  className?: string;
}

/**
 * Reusable grid background component for auth and public pages.
 * Uses the EduCAR design system with 32x32 grid pattern.
 */
export default function GridBackground({ className }: GridBackgroundProps): ReactElement {
  return (
    <svg className={className || "page-grid-bg"} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="page-grid" width="32" height="32" patternUnits="userSpaceOnUse">
          <path d="M 32 0 L 0 0 0 32" fill="none" stroke="#b0b8c1" strokeWidth="0.7" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#page-grid)" />
    </svg>
  );
}