import { forwardRef, type HTMLAttributes, type ReactNode } from "react";

export type ProgressBarMode = "determinate" | "indeterminate";

export interface ProgressBarSlotProps {
  value: number;
}

export interface ProgressBarProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  value?: number;
  mode?: ProgressBarMode;
  showValue?: boolean;
  children?: ReactNode | ((props: ProgressBarSlotProps) => ReactNode);
}

export const ProgressBar = forwardRef<HTMLDivElement, ProgressBarProps>(
  function MwProgressBar(
    {
      value = 0,
      mode = "determinate",
      showValue = true,
      className,
      children,
      ...rest
    },
    ref,
  ) {
    const raw = typeof value === "number" && !Number.isNaN(value) ? value : 0;
    const clampedValue = Math.min(100, Math.max(0, raw));
    const isIndeterminate = mode === "indeterminate";
    const dataState = isIndeterminate
      ? "indeterminate"
      : clampedValue === 100
        ? "complete"
        : "loading";

    const classes = ["mw-progress-bar", `mw-progress-bar--${mode}`, className]
      .filter(Boolean)
      .join(" ");

    const hasCustomChildren = children !== undefined && children !== null && children !== false;
    const labelNode =
      typeof children === "function"
        ? children({ value: clampedValue })
        : hasCustomChildren
          ? children
          : `${Math.round(clampedValue)}%`;

    return (
      <div
        ref={ref}
        {...rest}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={isIndeterminate ? undefined : clampedValue}
        data-state={dataState}
        data-value={isIndeterminate ? undefined : clampedValue}
        data-max={100}
        data-mode={mode}
        className={classes}
      >
        <div
          className="mw-progress-bar__indicator"
          data-state={dataState}
          data-value={isIndeterminate ? undefined : clampedValue}
          data-max={100}
          style={mode === "determinate" ? { width: `${clampedValue}%` } : undefined}
        >
          {mode === "determinate" && (showValue || hasCustomChildren) ? (
            <span className="mw-progress-bar__label">{labelNode}</span>
          ) : null}
        </div>
      </div>
    );
  },
);

ProgressBar.displayName = "MwProgressBar";

export default ProgressBar;
