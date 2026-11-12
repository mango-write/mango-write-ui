import { useEffect } from "react";
import { act, fireEvent, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  NotifyProvider,
  createNotifyStore,
  defaultNotifyStore,
  useNotify,
} from "../lib/notify";
import ToastHost, { type ToastPosition } from "./ToastHost";

describe("ToastHost & useNotify", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    document.documentElement.className = "";
  });

  afterEach(() => {
    defaultNotifyStore.removeAllGroups();
    document.documentElement.className = "";
    vi.useRealTimers();
  });

  it("supports all 6 corner positions, 4 severities with .mw-frost, live roles, and never steals focus", () => {
    const trigger = document.createElement("button");
    trigger.textContent = "Trigger";
    document.body.appendChild(trigger);
    trigger.focus();

    const positions: ToastPosition[] = [
      "top-right",
      "top-left",
      "bottom-right",
      "bottom-left",
      "top-center",
      "bottom-center",
    ];

    const { container, rerender } = render(<ToastHost position="top-right" />);
    for (const pos of positions) {
      rerender(<ToastHost position={pos} />);
      const host = container.querySelector(".mw-toast-host")!;
      expect(host.classList.contains(`mw-toast-host--${pos}`)).toBe(true);
      expect(host.getAttribute("data-position")).toBe(pos);
    }

    act(() => {
      defaultNotifyStore.success("保存成功", "文档已同步至云端");
      defaultNotifyStore.info("提示", "后台索引完成");
      defaultNotifyStore.warn("注意", "即将达到配额上限");
      defaultNotifyStore.error("保存失败", "网络连接超时");
    });

    expect(document.activeElement).toBe(trigger);

    const toasts = container.querySelectorAll(".mw-toast");
    expect(toasts).toHaveLength(4);
    expect(toasts[0]!.classList.contains("mw-frost")).toBe(true);
    expect(toasts[0]!.getAttribute("role")).toBe("status");
    expect(toasts[0]!.getAttribute("aria-live")).toBe("polite");
    expect(toasts[0]!.textContent).toContain("保存成功");
    expect(toasts[0]!.textContent).toContain("文档已同步至云端");

    expect(toasts[1]!.getAttribute("role")).toBe("status");
    expect(toasts[2]!.getAttribute("role")).toBe("status");

    expect(toasts[3]!.getAttribute("role")).toBe("alert");
    expect(toasts[3]!.getAttribute("aria-live")).toBe("assertive");
    expect(toasts[3]!.textContent).toContain("保存失败");

    trigger.remove();
  });

  it("updates same-id toast in-place without remounting or changing announceKey", () => {
    const { container } = render(<ToastHost />);

    act(() => {
      defaultNotifyStore.add({
        id: "export-task",
        severity: "info",
        summary: "正在导出",
        detail: "进度 30%",
      });
    });

    const firstEl = container.querySelector('[data-toast-id="export-task"]')!;
    const firstAnnounceKey = firstEl.getAttribute("data-announce-key");
    expect(firstAnnounceKey).toBeTruthy();

    act(() => {
      defaultNotifyStore.add({
        id: "export-task",
        severity: "success",
        summary: "导出完成",
        detail: "进度 100%",
      });
    });

    const toasts = container.querySelectorAll(".mw-toast");
    expect(toasts).toHaveLength(1);
    const updatedEl = container.querySelector('[data-toast-id="export-task"]')!;
    expect(updatedEl).toBe(firstEl);
    expect(updatedEl.getAttribute("data-announce-key")).toBe(firstAnnounceKey);
    expect(updatedEl.textContent).toContain("导出完成");
    expect(updatedEl.textContent).toContain("进度 100%");
  });

  it("auto-dismisses after life and pauses countdown on pointer hover, resuming on leave", () => {
    const { container } = render(<ToastHost />);

    act(() => {
      defaultNotifyStore.info("自动消失通知", undefined, { life: 1000 });
    });
    expect(container.querySelectorAll(".mw-toast")).toHaveLength(1);

    act(() => {
      vi.advanceTimersByTime(600);
    });
    fireEvent.mouseEnter(container.querySelector(".mw-toast")!);

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(container.querySelectorAll(".mw-toast")).toHaveLength(1);

    fireEvent.mouseLeave(container.querySelector(".mw-toast")!);
    act(() => {
      vi.advanceTimersByTime(350);
    });
    expect(container.querySelectorAll(".mw-toast")).toHaveLength(1);

    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect(container.querySelectorAll(".mw-toast")).toHaveLength(0);
  });

  it("supports group filtering, inline action button, close button, custom renderMessage, and isolated NotifyProvider", () => {
    const onAction = vi.fn();
    const storeA = createNotifyStore();
    const storeB = createNotifyStore();

    function Producer({ label }: { label: string }) {
      const notify = useNotify();
      useEffect(() => {
        notify.success(label);
      }, [notify, label]);
      return <ToastHost />;
    }

    const { container } = render(
      <>
        <ToastHost />
        <ToastHost
          group="upload"
          position="bottom-right"
          renderMessage={({ message, close }) => (
            <div className="custom-upload-toast" onClick={close}>
              {message.summary}
            </div>
          )}
        />
        <div data-app-a="">
          <NotifyProvider store={storeA}>
            <Producer label="仅在 App A 显示" />
          </NotifyProvider>
        </div>
        <div data-app-b="">
          <NotifyProvider store={storeB}>
            <Producer label="仅在 App B 显示" />
          </NotifyProvider>
        </div>
      </>,
    );

    act(() => {
      defaultNotifyStore.add({
        severity: "info",
        summary: "主通道消息",
        action: { label: "撤销", onClick: onAction },
      });
      defaultNotifyStore.add({
        severity: "success",
        group: "upload",
        summary: "上传通道消息",
      });
    });

    fireEvent.click(container.querySelector(".mw-toast__action-btn")!);
    expect(onAction).toHaveBeenCalledTimes(1);

    const closeBtn = container.querySelector(".mw-toast__close")!;
    expect(closeBtn.getAttribute("aria-label")).toBe("关闭");
    fireEvent.click(closeBtn);

    const customToast = container.querySelector(".custom-upload-toast")!;
    expect(customToast.textContent).toBe("上传通道消息");
    fireEvent.click(customToast);
    expect(container.querySelector(".custom-upload-toast")).toBeNull();

    expect(container.querySelector("[data-app-a]")?.textContent).toContain("仅在 App A 显示");
    expect(container.querySelector("[data-app-a]")?.textContent).not.toContain("仅在 App B 显示");
    expect(container.querySelector("[data-app-b]")?.textContent).toContain("仅在 App B 显示");
  });
});
