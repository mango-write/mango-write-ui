<script setup lang="ts">
import {
  computed,
  onBeforeUnmount,
  ref,
  useAttrs,
  watch,
  type StyleValue,
} from "vue";
import {
  PopoverAnchor,
  PopoverContent,
  PopoverPortal,
  PopoverRoot,
  PopoverTrigger,
} from "reka-ui";

defineOptions({
  name: "MwPopover",
  inheritAttrs: false,
});

export interface PopoverProps {
  /** 受控打开状态 */
  open?: boolean;
  /** 非受控初始打开状态 */
  defaultOpen?: boolean;
  /** 是否为模态浮层（默认 false） */
  modal?: boolean;
  /** 优先弹出方向（默认 'bottom'） */
  side?: "top" | "right" | "bottom" | "left";
  /** 与锚点的主轴间距（默认 6） */
  sideOffset?: number;
  /** 交叉轴对齐方式（默认 'start'） */
  align?: "start" | "center" | "end";
  /** 交叉轴偏移量（默认 0） */
  alignOffset?: number;
  /** 视口边缘碰撞自动翻转（默认 true） */
  avoidCollisions?: boolean;
  /** 点击外部是否自动关闭（默认 true） */
  dismissable?: boolean;
  /** 按下 Escape 是否可关闭（默认 true） */
  closeOnEscape?: boolean;
  /** 挂载目标容器（传 `'self'` 时禁用 Portal 原地挂载，默认 `'body'`） */
  appendTo?: string | HTMLElement;
  /** 浮层无障碍标签 */
  ariaLabel?: string;
}

const props = withDefaults(defineProps<PopoverProps>(), {
  open: undefined,
  defaultOpen: false,
  modal: false,
  side: "bottom",
  sideOffset: 6,
  align: "start",
  alignOffset: 0,
  avoidCollisions: true,
  dismissable: true,
  closeOnEscape: true,
  appendTo: undefined,
  ariaLabel: undefined,
});

const emit = defineEmits<{
  "update:open": [value: boolean];
  show: [];
  hide: [];
}>();

const attrs = useAttrs();

const internalOpen = ref<boolean>(props.open ?? props.defaultOpen ?? false);
const anchorEl = ref<HTMLElement | null>(null);
const interactedOutside = ref(false);

watch(
  () => props.open,
  (val) => {
    if (val !== undefined) {
      internalOpen.value = val;
    }
  },
  { flush: "sync" },
);

const isOpen = computed(() =>
  props.open !== undefined ? props.open : internalOpen.value,
);

watch(
  isOpen,
  (next, prev) => {
    if (next && !prev) {
      interactedOutside.value = false;
      emit("show");
    } else if (!next && prev) {
      emit("hide");
    }
  },
  { flush: "sync" },
);

function setOpen(next: boolean) {
  if (next === isOpen.value && props.open !== undefined) {
    return;
  }
  internalOpen.value = next;
  emit("update:open", next);
}

function resolveAnchor(
  eventOrEl?: Event | HTMLElement | null,
  target?: HTMLElement | EventTarget | null,
): HTMLElement | null {
  if (target && target instanceof HTMLElement) {
    return target;
  }
  if (eventOrEl && eventOrEl instanceof HTMLElement) {
    return eventOrEl;
  }
  const ev = eventOrEl as Event | undefined | null;
  const candidate = (ev?.currentTarget ?? ev?.target) as HTMLElement | null;
  if (candidate && candidate instanceof HTMLElement) {
    return candidate;
  }
  return null;
}

function show(
  event?: Event | HTMLElement | null,
  target?: HTMLElement | EventTarget | null,
) {
  const resolved = resolveAnchor(event, target);
  if (resolved) {
    anchorEl.value = resolved;
  }
  setOpen(true);
}

function hide() {
  setOpen(false);
}

function toggle(
  event?: Event | HTMLElement | null,
  target?: HTMLElement | EventTarget | null,
) {
  const resolved = resolveAnchor(event, target);
  if (resolved) {
    if (isOpen.value && anchorEl.value && anchorEl.value !== resolved) {
      anchorEl.value = resolved;
      return;
    }
    anchorEl.value = resolved;
  }
  setOpen(!isOpen.value);
}

