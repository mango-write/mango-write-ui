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
  createConfirmCoreStore,
  type ConfirmCoreOptions,
  type ConfirmCoreRequest,
  type ConfirmCoreStore,
} from "@mango-write/ui-core/headless/confirm-core";

export type { ConfirmCoreOptions, ConfirmCoreRequest };

export interface MpConfirmService {
  active: ShallowRef<ConfirmCoreRequest | null>;
  ask: (options: ConfirmCoreOptions) => Promise<boolean>;
  accept: () => void;
  reject: () => void;
  clearAll: () => void;
}

const MP_CONFIRM_KEY: InjectionKey<MpConfirmService> = Symbol("MwMpConfirm");

export function createMpConfirmService(
  core: ConfirmCoreStore = createConfirmCoreStore(),
): MpConfirmService {
  const active = shallowRef<ConfirmCoreRequest | null>(core.getSnapshot()[0]?.request ?? null);

  const unsubscribe = core.subscribe(() => {
    active.value = core.getSnapshot()[0]?.request ?? null;
  });

  if (getCurrentInstance()) {
    onUnmounted(() => {
      unsubscribe();
      core.closeAll();
    });
  }

  return {
    active,
    ask: (options) => core.ask(options),
    accept: () => {
      const current = active.value;
      if (current) core.accept(current.id);
    },
    reject: () => {
      const current = active.value;
      if (current) core.reject(current.id);
    },
    clearAll: () => core.closeAll(),
  };
}

const fallbackConfirmService = createMpConfirmService();

export function provideMpConfirm(): MpConfirmService {
  const service = createMpConfirmService();
  provide(MP_CONFIRM_KEY, service);
  return service;
}

export function useMpConfirm(): MpConfirmService {
  return inject(MP_CONFIRM_KEY, fallbackConfirmService);
}
