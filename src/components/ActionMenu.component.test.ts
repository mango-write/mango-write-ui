import { afterEach, describe, expect, it, vi } from "vitest";
import { nextTick } from "vue";
import ActionMenu from "./ActionMenu.vue";
import type { ActionMenuItem } from "./action-menu";
import { mountUiComponent } from "../test-utils/mount";
import { vTooltip } from "../lib/tooltip";

afterEach(() => {
  document.body.innerHTML = "";
});

async function mountMenu(items: ActionMenuItem[]) {
  const wrapper = mountUiComponent(ActionMenu, {
    props: { items },
    global: { directives: { tooltip: vTooltip } },
  });
  await (wrapper.vm as unknown as { show(event: Event): void }).show(
    new MouseEvent("contextmenu", { clientX: 80, clientY: 80 }),
  );
  await nextTick();
  return wrapper;
}

describe("ActionMenu", () => {
  it("渲染快捷键、危险项和禁用原因", async () => {
    await mountMenu([
      { label: "打开", shortcut: "⌘O" },
      { label: "删除", danger: true },
      { label: "不可用", disabled: true, tooltip: "没有权限" },
    ]);

    expect(document.querySelector(".mw-action-menu__shortcut")?.textContent).toBe("⌘O");
    expect(document.querySelector(".mw-action-menu__item--danger")?.textContent).toContain("删除");
    const disabled = document.querySelector('.mw-action-menu__item[aria-disabled="true"]');
    expect(disabled?.textContent).toContain("不可用");
    expect(disabled?.hasAttribute("data-disabled")).toBe(true);
  });

  it("禁用项不执行命令也不展开子菜单", async () => {
    const command = vi.fn();
    await mountMenu([
      {
        label: "不可用",
        disabled: true,
        command,
        items: [{ label: "不应出现" }],
      },
    ]);

    const item = document.querySelector<HTMLElement>('.mw-action-menu__item[aria-disabled="true"]');
    item?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    item?.parentElement?.dispatchEvent(new MouseEvent("mouseenter", { bubbles: true }));
    await nextTick();

    expect(command).not.toHaveBeenCalled();
    expect(document.body.textContent).not.toContain("不应出现");
  });

  it("icon 插槽可按项目覆盖默认图标", async () => {
    const wrapper = mountUiComponent(ActionMenu, {
      props: { items: [{ label: "引用" }] },
      slots: { icon: '<svg class="custom-icon" />' },
      global: { directives: { tooltip: vTooltip } },
    });
    await (wrapper.vm as unknown as { show(event: Event): void }).show(
      new MouseEvent("contextmenu", { clientX: 80, clientY: 80 }),
    );
    await nextTick();

    expect(document.querySelector(".custom-icon")).not.toBeNull();
  });

  it("支持悬停与键盘 ArrowRight / ArrowLeft 展开和收起子菜单", async () => {
    const subCommand = vi.fn();
    await mountMenu([
      {
        label: "对齐方式",
        children: [
          { label: "左对齐", command: subCommand },
          { label: "居中对齐" },
        ],
      },
      { label: "复制" },
    ]);

    expect(document.querySelector(".mw-action-menu__submenu")).toBeNull();

    // 悬停展开子菜单
    const parentRow = document.querySelector<HTMLElement>(".mw-action-menu__row");
    parentRow?.dispatchEvent(new MouseEvent("mouseenter", { bubbles: true }));
    await nextTick();

    expect(document.querySelector(".mw-action-menu__submenu")).not.toBeNull();
    expect(document.body.textContent).toContain("左对齐");

    // ArrowLeft 收起子菜单并将焦点归还父菜单项
    const menu = document.querySelector<HTMLElement>(".mw-action-menu");
    menu?.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowLeft", bubbles: true }));
    await nextTick();

    expect(document.querySelector(".mw-action-menu__submenu")).toBeNull();
    const parentButton = document.querySelector<HTMLElement>(".mw-action-menu__item");
    expect(document.activeElement).toBe(parentButton);

    // ArrowRight 展开子菜单并聚焦首个子项，Enter 触发子项命令并关闭菜单
    menu?.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }));
    await nextTick();

    const submenu = document.querySelector<HTMLElement>(".mw-action-menu__submenu");
    expect(submenu).not.toBeNull();
    const firstSubItem = submenu?.querySelector<HTMLElement>(".mw-action-menu__item");
    expect(document.activeElement).toBe(firstSubItem);

    submenu?.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
    await nextTick();

    expect(subCommand).toHaveBeenCalledTimes(1);
    expect(document.querySelector(".mw-action-menu")).toBeNull();
  });

  it("支持键盘 ArrowDown / Enter 触发命令以及 Escape 关闭并派发 hide 事件", async () => {
    const firstCommand = vi.fn();
    const secondCommand = vi.fn();
    const trigger = document.createElement("button");
    trigger.textContent = "触发器";
    document.body.appendChild(trigger);
    trigger.focus();

    const wrapper = mountUiComponent(ActionMenu, {
      props: {
        items: [
          { label: "第一项", command: firstCommand },
          { separator: true },
          { label: "第二项", command: secondCommand },
        ],
      },
      global: { directives: { tooltip: vTooltip } },
    });

    const vm = wrapper.vm as unknown as {
      show(event: Event, target?: HTMLElement | null): void;
    };
    vm.show(new MouseEvent("click", { bubbles: true }), trigger);
    await nextTick();

    const menu = document.querySelector<HTMLElement>(".mw-action-menu");
    expect(menu).not.toBeNull();

    // ArrowDown 两次跳过分隔线聚焦到「第二项」，Enter 激活并关闭菜单
    menu?.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }));
    await nextTick();
    menu?.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }));
    await nextTick();
    menu?.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
    await nextTick();

    expect(firstCommand).not.toHaveBeenCalled();
    expect(secondCommand).toHaveBeenCalledTimes(1);
    expect(wrapper.emitted("hide")).toHaveLength(1);
    expect(document.querySelector(".mw-action-menu")).toBeNull();

    // 再次打开后按 Escape 关闭，触发 hide 并归还焦点到 trigger
    vm.show(new MouseEvent("click", { bubbles: true }), trigger);
    await nextTick();
    const reopenedMenu = document.querySelector<HTMLElement>(".mw-action-menu");
    expect(reopenedMenu).not.toBeNull();

    reopenedMenu?.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    await nextTick();

    expect(wrapper.emitted("hide")).toHaveLength(2);
    expect(document.querySelector(".mw-action-menu")).toBeNull();
    expect(document.activeElement).toBe(trigger);
  });
});
