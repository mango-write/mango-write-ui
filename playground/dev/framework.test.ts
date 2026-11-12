import { describe, expect, it } from "vitest";
import {
  FRAMEWORK_OPTIONS,
  FRAMEWORK_STORAGE_KEY,
  desktopFramework,
  setDesktopFramework,
} from "./framework";

describe("playground desktop framework state", () => {
  it("提供 Vue 与 React 两档选项且默认落在 vue 或已持久化值", () => {
    expect(FRAMEWORK_OPTIONS.map((o) => o.value)).toEqual(["vue", "react"]);
    expect(["vue", "react"]).toContain(desktopFramework.value);
  });

  it("切换 desktopFramework 同步更新响应式状态", async () => {
    setDesktopFramework("react");
    expect(desktopFramework.value).toBe("react");
    if (typeof localStorage !== "undefined" && typeof localStorage.getItem === "function") {
      await Promise.resolve();
      expect(localStorage.getItem(FRAMEWORK_STORAGE_KEY)).toBe("react");
    }

    setDesktopFramework("vue");
    expect(desktopFramework.value).toBe("vue");
  });
});
