import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import ProgressSpinner from "./ProgressSpinner";

describe("ProgressSpinner", () => {
  it("renders default progressbar SVG and circle attributes", () => {
    const { container } = render(<ProgressSpinner ariaLabel="Loading content" />);

    const root = container.querySelector(".mw-progress-spinner")!;
    expect(root).not.toBeNull();
    expect(root.getAttribute("role")).toBe("progressbar");
    expect(root.getAttribute("aria-label")).toBe("Loading content");

    const svg = container.querySelector(".mw-progress-spinner__svg")!;
    expect(svg).not.toBeNull();
    expect(svg.getAttribute("viewBox")).toBe("25 25 50 50");
    expect(svg.getAttribute("style")).toContain("animation-duration: 2s");

    const circle = container.querySelector(".mw-progress-spinner__circle")!;
    expect(circle).not.toBeNull();
    expect(circle.getAttribute("fill")).toBe("none");
    expect(circle.getAttribute("stroke-width")).toBe("4");
  });

  it("supports custom strokeWidth, fill, and animationDuration", () => {
    const { container } = render(
      <ProgressSpinner
        strokeWidth={6}
        fill="transparent"
        animationDuration="1.2s"
      />,
    );

    const svg = container.querySelector(".mw-progress-spinner__svg")!;
    expect(svg.getAttribute("style")).toContain("animation-duration: 1.2s");

    const circle = container.querySelector(".mw-progress-spinner__circle")!;
    expect(circle.getAttribute("stroke-width")).toBe("6");
    expect(circle.getAttribute("fill")).toBe("transparent");
  });
});
