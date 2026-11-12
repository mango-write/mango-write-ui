import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { AsyncSlot, type AsyncSlotProps } from "./AsyncSlot";

type RafCallback = (time: number) => void;

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
  function nextFrame() {
    act(() => {
      flushFrames();
      flushFrames();
    });
  }
  return { flushFrames, nextFrame };
}

beforeEach(() => {
  vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

const AREA_MS = 180;

describe("AsyncSlot", () => {
  it("renders loading skeleton immediately without initial transition and exposes status role", () => {
    const { container } = render(
      <AsyncSlot status="loading" skeleton="list">
        <p className="ready-flag">READY CONTENT</p>
      </AsyncSlot>,
    );
    expect(container.querySelector(".mw-async--loading")).not.toBeNull();
    expect(container.querySelector(".mw-async-host")?.getAttribute("aria-busy")).toBe(
      "true",
    );
    expect(screen.getByRole("status").textContent).toBe("正在加载");
    expect(container.querySelector(".mw-async-enter-active")).toBeNull();
  });

  it("supports custom loading override and skeleton='none' while keeping screen-reader status", () => {
    const { container } = render(
      <AsyncSlot
        status="loading"
        skeleton="none"
        loading={<div className="custom-skeleton">CUSTOM</div>}
      />,
    );
    expect(container.querySelector(".custom-skeleton")?.textContent).toBe("CUSTOM");
    expect(container.querySelector(".mw-async-skeleton")).toBeNull();
    expect(screen.getByRole("status").textContent).toBe("正在加载");
  });

  it("cross-fades loading -> ready with immediate ready mount and leaving skeleton cleanup", async () => {
    const { nextFrame } = stubManualRaf();
    const { container, rerender } = render(
      <AsyncSlot status="loading" skeleton="list">
        <p className="ready-flag">READY CONTENT</p>
      </AsyncSlot>,
    );

    rerender(
      <AsyncSlot status="ready" skeleton="list">
        <p className="ready-flag">READY CONTENT</p>
      </AsyncSlot>,
    );

    expect(container.querySelector(".ready-flag")).not.toBeNull();
    expect(container.querySelector(".mw-async--loading")).not.toBeNull();
    expect(container.querySelector(".mw-async-leave-active")).not.toBeNull();

    nextFrame();
    expect(container.querySelector(".mw-async-leave-to")).not.toBeNull();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(AREA_MS);
    });

    expect(container.querySelector(".mw-async--loading")).toBeNull();
    expect(container.querySelector(".mw-async-leave-active")).toBeNull();
    expect(container.querySelector(".mw-async-enter-active")).toBeNull();
    expect(container.querySelector(".ready-flag")).not.toBeNull();
    expect(container.querySelectorAll(".mw-async")).toHaveLength(1);
  });

  it("converges cleanly under rapid loading -> ready -> loading -> ready jumps", async () => {
    const { nextFrame } = stubManualRaf();
    const renderSlot = (status: AsyncSlotProps["status"]) => (
      <AsyncSlot status={status} skeleton="list">
        <p className="ready-flag">READY CONTENT</p>
      </AsyncSlot>
    );

    const { container, rerender } = render(renderSlot("loading"));
    rerender(renderSlot("ready"));
    nextFrame();
    await act(async () => {
      await vi.advanceTimersByTimeAsync(60);
    });
    rerender(renderSlot("loading"));
    nextFrame();
    await act(async () => {
      await vi.advanceTimersByTimeAsync(60);
    });
    rerender(renderSlot("ready"));
    nextFrame();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(AREA_MS * 4);
    });
    expect(container.querySelector(".ready-flag")).not.toBeNull();
    expect(container.querySelector(".mw-async--loading")).toBeNull();
    expect(container.querySelectorAll(".mw-async")).toHaveLength(1);
  });

  it("renders empty state and error state with retry callback, and respects prefers-reduced-motion", async () => {
    vi.spyOn(window, "matchMedia").mockReturnValue({
      matches: true,
    } as MediaQueryList);
    const { nextFrame } = stubManualRaf();
    const onRetry = vi.fn();

    const { container, rerender } = render(
      <AsyncSlot
        status="empty"
        emptyTitle="暂无文献"
        emptyHint="点击右上角导入第一篇文献"
        emptyAction={<button type="button">立即导入</button>}
        onRetry={onRetry}
      >
        <p>DATA</p>
      </AsyncSlot>,
    );

    expect(container.querySelector(".mw-async--empty")).not.toBeNull();
    expect(container.querySelector(".mw-async-title")?.textContent).toBe("暂无文献");
    expect(container.querySelector(".mw-async-hint")?.textContent).toBe(
      "点击右上角导入第一篇文献",
    );
    expect(screen.getByRole("button", { name: "立即导入" })).not.toBeNull();

    rerender(
      <AsyncSlot status="error" errorHint="网络连接超时" onRetry={onRetry}>
        <p>DATA</p>
      </AsyncSlot>,
    );
    nextFrame();
    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });

    expect(container.querySelector(".mw-async--empty")).toBeNull();
    expect(screen.getByRole("alert")).not.toBeNull();
    const retryBtn = screen.getByRole("button", { name: "重试" });
    fireEvent.click(retryBtn);
    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});
