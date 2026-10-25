// HoverCard 的定位算法（纯函数，供 HoverCard.vue 使用与单测覆盖）。
//
// 定位模型与 useComboPanel 同源：panel 以 `position: fixed` 挂在 body，坐标
// 全部来自 getBoundingClientRect 的视口系——与 fixed 同一坐标系，不经过
// document 坐标换算，body 滚动和 transform 祖先都不会产生漂移。滚动/缩放/
// 内容尺寸变化由组件层监听并重算（见 HoverCard.vue），这里只做一次放置决策：
//
//   1. 期望方向放不下且对侧更宽裕 → 翻转（top↔bottom / left↔right）；
//   2. 交叉轴夹进视口（贴边时 panel 不溢出）。
// 面板不带箭头（玻璃材质上 CSS 三角是实心补丁），指向由 GAP 悬浮偏移表达。

export type HoverCardPlacement = "top" | "bottom" | "left" | "right";

/** 视口边缘保留的呼吸位。 */
const VIEWPORT_PAD = 8;
/** panel 与锚点之间的悬浮间隙。 */
const GAP = 8;

export interface RectLike {
  left: number;
  top: number;
  right: number;
  bottom: number;
  width: number;
  height: number;
}

export interface HoverCardGeometry {
  anchor: RectLike;
  panel: { width: number; height: number };
  viewport: { width: number; height: number };
  placement: HoverCardPlacement;
}

export interface HoverCardPosition {
  /** 翻转后的实际放置方向。 */
  side: HoverCardPlacement;
  left: number;
  top: number;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), Math.max(min, max));
}

function clampCrossAxis(
  anchorCenter: number,
  panelSize: number,
  viewportSize: number,
): number {
  // 面板比视口还宽时 max < min，clamp 兜到 VIEWPORT_PAD，允许溢出。
  return clamp(anchorCenter - panelSize / 2, VIEWPORT_PAD, viewportSize - panelSize - VIEWPORT_PAD);
}

export function computeHoverCardPosition({
  anchor,
  panel,
  viewport,
  placement,
}: HoverCardGeometry): HoverCardPosition {
  const needV = panel.height + GAP;
  const needH = panel.width + GAP;
  const room = {
    top: anchor.top - VIEWPORT_PAD,
    bottom: viewport.height - anchor.bottom - VIEWPORT_PAD,
    left: anchor.left - VIEWPORT_PAD,
    right: viewport.width - anchor.right - VIEWPORT_PAD,
  };

  let side = placement;
  if (side === "top" && needV > room.top && room.bottom > room.top) side = "bottom";
  else if (side === "bottom" && needV > room.bottom && room.top > room.bottom) side = "top";
  else if (side === "left" && needH > room.left && room.right > room.left) side = "right";
  else if (side === "right" && needH > room.right && room.left > room.right) side = "left";

  const anchorCenterX = anchor.left + anchor.width / 2;
  const anchorCenterY = anchor.top + anchor.height / 2;

  if (side === "top" || side === "bottom") {
    const left = clampCrossAxis(anchorCenterX, panel.width, viewport.width);
    const top =
      side === "top" ? anchor.top - GAP - panel.height : anchor.bottom + GAP;
    return { side, left, top };
  }

  const top = clampCrossAxis(anchorCenterY, panel.height, viewport.height);
  const left = side === "left" ? anchor.left - GAP - panel.width : anchor.right + GAP;
  return { side, left, top };
}

/** 锚点被内部滚动容器卷出视口时该收起 tooltip（鼠标已不在锚点上，事件不会再来了）。 */
export function isRectOutsideViewport(rect: RectLike, viewport: { width: number; height: number }): boolean {
  return rect.bottom < 0 || rect.top > viewport.height || rect.right < 0 || rect.left > viewport.width;
}
