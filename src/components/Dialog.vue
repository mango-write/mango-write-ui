<script setup lang="ts">
import {
  computed,
  getCurrentInstance,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  useAttrs,
  watch,
  type StyleValue,
} from "vue";
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogRoot,
  DialogTitle,
} from "reka-ui";
import { ArrowLeft, Maximize2, Minimize2, X } from "lucide-vue-next";
import { uiMessages } from "../locale/index.js";
import { useOverlayLayer } from "../lib/overlay-layer.js";
import { vScrollFade } from "../lib/scroll-fade";
import { vTooltip } from "../lib/tooltip";
import type { DialogEmits, DialogProps, DialogSize } from "./dialog-defs.js";

defineOptions({
  name: "MwDialog",
  inheritAttrs: false,
});

const props = withDefaults(defineProps<DialogProps>(), {
  open: undefined,
  visible: undefined,
  title: undefined,
  header: undefined,
  description: undefined,
  size: undefined,
  canBack: false,
  backLabel: undefined,
  scopeText: undefined,
  bodyScroll: true,
  modal: true,
  closable: true,
  showHeader: true,
  closeOnEscape: true,
  dismissableMask: false,
  maximizable: false,
  draggable: false,
  blockScroll: true,
  width: undefined,
  contentClass: undefined,
  contentStyle: undefined,
  ariaLabel: undefined,
  appendTo: undefined,
  closeButtonProps: undefined,
});

const emit = defineEmits<DialogEmits>();
const attrs = useAttrs();
const instance = getCurrentInstance();

const SIZE_WIDTH_MAP: Record<DialogSize, string> = {
  sm: "min(27.5rem, calc(100vw - var(--space-8)))",
  md: "min(40rem, calc(100vw - var(--space-8)))",
  lg: "min(53.75rem, calc(100vw - var(--space-8)))",
  xl: "min(68.75rem, calc(100vw - var(--space-8)))",
};

function translate(key: string, fallback: string): string {
  const globalProps = instance?.appContext.config.globalProperties as
    | { $t?: (k: string) => string }
    | undefined;
  if (typeof globalProps?.$t === "function") {
    const res = globalProps.$t(key);
    if (res && res !== key) return res;
  }
  return fallback;
}

const closeLabel = computed(() =>
  translate("common.action.close", uiMessages["zh-CN"].common.action.close),
);
const maximizeLabel = computed(() =>
  translate("common.dialog.maximize", uiMessages["zh-CN"].common.dialog.maximize),
);
const restoreLabel = computed(() =>
  translate("common.dialog.restore", uiMessages["zh-CN"].common.dialog.restore),
);
const resolvedBackLabel = computed(
  () =>
    props.backLabel ??
    translate("common.admin.back", uiMessages["zh-CN"].common.admin.back),
);

const isOpen = computed(() => props.open ?? props.visible ?? false);
const resolvedTitle = computed(() => props.title ?? props.header ?? "");
const resolvedWidth = computed(
  () => props.width ?? (props.size ? SIZE_WIDTH_MAP[props.size] : undefined),
);
const maximized = ref(false);
const { layerZ, scrimZ } = useOverlayLayer(() => isOpen.value);

const portalDisabled = computed(() => props.appendTo === "self");
const portalTo = computed(() =>
  props.appendTo && props.appendTo !== "self" ? props.appendTo : "body",
);

const dialogClass = computed(() => [
  "mw-dialog",
  "mw-frost",
  "mw-frost--thick",
  props.size ? `mw-dialog--${props.size}` : undefined,
  {
    "mw-dialog--maximized": maximized.value,
    "mw-dialog--non-modal": !props.modal,
  },
  attrs.class,
]);

const dialogStyle = computed<StyleValue>(() => [
  layerZ.value ? { zIndex: layerZ.value } : undefined,
  resolvedWidth.value && !maximized.value ? { width: resolvedWidth.value } : undefined,
  attrs.style as StyleValue,
]);

const dialogAttrs = computed(() => {
  const { class: _class, style: _style, ...rest } = attrs;
  return rest;
});

function setOpen(value: boolean) {
  if (value === isOpen.value) return;
  emit("update:open", value);
  emit("update:visible", value);
}

function toggleMaximize(event: MouseEvent) {
  maximized.value = !maximized.value;
  if (maximized.value) {
    emit("maximize", event);
  } else {
    emit("unmaximize", event);
  }
}

function onEscapeKeyDown(event: KeyboardEvent) {
  if (!props.closeOnEscape) {
    event.preventDefault();
  }
}

