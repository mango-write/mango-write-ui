import {
  getCurrentInstance,
  inject,
  onUnmounted,
  provide,
  shallowRef,
  type InjectionKey,
  type ShallowRef,
} from "vue";
import {
  createNotifyCoreStore,
  DEFAULT_TOAST_LIFE,
  type NotifyCoreStore,
  type ToastMessage,
  type ToastMessageOptions,
  type ToastSeverity,
} from "@mango-write/ui-core/headless/notify-core";

export type { ToastMessage, ToastMessageOptions, ToastSeverity };

export interface MpNotifyService {
  items: ShallowRef<readonly ToastMessage[]>;
  push: (options: ToastMessageOptions) => string;
  success: (summary: string, detail?: string, life?: number) => string;
  info: (summary: string, detail?: string, life?: number) => string;
  warn: (summary: string, detail?: string, life?: number) => string;
  error: (summary: string, detail?: string, life?: number) => string;
  dismiss: (id: string) => void;
  clear: () => void;
}

const MP_NOTIFY_KEY: InjectionKey<MpNotifyService> = Symbol("MwMpNotify");

export function createMpNotifyService(
  core: NotifyCoreStore = createNotifyCoreStore(),
  options?: { scoped?: boolean },
): MpNotifyService {
  const items = shallowRef<readonly ToastMessage[]>(core.getSnapshot());
  const timers = new Map<string, ReturnType<typeof setTimeout>>();

  const unsubscribe = core.subscribe(() => {
    items.value = core.getSnapshot();
  });

  function scheduleAutoDismiss(id: string, life: number): void {
    const prev = timers.get(id);
    if (prev) clearTimeout(prev);
    if (life <= 0) return;
    const handle = setTimeout(() => {
      timers.delete(id);
      core.remove(id);
    }, life);
    timers.set(id, handle);
  }

  function push(options: ToastMessageOptions): string {
    const id = core.add(options);
    const life = options.life ?? DEFAULT_TOAST_LIFE[options.severity ?? "info"];
    scheduleAutoDismiss(id, life);
    return id;
  }

  function dismiss(id: string): void {
    const prev = timers.get(id);
    if (prev) {
      clearTimeout(prev);
      timers.delete(id);
    }
    core.remove(id);
  }

  function clear(): void {
    for (const handle of timers.values()) clearTimeout(handle);
    timers.clear();
    core.removeAllGroups();
  }

  if (options?.scoped && getCurrentInstance()) {
    onUnmounted(() => {
      unsubscribe();
      for (const handle of timers.values()) clearTimeout(handle);
      timers.clear();
    });
  }

  return {
    items,
    push,
    success: (summary, detail, life = 2400) =>
      push({ severity: "success", summary, detail, life }),
    info: (summary, detail, life = 2400) =>
      push({ severity: "info", summary, detail, life }),
    warn: (summary, detail, life = 2800) =>
      push({ severity: "warn", summary, detail, life }),
    error: (summary, detail, life = 3200) =>
      push({ severity: "error", summary, detail, life }),
    dismiss,
    clear,
  };
}

const MP_NOTIFY_FALLBACK_KEY = "__mangoWriteMpNotifyFallback";

function fallbackNotifyService(): MpNotifyService {
  const host = globalThis as typeof globalThis & { [MP_NOTIFY_FALLBACK_KEY]?: MpNotifyService };
  // uni-app 页面包可能多次求值本模块，后备服务必须跨页面 chunk 共享。
  host[MP_NOTIFY_FALLBACK_KEY] ??= createMpNotifyService();
  return host[MP_NOTIFY_FALLBACK_KEY];
}

export function provideMpNotify(): MpNotifyService {
  const service = createMpNotifyService(undefined, { scoped: true });
  provide(MP_NOTIFY_KEY, service);
  return service;
}

export function useMpNotify(): MpNotifyService {
  return getCurrentInstance()
    ? inject(MP_NOTIFY_KEY, fallbackNotifyService())
    : fallbackNotifyService();
}
