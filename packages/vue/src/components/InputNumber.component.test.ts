import { defineComponent, h, ref } from "vue";
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
      expect.arrayContaining(["mw-input-number"]),
    );
    const input = wrapper.get("input#price-input");
    expect(input.classes()).toEqual(
      expect.arrayContaining([
        "mw-input-number__input",
        "mw-control",
        "mw-input",
        "mw-input",
        "mw-input-number__input",
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

    const incBtn = wrapper.get(".mw-input-number__button--up");
    const decBtn = wrapper.get(".mw-input-number__button--down");

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

    await wrapper.get(".mw-input-number__button--up").trigger("click");
    expect(onUpdate).not.toHaveBeenCalled();
  });

  it("在千分位数值前部连续输入、替换首位与跨逗号删除时光标不跳到末尾", async () => {
    const Host = defineComponent({
      setup() {
        const val = ref<number | null>(2_000_000);
        return { val };
      },
      render() {
        return h(InputNumber, {
          modelValue: this.val,
          "onUpdate:modelValue": (v: number | null) => {
            this.val = v;
          },
          locale: "en-US",
          maxFractionDigits: 0,
          inputId: "tokens-limit",
        });
      },
    });

    const wrapper = mountUiComponent(Host);
    const input = wrapper.get("input#tokens-limit");
    const el = input.element as HTMLInputElement;

    expect(el.value).toBe("2,000,000");
    await input.trigger("focus");

    // 模拟在 2 后依次输入 5、0、0，跨越千分位新增逗号：2,000,000 -> 2,500,000,000
    el.value = "25,000,000";
    el.setSelectionRange(2, 2);
    el.dispatchEvent(new InputEvent("input", { bubbles: true, inputType: "insertText", data: "5" }));
    await wrapper.vm.$nextTick();
    expect(el.value).toBe("25,000,000");
    expect(el.selectionStart).toBe(2);
    expect(wrapper.vm.val).toBe(25_000_000);

    el.value = "250,000,000";
    el.setSelectionRange(3, 3);
    el.dispatchEvent(new InputEvent("input", { bubbles: true, inputType: "insertText", data: "0" }));
    await wrapper.vm.$nextTick();
    expect(el.value).toBe("250,000,000");
    expect(el.selectionStart).toBe(3);

    el.value = "2500,000,000";
    el.setSelectionRange(4, 4);
    el.dispatchEvent(new InputEvent("input", { bubbles: true, inputType: "insertText", data: "0" }));
    await wrapper.vm.$nextTick();
    expect(el.value).toBe("2,500,000,000");
    expect(el.selectionStart).toBe(5);
    expect(wrapper.vm.val).toBe(2_500_000_000);

    // 重置回 2,000,000，测试删除首位 2 后不塌缩前导零，继续输 5 变为 5,000,000
    wrapper.vm.val = 2_000_000;
    await wrapper.vm.$nextTick();
    expect(el.value).toBe("2,000,000");

    el.value = ",000,000";
    el.setSelectionRange(0, 0);
    el.dispatchEvent(new InputEvent("input", { bubbles: true, inputType: "deleteContentBackward" }));
    await wrapper.vm.$nextTick();
    expect(el.value).toBe("000,000");
    expect(el.selectionStart).toBe(0);
    expect(wrapper.vm.val).toBe(0);

    el.value = "5000,000";
    el.setSelectionRange(1, 1);
    el.dispatchEvent(new InputEvent("input", { bubbles: true, inputType: "insertText", data: "5" }));
    await wrapper.vm.$nextTick();
    expect(el.value).toBe("5,000,000");
    expect(el.selectionStart).toBe(1);
    expect(wrapper.vm.val).toBe(5_000_000);

    // 合成 keypress 在前部插入时同样保持光标不归尾
    el.setSelectionRange(0, 0);
    await input.trigger("keypress", { key: "1", charCode: 49 });
    expect(el.value).toBe("15,000,000");
    expect(el.selectionStart).toBe(1);
    expect(wrapper.vm.val).toBe(15_000_000);

    // 贴逗号按 Backspace（15,|000,000 -> 删掉逗号后为 15000,000，caret=2）跨过逗号删掉 5 -> 1|,000,000
    el.value = "15000,000";
    el.setSelectionRange(2, 2);
    el.dispatchEvent(new InputEvent("input", { bubbles: true, inputType: "deleteContentBackward" }));
    await wrapper.vm.$nextTick();
    expect(el.value).toBe("1,000,000");
    expect(el.selectionStart).toBe(1);
    expect(wrapper.vm.val).toBe(1_000_000);
  });

  it("聚焦编辑超精度小数时不被受控回流打断光标，失焦后再按精度舍入", async () => {
    const Host = defineComponent({
      setup() {
        const val = ref<number | null>(1234.56);
        return { val };
      },
      render() {
        return h(InputNumber, {
          modelValue: this.val,
          "onUpdate:modelValue": (v: number | null) => {
            this.val = v;
          },
          locale: "en-US",
          maxFractionDigits: 2,
          inputId: "unit-cost",
        });
      },
    });

    const wrapper = mountUiComponent(Host);
    const input = wrapper.get("input#unit-cost");
    const el = input.element as HTMLInputElement;

    await input.trigger("focus");
    el.value = "1,234.567";
    el.setSelectionRange(9, 9);
    el.dispatchEvent(new InputEvent("input", { bubbles: true, inputType: "insertText", data: "7" }));
    await wrapper.vm.$nextTick();

    expect(wrapper.vm.val).toBe(1234.57);
    expect(el.value).toBe("1,234.567");
    expect(el.selectionStart).toBe(9);

    await input.trigger("blur");
    expect(el.value).toBe("1,234.57");
  });

  it("覆盖 de-DE 整数往返、延迟回流草稿版本校验与 IME 组合态键盘隔离", async () => {
    const onUpdate = vi.fn();
    const wrapper = mountUiComponent(InputNumber, {
      props: {
        modelValue: 2000,
        locale: "de-DE",
        maxFractionDigits: 0,
        inputId: "de-int",
        "onUpdate:modelValue": onUpdate,
      },
    });
    const input = wrapper.get("input#de-int");
    const el = input.element as HTMLInputElement;
    expect(el.value).toBe("2.000");

    await input.trigger("focus");
    await input.trigger("blur");
    expect(el.value).toBe("2.000");
    expect(onUpdate).not.toHaveBeenCalledWith(2);

    // 聚焦期间先输入 2（父组件延迟未回写），再改为中间态 '-'，随后旧值 2 异步回流不应被当成当前草稿回声吞掉
    await wrapper.setProps({ modelValue: 0, locale: "en-US" });
    await input.trigger("focus");
    el.value = "2";
    el.setSelectionRange(1, 1);
    el.dispatchEvent(new InputEvent("input", { bubbles: true, inputType: "insertText", data: "2" }));
    await wrapper.vm.$nextTick();

    el.value = "-";
    el.setSelectionRange(1, 1);
    el.dispatchEvent(new InputEvent("input", { bubbles: true, inputType: "insertText", data: "-" }));
    await wrapper.vm.$nextTick();
    expect(el.value).toBe("-");

    await wrapper.setProps({ modelValue: 2 });
    expect(el.value).toBe("2");

    // IME 组合期间按 ArrowUp 不应提前触发步进改值
    onUpdate.mockClear();
    await input.trigger("compositionstart");
    await input.trigger("keydown", { key: "ArrowUp" });
    expect(onUpdate).not.toHaveBeenCalled();
    await input.trigger("compositionend");
  });
});
