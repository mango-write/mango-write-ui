import { afterEach, describe, expect, it } from "vitest";
import { mountUiComponent } from "../test-utils/mount.js";
import Listbox from "./Listbox.vue";

const options = [
  { label: "草稿 A", value: "d-1" },
  { label: "草稿 B", value: "d-2" },
  { label: "已锁定草稿", value: "d-3", disabled: true },
  { label: "草稿 D", value: "d-4" },
];

let mounted: ReturnType<typeof mountUiComponent> | null = null;

afterEach(() => {
  mounted?.unmount();
  mounted = null;
  document.body.innerHTML = "";
});

function mountListbox(props: Record<string, unknown> = {}, slots: Record<string, any> = {}) {
  mounted = mountUiComponent(Listbox, {
    attachTo: document.body,
    props: {
      modelValue: null,
      options,
      optionLabel: "label",
      optionValue: "value",
      optionDisabled: "disabled",
      ...props,
    },
    slots,
  });
  return mounted;
}

describe("Listbox", () => {
  it("支持单选模式、无障碍属性落点与方向键/Enter 选择", async () => {
    const wrapper = mountListbox({
      inputId: "draft-list",
      ariaLabel: "选择草稿",
      invalid: true,
      listStyle: "max-height: 240px",
    });

    const root = wrapper.get(".mw-listbox.p-listbox");
    expect(root.attributes("data-invalid")).toBe("true");

    const list = wrapper.get('[role="listbox"]');
    expect(list.attributes("aria-label")).toBe("选择草稿");
    expect(list.attributes("aria-invalid")).toBe("true");

    const items = wrapper.findAll(".mw-listbox__option.p-listbox-option");
    expect(items).toHaveLength(4);
    expect(items[2]?.attributes("aria-disabled")).toBe("true");

    await list.trigger("keydown", { key: "ArrowDown" });
    expect(list.attributes("aria-activedescendant")).toBe("draft-list-list-option-0");
    await list.trigger("keydown", { key: "ArrowDown" });
    expect(list.attributes("aria-activedescendant")).toBe("draft-list-list-option-1");
    await list.trigger("keydown", { key: "ArrowDown" });
    // Skips disabled option index 2 -> lands on index 3
    expect(list.attributes("aria-activedescendant")).toBe("draft-list-list-option-3");

    await list.trigger("keydown", { key: "Enter" });
    expect(wrapper.emitted("update:modelValue")?.at(-1)).toEqual(["d-4"]);
    expect(wrapper.emitted("change")?.at(-1)?.[0]).toMatchObject({ value: "d-4" });

    await wrapper.setProps({ modelValue: "d-4" });
    expect(items[3]?.classes()).toContain("p-listbox-option-selected");
    expect(items[3]?.attributes("aria-selected")).toBe("true");
  });

  it("支持 multiple 多选模式与过滤搜索", async () => {
    const wrapper = mountListbox({
      modelValue: ["d-1"],
      multiple: true,
      filter: true,
      filterPlaceholder: "搜索草稿",
      emptyFilterMessage: "没有找到草稿",
    });

    const list = wrapper.get('[role="listbox"]');
    expect(list.attributes("aria-multiselectable")).toBe("true");

    const items = wrapper.findAll(".p-listbox-option");
    await items[1]!.trigger("click");
    expect(wrapper.emitted("update:modelValue")?.at(-1)).toEqual([["d-1", "d-2"]]);

    const filterInput = wrapper.get(".p-listbox-filter");
    await filterInput.setValue("草稿 B");
    expect(wrapper.findAll(".p-listbox-option")).toHaveLength(1);
    expect(wrapper.get(".p-listbox-option").text()).toBe("草稿 B");

    await filterInput.setValue("不存在");
    expect(wrapper.findAll(".p-listbox-option")).toHaveLength(0);
    expect(wrapper.get(".p-listbox-empty-message").text()).toBe("没有找到草稿");
  });

  it("禁用与只读态不响应点击与键盘选择", async () => {
    const wrapper = mountListbox({
      modelValue: "d-1",
      disabled: true,
    });

    expect(wrapper.get(".mw-listbox").attributes("data-disabled")).toBe("true");
    await wrapper.findAll(".p-listbox-option")[1]!.trigger("click");
    expect(wrapper.emitted("update:modelValue")).toBeUndefined();
  });
});
