import { useRef } from "react";
import { act, fireEvent, render } from "@testing-library/react";
import { Settings, Trash2, User } from "lucide-react";
import { describe, expect, it, vi } from "vitest";
import Menu, { type MenuHandle, type MenuItem } from "./Menu";

describe("Menu", () => {
  it("renders inline menu items, groups, icons, shortcuts, danger items, and separators", () => {
    const commandSpy = vi.fn();
    const model: MenuItem[] = [
      { label: "Profile", icon: User, shortcut: "⌘P", command: commandSpy },
      { separator: true },
      {
        label: "Workspace",
        items: [
          { label: "Settings", icon: Settings },
          { label: "Disabled Item", disabled: true },
          { label: "Delete Workspace", icon: Trash2, danger: true },
          { label: "Hidden Item", visible: false },
        ],
      },
    ];

    const { container } = render(<Menu model={model} ariaLabel="Main menu" />);

    const root = container.querySelector(".mw-menu")!;
    expect(root).not.toBeNull();
    expect(root.classList.contains("mw-menu--popup")).toBe(false);
    expect(container.querySelector(".mw-menu__list")?.getAttribute("aria-label")).toBe(
      "Main menu",
    );

    const links = container.querySelectorAll(".mw-menu__item-link");
    expect(links).toHaveLength(4);
    expect(links[0]!.textContent).toContain("Profile");
    expect(container.querySelector(".mw-menu__item-shortcut")?.textContent).toBe("⌘P");
    expect(links[2]!.getAttribute("aria-disabled")).toBe("true");
    expect(container.querySelector(".mw-menu__item--danger")?.textContent).toContain(
      "Delete Workspace",
    );
    expect(container.querySelector(".mw-menu__separator")).not.toBeNull();
    expect(container.querySelector(".mw-menu__submenu-label")?.textContent).toBe("Workspace");
  });

  it("invokes command via click and keyboard navigation, skipping disabled items", () => {
    const firstCmd = vi.fn();
    const disabledCmd = vi.fn();
    const lastCmd = vi.fn();
    const model: MenuItem[] = [
      { label: "First", command: firstCmd },
      { label: "Locked", disabled: () => true, command: disabledCmd },
      { label: "Last", command: lastCmd },
    ];

    const { container } = render(<Menu model={model} />);
    const links = container.querySelectorAll(".mw-menu__item-link");

    fireEvent.click(links[1]!);
    expect(disabledCmd).not.toHaveBeenCalled();

    const menuRoot = container.querySelector(".mw-menu")!;
    // ArrowDown -> First (index 0), ArrowDown again -> skips Locked -> Last (index 2), Enter -> invokes lastCmd
    fireEvent.keyDown(menuRoot, { key: "ArrowDown" });
    fireEvent.keyDown(menuRoot, { key: "ArrowDown" });
    fireEvent.keyDown(menuRoot, { key: "Enter" });

    expect(firstCmd).not.toHaveBeenCalled();
    expect(lastCmd).toHaveBeenCalledTimes(1);
  });

  it("supports start, end, renderSubmenuLabel, and renderItem slots", () => {
    const commandSpy = vi.fn();
    const model: MenuItem[] = [
      {
        label: "Group",
        items: [{ label: "Custom Action", badge: "PRO", command: commandSpy }],
      },
    ];

    const { container } = render(
      <Menu
        model={model}
        start={<div className="slot-start">Header</div>}
        end={<div className="slot-end">Footer</div>}
        renderSubmenuLabel={({ label }) => <span className="slot-submenu">{label}!</span>}
        renderItem={({ item, label, props }) => (
          <a {...props.action} className="slot-item-link">
            <span>{label}</span>
            <em className="slot-badge">{String(item.badge)}</em>
          </a>
        )}
      />,
    );

    expect(container.querySelector(".slot-start")?.textContent).toBe("Header");
    expect(container.querySelector(".slot-end")?.textContent).toBe("Footer");
    expect(container.querySelector(".slot-submenu")?.textContent).toBe("Group!");
    expect(container.querySelector(".slot-badge")?.textContent).toBe("PRO");

    fireEvent.click(container.querySelector(".slot-item-link")!);
    expect(commandSpy).toHaveBeenCalledTimes(1);
  });

  it("supports popup={true} with imperative ref.toggle(event), dynamic useOverlayZIndex, and Escape close", () => {
    const commandSpy = vi.fn();
    const model: MenuItem[] = [{ label: "Delete", danger: true, command: commandSpy }];
    let handle: MenuHandle | null = null;

    function Demo() {
      const menuRef = useRef<MenuHandle | null>(null);
      return (
        <div>
          <button
            type="button"
            className="popup-anchor"
            onClick={(e) => menuRef.current?.toggle(e)}
          >
            More
          </button>
          <Menu
            ref={(inst) => {
              menuRef.current = inst;
              handle = inst;
            }}
            model={model}
            popup={true}
            appendTo="self"
          />
        </div>
      );
    }

    const { container } = render(<Demo />);
    expect(container.querySelector(".mw-menu--popup")).toBeNull();

    const anchor = container.querySelector<HTMLButtonElement>(".popup-anchor")!;
    fireEvent.click(anchor);

    const popupEl = container.querySelector<HTMLElement>(".mw-menu--popup")!;
    expect(popupEl).not.toBeNull();
    expect(popupEl.classList.contains("mw-frost")).toBe(true);
    expect(popupEl.style.zIndex).toMatch(/^calc\(var\(--z-overlay\)\s*\+\s*\d+\)$/);

    fireEvent.click(container.querySelector(".mw-menu__item-link")!);
    expect(commandSpy).toHaveBeenCalledTimes(1);
    expect(container.querySelector(".mw-menu--popup")).toBeNull();

    act(() => {
      handle?.show(null, anchor);
    });
    expect(container.querySelector(".mw-menu--popup")).not.toBeNull();

    act(() => {
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    });
    expect(container.querySelector(".mw-menu--popup")).toBeNull();
  });
});
