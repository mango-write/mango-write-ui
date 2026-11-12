import type { HTMLAttributes } from "react";

export interface ProgressSpinnerProps extends HTMLAttributes<HTMLDivElement> {
  strokeWidth?: string | number;
  fill?: string;
  animationDuration?: string;
  ariaLabel?: string;
}
