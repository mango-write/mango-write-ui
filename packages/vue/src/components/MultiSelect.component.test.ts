import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { nextTick } from "vue";
import { mountUiComponent } from "../test-utils/mount.js";
import MultiSelect from "./MultiSelect.vue";

const options = [
  { label: "Alpha", value: "a" },
  { label: "Beta", value: "b" },
  { label: "Gamma", value: "c", disabled: true },
  { label: "Delta", value: "d" },
];

let mounted: ReturnType<typeof mountUiComponent> | null = null;

beforeEach(() => {
  vi.stubGlobal("requestAnimationFrame", (cb: (time: number) => void) => {
    cb(0);
    return 0;
  });
});

afterEach(() => {
  mounted?.unmount();
  mounted = null;
  document.body.innerHTML = "";
  vi.unstubAllGlobals();
});

function mountMultiSelect(props: Record<string, unknown> = {}, slots: Record<string, any> = {}) {
  mounted = mountUiComponent(MultiSelect, {
    attachTo: document.body,
    props: {
      modelValue: [],
      options,
      optionLabel: "label",
      optionValue: "value",
      optionDisabled: "disabled",
      placeholder: "请选择",
      ...props,
    },
    slots,
  });
  return mounted;
}

describe("MultiSelect", () => {
  it("暴露 combobox/listbox 无障碍属性与 FormField 状态，支持点击与键盘多选", async () => {
    const wrapper = mountMultiSelect({
      inputId: "ms-field",
      ariaLabel: "多选字段",
      ariaDescribedby: "ms-error",
      invalid: true,
      required: true,
    });

    const root = wrapper.get(".mw-multiselect");
    expect(root.attributes("id")).toBe("ms-field");
    expect(root.attributes("role")).toBe("combobox");
    expect(root.attributes("aria-label")).toBe("多选字段");
    expect(root.attributes("aria-describedby")).toBe("ms-error");
    expect(root.attributes("aria-invalid")).toBe("true");
    expect(root.attributes("data-invalid")).toBe("true");
    expect(root.attributes("aria-expanded")).toBe("false");

    await root.trigger("click");
    expect(root.attributes("aria-expanded")).toBe("true");
    expect(wrapper.emitted("show")).toHaveLength(1);

    const renderedOptions = document.body.querySelectorAll<HTMLElement>(".mw-multiselect__option");
    expect(renderedOptions).toHaveLength(4);
    expect(renderedOptions[0]?.getAttribute("aria-label")).toBe("Alpha");
    expect(renderedOptions[2]?.getAttribute("aria-disabled")).toBe("true");

    // Keyboard navigation skips disabled option (index 2 -> index 3)
    await root.trigger("keydown", { key: "ArrowDown" });
    expect(root.attributes("aria-activedescendant")).toBe("ms-field-listbox-option-1");
    await root.trigger("keydown", { key: "ArrowDown" });
    expect(root.attributes("aria-activedescendant")).toBe("ms-field-listbox-option-3");

    await root.trigger("keydown", { key: "Enter" });
    expect(wrapper.emitted("update:modelValue")?.at(-1)).toEqual([["d"]]);
    expect(wrapper.emitted("change")?.at(-1)?.[0]).toMatchObject({ value: ["d"] });

    await wrapper.setProps({ modelValue: ["d"] });
    renderedOptions[0]?.click();
    await nextTick();
    expect(wrapper.emitted("update:modelValue")?.at(-1)).toEqual([["d", "a"]]);

    await root.trigger("keydown", { key: "Escape" });
    expect(root.attributes("aria-expanded")).toBe("false");
    expect(wrapper.emitted("hide")).toHaveLength(1);
  });

  it("支持 comma 与 chip 展示、maxSelectedLabels 折叠文案与 showClear 清空", async () => {
    const wrapper = mountMultiSelect({
      modelValue: ["a", "b"],
      display: "chip",
      maxSelectedLabels: 2,
      selectedItemsLabel: "已选 {0} 项",
      showClear: true,
    });

    const label = wrapper.get(".mw-multiselect__label");
    const chips = label.findAll(".mw-multiselect__chip");
    expect(chips).toHaveLength(2);
    expect(chips[0]?.text()).toContain("Alpha");

    // Remove first chip
    await wrapper.get(".mw-multiselect__chip-remove").trigger("click");
    expect(wrapper.emitted("update:modelValue")?.at(-1)).toEqual([["b"]]);

    // chip 模式不受 maxSelectedLabels 影响：可见性按容器宽度折叠（jsdom 量不出几何 → 全部可见）
    await wrapper.setProps({ modelValue: ["a", "b", "d"] });
    expect(wrapper.get(".mw-multiselect__label").findAll(".mw-multiselect__chip")).toHaveLength(3);

    // comma 模式超出上限仍折叠为计数文案
    await wrapper.setProps({ display: "comma" });
    expect(wrapper.get(".mw-multiselect__label").text()).toBe("已选 3 项");

    // Clear all
    const clearBtn = wrapper.get(".mw-multiselect__clear");
    await clearBtn.trigger("click");
    expect(wrapper.emitted("update:modelValue")?.at(-1)).toEqual([[]]);
  });

  it("chip 在容器宽度不足时折叠为 +N，剩余项交给 tooltip", async () => {
    // jsdom 无布局引擎：钉住量算行的 rect 宽度驱动折叠路径（recalc 读 getBoundingClientRect）
    const proto = Element.prototype as unknown as Record<string, unknown>;
    const rectDesc = Object.getOwnPropertyDescriptor(proto, "getBoundingClientRect");
    Object.defineProperty(proto, "getBoundingClientRect", {
      configurable: true,
      value: () => ({ width: 80 }),
    });

    try {
      const wrapper = mountMultiSelect({
        modelValue: ["a", "b", "d"],
        display: "chip",
      });
      await nextTick();
      await nextTick();

      // 单 chip 80 + gap + "+N" 预留 42 > 可用宽 → 只露 1 个 chip，其余收进 +N
      const chips = wrapper.get(".mw-multiselect__label").findAll(".mw-multiselect__chip");
      expect(chips).toHaveLength(2);
      expect(chips[0]?.text()).toContain("Alpha");
      expect(chips[1]?.text()).toBe("+2");
      expect((chips[1]!.element as HTMLElement & { __mwTooltip?: { value: string } }).__mwTooltip?.value).toBe("Beta, Delta");

      // 隐藏量算行始终渲染全部 chip
      expect(wrapper.findAll(".mw-multiselect__measure .mw-multiselect__chip")).toHaveLength(3);
    } finally {
      if (rectDesc) Object.defineProperty(proto, "getBoundingClientRect", rectDesc);
      else delete proto.getBoundingClientRect;
    }
  });

  it("支持 filter 过滤与 showToggleAll 全选/取消全选（忽略禁用项）", async () => {
    const wrapper = mountMultiSelect({
      filter: true,
      filterPlaceholder: "筛选选项",
      showToggleAll: true,
    });

    await wrapper.get(".mw-multiselect").trigger("click");
    const toggleAllBtn = document.body.querySelector<HTMLButtonElement>(".mw-multiselect__toggle-all")!;
    expect(toggleAllBtn).not.toBeNull();
    toggleAllBtn.click();
    await nextTick();
    // Should select enabled options: a, b, d (skipping c which is disabled)
    expect(wrapper.emitted("update:modelValue")?.at(-1)).toEqual([["a", "b", "d"]]);

    const filterInput = document.body.querySelector<HTMLInputElement>(".mw-multiselect__filter")!;
    filterInput.value = "be";
    filterInput.dispatchEvent(new Event("input"));
    await nextTick();
    expect(document.body.querySelectorAll(".mw-multiselect__option")).toHaveLength(1);
    expect(document.body.querySelector(".mw-multiselect__option")?.textContent).toContain("Beta");

    filterInput.value = "nonexistent";
    filterInput.dispatchEvent(new Event("input"));
    await nextTick();
    expect(document.body.querySelector(".mw-multiselect__empty")?.textContent).toBe("无匹配项");
  });

  it("禁用与只读态不打开面板、不触发清除或删除", async () => {
    const wrapper = mountMultiSelect({
      modelValue: ["a"],
      disabled: true,
      showClear: true,
      display: "chip",
    });

    const root = wrapper.get(".mw-multiselect");
    expect(root.attributes("data-disabled")).toBe("true");
    expect(wrapper.find(".mw-multiselect__clear").exists()).toBe(false);
    expect(wrapper.find(".mw-multiselect__chip-remove").exists()).toBe(false);

    await root.trigger("click");
    expect(document.body.querySelector(".mw-multiselect__overlay")).toBeNull();
  });
});
