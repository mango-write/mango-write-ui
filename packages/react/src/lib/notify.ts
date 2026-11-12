import {
  createContext,
  createElement,
  useContext,
  useMemo,
  useRef,
  useSyncExternalStore,
  type ReactElement,
  type ReactNode,
} from "react";
import {
  DEFAULT_TOAST_LIFE,
  type ToastAction,
  type ToastMessage,
  type ToastMessageOptions,
  type ToastSeverity,
  type ToastShortcutOptions,
} from "@mango-write/ui-core/headless/notify-core";

export {
  DEFAULT_TOAST_LIFE,
  type ToastAction,
  type ToastMessage,
  type ToastMessageOptions,
  type ToastSeverity,
  type ToastShortcutOptions,
};

export interface NotifyStore {
  readonly messages: readonly ToastMessage[];
  getSnapshot(): readonly ToastMessage[];
  subscribe(listener: () => void): () => void;
  add(options: ToastMessageOptions): string;
  success(summary: string, detail?: string, opts?: ToastShortcutOptions): string;
  info(summary: string, detail?: string, opts?: ToastShortcutOptions): string;
  warn(summary: string, detail?: string, opts?: ToastShortcutOptions): string;
  error(summary: string, detail?: string, opts?: ToastShortcutOptions): string;
  remove(id: string): void;
  removeGroup(group?: string): void;
  removeAllGroups(): void;
}

export const NOTIFY_KEY = Symbol("mw-notify");

const ROUTE_TRANSITION_CLASSES = [
  "vt-workbench",
  "vt-doc",
  "vt-bare",
  "vt-crossfade",
] as const;
const TRANSITION_SAFETY_MS = 2000;

let nextToastSeq = 0;

function isRouteTransitionInFlight(): boolean {
  if (typeof document === "undefined" || !document.documentElement) return false;
  const cl = document.documentElement.classList;
  return ROUTE_TRANSITION_CLASSES.some((cls) => cl.contains(cls));
}

function waitForRouteTransitionEnd(cb: () => void): () => void {
  if (!isRouteTransitionInFlight() || typeof MutationObserver === "undefined") {
    cb();
    return () => {};
  }

  let done = false;
  let observer: MutationObserver | null = null;
  let timer: ReturnType<typeof setTimeout> | null = null;

  const finish = () => {
    if (done) return;
    done = true;
    observer?.disconnect();
    observer = null;
    if (timer !== null) {
      clearTimeout(timer);
      timer = null;
    }
    cb();
  };

  observer = new MutationObserver(() => {
    if (!isRouteTransitionInFlight()) {
      finish();
    }
  });
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  });
  timer = setTimeout(finish, TRANSITION_SAFETY_MS);

  return () => {
    done = true;
    observer?.disconnect();
    observer = null;
    if (timer !== null) {
      clearTimeout(timer);
      timer = null;
    }
  };
}

