import { forwardRef } from "react";
import type { ProgressSpinnerProps } from "./progress-spinner";

export type { ProgressSpinnerProps };

export const ProgressSpinner = forwardRef<HTMLDivElement, ProgressSpinnerProps>(
  function MwProgressSpinner(
    {
      strokeWidth = "4",
      fill = "none",
      animationDuration = "2s",
      ariaLabel,
      className,
      ...rest
    },
    ref,
  ) {
    const classes = ["mw-progress-spinner", className].filter(Boolean).join(" ");

    return (
      <div
        ref={ref}
        {...rest}
        className={classes}
        role="progressbar"
        aria-label={rest["aria-label"] ?? ariaLabel}
      >
        <svg
          className="mw-progress-spinner__svg"
          viewBox="25 25 50 50"
          style={{ animationDuration }}
        >
          <circle
            className="mw-progress-spinner__circle"
            cx="50"
            cy="50"
            r="20"
            fill={fill}
            strokeWidth={strokeWidth}
            strokeMiterlimit={10}
          />
        </svg>
      </div>
    );
  },
);

ProgressSpinner.displayName = "MwProgressSpinner";

export default ProgressSpinner;
