import { useRef, useState } from "react";
import { act, fireEvent, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { UiLocaleProvider, useUiLocale } from "../locale";
import { computeHoverCardPosition, isRectOutsideViewport } from "./hover-card";
import { useOverlayZIndex } from "./overlay-layer";
import { Tooltip } from "./tooltip";
import { useComboPanel } from "./useComboPanel";

describe("react hover-card, Tooltip, locale, overlay-layer & useComboPanel", () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("computes flipped & clamped hover-card positions and detects out-of-viewport anchors", () => {
    const flipped = computeHoverCardPosition({
      anchor: { left: 100, top: 12, right: 180, bottom: 40, width: 80, height: 28 },
      panel: { width: 120, height: 48 },
      viewport: { width: 800, height: 600 },
      placement: "top",
    });
    expect(flipped.side).toBe("bottom");
    expect(flipped.top).toBe(48);

    const clamped = computeHoverCardPosition({
      anchor: { left: 2, top: 200, right: 32, bottom: 228, width: 30, height: 28 },
      panel: { width: 160, height: 40 },
      viewport: { width: 800, height: 600 },
      placement: "top",
    });
    expect(clamped.left).toBe(8);

    expect(
      isRectOutsideViewport(
        { left: 10, top: -50, right: 60, bottom: -10, width: 50, height: 40 },
        { width: 800, height: 600 },
      ),
    ).toBe(true);
  });

  it("Tooltip shows after 150ms or via mousemove throttle fallback, sets aria-describedby, and hides on Escape", () => {
    vi.useFakeTimers({
      toFake: ["setTimeout", "clearTimeout", "setInterval", "clearInterval"],
    });
    const now = vi.spyOn(performance, "now").mockReturnValue(0);

    const { getByTestId } = render(
      <Tooltip content="返回上一级" placement="bottom">
        <button type="button" data-testid="trigger">
          Back
        </button>
      </Tooltip>,
    );

    const trigger = getByTestId("trigger");
    fireEvent.mouseEnter(trigger);
    fireEvent.mouseMove(trigger);
    expect(document.querySelector(".mw-hovercard__panel")).toBeNull();

    now.mockReturnValue(100);
    fireEvent.mouseMove(trigger);
    expect(document.querySelector(".mw-hovercard__panel")).toBeNull();

    now.mockReturnValue(220);
    fireEvent.mouseMove(trigger);
    const panel = document.querySelector<HTMLElement>(".mw-hovercard__panel");
    expect(panel).not.toBeNull();
    expect(panel?.getAttribute("role")).toBe("tooltip");
    expect(panel?.textContent).toBe("返回上一级");
    expect(trigger.getAttribute("aria-describedby")).toBe(panel?.id);

    fireEvent.keyDown(trigger, { key: "Escape" });
    expect(document.querySelector(".mw-hovercard__panel")).toBeNull();
    expect(trigger.hasAttribute("aria-describedby")).toBe(false);
  });

  it("useUiLocale provides default zh-CN messages and supports UiLocaleProvider overrides", () => {
    function LabelProbe() {
      const { locale, messages, t } = useUiLocale();
      return (
        <div data-testid="locale-probe" data-locale={locale}>
          {messages.common.confirm.accept}|{t("common.admin.unsaved", { count: 3 })}
        </div>
      );
    }

    const { getByTestId, rerender } = render(<LabelProbe />);
    expect(getByTestId("locale-probe").getAttribute("data-locale")).toBe("zh-CN");
    expect(getByTestId("locale-probe").textContent).toBe("确定|3 项未保存");

    rerender(
      <UiLocaleProvider
        locale="en-US"
        messages={{ common: { confirm: { accept: "Proceed" } } }}
      >
        <LabelProbe />
      </UiLocaleProvider>,
    );
    expect(getByTestId("locale-probe").getAttribute("data-locale")).toBe("en-US");
    expect(getByTestId("locale-probe").textContent).toBe("Proceed|3 unsaved");
  });

  it("useOverlayZIndex assigns monotonic dynamic layers and resets to 1 when all overlays close", () => {
    function StackDemo({ openA, openB }: { openA: boolean; openB: boolean }) {
      const a = useOverlayZIndex(openA);
      const b = useOverlayZIndex(openB);
      return (
        <div>
          <span data-testid="z-a">{a.layerZ ?? "none"}</span>
          <span data-testid="z-b">{b.layerZ ?? "none"}</span>
        </div>
      );
    }

    const { getByTestId, rerender } = render(<StackDemo openA={true} openB={false} />);
    expect(getByTestId("z-a").textContent).toBe("calc(var(--z-overlay) + 1)");
    expect(getByTestId("z-b").textContent).toBe("none");

    rerender(<StackDemo openA={true} openB={true} />);
    expect(getByTestId("z-b").textContent).toBe("calc(var(--z-overlay) + 2)");

    rerender(<StackDemo openA={false} openB={false} />);
    expect(getByTestId("z-a").textContent).toBe("none");
    expect(getByTestId("z-b").textContent).toBe("none");

    rerender(<StackDemo openA={true} openB={false} />);
    expect(getByTestId("z-a").textContent).toBe("calc(var(--z-overlay) + 1)");
  });

  it("useComboPanel opens anchored panel and closes on outside pointerdown or Escape", () => {
    function ComboDemo() {
      const anchorRef = useRef<HTMLButtonElement | null>(null);
      const panelRef = useRef<HTMLDivElement | null>(null);
      const [closedCount, setClosedCount] = useState(0);
      const { open, panelStyle, side, openPanel } = useComboPanel(anchorRef, panelRef, {
        onClose: () => setClosedCount((c) => c + 1),
      });

      return (
        <div>
          <button
            ref={anchorRef}
            type="button"
            data-testid="combo-trigger"
            onClick={openPanel}
          >
            Open
          </button>
          {open ? (
            <div
              ref={panelRef}
              data-testid="combo-panel"
              data-side={side}
              style={panelStyle}
            >
              Panel
            </div>
          ) : null}
          <span data-testid="closed-count">{closedCount}</span>
        </div>
      );
    }

    const { getByTestId, queryByTestId } = render(<ComboDemo />);
    act(() => {
      getByTestId("combo-trigger").click();
    });
    expect(getByTestId("combo-panel")).not.toBeNull();

    act(() => {
      document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    });
    expect(queryByTestId("combo-panel")).toBeNull();
    expect(getByTestId("closed-count").textContent).toBe("1");
  });
});
