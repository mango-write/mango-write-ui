import { forwardRef, type CSSProperties } from "react";
import type {
  SkeletonAnimation,
  SkeletonProps,
  SkeletonShape,
} from "./skeleton-defs";

export type { SkeletonAnimation, SkeletonProps, SkeletonShape };

export const Skeleton = forwardRef<HTMLDivElement, SkeletonProps>(function MwSkeleton(
  {
    shape = "rectangle",
    size,
    width = "100%",
    height = "1rem",
    borderRadius,
    animation = "wave",
    className,
    style,
    ...rest
  },
  ref,
) {
  const classes = [
    "mw-skeleton",
    shape === "circle" ? "mw-skeleton--circle" : undefined,
    animation === "none" ? "mw-skeleton--none" : undefined,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const inlineStyle: CSSProperties = {
    width: size ?? width,
    height: size ?? height,
    ...(borderRadius !== undefined ? { borderRadius } : undefined),
    ...style,
  };

  return (
    <div
      ref={ref}
      {...rest}
      className={classes}
      style={inlineStyle}
      aria-hidden="true"
    />
  );
});

Skeleton.displayName = "MwSkeleton";

export default Skeleton;
