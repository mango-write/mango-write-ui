// @vitest-environment happy-dom
import { afterEach, describe, expect, it, vi } from "vitest";
import { mount } from "@vue/test-utils";

import HoverCard from "../components/HoverCard.vue";

describe("HoverCard 组件（遮挡节流兜底）", () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    document.body.innerHTML = "";
  });

  it("timer 被钳制时到点的 mousemove 兜底出场（遮挡节流回归）", async () => {
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout", "setInterval", "clearInterval"] });
    const now = vi.spyOn(performance, "now").mockReturnValue(0);
    const wrapper = mount(HoverCard, {
      props: { interactive: false },
      slots: { content: "文献卡内容" },
    });
    const anchor = wrapper.find(".mw-hovercard");

    await anchor.trigger("mouseenter");
    await anchor.trigger("mousemove");
    expect(document.querySelector(".mw-hovercard__panel")).toBeNull();

    now.mockReturnValue(100);
    await anchor.trigger("mousemove");
    expect(document.querySelector(".mw-hovercard__panel")).toBeNull();

    now.mockReturnValue(250);
    await anchor.trigger("mousemove");
    const panel = document.querySelector<HTMLElement>(".mw-hovercard__panel");
    expect(panel).not.toBeNull();
    expect(panel?.textContent).toContain("文献卡内容");
    expect(wrapper.attributes("aria-describedby")).toBeUndefined();
    expect(anchor.attributes("aria-describedby")).toBe(panel?.id);

    now.mockRestore();
    await vi.advanceTimersByTimeAsync(1000);
    expect(document.querySelector(".mw-hovercard__panel")).not.toBeNull();

    await anchor.trigger("mouseleave");
    expect(document.querySelector(".mw-hovercard__panel")).not.toBeNull();
    await vi.advanceTimersByTimeAsync(150);
    expect(document.querySelector(".mw-hovercard__panel")).toBeNull();
    await vi.advanceTimersByTimeAsync(1000);
    expect(document.querySelector(".mw-hovercard__panel")).toBeNull();
  });
});
