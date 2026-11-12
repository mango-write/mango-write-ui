import { act, fireEvent, render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import Dialog from "./Dialog";

describe("Dialog", () => {
  it("renders title, description, lead, body, footer and links accessible title & description", () => {
    const { container } = render(
      <Dialog
        open={true}
        title="编辑项目"
        description="修改项目的基础元数据"
        width="28rem"
        appendTo="self"
        data-testid="project-dialog"
        lead={<div className="lead-banner">顶部提示</div>}
        footer={<button type="button">保存</button>}
      >
        <p>表单正文</p>
      </Dialog>,
    );

    const dialog = container.querySelector<HTMLElement>('[role="dialog"]')!;
    expect(dialog).not.toBeNull();
    expect(dialog.classList.contains("mw-dialog")).toBe(true);
    expect(dialog.classList.contains("mw-frost")).toBe(true);
    expect(dialog.classList.contains("mw-frost--thick")).toBe(true);
    expect(dialog.getAttribute("data-testid")).toBe("project-dialog");
    expect(dialog.style.width).toBe("28rem");
    expect(dialog.style.zIndex).toMatch(/^calc\(var\(--z-overlay\)\s*\+\s*\d+\)$/);

    const titleEl = container.querySelector<HTMLElement>(".mw-dialog__title")!;
    const descEl = container.querySelector<HTMLElement>(".mw-dialog__description")!;
    expect(titleEl.textContent).toBe("编辑项目");
    expect(descEl.textContent).toBe("修改项目的基础元数据");
    expect(dialog.getAttribute("aria-labelledby")).toBe(titleEl.id);
    expect(dialog.getAttribute("aria-describedby")).toBe(descEl.id);
    expect(container.querySelector(".lead-banner")?.textContent).toBe("顶部提示");
    expect(container.querySelector(".mw-dialog__body")?.textContent).toContain("表单正文");
    expect(container.querySelector(".mw-dialog__footer")?.textContent).toContain("保存");
  });

  it("supports visible and header aliases and emits both onOpenChange and onVisibleChange", () => {
    const onOpenChange = vi.fn();
    const onVisibleChange = vi.fn();

    const { container } = render(
      <Dialog
        visible={true}
        header="确认删除"
        appendTo="self"
        onOpenChange={onOpenChange}
        onVisibleChange={onVisibleChange}
      >
        <p>删除后不可恢复</p>
      </Dialog>,
    );

    expect(container.querySelector(".mw-dialog__title")?.textContent).toBe("确认删除");
    fireEvent.click(container.querySelector(".mw-dialog__close")!);
    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(onVisibleChange).toHaveBeenCalledWith(false);
  });

  it("never fires onAfterLeave on close click alone, and waits for exit animation end when CSS animation is present", () => {
    const onOpenChange = vi.fn();
    const onAfterLeave = vi.fn();
    const onHide = vi.fn();

    const styleTag = document.createElement("style");
    styleTag.textContent = `
      .mw-dialog[data-state="open"] { animation-name: mw-dialog-enter; }
      .mw-dialog[data-state="closed"] { animation-name: mw-dialog-fade-out; }
    `;
    document.head.appendChild(styleTag);

    try {
      const { container, rerender } = render(
        <Dialog
          open={true}
          title="未保存拦截"
          appendTo="self"
          onOpenChange={onOpenChange}
          onAfterLeave={onAfterLeave}
          onHide={onHide}
        >
          <p>内容</p>
        </Dialog>,
      );

      // Clicking close button requests close, but open is still true -> onAfterLeave MUST NOT fire
      fireEvent.click(container.querySelector(".mw-dialog__close")!);
      expect(onOpenChange).toHaveBeenCalledWith(false);
      expect(onAfterLeave).not.toHaveBeenCalled();
      expect(onHide).not.toHaveBeenCalled();

      // Parent sets open={false} -> if exit animation suspends unmount, wait for animationend
      rerender(
        <Dialog
          open={false}
          title="未保存拦截"
          appendTo="self"
          onOpenChange={onOpenChange}
          onAfterLeave={onAfterLeave}
          onHide={onHide}
        >
          <p>内容</p>
        </Dialog>,
      );

      const closingDialog = container.querySelector<HTMLElement>('[role="dialog"]');
      if (closingDialog) {
        // Exit animation is still active: onAfterLeave must not have fired yet!
        expect(closingDialog.getAttribute("data-state")).toBe("closed");
        expect(onAfterLeave).not.toHaveBeenCalled();

        act(() => {
          const animEvent = new Event("animationend", { bubbles: true });
          Object.defineProperty(animEvent, "animationName", { value: "mw-dialog-fade-out" });
          closingDialog.dispatchEvent(animEvent);
        });
      }

      expect(onAfterLeave).toHaveBeenCalledTimes(1);
      expect(onHide).toHaveBeenCalledTimes(1);
    } finally {
      styleTag.remove();
    }
  });

  it("closes on Escape by default, blocks mask click by default, and respects closeOnEscape / dismissableMask", () => {
    const onOpenChange1 = vi.fn();
    const { container: c1, unmount: u1 } = render(
      <Dialog open={true} title="默认遮罩策略" appendTo="self" onOpenChange={onOpenChange1}>
        <p>内容</p>
      </Dialog>,
    );

    fireEvent.click(c1.querySelector(".mw-dialog__overlay")!);
    expect(onOpenChange1).not.toHaveBeenCalled();

    fireEvent.keyDown(c1.querySelector('[role="dialog"]')!, { key: "Escape" });
    expect(onOpenChange1).toHaveBeenCalledTimes(1);
    expect(onOpenChange1).toHaveBeenCalledWith(false);
    u1();

    const onOpenChange2 = vi.fn();
    const { container: c2 } = render(
      <Dialog
        open={true}
        title="自定义策略"
        closeOnEscape={false}
        dismissableMask={true}
        appendTo="self"
        onOpenChange={onOpenChange2}
      >
        <p>内容</p>
      </Dialog>,
    );

    fireEvent.keyDown(c2.querySelector('[role="dialog"]')!, { key: "Escape" });
    expect(onOpenChange2).not.toHaveBeenCalled();

    // Pointer down inside content ending on overlay must NOT close
    fireEvent.pointerDown(c2.querySelector('[role="dialog"]')!);
    fireEvent.click(c2.querySelector(".mw-dialog__overlay")!);
    expect(onOpenChange2).not.toHaveBeenCalled();

    // Direct pointer down + click on overlay closes once
    fireEvent.pointerDown(c2.querySelector(".mw-dialog__overlay")!);
    fireEvent.click(c2.querySelector(".mw-dialog__overlay")!);
    expect(onOpenChange2).toHaveBeenCalledTimes(1);
    expect(onOpenChange2).toHaveBeenCalledWith(false);
  });

  it("supports maximizable toggle and keeps sr-only title when showHeader is false", () => {
    const onMaximize = vi.fn();
    const onUnmaximize = vi.fn();
    const { container } = render(
      <Dialog
        open={true}
        title="最大化弹窗"
        maximizable={true}
        appendTo="self"
        onMaximize={onMaximize}
        onUnmaximize={onUnmaximize}
      >
        <p>内容</p>
      </Dialog>,
    );

    const maxBtn = container.querySelector<HTMLElement>(".mw-dialog__maximize")!;
    expect(maxBtn.getAttribute("aria-pressed")).toBe("false");

    fireEvent.click(maxBtn);
    const dialog = container.querySelector<HTMLElement>('[role="dialog"]')!;
    expect(dialog.classList.contains("mw-dialog--maximized")).toBe(true);
    expect(dialog.getAttribute("data-maximized")).toBe("true");
    expect(maxBtn.getAttribute("aria-pressed")).toBe("true");
    expect(onMaximize).toHaveBeenCalledTimes(1);

    fireEvent.click(maxBtn);
    expect(dialog.classList.contains("mw-dialog--maximized")).toBe(false);
    expect(onUnmaximize).toHaveBeenCalledTimes(1);

    const { container: headless } = render(
      <Dialog open={true} showHeader={false} ariaLabel="隐藏头部弹窗" appendTo="self">
        <p>无头内容</p>
      </Dialog>,
    );
    expect(headless.querySelector(".mw-dialog__header")).toBeNull();
    expect(headless.querySelector(".mw-dialog__sr-only")?.textContent).toBe("隐藏头部弹窗");
  });
});
