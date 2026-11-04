import { h } from "vue";
import { describe, expect, it, vi } from "vitest";

import { mountUiComponent } from "../test-utils/mount.js";
import FormField from "./FormField.vue";
import InputNumber from "./InputNumber.vue";

describe("InputNumber", () => {
  it("支持受控数值读写、小数输入与清空归 null（绝不产出 0 或 NaN）", async () => {
    const onUpdate = vi.fn();
    const onInput = vi.fn();
    const onBlur = vi.fn();

    const wrapper = mountUiComponent(InputNumber, {
      props: {
        modelValue: 10,
        inputId: "price-input",
        useGrouping: false,
        maxFractionDigits: 2,
        "onUpdate:modelValue": onUpdate,
        onInput,
        onBlur,
      },
    });

    expect(wrapper.classes()).toEqual(
      expect.arrayContaining(["mw-input-number", "p-inputnumber"]),
    );
    const input = wrapper.get("input#price-input");
    expect(input.classes()).toEqual(
      expect.arrayContaining([
        "mw-input-number__input",
        "mw-control",
        "mw-input",
        "p-inputtext",
        "p-inputnumber-input",
      ]),
    );
    expect((input.element as HTMLInputElement).value).toBe("10");

    await input.setValue("2.75");
    expect(onUpdate).toHaveBeenLastCalledWith(2.75);
    expect(onInput).toHaveBeenLastCalledWith(
      expect.objectContaining({ value: 2.75, formattedValue: "2.75" }),
    );

    await wrapper.setProps({ modelValue: 2.75 });
    await input.setValue("");
    await input.trigger("blur");
    expect(onBlur).toHaveBeenCalledTimes(1);
    const afterClear = onUpdate.mock.calls.at(-1)?.[0];
    expect(afterClear).toBeNull();
    expect(afterClear).not.toBe(0);
    expect(Number.isNaN(afterClear)).toBe(false);
  });

  it("支持失焦与步进按钮时按 [min, max] 边界钳制，支持 ArrowUp/ArrowDown 步进", async () => {
    const onUpdate = vi.fn();
    const wrapper = mountUiComponent(InputNumber, {
      props: {
        modelValue: 5,
        min: 1,
        max: 10,
        step: 2,
        showButtons: true,
        useGrouping: false,
        "onUpdate:modelValue": onUpdate,
      },
    });

    const incBtn = wrapper.get(".p-inputnumber-increment-button");
    const decBtn = wrapper.get(".p-inputnumber-decrement-button");

    await incBtn.trigger("click");
    expect(onUpdate).toHaveBeenLastCalledWith(7);

    await wrapper.setProps({ modelValue: 9 });
    await incBtn.trigger("click");
    expect(onUpdate).toHaveBeenLastCalledWith(10);

    await wrapper.setProps({ modelValue: 2 });
    await decBtn.trigger("click");
    expect(onUpdate).toHaveBeenLastCalledWith(1);

    const input = wrapper.get("input");
    await wrapper.setProps({ modelValue: 5 });
    await input.trigger("keydown", { key: "ArrowUp" });
    expect(onUpdate).toHaveBeenLastCalledWith(7);

    await input.trigger("keydown", { key: "ArrowDown" });
    expect(onUpdate).toHaveBeenLastCalledWith(5);

    await input.setValue("999");
    await input.trigger("blur");
    expect(onUpdate).toHaveBeenLastCalledWith(10);
    expect((input.element as HTMLInputElement).value).toBe("10");
  });

  it("支持合成 keypress 事件直写 0（适配问卷与数字输入测试）以及前后缀格式化", async () => {
    const onUpdate = vi.fn();
    const wrapper = mountUiComponent(InputNumber, {
      props: {
        modelValue: null,
        inputId: "hours",
        useGrouping: false,
        "onUpdate:modelValue": onUpdate,
      },
    });

    const input = wrapper.get("input#hours");
    await input.trigger("keypress", {
      key: "0",
      which: 48,
      charCode: 48,
      keyCode: 48,
    });
    expect((input.element as HTMLInputElement).value).toBe("0");
    expect(onUpdate).toHaveBeenLastCalledWith(0);

    await wrapper.setProps({ modelValue: 50, suffix: " %" });
    expect((input.element as HTMLInputElement).value).toBe("50 %");
  });

  it("支持 disabled / readonly / invalid 状态并与 FormField 联动", async () => {
    const onUpdate = vi.fn();
    const wrapper = mountUiComponent(FormField, {
      props: {
        inputId: "seats-input",
        label: "席位数",
        error: "席位数超限",
        required: true,
      },
      slots: {
        default: (slotProps: Record<string, unknown>) =>
          h(InputNumber, {
            modelValue: 5,
            inputId: slotProps.inputId as string,
            ariaDescribedby: slotProps.describedBy as string,
            invalid: slotProps.invalid as boolean,
            required: slotProps.required as boolean,
            disabled: true,
            showButtons: true,
            "onUpdate:modelValue": onUpdate,
          }),
      },
    });

    const input = wrapper.get("input#seats-input");
    expect(input.attributes("aria-invalid")).toBe("true");
    expect(input.attributes("data-invalid")).toBe("");
    expect(input.attributes("data-disabled")).toBe("");
    expect(input.attributes("aria-describedby")).toBe("seats-input-error");

    await wrapper.get(".p-inputnumber-increment-button").trigger("click");
    expect(onUpdate).not.toHaveBeenCalled();
  });
});
