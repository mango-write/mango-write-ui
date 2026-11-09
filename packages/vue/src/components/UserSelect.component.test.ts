import { afterEach, describe, expect, it } from "vitest";
import { nextTick } from "vue";
import UserSelect from "./UserSelect.vue";
import type { UserSelectOption } from "./user-select";
import { mountUiComponent } from "../test-utils/mount";

const users: UserSelectOption[] = [
  { id: "u-zhang", name: "张三", email: "zhang.san@mango.write", avatar: null },
  { id: "u-li", name: "李四", email: "li.si@mango.write", avatar: null },
  { id: "u-wang", name: "张三", email: "zhang.san+2@mango.write", avatar: null },
];

async function openPanel(wrapper: ReturnType<typeof mountUiComponent>) {
  await wrapper.find(".mw-ms-input").trigger("focus");
  await nextTick();
}

function panelOptions(): HTMLElement[] {
  return Array.from(document.querySelectorAll<HTMLElement>(".mw-ms-option"));
}

afterEach(() => {
  document.body.innerHTML = "";
});

describe("UserSelect", () => {
  it("选中项渲染 UserChip，移除按 id 发 update:modelValue", async () => {
    const wrapper = mountUiComponent(UserSelect, {
      props: { modelValue: ["u-zhang"], users },
    });
    await nextTick();
    await nextTick();

    const chip = wrapper.find(".mw-user-select__chip");
    expect(chip.find(".mw-user-chip__tag").exists()).toBe(true);
    expect(chip.text()).toContain("张三");
    expect(chip.find(".mw-user-chip").attributes("tabindex")).toBeUndefined();

    await wrapper.find(".mw-user-select__remove").trigger("mousedown");
    expect(wrapper.emitted("update:modelValue")?.[0]).toEqual([[]]);
  });

  it("选项展示头像、名字和邮箱，点选按 id 发值", async () => {
    const wrapper = mountUiComponent(UserSelect, { props: { modelValue: [], users } });
    await openPanel(wrapper);

    const options = panelOptions();
    expect(options).toHaveLength(3);
    expect(options[0].querySelector(".mw-user-chip__avatar-only")).not.toBeNull();
    expect(options[0].textContent).toContain("zhang.san@mango.write");

    options[1].dispatchEvent(new MouseEvent("mousedown", { bubbles: true, cancelable: true }));
    await nextTick();
    expect(wrapper.emitted("update:modelValue")?.[0]).toEqual([["u-li"]]);
  });

  it("按名字和邮箱过滤，默认空态由 UI 文案提供", async () => {
    const wrapper = mountUiComponent(UserSelect, { props: { modelValue: [], users } });
    await openPanel(wrapper);
    const input = wrapper.find(".mw-ms-input");

    await input.setValue("zhang.san+2");
    await nextTick();
    expect(panelOptions()).toHaveLength(1);

    await input.setValue("张三");
    await nextTick();
    expect(panelOptions()).toHaveLength(2);

    await input.setValue("nobody");
    await nextTick();
    expect(panelOptions()).toHaveLength(0);
    expect(document.querySelector(".mw-ms-empty")?.textContent).toBe("没有可选用户");
  });

  it("disabled 与自定义 emptyMessage 分别生效", async () => {
    const disabled = mountUiComponent(UserSelect, {
      props: { modelValue: [], users: [], disabled: true, emptyMessage: "暂无可选用户" },
    });
    expect(disabled.find(".mw-ms-input").attributes("disabled")).toBeDefined();

    const empty = mountUiComponent(UserSelect, {
      props: { modelValue: [], users: [], emptyMessage: "暂无可选用户" },
    });
    await openPanel(empty);
    expect(document.querySelector(".mw-ms-empty")?.textContent).toBe("暂无可选用户");
  });

  it("同名用户按 id 区分并正确折叠", async () => {
    const wrapper = mountUiComponent(UserSelect, {
      props: { modelValue: ["u-zhang", "u-wang"], users },
    });
    await nextTick();
    await nextTick();

    expect(wrapper.findAll(".mw-ms-label .mw-user-select__chip")).toHaveLength(1);
    expect(wrapper.find(".mw-ms-chip-more").text()).toBe("+1");
    expect(wrapper.findAll(".mw-ms-measure .mw-user-select__chip")).toHaveLength(2);
  });
});
