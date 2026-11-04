import { describe, expect, it, vi } from "vitest";

import { mountUiComponent } from "../test-utils/mount.js";
import Checkbox from "./Checkbox.vue";

describe("Checkbox", () => {
  it("支持二值布尔模式（binary）与自定义 trueValue/falseValue 及空格键切换", async () => {
    const onUpdate = vi.fn();
    const onChange = vi.fn();
    const wrapper = mountUiComponent(Checkbox, {
      props: {
        modelValue: "no",
        binary: true,
        trueValue: "yes",
        falseValue: "no",
        inputId: "agree-terms",
        "onUpdate:modelValue": onUpdate,
        onChange,
      },
    });

    const box = wrapper.get('[role="checkbox"]');
    expect(box.attributes("id")).toBe("agree-terms");
    expect(box.attributes("aria-checked")).toBe("false");
    expect(box.attributes("data-state")).toBe("unchecked");

    await box.trigger("click");
    expect(onUpdate).toHaveBeenCalledWith("yes");
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ value: "yes" }),
    );

    await wrapper.setProps({ modelValue: "yes" });
    expect(box.attributes("aria-checked")).toBe("true");
    expect(box.attributes("data-state")).toBe("checked");

    await box.trigger("keydown", { key: " " });
    expect(onUpdate).toHaveBeenLastCalledWith("no");
  });

  it("支持数组多选组模式（Array.isArray(modelValue)）增删条目", async () => {
    const onUpdate = vi.fn();
    const wrapper = mountUiComponent(Checkbox, {
      props: {
        modelValue: ["a"],
        value: "b",
        "onUpdate:modelValue": onUpdate,
      },
    });

    const box = wrapper.get('[role="checkbox"]');
    expect(box.attributes("aria-checked")).toBe("false");

    await box.trigger("click");
    expect(onUpdate).toHaveBeenLastCalledWith(["a", "b"]);

    await wrapper.setProps({ modelValue: ["a", "b"] });
    expect(box.attributes("aria-checked")).toBe("true");

    await box.trigger("click");
    expect(onUpdate).toHaveBeenLastCalledWith(["a"]);
  });

  it("支持 indeterminate 半选态与 disabled / readonly / invalid 拦截", async () => {
    const onUpdate = vi.fn();
    const wrapper = mountUiComponent(Checkbox, {
      props: {
        modelValue: false,
        indeterminate: true,
        invalid: true,
        disabled: true,
        "onUpdate:modelValue": onUpdate,
      },
    });

    const box = wrapper.get('[role="checkbox"]');
    expect(box.attributes("aria-checked")).toBe("mixed");
    expect(box.attributes("data-state")).toBe("indeterminate");
    expect(box.attributes("aria-invalid")).toBe("true");
    expect(box.attributes("data-invalid")).toBe("");
    expect(box.attributes("data-disabled")).toBe("");

    await box.trigger("click");
    expect(onUpdate).not.toHaveBeenCalled();

    await wrapper.setProps({ disabled: false, readonly: true });
    await box.trigger("click");
    expect(onUpdate).not.toHaveBeenCalled();
  });
});
