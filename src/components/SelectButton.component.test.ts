import { h } from "vue";
import { describe, expect, it, vi } from "vitest";

import { mountUiComponent } from "../test-utils/mount.js";
import SelectButton from "./SelectButton.vue";

describe("SelectButton", () => {
  it("支持单选模式、allowEmpty 控制与原始值/对象选项", async () => {
    const onUpdate = vi.fn();
    const onChange = vi.fn();

    const wrapper = mountUiComponent(SelectButton, {
      props: {
        modelValue: "a",
        options: [
          { label: "选项 A", value: "a" },
          { label: "选项 B", value: "b" },
          { label: "禁用项", value: "c", disabled: true },
        ],
        optionLabel: "label",
        optionValue: "value",
        optionDisabled: "disabled",
        allowEmpty: false,
        ariaLabel: "切换模式",
        "onUpdate:modelValue": onUpdate,
        onChange,
      },
    });

    expect(wrapper.attributes("role")).toBe("group");
    expect(wrapper.attributes("aria-label")).toBe("切换模式");
    expect(wrapper.classes()).toEqual(
      expect.arrayContaining(["mw-select-button", "p-selectbutton"]),
    );

    const buttons = wrapper.findAll("button.mw-select-button__item.p-togglebutton");
    expect(buttons).toHaveLength(3);
    expect(buttons[0]!.attributes("aria-pressed")).toBe("true");
    expect(buttons[0]!.classes()).toEqual(
      expect.arrayContaining(["mw-select-button__item--active", "p-togglebutton-checked"]),
    );
    expect(buttons[1]!.attributes("aria-pressed")).toBe("false");
    expect(buttons[2]!.attributes("disabled")).toBeDefined();

    // allowEmpty=false 时点击已选项不会清空为 null
    await buttons[0]!.trigger("click");
    expect(onUpdate).not.toHaveBeenCalled();

    // 点击第二个选项切换为 'b'
    await buttons[1]!.trigger("click");
    expect(onUpdate).toHaveBeenLastCalledWith("b");
    expect(onChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ value: "b" }),
    );

    // 点击禁用项不触发更新
    await buttons[2]!.trigger("click");
    expect(onUpdate).toHaveBeenCalledTimes(1);

    // allowEmpty=true 时点击已选项清空为 null
    await wrapper.setProps({ modelValue: "b", allowEmpty: true });
    await buttons[1]!.trigger("click");
    expect(onUpdate).toHaveBeenLastCalledWith(null);
  });

  it("支持 multiple 多选模式、#option 插槽与键盘左右方向键焦点导航", async () => {
    const onUpdate = vi.fn();
    const wrapper = mountUiComponent(SelectButton, {
      attachTo: document.body,
      props: {
        modelValue: ["bold"],
        options: ["bold", "italic", "underline"],
        multiple: true,
        "onUpdate:modelValue": onUpdate,
      },
      slots: {
        option: ({ option, index }: { option: string; index: number }) =>
          h("span", { class: "custom-opt" }, `${index}:${option.toUpperCase()}`),
      },
    });

    const buttons = wrapper.findAll("button.mw-select-button__item");
    expect(buttons[0]!.find(".custom-opt").text()).toBe("0:BOLD");

    await buttons[1]!.trigger("click");
    expect(onUpdate).toHaveBeenLastCalledWith(["bold", "italic"]);

    await wrapper.setProps({ modelValue: ["bold", "italic"] });
    await buttons[0]!.trigger("click");
    expect(onUpdate).toHaveBeenLastCalledWith(["italic"]);

    // 键盘方向键导航
    (buttons[0]!.element as HTMLButtonElement).focus();
    await buttons[0]!.trigger("keydown", { key: "ArrowRight" });
    expect(document.activeElement).toBe(buttons[1]!.element);

    await buttons[1]!.trigger("keydown", { key: "End" });
    expect(document.activeElement).toBe(buttons[2]!.element);

    await buttons[2]!.trigger("keydown", { key: "Home" });
    expect(document.activeElement).toBe(buttons[0]!.element);

    wrapper.unmount();
  });
});
