import {
  getCurrentInstance,
  getCurrentScope,
  inject,
  onBeforeUnmount,
  onScopeDispose,
  provide,
  ref,
  type App,
  type Component,
  type InjectionKey,
  type Ref,
} from "vue";
import {
  normalizeAcceptSeverity,
  validateLegacyConfirmOptions,
  type ConfirmAcceptSeverity,
  type ConfirmDefaultFocus,
} from "@mango-write/ui-core/headless/confirm-core";

export {
  validateLegacyConfirmOptions,
  type ConfirmAcceptSeverity,
  type ConfirmDefaultFocus,
};

export interface ConfirmOptions {
  title?: string;
  header?: string;
  message: string;
  description?: string;
  icon?: Component;
  acceptLabel?: string;
  rejectLabel?: string;
  danger?: boolean;
  acceptSeverity?: ConfirmAcceptSeverity;
  defaultFocus?: ConfirmDefaultFocus;
  group?: string;
  closeOnEscape?: boolean;
  dismissableMask?: boolean;
  blockScroll?: boolean;
  signal?: AbortSignal;
}

export interface LegacyConfirmButtonProps {
  label?: string;
  severity?: "primary" | "danger" | "secondary" | "warn" | "info" | "success" | "contrast";
  text?: boolean;
  outlined?: boolean;
  icon?: Component;
  class?: string;
  [key: string]: unknown;
}

export interface LegacyConfirmRequireOptions {
  message: string;
  header?: string;
  icon?: Component;
  group?: string;
  acceptLabel?: string;
  rejectLabel?: string;
  acceptProps?: LegacyConfirmButtonProps;
  rejectProps?: LegacyConfirmButtonProps;
  accept?: () => unknown;
  reject?: () => unknown;
  onHide?: () => void;
  defaultFocus?: ConfirmDefaultFocus;
  blockScroll?: boolean;
  closeOnEscape?: boolean;
  dismissableMask?: boolean;
}

export interface ConfirmRequest {
  id: string;
  title?: string;
  header?: string;
  message: string;
  description?: string;
  icon?: Component;
  acceptLabel?: string;
  rejectLabel?: string;
  danger: boolean;
  acceptSeverity: ConfirmAcceptSeverity;
  defaultFocus: ConfirmDefaultFocus;
  group?: string;
  closeOnEscape: boolean;
  dismissableMask: boolean;
  blockScroll: boolean;
}

export interface InternalConfirmEntry {
  request: ConfirmRequest;
  settle: (confirmed: boolean) => void;
}

export interface ConfirmStore {
  queue: Ref<InternalConfirmEntry[]>;
  ask(options: ConfirmOptions): Promise<boolean>;
  require(options: LegacyConfirmRequireOptions): Promise<boolean>;
  accept(id: string): void;
  reject(id: string): void;
  closeGroup(group?: string): void;
  closeAll(): void;
}

export const CONFIRM_KEY: InjectionKey<ConfirmStore> = Symbol("mw-confirm");

let nextConfirmSeq = 0;

