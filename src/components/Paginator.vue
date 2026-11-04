<script setup lang="ts">
import { computed, ref, useAttrs, watch, type StyleValue } from "vue";
import type {
  PaginatorEmits,
  PaginatorPageEvent,
  PaginatorProps,
} from "./data-table.js";

defineOptions({
  name: "MwPaginator",
  inheritAttrs: false,
});

export type {
  PaginatorEmits,
  PaginatorPageEvent,
  PaginatorProps,
} from "./data-table.js";

const props = withDefaults(defineProps<PaginatorProps>(), {
  first: 0,
  rows: 10,
  totalRecords: 0,
  rowsPerPageOptions: undefined,
  template: undefined,
  currentPageReportTemplate: undefined,
  alwaysShow: true,
  pageLinkSize: 5,
  disabled: false,
  ariaLabel: "Pagination",
});

const emit = defineEmits<PaginatorEmits>();
const attrs = useAttrs();

const internalFirst = ref<number>(Math.max(0, props.first ?? 0));
const internalRows = ref<number>(
  props.rows && props.rows > 0 ? props.rows : 10,
);

watch(
  () => props.first,
  (val) => {
    if (val !== undefined && Number.isFinite(val)) {
      internalFirst.value = Math.max(0, val);
    }
  },
  { flush: "sync" },
);

watch(
  () => props.rows,
  (val) => {
    if (val !== undefined && Number.isFinite(val) && val > 0) {
      internalRows.value = val;
    }
  },
  { flush: "sync" },
);

const effectiveRows = computed(() => Math.max(1, internalRows.value || 10));
const effectiveTotal = computed(() => Math.max(0, props.totalRecords ?? 0));
const pageCount = computed(() =>
  Math.max(1, Math.ceil(effectiveTotal.value / effectiveRows.value)),
);
const effectiveFirst = computed(() => {
  if (effectiveTotal.value === 0) return 0;
  const maxFirst = (pageCount.value - 1) * effectiveRows.value;
  return Math.min(Math.max(0, internalFirst.value), maxFirst);
});
const currentPage = computed(() =>
  effectiveTotal.value === 0
    ? 0
    : Math.min(
        pageCount.value - 1,
        Math.max(0, Math.floor(effectiveFirst.value / effectiveRows.value)),
      ),
);

const shouldRender = computed(() => {
  if (props.alwaysShow) return true;
  return effectiveTotal.value > effectiveRows.value && pageCount.value > 1;
});

const templateTokens = computed<Set<string> | null>(() => {
  if (!props.template || !props.template.trim()) return null;
  return new Set(props.template.trim().split(/\s+/));
});

function hasToken(token: string, defaultVisible = true): boolean {
  if (!templateTokens.value) return defaultVisible;
  return templateTokens.value.has(token);
}

const showFirstBtn = computed(() => hasToken("FirstPageLink", true));
const showPrevBtn = computed(() => hasToken("PrevPageLink", true));
const showPageLinks = computed(() => hasToken("PageLinks", true));
const showNextBtn = computed(() => hasToken("NextPageLink", true));
const showLastBtn = computed(() => hasToken("LastPageLink", true));
const showRowsPerPage = computed(
  () =>
    Boolean(props.rowsPerPageOptions && props.rowsPerPageOptions.length > 0) &&
    hasToken("RowsPerPageDropdown", true),
);
const showCurrentPageReport = computed(
  () =>
    Boolean(props.currentPageReportTemplate) ||
    hasToken("CurrentPageReport", false),
);

const pageLinks = computed<number[]>(() => {
  const totalPages = pageCount.value;
  const linkSize = Math.max(1, props.pageLinkSize ?? 5);
  const visibleCount = Math.min(linkSize, totalPages);
  const half = Math.floor(visibleCount / 2);
  const start = Math.max(
    0,
    Math.min(currentPage.value - half, totalPages - visibleCount),
  );
  const links: number[] = [];
  for (let i = 0; i < visibleCount; i++) {
    links.push(start + i);
  }
  return links;
});

const isFirstDisabled = computed(
  () => Boolean(props.disabled) || currentPage.value <= 0,
);
const isLastDisabled = computed(
  () => Boolean(props.disabled) || currentPage.value >= pageCount.value - 1,
);

