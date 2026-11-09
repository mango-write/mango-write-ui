<script setup lang="ts">
import {
  computed,
  getCurrentInstance,
  inject,
  onBeforeUnmount,
  watch,
} from "vue";
import { useI18n } from "vue-i18n";
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Info,
  X,
} from "lucide-vue-next";
import {
  bindHostNotifyStore,
  NOTIFY_KEY,
  type NotifyStore,
  type ToastMessage,
} from "../lib/notify.js";
import { uiMessages } from "../locale/index.js";

defineOptions({
  name: "MwToastHost",
});

export type ToastPosition =
  | "top-right"
  | "top-left"
  | "bottom-right"
  | "bottom-left"
  | "top-center"
  | "bottom-center";

export interface ToastHostProps {
  group?: string;
  position?: ToastPosition;
  store?: NotifyStore;
}

const props = withDefaults(defineProps<ToastHostProps>(), {
  group: undefined,
  position: "top-right",
  store: undefined,
});

defineSlots<{
  message?: (props: { message: ToastMessage; close: () => void }) => unknown;
}>();

let i18nT: ((key: string) => string) | null = null;
try {
  const i18n = useI18n();
  i18nT = (key: string) => i18n.t(key);
} catch {
  i18nT = null;
}

const closeLabel = computed(() => {
  const translated = i18nT?.("common.action.close");
  if (translated && translated !== "common.action.close") {
    return translated;
  }
  return uiMessages["zh-CN"].common.action.close;
});

const instance = getCurrentInstance();
const injectedStore = inject(NOTIFY_KEY, null);
const { store: notifyStore, unbind: unbindHost } = bindHostNotifyStore(
  instance?.appContext?.app,
  props.group,
  props.store ?? injectedStore ?? undefined,
);

const groupMessages = computed(() =>
  notifyStore.messages.value.filter(
    (m) => (m.group ?? undefined) === (props.group ?? undefined),
  ),
);

interface TimerState {
  timer: ReturnType<typeof setTimeout> | null;
  remaining: number;
  startedAt: number;
  paused: boolean;
  updatedAt: number;
}

const timers = new Map<string, TimerState>();

function clearTimer(id: string) {
  const state = timers.get(id);
  if (!state) return;
  if (state.timer !== null) {
    clearTimeout(state.timer);
    state.timer = null;
  }
  timers.delete(id);
}

function startOrResetTimer(msg: ToastMessage) {
  if (!msg.life || msg.life <= 0) {
    clearTimer(msg.id);
    return;
  }

  const existing = timers.get(msg.id);
  if (existing && existing.updatedAt === msg.updatedAt) {
    return;
  }

  const wasPaused = existing?.paused ?? false;
  if (existing?.timer !== null && existing?.timer !== undefined) {
    clearTimeout(existing.timer);
  }

  const state: TimerState = {
    timer: null,
    remaining: msg.life,
    startedAt: Date.now(),
    paused: wasPaused,
    updatedAt: msg.updatedAt,
  };

  if (!wasPaused) {
    state.timer = setTimeout(() => {
      timers.delete(msg.id);
      notifyStore.remove(msg.id);
    }, state.remaining);
  }

  timers.set(msg.id, state);
}

function pauseTimer(id: string) {
  const state = timers.get(id);
  if (!state || state.paused) return;
  if (state.timer !== null) {
    clearTimeout(state.timer);
    state.timer = null;
  }
  const elapsed = Math.max(0, Date.now() - state.startedAt);
  state.remaining = Math.max(0, state.remaining - elapsed);
  state.paused = true;
}

function resumeTimer(id: string) {
  const state = timers.get(id);
  if (!state || !state.paused) return;
  state.paused = false;
  state.startedAt = Date.now();
  if (state.remaining <= 0) {
    timers.delete(id);
    notifyStore.remove(id);
    return;
  }
  state.timer = setTimeout(() => {
    timers.delete(id);
    notifyStore.remove(id);
  }, state.remaining);
}

function onFocusOut(id: string, event: FocusEvent) {
  const current = event.currentTarget;
  const related = event.relatedTarget;
  if (current instanceof Node && related instanceof Node && current.contains(related)) {
    return;
  }
  resumeTimer(id);
}

watch(
  groupMessages,
  (list) => {
    const activeIds = new Set(list.map((m) => m.id));
    for (const id of [...timers.keys()]) {
      if (!activeIds.has(id)) {
        clearTimer(id);
      }
    }
    for (const msg of list) {
      startOrResetTimer(msg);
    }
  },
  { immediate: true },
);

function closeToast(id: string) {
  clearTimer(id);
  notifyStore.remove(id);
}

function onActionClick(msg: ToastMessage) {
  msg.action?.onClick();
}

const severityIconMap = {
  success: CheckCircle2,
  info: Info,
  warn: AlertTriangle,
  error: AlertCircle,
} as const;

onBeforeUnmount(() => {
  for (const id of [...timers.keys()]) {
    clearTimer(id);
  }
  unbindHost();
});
</script>

