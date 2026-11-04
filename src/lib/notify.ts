import {
  getCurrentInstance,
  inject,
  provide,
  ref,
  type App,
  type InjectionKey,
  type Ref,
} from "vue";

export type ToastSeverity = "success" | "info" | "warn" | "error";

export interface ToastAction {
  label: string;
  onClick: () => void;
}

export interface ToastMessageOptions {
  id?: string;
  severity?: ToastSeverity;
  summary?: string;
  detail?: string;
  life?: number;
  group?: string;
  closable?: boolean;
  action?: ToastAction;
  data?: unknown;
}

export interface ToastMessage {
  id: string;
  severity: ToastSeverity;
  summary?: string;
  detail?: string;
  life: number;
  group?: string;
  closable: boolean;
  action?: ToastAction;
  data?: unknown;
  /** Stable key for aria-live container so in-place updates by id do not double-announce */
  announceKey: string;
  createdAt: number;
  updatedAt: number;
}

export type ToastShortcutOptions = Omit<ToastMessageOptions, "severity" | "summary" | "detail">;

export interface NotifyStore {
  messages: Ref<ToastMessage[]>;
  add(options: ToastMessageOptions): string;
  success(summary: string, detail?: string, opts?: ToastShortcutOptions): string;
  info(summary: string, detail?: string, opts?: ToastShortcutOptions): string;
  warn(summary: string, detail?: string, opts?: ToastShortcutOptions): string;
  error(summary: string, detail?: string, opts?: ToastShortcutOptions): string;
  remove(id: string): void;
  removeGroup(group?: string): void;
  removeAllGroups(): void;
}

export const NOTIFY_KEY: InjectionKey<NotifyStore> = Symbol("mw-notify");

const DEFAULT_LIFE: Record<ToastSeverity, number> = {
  success: 3200,
  info: 3200,
  warn: 4800,
  error: 6500,
};