function onContentKeydown(event: KeyboardEvent) {
  if (event.key !== "Escape" || event.defaultPrevented) return;
  if (!props.closeOnEscape) {
    event.preventDefault();
    return;
  }
  const target = event.currentTarget as HTMLElement | null;
  if (!event.bubbles || (target && !document.body.contains(target))) {
    event.stopPropagation();
    setOpen(false);
  }
}

function onPointerDownOutside(event: Event) {
  if (!props.dismissableMask) {
    event.preventDefault();
  }
}

function onInteractOutside(event: Event) {
  if (!props.dismissableMask) {
    event.preventDefault();
  }
}

let pointerDownInsideContent = false;

function onContentPointerDown() {
  pointerDownInsideContent = true;
}

function onOverlayPointerDown(event: PointerEvent) {
  if (event.target === event.currentTarget) {
    pointerDownInsideContent = false;
  }
}

function onOverlayClick(event: MouseEvent) {
  if (pointerDownInsideContent) {
    pointerDownInsideContent = false;
    return;
  }
  if (props.dismissableMask && event.target === event.currentTarget) {
    setOpen(false);
  }
}

let leaveEmitted = false;

function emitAfterLeave() {
  if (leaveEmitted || isOpen.value) return;
  leaveEmitted = true;
  maximized.value = false;
  emit("afterLeave");
  emit("hide");
}

watch(
  isOpen,
  async (open, prevOpen) => {
    if (open && !prevOpen) {
      leaveEmitted = false;
      await nextTick();
      if (isOpen.value) {
        emit("show");
      }
    } else if (!open && prevOpen) {
      leaveEmitted = false;
      await nextTick();
      emitAfterLeave();
    }
  },
);

onMounted(() => {
  if (isOpen.value) {
    emit("show");
  }
});

onBeforeUnmount(() => {
  pointerDownInsideContent = false;
});
</script>

<template>
  <DialogRoot :open="isOpen" :modal="modal" @update:open="setOpen">
    <DialogPortal :to="portalTo" :disabled="portalDisabled">
      <DialogOverlay
        v-if="modal"
        class="mw-dialog__overlay"
        :style="scrimZ ? { zIndex: scrimZ } : undefined"
        @pointerdown="onOverlayPointerDown"
        @click="onOverlayClick"
      />
      <DialogContent
        v-bind="dialogAttrs"
        :class="dialogClass"
        :style="dialogStyle"
        :aria-label="ariaLabel || (dialogAttrs['aria-label'] as string | undefined)"
        :data-size="size"
        :data-maximized="maximized ? 'true' : undefined"
        :data-draggable="draggable ? 'true' : undefined"
        @escape-key-down="onEscapeKeyDown"
        @pointer-down-outside="onPointerDownOutside"
        @interact-outside="onInteractOutside"
        @pointerdown="onContentPointerDown"
        @keydown="onContentKeydown"
      >
        <header v-if="showHeader" class="mw-dialog__header">
          <div class="mw-dialog__title-row">
            <button
              v-if="canBack"
              type="button"
              class="mw-dialog__action-btn mw-dialog__back"
              :aria-label="resolvedBackLabel"
              v-tooltip.bottom="resolvedBackLabel"
              @click="emit('back')"
            >
              <ArrowLeft :size="16" aria-hidden="true" />
            </button>
            <DialogTitle class="mw-dialog__title">
              <slot name="header">{{ resolvedTitle || ariaLabel || closeLabel }}</slot>
            </DialogTitle>
            <slot name="header-extra" />
          </div>
          <div v-if="maximizable || closable" class="mw-dialog__actions">
            <button
              v-if="maximizable"
              type="button"
              class="mw-dialog__action-btn mw-dialog__maximize"
              :aria-label="maximized ? restoreLabel : maximizeLabel"
              :aria-pressed="maximized"
              @click="toggleMaximize"
            >
              <Minimize2 v-if="maximized" :size="16" aria-hidden="true" />
              <Maximize2 v-else :size="16" aria-hidden="true" />
            </button>
            <DialogClose
              v-if="closable"
              v-bind="closeButtonProps"
              class="mw-dialog__action-btn mw-dialog__close"
              :aria-label="
                (closeButtonProps?.['aria-label'] as string | undefined) ?? closeLabel
              "
            >
              <X :size="16" aria-hidden="true" />
            </DialogClose>
          </div>
        </header>
        <DialogTitle v-else class="mw-dialog__sr-only">
          {{ resolvedTitle || ariaLabel || closeLabel }}
        </DialogTitle>

        <DialogDescription v-if="description" class="mw-dialog__description">
          {{ description }}
        </DialogDescription>
        <DialogDescription v-else class="mw-dialog__sr-only">
          {{ resolvedTitle || ariaLabel || closeLabel }}
        </DialogDescription>

        <div
          v-if="scopeText || $slots.scope || $slots.toolbar || $slots.lead"
          class="mw-dialog__lead"
        >
          <div v-if="scopeText || $slots.scope" class="mw-dialog__scope">
            <span v-if="scopeText" class="mw-dialog__scope-text">{{ scopeText }}</span>
            <slot name="scope" />
          </div>
          <div v-if="$slots.toolbar" class="mw-dialog__toolbar">
            <slot name="toolbar" />
          </div>
          <slot name="lead" />
        </div>

        <div
          v-scroll-fade
          class="mw-dialog__body"
          :class="[
            bodyScroll ? 'mw-scroll' : 'mw-dialog__body--locked',
            contentClass as any,
          ]"
          :style="contentStyle"
        >
          <slot />
          <slot v-if="$slots.empty" name="empty" />
        </div>

        <footer
          v-if="$slots['footer-left'] || $slots.footer"
          class="mw-dialog__footer mw-size-md"
          :class="{ 'mw-dialog__footer--split': Boolean($slots['footer-left']) }"
        >
          <div v-if="$slots['footer-left']" class="mw-dialog__footer-left">
            <slot name="footer-left" />
          </div>
          <div v-if="$slots.footer" class="mw-dialog__footer-right">
            <slot name="footer" />
          </div>
        </footer>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>

