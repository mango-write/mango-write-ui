import { defineComponent, h, ref } from "vue";
import { describe, expect, it, vi } from "vitest";

import { mountUiComponent } from "../test-utils/mount.js";
import RadioButton from "./RadioButton.vue";

describe("RadioButton", () => {
  it("渲染原生 input[type=radio]，支持受控值选中与外部 label[for] 联动点击", async () => {
    const onUpdate = vi.fn();
    const onChange = vi.fn();

    const Host = defineComponent({
      setup() {
        const selected = ref("opt-a");
        return () =>
          h("div", [
            h(RadioButton, {
              modelValue: selected.value,
              value: "opt-a",
              inputId: "radio-a",
              name: "group-1",
            }),
            h("label", { for: "radio-a", id: "label-a" }, "选项 A"),
            h(RadioButton, {
              modelValue: selected.value,
              value: "opt-b",
              inputId: "radio-b",
              name: "group-1",
              "onUpdate:modelValue": (val: string) => {
                selected.value = val;
                onUpdate(val);
              },
              onChange,
            }),
            h("label", { for: "radio-b", id: "label-b" }, "选项 B"),
          ]);
      },
    });

    const wrapper = mountUiComponent(Host, { attachTo: document.body });
    const radios = wrapper.findAll(".mw-radio");
    expect(radios).toHaveLength(2);
    expect(radios[0]!.classes()).toEqual(
      expect.arrayContaining(["mw-radio--checked"]),
    );
    expect(radios[1]!.classes()).not.toContain("mw-radio--checked");

    const inputB = wrapper.get("input#radio-b");
    expect(inputB.attributes("type")).toBe("radio");
    expect(inputB.attributes("name")).toBe("group-1");

    // 点击原生 <label for="radio-b"> 触发选中，且不会重复触发两次事件
    await wrapper.get("label#label-b").trigger("click");
    expect(onUpdate).toHaveBeenCalledTimes(1);
    expect(onUpdate).toHaveBeenCalledWith("opt-b");
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ value: "opt-b" }),
    );
    expect(radios[1]!.classes()).toEqual(
      expect.arrayContaining(["mw-radio--checked"]),
    );

    wrapper.unmount();
  });

  it("支持 binary 二值模式、空格键切换以及 disabled / readonly / invalid 状态", async () => {
    const onUpdate = vi.fn();
    const wrapper = mountUiComponent(RadioButton, {
      props: {
        modelValue: false,
        binary: true,
        inputId: "binary-radio",
        invalid: true,
        "onUpdate:modelValue": onUpdate,
      },
    });

    const input = wrapper.get("input#binary-radio");
    expect(input.attributes("aria-invalid")).toBe("true");
    expect(wrapper.attributes("data-invalid")).toBe("");

    await input.trigger("keydown", { key: " " });
    expect(onUpdate).toHaveBeenLastCalledWith(true);

    await wrapper.setProps({ disabled: true });
    expect(wrapper.attributes("data-disabled")).toBe("");
    await input.trigger("click");
    expect(onUpdate).toHaveBeenCalledTimes(1);

    await wrapper.setProps({ disabled: false, readonly: true });
    expect(wrapper.attributes("data-readonly")).toBe("");
    await input.trigger("click");
    expect(onUpdate).toHaveBeenCalledTimes(1);
  });
});
