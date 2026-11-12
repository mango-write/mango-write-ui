import { fireEvent, render } from "@testing-library/react";
import { Check } from "lucide-react";
import { describe, expect, it, vi } from "vitest";
import Message from "./Message";

describe("Message", () => {
  it("默认以 info 语义与 status 角色渲染横幅内容", () => {
    const { container } = render(<Message>系统正在同步您的文献索引</Message>);

    const root = container.querySelector(".mw-message")!;
    expect(root.classList.contains("mw-message--info")).toBe(true);
    expect(root.getAttribute("role")).toBe("status");
    expect(root.getAttribute("data-severity")).toBe("info");
    expect(root.textContent).toContain("系统正在同步您的文献索引");
    expect(container.querySelector(".mw-message__close")).toBeNull();
  });

  it("按 severity 映射无障碍角色，并将 warning 归一为 warn", () => {
    const errorView = render(<Message severity="error">保存失败</Message>);
    const errorEl = errorView.container.querySelector(".mw-message")!;
    expect(errorEl.getAttribute("role")).toBe("alert");
    expect(errorEl.classList.contains("mw-message--error")).toBe(true);

    const warnView = render(<Message severity="warn">请注意配额剩余</Message>);
    const warnEl = warnView.container.querySelector(".mw-message")!;
    expect(warnEl.getAttribute("role")).toBe("alert");
    expect(warnEl.classList.contains("mw-message--warn")).toBe(true);

    const warningView = render(<Message severity="warning">兼容旧 warning 枚举</Message>);
    const warningEl = warningView.container.querySelector(".mw-message")!;
    expect(warningEl.getAttribute("role")).toBe("alert");
    expect(warningEl.classList.contains("mw-message--warn")).toBe(true);
    expect(warningEl.classList.contains("mw-message--warning")).toBe(true);
    expect(warningEl.getAttribute("data-severity")).toBe("warn");

    for (const severity of ["success", "secondary", "contrast"] as const) {
      const view = render(<Message severity={severity}>{severity}</Message>);
      const el = view.container.querySelector(".mw-message")!;
      expect(el.getAttribute("role")).toBe("status");
      expect(el.classList.contains(`mw-message--${severity}`)).toBe(true);
    }
  });

  it("支持 Lucide icon、自定义组件 icon 与 iconSlot", () => {
    const lucideView = render(<Message icon={Check}>完成</Message>);
    expect(lucideView.container.querySelector(".mw-message__icon svg")).not.toBeNull();

    function CustomIcon() {
      return <svg data-testid="custom-svg-icon" />;
    }
    const compView = render(<Message icon={CustomIcon}>自定义图标组件</Message>);
    expect(compView.queryByTestId("custom-svg-icon")).not.toBeNull();

    const slotView = render(
      <Message iconSlot={<span data-testid="slot-icon">!</span>}>插槽图标</Message>,
    );
    expect(slotView.queryByTestId("slot-icon")).not.toBeNull();
  });

  it("closable=true 时提供带国际化标签的关闭按钮并触发 onClose 事件", () => {
    const onClose = vi.fn();
    const { container } = render(
      <Message severity="error" closable onClose={onClose}>
        可关闭错误提示
      </Message>,
    );

    const closeBtn = container.querySelector(".mw-message__close")!;
    expect(closeBtn.getAttribute("aria-label")).toBe("关闭");

    fireEvent.click(closeBtn);
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(container.querySelector(".mw-message")).toBeNull();
  });

  it("透传 id、data-*、aria-* 并合并 className 与 style", () => {
    const { container } = render(
      <Message
        id="sync-banner"
        data-testid="banner-node"
        aria-live="polite"
        className="custom-banner"
        style={{ marginTop: "var(--space-2)" }}
      >
        透传检查
      </Message>,
    );

    const root = container.querySelector("#sync-banner")!;
    expect(root.getAttribute("data-testid")).toBe("banner-node");
    expect(root.getAttribute("aria-live")).toBe("polite");
    expect(root.classList.contains("mw-message")).toBe(true);
    expect(root.classList.contains("custom-banner")).toBe(true);
    expect(root.getAttribute("style")).toContain("margin-top: var(--space-2)");
  });
});
