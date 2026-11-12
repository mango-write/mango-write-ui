import { fireEvent, render, screen } from "@testing-library/react";
import { Plus } from "lucide-react";
import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";
import Button from "./Button";

function DummyIcon() {
  return <svg className="dummy-svg-icon" />;
}

describe("Button", () => {
  it("默认渲染为 type=button 的原生按钮并支持 label、ref 与点击事件", () => {
    const onClick = vi.fn();
    const ref = createRef<HTMLElement>();
    render(<Button ref={ref} label="保存修改" onClick={onClick} />);

    const btn = screen.getByRole("button", { name: "保存修改" });
    expect(ref.current).toBe(btn);
    expect(btn.getAttribute("type")).toBe("button");
    expect(btn.classList.contains("mw-btn")).toBe(true);
    expect(btn.textContent).toBe("保存修改");

    fireEvent.click(btn);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("disabled 与 loading 状态下禁止触发点击并暴露无障碍与状态属性", () => {
    const onClick = vi.fn();
    const { rerender, container } = render(
      <Button label="提交" disabled onClick={onClick} />,
    );

    const btn = screen.getByRole("button", { name: "提交" });
    expect(btn).toHaveProperty("disabled", true);
    expect(btn.getAttribute("aria-disabled")).toBe("true");
    expect(btn.getAttribute("data-disabled")).toBe("");

    fireEvent.click(btn);
    expect(onClick).not.toHaveBeenCalled();

    rerender(<Button label="提交" loading onClick={onClick} />);
    expect(btn).toHaveProperty("disabled", true);
    expect(btn.getAttribute("aria-disabled")).toBe("true");
    expect(btn.getAttribute("aria-busy")).toBe("true");
    expect(btn.getAttribute("data-disabled")).toBe("");
    expect(btn.getAttribute("data-loading")).toBe("");
    expect(container.querySelector(".mw-btn__spinner")).not.toBeNull();

    fireEvent.click(btn);
    expect(onClick).not.toHaveBeenCalled();
  });

  it("纯图标按钮自动挂载 .mw-btn--icon-only，兼容组件与 ReactNode，有文案或 children 时不挂载", () => {
    const { container: c1 } = render(<Button icon={Plus} aria-label="新建" />);
    const iconBtn = c1.querySelector("button")!;
    expect(iconBtn.classList.contains("mw-btn--icon-only")).toBe(true);
    expect(iconBtn.getAttribute("aria-label")).toBe("新建");
    expect(c1.querySelector("svg.mw-btn__icon")).not.toBeNull();

    const { container: c2 } = render(<Button icon={DummyIcon} label="新建文档" />);
    const withLabel = c2.querySelector("button")!;
    expect(withLabel.classList.contains("mw-btn--icon-only")).toBe(false);
    expect(c2.querySelector(".dummy-svg-icon")).not.toBeNull();

    const { container: c3 } = render(
      <Button icon={<Plus data-testid="jsx-icon" />} iconPos="right">
        插槽文本
      </Button>,
    );
    const withChildren = c3.querySelector("button")!;
    expect(withChildren.classList.contains("mw-btn--icon-only")).toBe(false);
    expect(withChildren.classList.contains("mw-btn--icon-right")).toBe(true);
    expect(withChildren.textContent).toContain("插槽文本");
    expect(c3.querySelector('[data-testid="jsx-icon"]')?.classList.contains("mw-btn__icon")).toBe(
      true,
    );
  });

  it("支持 href 或 as 渲染为链接并映射 variant / severity / size / badge", () => {
    const onClick = vi.fn();
    const { rerender, container } = render(
      <Button
        href="https://example.com"
        target="_blank"
        rel="noopener"
        label="查看文档"
        severity="warn"
        outlined
        size="small"
        badge={3}
        onClick={onClick}
      />,
    );

    const link = container.querySelector("a")!;
    expect(link.getAttribute("href")).toBe("https://example.com");
    expect(link.getAttribute("target")).toBe("_blank");
    expect(link.getAttribute("type")).toBeNull();
    expect(link.getAttribute("data-variant")).toBe("outlined");
    expect(link.getAttribute("data-severity")).toBe("warning");
    expect(link.getAttribute("data-size")).toBe("sm");
    expect(container.querySelector(".mw-btn__badge")?.textContent).toBe("3");

    rerender(
      <Button
        href="https://example.com"
        label="查看文档"
        disabled
        onClick={onClick}
      />,
    );
    fireEvent.click(link);
    expect(onClick).not.toHaveBeenCalled();
  });
});
