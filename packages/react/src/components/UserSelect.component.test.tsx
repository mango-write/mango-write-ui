import { fireEvent, render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import UserSelect from "./UserSelect";
import type { UserSelectOption } from "./user-select";

const users: UserSelectOption[] = [
  { id: "u-zhang", name: "张三", email: "zhang.san@mango.write", avatar: null },
  { id: "u-li", name: "李四", email: "li.si@mango.write", avatar: null },
  {
    id: "u-wang",
    name: "张三",
    email: "zhang.san+2@mango.write",
    avatar: null,
  },
];

function panelOptions(): HTMLElement[] {
  return Array.from(document.querySelectorAll<HTMLElement>(".mw-ms-option"));
}

describe("UserSelect", () => {
  it("选中项渲染 UserChip，移除按 id 触发 onValueChange", () => {
    const onValueChange = vi.fn();
    const { container } = render(
      <UserSelect
        value={["u-zhang"]}
        users={users}
        onValueChange={onValueChange}
      />,
    );

    const chip = container.querySelector(".mw-user-select__chip")!;
    expect(chip).not.toBeNull();
    expect(chip.querySelector(".mw-user-chip__tag")).not.toBeNull();
    expect(chip.textContent).toContain("张三");
    expect(
      chip.querySelector(".mw-user-chip")?.hasAttribute("tabindex"),
    ).toBe(false);

    fireEvent.mouseDown(container.querySelector(".mw-user-select__remove")!);
    expect(onValueChange).toHaveBeenCalledWith([]);
  });

  it("选项展示头像、姓名与邮箱，点选按 id 发值", () => {
    const onValueChange = vi.fn();
    const { container } = render(
      <UserSelect value={[]} users={users} onValueChange={onValueChange} />,
    );

    fireEvent.focus(container.querySelector(".mw-ms-input")!);

    const options = panelOptions();
    expect(options).toHaveLength(3);
    expect(options[0]?.querySelector(".mw-user-chip__avatar-only")).not.toBeNull();
    expect(options[0]?.textContent).toContain("zhang.san@mango.write");

    fireEvent.mouseDown(options[1]!);
    expect(onValueChange).toHaveBeenCalledWith(["u-li"]);
  });

  it("按姓名和邮箱过滤，默认空态由 UI 国际化词表提供", () => {
    const { container } = render(<UserSelect value={[]} users={users} />);
    const input = container.querySelector<HTMLInputElement>(".mw-ms-input")!;
    fireEvent.focus(input);

    fireEvent.change(input, { target: { value: "zhang.san+2" } });
    expect(panelOptions()).toHaveLength(1);

    fireEvent.change(input, { target: { value: "张三" } });
    expect(panelOptions()).toHaveLength(2);

    fireEvent.change(input, { target: { value: "nobody" } });
    expect(panelOptions()).toHaveLength(0);
    expect(document.querySelector(".mw-ms-empty")?.textContent).toBe(
      "没有可选用户",
    );
  });

  it("disabled 与自定义 emptyMessage 分别生效", () => {
    const disabledView = render(
      <UserSelect
        value={[]}
        users={[]}
        disabled
        emptyMessage="暂无可选用户"
      />,
    );
    expect(
      disabledView.container
        .querySelector<HTMLInputElement>(".mw-ms-input")
        ?.disabled,
    ).toBe(true);

    const emptyView = render(
      <UserSelect value={[]} users={[]} emptyMessage="暂无可选用户" />,
    );
    fireEvent.focus(emptyView.container.querySelector(".mw-ms-input")!);
    expect(document.querySelector(".mw-ms-empty")?.textContent).toBe(
      "暂无可选用户",
    );
  });

  it("同名用户按 id 区分并正确折叠为 +1", () => {
    const { container } = render(
      <UserSelect value={["u-zhang", "u-wang"]} users={users} />,
    );

    expect(
      container.querySelectorAll(".mw-ms-label .mw-user-select__chip"),
    ).toHaveLength(1);
    expect(container.querySelector(".mw-ms-chip-more")?.textContent).toBe("+1");
    expect(
      container.querySelectorAll(".mw-ms-measure .mw-user-select__chip"),
    ).toHaveLength(2);
  });
});
