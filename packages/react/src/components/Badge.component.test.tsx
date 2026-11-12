import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Badge from "./Badge";

describe("Badge", () => {
  it("渲染 value、children 与语义色/尺寸类名", () => {
    const { container } = render(
      <Badge value={42} severity="danger" size="lg" aria-label="42 条未读" />,
    );

    const badge = container.querySelector(".mw-badge")!;
    expect(badge.textContent).toBe("42");
    expect(badge.classList.contains("mw-badge--danger")).toBe(true);
    expect(badge.classList.contains("mw-badge--lg")).toBe(true);
    expect(badge.classList.contains("mw-size-lg")).toBe(true);
    expect(badge.getAttribute("data-severity")).toBe("danger");
    expect(badge.getAttribute("data-size")).toBe("lg");
    expect(badge.getAttribute("aria-label")).toBe("42 条未读");

    const slotView = render(
      <Badge severity="warn" size="small">
        NEW
      </Badge>,
    );
    const slotBadge = slotView.container.querySelector(".mw-badge")!;
    expect(slotBadge.textContent).toBe("NEW");
    expect(slotBadge.classList.contains("mw-badge--warn")).toBe(true);
    expect(slotBadge.classList.contains("mw-badge--sm")).toBe(true);
    expect(slotBadge.classList.contains("mw-badge--small")).toBe(true);
    expect(slotBadge.classList.contains("mw-size-sm")).toBe(true);
  });

  it("无内容时呈现圆点态 .mw-badge--dot，数值 0 正常渲染", () => {
    const dotView = render(<Badge />);
    const dot = dotView.container.querySelector(".mw-badge")!;
    expect(dot.classList.contains("mw-badge--dot")).toBe(true);
    expect(dot.classList.contains("mw-badge--primary")).toBe(true);

    const zeroView = render(<Badge value={0} />);
    const zero = zeroView.container.querySelector(".mw-badge")!;
    expect(zero.classList.contains("mw-badge--dot")).toBe(false);
    expect(zero.textContent).toBe("0");
  });
});
