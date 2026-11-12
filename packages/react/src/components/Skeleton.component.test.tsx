import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Skeleton from "./Skeleton";

describe("Skeleton", () => {
  it("renders default rectangle wave skeleton with aria-hidden", () => {
    const { container } = render(<Skeleton />);
    const el = container.querySelector(".mw-skeleton")!;
    expect(el).not.toBeNull();
    expect(el.getAttribute("aria-hidden")).toBe("true");
    expect(el.classList.contains("mw-skeleton--circle")).toBe(false);
    expect(el.classList.contains("mw-skeleton--none")).toBe(false);
    expect(el.getAttribute("style")).toContain("width: 100%");
    expect(el.getAttribute("style")).toContain("height: 1rem");
  });

  it("applies circle shape, size override, borderRadius, and none animation", () => {
    const { container } = render(
      <Skeleton
        shape="circle"
        size="3rem"
        borderRadius="var(--radius-full)"
        animation="none"
      />,
    );

    const el = container.querySelector(".mw-skeleton")!;
    expect(el.classList.contains("mw-skeleton--circle")).toBe(true);
    expect(el.classList.contains("mw-skeleton--none")).toBe(true);
    expect(el.getAttribute("style")).toContain("width: 3rem");
    expect(el.getAttribute("style")).toContain("height: 3rem");
    expect(el.getAttribute("style")).toContain("border-radius: var(--radius-full)");
  });
});