<style scoped>
.mw-dialog__overlay {
  position: fixed;
  inset: 0;
  z-index: var(--z-overlay);
  background: var(--scrim);
}

.mw-dialog__overlay[data-state="open"] {
  animation: mw-dialog-fade-in var(--duration-slow) var(--ease-emphasized);
}

.mw-dialog__overlay[data-state="closed"] {
  animation: mw-dialog-fade-out var(--duration-fast) var(--ease-exit);
}

.mw-dialog {
  position: fixed;
  top: 50%;
  left: 50%;
  translate: -50% -50%;
  z-index: calc(var(--z-overlay) + 1);
  display: flex;
  flex-direction: column;
  width: min(32rem, calc(100vw - var(--space-8)));
  max-width: calc(100vw - var(--space-8));
  max-height: calc(100vh - var(--space-8));
  border-radius: var(--radius-dialog);
  color: var(--text-primary);
  font-family: var(--font-sans);
  overflow: hidden;
}

.mw-dialog[data-state="open"] {
  animation: mw-dialog-enter var(--duration-slow) var(--ease-emphasized);
}

.mw-dialog[data-state="closed"] {
  animation: mw-dialog-fade-out var(--duration-fast) var(--ease-exit);
}

.mw-dialog:focus-visible {
  outline: none;
}

.mw-dialog--maximized {
  top: 0;
  left: 0;
  translate: none;
  width: 100vw !important;
  height: 100vh !important;
  max-width: 100vw !important;
  max-height: 100vh !important;
  border-radius: 0;
  border-color: transparent;
  background-color: var(--bg-surface); /* opaque-ok：最大化后底下没有可透出的内容 */
  -webkit-backdrop-filter: none;
  backdrop-filter: none;
}

.mw-dialog__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
  padding: var(--space-5) var(--space-5) var(--space-3);
  flex-shrink: 0;
}

.mw-dialog__title-row {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  min-width: 0;
  flex: 1 1 auto;
}

.mw-dialog__back {
  flex-shrink: 0;
  margin-inline-start: calc(-1 * var(--space-1));
}

.mw-dialog__title {
  margin: 0;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--text-primary);
  font-size: var(--type-title-size);
  font-weight: var(--weight-semibold);
  line-height: var(--type-title-line);
  letter-spacing: var(--tracking-title);
}

.mw-dialog__actions {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  flex-shrink: 0;
  margin-inline-end: calc(var(--space-1) * -1);
}

.mw-dialog__action-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: var(--size-sm-h);
  height: var(--size-sm-h);
  padding: 0;
  border: 0;
  border-radius: var(--size-sm-radius);
  background: transparent;
  color: var(--text-tertiary);
  cursor: pointer;
  transition:
    color var(--duration-fast) var(--ease-standard),
    background-color var(--duration-fast) var(--ease-standard);
}

