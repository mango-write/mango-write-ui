import { describe, expect, it, vi } from "vitest";

import { mountUiComponent } from "../test-utils/mount.js";
import ToggleSwitch from "./ToggleSwitch.vue";

describe("ToggleSwitch", () => {
  it("基于 Reka SwitchRoot 渲染并支持受控 modelValue 切换", async () => {
    const onUpdate = vi.fn();
    const onChange = vi.fn();
    const wrapper = mountUiComponent(ToggleSwitch, {
      props: {
        modelValue: false,
        inputId: "dark-mode-switch",
        "onUpdate:modelValue": onUpdate,
        onChange,
      },
    });

    const sw = wrapper.get('[role="switch"]');
    expect(sw.attributes("id")).toBe("dark-mode-switch");
    expect(sw.attributes("aria-checked")).toBe("false");
    expect(sw.attributes("data-state")).toBe("unchecked");

    await sw.trigger("click");
    expect(onUpdate).toHaveBeenCalledWith(true);
    expect(onChange).toHaveBeenCalledWith(true);

    await wrapper.setProps({ modelValue: true });
    expect(sw.attributes("aria-checked")).toBe("true");
    expect(sw.attributes("data-state")).toBe("checked");
  });

  it("disabled 与 readonly 状态下不改变开关状态并输出无障碍属性", async () => {
    const onUpdate = vi.fn();
    const wrapper = mountUiComponent(ToggleSwitch, {
      props: {
        modelValue: false,
        disabled: true,
        invalid: true,
        "onUpdate:modelValue": onUpdate,
      },
    });

    const sw = wrapper.get('[role="switch"]');
    expect(sw.attributes("aria-invalid")).toBe("true");
    expect(sw.attributes("data-invalid")).toBe("");
    expect(sw.attributes("data-disabled")).toBe("");

    await sw.trigger("click");
    expect(onUpdate).not.toHaveBeenCalled();

    await wrapper.setProps({ disabled: false, readonly: true });
    await sw.trigger("click");
    expect(onUpdate).not.toHaveBeenCalled();
    expect(sw.attributes("data-state")).toBe("unchecked");
  });
});