export function createNotifyStore(): NotifyStore {
  let messages: ToastMessage[] = [];
  const listeners = new Set<() => void>();
  const pendingById = new Map<string, { message: ToastMessage; cancel: () => void }>();

  function emit(): void {
    for (const listener of listeners) {
      listener();
    }
  }

  function commitMessage(incoming: ToastMessage): void {
    const idx = messages.findIndex((m) => m.id === incoming.id);
    if (idx !== -1) {
      const existing = messages[idx]!;
      const updated: ToastMessage = {
        ...existing,
        ...incoming,
        announceKey: existing.announceKey,
        createdAt: existing.createdAt,
        updatedAt: Date.now(),
      };
      const next = [...messages];
      next[idx] = updated;
      messages = next;
    } else {
      messages = [...messages, incoming];
    }
    emit();
  }

  function add(options: ToastMessageOptions): string {
    const severity: ToastSeverity = options.severity ?? "info";
    const id = options.id ?? `mw-toast-${++nextToastSeq}`;
    const now = Date.now();
    const existingActive = messages.find((m) => m.id === id);
    const existingPending = pendingById.get(id)?.message;
    const base = existingActive ?? existingPending;

    const entry: ToastMessage = {
      id,
      severity,
      summary: options.summary,
      detail: options.detail,
      life: options.life ?? DEFAULT_TOAST_LIFE[severity],
      group: options.group,
      closable: options.closable ?? true,
      action: options.action,
      data: options.data,
      announceKey: base ? base.announceKey : `mw-toast-key-${++nextToastSeq}`,
      createdAt: base ? base.createdAt : now,
      updatedAt: now,
    };

    if (existingActive) {
      commitMessage(entry);
      return id;
    }

    if (isRouteTransitionInFlight()) {
      const prevPending = pendingById.get(id);
      if (prevPending) {
        prevPending.message = entry;
        return id;
      }
      const cancel = waitForRouteTransitionEnd(() => {
        const current = pendingById.get(id);
        if (!current) return;
        pendingById.delete(id);
        commitMessage(current.message);
      });
      pendingById.set(id, { message: entry, cancel });
      return id;
    }

    commitMessage(entry);
    return id;
  }

  function remove(id: string): void {
    const pending = pendingById.get(id);
    if (pending) {
      pending.cancel();
      pendingById.delete(id);
    }
    if (messages.some((m) => m.id === id)) {
      messages = messages.filter((m) => m.id !== id);
      emit();
    }
  }

  function removeGroup(group?: string): void {
    const normalizedGroup = group ?? undefined;
    for (const [id, pending] of pendingById.entries()) {
      if ((pending.message.group ?? undefined) === normalizedGroup) {
        pending.cancel();
        pendingById.delete(id);
      }
    }
    const next = messages.filter((m) => (m.group ?? undefined) !== normalizedGroup);
    if (next.length !== messages.length) {
      messages = next;
      emit();
    }
  }

  function removeAllGroups(): void {
    for (const pending of pendingById.values()) {
      pending.cancel();
    }
    pendingById.clear();
    if (messages.length > 0) {
      messages = [];
      emit();
    }
  }

  return {
    get messages() {
      return messages;
    },
    getSnapshot: () => messages,
    subscribe(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    add,
    success(summary, detail, opts) {
      return add({
        ...opts,
        severity: "success",
        summary,
        detail,
        life: opts?.life ?? DEFAULT_TOAST_LIFE.success,
      });
    },
    info(summary, detail, opts) {
      return add({
        ...opts,
        severity: "info",
        summary,
        detail,
        life: opts?.life ?? DEFAULT_TOAST_LIFE.info,
      });
    },
    warn(summary, detail, opts) {
      return add({
        ...opts,
        severity: "warn",
        summary,
        detail,
        life: opts?.life ?? DEFAULT_TOAST_LIFE.warn,
      });
    },
    error(summary, detail, opts) {
      return add({
        ...opts,
        severity: "error",
        summary,
        detail,
        life: opts?.life ?? DEFAULT_TOAST_LIFE.error,
      });
    },
    remove,
    removeGroup,
    removeAllGroups,
  };
}

export const defaultNotifyStore: NotifyStore = createNotifyStore();

export const NotifyContext = createContext<NotifyStore | null>(null);

export interface NotifyProviderProps {
  store?: NotifyStore;
  children?: ReactNode;
}

export function NotifyProvider({
  store,
  children,
}: NotifyProviderProps): ReactElement {
  const fallbackRef = useRef<NotifyStore | null>(null);
  if (!store && !fallbackRef.current) {
    fallbackRef.current = createNotifyStore();
  }
  const resolvedStore = store ?? fallbackRef.current!;
  return createElement(NotifyContext.Provider, { value: resolvedStore }, children);
}

export function useNotify(storeOverride?: NotifyStore): NotifyStore {
  const injected = useContext(NotifyContext);
  return storeOverride ?? injected ?? defaultNotifyStore;
}

export function useNotifyMessages(
  storeOverride?: NotifyStore,
  group?: string,
): readonly ToastMessage[] {
  const store = useNotify(storeOverride);
  const all = useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
    store.getSnapshot,
  );
  return useMemo(
    () => all.filter((m) => (m.group ?? undefined) === (group ?? undefined)),
    [all, group],
  );
}