export function createConfirmStore(): ConfirmStore {
  const queue = ref<InternalConfirmEntry[]>([]);

  function removeEntry(id: string): InternalConfirmEntry | undefined {
    const idx = queue.value.findIndex((item) => item.request.id === id);
    if (idx === -1) return undefined;
    const entry = queue.value[idx]!;
    const next = [...queue.value];
    next.splice(idx, 1);
    queue.value = next;
    return entry;
  }

  function askWithLifecycle(
    options: ConfirmOptions,
    registerCancel?: (cancel: () => void) => () => void,
  ): Promise<boolean> {
    if (options.signal?.aborted) {
      return Promise.resolve(false);
    }

    const id = `mw-confirm-${++nextConfirmSeq}`;
    const danger = Boolean(options.danger || options.acceptSeverity === "danger");
    const acceptSeverity = normalizeAcceptSeverity(options.acceptSeverity, danger);
    const defaultFocus: ConfirmDefaultFocus =
      options.defaultFocus ?? (danger ? "reject" : "accept");

    const request: ConfirmRequest = {
      id,
      title: options.title ?? options.header,
      header: options.header ?? options.title,
      message: options.message,
      description: options.description,
      icon: options.icon,
      acceptLabel: options.acceptLabel,
      rejectLabel: options.rejectLabel,
      danger,
      acceptSeverity,
      defaultFocus,
      group: options.group,
      closeOnEscape: options.closeOnEscape ?? true,
      dismissableMask: options.dismissableMask ?? false,
      blockScroll: options.blockScroll ?? true,
    };

    return new Promise<boolean>((resolve) => {
      let settled = false;
      let unregisterCaller: (() => void) | null = null;

      const onAbort = () => {
        const removed = removeEntry(id);
        if (removed) {
          removed.settle(false);
        } else {
          settle(false);
        }
      };

      const cleanup = () => {
        if (options.signal) {
          options.signal.removeEventListener("abort", onAbort);
        }
        unregisterCaller?.();
        unregisterCaller = null;
      };

      const settle = (confirmed: boolean) => {
        if (settled) return;
        settled = true;
        cleanup();
        resolve(confirmed);
      };

      const cancel = () => {
        removeEntry(id);
        settle(false);
      };

      if (options.signal) {
        options.signal.addEventListener("abort", onAbort, { once: true });
      }

      if (registerCancel) {
        unregisterCaller = registerCancel(cancel);
      }

      if (!registerCancel && getCurrentScope()) {
        onScopeDispose(cancel);
      }

      queue.value = [...queue.value, { request, settle }];
    });
  }

  function requireWithLifecycle(
    options: LegacyConfirmRequireOptions,
    registerCancel?: (cancel: () => void) => () => void,
  ): Promise<boolean> {
    validateLegacyConfirmOptions(options as unknown as Record<string, unknown>);

    const danger = options.acceptProps?.severity === "danger";
    const acceptLabel = options.acceptLabel ?? options.acceptProps?.label;
    const rejectLabel = options.rejectLabel ?? options.rejectProps?.label;
    const acceptSeverity = normalizeAcceptSeverity(options.acceptProps?.severity, danger);

    let callbackInvoked = false;

    return askWithLifecycle(
      {
        title: options.header,
        header: options.header,
        message: options.message,
        icon: options.icon,
        group: options.group,
        acceptLabel,
        rejectLabel,
        danger,
        acceptSeverity,
        defaultFocus: options.defaultFocus,
        blockScroll: options.blockScroll,
        closeOnEscape: options.closeOnEscape,
        dismissableMask: options.dismissableMask,
      },
      registerCancel,
    ).then((confirmed) => {
      if (callbackInvoked) return confirmed;
      callbackInvoked = true;
      if (confirmed) {
        options.accept?.();
      } else {
        options.reject?.();
      }
      options.onHide?.();
      return confirmed;
    });
  }

  function accept(id: string): void {
    const entry = removeEntry(id);
    entry?.settle(true);
  }

  function reject(id: string): void {
    const entry = removeEntry(id);
    entry?.settle(false);
  }

  function closeGroup(group?: string): void {
    const normalizedGroup = group ?? undefined;
    const removed: InternalConfirmEntry[] = [];
    const remaining: InternalConfirmEntry[] = [];
    for (const entry of queue.value) {
      if ((entry.request.group ?? undefined) === normalizedGroup) {
        removed.push(entry);
      } else {
        remaining.push(entry);
      }
    }
    if (removed.length > 0) {
      queue.value = remaining;
      for (const entry of removed) {
        entry.settle(false);
      }
    }
  }

  function closeAll(): void {
    const all = [...queue.value];
    queue.value = [];
    for (const entry of all) {
      entry.settle(false);
    }
  }

  return {
    queue,
    ask: (opts) => askWithLifecycle(opts),
    require: (opts) => requireWithLifecycle(opts),
    accept,
    reject,
    closeGroup,
    closeAll,
  };
}

const appConfirmStores = new WeakMap<App, ConfirmStore>();
const defaultStore = createConfirmStore();
const hostAppsByGroup = new Map<string | undefined, Set<App>>();
const requestOriginApp = new Map<string, App>();

function isVueApp(value: unknown): value is App {
  return (
    typeof value === "object" &&
    value !== null &&
    "provide" in value &&
    typeof (value as App).provide === "function" &&
    "_context" in value
  );
}

