import { nextTick } from "vue";
import { afterEach, describe, expect, it } from "vitest";

import { mountUiComponent } from "../../test-utils/mount.js";
import SiteHeader from "./SiteHeader.vue";

let mounted: ReturnType<typeof mountUiComponent> | null = null;

afterEach(() => {
  mounted?.unmount();
  mounted = null;
  document.body.innerHTML = "";
  document.body.style.overflow = "";
});

describe("SiteHeader mobile navigation", () => {
  it("使用宿主标签，打开聚焦首项，Escape 关闭并归还焦点", async () => {
    document.body.style.overflow = "auto";
    mounted = mountUiComponent(SiteHeader, {
      attachTo: document.body,
      props: {
        items: [
          { label: "Library", href: "/library" },
          { label: "Writer", href: "/writer" },
        ],
        navigationLabel: "主导航",
        menuLabel: "站点菜单",
        showTheme: false,
      },
    });
    const burger = mounted.get("button.mw-site-header__burger");
    expect(burger.attributes("aria-label")).toBe("站点菜单");

    await burger.trigger("click");
    await nextTick();
    const drawer = mounted.get(".mw-site-header__drawer");
    expect(drawer.attributes("role")).toBe("dialog");
    expect(drawer.attributes("aria-label")).toBe("站点菜单");
    expect(drawer.get("nav").attributes("aria-label")).toBe("主导航");
    expect(document.body.style.overflow).toBe("hidden");
    expect((document.activeElement as HTMLElement).textContent).toBe("Library");

    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    await nextTick();
    expect(mounted.find(".mw-site-header__drawer").exists()).toBe(false);
    expect(document.body.style.overflow).toBe("auto");
    expect(document.activeElement).toBe(burger.element);
  });

  it("菜单内 Tab 在首尾循环", async () => {
    mounted = mountUiComponent(SiteHeader, {
      attachTo: document.body,
      props: {
        items: [
          { label: "Library", href: "/library" },
          { label: "Writer", href: "/writer" },
        ],
        showTheme: false,
      },
    });
    await mounted.get("button.mw-site-header__burger").trigger("click");
    await nextTick();
    const links = mounted.findAll(".mw-site-header__drawer-link");
    (links.at(-1)?.element as HTMLElement).focus();

    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Tab", bubbles: true }));
    expect(document.activeElement).toBe(links[0]?.element);
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Tab", shiftKey: true, bubbles: true }));
    expect(document.activeElement).toBe(links.at(-1)?.element);
  });
});
