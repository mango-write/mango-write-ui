import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import AppLogo from "./AppLogo";

describe("AppLogo", () => {
  it("默认渲染横版字标与图形 mark，具备 role=img 与 aria-label", () => {
    const { container } = render(<AppLogo className="custom-logo" />);

    const svg = container.querySelector("svg.mw-logo")!;
    expect(svg).not.toBeNull();
    expect(svg.classList.contains("custom-logo")).toBe(true);
    expect(svg.getAttribute("role")).toBe("img");
    expect(svg.getAttribute("aria-label")).toBe("MangoWrite");
    expect(svg.getAttribute("viewBox")).toBe("0 0 367.42 90.43");
    expect(svg.querySelector("g.word")).not.toBeNull();
    expect(svg.querySelectorAll("g.word path")).toHaveLength(18);
    expect(svg.querySelector("g.mark")).not.toBeNull();
    expect(svg.querySelectorAll("g.mark path.hi")).toHaveLength(3);
  });

  it("markOnly=true 时切换紧凑视窗并省略 word 分组", () => {
    const { container } = render(<AppLogo markOnly />);

    const svg = container.querySelector("svg.mw-logo")!;
    expect(svg.getAttribute("viewBox")).toBe("0 0 119.8 90.43");
    expect(svg.querySelector("g.word")).toBeNull();
    expect(svg.querySelector("g.mark")).not.toBeNull();
  });
});
