import {
  createContext,
  createElement,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useSyncExternalStore,
  type ComponentType,
  type ReactElement,
  type ReactNode,
} from "react";
import {
  createConfirmCoreStore,
  normalizeAcceptSeverity,
  validateLegacyConfirmOptions,
  type ConfirmAcceptSeverity,
  type ConfirmCoreOptions,
  type ConfirmCoreRequest,
  type ConfirmDefaultFocus,
  type InternalConfirmCoreEntry,
} from "@mango-write/ui-core/headless/confirm-core";

export {
  normalizeAcceptSeverity,
  validateLegacyConfirmOptions,
  type ConfirmAcceptSeverity,
  type ConfirmDefaultFocus,
};

export type ConfirmIcon =
  | ReactNode
  | ComponentType<{ size?: number; className?: string }>;

export type ConfirmOptions = ConfirmCoreOptions<ConfirmIcon>;
export type ConfirmRequest = ConfirmCoreRequest<ConfirmIcon>;
export type InternalConfirmEntry = InternalConfirmCoreEntry<ConfirmIcon>;

export interface LegacyConfirmButtonProps {
  label?: string;
  severity?:
    | "primary"
    | "danger"
    | "secondary"
    | "warn"
    | "info"
    | "success"
    | "contrast";
  text?: boolean;
  outlined?: boolean;
  icon?: ConfirmIcon;
  class?: string;
  className?: string;
  [key: string]: unknown;
}

export interface LegacyConfirmRequireOptions {
  message: string;
  header?: string;
  icon?: ConfirmIcon;
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

export interface ConfirmStore {
  readonly queue: readonly InternalConfirmEntry[];
  getSnapshot(): readonly InternalConfirmEntry[];
  subscribe(listener: () => void): () => void;
  ask(
    options: ConfirmOptions,
    registerCancel?: (cancel: () => void) => () => void,
  ): Promise<boolean>;
  require(
    options: LegacyConfirmRequireOptions,
    registerCancel?: (cancel: () => void) => () => void,
  ): Promise<boolean>;
  accept(id: string): void;
  reject(id: string): void;
  closeGroup(group?: string): void;
  closeAll(): void;
}

export const CONFIRM_KEY = Symbol("mw-confirm");

function requireFromAsk(
  askFn: (
    options: ConfirmOptions,
    registerCancel?: (cancel: () => void) => () => void,
  ) => Promise<boolean>,
  options: LegacyConfirmRequireOptions,
  registerCancel?: (cancel: () => void) => () => void,
): Promise<boolean> {
  validateLegacyConfirmOptions(options as unknown as Record<string, unknown>);

  const danger = options.acceptProps?.severity === "danger";
  const acceptLabel = options.acceptLabel ?? options.acceptProps?.label;
  const rejectLabel = options.rejectLabel ?? options.rejectProps?.label;
  const acceptSeverity = normalizeAcceptSeverity(options.acceptProps?.severity, danger);

  let callbackInvoked = false;

  return askFn(
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

export function createConfirmStore(): ConfirmStore {
  const core = createConfirmCoreStore<ConfirmIcon>();

  return {
    get queue() {
      return core.getSnapshot();
    },
    getSnapshot: core.getSnapshot,
    subscribe: core.subscribe,
    ask: core.ask,
    require(options, registerCancel) {
      return requireFromAsk(core.ask, options, registerCancel);
    },
    accept: core.accept,
    reject: core.reject,
    closeGroup: core.closeGroup,
    closeAll: core.closeAll,
  };
}

export const defaultConfirmStore: ConfirmStore = createConfirmStore();

export const ConfirmContext = createContext<ConfirmStore | null>(null);

export interface ConfirmProviderProps {
  store?: ConfirmStore;
  children?: ReactNode;
}

export function ConfirmProvider({
  store,
  children,
}: ConfirmProviderProps): ReactElement {
  const fallbackRef = useRef<ConfirmStore | null>(null);
  if (!store && !fallbackRef.current) {
    fallbackRef.current = createConfirmStore();
  }
  const resolvedStore = store ?? fallbackRef.current!;
  return createElement(ConfirmContext.Provider, { value: resolvedStore }, children);
}

export function useConfirmStore(storeOverride?: ConfirmStore): ConfirmStore {
  const injected = useContext(ConfirmContext);
  return storeOverride ?? injected ?? defaultConfirmStore;
}

export function useConfirmQueue(
  storeOverride?: ConfirmStore,
  group?: string,
): readonly InternalConfirmEntry[] {
  const store = useConfirmStore(storeOverride);
  const all = useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
    store.getSnapshot,
  );
  return useMemo(
    () =>
      all.filter(
        (entry) => (entry.request.group ?? undefined) === (group ?? undefined),
      ),
    [all, group],
  );
}

export function useConfirm(storeOverride?: ConfirmStore): ConfirmStore {
  const store = useConfirmStore(storeOverride);
  const disposedRef = useRef(false);
  const activeCancelsRef = useRef<Set<() => void>>(new Set());

  useEffect(() => {
    disposedRef.current = false;
    const cancels = activeCancelsRef.current;
    return () => {
      disposedRef.current = true;
      const pending = [...cancels];
      cancels.clear();
      for (const cancel of pending) {
        cancel();
      }
    };
  }, []);

  return useMemo<ConfirmStore>(() => {
    const registerCancel = (cancel: () => void): (() => void) => {
      activeCancelsRef.current.add(cancel);
      return () => {
        activeCancelsRef.current.delete(cancel);
      };
    };

    const askWithCallerLifecycle = (
      options: ConfirmOptions,
      extraRegister?: (cancel: () => void) => () => void,
    ): Promise<boolean> => {
      if (disposedRef.current || options.signal?.aborted) {
        return Promise.resolve(false);
      }
      return store.ask(options, (cancel) => {
        const unregSelf = registerCancel(cancel);
        const unregExtra = extraRegister ? extraRegister(cancel) : null;
        return () => {
          unregSelf();
          unregExtra?.();
        };
      });
    };

    return {
      get queue() {
        return store.queue;
      },
      getSnapshot: store.getSnapshot,
      subscribe: store.subscribe,
      ask: askWithCallerLifecycle,
      require(options, extraRegister) {
        validateLegacyConfirmOptions(options as unknown as Record<string, unknown>);
        if (disposedRef.current) {
          return Promise.resolve(false);
        }
        return requireFromAsk(askWithCallerLifecycle, options, extraRegister);
      },
      accept: store.accept,
      reject: store.reject,
      closeGroup: store.closeGroup,
      closeAll: store.closeAll,
    };
  }, [store]);
}
