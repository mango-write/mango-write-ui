import { describe, expect, it } from "vitest";
import { computeHoverCardPosition, isRectOutsideViewport } from "./hover-card.js";

const VIEWPORT = { width: 1280, height: 800 };
const GAP = 8;

type RectLikeInput = Parameters<typeof computeHoverCardPosition>[0]["anchor"];

function centeredAnchor(overrides: Partial<RectLikeInput> = {}) {
  return {
    left: 590,
    top: 380,
    right: 690,
    bottom: 420,
    width: 100,
    height: 40,
    ...overrides,
  };
}

describe("computeHoverCardPosition", () => {
  it("top 放置：panel 居中于锚点上方", () => {
    const pos = computeHoverCardPosition({
      anchor: centeredAnchor(),
      panel: { width: 200, height: 80 },
      viewport: VIEWPORT,
      placement: "top",
    });

    expect(pos.side).toBe("top");
    expect(pos.left).toBe(540);
    expect(pos.top).toBe(380 - GAP - 80);
  });

  it("上方放不下且下方更宽裕时翻转为 bottom", () => {
    const pos = computeHoverCardPosition({
      anchor: centeredAnchor({ top: 20, bottom: 60 }),
      panel: { width: 200, height: 120 },
      viewport: VIEWPORT,
      placement: "top",
    });

    expect(pos.side).toBe("bottom");
    expect(pos.top).toBe(60 + GAP);
  });

  it("两侧都放不下时保持期望方向（对侧更窄就不翻转，宁可压住锚点也不乱跳）", () => {
    const pos = computeHoverCardPosition({
      anchor: centeredAnchor({ top: 400, bottom: 780 }),
      panel: { width: 200, height: 900 },
      viewport: VIEWPORT,
      placement: "top",
    });

    expect(pos.side).toBe("top");
    expect(pos.top).toBe(400 - GAP - 900);
  });

  it("锚点贴右边缘：交叉轴夹进视口", () => {
    const pos = computeHoverCardPosition({
      anchor: centeredAnchor({ left: 1150, right: 1250 }),
      panel: { width: 200, height: 80 },
      viewport: VIEWPORT,
      placement: "top",
    });

    expect(pos.left).toBe(1280 - 200 - 8);
  });

  it("left/right 放置：垂直居中，贴边时翻转", () => {
    const right = computeHoverCardPosition({
      anchor: centeredAnchor(),
      panel: { width: 160, height: 60 },
      viewport: VIEWPORT,
      placement: "right",
    });
    expect(right.side).toBe("right");
    expect(right.left).toBe(690 + GAP);
    expect(right.top).toBe(400 - 30);

    const flipped = computeHoverCardPosition({
      anchor: centeredAnchor({ right: 1270, left: 1170 }),
      panel: { width: 160, height: 60 },
      viewport: VIEWPORT,
      placement: "right",
    });
    expect(flipped.side).toBe("left");
    expect(flipped.left).toBe(1170 - GAP - 160);
  });

  it("panel 未量测（0 尺寸）时不 NaN，给出可渲染的初值", () => {
    const pos = computeHoverCardPosition({
      anchor: centeredAnchor(),
      panel: { width: 0, height: 0 },
      viewport: VIEWPORT,
      placement: "bottom",
    });

    expect(Number.isFinite(pos.left)).toBe(true);
    expect(Number.isFinite(pos.top)).toBe(true);
  });
});

describe("isRectOutsideViewport", () => {
  it("四个方向出界都判定为 true，在界内为 false", () => {
    expect(isRectOutsideViewport({ left: 0, top: -50, right: 10, bottom: -10, width: 10, height: 40 }, VIEWPORT)).toBe(true);
    expect(isRectOutsideViewport({ left: 0, top: 810, right: 10, bottom: 850, width: 10, height: 40 }, VIEWPORT)).toBe(true);
    expect(isRectOutsideViewport({ left: -30, top: 0, right: -10, bottom: 10, width: 20, height: 10 }, VIEWPORT)).toBe(true);
    expect(isRectOutsideViewport({ left: 1300, top: 0, right: 1320, bottom: 10, width: 20, height: 10 }, VIEWPORT)).toBe(true);
    expect(isRectOutsideViewport(centeredAnchor(), VIEWPORT)).toBe(false);
  });
});
