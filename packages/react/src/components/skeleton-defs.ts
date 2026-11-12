import type { HTMLAttributes } from "react";

export type SkeletonShape = "rectangle" | "circle";
export type SkeletonAnimation = "wave" | "none";

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  shape?: SkeletonShape;
  size?: string;
  width?: string;
  height?: string;
  borderRadius?: string;
  animation?: SkeletonAnimation;
}