.mw-dialog__action-btn :deep(svg) {
  width: var(--icon-md);
  height: var(--icon-md);
}

.mw-dialog__action-btn:hover {
  background-color: var(--fill-default);
  color: var(--text-primary);
}

.mw-dialog__action-btn:active {
  background-color: var(--fill-strong);
}

.mw-dialog__action-btn:focus-visible {
  outline: var(--focus-width) solid var(--focus-color);
  outline-offset: var(--focus-offset);
}

.mw-dialog__description {
  margin: 0;
  padding: 0 var(--space-5) var(--space-3);
  color: var(--text-secondary);
  font-size: var(--type-body-sm-size);
  line-height: var(--type-body-sm-line);
  flex-shrink: 0;
}

.mw-dialog__lead {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  padding: 0 var(--space-5) var(--space-3);
  flex-shrink: 0;
}

.mw-dialog__scope {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-md);
  background: var(--fill-subtle);
  border: var(--border-width) solid var(--border-subtle);
  color: var(--text-secondary);
  font-size: var(--type-caption-size);
  line-height: var(--type-caption-line);
  font-variant-numeric: tabular-nums;
}

.mw-dialog__scope-text {
  color: var(--text-secondary);
}

.mw-dialog__toolbar {
  display: flex;
  flex-direction: column;
  gap: var(--space-2-5);
}

.mw-dialog__body {
  flex: 1 1 auto;
  min-height: 0;
  padding: 0 var(--space-5) var(--space-5);
  color: var(--text-secondary);
  font-size: var(--type-body-size);
  line-height: var(--type-body-line);
}

.mw-dialog__body--locked {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  overflow: hidden;
}

.mw-dialog__body--locked :deep(.mw-datatable) {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
}

.mw-dialog__body--locked :deep(.mw-datatable__table-container) {
  flex: 1;
  min-height: 0;
  overflow: auto;
}

.mw-dialog__body :deep(.mw-datatable thead th) {
  position: sticky;
  top: 0;
  z-index: 2;
  background: var(--mw-datatable-head-bg, var(--bg-raised)); /* opaque-ok：吸顶表头必须实底遮挡下方滚动数据行 */
  white-space: nowrap;
}

.mw-dialog:not(:has(.mw-dialog__header)) .mw-dialog__body {
  padding-top: var(--space-5);
}

.mw-dialog:has(.mw-dialog__footer) .mw-dialog__body {
  padding-bottom: var(--space-2);
}

.mw-dialog__footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-5) var(--space-5);
  flex-shrink: 0;
}

.mw-dialog__footer--split {
  justify-content: space-between;
}

.mw-dialog__footer-left {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  color: var(--text-secondary);
  font-size: var(--type-body-sm-size);
  line-height: var(--type-body-sm-line);
}

.mw-dialog__footer-right {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  margin-inline-start: auto;
}

:global(.mw-dialog-grid) {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--space-3);
}

@media (max-width: 640px) {
  :global(.mw-dialog-grid) {
    grid-template-columns: minmax(0, 1fr);
  }
}

:global(.mw-dialog-span) {
  grid-column: 1 / -1;
}

:global(.mw-dialog-divider) {
  grid-column: 1 / -1;
  height: var(--border-width);
  background: var(--border-subtle);
  margin: var(--space-1) 0;
}

:global(.mw-dialog-section-title) {
  grid-column: 1 / -1;
  margin: 0;
  color: var(--text-secondary);
  font-size: var(--type-caption-size);
  line-height: var(--type-caption-line);
  font-weight: var(--weight-semibold);
}

:global(.mw-dialog-scroll) {
  max-height: min(26rem, 48vh);
  overflow: auto;
  border: var(--border-width) solid var(--border-subtle);
  border-radius: var(--radius-md);
}

:global(.mw-dialog-subform) {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: var(--space-2-5);
  padding: var(--space-3);
  border-radius: var(--radius-md);
  background: var(--fill-subtle);
  border: var(--border-width) solid var(--border-subtle);
  flex-shrink: 0;
}

.mw-dialog__sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

@keyframes mw-dialog-enter {
  from {
    opacity: 0;
    scale: var(--motion-enter-scale);
  }
}

@keyframes mw-dialog-fade-in {
  from {
    opacity: 0;
  }
}

@keyframes mw-dialog-fade-out {
  to {
    opacity: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .mw-dialog[data-state="open"] {
    animation-name: mw-dialog-fade-in;
  }

  .mw-dialog__action-btn {
    transition: none;
  }
}
</style>
