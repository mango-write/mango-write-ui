export type ScrollFadeY = "top" | "bottom" | "both" | null;
export type ScrollFadeX = "left" | "right" | "both" | null;
export type ScrollFadeSize = "md" | "sm";

export interface ScrollFadeMetrics {
  scrollTop: number;
  scrollLeft: number;
  scrollHeight: number;
  scrollWidth: number;
  clientHeight: number;
  clientWidth: number;
}

export interface ScrollFadeState {
  y: ScrollFadeY;
  x: ScrollFadeX;
}

export interface ScrollFadeOptions {
  size?: ScrollFadeSize;
  /** 内部吸顶表头选择器（如 `.mw-datatable__thead`），顶部渐隐起点自动下移到吸顶层下方。 */
  stickyHeader?: string;
  disabled?: boolean;
}

export type ScrollFadeBinding = ScrollFadeOptions | boolean | undefined;

const EPSILON = 1;

export function computeScrollFadeState(metrics: ScrollFadeMetrics): ScrollFadeState {
  const { scrollTop, scrollLeft, scrollHeight, scrollWidth, clientHeight, clientWidth } = metrics;

  let y: ScrollFadeY = null;
  if (clientHeight > 0 && scrollHeight - clientHeight > EPSILON) {
    const hasTop = scrollTop > EPSILON;
    const hasBottom = scrollHeight - clientHeight - scrollTop > EPSILON;
    if (hasTop && hasBottom) y = "both";
    else if (hasTop) y = "top";
    else if (hasBottom) y = "bottom";
  }

  let x: ScrollFadeX = null;
  if (clientWidth > 0 && scrollWidth - clientWidth > EPSILON) {
    const hasLeft = scrollLeft > EPSILON;
    const hasRight = scrollWidth - clientWidth - scrollLeft > EPSILON;
    if (hasLeft && hasRight) x = "both";
    else if (hasLeft) x = "left";
    else if (hasRight) x = "right";
  }

  return { y, x };
}
