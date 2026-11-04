<script setup lang="ts">
import {
  computed,
  nextTick,
  onBeforeUnmount,
  ref,
  useAttrs,
  watch,
  type Directive,
  type StyleValue,
} from "vue";
import { vTooltip as vMwTooltip } from "../lib/tooltip";
import type { ActionMenuItem } from "./action-menu";

defineOptions({
  name: "MwActionMenu",
  inheritAttrs: false,
});

export interface ActionMenuProps {
  items: ActionMenuItem[];
  open?: boolean;
}

const props = withDefaults(defineProps<ActionMenuProps>(), {
  open: undefined,
});

const emit = defineEmits<{
  "update:open": [value: boolean];
  show: [];
  hide: [];
}>();

const vTooltip = vMwTooltip as unknown as Directive<HTMLElement, string | undefined>;
const attrs = useAttrs();

const VIEWPORT_PADDING = 8;

const internalOpen = ref<boolean>(props.open ?? false);
const menuRef = ref<HTMLElement | null>(null);
const triggerEl = ref<HTMLElement | null>(null);
const position = ref<{ x: number; y: number }>({ x: VIEWPORT_PADDING, y: VIEWPORT_PADDING });

const focusedIndex = ref<number>(-1);
const activeSubmenuIndex = ref<number | null>(null);
const submenuFocusedIndex = ref<number>(-1);

const itemRefs = new Map<number, HTMLButtonElement>();
const subItemRefs = new Map<number, HTMLButtonElement>();

function setItemRef(index: number, el: HTMLButtonElement | null) {
  if (el) {
    itemRefs.set(index, el);
  } else {
    itemRefs.delete(index);
  }
}

function setSubItemRef(index: number, el: HTMLButtonElement | null) {
  if (el) {
    subItemRefs.set(index, el);
  } else {
    subItemRefs.delete(index);
  }
}

function isItemVisible(item: ActionMenuItem): boolean {
  if (item.visible === undefined) return true;
  return typeof item.visible === "function" ? Boolean(item.visible()) : Boolean(item.visible);
}

function isItemDisabled(item: ActionMenuItem): boolean {
  return typeof item.disabled === "function" ? Boolean(item.disabled()) : Boolean(item.disabled);
}

function resolveLabel(item: ActionMenuItem): string {
  if (typeof item.label === "function") return item.label();
  return item.label ?? "";
}

function getSubItems(item: ActionMenuItem): ActionMenuItem[] {
  const raw = item.children ?? item.items;
  if (!Array.isArray(raw)) return [];
  return raw.filter(isItemVisible);
}

function hasSubmenu(item: ActionMenuItem): boolean {
  return !isItemDisabled(item) && getSubItems(item).length > 0;
}

const visibleItems = computed<ActionMenuItem[]>(() =>
  (props.items ?? []).filter(isItemVisible),
);

const isOpen = computed<boolean>(() =>
  props.open !== undefined ? props.open : internalOpen.value,
);

const rootClass = computed(() => ["mw-action-menu", "mw-glass", attrs.class]);
const rootAttrs = computed(() => {
  const { class: _class, style: _style, ...rest } = attrs;
  return rest;
});

const floatingStyle = computed<StyleValue>(() => [
  {
    left: `${position.value.x}px`,
    top: `${position.value.y}px`,
  },
  attrs.style as StyleValue,
]);

function clampToViewport(x: number, y: number, menuEl?: HTMLElement | null): { x: number; y: number } {
  const vw = typeof window !== "undefined" && window.innerWidth > 0 ? window.innerWidth : 1024;
  const vh = typeof window !== "undefined" && window.innerHeight > 0 ? window.innerHeight : 768;
  const rect = menuEl?.getBoundingClientRect();
  const width = rect && rect.width > 0 ? rect.width : 200;
  const height = rect && rect.height > 0 ? rect.height : 0;
  const maxX = Math.max(VIEWPORT_PADDING, vw - width - VIEWPORT_PADDING);
  const maxY = Math.max(VIEWPORT_PADDING, vh - height - VIEWPORT_PADDING);
  return {
    x: Math.min(Math.max(VIEWPORT_PADDING, x), maxX),
    y: Math.min(Math.max(VIEWPORT_PADDING, y), maxY),
  };
}

