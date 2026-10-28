// 只取 mergeLocaleMessage 一个面：vue-i18n 的 I18n<Messages> 泛型按宿主消息
// 表实例化，直接收 I18n 会因泛型不变而拒收各宿主的实例。
interface I18nWithMerge {
  global: {
    mergeLocaleMessage(locale: string, message: unknown): void;
  };
}

// ui 包组件依赖的文案自持（SearchableSelect/SearchableMultiSelect 的 noMatch、
// ImageLightbox 的工具栏），键挂在宿主的 `common.*` 命名空间下。宿主在 i18n
// 装配处调 mergeUiMessages 合并；幂等，宿主 en 懒加载整包 setLocaleMessage
// 覆盖后需重挂。
export interface UiMessages {
  common: {
    select: { noMatch: string; clear: string; remove: string };
    async: { loading: string; errorTitle: string; retry: string };
    action: { close: string };
    lightbox: {
      zoomIn: string;
      zoomOut: string;
      rotateLeft: string;
      rotateRight: string;
      reset: string;
      imageAlt: string;
    };
  };
}

export type UiLocaleSource = "zh-CN" | "en-US";

export const uiMessages: Record<UiLocaleSource, UiMessages> = {
  "zh-CN": {
    common: {
      select: { noMatch: "无匹配项", clear: "清除选择", remove: "移除 {label}" },
      async: { loading: "正在加载", errorTitle: "加载失败", retry: "重试" },
      action: { close: "关闭" },
      lightbox: {
        zoomIn: "放大",
        zoomOut: "缩小",
        rotateLeft: "向左旋转",
        rotateRight: "向右旋转",
        reset: "复位",
        imageAlt: "图片",
      },
    },
  },
  "en-US": {
    common: {
      select: { noMatch: "No matches", clear: "Clear selection", remove: "Remove {label}" },
      async: { loading: "Loading", errorTitle: "Failed to load", retry: "Retry" },
      action: { close: "Close" },
      lightbox: {
        zoomIn: "Zoom in",
        zoomOut: "Zoom out",
        rotateLeft: "Rotate left",
        rotateRight: "Rotate right",
        reset: "Reset",
        imageAlt: "Image",
      },
    },
  },
};

// 宿主 locale 代号不一（web 用 zh/en，rewrite/auth 用 zh-CN/en）；默认按
// rewrite/auth 口径，apps/web 传 { zh: "zh" }。
export function mergeUiMessages(
  i18n: I18nWithMerge,
  localeCodes?: { zh?: string; en?: string },
): void {
  i18n.global.mergeLocaleMessage(localeCodes?.zh ?? "zh-CN", uiMessages["zh-CN"]);
  i18n.global.mergeLocaleMessage(localeCodes?.en ?? "en", uiMessages["en-US"]);
}
