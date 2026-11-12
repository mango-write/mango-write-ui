import { useState } from "react";
import { act, render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  attachScrollFade,
  computeScrollFadeState,
  syncScrollFade,
  useScrollFade,
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

describe("react scroll-fade & useScrollFade", () => {
  it("computes vertical and horizontal fade states at boundaries and mid-scroll", () => {
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

    mockScrollMetrics(container, { scrollTop: 50, scrollLeft: 60 });
    container.dispatchEvent(new Event("scroll"));
    expect(container.getAttribute("data-scroll-fade-y")).toBe("both");
    expect(container.getAttribute("data-scroll-fade-x")).toBe("both");
    expect(container.style.getPropertyValue("--mw-scroll-fade-top-offset")).toBe("36px");

    mockScrollMetrics(container, { scrollTop: 250, scrollLeft: 250 });
    container.dispatchEvent(new Event("scroll"));
    expect(container.getAttribute("data-scroll-fade-y")).toBe("top");
    expect(container.getAttribute("data-scroll-fade-x")).toBe("left");
    expect(container.style.getPropertyValue("--mw-scroll-fade-top-offset")).toBe("36px");

    ctrl.dispose();
    expect(container.hasAttribute("data-scroll-fade-y")).toBe(false);
    expect(container.hasAttribute("data-scroll-fade-x")).toBe(false);
  });

  it("works as useScrollFade React ref hook with size=sm, dynamic disable, and unmount cleanup", () => {
    let toggleEnabled!: (next: boolean) => void;
    let capturedRef!: ReturnType<typeof useScrollFade<HTMLDivElement>>;

    function Host() {
      const [enabled, setEnabled] = useState(true);
      toggleEnabled = setEnabled;
      const scrollRef = useScrollFade<HTMLDivElement>({
        size: "sm",
        disabled: !enabled,
      });
      capturedRef = scrollRef;
      return <div ref={scrollRef} data-testid="scroll-box" />;
    }

    const { getByTestId, unmount } = render(<Host />);
    const el = getByTestId("scroll-box");
    expect(capturedRef.current).toBe(el);
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

    act(() => {
      toggleEnabled(false);
    });
    expect(el.hasAttribute("data-scroll-fade-y")).toBe(false);
    expect(el.classList.contains("mw-scroll-fade")).toBe(false);

    unmount();
    expect(capturedRef.current).toBeNull();
  });
});
