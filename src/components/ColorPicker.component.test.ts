import { describe, expect, it, vi } from "vitest";

import { mountUiComponent } from "../test-utils/mount.js";
import ColorPicker from "./ColorPicker.vue";

describe("ColorPicker", () => {
  it("支持无 # 与带 # 的 hex 格式双向绑定，保持输入前缀约定", async () => {
    const onUpdate = vi.fn();
    const onChange = vi.fn();

    const wrapper = mountUiComponent(ColorPicker, {
      props: {
        modelValue: "ff0000",
        inputId: "watermark-color",
        ariaLabel: "水印颜色",
        "onUpdate:modelValue": onUpdate,
        onChange,
      },
    });

    expect(wrapper.classes()).toEqual(
      expect.arrayContaining(["mw-color-picker"]),
    );

    const input = wrapper.get("input#watermark-color");
    expect(input.attributes("type")).toBe("color");
    expect(input.classes()).toEqual(
      expect.arrayContaining(["mw-color-picker__input"]),
    );
    expect((input.element as HTMLInputElement).value).toBe("#ff0000");

    // 初始值不带 # 时，回填的 hex 值也不带 #
    await input.setValue("#00ff88");
    expect(onUpdate).toHaveBeenCalledTimes(1);
    expect(onUpdate).toHaveBeenLastCalledWith("00ff88");
    expect(onChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ value: "00ff88" }),
    );

    // 初始值带 # 时，保留前导 #
    await wrapper.setProps({ modelValue: "#336699" });
    expect((input.element as HTMLInputElement).value).toBe("#336699");

    await input.setValue("#112233");
    expect(onUpdate).toHaveBeenLastCalledWith("#112233");
  });

  it("支持 rgb / hsb 输出格式与 disabled / readonly / inline 状态", async () => {
    const onUpdate = vi.fn();
    const wrapper = mountUiComponent(ColorPicker, {
      props: {
        modelValue: "ff0000",
        format: "rgb",
        inline: true,
        "onUpdate:modelValue": onUpdate,
      },
    });

    expect(wrapper.classes()).toContain("mw-color-picker--inline");
    const input = wrapper.get('input[type="color"]');
    await input.setValue("#00ff00");
    expect(onUpdate).toHaveBeenLastCalledWith("rgb(0, 255, 0)");

    await wrapper.setProps({ format: "hsb" });
    await input.setValue("#ff0000");
    expect(onUpdate).toHaveBeenLastCalledWith("hsb(0, 100%, 100%)");

    await wrapper.setProps({ disabled: true });
    expect(wrapper.attributes("data-disabled")).toBe("");
    await input.trigger("input");
    expect(onUpdate).toHaveBeenCalledTimes(2);
  });
});
