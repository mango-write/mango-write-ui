// AsyncSlot 四态收敛回归：状态换装默认交叉淡入（新区即刻入流，离场分支脱流
// 淡出），完成信号走显式 :duration 的 JS 计时器，不依赖 transitionend 投递
// （jsdom 里它天然永不投递，正合此契约；机制见 shared/lib/area-transition）。
// 不用 out-in：其延迟插入协调在快速换态下会竞态丢失（新区停在占位注释），
// 这里也冻结「内容分支即刻挂载」这一默认模式契约。计时器在 nextFrame（双层
// rAF）后注册，故每步先推进帧再推时间。须真实 Transition：VTU 默认的
// transition-stub 会把整套机制换掉。
import { mountUiComponent } from "../test-utils/mount.js";
import { h } from "vue";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import AsyncSlot from "./AsyncSlot.vue";

type RafCallback = (time: number) => void;

/** 手动 rAF 队列：flushFrames() 跑一轮帧（Vue 的 nextFrame 是双层 rAF，要跑两次）。 */
function stubManualRaf() {
  let queue: RafCallback[] = [];
  vi.stubGlobal("requestAnimationFrame", (cb: RafCallback) => {
    queue.push(cb);
    return queue.length;
  });
  vi.stubGlobal("cancelAnimationFrame", () => {});
  function flushFrames() {
    const pending = queue;
    queue = [];
    for (const cb of pending) cb(0);
  }
  /** 推进两轮帧（渡过 nextFrame 的双层 rAF）。 */
  function nextFrame() {
    flushFrames();
    flushFrames();
  }
  return { flushFrames, nextFrame };
}

beforeEach(() => {
  document.body.innerHTML = "";
  vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

function mountSlot(props: Record<string, unknown> = {}) {
  return mountUiComponent(AsyncSlot, {
    attachTo: document.body,
    props: { status: "loading", skeleton: "list", ...props },
    slots: { default: () => h("p", { class: "ready-flag" }, "READY CONTENT") },
    global: { stubs: { transition: false } },
  });
}

const $ = (selector: string) => document.body.querySelector(selector);

const AREA_MS = 180;

describe("AsyncSlot 四态收敛", () => {
  it("初始挂载不过渡：骨架分支立即渲染并提供读屏状态", () => {
    mountSlot();
    expect($(".mw-async--loading")).not.toBeNull();
    expect($(".mw-async-host")?.getAttribute("aria-busy")).toBe("true");
    expect($('[role="status"]')?.textContent).toBe("正在加载");
    expect($(".mw-async-enter-active")).toBeNull();
  });

  it("loading slot 可替换骨架，skeleton=none 仍保留读屏反馈", () => {
    mountUiComponent(AsyncSlot, {
      attachTo: document.body,
      props: { status: "loading", skeleton: "none" },
      slots: { loading: () => h("div", { class: "custom-skeleton" }, "CUSTOM") },
      global: { stubs: { transition: false } },
    });
    expect($(".custom-skeleton")?.textContent).toBe("CUSTOM");
    expect($(".mw-async-skeleton")).toBeNull();
    expect($('[role="status"]')?.textContent).toBe("正在加载");
  });

  it("loading→ready：内容分支即刻入流（默认模式，无 out-in 门控），骨架脱流离场", async () => {
    const { nextFrame } = stubManualRaf();
    const wrapper = mountSlot();
    await wrapper.setProps({ status: "ready" });
    // 默认模式：内容分支立即挂载，骨架同时开始离场
    expect($(".ready-flag")).not.toBeNull();
    expect($(".mw-async--loading")).not.toBeNull();
    expect($(".mw-async-leave-active")).not.toBeNull();

    nextFrame();
    expect($(".mw-async-leave-to")).not.toBeNull();
    await vi.advanceTimersByTimeAsync(AREA_MS);
    // 骨架离场落定、内容进场完成，收敛到单分支
    expect($(".mw-async--loading")).toBeNull();
    expect($(".mw-async-leave-active")).toBeNull();
    expect($(".ready-flag")).not.toBeNull();
    await vi.advanceTimersByTimeAsync(AREA_MS);
    expect($(".mw-async-enter-active")).toBeNull();
    expect(document.body.querySelectorAll(".mw-async")).toHaveLength(1);
  });

  it("快速连跳 loading→ready→loading→ready：收敛到最终 ready 且只剩一个分支", async () => {
    const { nextFrame } = stubManualRaf();
    const wrapper = mountSlot();
    await wrapper.setProps({ status: "ready" });
    nextFrame();
    await vi.advanceTimersByTimeAsync(60);
    await wrapper.setProps({ status: "loading" });
    nextFrame();
    await vi.advanceTimersByTimeAsync(60);
    await wrapper.setProps({ status: "ready" });
    nextFrame();

    await vi.advanceTimersByTimeAsync(AREA_MS * 4);
    expect($(".ready-flag")).not.toBeNull();
    expect($(".mw-async--loading")).toBeNull();
    expect(document.body.querySelectorAll(".mw-async")).toHaveLength(1);
  });

  it("prefers-reduced-motion：时长归零，帧后下一宏任务即收敛", async () => {
    vi.spyOn(window, "matchMedia").mockReturnValue({ matches: true } as MediaQueryList);
    const { nextFrame } = stubManualRaf();
    const wrapper = mountSlot();

    await wrapper.setProps({ status: "ready" });
    expect($(".ready-flag")).not.toBeNull();
    nextFrame();
    await vi.advanceTimersByTimeAsync(0);
    expect($(".mw-async--loading")).toBeNull();
  });
});
