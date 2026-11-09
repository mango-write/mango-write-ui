import { describe, expect, it, vi } from "vitest";

import { mountUiComponent } from "../test-utils/mount.js";
import Textarea from "./Textarea.vue";

describe("Textarea", () => {
  it("支持受控读写、rows 配置与类名落点", async () => {
    const onUpdate = vi.fn();
    const wrapper = mountUiComponent(Textarea, {
      props: {
        modelValue: "第一段",
        inputId: "abstract-field",
        rows: 5,
        "onUpdate:modelValue": onUpdate,
      },
    });

    const textarea = wrapper.get("textarea");
    expect(textarea.attributes("id")).toBe("abstract-field");
    expect(textarea.attributes("rows")).toBe("5");
    expect(textarea.classes()).toEqual(
      expect.arrayContaining(["mw-textarea", "mw-control"]),
    );
    expect((textarea.element as HTMLTextAreaElement).value).toBe("第一段");

    await textarea.setValue("第一段\n第二段");
    expect(onUpdate).toHaveBeenCalledWith("第一段\n第二段");
  });

  it("IME 组合输入期间不提前提交，compositionend 时发出最终字符串", async () => {
    const onUpdate = vi.fn();
    const wrapper = mountUiComponent(Textarea, {
      props: {
        modelValue: "",
        "onUpdate:modelValue": onUpdate,
      },
    });

    const textarea = wrapper.get("textarea");
    await textarea.trigger("compositionstart");
    (textarea.element as HTMLTextAreaElement).value = "zhai";
    await textarea.trigger("input");
    expect(onUpdate).not.toHaveBeenCalled();

    (textarea.element as HTMLTextAreaElement).value = "摘要";
    await textarea.trigger("compositionend");
    expect(onUpdate).toHaveBeenCalledTimes(1);
    expect(onUpdate).toHaveBeenCalledWith("摘要");
  });

  it("支持 autoResize 及 invalid / disabled / readonly 属性落点", async () => {
    const wrapper = mountUiComponent(Textarea, {
      props: {
        modelValue: "内容",
        autoResize: true,
        invalid: true,
        disabled: true,
        readonly: true,
      },
    });

    const textarea = wrapper.get("textarea");
    expect(textarea.attributes("aria-invalid")).toBe("true");
    expect(textarea.attributes("data-invalid")).toBe("");
    expect(textarea.attributes("data-disabled")).toBe("");
    expect(textarea.attributes("data-readonly")).toBe("");

    Object.defineProperty(textarea.element, "scrollHeight", {
      configurable: true,
      value: 96,
    });
    await wrapper.setProps({ modelValue: "更长的多行内容" });
    expect((textarea.element as HTMLTextAreaElement).style.height).toBe("96px");
  });
});
