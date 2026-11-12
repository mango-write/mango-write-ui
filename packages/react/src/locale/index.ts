import {
  createContext,
  createElement,
  useContext,
  useMemo,
  type ReactElement,
  type ReactNode,
} from "react";
import {
  mergeUiMessages,
  uiMessages,
  type I18nWithMerge,
  type UiLocaleSource,
  type UiMessages,
} from "@mango-write/ui-core/locale";

export {
  mergeUiMessages,
  uiMessages,
  type I18nWithMerge,
  type UiLocaleSource,
  type UiMessages,
};

export type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends Record<string, unknown> ? DeepPartial<T[K]> : T[K];
};

export interface UiLocaleContextValue {
  locale: UiLocaleSource;
  messages: UiMessages;
  t: (key: string, params?: Record<string, string | number>, fallback?: string) => string;
}

export interface UiLocaleProviderProps {
  locale?: UiLocaleSource | "zh" | "en" | (string & {});
  messages?: DeepPartial<UiMessages>;
  translate?: (key: string, params?: Record<string, string | number>) => string | undefined;
  children?: ReactNode;
}

export function resolveUiLocaleSource(locale?: string): UiLocaleSource {
  if (locale && locale.toLowerCase().startsWith("en")) {
    return "en-US";
  }
  return "zh-CN";
}

export function formatUiMessage(
  template: string,
  params?: Record<string, string | number>,
): string {
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (match, key: string) => {
    const val = params[key];
    return val === undefined ? match : String(val);
  });
}

function mergePartialUiMessages(
  base: UiMessages,
  patch?: DeepPartial<UiMessages>,
): UiMessages {
  if (!patch?.common) return base;
  const c = patch.common;
  return {
    common: {
      select: { ...base.common.select, ...c.select },
      userSelect: { ...base.common.userSelect, ...c.userSelect },
      async: { ...base.common.async, ...c.async },
      action: { ...base.common.action, ...c.action },
      dialog: { ...base.common.dialog, ...c.dialog },
      confirm: { ...base.common.confirm, ...c.confirm },
      lightbox: { ...base.common.lightbox, ...c.lightbox },
      calendar: { ...base.common.calendar, ...c.calendar },
      admin: { ...base.common.admin, ...c.admin },
    },
  };
}

function lookupUiMessage(messages: UiMessages, key: string): string | undefined {
  const normalized = key.startsWith("common.") ? key : `common.${key}`;
  const parts = normalized.split(".");
  let cursor: unknown = messages;
  for (const part of parts) {
    if (cursor && typeof cursor === "object" && part in (cursor as Record<string, unknown>)) {
      cursor = (cursor as Record<string, unknown>)[part];
    } else {
      return undefined;
    }
  }
  return typeof cursor === "string" ? cursor : undefined;
}

function createLocaleValue(
  localeInput?: string,
  messagesPatch?: DeepPartial<UiMessages>,
  translate?: (key: string, params?: Record<string, string | number>) => string | undefined,
): UiLocaleContextValue {
  const locale = resolveUiLocaleSource(localeInput);
  const messages = mergePartialUiMessages(uiMessages[locale], messagesPatch);

  const t = (
    key: string,
    params?: Record<string, string | number>,
    fallback?: string,
  ): string => {
    if (translate) {
      const external = translate(key, params);
      if (external && external !== key) {
        return formatUiMessage(external, params);
      }
    }
    const found = lookupUiMessage(messages, key);
    if (found !== undefined) {
      return formatUiMessage(found, params);
    }
    return formatUiMessage(fallback ?? key, params);
  };

  return { locale, messages, t };
}

const DEFAULT_LOCALE_VALUE: UiLocaleContextValue = createLocaleValue("zh-CN");

export const UiLocaleContext = createContext<UiLocaleContextValue>(DEFAULT_LOCALE_VALUE);

export function UiLocaleProvider({
  locale,
  messages,
  translate,
  children,
}: UiLocaleProviderProps): ReactElement {
  const value = useMemo(
    () => createLocaleValue(locale, messages, translate),
    [locale, messages, translate],
  );
  return createElement(UiLocaleContext.Provider, { value }, children);
}

export function useUiLocale(): UiLocaleContextValue {
  return useContext(UiLocaleContext);
}
