import { h } from "vue";
import { describe, expect, it, vi } from "vitest";

import { mountUiComponent } from "../test-utils/mount.js";
import FormField from "./FormField.vue";
import InputText from "./InputText.vue";

describe("InputText", () => {
  it("支持受控 modelValue 读写与原生焦点/键盘事件", async () => {
    const onUpdate = vi.fn();
    const onFocus = vi.fn();
    const onBlur = vi.fn();
    const onKeydown = vi.fn();

    const wrapper = mountUiComponent(InputText, {
      props: {
        modelValue: "初始标题",
        inputId: "doc-title",
        name: "title",
        placeholder: "请输入标题",
        "onUpdate:modelValue": onUpdate,
        onFocus,
        onBlur,
        onKeydown,
      },
    });

    const input = wrapper.get("input");
    expect(input.attributes("id")).toBe("doc-title");
    expect(input.attributes("name")).toBe("title");
    expect(input.classes()).toEqual(
      expect.arrayContaining(["mw-input-text", "mw-control", "mw-input"]),
    );
    expect((input.element as HTMLInputElement).value).toBe("初始标题");

    await input.setValue("更新后的标题");
    expect(onUpdate).toHaveBeenCalledWith("更新后的标题");

    await input.trigger("focus");
    expect(onFocus).toHaveBeenCalledTimes(1);

    await input.trigger("keydown", { key: "Enter" });
    expect(onKeydown).toHaveBeenCalledTimes(1);

    await input.trigger("blur");
    expect(onBlur).toHaveBeenCalledTimes(1);
  });

  it("IME 组合输入期间不提前发出 update:modelValue，compositionend 时提交最终值", async () => {
    const onUpdate = vi.fn();
    const wrapper = mountUiComponent(InputText, {
      props: {
        modelValue: "",
        "onUpdate:modelValue": onUpdate,
      },
    });

    const input = wrapper.get("input");
    await input.trigger("compositionstart");

    (input.element as HTMLInputElement).value = "zhong";
    await input.trigger("input");
    expect(onUpdate).not.toHaveBeenCalled();

    (input.element as HTMLInputElement).value = "中文";
    await input.trigger("compositionend");
    expect(onUpdate).toHaveBeenCalledTimes(1);
    expect(onUpdate).toHaveBeenCalledWith("中文");
  });

  it("正确反映 invalid / disabled / readonly 状态并与 FormField 联动", () => {
    const wrapper = mountUiComponent(FormField, {
      props: {
        inputId: "email-input",
        label: "邮箱",
        hint: "用于接收通知",
        error: "邮箱格式不正确",
        required: true,
      },
      slots: {
        default: (slotProps: Record<string, unknown>) =>
          h(InputText, {
            inputId: slotProps.inputId as string,
            "aria-describedby": slotProps.describedBy as string,
            invalid: slotProps.invalid as boolean,
            required: slotProps.required as boolean,
            disabled: true,
            readonly: true,
          }),
      },
    });

    const input = wrapper.get("input");
    expect(input.attributes("id")).toBe("email-input");
    expect(input.attributes("aria-describedby")).toBe(
      "email-input-hint email-input-error",
    );
    expect(input.attributes("aria-invalid")).toBe("true");
    expect(input.attributes("data-invalid")).toBe("");
    expect(input.attributes("data-disabled")).toBe("");
    expect(input.attributes("data-readonly")).toBe("");
    expect(input.attributes("required")).toBeDefined();
  });
});
