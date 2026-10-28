import { h, nextTick } from "vue";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { mountUiComponent } from "../test-utils/mount.js";
import HoverCard from "./HoverCard.vue";

let mounted: ReturnType<typeof mountUiComponent> | null = null;

beforeEach(() => {
  vi.useFakeTimers();
  vi.stubGlobal("requestAnimationFrame", (callback: (time: number) => void) => {
    callback(0);
    return 0;
  });
  vi.stubGlobal("ResizeObserver", class {
    observe() {}
    disconnect() {}
  });
});

afterEach(() => {
  mounted?.unmount();
  mounted = null;
  document.body.innerHTML = "";
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

async function mountCard(interactive: boolean) {
  mounted = mountUiComponent(HoverCard, {
    attachTo: document.body,
    props: { interactive, label: "详细信息", showDelay: 0, hideDelay: 0 },
    slots: {
      default: () => "Anchor",
      content: () => (interactive ? h("button", { type: "button" }, "Action") : "Plain help"),
    },
    global: { stubs: { transition: false } },
  });
  const anchor = mounted.get(".mw-hovercard");
  await anchor.trigger("mouseenter");
  await vi.runAllTimersAsync();
  await nextTick();
  return { wrapper: mounted, anchor };
}

describe("HoverCard", () => {
  it("非交互内容保持 tooltip 与 describedby", async () => {
    const { anchor } = await mountCard(false);
    const panel = document.body.querySelector(".mw-hovercard__panel");
    expect(panel?.getAttribute("role")).toBe("tooltip");
    expect(anchor.attributes("aria-describedby")).toBe(panel?.id);
    expect(anchor.attributes("aria-haspopup")).toBeUndefined();
  });

  it("交互内容使用命名 dialog，Tab 进入且 Escape 归还焦点", async () => {
    const { anchor } = await mountCard(true);
    const panel = document.body.querySelector(".mw-hovercard__panel");
    expect(panel?.getAttribute("role")).toBe("dialog");
    expect(panel?.getAttribute("aria-label")).toBe("详细信息");
    expect(anchor.attributes("aria-describedby")).toBeUndefined();

    await anchor.trigger("keydown", { key: "Tab" });
    expect((document.activeElement as HTMLElement).textContent).toBe("Action");
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    await nextTick();
    expect(document.body.querySelector(".mw-hovercard__panel")).toBeNull();
    expect(document.activeElement).toBe(anchor.element);
  });
});
