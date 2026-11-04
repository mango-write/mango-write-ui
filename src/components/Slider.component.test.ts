import { describe, expect, it, vi } from "vitest";

import { mountUiComponent } from "../test-utils/mount.js";
import Slider from "./Slider.vue";

describe("Slider", () => {
  it("支持单值滑块受控读写、键盘步进以及 change / slideend 事件", async () => {
    const onUpdate = vi.fn();
    const onChange = vi.fn();
    const onSlideend = vi.fn();

    const wrapper = mountUiComponent(Slider, {
      props: {
        modelValue: 30,
        min: 0,
        max: 100,
        step: 5,
        ariaLabel: "不透明度",
        "onUpdate:modelValue": onUpdate,
        onChange,
        onSlideend,
      },
    });

    expect(wrapper.classes()).toEqual(
      expect.arrayContaining(["mw-slider", "p-slider"]),
    );
    const input = wrapper.get('input[type="range"]');
    expect(input.attributes("aria-label")).toBe("不透明度");
    expect(input.attributes("aria-valuemin")).toBe("0");
    expect(input.attributes("aria-valuemax")).toBe("100");
    expect(input.attributes("aria-valuenow")).toBe("30");

    await input.setValue("65");
    expect(onUpdate).toHaveBeenLastCalledWith(65);
    expect(onChange).toHaveBeenLastCalledWith(65);
    expect(onSlideend).toHaveBeenLastCalledWith(
      expect.objectContaining({ value: 65 }),
    );

    await wrapper.setProps({ modelValue: 65 });
    await input.trigger("keydown", { key: "ArrowRight" });
    expect(onUpdate).toHaveBeenLastCalledWith(70);

    await wrapper.setProps({ modelValue: 70 });
    await input.trigger("keydown", { key: "ArrowLeft" });
    expect(onUpdate).toHaveBeenLastCalledWith(65);

    await input.trigger("keydown", { key: "Home" });
    expect(onUpdate).toHaveBeenLastCalledWith(0);

    await input.trigger("keydown", { key: "End" });
    expect(onUpdate).toHaveBeenLastCalledWith(100);
  });

  it("支持 range 双滑块区间模式、vertical 纵向模式与 disabled 禁用拦截", async () => {
    const onUpdate = vi.fn();
    const wrapper = mountUiComponent(Slider, {
      props: {
        modelValue: [20, 80],
        min: 0,
        max: 100,
        range: true,
        orientation: "vertical",
        "onUpdate:modelValue": onUpdate,
      },
    });

    expect(wrapper.classes()).toContain("mw-slider--vertical");
    const inputs = wrapper.findAll('input[type="range"]');
    expect(inputs).toHaveLength(2);

    await inputs[0]!.setValue("35");
    expect(onUpdate).toHaveBeenLastCalledWith([35, 80]);

    await wrapper.setProps({ modelValue: [35, 80] });
    await inputs[1]!.setValue("90");
    expect(onUpdate).toHaveBeenLastCalledWith([35, 90]);

    await wrapper.setProps({ disabled: true });
    expect(wrapper.attributes("data-disabled")).toBe("");
    await inputs[0]!.trigger("keydown", { key: "ArrowRight" });
    expect(onUpdate).toHaveBeenCalledTimes(2);
  });
});
