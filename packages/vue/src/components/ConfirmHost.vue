<script setup lang="ts">
import {
  computed,
  getCurrentInstance,
  inject,
  nextTick,
  onBeforeUnmount,
  ref,
  watch,
} from "vue";
import { useI18n } from "vue-i18n";
import {
  DialogContent,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogRoot,
  DialogTitle,
} from "reka-ui";
import { AlertTriangle, HelpCircle } from "lucide-vue-next";
import {
  bindHostConfirmStore,
  CONFIRM_KEY,
  type ConfirmRequest,
  type ConfirmStore,
} from "../lib/confirm.js";
import { useOverlayLayer } from "../lib/overlay-layer.js";
import { uiMessages } from "../locale/index.js";

defineOptions({
  name: "MwConfirmHost",
});

export interface ConfirmHostProps {
  group?: string;
  store?: ConfirmStore;
}

const props = withDefaults(defineProps<ConfirmHostProps>(), {
  group: undefined,
  store: undefined,
});

defineSlots<{
  default?: (props: {
    request: ConfirmRequest;
    accept: () => void;
    reject: () => void;
  }) => unknown;
  message?: (props: { message: ConfirmRequest }) => unknown;
}>();

let i18nT: ((key: string) => string) | null = null;
try {
  const i18n = useI18n();
  i18nT = (key: string) => i18n.t(key);
} catch {
  i18nT = null;
}

function translateOrFallback(key: string, fallback: string): string {
  const translated = i18nT?.(key);
  if (translated && translated !== key) {
    return translated;
  }
  return fallback;
}

const defaultTitle = computed(() =>
  translateOrFallback("common.confirm.title", uiMessages["zh-CN"].common.confirm.title),
);
const defaultAcceptLabel = computed(() =>
  translateOrFallback("common.confirm.accept", uiMessages["zh-CN"].common.confirm.accept),
);
const defaultRejectLabel = computed(() =>
  translateOrFallback("common.confirm.reject", uiMessages["zh-CN"].common.confirm.reject),
);

const instance = getCurrentInstance();
const injectedStore = inject(CONFIRM_KEY, null);
const { store: confirmStore, unbind: unbindHost } = bindHostConfirmStore(
  instance?.appContext?.app,
  props.group,
  props.store ?? injectedStore ?? undefined,
);

const activeEntry = computed(() =>
  confirmStore.queue.value.find(
    (entry) => (entry.request.group ?? undefined) === (props.group ?? undefined),
  ),
);

const activeRequest = computed(() => activeEntry.value?.request ?? null);
const isOpen = computed(() => activeRequest.value !== null);
const { layerZ, scrimZ } = useOverlayLayer(() => isOpen.value);

const fallbackRequest: ConfirmRequest = {
  id: "",
  message: "",
  danger: false,
  acceptSeverity: "primary",
  defaultFocus: "accept",
  closeOnEscape: true,
  dismissableMask: false,
  blockScroll: true,
};

const lastRequest = ref<ConfirmRequest>(fallbackRequest);
const renderRequest = computed(() => activeRequest.value ?? lastRequest.value);

const rejectBtnRef = ref<HTMLButtonElement | null>(null);
const acceptBtnRef = ref<HTMLButtonElement | null>(null);

// Guard against Enter key-repeat or trigger click-through penetration
let openReadyForId: string | null = null;

function applyInitialFocus(req: ConfirmRequest | null) {
  if (!req) return;
  if (req.danger || req.defaultFocus === "reject") {
    rejectBtnRef.value?.focus();
  } else if (req.defaultFocus === "accept") {
    acceptBtnRef.value?.focus();
  }
}

function onOpenAutoFocus(event: Event) {
  event.preventDefault();
  applyInitialFocus(activeRequest.value);
}

watch(
  activeRequest,
  async (req) => {
    if (req) {
      lastRequest.value = req;
    }
    openReadyForId = null;
    if (!req) return;
    await nextTick();
    openReadyForId = req.id;
    applyInitialFocus(activeRequest.value);
  },
  { immediate: true },
);

function onAccept() {
  const req = activeRequest.value;
  if (!req) return;
  confirmStore.accept(req.id);
}

function onReject() {
  const req = activeRequest.value;
  if (!req) return;
  confirmStore.reject(req.id);
}

