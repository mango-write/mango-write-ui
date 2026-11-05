export type SkeletonShape = "rectangle" | "circle";
export type SkeletonAnimation = "wave" | "none";

export interface SkeletonProps {
  shape?: SkeletonShape;
  size?: string;
  width?: string;
  height?: string;
  borderRadius?: string;
  animation?: SkeletonAnimation;
}
