import { act, fireEvent, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { setTheme } from "../../lib/theme";
import SiteHeader from "./SiteHeader";

afterEach(() => {
  document.body.style.overflow = "";
});

describe("SiteHeader", () => {
  it("使用宿主标签，打开移动抽屉聚焦首项，Escape 关闭并归还焦点", () => {
    document.body.style.overflow = "auto";

    const { container } = render(
      <SiteHeader
        items={[
          { label: "Library", href: "/library", active: true },
          { label: "Writer", href: "/writer" },
        ]}
        navigationLabel="主导航"
        menuLabel="站点菜单"
        showTheme={false}
      />,
    );

    const activeDesktopLink = container.querySelector(
      ".mw-site-header__link.active",
    )!;
    expect(activeDesktopLink.getAttribute("aria-current")).toBe("page");

    const burger = container.querySelector<HTMLButtonElement>(
      "button.mw-site-header__burger",
    )!;
    expect(burger.getAttribute("aria-label")).toBe("站点菜单");

    fireEvent.click(burger);
    const drawer = container.querySelector(".mw-site-header__drawer")!;
    expect(drawer.getAttribute("role")).toBe("dialog");
    expect(drawer.getAttribute("aria-label")).toBe("站点菜单");
    expect(drawer.querySelector("nav")?.getAttribute("aria-label")).toBe("主导航");
    expect(document.body.style.overflow).toBe("hidden");
    expect((document.activeElement as HTMLElement)?.textContent).toBe("Library");
    expect(document.body.querySelector(".mw-site-header__scrim")).not.toBeNull();

    act(() => {
      document.dispatchEvent(
        new KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
      );
    });
    expect(container.querySelector(".mw-site-header__drawer")).toBeNull();
    expect(document.body.style.overflow).toBe("auto");
    expect(document.activeElement).toBe(burger);
  });

  it("菜单内 Tab 在首尾循环，支持主题切换、语言切换与动作区", () => {
    setTheme("light", { animate: false });
    const onToggleLang = vi.fn();

    const { container } = render(
      <SiteHeader
        items={[
          { label: "Library", href: "/library" },
          { label: "Writer", href: "/writer" },
        ]}
        showTheme={false}
        showLang
        langLabel="EN"
        langTitle="切换语言"
        onToggleLang={onToggleLang}
        actions={<a href="/login" className="desktop-action">登录</a>}
      />,
    );

    expect(container.querySelector(".desktop-action")?.textContent).toBe("登录");
    fireEvent.click(container.querySelector(".mw-site-header__lang")!);
    expect(onToggleLang).toHaveBeenCalledTimes(1);

    fireEvent.click(container.querySelector("button.mw-site-header__burger")!);
    const focusables = Array.from(
      container.querySelectorAll<HTMLElement>(
        '.mw-site-header__drawer a[href], .mw-site-header__drawer button:not([disabled])',
      ),
    );
    const first = focusables[0]!;
    const last = focusables.at(-1)!;
    last.focus();

    act(() => {
      document.dispatchEvent(
        new KeyboardEvent("keydown", { key: "Tab", bubbles: true }),
      );
    });
    expect(document.activeElement).toBe(first);

    act(() => {
      document.dispatchEvent(
        new KeyboardEvent("keydown", {
          key: "Tab",
          shiftKey: true,
          bubbles: true,
        }),
      );
    });
    expect(document.activeElement).toBe(last);

    const themeView = render(<SiteHeader showTheme />);
    const themeBtn = themeView.container.querySelector<HTMLButtonElement>(
      ".mw-site-header__theme-btn",
    )!;
    expect(themeBtn.getAttribute("data-theme-state")).toBe("light");
    fireEvent.click(themeBtn);
    expect(themeBtn.getAttribute("data-theme-state")).toBe("dark");
    setTheme("light", { animate: false });
  });
});