const ROUTE_TRANSITION_CLASSES = ["vt-workbench", "vt-doc", "vt-bare", "vt-crossfade"] as const;
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
  const messages = ref<ToastMessage[]>([]);
  const pendingById = new Map<string, { message: ToastMessage; cancel: () => void }>();

  function commitMessage(incoming: ToastMessage) {
    const idx = messages.value.findIndex((m) => m.id === incoming.id);
    if (idx !== -1) {
      const existing = messages.value[idx]!;
      const updated: ToastMessage = {
        ...existing,
        ...incoming,
        // Preserve announceKey so aria-live region is updated in place without re-mounting
        announceKey: existing.announceKey,
        createdAt: existing.createdAt,
        updatedAt: Date.now(),
      };
      const next = [...messages.value];
      next[idx] = updated;
      messages.value = next;
    } else {
      messages.value = [...messages.value, incoming];
    }
  }

  function add(options: ToastMessageOptions): string {
    const severity: ToastSeverity = options.severity ?? "info";
    const id = options.id ?? `mw-toast-${++nextToastSeq}`;
    const now = Date.now();
    const existingActive = messages.value.find((m) => m.id === id);
    const existingPending = pendingById.get(id)?.message;
    const base = existingActive ?? existingPending;

    const entry: ToastMessage = {
      id,
      severity,
      summary: options.summary,
      detail: options.detail,
      life: options.life ?? DEFAULT_LIFE[severity],
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
    if (messages.value.some((m) => m.id === id)) {
      messages.value = messages.value.filter((m) => m.id !== id);
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
    messages.value = messages.value.filter(
      (m) => (m.group ?? undefined) !== normalizedGroup,
    );
  }

  function removeAllGroups(): void {
    for (const pending of pendingById.values()) {
      pending.cancel();
    }
    pendingById.clear();
    messages.value = [];
  }

  return {
    messages,
    add,
    success(summary, detail, opts) {
      return add({ ...opts, severity: "success", summary, detail, life: opts?.life ?? DEFAULT_LIFE.success });
    },
    info(summary, detail, opts) {
      return add({ ...opts, severity: "info", summary, detail, life: opts?.life ?? DEFAULT_LIFE.info });
    },
    warn(summary, detail, opts) {
      return add({ ...opts, severity: "warn", summary, detail, life: opts?.life ?? DEFAULT_LIFE.warn });
    },
    error(summary, detail, opts) {
      return add({ ...opts, severity: "error", summary, detail, life: opts?.life ?? DEFAULT_LIFE.error });
    },
    remove,
    removeGroup,
    removeAllGroups,
  };
}

const appNotifyStores = new WeakMap<App, NotifyStore>();
const defaultStore = createNotifyStore();
const hostAppsByGroup = new Map<string | undefined, Set<App>>();
const messageOriginApp = new Map<string, App>();

function isVueApp(value: unknown): value is App {
  return (
    typeof value === "object" &&
    value !== null &&
    "provide" in value &&
    typeof (value as App).provide === "function" &&
    "_context" in value
  );
}

export function bindHostNotifyStore(
  app: App | null | undefined,
  group: string | undefined,
  explicitStore?: NotifyStore,
): { store: NotifyStore; unbind: () => void } {
  if (explicitStore) {
    if (app) {
      appNotifyStores.set(app, explicitStore);
    }
    return { store: explicitStore, unbind: () => {} };
  }

  const normalizedGroup = group ?? undefined;
  let store = app ? appNotifyStores.get(app) : undefined;

  if (!store && app) {
    const provided = (app._context?.provides as Record<symbol, NotifyStore | undefined> | undefined)?.[
      NOTIFY_KEY as unknown as symbol
    ];
    if (provided) {
      store = provided;
      appNotifyStores.set(app, store);
    }
  }

  const groupSet = hostAppsByGroup.get(normalizedGroup) ?? new Set<App>();
  hostAppsByGroup.set(normalizedGroup, groupSet);

  if (!store) {
    const hasOtherAppForSameGroup =
      app !== null &&
      app !== undefined &&
      groupSet.size > 0 &&
      !groupSet.has(app);

    if (hasOtherAppForSameGroup && app) {
      store = createNotifyStore();
      appNotifyStores.set(app, store);
      app.provide(NOTIFY_KEY, store);
      // Migrate any messages emitted by this app during setup before ToastHost mounted
      const toMigrate = defaultStore.messages.value.filter(
        (m) => messageOriginApp.get(m.id) === app,
      );
      if (toMigrate.length > 0) {
        for (const msg of toMigrate) {
          defaultStore.remove(msg.id);
          store.add(msg);
        }
      }
    } else {
      store = defaultStore;
      if (app) {
        appNotifyStores.set(app, store);
      }
    }
  }

  if (app) {
    groupSet.add(app);
  }

  return {
    store,
    unbind: () => {
      if (app) {
        groupSet.delete(app);
      }
    },
  };
}

export function provideNotify(appOrStore?: App | NotifyStore, maybeStore?: NotifyStore): NotifyStore {
  if (isVueApp(appOrStore)) {
    const store = maybeStore ?? createNotifyStore();
    appNotifyStores.set(appOrStore, store);
    appOrStore.provide(NOTIFY_KEY, store);
    return store;
  }
  const store = appOrStore ?? createNotifyStore();
  const instance = getCurrentInstance();
  if (instance) {
    provide(NOTIFY_KEY, store);
    if (instance.appContext?.app) {
      appNotifyStores.set(instance.appContext.app, store);
    }
  }
  return store;
}

export function useNotify(storeOverride?: NotifyStore): NotifyStore {
  if (storeOverride) return storeOverride;

  const instance = getCurrentInstance();
  const injected = instance ? inject(NOTIFY_KEY, null) : null;
  if (injected) return injected;

  const callerApp = instance?.appContext?.app ?? null;

  const resolveTarget = (): NotifyStore => {
    if (callerApp) {
      const appStore = appNotifyStores.get(callerApp);
      if (appStore) return appStore;
    }
    return defaultStore;
  };

  const trackOrigin = (id: string): string => {
    if (callerApp) {
      messageOriginApp.set(id, callerApp);
    }
    return id;
  };

  return {
    get messages() {
      return resolveTarget().messages;
    },
    add(options) {
      return trackOrigin(resolveTarget().add(options));
    },
    success(summary, detail, opts) {
      return trackOrigin(resolveTarget().success(summary, detail, opts));
    },
    info(summary, detail, opts) {
      return trackOrigin(resolveTarget().info(summary, detail, opts));
    },
    warn(summary, detail, opts) {
      return trackOrigin(resolveTarget().warn(summary, detail, opts));
    },
    error(summary, detail, opts) {
      return trackOrigin(resolveTarget().error(summary, detail, opts));
    },
    remove(id) {
      resolveTarget().remove(id);
    },
    removeGroup(group) {
      resolveTarget().removeGroup(group);
    },
    removeAllGroups() {
      resolveTarget().removeAllGroups();
    },
  };
}