function resolveAnchorElement(
  event?: Event | null,
  target?: HTMLElement | null,
): HTMLElement | null {
  if (target instanceof HTMLElement) return target;
  if (event?.currentTarget instanceof HTMLElement) return event.currentTarget;
  if (event?.target instanceof HTMLElement) return event.target;
  if (
    typeof document !== "undefined" &&
    document.activeElement instanceof HTMLElement &&
    document.activeElement !== document.body
  ) {
    return document.activeElement;
  }
  return null;
}

function computeCoordinates(
  event?: Event | null,
  target?: HTMLElement | null,
): { x: number; y: number } {
  if (
    !target &&
    event instanceof MouseEvent &&
    (event.type === "contextmenu" || event.clientX > 0 || event.clientY > 0)
  ) {
    return clampToViewport(event.clientX, event.clientY, menuRef.value);
  }

  const anchor =
    target instanceof HTMLElement
      ? target
      : event?.currentTarget instanceof HTMLElement
        ? event.currentTarget
        : event?.target instanceof HTMLElement
          ? event.target
          : null;

  if (anchor) {
    const rect = anchor.getBoundingClientRect();
    return clampToViewport(rect.left, rect.bottom + 4, menuRef.value);
  }

  if (event instanceof MouseEvent) {
    return clampToViewport(event.clientX, event.clientY, menuRef.value);
  }

  return clampToViewport(VIEWPORT_PADDING, VIEWPORT_PADDING, menuRef.value);
}

let listenersAttached = false;

function addGlobalListeners() {
  if (listenersAttached || typeof document === "undefined" || typeof window === "undefined") {
    return;
  }
  listenersAttached = true;
  document.addEventListener("pointerdown", onDocumentPointerDown, true);
  document.addEventListener("mousedown", onDocumentPointerDown, true);
  document.addEventListener("keydown", onDocumentKeydown);
  window.addEventListener("scroll", onWindowScroll, true);
  window.addEventListener("resize", onWindowResize);
}

function removeGlobalListeners() {
  if (!listenersAttached || typeof document === "undefined" || typeof window === "undefined") {
    return;
  }
  listenersAttached = false;
  document.removeEventListener("pointerdown", onDocumentPointerDown, true);
  document.removeEventListener("mousedown", onDocumentPointerDown, true);
  document.removeEventListener("keydown", onDocumentKeydown);
  window.removeEventListener("scroll", onWindowScroll, true);
  window.removeEventListener("resize", onWindowResize);
}

function resetMenuState() {
  focusedIndex.value = -1;
  activeSubmenuIndex.value = null;
  submenuFocusedIndex.value = -1;
  itemRefs.clear();
  subItemRefs.clear();
}

watch(
  () => props.open,
  (val) => {
    if (val !== undefined) {
      internalOpen.value = val;
    }
  },
  { flush: "sync" },
);

