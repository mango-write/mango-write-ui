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
      expect.arrayContaining(["mw-slider"]),
    );
    const input = wrapper.get('input[type="range"]');
    expect(input.attributes("aria-label")).toBe("不透明度");
    expect(input.attributes("step")).toBe("5");
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

  it("缺省 step 时为连续模式：原生 input 用 step=any 且拖动值不经吸附", async () => {
    const onUpdate = vi.fn();
    const wrapper = mountUiComponent(Slider, {
      props: {
        modelValue: 30,
        min: 0,
        max: 100,
        "onUpdate:modelValue": onUpdate,
      },
    });

    const input = wrapper.get('input[type="range"]');
    expect(input.attributes("step")).toBe("any");

    await input.setValue("33.7");
    expect(onUpdate).toHaveBeenLastCalledWith(33.7);
  });

  it("showTicks 渲染每个 step 刻度节点，无有效 step 时忽略", async () => {
    const wrapper = mountUiComponent(Slider, {
      props: {
        modelValue: 50,
        min: 0,
        max: 100,
        step: 25,
        showTicks: true,
      },
    });

    const ticks = wrapper.findAll(".mw-slider__tick");
    expect(ticks).toHaveLength(5);
    expect(ticks[0]!.attributes("style")).toContain("left: 0%");
    expect(ticks[1]!.attributes("style")).toContain("left: 25%");
    expect(ticks[4]!.attributes("style")).toContain("left: 100%");
    expect(wrapper.find(".mw-slider__ticks").attributes("aria-hidden")).toBe("true");

    // max 不在刻度网格上时补端点：0,30,60,90 + 100
    const offGrid = mountUiComponent(Slider, {
      props: { modelValue: 50, min: 0, max: 100, step: 30, showTicks: true },
    });
    expect(offGrid.findAll(".mw-slider__tick")).toHaveLength(5);

    const withoutStep = mountUiComponent(Slider, {
      props: { modelValue: 50, min: 0, max: 100, showTicks: true },
    });
    expect(withoutStep.find(".mw-slider__ticks").exists()).toBe(false);
  });

  it("showTicks 在 range 区间与 vertical 纵向模式下同样生效", async () => {
    const wrapper = mountUiComponent(Slider, {
      props: {
        modelValue: [20, 80],
        min: 0,
        max: 100,
        step: 50,
        range: true,
        orientation: "vertical",
        showTicks: true,
      },
    });

    const ticks = wrapper.findAll(".mw-slider__tick");
    expect(ticks).toHaveLength(3);
    expect(ticks[0]!.attributes("style")).toContain("bottom: 0%");
    expect(ticks[1]!.attributes("style")).toContain("bottom: 50%");
    expect(ticks[2]!.attributes("style")).toContain("bottom: 100%");
  });

  it("指针拖动：水平按横轴跟手，松开发 slideend", async () => {
    const onUpdate = vi.fn();
    const onSlideend = vi.fn();
    const wrapper = mountUiComponent(Slider, {
      props: {
        modelValue: 0,
        min: 0,
        max: 100,
        "onUpdate:modelValue": onUpdate,
        onSlideend,
      },
    });
    Object.defineProperty(wrapper.element, "getBoundingClientRect", {
      value: () =>
        ({ left: 0, right: 200, top: 0, bottom: 100, width: 200, height: 100 }),
    });

    await wrapper.trigger("pointerdown", { clientX: 50, clientY: 50, pointerId: 1, pointerType: "mouse", button: 0 });
    expect(onUpdate).toHaveBeenLastCalledWith(25);

    await wrapper.trigger("pointermove", { clientX: 100, clientY: 50, pointerId: 1 });
    expect(onUpdate).toHaveBeenLastCalledWith(50);

    await wrapper.trigger("pointerup", { clientX: 100, clientY: 50, pointerId: 1 });
    expect(onSlideend).toHaveBeenLastCalledWith(
      expect.objectContaining({ value: 50 }),
    );
  });

  it("指针拖动：vertical 按纵轴取值（上大下小）", async () => {
    const onUpdate = vi.fn();
    const wrapper = mountUiComponent(Slider, {
      props: {
        modelValue: 50,
        min: 0,
        max: 100,
        orientation: "vertical",
        "onUpdate:modelValue": onUpdate,
      },
    });
    Object.defineProperty(wrapper.element, "getBoundingClientRect", {
      value: () =>
        ({ left: 0, right: 18, top: 0, bottom: 100, width: 18, height: 100 }),
    });

    await wrapper.trigger("pointerdown", { clientX: 9, clientY: 25, pointerId: 1, pointerType: "mouse", button: 0 });
    expect(onUpdate).toHaveBeenLastCalledWith(75);

    await wrapper.trigger("pointermove", { clientX: 9, clientY: 90, pointerId: 1 });
    expect(onUpdate).toHaveBeenLastCalledWith(10);
  });

  it("指针拖动：range 模式就近选手柄", async () => {
    const onUpdate = vi.fn();
    const wrapper = mountUiComponent(Slider, {
      props: {
        modelValue: [20, 80],
        min: 0,
        max: 100,
        range: true,
        "onUpdate:modelValue": onUpdate,
      },
    });
    Object.defineProperty(wrapper.element, "getBoundingClientRect", {
      value: () =>
        ({ left: 0, right: 200, top: 0, bottom: 100, width: 200, height: 100 }),
    });

    // 点击位置 10 更靠近 start(20)，移动 start 手柄
    await wrapper.trigger("pointerdown", { clientX: 20, clientY: 50, pointerId: 1, pointerType: "mouse", button: 0 });
    expect(onUpdate).toHaveBeenLastCalledWith([10, 80]);

    // 拖到 95 越过 end 时被夹在 end 之前
    await wrapper.trigger("pointermove", { clientX: 190, clientY: 50, pointerId: 1 });
    expect(onUpdate).toHaveBeenLastCalledWith([80, 80]);
  });
});
