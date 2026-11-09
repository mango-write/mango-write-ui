import { describe, expect, it } from "vitest";
import { mountUiComponent } from "../test-utils/mount.js";
import ProgressSpinner from "./ProgressSpinner.vue";

describe("ProgressSpinner", () => {
  it("renders default progressbar SVG and circle attributes", () => {
    const wrapper = mountUiComponent(ProgressSpinner, {
      props: { ariaLabel: "Loading content" },
    });

    const root = wrapper.find(".mw-progress-spinner");
    expect(root.exists()).toBe(true);
    expect(root.attributes("role")).toBe("progressbar");
    expect(root.attributes("aria-label")).toBe("Loading content");

    const svg = wrapper.find(".mw-progress-spinner__svg");
    expect(svg.exists()).toBe(true);
    expect(svg.attributes("viewBox")).toBe("25 25 50 50");
    expect(svg.attributes("style")).toContain("animation-duration: 2s");

    const circle = wrapper.find(".mw-progress-spinner__circle");
    expect(circle.exists()).toBe(true);
    expect(circle.attributes("fill")).toBe("none");
    expect(circle.attributes("stroke-width")).toBe("4");
  });

  it("supports custom strokeWidth, fill, and animationDuration", () => {
    const wrapper = mountUiComponent(ProgressSpinner, {
      props: {
        strokeWidth: 6,
        fill: "transparent",
        animationDuration: "1.2s",
      },
    });

    const svg = wrapper.find(".mw-progress-spinner__svg");
    expect(svg.attributes("style")).toContain("animation-duration: 1.2s");

    const circle = wrapper.find(".mw-progress-spinner__circle");
    expect(circle.attributes("stroke-width")).toBe("6");
    expect(circle.attributes("fill")).toBe("transparent");
  });
});
