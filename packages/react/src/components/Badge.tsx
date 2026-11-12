import { forwardRef, type HTMLAttributes, type ReactNode } from "react";

export type BadgeSeverity =
  | "primary"
  | "secondary"
  | "success"
  | "info"
  | "warn"
  | "warning"
  | "danger"
  | "contrast";

export type BadgeSize = "xs" | "sm" | "md" | "lg" | "small" | "large";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  value?: string | number;
  severity?: BadgeSeverity;
  size?: BadgeSize;
  children?: ReactNode;
}

function normalizeBadgeSize(size?: BadgeSize): "xs" | "sm" | "md" | "lg" | undefined {
  if (size === "sm" || size === "small") return "sm";
  if (size === "lg" || size === "large") return "lg";
  if (size === "xs" || size === "md") return size;
  return undefined;
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(function MwBadge(
  { value, severity = "primary", size, className, children, ...rest },
  ref,
) {
  const normalizedSize = normalizeBadgeSize(size);
  const hasChildren =
    children !== undefined && children !== null && children !== false && children !== "";
  const isDot = !hasChildren && (value === undefined || value === null || value === "");

  const classes = [
    "mw-badge",
    `mw-badge--${severity}`,
    normalizedSize ? `mw-badge--${normalizedSize}` : undefined,
    normalizedSize ? `mw-size-${normalizedSize}` : undefined,
    size && size !== normalizedSize ? `mw-badge--${size}` : undefined,
    isDot ? "mw-badge--dot" : undefined,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <span
      ref={ref}
      {...rest}
      className={classes}
      data-severity={severity}
      data-size={normalizedSize}
    >
      {hasChildren ? children : value}
    </span>
  );
});

Badge.displayName = "MwBadge";

export default Badge;
