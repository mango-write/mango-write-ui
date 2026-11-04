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
        @click.self="onOverlayClick"
      />
      <DialogContent
        class="mw-confirm mw-frost mw-frost--thick"
        :class="{ 'mw-confirm--danger': renderRequest.danger }"
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

<style scoped>
.mw-confirm-overlay {
  position: fixed;
  inset: 0;
  z-index: var(--z-overlay);
  background-color: var(--scrim);
}

.mw-confirm-overlay[data-state="open"] {
  animation: mw-confirm-fade-in var(--duration-slow) var(--ease-emphasized);
}

.mw-confirm-overlay[data-state="closed"] {
  animation: mw-confirm-fade-out var(--duration-fast) var(--ease-exit);
}

.mw-confirm {
  position: fixed;
  top: 50%;
  left: 50%;
  translate: -50% -50%;
  z-index: calc(var(--z-overlay) + 1);
  width: min(27.5rem, calc(100vw - var(--space-8)));
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  padding: var(--space-5);
  border-radius: var(--radius-dialog);
  color: var(--text-primary);
  font-family: var(--font-sans);
}

.mw-confirm[data-state="open"] {
  animation: mw-confirm-enter var(--duration-slow) var(--ease-emphasized);
}

.mw-confirm[data-state="closed"] {
  animation: mw-confirm-fade-out var(--duration-fast) var(--ease-exit);
}

.mw-confirm:focus {
  outline: none;
}

.mw-confirm__header {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.mw-confirm__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: var(--size-md-h);
  height: var(--size-md-h);
  border-radius: var(--radius-md);
  background-color: var(--info-subtle);
  color: var(--info);
}

.mw-confirm__icon :deep(svg) {
  width: var(--icon-lg);
  height: var(--icon-lg);
  font-size: var(--icon-lg);
}

.mw-confirm__icon--danger {
  background-color: var(--danger-subtle);
  color: var(--danger);
}

.mw-confirm__title {
  margin: 0;
  color: var(--text-primary);
  font-size: var(--type-title-size);
  font-weight: var(--weight-semibold);
  line-height: var(--type-title-line);
  letter-spacing: var(--tracking-title);
}

.mw-confirm__body {
  display: flex;
  flex-direction: column;
  gap: var(--space-1-5);
  color: var(--text-secondary);
  font-size: var(--type-body-size);
  line-height: var(--type-body-line);
}

.mw-confirm__message,
.mw-confirm__description {
  margin: 0;
}

.mw-confirm__description {
  font-size: var(--type-body-sm-size);
  line-height: var(--type-body-sm-line);
}

.mw-confirm__footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: var(--space-2);
  margin-top: var(--space-2);
}

.mw-confirm__btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: var(--control-h);
  padding-inline: var(--control-px);
  border: var(--border-width) solid transparent;
  border-radius: var(--control-radius);
  font-family: var(--font-sans);
  font-size: var(--control-font);
  font-weight: var(--weight-medium);
  line-height: var(--leading-tight);
  white-space: nowrap;
  cursor: pointer;
  transition:
    background-color var(--duration-fast) var(--ease-standard),
    border-color var(--duration-fast) var(--ease-standard),
    color var(--duration-fast) var(--ease-standard);
}

.mw-confirm__btn:focus-visible {
  outline: var(--focus-width) solid var(--focus-color);
  outline-offset: var(--focus-offset);
}

.mw-confirm__btn--reject {
  border-color: var(--control-border);
  background-color: var(--control-bg);
  color: var(--text-primary);
}

.mw-confirm__btn--reject:hover {
  border-color: var(--control-border-hover);
  background-color: var(--control-bg-hover);
}

.mw-confirm__btn--reject:active {
  background-color: var(--fill-strong);
}

.mw-confirm__btn--primary {
  background-color: var(--accent);
  color: var(--text-on-accent);
}

.mw-confirm__btn--primary:hover {
  background-color: var(--accent-hover);
}

.mw-confirm__btn--primary:active {
  background-color: var(--accent-pressed);
}

.mw-confirm__btn--danger {
  background-color: var(--danger);
  color: var(--text-on-danger);
}

.mw-confirm__btn--danger:hover {
  background-color: var(--danger-hover);
}

.mw-confirm__btn--warn {
  background-color: var(--warning-subtle);
  color: var(--warning-text);
}

.mw-confirm__btn--warn:hover {
  background-color: var(--warning-border);
}

.mw-confirm__btn--secondary {
  background-color: var(--fill-default);
  color: var(--text-primary);
}

.mw-confirm__btn--secondary:hover {
  background-color: var(--fill-strong);
}

@keyframes mw-confirm-enter {
  from {
    opacity: 0;
    scale: var(--motion-enter-scale);
  }
}

@keyframes mw-confirm-fade-in {
  from {
    opacity: 0;
  }
}

@keyframes mw-confirm-fade-out {
  to {
    opacity: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .mw-confirm[data-state="open"] {
    animation-name: mw-confirm-fade-in;
  }

  .mw-confirm__btn {
    transition: none;
  }
}
</style>
