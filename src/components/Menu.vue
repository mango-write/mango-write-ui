<script setup lang="ts">
import {
  computed,
  nextTick,
  onBeforeUnmount,
  ref,
  useAttrs,
  watch,
  type StyleValue,
} from "vue";
import type { MenuItem, MenuItemSlotProps, MenuProps } from "./menu.js";

defineOptions({
  name: "MwMenu",
  inheritAttrs: false,
});

const props = withDefaults(defineProps<MenuProps>(), {
  model: () => [],
  popup: false,
  appendTo: "body",
  ariaLabel: undefined,
  ariaLabelledby: undefined,
});

const emit = defineEmits<{
  show: [];
  hide: [];
  focus: [event: FocusEvent];
  blur: [event: FocusEvent];
}>();

const attrs = useAttrs();
const VIEWPORT_PADDING = 8;

const isOpen = ref<boolean>(!props.popup);
const menuRef = ref<HTMLElement | null>(null);
const triggerEl = ref<HTMLElement | null>(null);
const position = ref<{ x: number; y: number }>({
  x: VIEWPORT_PADDING,
  y: VIEWPORT_PADDING,
});
const focusedIndex = ref<number>(-1);
let openingEvent: Event | null = null;
let lastHandledEvent: Event | null = null;

watch(
  () => props.popup,
  (isPopup) => {
    isOpen.value = !isPopup;
    if (!isPopup) {
      removeGlobalListeners();
    }
  },
  { flush: "sync" },
);

function isItemVisible(item: MenuItem): boolean {
  if (item.visible === undefined) return true;
  return typeof item.visible === "function"
    ? Boolean(item.visible())
    : Boolean(item.visible);
}

function isItemDisabled(item: MenuItem): boolean {
  return typeof item.disabled === "function"
    ? Boolean(item.disabled())
    : Boolean(item.disabled);
}

function resolveLabel(item: MenuItem): string {
  if (typeof item.label === "function") return item.label();
  return item.label ?? "";
}

type FlatMenuEntry =
  | { kind: "separator"; key: string; item: MenuItem }
  | { kind: "submenulabel"; key: string; item: MenuItem }
  | {
      kind: "item";
      key: string;
      item: MenuItem;
      navIndex: number;
    };

const flatEntries = computed<FlatMenuEntry[]>(() => {
  const result: FlatMenuEntry[] = [];
  let navCounter = 0;

  const list = Array.isArray(props.model) ? props.model : [];
  list.forEach((entry, idx) => {
    if (!isItemVisible(entry)) return;

    if (entry.separator) {
      result.push({
        kind: "separator",
        key: entry.key ?? `sep-${idx}`,
        item: entry,
      });
      return;
    }

    if (Array.isArray(entry.items)) {
      result.push({
        kind: "submenulabel",
        key: entry.key ?? `group-${idx}`,
        item: entry,
      });
      entry.items.forEach((sub, subIdx) => {
        if (!isItemVisible(sub)) return;
        if (sub.separator) {
          result.push({
            kind: "separator",
            key: sub.key ?? `sep-${idx}-${subIdx}`,
            item: sub,
          });
        } else {
          result.push({
            kind: "item",
            key: sub.key ?? `item-${idx}-${subIdx}`,
            item: sub,
            navIndex: navCounter++,
          });
        }
      });
      return;
    }

    result.push({
      kind: "item",
      key: entry.key ?? `item-${idx}`,
      item: entry,
      navIndex: navCounter++,
    });
  });

  return result;
});

const navigableItems = computed<Array<{ navIndex: number; item: MenuItem }>>(
  () =>
    flatEntries.value
      .filter(
        (e): e is Extract<FlatMenuEntry, { kind: "item" }> => e.kind === "item",
      )
      .map((e) => ({ navIndex: e.navIndex, item: e.item })),
);

function clampToViewport(
  x: number,
  y: number,
  el?: HTMLElement | null,
): { x: number; y: number } {
  const vw =
    typeof window !== "undefined" && window.innerWidth > 0
      ? window.innerWidth
      : 1024;
  const vh =
    typeof window !== "undefined" && window.innerHeight > 0
      ? window.innerHeight
      : 768;
  const rect = el?.getBoundingClientRect();
  const width = rect && rect.width > 0 ? rect.width : 180;
  const height = rect && rect.height > 0 ? rect.height : 0;
  const maxX = Math.max(VIEWPORT_PADDING, vw - width - VIEWPORT_PADDING);
  const maxY = Math.max(VIEWPORT_PADDING, vh - height - VIEWPORT_PADDING);
  return {
    x: Math.min(Math.max(VIEWPORT_PADDING, x), maxX),
    y: Math.min(Math.max(VIEWPORT_PADDING, y), maxY),
  };
}

