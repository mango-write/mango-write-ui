import { createRef } from "react";
import { act, cleanup, fireEvent, render } from "@testing-library/react";
import { Copy } from "lucide-react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ActionMenu, type ActionMenuHandle, type ActionMenuItem } from "./ActionMenu";

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  document.body.innerHTML = "";
});

function mountMenu(items: ActionMenuItem[]) {
  const ref = createRef<ActionMenuHandle>();
  const utils = render(<ActionMenu ref={ref} items={items} />);
  act(() => {
    ref.current?.show(new MouseEvent("contextmenu", { clientX: 80, clientY: 96 }));
  });
  return { ...utils, ref };
}

describe("ActionMenu", () => {
  it("渲染快捷键、危险项，并在禁用项悬停时通过 Tooltip 展示 disabledReason", () => {
    vi.useFakeTimers();
    mountMenu([
      { label: "打开", shortcut: "⌘O", icon: Copy },
      { label: "删除", danger: true },
      { label: "归档", disabled: true, disabledReason: "当前角色没有归档权限" },
    ]);

    expect(document.querySelector(".mw-action-menu__shortcut")?.textContent).toBe("⌘O");
    expect(document.querySelector(".mw-action-menu__icon")).not.toBeNull();
    expect(document.querySelector(".mw-action-menu__item--danger")?.textContent).toContain("删除");

    const disabledBtn = document.querySelector<HTMLElement>(
      '.mw-action-menu__item[aria-disabled="true"]',
    );
    expect(disabledBtn?.textContent).toContain("归档");
    expect(disabledBtn?.hasAttribute("data-disabled")).toBe(true);

    fireEvent.mouseEnter(disabledBtn!);
    act(() => {
      vi.advanceTimersByTime(160);
    });

    const tooltip = document.querySelector('[role="tooltip"]');
    expect(tooltip?.textContent).toBe("当前角色没有归档权限");
  });

  it("禁用项不执行命令也不展开子菜单", () => {
    const command = vi.fn();
    mountMenu([
      {
        label: "不可用",
        disabled: true,
        command,
        items: [{ label: "不应出现" }],
      },
    ]);

    const item = document.querySelector<HTMLElement>(
      '.mw-action-menu__item[aria-disabled="true"]',
    );
    fireEvent.click(item!);
    fireEvent.mouseEnter(item!.parentElement!);

    expect(command).not.toHaveBeenCalled();
    expect(document.body.textContent).not.toContain("不应出现");
  });

  it("支持触发器锚点、右键 contextmenu 与 { x, y } 坐标定位及动态层级", () => {
    const ref = createRef<ActionMenuHandle>();
    const trigger = document.createElement("button");
    trigger.textContent = "更多";
    vi.spyOn(trigger, "getBoundingClientRect").mockReturnValue({
      left: 140,
      top: 50,
      right: 200,
      bottom: 82,
      width: 60,
      height: 32,
      x: 140,
      y: 50,
      toJSON: () => ({}),
    });
    document.body.appendChild(trigger);

    render(
      <ActionMenu
        ref={ref}
        items={[{ label: "复制" }]}
        renderIcon={() => <svg className="custom-icon" />}
      />,
    );

    act(() => {
      ref.current?.show({ x: 180, y: 220 });
    });
    const menuAtPoint = document.querySelector<HTMLElement>(".mw-action-menu");
    expect(menuAtPoint?.style.left).toBe("180px");
    expect(menuAtPoint?.style.top).toBe("220px");
    expect(menuAtPoint?.style.zIndex).toMatch(/^calc\(var\(--z-overlay\)\s*\+\s*\d+\)$/);
    expect(document.querySelector(".custom-icon")).not.toBeNull();

    act(() => {
      ref.current?.hide();
      ref.current?.show(new MouseEvent("click", { bubbles: true }), trigger);
    });
    const menuAtAnchor = document.querySelector<HTMLElement>(".mw-action-menu");
    expect(menuAtAnchor?.style.left).toBe("140px");
    expect(menuAtAnchor?.style.top).toBe("86px");

    act(() => {
      ref.current?.hide();
    });

    const ctxArea = render(
      <ActionMenu
        contextMenu
        items={[{ label: "粘贴" }]}
        trigger={<div data-testid="ctx-zone">右键区域</div>}
      />,
    );
    fireEvent.contextMenu(ctxArea.getByTestId("ctx-zone"), { clientX: 210, clientY: 165 });
    const ctxMenu = document.querySelector<HTMLElement>(".mw-action-menu");
    expect(ctxMenu?.style.left).toBe("210px");
    expect(ctxMenu?.style.top).toBe("165px");
  });

  it("支持多级嵌套子菜单悬停与全键盘上下左右穿梭", () => {
    const deepCommand = vi.fn();
    mountMenu([
      {
        label: "导出",
        children: [
          { label: "Markdown" },
          {
            label: "学术排版",
            items: [
              { label: "LaTeX 源码", command: deepCommand },
              { label: "PDF 预印本" },
            ],
          },
        ],
      },
      { label: "复制" },
    ]);

    expect(document.querySelector(".mw-action-menu__submenu")).toBeNull();

    const parentRow = document.querySelector<HTMLElement>(".mw-action-menu__row");
    fireEvent.mouseEnter(parentRow!);
    expect(document.querySelectorAll(".mw-action-menu__submenu")).toHaveLength(1);

    const rootMenu = document.querySelector<HTMLElement>(".mw-action-menu")!;
    fireEvent.keyDown(rootMenu, { key: "ArrowLeft" });
    expect(document.querySelector(".mw-action-menu__submenu")).toBeNull();
    const rootFirstBtn = rootMenu.querySelector<HTMLElement>(".mw-action-menu__item");
    expect(document.activeElement).toBe(rootFirstBtn);

    // ArrowRight 展开一级子菜单（聚焦「Markdown」）-> ArrowDown 到「学术排版」-> ArrowRight 展开二级子菜单（聚焦「LaTeX 源码」）
    fireEvent.keyDown(rootMenu, { key: "ArrowRight" });
    expect(document.querySelectorAll(".mw-action-menu__submenu")).toHaveLength(1);
    expect(document.activeElement?.textContent).toContain("Markdown");

    fireEvent.keyDown(rootMenu, { key: "ArrowDown" });
    expect(document.activeElement?.textContent).toContain("学术排版");

    fireEvent.keyDown(rootMenu, { key: "ArrowRight" });
    expect(document.querySelectorAll(".mw-action-menu__submenu")).toHaveLength(2);
    expect(document.activeElement?.textContent).toContain("LaTeX 源码");

    // ArrowLeft 退回一级子菜单「学术排版」，再 ArrowRight 重新进入二级子菜单并 Enter 执行
    fireEvent.keyDown(rootMenu, { key: "ArrowLeft" });
    expect(document.querySelectorAll(".mw-action-menu__submenu")).toHaveLength(1);
    expect(document.activeElement?.textContent).toContain("学术排版");

    fireEvent.keyDown(rootMenu, { key: "ArrowRight" });
    expect(document.activeElement?.textContent).toContain("LaTeX 源码");

    fireEvent.keyDown(rootMenu, { key: "Enter" });
    expect(deepCommand).toHaveBeenCalledTimes(1);
    expect(document.querySelector(".mw-action-menu")).toBeNull();
  });

  it("支持 ArrowDown 跳过分隔线、Enter 激活命令以及 Escape 关闭并归还焦点", () => {
    const firstCommand = vi.fn();
    const secondCommand = vi.fn();
    const onHide = vi.fn();

    const trigger = document.createElement("button");
    trigger.textContent = "触发器";
    document.body.appendChild(trigger);
    trigger.focus();

    const ref = createRef<ActionMenuHandle>();
    render(
      <ActionMenu
        ref={ref}
        onHide={onHide}
        items={[
          { label: "第一项", command: firstCommand },
          { separator: true },
          { label: "第二项", command: secondCommand },
        ]}
      />,
    );

    act(() => {
      ref.current?.show(new MouseEvent("click", { bubbles: true }), trigger);
    });

    const menu = document.querySelector<HTMLElement>(".mw-action-menu")!;
    fireEvent.keyDown(menu, { key: "ArrowDown" });
    fireEvent.keyDown(menu, { key: "ArrowDown" });
    fireEvent.keyDown(menu, { key: "Enter" });

    expect(firstCommand).not.toHaveBeenCalled();
    expect(secondCommand).toHaveBeenCalledTimes(1);
    expect(onHide).toHaveBeenCalledTimes(1);
    expect(document.querySelector(".mw-action-menu")).toBeNull();

    act(() => {
      ref.current?.show(new MouseEvent("click", { bubbles: true }), trigger);
    });
    const reopened = document.querySelector<HTMLElement>(".mw-action-menu")!;
    fireEvent.keyDown(reopened, { key: "Escape" });

    expect(onHide).toHaveBeenCalledTimes(2);
    expect(document.querySelector(".mw-action-menu")).toBeNull();
    expect(document.activeElement).toBe(trigger);
  });
});
