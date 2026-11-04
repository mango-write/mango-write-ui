import { describe, expect, it } from "vitest";
import { h } from "vue";
import { mountUiComponent } from "../test-utils/mount.js";
import ProgressBar from "./ProgressBar.vue";

describe("ProgressBar", () => {
  it("determinate 模式下输出 progressbar ARIA 属性、钳制进度值并渲染文本或插槽", async () => {
    const wrapper = mountUiComponent(ProgressBar, {
      props: {
        value: 65,
        "aria-label": "上传进度",
      },
    });

    const root = wrapper.get('[role="progressbar"]');
    expect(root.classes()).toContain("mw-progress-bar");
    expect(root.classes()).toContain("mw-progress-bar--determinate");
    expect(root.attributes("aria-valuemin")).toBe("0");
    expect(root.attributes("aria-valuemax")).toBe("100");
    expect(root.attributes("aria-valuenow")).toBe("65");
    expect(wrapper.get(".mw-progress-bar__indicator").attributes("style")).toContain("width: 65%");
    expect(wrapper.get(".mw-progress-bar__label").text()).toBe("65%");

    // 边界钳制与 showValue=false
    await wrapper.setProps({ value: 140, showValue: false });
    expect(root.attributes("aria-valuenow")).toBe("100");
    expect(wrapper.get(".mw-progress-bar__indicator").attributes("style")).toContain("width: 100%");
    expect(wrapper.find(".mw-progress-bar__label").exists()).toBe(false);

    // 自定义插槽
    const slotWrapper = mountUiComponent(ProgressBar, {
      props: { value: 30 },
      slots: {
        default: ({ value }: { value: number }) => h("span", { class: "custom-progress" }, `${value}/100`),
      },
    });
    expect(slotWrapper.get(".custom-progress").text()).toBe("30/100");
  });

  it("indeterminate 模式下不暴露固定 aria-valuenow 并标记 indeterminate 状态", () => {
    const wrapper = mountUiComponent(ProgressBar, {
      props: {
        mode: "indeterminate",
      },
    });

    const root = wrapper.get('[role="progressbar"]');
    expect(root.classes()).toContain("mw-progress-bar--indeterminate");
    expect(root.attributes("data-state")).toBe("indeterminate");
    expect(root.attributes("aria-valuenow")).toBeUndefined();
    expect(wrapper.find(".mw-progress-bar__label").exists()).toBe(false);
  });
});
