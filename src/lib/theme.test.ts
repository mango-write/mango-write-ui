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
});