watch(
  isOpen,
  (next, prev) => {
    if (next && !prev) {
      addGlobalListeners();
      emit("show");
      void nextTick(() => {
        position.value = clampToViewport(position.value.x, position.value.y, menuRef.value);
        menuRef.value?.focus();
      });
    } else if (!next && prev) {
      removeGlobalListeners();
      resetMenuState();
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

function show(event: Event, target?: HTMLElement | null) {
  triggerEl.value = resolveAnchorElement(event, target);
  position.value = computeCoordinates(event, target);
  focusedIndex.value = -1;
  activeSubmenuIndex.value = null;
  submenuFocusedIndex.value = -1;

  if (isOpen.value) {
    void nextTick(() => {
      position.value = clampToViewport(position.value.x, position.value.y, menuRef.value);
      menuRef.value?.focus();
    });
    return;
  }

  setOpen(true);
}

function hide() {
  if (!isOpen.value && !internalOpen.value) {
    removeGlobalListeners();
    return;
  }
  setOpen(false);
}

function toggle(event: Event, target?: HTMLElement | null) {
  if (isOpen.value) {
    hide();
  } else {
    show(event, target);
  }
}

function activateLeafItem(event: Event, item: ActionMenuItem) {
  item.command?.({ originalEvent: event, item });
  if (typeof item.url === "string" && item.url && typeof window !== "undefined") {
    window.open(
      item.url,
      typeof item.target === "string" ? item.target : "_self",
      item.target === "_blank" ? "noopener,noreferrer" : undefined,
    );
  }
  hide();
}

function onRowMouseEnter(index: number, item: ActionMenuItem) {
  focusedIndex.value = index;
  submenuFocusedIndex.value = -1;
  if (hasSubmenu(item)) {
    activeSubmenuIndex.value = index;
  } else {
    activeSubmenuIndex.value = null;
  }
}

function onSubRowMouseEnter(subIndex: number) {
  submenuFocusedIndex.value = subIndex;
}

function onItemClick(event: MouseEvent, index: number, item: ActionMenuItem) {
  if (isItemDisabled(item)) {
    event.preventDefault();
    return;
  }
  if (getSubItems(item).length > 0) {
    activeSubmenuIndex.value = index;
    return;
  }
  activateLeafItem(event, item);
}

function onSubItemClick(event: MouseEvent, subItem: ActionMenuItem) {
  if (isItemDisabled(subItem)) {
    event.preventDefault();
    return;
  }
  activateLeafItem(event, subItem);
}

function getNavigableIndices(list: ActionMenuItem[]): number[] {
  const indices: number[] = [];
  for (let i = 0; i < list.length; i += 1) {
    const entry = list[i];
    if (!entry.separator && !isItemDisabled(entry)) {
      indices.push(i);
    }
  }
  if (indices.length > 0) return indices;
  for (let i = 0; i < list.length; i += 1) {
    if (!list[i].separator) {
      indices.push(i);
    }
  }
  return indices;
}

function findMovedIndex(
  list: ActionMenuItem[],
  current: number,
  direction: "next" | "prev" | "first" | "last",
): number {
  const indices = getNavigableIndices(list);
  if (indices.length === 0) return -1;
  if (direction === "first") return indices[0];
  if (direction === "last") return indices[indices.length - 1];

  const pos = indices.indexOf(current);
  if (direction === "next") {
    if (pos === -1) return indices[0];
    return indices[(pos + 1) % indices.length];
  }
  if (pos === -1) return indices[indices.length - 1];
  return indices[(pos - 1 + indices.length) % indices.length];
}

function focusRootItem(index: number) {
  focusedIndex.value = index;
  if (activeSubmenuIndex.value !== null && activeSubmenuIndex.value !== index) {
    activeSubmenuIndex.value = null;
    submenuFocusedIndex.value = -1;
  }
  void nextTick(() => {
    itemRefs.get(index)?.focus();
  });
}

function focusSubItem(subIndex: number) {
  submenuFocusedIndex.value = subIndex;
  void nextTick(() => {
    subItemRefs.get(subIndex)?.focus();
  });
}

function onMenuKeydown(event: KeyboardEvent) {
  if (!isOpen.value) return;

  const inSubmenu = activeSubmenuIndex.value !== null && submenuFocusedIndex.value >= 0;
  const activeParent =
    activeSubmenuIndex.value !== null ? visibleItems.value[activeSubmenuIndex.value] : undefined;
  const subList = activeParent ? getSubItems(activeParent) : [];

  if (event.key === "Escape") {
    event.preventDefault();
    event.stopPropagation();
    const restoreTarget = triggerEl.value;
    hide();
    if (
      restoreTarget &&
      typeof restoreTarget.focus === "function" &&
      typeof document !== "undefined" &&
      document.contains(restoreTarget)
    ) {
      restoreTarget.focus();
    }
    return;
  }

  if (event.key === "ArrowDown") {
    event.preventDefault();
    event.stopPropagation();
    if (inSubmenu && subList.length > 0) {
      const nextSub = findMovedIndex(subList, submenuFocusedIndex.value, "next");
      if (nextSub >= 0) focusSubItem(nextSub);
      return;
    }
    const nextIdx = findMovedIndex(visibleItems.value, focusedIndex.value, "next");
    if (nextIdx >= 0) focusRootItem(nextIdx);
    return;
  }

  if (event.key === "ArrowUp") {
    event.preventDefault();
    event.stopPropagation();
    if (inSubmenu && subList.length > 0) {
      const prevSub = findMovedIndex(subList, submenuFocusedIndex.value, "prev");
      if (prevSub >= 0) focusSubItem(prevSub);
      return;
    }
    const prevIdx = findMovedIndex(visibleItems.value, focusedIndex.value, "prev");
    if (prevIdx >= 0) focusRootItem(prevIdx);
    return;
  }

  if (event.key === "Home") {
    event.preventDefault();
    event.stopPropagation();
    if (inSubmenu && subList.length > 0) {
      const firstSub = findMovedIndex(subList, submenuFocusedIndex.value, "first");
      if (firstSub >= 0) focusSubItem(firstSub);
      return;
    }
    const firstIdx = findMovedIndex(visibleItems.value, focusedIndex.value, "first");
    if (firstIdx >= 0) focusRootItem(firstIdx);
    return;
  }

  if (event.key === "End") {
    event.preventDefault();
    event.stopPropagation();
    if (inSubmenu && subList.length > 0) {
      const lastSub = findMovedIndex(subList, submenuFocusedIndex.value, "last");
      if (lastSub >= 0) focusSubItem(lastSub);
      return;
    }
    const lastIdx = findMovedIndex(visibleItems.value, focusedIndex.value, "last");
    if (lastIdx >= 0) focusRootItem(lastIdx);
    return;
  }

  if (event.key === "ArrowRight") {
    const idx =
      focusedIndex.value >= 0
        ? focusedIndex.value
        : findMovedIndex(visibleItems.value, -1, "first");
    const currentItem = idx >= 0 ? visibleItems.value[idx] : undefined;
    if (currentItem && hasSubmenu(currentItem)) {
      event.preventDefault();
      event.stopPropagation();
      focusedIndex.value = idx;
      activeSubmenuIndex.value = idx;
      const children = getSubItems(currentItem);
      const firstSub = findMovedIndex(children, -1, "first");
      if (firstSub >= 0) {
        focusSubItem(firstSub);
      }
    }
    return;
  }

  if (event.key === "ArrowLeft") {
    if (activeSubmenuIndex.value !== null) {
      event.preventDefault();
      event.stopPropagation();
      const parentIdx = activeSubmenuIndex.value;
      activeSubmenuIndex.value = null;
      submenuFocusedIndex.value = -1;
      focusedIndex.value = parentIdx;
      void nextTick(() => {
        itemRefs.get(parentIdx)?.focus();
      });
    }
    return;
  }

  if (event.key === "Enter" || event.key === " ") {
    if (inSubmenu && subList.length > 0) {
      const subItem = subList[submenuFocusedIndex.value];
      if (subItem && !subItem.separator) {
        event.preventDefault();
        event.stopPropagation();
        if (!isItemDisabled(subItem)) {
          activateLeafItem(event, subItem);
        }
      }
      return;
    }

    const idx = focusedIndex.value;
    const item = idx >= 0 ? visibleItems.value[idx] : undefined;
    if (!item || item.separator) return;
    event.preventDefault();
    event.stopPropagation();
    if (isItemDisabled(item)) return;

    if (getSubItems(item).length > 0) {
      activeSubmenuIndex.value = idx;
      const firstSub = findMovedIndex(getSubItems(item), -1, "first");
      if (firstSub >= 0) {
        focusSubItem(firstSub);
      }
      return;
    }

    activateLeafItem(event, item);
  }
}

function onDocumentKeydown(event: KeyboardEvent) {
  if (!isOpen.value) return;
  if (menuRef.value && event.target instanceof Node && menuRef.value.contains(event.target)) {
    return;
  }
  onMenuKeydown(event);
}

function onDocumentPointerDown(event: Event) {
  if (!isOpen.value) return;
  const target = event.target as Node | null;
  if (target && menuRef.value?.contains(target)) {
    return;
  }
  hide();
}

function onWindowScroll(event: Event) {
  if (!isOpen.value) return;
  const target = event.target as Node | null;
  if (target && menuRef.value?.contains(target)) {
    return;
  }
  hide();
}

function onWindowResize() {
  if (!isOpen.value) return;
  hide();
}

onBeforeUnmount(() => {
  removeGlobalListeners();
  resetMenuState();
  triggerEl.value = null;
});

defineExpose({
  show,
  hide,
  toggle,
});
</script>

<template>
  <Teleport to="body">
    <div
      v-if="isOpen"
      ref="menuRef"
      v-bind="rootAttrs"
      :class="rootClass"
      :style="floatingStyle"
      role="menu"
      tabindex="-1"
      @keydown="onMenuKeydown"
    >
      <template v-for="(item, index) in visibleItems" :key="item.key ?? index">
        <div
          v-if="item.separator"
          role="separator"
          class="mw-action-menu__separator"
        />
        <div
          v-else
          class="mw-action-menu__row"
          :class="[
            isItemDisabled(item) && 'mw-action-menu__row--disabled',
            activeSubmenuIndex === index && 'mw-action-menu__row--expanded',
            item.class,
          ]"
          :style="item.style"
          @mouseenter="onRowMouseEnter(index, item)"
        >
          <button
            :ref="(el) => setItemRef(index, el as HTMLButtonElement | null)"
            type="button"
            role="menuitem"
            class="mw-action-menu__item"
            :class="[
              item.danger && 'mw-action-menu__item--danger',
              isItemDisabled(item) && 'mw-action-menu__item--disabled',
            ]"
            :aria-disabled="isItemDisabled(item) || undefined"
            :aria-haspopup="getSubItems(item).length > 0 ? 'menu' : undefined"
            :aria-expanded="
              getSubItems(item).length > 0 && !isItemDisabled(item)
                ? activeSubmenuIndex === index
                : undefined
            "
            :data-disabled="isItemDisabled(item) ? '' : undefined"
            :data-danger="item.danger ? '' : undefined"
            :data-highlighted="focusedIndex === index ? '' : undefined"
            :tabindex="focusedIndex === index ? 0 : -1"
            v-tooltip.top="item.tooltip"
            @focus="focusedIndex = index"
            @click="onItemClick($event, index, item)"
          >
            <slot name="icon" :item="item">
              <span
                v-if="item.icon"
                :class="['mw-action-menu__icon', item.icon]"
                aria-hidden="true"
              />
            </slot>
            <span class="mw-action-menu__label">{{ resolveLabel(item) }}</span>
            <span v-if="item.shortcut" class="mw-action-menu__shortcut">{{ item.shortcut }}</span>
            <span
              v-if="getSubItems(item).length > 0"
              class="mw-action-menu__submenu-caret"
              aria-hidden="true"
            >
              <svg
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                stroke-width="1.75"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M6 4l4 4-4 4" />
              </svg>
            </span>
          </button>

          <div
            v-if="activeSubmenuIndex === index && hasSubmenu(item)"
            role="menu"
            class="mw-action-menu mw-action-menu__submenu mw-glass"
            tabindex="-1"
          >
            <template
              v-for="(subItem, subIndex) in getSubItems(item)"
              :key="subItem.key ?? `sub-${subIndex}`"
            >
              <div
                v-if="subItem.separator"
                role="separator"
                class="mw-action-menu__separator"
              />
              <div
                v-else
                class="mw-action-menu__row"
                :class="[
                  isItemDisabled(subItem) && 'mw-action-menu__row--disabled',
                  subItem.class,
                ]"
                :style="subItem.style"
                @mouseenter="onSubRowMouseEnter(subIndex)"
              >
                <button
                  :ref="(el) => setSubItemRef(subIndex, el as HTMLButtonElement | null)"
                  type="button"
                  role="menuitem"
                  class="mw-action-menu__item"
                  :class="[
                    subItem.danger && 'mw-action-menu__item--danger',
                    isItemDisabled(subItem) && 'mw-action-menu__item--disabled',
                  ]"
                  :aria-disabled="isItemDisabled(subItem) || undefined"
                  :data-disabled="isItemDisabled(subItem) ? '' : undefined"
                  :data-danger="subItem.danger ? '' : undefined"
                  :data-highlighted="submenuFocusedIndex === subIndex ? '' : undefined"
                  :tabindex="submenuFocusedIndex === subIndex ? 0 : -1"
                  v-tooltip.top="subItem.tooltip"
                  @focus="submenuFocusedIndex = subIndex"
                  @click="onSubItemClick($event, subItem)"
                >
                  <slot name="icon" :item="subItem">
                    <span
                      v-if="subItem.icon"
                      :class="['mw-action-menu__icon', subItem.icon]"
                      aria-hidden="true"
                    />
                  </slot>
                  <span class="mw-action-menu__label">{{ resolveLabel(subItem) }}</span>
                  <span v-if="subItem.shortcut" class="mw-action-menu__shortcut">{{
                    subItem.shortcut
                  }}</span>
                </button>
              </div>
            </template>
          </div>
        </div>
      </template>
    </div>
  </Teleport>
