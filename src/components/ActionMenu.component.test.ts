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
    const disabled = document.querySelector(".p-contextmenu-item.p-disabled .mw-action-menu__item");
    expect(disabled?.textContent).toContain("不可用");
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

    const item = document.querySelector<HTMLElement>(".p-contextmenu-item.p-disabled .mw-action-menu__item");
    item?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
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
});
