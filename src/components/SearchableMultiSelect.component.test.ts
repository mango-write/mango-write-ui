import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { mountUiComponent } from "../test-utils/mount.js";
import SearchableMultiSelect from "./SearchableMultiSelect.vue";

const options = [
  { label: "Alpha", value: "a" },
  { label: "Beta", value: "b" },
  { label: "Gamma", value: "c" },
];

let mounted: ReturnType<typeof mountUiComponent> | null = null;

beforeEach(() => {
  vi.stubGlobal("requestAnimationFrame", (callback: (time: number) => void) => {
    callback(0);
    return 0;
  });
  vi.stubGlobal("ResizeObserver", class {
    observe() {}
    disconnect() {}
  });
});

afterEach(() => {
  mounted?.unmount();
  mounted = null;
  document.body.innerHTML = "";
  vi.unstubAllGlobals();
});

function mountMulti(props: Record<string, unknown> = {}) {
  mounted = mountUiComponent(SearchableMultiSelect, {
    attachTo: document.body,
    props: {
      modelValue: ["a"],
      options,
      optionLabel: "label",
      optionValue: "value",
      ...props,
    },
  });
  return mounted;
}

describe("SearchableMultiSelect", () => {
  it("暴露多选 combobox 语义，方向键与 Enter 切换选项", async () => {
    const wrapper = mountMulti({
      inputId: "topics",
      ariaLabel: "研究主题",
      ariaDescribedby: "topics-hint",
      invalid: true,
      required: true,
    });
    const input = wrapper.get("input");
    expect(input.attributes("role")).toBe("combobox");
    expect(input.attributes("aria-label")).toBe("研究主题");
    expect(input.attributes("aria-describedby")).toBe("topics-hint");
    expect(input.attributes("aria-invalid")).toBe("true");
    expect(input.attributes("aria-required")).toBe("true");

    await input.trigger("focus");
    const listbox = document.body.querySelector('[role="listbox"]');
    expect(listbox?.getAttribute("aria-multiselectable")).toBe("true");
    expect(document.body.querySelector('[role="option"]')?.getAttribute("aria-selected")).toBe("true");

    await input.trigger("keydown", { key: "ArrowDown" });
    expect(input.attributes("aria-activedescendant")).toBe("topics-listbox-option-1");
    await input.trigger("keydown", { key: "Enter" });
    expect(wrapper.emitted("update:modelValue")?.at(-1)).toEqual([["a", "b"]]);
  });

  it("chip 删除是带选项名称的原生按钮", async () => {
    const wrapper = mountMulti();
    const remove = wrapper.get("button.mw-ms-chip-remove");
    expect(remove.attributes("aria-label")).toBe("移除 Alpha");
    await remove.trigger("click");
    expect(wrapper.emitted("update:modelValue")?.at(-1)).toEqual([[]]);
  });

  it("禁用时不打开面板也不暴露 chip 删除", async () => {
    const wrapper = mountMulti({ disabled: true });
    expect(wrapper.find("button.mw-ms-chip-remove").exists()).toBe(false);
    await wrapper.get("input").trigger("focus");
    expect(document.body.querySelector('[role="listbox"]')).toBeNull();
  });

  it("无匹配时呈现空结果", async () => {
    const wrapper = mountMulti();
    await wrapper.get("input").setValue("not-found");
    expect(document.body.querySelector(".mw-ms-empty")?.textContent).toBe("无匹配项");
    expect(document.body.querySelectorAll('[role="option"]')).toHaveLength(0);
  });
});