function resolveAnchor(
  event?: Event | null,
  target?: HTMLElement | null,
): HTMLElement | null {
  if (target instanceof HTMLElement) return target;
  if (event?.currentTarget instanceof HTMLElement) return event.currentTarget;
  if (event?.target instanceof HTMLElement) return event.target;
  return null;
}

function computePosition(
  event?: Event | null,
  target?: HTMLElement | null,
): { x: number; y: number } {
  const anchor = resolveAnchor(event, target);
  if (anchor) {
    const rect = anchor.getBoundingClientRect();
    return clampToViewport(rect.left, rect.bottom + 4, menuRef.value);
  }
  if (event instanceof MouseEvent && (event.clientX > 0 || event.clientY > 0)) {
    return clampToViewport(event.clientX, event.clientY, menuRef.value);
  }
  return clampToViewport(VIEWPORT_PADDING, VIEWPORT_PADDING, menuRef.value);
}

let listenersAttached = false;

function addGlobalListeners() {
  if (
    listenersAttached ||
    typeof document === "undefined" ||
    typeof window === "undefined"
  ) {
    return;
  }
  listenersAttached = true;
  document.addEventListener("mousedown", onDocumentOutside, true);
  document.addEventListener("click", onDocumentOutsideClick, true);
  document.addEventListener("keydown", onDocumentKeydown);
  window.addEventListener("resize", onWindowResize);
}

function removeGlobalListeners() {
  if (
    !listenersAttached ||
    typeof document === "undefined" ||
    typeof window === "undefined"
  ) {
    return;
  }
  listenersAttached = false;
  document.removeEventListener("mousedown", onDocumentOutside, true);
  document.removeEventListener("click", onDocumentOutsideClick, true);
  document.removeEventListener("keydown", onDocumentKeydown);
  window.removeEventListener("resize", onWindowResize);
}

function onDocumentOutside(event: Event) {
  if (!props.popup || !isOpen.value) return;
  if (event === openingEvent) return;
  const target = event.target as Node | null;
  if (target && menuRef.value?.contains(target)) return;
  if (target && triggerEl.value?.contains(target)) return;
  hide();
}

function onDocumentOutsideClick(event: Event) {
  if (!props.popup || !isOpen.value) return;
  if (event === openingEvent) return;
  const target = event.target as Node | null;
  if (target && menuRef.value?.contains(target)) return;
  if (target && triggerEl.value?.contains(target)) return;
  hide();
}

function onDocumentKeydown(event: KeyboardEvent) {
  if (!props.popup || !isOpen.value) return;
  if (event.key === "Escape") {
    event.preventDefault();
    event.stopPropagation();
    const restore = triggerEl.value;
    hide();
    if (restore && typeof document !== "undefined" && document.contains(restore)) {
      restore.focus();
    }
  }
}

function onWindowResize() {
  if (!props.popup || !isOpen.value) return;
  hide();
}

function show(event?: Event, target?: HTMLElement) {
  if (!props.popup) return;
  openingEvent = event ?? null;
  triggerEl.value = resolveAnchor(event, target);
  position.value = computePosition(event, target);
  focusedIndex.value = findFirstEnabledIndex();
  const wasOpen = isOpen.value;
  isOpen.value = true;
  addGlobalListeners();
  if (!wasOpen) {
    emit("show");
  }
  void nextTick(() => {
    position.value = computePosition(event, target);
    menuRef.value?.focus();
    openingEvent = null;
  });
}

function hide() {
  if (!props.popup) return;
  const wasOpen = isOpen.value;
  isOpen.value = false;
  focusedIndex.value = -1;
  openingEvent = null;
  removeGlobalListeners();
  if (wasOpen) {
    emit("hide");
  }
}

function toggle(event?: Event, target?: HTMLElement) {
  if (!props.popup) return;
  if (isOpen.value) {
    hide();
  } else {
    show(event, target);
  }
}

function findFirstEnabledIndex(): number {
  const found = navigableItems.value.find((e) => !isItemDisabled(e.item));
  return found ? found.navIndex : -1;
}