export function bindHostConfirmStore(
  app: App | null | undefined,
  group: string | undefined,
  explicitStore?: ConfirmStore,
): { store: ConfirmStore; unbind: () => void } {
  if (explicitStore) {
    if (app) {
      appConfirmStores.set(app, explicitStore);
    }
    return { store: explicitStore, unbind: () => {} };
  }

  const normalizedGroup = group ?? undefined;
  let store = app ? appConfirmStores.get(app) : undefined;

  if (!store && app) {
    const provided = (app._context?.provides as Record<symbol, ConfirmStore | undefined> | undefined)?.[
      CONFIRM_KEY as unknown as symbol
    ];
    if (provided) {
      store = provided;
      appConfirmStores.set(app, store);
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
      store = createConfirmStore();
      appConfirmStores.set(app, store);
      app.provide(CONFIRM_KEY, store);
      // Migrate any pending requests initiated by this app during setup
      const toMigrate = defaultStore.queue.value.filter(
        (entry) => requestOriginApp.get(entry.request.id) === app,
      );
      if (toMigrate.length > 0) {
        defaultStore.queue.value = defaultStore.queue.value.filter(
          (entry) => requestOriginApp.get(entry.request.id) !== app,
        );
        store.queue.value = [...store.queue.value, ...toMigrate];
      }
    } else {
      store = defaultStore;
      if (app) {
        appConfirmStores.set(app, store);
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

export function provideConfirm(appOrStore?: App | ConfirmStore, maybeStore?: ConfirmStore): ConfirmStore {
  if (isVueApp(appOrStore)) {
    const store = maybeStore ?? createConfirmStore();
    appConfirmStores.set(appOrStore, store);
    appOrStore.provide(CONFIRM_KEY, store);
    return store;
  }
  const store = appOrStore ?? createConfirmStore();
  const instance = getCurrentInstance();
  if (instance) {
    provide(CONFIRM_KEY, store);
    if (instance.appContext?.app) {
      appConfirmStores.set(instance.appContext.app, store);
    }
  }
  return store;
}

export function useConfirm(storeOverride?: ConfirmStore): ConfirmStore {
  const instance = getCurrentInstance();
  const scope = getCurrentScope();

  const injected = instance ? inject(CONFIRM_KEY, null) : null;
  const callerApp = instance?.appContext?.app ?? null;

  let callerDisposed = false;
  const activeCancels = new Set<() => void>();

  const disposeCallerRequests = () => {
    if (callerDisposed) return;
    callerDisposed = true;
    const cancels = [...activeCancels];
    activeCancels.clear();
    for (const cancel of cancels) {
      cancel();
    }
  };

  if (instance) {
    onBeforeUnmount(disposeCallerRequests, instance);
  }
  if (scope) {
    onScopeDispose(disposeCallerRequests);
  }

  const hasLifecycleBinding = Boolean(instance || scope);

  const registerCancel = (cancel: () => void): (() => void) => {
    activeCancels.add(cancel);
    return () => {
      activeCancels.delete(cancel);
    };
  };

  const resolveTarget = (): ConfirmStore => {
    if (storeOverride) return storeOverride;
    if (injected) return injected;
    if (callerApp) {
      const appStore = appConfirmStores.get(callerApp);
      if (appStore) return appStore;
    }
    return defaultStore;
  };

  return {
    get queue() {
      return resolveTarget().queue;
    },
    ask(options: ConfirmOptions): Promise<boolean> {
      if (callerDisposed) {
        return Promise.resolve(false);
      }
      if (options.signal?.aborted) {
        return Promise.resolve(false);
      }
      const target = resolveTarget();
      const p = target.ask(options);
      const entry = target.queue.value.at(-1);
      if (!entry) return p;
      const entryId = entry.request.id;
      if (callerApp) {
        requestOriginApp.set(entryId, callerApp);
      }
      if (!hasLifecycleBinding) {
        return p;
      }
      const cancel = () => {
        resolveTarget().reject(entryId);
      };
      const unregister = registerCancel(cancel);
      return p.finally(unregister);
    },
    require(options: LegacyConfirmRequireOptions): Promise<boolean> {
      validateLegacyConfirmOptions(options as unknown as Record<string, unknown>);
      if (callerDisposed) {
        return Promise.resolve(false);
      }
      const danger = options.acceptProps?.severity === "danger";
      const acceptLabel = options.acceptLabel ?? options.acceptProps?.label;
      const rejectLabel = options.rejectLabel ?? options.rejectProps?.label;
      const acceptSeverity = normalizeAcceptSeverity(options.acceptProps?.severity, danger);
      let callbackInvoked = false;

      return this.ask({
        title: options.header,
        header: options.header,
        message: options.message,
        icon: options.icon,
        group: options.group,
        acceptLabel,
        rejectLabel,
        danger,
        acceptSeverity,
        defaultFocus: options.defaultFocus,
        blockScroll: options.blockScroll,
        closeOnEscape: options.closeOnEscape,
        dismissableMask: options.dismissableMask,
      }).then((confirmed) => {
        if (callbackInvoked) return confirmed;
        callbackInvoked = true;
        if (confirmed) {
          options.accept?.();
        } else {
          options.reject?.();
        }
        options.onHide?.();
        return confirmed;
      });
    },
    accept(id: string) {
      resolveTarget().accept(id);
    },
    reject(id: string) {
      resolveTarget().reject(id);
    },
    closeGroup(group?: string) {
      resolveTarget().closeGroup(group);
    },
    closeAll() {
      resolveTarget().closeAll();
    },
  };
}
