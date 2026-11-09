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

export interface NotifyCoreStore {
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

export const DEFAULT_TOAST_LIFE: Record<ToastSeverity, number> = {
  success: 3200,
  info: 3200,
  warn: 4800,
  error: 6500,
};

let nextToastSeq = 0;

export function createNotifyCoreStore(): NotifyCoreStore {
  let messages: ToastMessage[] = [];
  const listeners = new Set<() => void>();

  function emit(): void {
    for (const listener of listeners) {
      listener();
    }
  }

  function add(options: ToastMessageOptions): string {
    const severity: ToastSeverity = options.severity ?? "info";
    const id = options.id ?? `mw-toast-${++nextToastSeq}`;
    const now = Date.now();
    const existingIdx = messages.findIndex((m) => m.id === id);
    const existing = existingIdx !== -1 ? messages[existingIdx] : undefined;

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
      announceKey: existing ? existing.announceKey : `mw-toast-key-${++nextToastSeq}`,
      createdAt: existing ? existing.createdAt : now,
      updatedAt: now,
    };

    if (existingIdx !== -1) {
      const next = [...messages];
      next[existingIdx] = entry;
      messages = next;
    } else {
      messages = [...messages, entry];
    }
    emit();
    return id;
  }

  function remove(id: string): void {
    if (messages.some((m) => m.id === id)) {
      messages = messages.filter((m) => m.id !== id);
      emit();
    }
  }

  function removeGroup(group?: string): void {
    const normalizedGroup = group ?? undefined;
    const next = messages.filter((m) => (m.group ?? undefined) !== normalizedGroup);
    if (next.length !== messages.length) {
      messages = next;
      emit();
    }
  }

  function removeAllGroups(): void {
    if (messages.length > 0) {
      messages = [];
      emit();
    }
  }

  return {
    getSnapshot: () => messages,
    subscribe(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    add,
    success(summary, detail, opts) {
      return add({ ...opts, severity: "success", summary, detail, life: opts?.life ?? DEFAULT_TOAST_LIFE.success });
    },
    info(summary, detail, opts) {
      return add({ ...opts, severity: "info", summary, detail, life: opts?.life ?? DEFAULT_TOAST_LIFE.info });
    },
    warn(summary, detail, opts) {
      return add({ ...opts, severity: "warn", summary, detail, life: opts?.life ?? DEFAULT_TOAST_LIFE.warn });
    },
    error(summary, detail, opts) {
      return add({ ...opts, severity: "error", summary, detail, life: opts?.life ?? DEFAULT_TOAST_LIFE.error });
    },
    remove,
    removeGroup,
    removeAllGroups,
  };
}
