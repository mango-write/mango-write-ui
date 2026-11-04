import { describe, expect, it } from "vitest";
import { mountUiComponent } from "../test-utils/mount.js";
import Skeleton from "./Skeleton.vue";

describe("Skeleton", () => {
  it("renders default rectangle wave skeleton with aria-hidden", () => {
    const wrapper = mountUiComponent(Skeleton);
    const el = wrapper.find(".mw-skeleton.p-skeleton");
    expect(el.exists()).toBe(true);
    expect(el.attributes("aria-hidden")).toBe("true");
    expect(el.classes()).not.toContain("mw-skeleton--circle");
    expect(el.classes()).not.toContain("mw-skeleton--none");
    expect(el.attributes("style")).toContain("width: 100%");
    expect(el.attributes("style")).toContain("height: 1rem");
  });

  it("applies circle shape, size override, borderRadius, and none animation", () => {
    const wrapper = mountUiComponent(Skeleton, {
      props: {
        shape: "circle",
        size: "3rem",
        borderRadius: "var(--radius-full)",
        animation: "none",
      },
    });

    const el = wrapper.find(".mw-skeleton");
    expect(el.classes()).toContain("mw-skeleton--circle");
    expect(el.classes()).toContain("p-skeleton-circle");
    expect(el.classes()).toContain("mw-skeleton--none");
    expect(el.classes()).toContain("p-skeleton-animation-none");
    expect(el.attributes("style")).toContain("width: 3rem");
    expect(el.attributes("style")).toContain("height: 3rem");
    expect(el.attributes("style")).toContain("border-radius: var(--radius-full)");
  });
});
