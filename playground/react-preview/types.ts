import type { ReactNode } from "react";
import type { ConfirmStore, NotifyStore } from "@mango-write/ui-react";

export type PreviewSurface = "paper" | "frost";
export type PreviewTheme = "light" | "dark";
export type PreviewLocale = "zh-CN" | "en-US";
export type PreviewValue = string | number | boolean | undefined;
export type PreviewValues = Record<string, PreviewValue>;

export interface ReactPreviewContext {
  values: PreviewValues;
  setValue: (key: string, next: PreviewValue) => void;
  confirm: ConfirmStore;
  notify: NotifyStore;
  locale: PreviewLocale;
}

export type ReactEntryRenderer = (ctx: ReactPreviewContext) => ReactNode;

export interface ReactUsageSyncMessage {
  type: "mw-react-usage-sync";
  entry?: string;
  values?: PreviewValues;
  theme?: PreviewTheme;
  locale?: PreviewLocale;
}

export interface ReactUsageReadyMessage {
  type: "mw-react-usage-ready";
  entry: string;
  surface: PreviewSurface;
}

export interface ReactUsageValueMessage {
  type: "mw-react-usage-value";
  entry: string;
  surface: PreviewSurface;
  key: string;
  value: PreviewValue;
}

export interface ReactUsageResizeMessage {
  type: "mw-react-usage-resize";
  entry: string;
  surface: PreviewSurface;
  height: number;
  hasModal: boolean;
}
