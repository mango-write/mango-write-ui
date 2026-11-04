import { describe, expect, it } from "vitest";
import { mountUiComponent } from "../test-utils/mount.js";
import Badge from "./Badge.vue";

describe("Badge", () => {
  it("渲染 value、默认插槽与语义色/尺寸类名", () => {
    const wrapper = mountUiComponent(Badge, {
      props: {
        value: 42,
        severity: "danger",
        size: "lg",
        "aria-label": "42 条未读",
      },
    });

    const badge = wrapper.get(".mw-badge");
    expect(badge.text()).toBe("42");
    expect(badge.classes()).toContain("mw-badge--danger");
    expect(badge.classes()).toContain("mw-badge--lg");
    expect(badge.attributes("aria-label")).toBe("42 条未读");

    const slotWrapper = mountUiComponent(Badge, {
      props: { severity: "warn", size: "small" },
      slots: { default: () => "NEW" },
    });
    expect(slotWrapper.get(".mw-badge").text()).toBe("NEW");
    expect(slotWrapper.get(".mw-badge").classes()).toContain("mw-badge--warn");
    expect(slotWrapper.get(".mw-badge").classes()).toContain("mw-badge--sm");
    expect(slotWrapper.get(".mw-badge").classes()).toContain("mw-badge--small");
  });

  it("无内容时呈现圆点态 .mw-badge--dot", () => {
    const wrapper = mountUiComponent(Badge);
    expect(wrapper.get(".mw-badge").classes()).toContain("mw-badge--dot");
    expect(wrapper.get(".mw-badge").classes()).toContain("mw-badge--primary");
  });
});
