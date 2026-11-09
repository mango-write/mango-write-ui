// @vitest-environment happy-dom
// 主题偏好 store 的宿主配置面：默认行为与 MangoWrite 两站现状一致（键
// mango-write:theme、属性落 <html>）；initTheme 传 options 后按宿主的键与根
// 元素读写——模块状态跨用例共享，用例按序覆盖推进。
import { beforeEach, describe, expect, it } from "vitest";

import { initTheme, useThemePreference } from "./theme";

describe("theme 宿主配置", () => {
  beforeEach(() => {
    window.localStorage.clear();
    delete document.documentElement.dataset.theme;
  });

  it("默认：读 mango-write:theme，data-theme 落 documentElement", () => {
    window.localStorage.setItem("mango-write:theme", "dark");
    initTheme();
    const { preference, resolved } = useThemePreference();
    expect(preference.value).toBe("dark");
    expect(resolved.value).toBe("dark");
    expect(document.documentElement.dataset.theme).toBe("dark");
  });

  it("自定义 storageKey：换键后按新键重读，setTheme 也写新键", () => {
    window.localStorage.setItem("host-a:theme", "light");
    window.localStorage.setItem("mango-write:theme", "dark");
    initTheme({ storageKey: "host-a:theme" });
    const { preference, setTheme } = useThemePreference();
    expect(preference.value).toBe("light");
    setTheme("dark");
    expect(window.localStorage.getItem("host-a:theme")).toBe("dark");
  });

  it("自定义 rootEl：属性落到宿主指定的元素", () => {
    const host = document.createElement("div");
    document.body.append(host);
    initTheme({ rootEl: () => host });
    const { setTheme } = useThemePreference();
    setTheme("light");
    expect(host.dataset.theme).toBe("light");
    expect(document.documentElement.dataset.theme).toBeUndefined();
  });

  it("支持 startViewTransition 时：传入坐标触发径向揭幕并在结束后清理属性", async () => {
    initTheme({
      storageKey: "mango-write:theme",
      rootEl: () => document.documentElement,
    });
    const { setTheme, toggleTheme, resolved } = useThemePreference();
    setTheme("light", { animate: false });
    expect(document.documentElement.dataset.theme).toBe("light");

    let resolveFinished!: () => void;
    const finished = new Promise<void>((r) => {
      resolveFinished = r;
    });
    const docWithVT = document as unknown as {
      startViewTransition?: (cb: () => void) => {
        ready: Promise<void>;
        finished: Promise<void>;
        skipTransition: () => void;
      };
    };
    const prevVT = docWithVT.startViewTransition;
    let capturedBeforeCallback: string | undefined;
    docWithVT.startViewTransition = (cb: () => void) => {
      capturedBeforeCallback = document.documentElement.dataset.theme;
      cb();
      return {
        ready: Promise.resolve(),
        finished,
        skipTransition: () => {},
      };
    };

    try {
      const next = toggleTheme({ clientX: 120, clientY: 40 });
      expect(next).toBe("dark");
      expect(resolved.value).toBe("dark");
      expect(capturedBeforeCallback).toBe("light");
      expect(document.documentElement.dataset.theme).toBe("dark");
      expect(document.documentElement.dataset.themeTransition).toBe("radial");
      expect(document.documentElement.style.getPropertyValue("--mw-vt-x")).toBe("120px");
      expect(document.documentElement.style.getPropertyValue("--mw-vt-y")).toBe("40px");
      expect(document.documentElement.style.getPropertyValue("--mw-vt-r")).toMatch(/^\d+px$/);

      resolveFinished();
      await finished;
      await Promise.resolve();
      expect(document.documentElement.dataset.themeTransition).toBeUndefined();
      expect(document.documentElement.style.getPropertyValue("--mw-vt-x")).toBe("");
    } finally {
      docWithVT.startViewTransition = prevVT;
    }
  });
});
