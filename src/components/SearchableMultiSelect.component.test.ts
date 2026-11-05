import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { nextTick } from "vue";

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
  it("fit 宽度按最宽候选与 placeholder 量出，选择增减不变化，options 变化才重算", async () => {
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue({
      measureText: (text: string) => ({ width: text.length * 10 }),
      letterSpacing: "0px",
    } as unknown as CanvasRenderingContext2D);

    const wrapper = mountMulti({
      modelValue: [],
      placeholder: "Quartile",
      options: [
        { label: "Alpha", value: "a" },
        { label: "Widest Option Value", value: "w" },
      ],
    });
    await nextTick();

    const fitOf = () => (wrapper.get(".mw-ms").element as HTMLElement).style.getPropertyValue("--mw-ms-fit-text");
    // 最宽候选 19 字 × 10px = 190 → ceil + 2 slack（placeholder 更短不取）
    expect(fitOf()).toBe("192px");

    await wrapper.get(".mw-ms input").setValue("Q"); // 打字过滤不影响锁定宽
    await nextTick();
    expect(fitOf()).toBe("192px");

    await wrapper.setProps({ options, placeholder: undefined });
    await nextTick();
    await nextTick();
    // Alpha/Beta/Gamma 最宽 5 字 → 52px
    expect(fitOf()).toBe("52px");
  });

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
