// @vitest-environment happy-dom
import { afterEach, describe, expect, it, vi } from "vitest";
import { mount } from "@vue/test-utils";

import HoverCard from "../components/HoverCard.vue";
import { computeHoverCardPosition, isRectOutsideViewport } from "./hover-card";

const VIEWPORT = { width: 1280, height: 800 };
const GAP = 8;

/** 视口中间一个 100x40 的锚点。 */
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

type RectLikeInput = Parameters<typeof computeHoverCardPosition>[0]["anchor"];

describe("computeHoverCardPosition", () => {
  it("top 放置：panel 居中于锚点上方", () => {
    const pos = computeHoverCardPosition({
      anchor: centeredAnchor(),
      panel: { width: 200, height: 80 },
      viewport: VIEWPORT,
      placement: "top",
    });

    expect(pos.side).toBe("top");
    expect(pos.left).toBe(540); // 640 - 200/2
    expect(pos.top).toBe(380 - GAP - 80); // 锚点顶部 - 间隙 - 面板高
  });

  it("上方放不下且下方更宽裕时翻转为 bottom", () => {
    const pos = computeHoverCardPosition({
      anchor: centeredAnchor({ top: 20, bottom: 60 }), // 贴近视口顶
      panel: { width: 200, height: 120 },
      viewport: VIEWPORT,
      placement: "top",
    });

    expect(pos.side).toBe("bottom");
    expect(pos.top).toBe(60 + GAP);
  });

  it("两侧都放不下时保持期望方向（对侧更窄就不翻转，宁可压住锚点也不乱跳）", () => {
    const pos = computeHoverCardPosition({
      anchor: centeredAnchor({ top: 400, bottom: 780 }), // 贴近视口底
      panel: { width: 200, height: 900 }, // 比视口还高
      viewport: VIEWPORT,
      placement: "top",
    });

    expect(pos.side).toBe("top");
    expect(pos.top).toBe(400 - GAP - 900);
  });

  it("锚点贴右边缘：交叉轴夹进视口", () => {
    const pos = computeHoverCardPosition({
      anchor: centeredAnchor({ left: 1150, right: 1250 }), // 中心 1200
      panel: { width: 200, height: 80 },
      viewport: VIEWPORT,
      placement: "top",
    });

    expect(pos.left).toBe(1280 - 200 - 8); // 夹到右缘呼吸位
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
      anchor: centeredAnchor({ right: 1270, left: 1170 }), // 贴右缘
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

describe("HoverCard 组件（遮挡节流兜底）", () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    document.body.innerHTML = "";
  });

  it("timer 被钳制时到点的 mousemove 兜底出场（遮挡节流回归）", async () => {
    // timer 全程挂起不推进（被节流的世界），只让 performance.now() 前走
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout", "setInterval", "clearInterval"] });
    const now = vi.spyOn(performance, "now").mockReturnValue(0);
    const wrapper = mount(HoverCard, { slots: { content: "文献卡内容" } });
    const anchor = wrapper.find(".mw-hovercard");

    await anchor.trigger("mouseenter");
    await anchor.trigger("mousemove"); // showDelay 内不出场
    expect(document.querySelector(".mw-hovercard__panel")).toBeNull();

    now.mockReturnValue(100);
    await anchor.trigger("mousemove");
    expect(document.querySelector(".mw-hovercard__panel")).toBeNull();

    now.mockReturnValue(250); // 已过 showDelay 且 timer 仍挂起 → 就地出场
    await anchor.trigger("mousemove");
    const panel = document.querySelector<HTMLElement>(".mw-hovercard__panel");
    expect(panel).not.toBeNull();
    expect(panel?.textContent).toContain("文献卡内容");
    expect(wrapper.attributes("aria-describedby")).toBeUndefined();
    expect(anchor.attributes("aria-describedby")).toBe(panel?.id);

    // 兜底出场即接管：挂起的 showTimer 已清，迟到的 timer 不补枪
    now.mockRestore();
    await vi.advanceTimersByTimeAsync(1000);
    expect(document.querySelector(".mw-hovercard__panel")).not.toBeNull();

    // mouseleave 走 hideDelay 指针桥，到期照常收起
    await anchor.trigger("mouseleave");
    expect(document.querySelector(".mw-hovercard__panel")).not.toBeNull();
    await vi.advanceTimersByTimeAsync(150);
    expect(document.querySelector(".mw-hovercard__panel")).toBeNull();
    await vi.advanceTimersByTimeAsync(1000);
    expect(document.querySelector(".mw-hovercard__panel")).toBeNull();
  });
});