const currentPageReportText = computed(() => {
  const tpl =
    props.currentPageReportTemplate ?? "({currentPage} of {totalPages})";
  const firstOneBased =
    effectiveTotal.value > 0 ? effectiveFirst.value + 1 : 0;
  const lastOneBased =
    effectiveTotal.value > 0
      ? Math.min(
          effectiveFirst.value + effectiveRows.value,
          effectiveTotal.value,
        )
      : 0;
  return tpl
    .replace(/\{first\}/g, String(firstOneBased))
    .replace(/\{last\}/g, String(lastOneBased))
    .replace(/\{rows\}/g, String(effectiveRows.value))
    .replace(/\{totalRecords\}/g, String(effectiveTotal.value))
    .replace(/\{currentPage\}/g, String(currentPage.value + 1))
    .replace(/\{totalPages\}/g, String(pageCount.value));
});

const rootClass = computed(() => ["mw-paginator", "p-paginator", attrs.class]);
const rootStyle = computed<StyleValue>(() => attrs.style as StyleValue);
const rootAttrs = computed(() => {
  const { class: _class, style: _style, ...rest } = attrs;
  return rest;
});

function emitPageChange(nextPage: number, nextRows: number) {
  const nextPageCount = Math.max(
    1,
    Math.ceil(effectiveTotal.value / nextRows),
  );
  const clampedPage = Math.min(Math.max(0, nextPage), nextPageCount - 1);
  const nextFirst = clampedPage * nextRows;
  internalFirst.value = nextFirst;
  internalRows.value = nextRows;
  const payload: PaginatorPageEvent = {
    page: clampedPage,
    first: nextFirst,
    rows: nextRows,
    pageCount: nextPageCount,
  };
  emit("update:first", nextFirst);
  emit("page", payload);
}

function goToPage(targetPage: number) {
  if (props.disabled) return;
  const clamped = Math.min(Math.max(0, targetPage), pageCount.value - 1);
  if (clamped === currentPage.value) return;
  emitPageChange(clamped, effectiveRows.value);
}

function onRowsChange(event: Event) {
  if (props.disabled) return;
  const raw = Number((event.target as HTMLSelectElement).value);
  if (!Number.isFinite(raw) || raw <= 0) return;
  if (raw === effectiveRows.value) return;
  internalRows.value = raw;
  internalFirst.value = 0;
  const nextPageCount = Math.max(1, Math.ceil(effectiveTotal.value / raw));
  emit("update:rows", raw);
  emit("update:first", 0);
  emit("page", {
    page: 0,
    first: 0,
    rows: raw,
    pageCount: nextPageCount,
  });
}
</script>

<template>
  <nav
    v-if="shouldRender"
    v-bind="rootAttrs"
    :class="rootClass"
    :style="rootStyle"
    :aria-label="ariaLabel"
    :data-disabled="disabled ? '' : undefined"
  >
    <div
      v-if="$slots.start"
      class="mw-paginator__start p-paginator-left-content"
    >
      <slot
        name="start"
        :first="effectiveFirst"
        :rows="effectiveRows"
        :page="currentPage"
        :page-count="pageCount"
        :total-records="effectiveTotal"
      />
    </div>

    <div class="mw-paginator__content p-paginator-content">
      <button
        v-if="showFirstBtn"
        type="button"
        class="mw-paginator__btn mw-paginator__first p-paginator-first"
        :disabled="isFirstDisabled"
        :data-disabled="isFirstDisabled ? '' : undefined"
        aria-label="First Page"
        @click="goToPage(0)"
      >
        <svg
          class="mw-paginator__icon"
          viewBox="0 0 16 16"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M11.5 12L7.5 8L11.5 4M4.5 4V12"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </button>

      <button
        v-if="showPrevBtn"
        type="button"
        class="mw-paginator__btn mw-paginator__prev p-paginator-prev"
        :disabled="isFirstDisabled"
        :data-disabled="isFirstDisabled ? '' : undefined"
        aria-label="Previous Page"
        @click="goToPage(currentPage - 1)"
      >
        <svg
          class="mw-paginator__icon"
          viewBox="0 0 16 16"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M10 12L6 8L10 4"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </button>

      <span
        v-if="showPageLinks"
        class="mw-paginator__pages p-paginator-pages"
      >
        <button
          v-for="pageIdx in pageLinks"
          :key="pageIdx"
          type="button"
          :class="[
            'mw-paginator__btn',
            'mw-paginator__page',
            'p-paginator-page',
            {
              'mw-paginator__page--active': pageIdx === currentPage,
              'p-paginator-page-selected': pageIdx === currentPage,
            },
          ]"
          :disabled="disabled"
          :data-disabled="disabled ? '' : undefined"
          :data-state="pageIdx === currentPage ? 'active' : 'inactive'"
          :aria-current="pageIdx === currentPage ? 'page' : undefined"
          :aria-label="`Page ${pageIdx + 1}`"
          @click="goToPage(pageIdx)"
        >
          {{ pageIdx + 1 }}
        </button>
      </span>

      <button
        v-if="showNextBtn"
        type="button"
        class="mw-paginator__btn mw-paginator__next p-paginator-next"
        :disabled="isLastDisabled"
        :data-disabled="isLastDisabled ? '' : undefined"
        aria-label="Next Page"
        @click="goToPage(currentPage + 1)"
      >
        <svg
          class="mw-paginator__icon"
          viewBox="0 0 16 16"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M6 12L10 8L6 4"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </button>

      <button
        v-if="showLastBtn"
        type="button"
        class="mw-paginator__btn mw-paginator__last p-paginator-last"
        :disabled="isLastDisabled"
        :data-disabled="isLastDisabled ? '' : undefined"
        aria-label="Last Page"
        @click="goToPage(pageCount - 1)"
      >
        <svg
          class="mw-paginator__icon"
          viewBox="0 0 16 16"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M4.5 12L8.5 8L4.5 4M11.5 4V12"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </button>

      <select
        v-if="showRowsPerPage"
        class="mw-paginator__rpp mw-control mw-select p-paginator-rpp-options"
        :value="effectiveRows"
        :disabled="disabled"
        :data-disabled="disabled ? '' : undefined"
        aria-label="Rows per page"
        @change="onRowsChange"
      >
        <option
          v-for="opt in rowsPerPageOptions"
          :key="opt"
          :value="opt"
        >
          {{ opt }}
        </option>
      </select>

      <span
        v-if="showCurrentPageReport"
        class="mw-paginator__current p-paginator-current"
        aria-live="polite"
      >
        {{ currentPageReportText }}
      </span>
    </div>

    <div
      v-if="$slots.end"
      class="mw-paginator__end p-paginator-right-content"
    >
      <slot
        name="end"
        :first="effectiveFirst"
        :rows="effectiveRows"
        :page="currentPage"
        :page-count="pageCount"
        :total-records="effectiveTotal"
      />
    </div>
  </nav>
