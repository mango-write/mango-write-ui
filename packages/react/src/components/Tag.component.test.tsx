import { fireEvent, render } from "@testing-library/react";
import { Info } from "lucide-react";
import { describe, expect, it, vi } from "vitest";
import Tag from "./Tag";

describe("Tag", () => {
  it("渲染 value 属性、默认 children 与各语义色及 rounded 类名", () => {
    const { container } = render(
      <Tag value="Beta" severity="success" rounded data-testid="status-tag" />,
    );

    const el = container.querySelector(".mw-tag")!;
    expect(el.textContent).toBe("Beta");
    expect(el.classList.contains("mw-tag--success")).toBe(true);
    expect(el.classList.contains("mw-tag--rounded")).toBe(true);
    expect(el.getAttribute("data-severity")).toBe("success");
    expect(el.getAttribute("data-testid")).toBe("status-tag");

    const warnView = render(<Tag severity="warning">Custom Slot</Tag>);
    const warnEl = warnView.container.querySelector(".mw-tag")!;
    expect(warnEl.classList.contains("mw-tag--warning")).toBe(true);
    expect(warnEl.textContent).toBe("Custom Slot");
  });

  it("支持 Lucide 图标组件、自定义图标组件与 iconSlot，并转发 onClick 事件", () => {
    function CustomIcon({ className }: { className?: string }) {
      return <svg className={`custom-svg-icon ${className ?? ""}`} />;
    }

    const lucideView = render(<Tag value="Info" icon={Info} />);
    expect(lucideView.container.querySelector("svg.mw-tag__icon")).not.toBeNull();

    const compView = render(<Tag value="Comp" icon={CustomIcon} />);
    expect(compView.container.querySelector(".custom-svg-icon")).not.toBeNull();

    const onClick = vi.fn();
    const slotView = render(
      <Tag
        value="Slot"
        iconSlot={<span className="slot-icon">*</span>}
        onClick={onClick}
      />,
    );
    expect(slotView.container.querySelector(".slot-icon")).not.toBeNull();

    fireEvent.click(slotView.container.querySelector(".mw-tag")!);
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