function moveFocus(direction: "next" | "prev" | "first" | "last") {
  const enabled = navigableItems.value.filter((e) => !isItemDisabled(e.item));
  if (enabled.length === 0) return;

  if (direction === "first") {
    focusedIndex.value = enabled[0]!.navIndex;
    return;
  }
  if (direction === "last") {
    focusedIndex.value = enabled[enabled.length - 1]!.navIndex;
    return;
  }

  const currentPos = enabled.findIndex((e) => e.navIndex === focusedIndex.value);
  if (currentPos === -1) {
    focusedIndex.value =
      direction === "next"
        ? enabled[0]!.navIndex
        : enabled[enabled.length - 1]!.navIndex;
    return;
  }

  const nextPos =
    direction === "next"
      ? (currentPos + 1) % enabled.length
      : (currentPos - 1 + enabled.length) % enabled.length;
  focusedIndex.value = enabled[nextPos]!.navIndex;
}

function onItemClick(event: Event, item: MenuItem) {
  if (lastHandledEvent === event) return;
  lastHandledEvent = event;

  if (isItemDisabled(item)) {
    event.preventDefault();
    event.stopPropagation();
    return;
  }

  if (!item.url) {
    event.preventDefault();
  }

  item.command?.({ originalEvent: event, item });

  if (props.popup) {
    hide();
  }
}

function getItemSlotProps(item: MenuItem): MenuItemSlotProps {
  const disabled = isItemDisabled(item);
  return {
    action: {
      class: "mw-menu__item-link p-menu-item-link",
      href: item.url || undefined,
      target: item.target || undefined,
      role: "menuitem",
      tabindex: -1,
      "aria-disabled": disabled || undefined,
      onClick: (event: MouseEvent) => onItemClick(event, item),
    },
    icon: {
      class: ["mw-menu__item-icon", "p-menu-item-icon", item.icon]
        .filter(Boolean)
        .join(" "),
      "aria-hidden": "true",
    },
    label: {
      class: "mw-menu__item-label p-menu-item-label",
    },
  };
}

function onMenuKeydown(event: KeyboardEvent) {
  if (event.key === "ArrowDown") {
    event.preventDefault();
    moveFocus("next");
  } else if (event.key === "ArrowUp") {
    event.preventDefault();
    moveFocus("prev");
  } else if (event.key === "Home") {
    event.preventDefault();
    moveFocus("first");
  } else if (event.key === "End") {
    event.preventDefault();
    moveFocus("last");
  } else if (event.key === "Enter" || event.key === " ") {
    const activeEntry = navigableItems.value.find(
      (e) => e.navIndex === focusedIndex.value,
    );
    if (activeEntry && !isItemDisabled(activeEntry.item)) {
      event.preventDefault();
      onItemClick(event, activeEntry.item);
    }
  } else if (event.key === "Escape" && props.popup) {
    event.preventDefault();
    event.stopPropagation();
    const restore = triggerEl.value;
    hide();
    if (restore && typeof document !== "undefined" && document.contains(restore)) {
      restore.focus();
    }
  }
}

const teleportDisabled = computed(
  () => !props.popup || props.appendTo === "self",
);
const teleportTarget = computed(() =>
  props.appendTo && props.appendTo !== "self" ? props.appendTo : "body",
);

const rootClass = computed(() => [
  "mw-menu",
  "p-menu",
  {
    "mw-menu--popup": props.popup,
    "p-menu-overlay": props.popup,
    "mw-glass": props.popup,
  },
  attrs.class,
]);

const rootStyle = computed<StyleValue>(() => {
  if (!props.popup) {
    return attrs.style as StyleValue;
  }
  return [
    {
      position: "fixed",
      left: `${position.value.x}px`,
      top: `${position.value.y}px`,
    },
    attrs.style as StyleValue,
  ];
});

const rootAttrs = computed(() => {
  const { class: _class, style: _style, ...rest } = attrs;
  return rest;
});

onBeforeUnmount(() => {
  removeGlobalListeners();
  triggerEl.value = null;
  openingEvent = null;
  lastHandledEvent = null;
});

defineExpose({
  toggle,
  show,
  hide,
});
</script>

