export type ConfirmAcceptSeverity = "primary" | "danger" | "secondary" | "warn";
export type ConfirmDefaultFocus = "accept" | "reject" | "none";

export interface ConfirmCoreOptions<TIcon = unknown> {
  title?: string;
  header?: string;
  message: string;
  description?: string;
  icon?: TIcon;
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

export interface ConfirmCoreRequest<TIcon = unknown> {
  id: string;
  title?: string;
  header?: string;
  message: string;
  description?: string;
  icon?: TIcon;
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

export interface InternalConfirmCoreEntry<TIcon = unknown> {
  request: ConfirmCoreRequest<TIcon>;
  settle: (confirmed: boolean) => void;
}

export interface ConfirmCoreStore<TIcon = unknown> {
  getSnapshot(): readonly InternalConfirmCoreEntry<TIcon>[];
  subscribe(listener: () => void): () => void;
  ask(
    options: ConfirmCoreOptions<TIcon>,
    registerCancel?: (cancel: () => void) => () => void,
  ): Promise<boolean>;
  accept(id: string): void;
  reject(id: string): void;
  closeGroup(group?: string): void;
  closeAll(): void;
}

const SUPPORTED_LEGACY_KEYS = new Set<string>([
  "message",
  "header",
  "icon",
  "group",
  "acceptLabel",
  "rejectLabel",
  "acceptProps",
  "rejectProps",
  "accept",
  "reject",
  "onHide",
  "defaultFocus",
  "blockScroll",
  "closeOnEscape",
  "dismissableMask",
]);

export function normalizeAcceptSeverity(
  severity: string | undefined,
  danger: boolean,
): ConfirmAcceptSeverity {
  if (danger || severity === "danger") return "danger";
  if (severity === "secondary" || severity === "warn" || severity === "primary") {
    return severity;
  }
  return "primary";
}

export function validateLegacyConfirmOptions(
  options: Record<string, unknown>,
): void {
  for (const key of Object.keys(options)) {
    if (!SUPPORTED_LEGACY_KEYS.has(key)) {
      throw new Error(`[useConfirm.require] Unsupported legacy confirm option: ${key}`);
    }
  }
}

let nextConfirmSeq = 0;

export function createConfirmCoreStore<TIcon = unknown>(): ConfirmCoreStore<TIcon> {
  let queue: InternalConfirmCoreEntry<TIcon>[] = [];
  const listeners = new Set<() => void>();

  function emit(): void {
    for (const listener of listeners) {
      listener();
    }
  }

  function removeEntry(id: string): InternalConfirmCoreEntry<TIcon> | undefined {
    const idx = queue.findIndex((item) => item.request.id === id);
    if (idx === -1) return undefined;
    const entry = queue[idx]!;
    const next = [...queue];
    next.splice(idx, 1);
    queue = next;
    emit();
    return entry;
  }

  function ask(
    options: ConfirmCoreOptions<TIcon>,
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

    const request: ConfirmCoreRequest<TIcon> = {
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

      queue = [...queue, { request, settle }];
      emit();
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
    const removed: InternalConfirmCoreEntry<TIcon>[] = [];
    const remaining: InternalConfirmCoreEntry<TIcon>[] = [];
    for (const entry of queue) {
      if ((entry.request.group ?? undefined) === normalizedGroup) {
        removed.push(entry);
      } else {
        remaining.push(entry);
      }
    }
    if (removed.length > 0) {
      queue = remaining;
      emit();
      for (const entry of removed) {
        entry.settle(false);
      }
    }
  }

  function closeAll(): void {
    const all = [...queue];
    if (all.length === 0) return;
    queue = [];
    emit();
    for (const entry of all) {
      entry.settle(false);
    }
  }

  return {
    getSnapshot: () => queue,
    subscribe(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    ask,
    accept,
    reject,
    closeGroup,
    closeAll,
  };
}
