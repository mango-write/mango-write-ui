import { StrictMode, useCallback, useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import "@mango-write/ui-core/tokens.css";
import "@mango-write/ui-core/base.css";
import "@mango-write/ui-core/components.css";
import "./react-preview.css";
import {
  ConfirmHost,
  ConfirmProvider,
  NotifyProvider,
  ToastHost,
  UiLocaleProvider,
  useConfirm,
  useNotify,
} from "@mango-write/ui-react";
import { renderReactUsageEntry } from "./entries";
import type {
  PreviewLocale,
  PreviewSurface,
  PreviewTheme,
  PreviewValue,
  PreviewValues,
  ReactUsageReadyMessage,
  ReactUsageResizeMessage,
  ReactUsageSyncMessage,
  ReactUsageValueMessage,
} from "./types";

function parseInitialParams() {
  const params = new URLSearchParams(window.location.search);
  const entry = params.get("entry") || "button";
  const surface: PreviewSurface = params.get("surface") === "frost" ? "frost" : "paper";
  const theme: PreviewTheme = params.get("theme") === "dark" ? "dark" : "light";
  const locale: PreviewLocale = params.get("locale") === "en-US" ? "en-US" : "zh-CN";
  return { entry, surface, theme, locale };
}

function applyDocumentThemeAndLocale(theme: PreviewTheme, locale: PreviewLocale) {
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
  document.documentElement.lang = locale;
}

const FLOATING_PORTAL_SELECTOR = [
  "[data-radix-popper-content-wrapper]",
  ".mw-combo-panel",
  ".mw-select-panel",
  ".mw-multiselect-panel",
  ".mw-datepicker-panel",
  ".mw-colorpicker-panel",
  ".mw-popover",
  ".mw-action-menu__panel",
  ".mw-hover-card__panel",
  ".mw-tooltip",
  ".mw-toast",
].join(", ");

const MODAL_PORTAL_SELECTOR = [
  ".mw-dialog",
  ".mw-lightbox",
  ".mw-confirm",
  '[role="dialog"][data-state="open"]',
  '[role="alertdialog"][data-state="open"]',
].join(", ");

function measureRequiredHeight(rootEl: HTMLElement | null): { height: number; hasModal: boolean } {
  const baseHeight = rootEl ? Math.ceil(rootEl.getBoundingClientRect().height) : 128;
  let maxBottom = baseHeight;
  let hasModal = false;

  for (const modal of document.querySelectorAll<HTMLElement>(MODAL_PORTAL_SELECTOR)) {
    const style = window.getComputedStyle(modal);
    if (style.display === "none" || style.visibility === "hidden" || style.opacity === "0") continue;
    const rect = modal.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      hasModal = true;
      maxBottom = Math.max(maxBottom, Math.ceil(rect.height + 72), 440);
    }
  }

  for (const floating of document.querySelectorAll<HTMLElement>(FLOATING_PORTAL_SELECTOR)) {
    const style = window.getComputedStyle(floating);
    if (style.display === "none" || style.visibility === "hidden") continue;
    const rect = floating.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      maxBottom = Math.max(maxBottom, Math.ceil(rect.bottom + 24));
    }
  }

  return {
    height: Math.max(128, maxBottom),
    hasModal,
  };
}

