import { useState } from "react";
import { act, fireEvent, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import HoverCard from "./HoverCard";

describe("HoverCard", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.stubGlobal("requestAnimationFrame", (callback: (time: number) => void) => {
      callback(0);
      return 0;
    });
    vi.stubGlobal(
      "ResizeObserver",
      class {
        observe() {}
        disconnect() {}
      },
    );
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("expands .mw-frost--thick panel after 150ms hover and preserves tooltip role + aria-describedby when non-interactive", () => {
    render(
      <HoverCard interactive={false} label="详细信息" content="Plain help">
        Anchor
      </HoverCard>,
    );

    const anchor = document.querySelector<HTMLElement>(".mw-hovercard")!;
    fireEvent.mouseEnter(anchor);

    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect(document.body.querySelector(".mw-hovercard__panel")).toBeNull();

    act(() => {
      vi.advanceTimersByTime(60);
    });
    const panel = document.body.querySelector<HTMLElement>(".mw-hovercard__panel");
    expect(panel).not.toBeNull();
    expect(panel?.classList.contains("mw-frost--thick")).toBe(true);
    expect(panel?.getAttribute("role")).toBe("tooltip");
    expect(anchor.getAttribute("aria-describedby")).toBe(panel?.id);
    expect(anchor.hasAttribute("aria-haspopup")).toBe(false);
  });

  it("uses named dialog role when interactive, supports Tab into panel and Escape returning focus", () => {
    render(
      <HoverCard
        interactive={true}
        label="详细信息"
        showDelay={0}
        hideDelay={0}
        content={<button type="button">Action</button>}
      >
        Anchor
      </HoverCard>,
    );

    const anchor = document.querySelector<HTMLElement>(".mw-hovercard")!;
    fireEvent.focus(anchor);
    act(() => {
      vi.runAllTimers();
    });

    const panel = document.body.querySelector<HTMLElement>(".mw-hovercard__panel");
    expect(panel).not.toBeNull();
    expect(panel?.getAttribute("role")).toBe("dialog");
    expect(panel?.getAttribute("aria-label")).toBe("详细信息");
    expect(anchor.hasAttribute("aria-describedby")).toBe(false);

    fireEvent.keyDown(anchor, { key: "Tab" });
    expect((document.activeElement as HTMLElement)?.textContent).toBe("Action");

    act(() => {
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    });
    expect(document.body.querySelector(".mw-hovercard__panel")).toBeNull();
    expect(document.activeElement).toBe(anchor);
  });

  it("supports controlled open / onOpenChange and closes when scrolled outside viewport", () => {
    const onOpenChange = vi.fn();

    function ControlledDemo() {
      const [open, setOpen] = useState(false);
      return (
        <HoverCard
          open={open}
          onOpenChange={(next) => {
            onOpenChange(next);
            setOpen(next);
          }}
          showDelay={0}
          content={<div>Card Content</div>}
        >
          Trigger
        </HoverCard>
      );
    }

    render(<ControlledDemo />);
    const anchor = document.querySelector<HTMLElement>(".mw-hovercard")!;
    vi.spyOn(anchor, "getBoundingClientRect").mockReturnValue({
      x: 40,
      y: 80,
      left: 40,
      top: 80,
      right: 120,
      bottom: 108,
      width: 80,
      height: 28,
      toJSON: () => ({}),
    });

    fireEvent.mouseEnter(anchor);
    act(() => {
      vi.runAllTimers();
    });
    expect(onOpenChange).toHaveBeenCalledWith(true);
    expect(document.body.querySelector(".mw-hovercard__panel")).not.toBeNull();

    // Simulate anchor scrolled completely out of viewport
    vi.spyOn(anchor, "getBoundingClientRect").mockReturnValue({
      x: 40,
      y: -200,
      left: 40,
      top: -200,
      right: 120,
      bottom: -172,
      width: 80,
      height: 28,
      toJSON: () => ({}),
    });
    act(() => {
      window.dispatchEvent(new Event("scroll"));
    });
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
    expect(document.body.querySelector(".mw-hovercard__panel")).toBeNull();
  });
});