<template>
  <div
    class="mw-toast-host"
    :class="`mw-toast-host--${position}`"
    :data-position="position"
    :data-group="group"
  >
    <div
      v-for="msg in groupMessages"
      :key="msg.announceKey"
      class="mw-toast mw-frost"
      :class="`mw-toast--${msg.severity}`"
      :data-toast-id="msg.id"
      :data-announce-key="msg.announceKey"
      :data-severity="msg.severity"
      :role="msg.severity === 'error' ? 'alert' : 'status'"
      :aria-live="msg.severity === 'error' ? 'assertive' : 'polite'"
      aria-atomic="true"
      @mouseenter="pauseTimer(msg.id)"
      @mouseleave="resumeTimer(msg.id)"
      @focusin="pauseTimer(msg.id)"
      @focusout="onFocusOut(msg.id, $event)"
    >
      <slot name="message" :message="msg" :close="() => closeToast(msg.id)">
        <span class="mw-toast__icon" aria-hidden="true">
          <component :is="severityIconMap[msg.severity]" :size="16" />
        </span>
        <div class="mw-toast__body">
          <div v-if="msg.summary" class="mw-toast__summary">
            {{ msg.summary }}
          </div>
          <div v-if="msg.detail" class="mw-toast__detail">
            {{ msg.detail }}
          </div>
          <div v-if="msg.action" class="mw-toast__actions">
            <button
              type="button"
              class="mw-toast__action-btn"
              @click="onActionClick(msg)"
            >
              {{ msg.action.label }}
            </button>
          </div>
        </div>
        <button
          v-if="msg.closable"
          type="button"
          class="mw-toast__close"
          :aria-label="closeLabel"
          @click="closeToast(msg.id)"
        >
          <X :size="14" aria-hidden="true" />
        </button>
      </slot>
    </div>
  </div>
</template>

<style scoped>
.mw-toast-host {
  position: fixed;
  z-index: var(--z-toast);
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  width: 100%;
  max-width: min(23.75rem, calc(100vw - var(--space-8)));
  pointer-events: none;
}

.mw-toast-host--top-right {
  top: var(--space-4);
  right: var(--space-4);
}

.mw-toast-host--top-left {
  top: var(--space-4);
  left: var(--space-4);
}

.mw-toast-host--bottom-right {
  bottom: var(--space-4);
  right: var(--space-4);
}

.mw-toast-host--bottom-left {
  bottom: var(--space-4);
  left: var(--space-4);
}

.mw-toast-host--top-center {
  top: var(--space-4);
  left: 50%;
  transform: translateX(-50%);
}

.mw-toast-host--bottom-center {
  bottom: var(--space-4);
  left: 50%;
  transform: translateX(-50%);
}

.mw-toast {
  --mw-toast-enter-y: calc(var(--motion-enter-offset) * -1);
  pointer-events: auto;
  display: flex;
  align-items: flex-start;
  gap: var(--space-2-5);
  padding: var(--space-3);
  border-radius: var(--radius-float);
  color: var(--text-primary);
  font-family: var(--font-sans);
  font-size: var(--type-body-sm-size);
  line-height: var(--type-body-sm-line);
  animation: mw-toast-enter var(--duration-base) var(--ease-enter);
}

.mw-toast-host--bottom-right .mw-toast,
.mw-toast-host--bottom-left .mw-toast,
.mw-toast-host--bottom-center .mw-toast {
  --mw-toast-enter-y: var(--motion-enter-offset);
}

.mw-toast__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  height: var(--type-body-sm-line);
}

.mw-toast__icon :deep(svg) {
  width: var(--icon-md);
  height: var(--icon-md);
}

.mw-toast--success .mw-toast__icon {
  color: var(--success);
}

.mw-toast--info .mw-toast__icon {
  color: var(--info);
}

.mw-toast--warn .mw-toast__icon {
  color: var(--warning);
}

.mw-toast--error .mw-toast__icon {
  color: var(--danger);
}

.mw-toast__body {
  flex: 1 1 auto;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-0-5);
}

.mw-toast__summary {
  color: var(--text-primary);
  font-weight: var(--weight-semibold);
}

.mw-toast__detail {
  color: var(--text-secondary);
  font-size: var(--type-caption-size);
  line-height: var(--type-caption-line);
}

.mw-toast__actions {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  margin-top: var(--space-1);
  margin-inline-start: calc(var(--size-xs-px) * -1);
}

.mw-toast__action-btn {
  display: inline-flex;
  align-items: center;
  height: var(--size-xs-h);
  padding-inline: var(--size-xs-px);
  border: 0;
  border-radius: var(--size-xs-radius);
  background-color: transparent;
  color: var(--text-accent);
  font-family: inherit;
  font-size: var(--type-caption-size);
  font-weight: var(--weight-medium);
  cursor: pointer;
  transition: background-color var(--duration-fast) var(--ease-standard);
}

.mw-toast__action-btn:hover {
  background-color: var(--accent-subtle);
}

.mw-toast__action-btn:active {
  background-color: var(--accent-subtle-hover);
}

.mw-toast__action-btn:focus-visible,
.mw-toast__close:focus-visible {
  outline: var(--focus-width) solid var(--focus-color);
  outline-offset: var(--focus-offset);
}

.mw-toast__close {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: var(--size-xs-h);
  height: var(--size-xs-h);
  padding: 0;
  margin-block: calc((var(--type-body-sm-line) - var(--size-xs-h)) / 2);
  margin-inline-end: calc(var(--space-1) * -1);
  border: none;
  border-radius: var(--size-xs-radius);
  background: transparent;
  color: var(--text-tertiary);
  cursor: pointer;
  transition:
    background-color var(--duration-fast) var(--ease-standard),
    color var(--duration-fast) var(--ease-standard);
}

.mw-toast__close :deep(svg) {
  width: var(--icon-sm);
  height: var(--icon-sm);
}

.mw-toast__close:hover {
  background-color: var(--fill-default);
  color: var(--text-primary);
}

@keyframes mw-toast-enter {
  from {
    opacity: 0;
    transform: translateY(var(--mw-toast-enter-y)) scale(var(--motion-enter-scale));
  }
}

@keyframes mw-toast-fade-in {
  from {
    opacity: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .mw-toast {
    animation-name: mw-toast-fade-in;
  }

  .mw-toast__action-btn,
  .mw-toast__close {
    transition: none;
  }
}
</style>