</template>

<style scoped>
.mw-action-menu {
  position: fixed;
  z-index: var(--z-floating);
  min-width: 200px;
  max-width: 320px;
  padding: var(--space-1);
  border: 1px solid var(--material-hairline);
  border-radius: var(--radius-md);
  color: var(--color-text-primary);
  font-family: var(--font-family-sans);
  font-size: var(--font-size-body-sm);
  line-height: var(--line-height-body);
  outline: none;
  user-select: none;
}

.mw-action-menu__submenu {
  position: absolute;
  top: calc(-1 * var(--space-1));
  inset-inline-start: calc(100% + var(--space-1));
}

.mw-action-menu__separator {
  height: 1px;
  margin: var(--space-1) var(--space-2);
  background: var(--material-inlay-border);
}

.mw-action-menu__row {
  position: relative;
}

.mw-action-menu__item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  padding: 6px 10px;
  border: 0;
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--color-text-primary);
  font: inherit;
  text-align: start;
  cursor: pointer;
  outline: none;
  transition:
    background-color var(--motion-duration-fast) var(--motion-ease-standard),
    color var(--motion-duration-fast) var(--motion-ease-standard);
}

.mw-action-menu__item:not([data-disabled]):hover,
.mw-action-menu__item:not([data-disabled])[data-highlighted],
.mw-action-menu__item:not([data-disabled]):focus-visible {
  background: var(--material-hover);
}

