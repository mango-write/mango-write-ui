import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { mountUiComponent } from "../test-utils/mount.js";
import SearchableSelect from "./SearchableSelect.vue";

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
});

afterEach(() => {
  mounted?.unmount();
  mounted = null;
  document.body.innerHTML = "";
  vi.unstubAllGlobals();
});

function mountSelect(props: Record<string, unknown> = {}) {
  mounted = mountUiComponent(SearchableSelect, {
    attachTo: document.body,
    props: {
      modelValue: "a",
      options,
      optionLabel: "label",
      optionValue: "value",
      showClear: true,
      ...props,
    },
  });
  return mounted;
}

describe("SearchableSelect", () => {
  it("暴露输入关联和 combobox/listbox 语义，支持键盘选择", async () => {
    const wrapper = mountSelect({
      inputId: "discipline",
      ariaLabelledby: "discipline-label",
      ariaDescribedby: "discipline-error",
      invalid: true,
      required: true,
    });
    const input = wrapper.get("input");
    expect(input.attributes("role")).toBe("combobox");
    expect(input.attributes("aria-labelledby")).toBe("discipline-label");
    expect(input.attributes("aria-describedby")).toBe("discipline-error");
    expect(input.attributes("aria-invalid")).toBe("true");
    expect(input.attributes("required")).toBeDefined();

    await input.trigger("focus");
    expect(input.attributes("aria-expanded")).toBe("true");
    expect(document.body.querySelectorAll('[role="option"]')).toHaveLength(3);

    await input.trigger("keydown", { key: "ArrowDown" });
    expect(input.attributes("aria-activedescendant")).toBe("discipline-listbox-option-1");
    await input.trigger("keydown", { key: "Enter" });
    expect(wrapper.emitted("update:modelValue")?.at(-1)).toEqual(["b"]);
    expect(input.attributes("aria-expanded")).toBe("false");
  });

  it("清除是带可访问名称的原生按钮", async () => {
    const wrapper = mountSelect();
    const clear = wrapper.get("button.mw-ss-clear");
    expect(clear.attributes("aria-label")).toBe("清除选择");
    await clear.trigger("click");
    expect(wrapper.emitted("update:modelValue")?.at(-1)).toEqual([null]);
  });

  it("禁用时不打开面板也不暴露清除操作", async () => {
    const wrapper = mountSelect({ disabled: true });
    expect(wrapper.find("button.mw-ss-clear").exists()).toBe(false);
    await wrapper.get("input").trigger("focus");
    expect(document.body.querySelector('[role="listbox"]')).toBeNull();
  });

  it("无匹配时呈现空结果", async () => {
    const wrapper = mountSelect({ modelValue: null });
    await wrapper.get("input").setValue("not-found");
    expect(document.body.querySelector(".mw-ss-empty")?.textContent).toBe("无匹配项");
    expect(document.body.querySelectorAll('[role="option"]')).toHaveLength(0);
  });
});
