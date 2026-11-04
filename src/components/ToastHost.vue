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
      class="mw-toast mw-glass"
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
          <component :is="severityIconMap[msg.severity]" :size="18" />
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
  z-index: var(--z-scrim);
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  max-width: min(380px, calc(100vw - 32px));
  width: 100%;
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
  pointer-events: auto;
  display: flex;
  align-items: flex-start;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-4);
  border-radius: var(--radius-lg);
  border: 1px solid var(--material-hairline);
  background-color: var(--elevation-3-surface);
  box-shadow: var(--elevation-3-shadow);
  color: var(--color-text-primary);
  font-family: var(--font-family-sans);
  font-size: var(--font-size-body-sm);
  line-height: var(--line-height-body);
  transition:
    opacity var(--motion-duration-base) var(--motion-ease-standard),
    transform var(--motion-duration-base) var(--motion-ease-standard);
}

.mw-toast--success {
  border-color: var(--color-success-border);
}

.mw-toast--info {
  border-color: var(--color-info-border);
}

.mw-toast--warn {
  border-color: var(--color-warning-border);
}

.mw-toast--error {
  border-color: var(--color-danger-border);
}

.mw-toast__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-top: 2px;
}

.mw-toast--success .mw-toast__icon {
  color: var(--color-success-500);
}

.mw-toast--info .mw-toast__icon {
  color: var(--color-info-500);
}

.mw-toast--warn .mw-toast__icon {
  color: var(--color-warning-500);
}

.mw-toast--error .mw-toast__icon {
  color: var(--color-danger-500);
}

.mw-toast__body {
  flex: 1 1 auto;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.mw-toast__summary {
  font-weight: 600;
  color: var(--color-text-primary);
}

.mw-toast__detail {
  color: var(--color-text-secondary);
}

.mw-toast__actions {
  margin-top: var(--space-1);
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.mw-toast__action-btn {
  display: inline-flex;
  align-items: center;
  padding: 2px var(--space-2);
  border-radius: var(--radius-xs);
  border: 1px solid var(--color-border-strong);
  background-color: var(--color-surface-base);
  color: var(--color-text-primary);
  font-size: var(--font-size-caption);
  font-weight: 500;
  cursor: pointer;
}

.mw-toast__action-btn:hover {
  background-color: var(--color-bg-hover);
}

.mw-toast__action-btn:focus-visible {
  outline: none;
  box-shadow: var(--effect-focus-ring);
}

.mw-toast__close {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  padding: 0;
  margin: -2px -4px -2px 0;
  border: none;
  border-radius: var(--radius-xs);
  background: transparent;
  color: var(--color-text-tertiary);
  cursor: pointer;
}

.mw-toast__close:hover {
  color: var(--color-text-primary);
  background-color: var(--material-hover);
}

.mw-toast__close:focus-visible {
  outline: none;
  box-shadow: var(--effect-focus-ring);
}

@media (prefers-reduced-motion: reduce) {
  .mw-toast {
    transition: none;
  }
}
</style>