const portalDisabled = computed(() => props.appendTo === "self");
const portalTo = computed(() =>
  props.appendTo && props.appendTo !== "self" ? props.appendTo : "body",
);

const contentClass = computed(() => ["mw-popover", "mw-glass", attrs.class]);
const contentStyle = computed<StyleValue>(() => attrs.style as StyleValue);
const contentAttrs = computed(() => {
  const { class: _class, style: _style, ...rest } = attrs;
  return rest;
});

function extractOriginalTarget(event: Event): Node | null {
  const custom = event as CustomEvent<{ originalEvent?: Event }>;
  const target = custom.detail?.originalEvent?.target ?? event.target;
  return target instanceof Node ? target : null;
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
    if (anchorEl.value && document.contains(anchorEl.value)) {
      anchorEl.value.focus();
    }
  }
}

function onPointerDownOutside(event: Event) {
  if (!props.dismissable) {
    event.preventDefault();
    return;
  }
  const target = extractOriginalTarget(event);
  if (target && anchorEl.value?.contains(target)) {
    event.preventDefault();
    return;
  }
  interactedOutside.value = true;
}

function onInteractOutside(event: Event) {
  if (!props.dismissable) {
    event.preventDefault();
    return;
  }
  const target = extractOriginalTarget(event);
  if (target && anchorEl.value?.contains(target)) {
    event.preventDefault();
    return;
  }
  interactedOutside.value = true;
}

function onCloseAutoFocus(event: Event) {
  if (!interactedOutside.value && anchorEl.value && document.contains(anchorEl.value)) {
    event.preventDefault();
    anchorEl.value.focus();
  }
  interactedOutside.value = false;
}

onBeforeUnmount(() => {
  anchorEl.value = null;
});

defineExpose({
  toggle,
  show,
  hide,
  open: isOpen,
});
</script>

<template>
  <PopoverRoot :open="isOpen" :modal="modal" @update:open="setOpen">
    <PopoverTrigger v-if="$slots.trigger" as-child>
      <slot name="trigger" :open="isOpen" :toggle="toggle" :show="show" :hide="hide" />
    </PopoverTrigger>
    <PopoverAnchor v-if="anchorEl || !$slots.trigger" :reference="anchorEl ?? undefined" />

    <PopoverPortal :to="portalTo" :disabled="portalDisabled">
      <PopoverContent
        v-bind="contentAttrs"
        :class="contentClass"
        :style="contentStyle"
        :side="side"
        :side-offset="sideOffset"
        :align="align"
        :align-offset="alignOffset"
        :avoid-collisions="avoidCollisions"
        :reference="anchorEl ?? undefined"
        :aria-label="ariaLabel || (contentAttrs['aria-label'] as string | undefined)"
        @escape-key-down="onEscapeKeyDown"
        @pointer-down-outside="onPointerDownOutside"
        @interact-outside="onInteractOutside"
        @close-auto-focus="onCloseAutoFocus"
        @keydown="onContentKeydown"
      >
        <slot :open="isOpen" :close="hide" :hide="hide" />
      </PopoverContent>
    </PopoverPortal>
  </PopoverRoot>
</template>

<style scoped>
.mw-popover {
  z-index: var(--z-floating);
  min-width: 10rem;
  max-width: min(24rem, calc(100vw - 1.5rem));
  padding: var(--space-3);
  border: 1px solid var(--material-hairline);
  border-radius: var(--radius-lg);
  color: var(--color-text-primary);
  font-family: var(--font-family-sans);
  font-size: var(--font-size-body-sm);
  line-height: var(--line-height-body);
  outline: none;
  transition:
    opacity var(--motion-duration-fast) var(--motion-ease-standard),
    transform var(--motion-duration-fast) var(--motion-ease-standard);
}

@media (prefers-reduced-motion: reduce) {
  .mw-popover {
    transition: none;
  }
}
</style>
