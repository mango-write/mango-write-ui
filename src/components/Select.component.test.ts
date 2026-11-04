import { afterEach, describe, expect, it } from "vitest";
import { defineComponent, h, nextTick, ref } from "vue";
import { mountUiComponent } from "../test-utils/mount.js";
import Select from "./Select.vue";

let mounted: ReturnType<typeof mountUiComponent> | null = null;

afterEach(() => {
  mounted?.unmount();
  mounted = null;
  document.body.innerHTML = "";
});

function mountSelect(props: Record<string, unknown> = {}, slots: Record<string, any> = {}) {
  mounted = mountUiComponent(Select, {
    attachTo: document.body,
    props: {
      options: [
        { label: "Alpha", value: "a" },
        { label: "Beta", value: "b" },
        { label: "Gamma", value: "c" },
      ],
      optionLabel: "label",
      optionValue: "value",
      ...props,
    },
    slots,
  });
  return mounted;
}

describe("Select", () => {
  it("暴露 combobox/listbox 无障碍属性与 FormField 联动状态", async () => {
    const wrapper = mountSelect({
      modelValue: "a",
      inputId: "topic-select",
      ariaLabel: "选择主题",
      ariaDescribedby: "topic-hint",
      invalid: true,
      required: true,
      "data-testid": "topic-trigger",
    });

    const trigger = wrapper.get('[role="combobox"]');
    expect(trigger.classes()).toContain("mw-select");
    expect(trigger.classes()).toContain("mw-control");
    expect(trigger.attributes("id")).toBe("topic-select");
    expect(trigger.attributes("aria-label")).toBe("选择主题");
    expect(trigger.attributes("aria-describedby")).toBe("topic-hint");
    expect(trigger.attributes("aria-invalid")).toBe("true");
    expect(trigger.attributes("aria-required")).toBe("true");
    expect(trigger.attributes("data-invalid")).toBe("true");
    expect(trigger.attributes("data-testid")).toBe("topic-trigger");
    expect(trigger.attributes("aria-expanded")).toBe("false");

    await trigger.trigger("click");
    await nextTick();

    expect(wrapper.emitted("before-show")).toHaveLength(1);
    expect(trigger.attributes("aria-expanded")).toBe("true");
    const listbox = document.body.querySelector('[role="listbox"]');
    expect(listbox).not.toBeNull();
    expect(trigger.attributes("aria-controls")).toBe(listbox?.getAttribute("id"));
  });

  it("支持 0、false、空串与对象作为合法非空值，清空产出 null", async () => {
    const objOption = { id: 1, name: "Object One" };
    const falsyOptions = [
      { label: "Zero", val: 0 },
      { label: "FalseBool", val: false },
      { label: "EmptyStr", val: "" },
      { label: "ObjectVal", val: objOption },
    ];

    const wrapper = mountSelect({
      modelValue: 0,
      options: falsyOptions,
      optionLabel: "label",
      optionValue: "val",
      placeholder: "请选择",
      showClear: true,
    });

    expect(wrapper.find(".mw-select__label").text()).toBe("Zero");
    expect(wrapper.find("button.mw-select__clear").exists()).toBe(true);

    await wrapper.setProps({ modelValue: false });
    expect(wrapper.find(".mw-select__label").text()).toBe("FalseBool");
    expect(wrapper.find("button.mw-select__clear").exists()).toBe(true);

    await wrapper.setProps({ modelValue: "" });
    expect(wrapper.find(".mw-select__label").text()).toBe("EmptyStr");
    expect(wrapper.find("button.mw-select__clear").exists()).toBe(true);

    await wrapper.setProps({ modelValue: objOption });
    expect(wrapper.find(".mw-select__label").text()).toBe("ObjectVal");

    await wrapper.get("button.mw-select__clear").trigger("click");
    expect(wrapper.emitted("update:modelValue")?.at(-1)).toEqual([null]);
    expect(wrapper.emitted("change")?.at(-1)?.[0]).toMatchObject({ value: null });
  });

  it("支持键盘 ArrowDown/ArrowUp/Home/End/Enter/Escape 完整导航并跳过禁用项", async () => {
    const wrapper = mountSelect({
      modelValue: null,
      options: [
        { label: "First", value: 1 },
        { label: "Disabled", value: 2, disabled: true },
        { label: "Third", value: 3 },
        { label: "Fourth", value: 4 },
      ],
      optionLabel: "label",
      optionValue: "value",
      optionDisabled: "disabled",
    });

    const trigger = wrapper.get('[role="combobox"]');
    await trigger.trigger("keydown", { key: "ArrowDown" });
    await nextTick();
    expect(trigger.attributes("aria-expanded")).toBe("true");
    expect(trigger.attributes("aria-activedescendant")).toContain("-option-0");

    // 跳过 index 1 (disabled) 到 index 2
    await trigger.trigger("keydown", { key: "ArrowDown" });
    expect(trigger.attributes("aria-activedescendant")).toContain("-option-2");

    await trigger.trigger("keydown", { key: "End" });
    expect(trigger.attributes("aria-activedescendant")).toContain("-option-3");

    await trigger.trigger("keydown", { key: "Home" });
    expect(trigger.attributes("aria-activedescendant")).toContain("-option-0");

    await trigger.trigger("keydown", { key: "ArrowDown" });
    await trigger.trigger("keydown", { key: "Enter" });
    await nextTick();

    expect(wrapper.emitted("update:modelValue")?.at(-1)).toEqual([3]);
    expect(wrapper.emitted("change")?.at(-1)?.[0]).toMatchObject({ value: 3 });
    expect(trigger.attributes("aria-expanded")).toBe("false");

    // Space 打开，Escape 关闭
    await trigger.trigger("keydown", { key: " " });
    await nextTick();
    expect(trigger.attributes("aria-expanded")).toBe("true");

    await trigger.trigger("keydown", { key: "Escape" });
    await nextTick();
    expect(trigger.attributes("aria-expanded")).toBe("false");
  });

  it("支持面板内 filter 过滤、函数型访问器及自定义插槽", async () => {
    const wrapper = mountSelect(
      {
        modelValue: "a",
        filter: true,
        filterPlaceholder: "搜索选项",
        optionLabel: (opt: { label: string }) => opt.label.toUpperCase(),
        optionValue: (opt: { value: string }) => opt.value,
      },
      {
        header: () => h("div", { class: "custom-header" }, "Header Slot"),
        value: ({ value }: { value: string }) => h("span", { class: "custom-value" }, `VAL:${value}`),
        option: ({ option, selected }: { option: { label: string }; selected: boolean }) =>
          h("span", { class: "custom-opt" }, `${option.label}:${selected}`),
        empty: () => h("span", { class: "custom-empty" }, "Nothing Here"),
      },
    );

    expect(wrapper.find(".custom-value").text()).toBe("VAL:a");

    await wrapper.get('[role="combobox"]').trigger("click");
    await nextTick();

    expect(document.body.querySelector(".custom-header")?.textContent).toBe("Header Slot");
    expect(document.body.querySelectorAll(".custom-opt")).toHaveLength(3);

    const filterInput = document.body.querySelector<HTMLInputElement>(".mw-select__filter-input");
    expect(filterInput).not.toBeNull();
    filterInput!.value = "gam";
    filterInput!.dispatchEvent(new Event("input", { bubbles: true }));
    await nextTick();

    expect(wrapper.emitted("filter")?.at(-1)?.[0]).toMatchObject({ value: "gam" });
    const visibleOptions = document.body.querySelectorAll('[role="option"]');
    expect(visibleOptions).toHaveLength(1);
    expect(visibleOptions[0]?.textContent).toContain("Gamma:false");

    filterInput!.value = "zzz";
    filterInput!.dispatchEvent(new Event("input", { bubbles: true }));
    await nextTick();
    expect(document.body.querySelector(".custom-empty")?.textContent).toBe("Nothing Here");
  });

  it("disabled、readonly 与 loading 时不展开浮层且隐藏清除按钮", async () => {
    const wrapper = mountSelect({
      modelValue: "a",
      showClear: true,
      disabled: true,
    });

    expect(wrapper.find("button.mw-select__clear").exists()).toBe(false);
    await wrapper.get('[role="combobox"]').trigger("click");
    await nextTick();
    expect(document.body.querySelector('[role="listbox"]')).toBeNull();

    await wrapper.setProps({ disabled: false, readonly: true });
    expect(wrapper.find("button.mw-select__clear").exists()).toBe(false);
    await wrapper.get('[role="combobox"]').trigger("click");
    await nextTick();
    expect(document.body.querySelector('[role="listbox"]')).toBeNull();

    await wrapper.setProps({ readonly: false, loading: true });
    expect(wrapper.find(".mw-select__spinner").exists()).toBe(true);
    await wrapper.get('[role="combobox"]').trigger("click");
    await nextTick();
    expect(document.body.querySelector('[role="listbox"]')).toBeNull();
  });

  it("支持 editable 可编辑触发器输入", async () => {
    const Host = defineComponent({
      setup() {
        const val = ref<string | null>("a");
        return () =>
          h(Select, {
            modelValue: val.value,
            "onUpdate:modelValue": (v: string | null) => {
              val.value = v;
            },
            options: [{ label: "Alpha", value: "a" }],
            optionLabel: "label",
            optionValue: "value",
            editable: true,
            inputId: "editable-select",
          });
      },
    });

    mounted = mountUiComponent(Host, { attachTo: document.body });
    const input = mounted.get("input#editable-select");
    expect((input.element as HTMLInputElement).value).toBe("Alpha");

    await input.setValue("Custom Value");
    expect((input.element as HTMLInputElement).value).toBe("Custom Value");
  });
});
