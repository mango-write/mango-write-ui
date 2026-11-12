import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import ProgressBar from "./ProgressBar";

describe("ProgressBar", () => {
  it("determinate 模式下输出 progressbar ARIA 属性、钳制进度值并渲染文本或 children", () => {
    const { container, rerender } = render(
      <ProgressBar value={65} aria-label="上传进度" />,
    );

    const root = container.querySelector('[role="progressbar"]')!;
    expect(root.classList.contains("mw-progress-bar")).toBe(true);
    expect(root.classList.contains("mw-progress-bar--determinate")).toBe(true);
    expect(root.getAttribute("aria-valuemin")).toBe("0");
    expect(root.getAttribute("aria-valuemax")).toBe("100");
    expect(root.getAttribute("aria-valuenow")).toBe("65");
    expect(
      container.querySelector(".mw-progress-bar__indicator")?.getAttribute("style"),
    ).toContain("width: 65%");
    expect(container.querySelector(".mw-progress-bar__label")?.textContent).toBe("65%");

    rerender(<ProgressBar value={140} showValue={false} aria-label="上传进度" />);
    expect(root.getAttribute("aria-valuenow")).toBe("100");
    expect(
      container.querySelector(".mw-progress-bar__indicator")?.getAttribute("style"),
    ).toContain("width: 100%");
    expect(container.querySelector(".mw-progress-bar__label")).toBeNull();

    const slotView = render(
      <ProgressBar value={30}>
        {({ value }) => <span className="custom-progress">{`${value}/100`}</span>}
      </ProgressBar>,
    );
    expect(slotView.container.querySelector(".custom-progress")?.textContent).toBe(
      "30/100",
    );
  });

  it("indeterminate 模式下不暴露固定 aria-valuenow 并标记 indeterminate 状态", () => {
    const { container } = render(<ProgressBar mode="indeterminate" />);

    const root = container.querySelector('[role="progressbar"]')!;
    expect(root.classList.contains("mw-progress-bar--indeterminate")).toBe(true);
    expect(root.getAttribute("data-state")).toBe("indeterminate");
    expect(root.getAttribute("aria-valuenow")).toBeNull();
    expect(container.querySelector(".mw-progress-bar__label")).toBeNull();
  });
});
