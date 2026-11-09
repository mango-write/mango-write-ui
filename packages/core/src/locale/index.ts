// 只取 mergeLocaleMessage 一个面：vue-i18n 的 I18n<Messages> 泛型按宿主消息
// 表实例化，直接收 I18n 会因泛型不变而拒收各宿主的实例。
export interface I18nWithMerge {
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
    select: { noMatch: string; empty: string; clear: string; remove: string; searching: string };
    userSelect: { placeholder: string; empty: string };
    async: { loading: string; errorTitle: string; retry: string };
    action: { close: string };
    dialog: { maximize: string; restore: string };
    confirm: { title: string; accept: string; reject: string };
    lightbox: {
      zoomIn: string;
      zoomOut: string;
      rotateLeft: string;
      rotateRight: string;
      reset: string;
      imageAlt: string;
    };
    calendar: {
      chooseDate: string;
      prevMonth: string;
      nextMonth: string;
      prevYear: string;
      nextYear: string;
      today: string;
      backToToday: string;
      clear: string;
    };
    admin: {
      unsaved: string;
      save: string;
      saving: string;
      confirmSaveHeader: string;
      leaveHeader: string;
      leaveConfirm: string;
      back: string;
    };
  };
}

export type UiLocaleSource = "zh-CN" | "en-US";

export const uiMessages: Record<UiLocaleSource, UiMessages> = {
  "zh-CN": {
    common: {
      select: {
        noMatch: "无匹配项",
        empty: "暂无可选项",
        clear: "清除选择",
        remove: "移除 {label}",
        searching: "正在搜索…",
      },
      userSelect: { placeholder: "搜索并选择用户", empty: "没有可选用户" },
      async: { loading: "正在加载", errorTitle: "加载失败", retry: "重试" },
      action: { close: "关闭" },
      dialog: { maximize: "最大化", restore: "还原" },
      confirm: { title: "确认操作", accept: "确定", reject: "取消" },
      lightbox: {
        zoomIn: "放大",
        zoomOut: "缩小",
        rotateLeft: "向左旋转",
        rotateRight: "向右旋转",
        reset: "复位",
        imageAlt: "图片",
      },
      calendar: {
        chooseDate: "选择日期",
        prevMonth: "上个月",
        nextMonth: "下个月",
        prevYear: "上一年",
        nextYear: "下一年",
        today: "今天",
        backToToday: "回到今天",
        clear: "清除",
      },
      admin: {
        unsaved: "{count} 项未保存",
        save: "保存",
        saving: "保存中…",
        confirmSaveHeader: "确认保存",
        leaveHeader: "放弃未保存的修改",
        leaveConfirm: "当前有 {count} 项修改未保存，离开将丢失。",
        back: "返回",
      },
    },
  },
  "en-US": {
    common: {
      select: {
        noMatch: "No matches",
        empty: "No options",
        clear: "Clear selection",
        remove: "Remove {label}",
        searching: "Searching…",
      },
      userSelect: { placeholder: "Search and select users", empty: "No users available" },
      async: { loading: "正在加载", errorTitle: "Failed to load", retry: "Retry" },
      action: { close: "Close" },
      dialog: { maximize: "Maximize", restore: "Restore" },
      confirm: { title: "Confirm", accept: "Confirm", reject: "Cancel" },
      lightbox: {
        zoomIn: "Zoom in",
        zoomOut: "Zoom out",
        rotateLeft: "Rotate left",
        rotateRight: "Rotate right",
        reset: "Reset",
        imageAlt: "Image",
      },
      calendar: {
        chooseDate: "Choose date",
        prevMonth: "Previous month",
        nextMonth: "Next month",
        prevYear: "Previous year",
        nextYear: "Next year",
        today: "Today",
        backToToday: "Back to today",
        clear: "Clear",
      },
      admin: {
        unsaved: "{count} unsaved",
        save: "Save",
        saving: "Saving…",
        confirmSaveHeader: "Confirm save",
        leaveHeader: "Discard unsaved changes",
        leaveConfirm: "You have {count} unsaved changes that will be lost if you leave.",
        back: "Back",
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