</template>

<style scoped>
.mw-paginator {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  font-family: var(--font-family-sans);
  font-size: var(--font-size-body-sm);
  color: var(--color-text-secondary);
  background: transparent;
}

.mw-paginator__start {
  margin-inline-end: auto;
  display: inline-flex;
  align-items: center;
}

.mw-paginator__end {
  margin-inline-start: auto;
  display: inline-flex;
  align-items: center;
}

.mw-paginator__content {
  display: inline-flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: var(--space-1);
}

.mw-paginator__pages {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
}

.mw-paginator__btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: var(--control-height-compact);
  height: var(--control-height-compact);
  padding-inline: var(--space-2);
  border: 1px solid transparent;
  border-radius: var(--radius);
  background: transparent;
  color: var(--color-text-secondary);
  font-family: var(--font-family-sans);
  font-size: var(--font-size-body-sm);
  font-weight: 500;
  line-height: 1;
  font-variant-numeric: tabular-nums;
  cursor: pointer;
  user-select: none;
  transition:
    background-color var(--motion-duration-fast) var(--motion-ease-standard),
    color var(--motion-duration-fast) var(--motion-ease-standard),
    border-color var(--motion-duration-fast) var(--motion-ease-standard),
    box-shadow var(--motion-duration-fast) var(--motion-ease-standard);
}

.mw-paginator__btn:hover:not(:disabled):not([data-disabled]) {
  background-color: var(--material-hover);
  color: var(--color-text-primary);
}

.mw-paginator__btn:focus-visible {
  outline: none;
  box-shadow: var(--effect-focus-ring);
}

.mw-paginator__btn[data-state="active"],
.mw-paginator__page--active {
  background-color: rgb(var(--color-brand-500-rgb) / 0.14);
  border-color: rgb(var(--color-brand-500-rgb) / 0.35);
  color: var(--color-brand-700);
  font-weight: 600;
}

.mw-paginator__btn:disabled,
.mw-paginator__btn[data-disabled] {
  opacity: var(--opacity-disabled-strong);
  cursor: not-allowed;
}

.mw-paginator__icon {
  width: 14px;
  height: 14px;
  flex-shrink: 0;
}

.mw-paginator__rpp {
  height: var(--control-height-compact);
  padding-inline: var(--space-2) var(--space-3);
  margin-inline-start: var(--space-1);
  font-size: var(--font-size-body-sm);
  cursor: pointer;
}

.mw-paginator__current {
  margin-inline-start: var(--space-2);
  color: var(--color-text-tertiary);
  font-size: var(--font-size-body-sm);
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

@media (prefers-reduced-motion: reduce) {
  .mw-paginator__btn {
    transition: none;
  }
}
</style>
