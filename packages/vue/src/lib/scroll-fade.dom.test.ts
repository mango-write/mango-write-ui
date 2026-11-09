import { mount } from "@vue/test-utils";
import { defineComponent, ref } from "vue";
import { describe, expect, it } from "vitest";
import {
  attachScrollFade,
  computeScrollFadeState,
  syncScrollFade,
  vScrollFade,
} from "./scroll-fade";

function mockScrollMetrics(
  el: HTMLElement,
  metrics: Partial<{
    scrollTop: number;
    scrollLeft: number;
    scrollHeight: number;
    scrollWidth: number;
    clientHeight: number;
    clientWidth: number;
  }>,
) {
  for (const [key, value] of Object.entries(metrics)) {
    Object.defineProperty(el, key, {
      configurable: true,
      writable: true,
      value,
    });
  }
}

describe("scroll-fade", () => {
  it("computes vertical and horizontal fade states at boundaries and mid-scroll", () => {
    // 内容未超出容器：无遮罩
    expect(
      computeScrollFadeState({
        scrollTop: 0,
        scrollLeft: 0,
        scrollHeight: 200,
        scrollWidth: 300,
        clientHeight: 200,
        clientWidth: 300,
      }),
    ).toEqual({ y: null, x: null });

    // 初始在顶部，下方有溢出：仅 bottom 渐隐
    expect(
      computeScrollFadeState({
        scrollTop: 0,
        scrollLeft: 0,
        scrollHeight: 500,
        scrollWidth: 300,
        clientHeight: 200,
        clientWidth: 300,
      }),
    ).toEqual({ y: "bottom", x: null });

    // 滚到中间：top 与 bottom 同时渐隐
    expect(
      computeScrollFadeState({
        scrollTop: 120,
        scrollLeft: 0,
        scrollHeight: 500,
        scrollWidth: 300,
        clientHeight: 200,
        clientWidth: 300,
      }),
    ).toEqual({ y: "both", x: null });

    // 滚到底部尽头（含 1px 亚像素容差）：仅 top 渐隐，底部恢复清晰
    expect(
      computeScrollFadeState({
        scrollTop: 299.5,
        scrollLeft: 0,
        scrollHeight: 500,
        scrollWidth: 300,
        clientHeight: 200,
        clientWidth: 300,
      }),
    ).toEqual({ y: "top", x: null });

    // 横向与纵向同时溢出
    expect(
      computeScrollFadeState({
        scrollTop: 40,
        scrollLeft: 0,
        scrollHeight: 400,
        scrollWidth: 600,
        clientHeight: 200,
        clientWidth: 300,
      }),
    ).toEqual({ y: "both", x: "right" });
  });

  it("updates data-scroll-fade-y / data-scroll-fade-x and stickyHeader offset on scroll", () => {
    const container = document.createElement("div");
    const thead = document.createElement("div");
    thead.className = "mw-datatable__thead";
    Object.defineProperty(thead, "offsetHeight", { configurable: true, value: 36 });
    container.appendChild(thead);

    mockScrollMetrics(container, {
      scrollTop: 0,
      scrollLeft: 0,
      scrollHeight: 400,
      scrollWidth: 500,
      clientHeight: 150,
      clientWidth: 250,
    });

    const ctrl = attachScrollFade(container, { stickyHeader: ".mw-datatable__thead" });
    expect(container.classList.contains("mw-scroll-fade")).toBe(true);
    expect(container.getAttribute("data-scroll-fade-y")).toBe("bottom");
    expect(container.getAttribute("data-scroll-fade-x")).toBe("right");
    expect(container.style.getPropertyValue("--mw-scroll-fade-top-offset")).toBe("");

    // 向下并向右滚动到中段
    mockScrollMetrics(container, { scrollTop: 50, scrollLeft: 60 });
    container.dispatchEvent(new Event("scroll"));
    expect(container.getAttribute("data-scroll-fade-y")).toBe("both");
    expect(container.getAttribute("data-scroll-fade-x")).toBe("both");
    expect(container.style.getPropertyValue("--mw-scroll-fade-top-offset")).toBe("36px");

    // 滚到底部与最右端
    mockScrollMetrics(container, { scrollTop: 250, scrollLeft: 250 });
    container.dispatchEvent(new Event("scroll"));
    expect(container.getAttribute("data-scroll-fade-y")).toBe("top");
    expect(container.getAttribute("data-scroll-fade-x")).toBe("left");
    expect(container.style.getPropertyValue("--mw-scroll-fade-top-offset")).toBe("36px");

    ctrl.dispose();
    expect(container.hasAttribute("data-scroll-fade-y")).toBe(false);
    expect(container.hasAttribute("data-scroll-fade-x")).toBe(false);
  });

  it("works as v-scroll-fade directive with .sm modifier and cleans up on unmount", async () => {
    const enabled = ref(true);
    const Host = defineComponent({
      directives: { scrollFade: vScrollFade },
      setup() {
        return { enabled };
      },
      template: `<div v-scroll-fade.sm="{ disabled: !enabled }" class="host-scroll"></div>`,
    });

    const wrapper = mount(Host);
    const el = wrapper.element as HTMLElement;
    expect(el.classList.contains("mw-scroll-fade")).toBe(true);
    expect(el.classList.contains("mw-scroll-fade--sm")).toBe(true);

    mockScrollMetrics(el, {
      scrollTop: 0,
      scrollLeft: 0,
      scrollHeight: 300,
      scrollWidth: 100,
      clientHeight: 120,
      clientWidth: 100,
    });
    syncScrollFade(el, { size: "sm" });
    expect(el.getAttribute("data-scroll-fade-y")).toBe("bottom");

    enabled.value = false;
    await wrapper.vm.$nextTick();
    expect(el.hasAttribute("data-scroll-fade-y")).toBe(false);

    wrapper.unmount();
  });
});
