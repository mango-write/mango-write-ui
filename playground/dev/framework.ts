import { ref, watch } from "vue";

export type DesktopFramework = "vue" | "react";

export const FRAMEWORK_STORAGE_KEY = "mw-doc-framework";

export const FRAMEWORK_OPTIONS = [
  { label: "Vue", value: "vue" },
  { label: "React", value: "react" },
] as const;

function parseFramework(raw: string | null | undefined): DesktopFramework | null {
  if (raw === "vue" || raw === "react") return raw;
  return null;
}

function initialDesktopFramework(): DesktopFramework {
  if (typeof window !== "undefined") {
    try {
      const fromUrl = parseFramework(new URLSearchParams(window.location.search).get("fw"));
      if (fromUrl) {
        try {
          localStorage.setItem(FRAMEWORK_STORAGE_KEY, fromUrl);
        } catch {
          // 隐私模式无法写入存储时仅作用于当前会话
        }
        return fromUrl;
      }
    } catch {
      // URL 解析异常回落存储读取
    }
    try {
      const fromStorage = parseFramework(localStorage.getItem(FRAMEWORK_STORAGE_KEY));
      if (fromStorage) return fromStorage;
    } catch {
      // 存储不可用时回落默认值
    }
  }
  return "vue";
}

export const desktopFramework = ref<DesktopFramework>(initialDesktopFramework());

watch(desktopFramework, (next) => {
  try {
    localStorage.setItem(FRAMEWORK_STORAGE_KEY, next);
  } catch {
    // 存储不可用时仅在内存保持
  }
});

export function setDesktopFramework(next: DesktopFramework): void {
  if (next === "vue" || next === "react") {
    desktopFramework.value = next;
  }
}