function onDialogKeydown(event: KeyboardEvent) {
  const req = activeRequest.value;
  if (!req) return;

  if (event.key === "Escape") {
    if (!req.closeOnEscape) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    event.preventDefault();
    onReject();
    return;
  }

  if (event.key === "Enter") {
    // Prevent key-repeat or same-tick trigger Enter penetration
    if (event.repeat || openReadyForId !== req.id) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    const target = event.target as HTMLElement | null;
    if (target === rejectBtnRef.value) {
      event.preventDefault();
      onReject();
      return;
    }
    if (target === acceptBtnRef.value) {
      event.preventDefault();
      onAccept();
      return;
    }
    // Destructive confirms never accept via unhandled Enter on dialog container
    if (req.danger) {
      event.preventDefault();
      event.stopPropagation();
    }
  }
}

function onEscapeKeyDown(event: Event) {
  const req = activeRequest.value;
  if (!req) return;
  if (!req.closeOnEscape) {
    event.preventDefault();
    return;
  }
  onReject();
}

function onPointerDownOutside(event: Event) {
  const req = activeRequest.value;
  if (!req) return;
  if (!req.dismissableMask) {
    event.preventDefault();
    return;
  }
  onReject();
}

function onInteractOutside(event: Event) {
  const req = activeRequest.value;
  if (!req || !req.dismissableMask) {
    event.preventDefault();
  }
}

function onOverlayClick() {
  const req = activeRequest.value;
  if (req?.dismissableMask) {
    onReject();
  }
}

function onUpdateOpen(open: boolean) {
  if (!open && activeRequest.value) {
    onReject();
  }
}

onBeforeUnmount(() => {
  confirmStore.closeGroup(props.group);
  unbindHost();
});
</script>

<template>
  <DialogRoot :open="isOpen" @update:open="onUpdateOpen">
    <DialogPortal>
      <DialogOverlay
        class="mw-confirm-overlay"
        data-confirm-overlay
        :style="scrimZ ? { zIndex: scrimZ } : undefined"
        @click.self="onOverlayClick"
      />
      <DialogContent
        class="mw-confirm mw-frost mw-frost--thick"
        :class="{ 'mw-confirm--danger': renderRequest.danger }"
        :style="layerZ ? { zIndex: layerZ } : undefined"
        :data-danger="renderRequest.danger ? 'true' : undefined"
        :data-group="group"
        :trap-focus="true"
        @open-auto-focus="onOpenAutoFocus"
        @escape-key-down="onEscapeKeyDown"
        @pointer-down-outside="onPointerDownOutside"
        @interact-outside="onInteractOutside"
        @keydown="onDialogKeydown"
      >
        <slot
          :request="renderRequest"
          :accept="onAccept"
          :reject="onReject"
        >
          <div class="mw-confirm__header">
            <span
              class="mw-confirm__icon"
              :class="{ 'mw-confirm__icon--danger': renderRequest.danger }"
              aria-hidden="true"
            >
              <component
                :is="renderRequest.icon"
                v-if="renderRequest.icon"
              />
              <AlertTriangle v-else-if="renderRequest.danger" :size="18" />
              <HelpCircle v-else :size="18" />
            </span>
            <DialogTitle class="mw-confirm__title">
              {{ renderRequest.title || renderRequest.header || defaultTitle }}
            </DialogTitle>
          </div>

          <DialogDescription as="div" class="mw-confirm__body">
            <slot name="message" :message="renderRequest">
              <p class="mw-confirm__message">{{ renderRequest.message }}</p>
              <p v-if="renderRequest.description" class="mw-confirm__description">
                {{ renderRequest.description }}
              </p>
            </slot>
          </DialogDescription>

          <div class="mw-confirm__footer mw-size-md">
            <button
              ref="rejectBtnRef"
              type="button"
              class="mw-confirm__btn mw-confirm__btn--reject"
              data-confirm-reject
              @click="onReject"
            >
              {{ renderRequest.rejectLabel || defaultRejectLabel }}
            </button>
            <button
              ref="acceptBtnRef"
              type="button"
              class="mw-confirm__btn mw-confirm__btn--accept"
              :class="`mw-confirm__btn--${renderRequest.acceptSeverity}`"
              data-confirm-accept
              @click="onAccept"
            >
              {{ renderRequest.acceptLabel || defaultAcceptLabel }}
            </button>
          </div>
        </slot>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>