<template>
  <Teleport :to="teleportTarget" :disabled="teleportDisabled">
    <div
      v-if="!popup || isOpen"
      ref="menuRef"
      v-bind="rootAttrs"
      :class="rootClass"
      :style="rootStyle"
      :tabindex="popup ? -1 : 0"
      @keydown="onMenuKeydown"
      @focus="emit('focus', $event)"
      @blur="emit('blur', $event)"
    >
      <div v-if="$slots.start" class="mw-menu__start p-menu-start">
        <slot name="start" />
      </div>

      <ul
        class="mw-menu__list p-menu-list"
        role="menu"
        :aria-label="ariaLabel"
        :aria-labelledby="ariaLabelledby"
      >
        <template v-for="entry in flatEntries" :key="entry.key">
          <li
            v-if="entry.kind === 'separator'"
            class="mw-menu__separator p-menu-separator"
            :class="entry.item.class"
            :style="entry.item.style"
            role="separator"
          />

          <li
            v-else-if="entry.kind === 'submenulabel'"
            class="mw-menu__submenu-label p-menu-submenu-label"
            :class="entry.item.class"
            :style="entry.item.style"
            role="presentation"
          >
            <slot
              name="submenulabel"
              :item="entry.item"
              :label="resolveLabel(entry.item)"
            >
              {{ resolveLabel(entry.item) }}
            </slot>
          </li>

          <li
            v-else
            class="mw-menu__item p-menu-item"
            :class="[
              {
                'mw-menu__item--disabled': isItemDisabled(entry.item),
                'p-disabled': isItemDisabled(entry.item),
                'mw-menu__item--focused': focusedIndex === entry.navIndex,
                'p-focus': focusedIndex === entry.navIndex,
              },
              entry.item.class,
            ]"
            :style="entry.item.style"
            role="menuitem"
            :aria-label="resolveLabel(entry.item) || undefined"
            :aria-disabled="isItemDisabled(entry.item) || undefined"
            :data-disabled="isItemDisabled(entry.item) ? '' : undefined"
            :data-highlighted="focusedIndex === entry.navIndex ? '' : undefined"
            @mouseenter="focusedIndex = entry.navIndex"
          >
            <div
              class="mw-menu__item-content p-menu-item-content"
              @click="onItemClick($event, entry.item)"
            >
              <slot
                v-if="$slots.item"
                name="item"
                :item="entry.item"
                :label="resolveLabel(entry.item)"
                :props="getItemSlotProps(entry.item)"
              />
              <a
                v-else
                :href="entry.item.url || undefined"
                :target="entry.item.target || undefined"
                class="mw-menu__item-link p-menu-item-link"
                tabindex="-1"
                :aria-disabled="isItemDisabled(entry.item) || undefined"
                @click="onItemClick($event, entry.item)"
              >
                <span
                  v-if="entry.item.icon"
                  class="mw-menu__item-icon p-menu-item-icon"
                  :class="entry.item.icon"
                  aria-hidden="true"
                />
                <span class="mw-menu__item-label p-menu-item-label">
                  {{ resolveLabel(entry.item) }}
                </span>
              </a>
            </div>
          </li>
        </template>
      </ul>

      <div v-if="$slots.end" class="mw-menu__end p-menu-end">
        <slot name="end" />
      </div>
    </div>
  </Teleport>
</template>

<style>
.mw-menu {
  min-width: 12rem;
  padding: var(--space-1);
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-md);
  background-color: var(--color-surface-base);
  color: var(--color-text-primary);
  font-family: var(--font-family-sans);
  font-size: var(--font-size-body-sm);
  line-height: var(--line-height-body);
  outline: none;
}

.mw-menu--popup {
  z-index: var(--z-floating);
  border-color: var(--material-hairline);
}

.mw-menu__list {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.mw-menu__submenu-label {
  padding: var(--space-1) var(--space-2);
  color: var(--color-text-tertiary);
  font-size: var(--font-size-caption);
  font-weight: 600;
}

.mw-menu__separator {
  height: 1px;
  margin: var(--space-1) var(--space-2);
  background-color: var(--material-inlay-border);
}

.mw-menu__item {
  list-style: none;
}

.mw-menu__item-content {
  border-radius: var(--radius-sm);
  transition:
    background-color var(--motion-duration-fast) var(--motion-ease-standard),
    color var(--motion-duration-fast) var(--motion-ease-standard);
}

.mw-menu__item:not([data-disabled]) .mw-menu__item-content:hover,
.mw-menu__item:not([data-disabled])[data-highlighted] .mw-menu__item-content {
  background-color: var(--material-hover);
}

.mw-menu__item--disabled,
.mw-menu__item[data-disabled] {
  opacity: var(--opacity-disabled);
  cursor: not-allowed;
}

.mw-menu__item-link {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  width: 100%;
  box-sizing: border-box;
  padding: 6px 10px;
  border-radius: var(--radius-sm);
  color: inherit;
  text-decoration: none;
  cursor: pointer;
  user-select: none;
  outline: none;
}

.mw-menu__item--disabled .mw-menu__item-link,
.mw-menu__item[data-disabled] .mw-menu__item-link {
  cursor: not-allowed;
}

.mw-menu__item-icon {
  flex-shrink: 0;
  color: var(--color-text-secondary);
}

.mw-menu__item-label {
  flex: 1 1 auto;
  min-width: 0;
}

@media (prefers-reduced-motion: reduce) {
  .mw-menu__item-content {
    transition: none;
  }
}
</style>
