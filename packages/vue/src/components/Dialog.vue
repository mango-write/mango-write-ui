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