.mw-action-menu__item--disabled,
.mw-action-menu__item[data-disabled] {
  opacity: var(--opacity-disabled);
  cursor: not-allowed;
  pointer-events: auto;
}

.mw-action-menu__label {
  flex: 1 1 auto;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.mw-action-menu__shortcut {
  flex: 0 0 auto;
  margin-inline-start: 1.5rem;
  color: var(--color-text-quaternary);
  font-family: var(--font-family-mono);
  font-size: 11px;
  line-height: 1;
}

.mw-action-menu__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: var(--color-text-tertiary);
}

.mw-action-menu__submenu-caret {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 14px;
  height: 14px;
  margin-inline-start: var(--space-2);
  color: var(--color-text-tertiary);
}

.mw-action-menu__submenu-caret svg {
  width: 12px;
  height: 12px;
}

.mw-action-menu__item--danger,
.mw-action-menu__item--danger :deep(.mw-action-menu__icon) {
  color: var(--color-danger-700);
}

.mw-action-menu__item--danger:not([data-disabled]):hover,
.mw-action-menu__item--danger:not([data-disabled])[data-highlighted],
.mw-action-menu__item--danger:not([data-disabled]):focus-visible {
  background: var(--color-danger-surface);
}

@media (prefers-reduced-motion: reduce) {
  .mw-action-menu__item {
    transition: none;
  }
}
</style>