function PreviewStage({
  entry,
  surface,
  locale,
  values,
  onValueChange,
}: {
  entry: string;
  surface: PreviewSurface;
  locale: PreviewLocale;
  values: PreviewValues;
  onValueChange: (key: string, next: PreviewValue) => void;
}) {
  const confirm = useConfirm();
  const notify = useNotify();
  const rootRef = useRef<HTMLDivElement | null>(null);
  const lastPostedRef = useRef<{ height: number; hasModal: boolean }>({ height: 0, hasModal: false });

  useEffect(() => {
    let rafId = 0;

    const reportSize = () => {
      cancelAnimationFrame(rafId);
      rafId = window.requestAnimationFrame(() => {
        const measured = measureRequiredHeight(rootRef.current);
        if (
          measured.height === lastPostedRef.current.height &&
          measured.hasModal === lastPostedRef.current.hasModal
        ) {
          return;
        }
        lastPostedRef.current = measured;
        const msg: ReactUsageResizeMessage = {
          type: "mw-react-usage-resize",
          entry,
          surface,
          height: measured.height,
          hasModal: measured.hasModal,
        };
        window.parent?.postMessage(msg, "*");
      });
    };

    reportSize();

    const resizeObserver = new ResizeObserver(reportSize);
    if (rootRef.current) {
      resizeObserver.observe(rootRef.current);
    }

    const mutationObserver = new MutationObserver(reportSize);
    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["style", "class", "data-state", "hidden", "open"],
    });

    window.addEventListener("resize", reportSize);
    return () => {
      cancelAnimationFrame(rafId);
      resizeObserver.disconnect();
      mutationObserver.disconnect();
      window.removeEventListener("resize", reportSize);
    };
  }, [entry, surface, values, locale]);

  const content = renderReactUsageEntry(entry, {
    values,
    setValue: onValueChange,
    confirm,
    notify,
    locale,
  });

  return (
    <div ref={rootRef} className={`rp-root rp-root--${surface}`}>
      {surface === "frost" ? (
        <div className="rp-frost mw-frost">
          <div className="rp-stage">{content}</div>
        </div>
      ) : (
        <div className="rp-stage">{content}</div>
      )}
    </div>
  );
}

function ReactPreviewApp() {
  const initial = parseInitialParams();
  const [entry] = useState(initial.entry);
  const [surface] = useState<PreviewSurface>(initial.surface);
  const [theme, setTheme] = useState<PreviewTheme>(initial.theme);
  const [locale, setLocale] = useState<PreviewLocale>(initial.locale);
  const [values, setValues] = useState<PreviewValues>({});

  useEffect(() => {
    applyDocumentThemeAndLocale(theme, locale);
  }, [theme, locale]);

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      const data = event.data as ReactUsageSyncMessage | null;
      if (!data || typeof data !== "object" || data.type !== "mw-react-usage-sync") return;
      if (data.entry && data.entry !== entry) return;
      if (data.theme === "light" || data.theme === "dark") {
        setTheme(data.theme);
      }
      if (data.locale === "zh-CN" || data.locale === "en-US") {
        setLocale(data.locale);
      }
      if (data.values && typeof data.values === "object") {
        setValues({ ...data.values });
      }
    }

    window.addEventListener("message", handleMessage);
    const ready: ReactUsageReadyMessage = {
      type: "mw-react-usage-ready",
      entry,
      surface,
    };
    window.parent?.postMessage(ready, "*");
    return () => window.removeEventListener("message", handleMessage);
  }, [entry, surface]);

  const handleValueChange = useCallback(
    (key: string, next: PreviewValue) => {
      setValues((prev) => ({ ...prev, [key]: next }));
      const msg: ReactUsageValueMessage = {
        type: "mw-react-usage-value",
        entry,
        surface,
        key,
        value: next,
      };
      window.parent?.postMessage(msg, "*");
    },
    [entry, surface],
  );

  return (
    <UiLocaleProvider locale={locale}>
      <ConfirmProvider>
        <NotifyProvider>
          <PreviewStage
            entry={entry}
            surface={surface}
            locale={locale}
            values={values}
            onValueChange={handleValueChange}
          />
          <ToastHost position="top-right" />
          <ConfirmHost />
        </NotifyProvider>
      </ConfirmProvider>
    </UiLocaleProvider>
  );
}

const initial = parseInitialParams();
applyDocumentThemeAndLocale(initial.theme, initial.locale);

const mountEl = document.getElementById("react-app");
if (mountEl) {
  createRoot(mountEl).render(
    <StrictMode>
      <ReactPreviewApp />
    </StrictMode>,
  );
}
