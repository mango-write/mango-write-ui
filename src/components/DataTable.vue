<script setup lang="ts">
import {
  computed,
  onBeforeUnmount,
  ref,
  useAttrs,
  useSlots,
  watch,
  type StyleValue,
} from "vue";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Check,
  ChevronDown,
  ChevronRight,
  Minus,
} from "lucide-vue-next";
import Paginator from "./Paginator.vue";
import { vScrollFade } from "../lib/scroll-fade";
import {
  ColumnSlotRenderer,
  extractColumnsFromVNodes,
  isInteractiveRowTarget,
  resolveFieldData,
  resolveRowKey,
  type DataTableEmits,
  type DataTableExportCSVOptions,
  type DataTableProps,
  type DataTableSelectionMode,
  type NormalizedDataTableColumn,
  type PaginatorPageEvent,
} from "./data-table.js";

defineOptions({
  name: "MwDataTable",
  inheritAttrs: false,
});

export type {
  DataTableColumnResizeEndEvent,
  DataTableColumnResizeMode,
  DataTableEmits,
  DataTableExportCSVOptions,
  DataTableFieldAccessor,
  DataTableFrozenAlign,
  DataTablePageEvent,
  DataTableProps,
  DataTableRowClickEvent,
  DataTableRowCollapseEvent,
  DataTableRowExpandEvent,
  DataTableRowSelectAllEvent,
  DataTableRowSelectEvent,
  DataTableRowUnselectAllEvent,
  DataTableRowUnselectEvent,
  DataTableSelectionMode,
  DataTableSize,
  DataTableSortEvent,
} from "./data-table.js";

const props = withDefaults(defineProps<DataTableProps>(), {
  value: () => [],
  dataKey: undefined,
  loading: false,
  lazy: false,
  paginator: false,
  alwaysShowPaginator: true,
  rows: 10,
  first: 0,
  totalRecords: undefined,
  rowsPerPageOptions: undefined,
  paginatorTemplate: undefined,
  currentPageReportTemplate: undefined,
  selection: undefined,
  selectionMode: undefined,
  metaKeySelection: false,
  expandedRows: undefined,
  sortField: undefined,
  sortOrder: undefined,
  removableSort: false,
  scrollable: false,
  scrollHeight: undefined,
  resizableColumns: false,
  columnResizeMode: "fit",
  stripedRows: false,
  rowHover: false,
  size: undefined,
  rowClass: undefined,
  rowStyle: undefined,
  tableStyle: undefined,
  tableClass: undefined,
  responsiveLayout: undefined,
  emptyMessage: undefined,
  csvSeparator: ",",
  exportFilename: "download",
});

const emit = defineEmits<DataTableEmits>();
const attrs = useAttrs();
const slots = useSlots();

const internalFirst = ref<number>(Math.max(0, props.first ?? 0));
const internalRows = ref<number>(
  props.rows && props.rows > 0 ? props.rows : 10,
);
const internalSortField = ref<string | undefined>(props.sortField);
const internalSortOrder = ref<number>(props.sortOrder ?? 0);
const internalSelection = ref<any>(props.selection);
const internalExpandedRows = ref<any>(props.expandedRows);
const columnWidths = ref<Record<string, number>>({});

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

watch(
  () => props.sortField,
  (val) => {
    internalSortField.value = val;
  },
  { flush: "sync" },
);

watch(
  () => props.sortOrder,
  (val) => {
    internalSortOrder.value = val ?? 0;
  },
  { flush: "sync" },
);

watch(
  () => props.selection,
  (val) => {
    internalSelection.value = val;
  },
  { flush: "sync" },
);

watch(
  () => props.expandedRows,
  (val) => {
    internalExpandedRows.value = val;
  },
  { flush: "sync" },
);

const visibleColumns = computed<NormalizedDataTableColumn[]>(() =>
  extractColumnsFromVNodes(slots.default?.()),
);

const hasColumnFooters = computed(() =>
  visibleColumns.value.some(
    (col) => Boolean(col.footerSlot) || col.footer !== undefined,
  ),
);

const rawRows = computed<readonly any[]>(() =>
  Array.isArray(props.value) ? props.value : [],
);

const effectiveRows = computed(() => Math.max(1, internalRows.value || 10));
const effectiveFirst = computed(() => Math.max(0, internalFirst.value || 0));
const effectiveSortField = computed(() => internalSortField.value);
const effectiveSortOrder = computed(() => internalSortOrder.value ?? 0);
const effectiveSelection = computed(() =>
  props.selection !== undefined ? props.selection : internalSelection.value,
);
const effectiveExpandedRows = computed(() =>
  props.expandedRows !== undefined
    ? props.expandedRows
    : internalExpandedRows.value,
);

const columnSelectionMode = computed<DataTableSelectionMode | undefined>(
  () => visibleColumns.value.find((col) => col.selectionMode)?.selectionMode,
);
const effectiveSelectionMode = computed<DataTableSelectionMode | undefined>(
  () => props.selectionMode ?? columnSelectionMode.value,
);
const isMultipleSelection = computed(
  () =>
    effectiveSelectionMode.value === "multiple" ||
    Array.isArray(effectiveSelection.value),
);

function getColumnSortField(col: NormalizedDataTableColumn): string | undefined {
  if (col.sortField) return col.sortField;
  if (typeof col.field === "string" && col.field) return col.field;
  return col.columnKey ?? col.key;
}

function isColumnSorted(col: NormalizedDataTableColumn): boolean {
  if (!col.sortable) return false;
  const field = getColumnSortField(col);
  return Boolean(
    field &&
      effectiveSortField.value === field &&
      effectiveSortOrder.value !== 0,
  );
}

function getAriaSort(
  col: NormalizedDataTableColumn,
): "ascending" | "descending" | "none" | undefined {
  if (!col.sortable) return undefined;
  if (!isColumnSorted(col)) return "none";
  return effectiveSortOrder.value === 1 ? "ascending" : "descending";
}

function compareCellValues(a: unknown, b: unknown, order: number): number {
  if (a === b) return 0;
  if (a == null && b == null) return 0;
  if (a == null) return -1 * order;
  if (b == null) return 1 * order;
  if (typeof a === "number" && typeof b === "number") {
    return (a < b ? -1 : a > b ? 1 : 0) * order;
  }
  if (a instanceof Date && b instanceof Date) {
    return (a.getTime() - b.getTime()) * order;
  }
  if (typeof a === "boolean" && typeof b === "boolean") {
    return (a === b ? 0 : a ? 1 : -1) * order;
  }
  return (
    String(a).localeCompare(String(b), undefined, {
      numeric: true,
      sensitivity: "base",
    }) * order
  );
}

const sortedRows = computed<readonly any[]>(() => {
  const source = rawRows.value;
  if (
    props.lazy ||
    !effectiveSortField.value ||
    effectiveSortOrder.value === 0
  ) {
    return source;
  }
  const sortKey = effectiveSortField.value;
  const order = effectiveSortOrder.value > 0 ? 1 : -1;
  const matchedCol = visibleColumns.value.find(
    (col) => getColumnSortField(col) === sortKey,
  );
  const accessor = matchedCol?.field ?? sortKey;
  return [...source].sort((rowA, rowB) =>
    compareCellValues(
      resolveFieldData(rowA, accessor),
      resolveFieldData(rowB, accessor),
      order,
    ),
  );
});

const displayedRows = computed<readonly any[]>(() => {
  if (props.lazy) {
    return rawRows.value;
  }
  if (!props.paginator) {
    return sortedRows.value;
  }
  const total = sortedRows.value.length;
  if (total === 0) return [];
  const count = effectiveRows.value;
  const maxPageStart = Math.max(0, (Math.ceil(total / count) - 1) * count);
  const start = Math.min(effectiveFirst.value, maxPageStart);
  return sortedRows.value.slice(start, start + count);
});

const effectiveTotalRecords = computed(() =>
  props.totalRecords !== undefined
    ? props.totalRecords
    : sortedRows.value.length,
);

function rowsEqual(a: any, b: any): boolean {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (props.dataKey) {
    const keyA =
      typeof a === "object" ? resolveRowKey(a, props.dataKey) : a;
    const keyB =
      typeof b === "object" ? resolveRowKey(b, props.dataKey) : b;
    if (keyA !== undefined && keyB !== undefined) {
      return keyA === keyB;
    }
  }
  return false;
}

function getRowKeyAttr(row: any, index: number): string | number {
  const key = resolveRowKey(row, props.dataKey, index);
  if (typeof key === "string" || typeof key === "number") {
    return key;
  }
  return index;
}

function isRowSelected(row: any): boolean {
  const sel = effectiveSelection.value;
  if (sel == null) return false;
  if (Array.isArray(sel)) {
    return sel.some((item) => rowsEqual(item, row));
  }
  return rowsEqual(sel, row);
}

const allCurrentPageSelected = computed(() => {
  const rows = displayedRows.value;
  if (rows.length === 0) return false;
  return rows.every((row) => isRowSelected(row));
});

const someCurrentPageSelected = computed(() => {
  const rows = displayedRows.value;
  if (rows.length === 0 || allCurrentPageSelected.value) return false;
  return rows.some((row) => isRowSelected(row));
});

function toggleRowSelection(
  event: Event,
  row: any,
  rowIndex: number,
  triggerType: string,
) {
  if (isMultipleSelection.value) {
    const currentList = Array.isArray(effectiveSelection.value)
      ? effectiveSelection.value
      : [];
    if (isRowSelected(row)) {
      const nextList = currentList.filter((item) => !rowsEqual(item, row));
      internalSelection.value = nextList;
      emit("update:selection", nextList);
      emit("row-unselect", {
        originalEvent: event,
        data: row,
        index: rowIndex,
        type: triggerType,
      });
    } else {
      const nextList = [...currentList, row];
      internalSelection.value = nextList;
      emit("update:selection", nextList);
      emit("row-select", {
        originalEvent: event,
        data: row,
        index: rowIndex,
        type: triggerType,
      });
    }
    return;
  }

  if (effectiveSelectionMode.value === "single") {
    if (isRowSelected(row)) {
      const allowUnselect =
        triggerType !== "row" ||
        !props.metaKeySelection ||
        (event as MouseEvent).metaKey ||
        (event as MouseEvent).ctrlKey;
      if (allowUnselect) {
        internalSelection.value = null;
        emit("update:selection", null);
        emit("row-unselect", {
          originalEvent: event,
          data: row,
          index: rowIndex,
          type: triggerType,
        });
      }
    } else {
      internalSelection.value = row;
      emit("update:selection", row);
      emit("row-select", {
        originalEvent: event,
        data: row,
        index: rowIndex,
        type: triggerType,
      });
    }
  }
}

function onToggleSelectAll(event: Event) {
  event.stopPropagation();
  const currentList = Array.isArray(effectiveSelection.value)
    ? effectiveSelection.value
    : [];
  const pageRows = displayedRows.value;
  if (allCurrentPageSelected.value) {
    const nextList = currentList.filter(
      (item) => !pageRows.some((row) => rowsEqual(item, row)),
    );
    internalSelection.value = nextList;
    emit("update:selection", nextList);
    emit("row-unselect-all", { originalEvent: event });
  } else {
    const newlySelected = pageRows.filter(
      (row) => !currentList.some((item) => rowsEqual(item, row)),
    );
    const nextList = [...currentList, ...newlySelected];
    internalSelection.value = nextList;
    emit("update:selection", nextList);
    emit("row-select-all", { originalEvent: event, data: nextList });
  }
}

function isRowExpanded(row: any): boolean {
  const expanded = effectiveExpandedRows.value;
  if (!expanded) return false;
  if (Array.isArray(expanded)) {
    return expanded.some((item) => rowsEqual(item, row));
  }
  if (typeof expanded === "object") {
    const key = resolveRowKey(row, props.dataKey);
    if (typeof key === "string" || typeof key === "number") {
      return Boolean((expanded as Record<string | number, boolean>)[key]);
    }
  }
  return false;
}

function toggleRowExpansion(event: Event, row: any) {
  event.stopPropagation();
  const expanded = effectiveExpandedRows.value;
  const currentlyExpanded = isRowExpanded(row);
  const key = resolveRowKey(row, props.dataKey);
  let nextExpanded: any;

  if (Array.isArray(expanded)) {
    nextExpanded = currentlyExpanded
      ? expanded.filter((item) => !rowsEqual(item, row))
      : [...expanded, row];
  } else if (expanded !== null && typeof expanded === "object") {
    const mapKey =
      typeof key === "string" || typeof key === "number" ? key : String(key);
    const clone = { ...(expanded as Record<string | number, boolean>) };
    if (currentlyExpanded) {
      delete clone[mapKey];
    } else {
      clone[mapKey] = true;
    }
    nextExpanded = clone;
  } else {
    nextExpanded = currentlyExpanded ? [] : [row];
  }

  internalExpandedRows.value = nextExpanded;
  emit("update:expandedRows", nextExpanded);
  if (currentlyExpanded) {
    emit("row-collapse", { originalEvent: event, data: row });
  } else {
    emit("row-expand", { originalEvent: event, data: row });
  }
}

function onRowClick(event: MouseEvent, row: any, rowIndex: number) {
  const rowEl = event.currentTarget as HTMLElement | null;
  if (isInteractiveRowTarget(event.target, rowEl)) {
    return;
  }
  emit("row-click", {
    originalEvent: event,
    data: row,
    index: rowIndex,
  });
  if (
    props.selectionMode === "single" ||
    props.selectionMode === "multiple"
  ) {
    toggleRowSelection(event, row, rowIndex, "row");
  }
}

function onHeaderClick(
  event: MouseEvent | KeyboardEvent,
  col: NormalizedDataTableColumn,
) {
  if (!col.sortable) return;
  if (
    event.target instanceof Element &&
    event.target.closest("[data-column-resizer]")
  ) {
    return;
  }
  const field = getColumnSortField(col);
  if (!field) return;

  let nextField: string | undefined = field;
  let nextOrder = 1;

  if (effectiveSortField.value === field) {
    if (effectiveSortOrder.value === 1) {
      nextOrder = -1;
    } else if (effectiveSortOrder.value === -1) {
      if (props.removableSort) {
        nextField = undefined;
        nextOrder = 0;
      } else {
        nextOrder = 1;
      }
    }
  }

  internalSortField.value = nextField;
  internalSortOrder.value = nextOrder;
  emit("update:sortField", nextField);
  emit("update:sortOrder", nextOrder);
  emit("sort", {
    sortField: nextField ?? "",
    sortOrder: nextOrder,
    first: effectiveFirst.value,
    rows: effectiveRows.value,
  });
}

function onHeaderKeydown(
  event: KeyboardEvent,
  col: NormalizedDataTableColumn,
) {
  if (!col.sortable) return;
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    onHeaderClick(event, col);
  }
}

function onPaginatorPage(event: PaginatorPageEvent) {
  internalFirst.value = event.first;
  internalRows.value = event.rows;
  emit("update:first", event.first);
  emit("update:rows", event.rows);
  emit("page", {
    ...event,
    sortField: effectiveSortField.value,
    sortOrder: effectiveSortOrder.value,
  });
}

interface ActiveColumnResize {
  colKey: string;
  field?: string;
  thEl: HTMLElement;
  startX: number;
  startWidth: number;
  currentWidth: number;
}

let activeResize: ActiveColumnResize | null = null;

function extractClientX(event: MouseEvent | TouchEvent | PointerEvent): number {
  if ("touches" in event) {
    const touch = event.touches[0] ?? event.changedTouches[0];
    return touch ? touch.clientX : 0;
  }
  return typeof event.clientX === "number" ? event.clientX : 0;
}

function parsePixelWidth(val: unknown): number | undefined {
  if (typeof val === "number" && Number.isFinite(val) && val > 0) {
    return val;
  }
  if (typeof val === "string") {
    const trimmed = val.trim();
    const pxMatch = trimmed.match(/^(\d+(?:\.\d+)?)px$/i);
    if (pxMatch) return Number(pxMatch[1]);
    if (/^\d+(?:\.\d+)?$/.test(trimmed)) return Number(trimmed);
  }
  return undefined;
}

function resolveInitialColumnWidth(
  col: NormalizedDataTableColumn,
  thEl: HTMLElement,
): number {
  const existing = columnWidths.value[col.key];
  if (existing !== undefined && existing > 0) return existing;

  const fromDomStyle = parsePixelWidth(thEl.style.width);
  if (fromDomStyle !== undefined) return fromDomStyle;

  const fromPropWidth = parsePixelWidth(col.width);
  if (fromPropWidth !== undefined) return fromPropWidth;

  if (col.headerStyle && typeof col.headerStyle === "object" && !Array.isArray(col.headerStyle)) {
    const fromHeaderObj = parsePixelWidth((col.headerStyle as Record<string, unknown>).width);
    if (fromHeaderObj !== undefined) return fromHeaderObj;
  }
  if (col.style && typeof col.style === "object" && !Array.isArray(col.style)) {
    const fromStyleObj = parsePixelWidth((col.style as Record<string, unknown>).width);
    if (fromStyleObj !== undefined) return fromStyleObj;
  }

  const rectWidth = thEl.getBoundingClientRect?.().width ?? 0;
  if (rectWidth > 0) return rectWidth;
  if (thEl.offsetWidth > 0) return thEl.offsetWidth;
  return 120;
}

function applyResizedWidth(state: ActiveColumnResize, clientX: number) {
  const delta = clientX - state.startX;
  const nextWidth = Math.max(32, Math.round(state.startWidth + delta));
  state.currentWidth = nextWidth;
  columnWidths.value = {
    ...columnWidths.value,
    [state.colKey]: nextWidth,
  };
  state.thEl.style.width = `${nextWidth}px`;
  state.thEl.style.minWidth = `${nextWidth}px`;
  state.thEl.style.maxWidth = `${nextWidth}px`;
}

function onGlobalResizeMove(event: MouseEvent | TouchEvent | PointerEvent) {
  if (!activeResize) return;
  applyResizedWidth(activeResize, extractClientX(event));
}

function cleanupResizeListeners() {
  if (typeof window === "undefined") return;
  window.removeEventListener("mousemove", onGlobalResizeMove);
  window.removeEventListener("mouseup", onGlobalResizeEnd);
  window.removeEventListener("touchmove", onGlobalResizeMove);
  window.removeEventListener("touchend", onGlobalResizeEnd);
  window.removeEventListener("pointermove", onGlobalResizeMove);
  window.removeEventListener("pointerup", onGlobalResizeEnd);
}

function onGlobalResizeEnd(event: MouseEvent | TouchEvent | PointerEvent) {
  if (!activeResize) return;
  const state = activeResize;
  const endX = extractClientX(event);
  if (endX !== state.startX && state.currentWidth === state.startWidth) {
    applyResizedWidth(state, endX);
  }
  const delta = state.currentWidth - state.startWidth;
  activeResize = null;
  cleanupResizeListeners();
  emit("column-resize-end", {
    element: state.thEl,
    delta,
    field: state.field,
  });
}

function onResizeStart(
  event: MouseEvent | TouchEvent | PointerEvent,
  col: NormalizedDataTableColumn,
) {
  if (!props.resizableColumns || activeResize) return;
  const target = event.currentTarget as HTMLElement | null;
  const thEl = (target?.closest("th") ?? target?.parentElement) as HTMLElement | null;
  if (!thEl) return;

  const startX = extractClientX(event);
  const startWidth = resolveInitialColumnWidth(col, thEl);
  activeResize = {
    colKey: col.key,
    field: typeof col.field === "string" ? col.field : undefined,
    thEl,
    startX,
    startWidth,
    currentWidth: startWidth,
  };

  if (typeof window !== "undefined") {
    window.addEventListener("mousemove", onGlobalResizeMove);
    window.addEventListener("mouseup", onGlobalResizeEnd);
    window.addEventListener("touchmove", onGlobalResizeMove);
    window.addEventListener("touchend", onGlobalResizeEnd);
    window.addEventListener("pointermove", onGlobalResizeMove);
    window.addEventListener("pointerup", onGlobalResizeEnd);
  }
}

onBeforeUnmount(() => {
  activeResize = null;
  cleanupResizeListeners();
});

function formatDimension(val: number | string | undefined): string | undefined {
  if (val === undefined || val === "") return undefined;
  return typeof val === "number" ? `${val}px` : val;
}

function getBaseColumnStyle(col: NormalizedDataTableColumn): Record<string, string | number> {
  const styleObj: Record<string, string | number> = {};
  const w = formatDimension(col.width);
  const minW = formatDimension(col.minWidth);
  if (w !== undefined) styleObj.width = w;
  if (minW !== undefined) styleObj.minWidth = minW;

  const resized = columnWidths.value[col.key];
  if (resized !== undefined) {
    styleObj.width = `${resized}px`;
    styleObj.minWidth = `${resized}px`;
    styleObj.maxWidth = `${resized}px`;
  }

  if (col.frozen) {
    styleObj.position = "sticky";
    if (col.alignFrozen === "right") {
      styleObj.insetInlineEnd = "0px";
    } else {
      styleObj.insetInlineStart = "0px";
    }
    styleObj.zIndex = 1;
  }

  return styleObj;
}

function getHeaderCellStyle(col: NormalizedDataTableColumn): StyleValue {
  return [col.style, col.headerStyle, getBaseColumnStyle(col)];
}

function getBodyCellStyle(col: NormalizedDataTableColumn): StyleValue {
  return [col.style, col.bodyStyle, getBaseColumnStyle(col)];
}

function getFooterCellStyle(col: NormalizedDataTableColumn): StyleValue {
  return [col.style, col.footerStyle, getBaseColumnStyle(col)];
}

function formatCellValue(val: unknown): string {
  if (val === null || val === undefined) return "";
  return String(val);
}

function escapeCsvCell(val: unknown, separator: string): string {
  const text = val === null || val === undefined ? "" : String(val);
  if (
    text.includes('"') ||
    text.includes("\n") ||
    text.includes("\r") ||
    text.includes(separator)
  ) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

function exportCSV(options?: DataTableExportCSVOptions): string {
  const sep = props.csvSeparator || ",";
  const exportCols = visibleColumns.value.filter(
    (col) => col.exportable && !col.selectionMode && !col.expander,
  );
  const rowsToExport = options?.selectionOnly
    ? Array.isArray(effectiveSelection.value)
      ? effectiveSelection.value
      : effectiveSelection.value != null
        ? [effectiveSelection.value]
        : []
    : sortedRows.value;

  const headerLine = exportCols
    .map((col) =>
      escapeCsvCell(
        col.header ?? (typeof col.field === "string" ? col.field : col.key),
        sep,
      ),
    )
    .join(sep);

  const bodyLines = rowsToExport.map((row) =>
    exportCols
      .map((col) => escapeCsvCell(resolveFieldData(row, col.field), sep))
      .join(sep),
  );

  const csvContent = [headerLine, ...bodyLines].join("\n");

  if (
    typeof document !== "undefined" &&
    typeof Blob !== "undefined" &&
    typeof URL !== "undefined" &&
    typeof URL.createObjectURL === "function"
  ) {
    try {
      const blob = new Blob([`\uFEFF${csvContent}`], {
        type: "text/csv;charset=utf-8;",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.style.display = "none";
      const filename = options?.filename || props.exportFilename || "download";
      link.setAttribute(
        "download",
        filename.endsWith(".csv") ? filename : `${filename}.csv`,
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch {
      // 忽略无 DOM 下载能力环境下的异常，保证返回值始终可用
    }
  }

  return csvContent;
}

// 不传 size = 跟随容器的密度上下文（--control-*），传了才定档。
const resolvedSize = computed(() => {
  if (props.size === "small" || props.size === "sm") return "sm";
  if (props.size === "large" || props.size === "lg") return "lg";
  if (props.size === "xs") return "xs";
  if (props.size === "md") return "md";
  return undefined;
});

const isFlexScrollable = computed(
  () => Boolean(props.scrollable && props.scrollHeight === "flex"),
);

const rootClass = computed(() => [
  "mw-datatable",
  resolvedSize.value
    ? [`mw-datatable--${resolvedSize.value}`, `mw-size-${resolvedSize.value}`]
    : undefined,
  {
    "mw-datatable--scrollable": props.scrollable,
    "mw-datatable--flex-scrollable": isFlexScrollable.value,
    "mw-datatable--striped": props.stripedRows,
    "mw-datatable--hoverable":
      props.rowHover || Boolean(effectiveSelectionMode.value),
    "mw-datatable--resizable": props.resizableColumns,
    "mw-datatable--resizable-fit":
      props.resizableColumns && props.columnResizeMode === "fit",
    "mw-datatable--resizable-expand":
      props.resizableColumns && props.columnResizeMode === "expand",
  },
  attrs.class,
]);

const rootStyle = computed<StyleValue>(() => attrs.style as StyleValue);
const rootAttrs = computed(() => {
  const { class: _class, style: _style, ...rest } = attrs;
  return rest;
});

const tableContainerStyle = computed<StyleValue>(() => {
  if (
    props.scrollable &&
    props.scrollHeight &&
    props.scrollHeight !== "flex"
  ) {
    return {
      maxHeight: props.scrollHeight,
      overflow: "auto",
    };
  }
  return undefined;
});

defineExpose({
  exportCSV,
});
</script>

<template>
  <div
    v-bind="rootAttrs"
    :class="rootClass"
    :style="rootStyle"
    :aria-busy="loading || undefined"
    :data-loading="loading ? 'true' : undefined"
    :data-size="resolvedSize"
  >
    <div
      v-if="$slots.header"
      class="mw-datatable__header"
    >
      <slot name="header" />
    </div>

    <div
      v-if="loading"
      class="mw-datatable__loading-overlay"
      data-testid="datatable-loading"
    >
      <slot name="loading">
        <span class="mw-datatable__loading-spinner" aria-hidden="true" />
      </slot>
    </div>

    <div
      v-scroll-fade="{ stickyHeader: scrollable ? '.mw-datatable__thead' : undefined }"
      class="mw-datatable__table-container mw-scroll"
      :style="tableContainerStyle"
    >
      <table
        :class="['mw-datatable__table', tableClass]"
        :style="tableStyle"
        role="table"
      >
        <thead class="mw-datatable__thead">
          <tr class="mw-datatable__header-row">
            <th
              v-for="col in visibleColumns"
              :key="col.key"
              scope="col"
              :class="[
                'mw-datatable__header-cell',
                {
                  'mw-datatable__header-cell--sortable': col.sortable,
                  'mw-datatable__header-cell--sorted': isColumnSorted(col),
                  'mw-datatable__cell--frozen': col.frozen,
                  'mw-datatable__cell--frozen-right':
                    col.frozen && col.alignFrozen === 'right',
                },
                col.class,
                col.headerClass,
              ]"
              :style="getHeaderCellStyle(col)"
              :aria-sort="getAriaSort(col)"
              :tabindex="col.sortable ? 0 : undefined"
              :data-field="typeof col.field === 'string' ? col.field : undefined"
              :data-sortable="col.sortable ? 'true' : undefined"
              :data-sorted="isColumnSorted(col) ? 'true' : undefined"
              :data-frozen="col.frozen ? col.alignFrozen : undefined"
              @click="onHeaderClick($event, col)"
              @keydown="onHeaderKeydown($event, col)"
            >
              <template v-if="col.selectionMode === 'multiple'">
                <button
                  type="button"
                  role="checkbox"
                  class="mw-datatable__checkbox mw-control"
                  data-row-action
                  :aria-checked="
                    someCurrentPageSelected
                      ? 'mixed'
                      : allCurrentPageSelected
                        ? 'true'
                        : 'false'
                  "
                  :data-state="
                    someCurrentPageSelected
                      ? 'indeterminate'
                      : allCurrentPageSelected
                        ? 'checked'
                        : 'unchecked'
                  "
                  aria-label="Select all rows"
                  @click.stop="onToggleSelectAll($event)"
                >
                  <Minus
                    v-if="someCurrentPageSelected"
                    class="mw-datatable__checkbox-icon"
                    aria-hidden="true"
                  />
                  <Check
                    v-else-if="allCurrentPageSelected"
                    class="mw-datatable__checkbox-icon"
                    aria-hidden="true"
                  />
                </button>
              </template>

              <div
                v-else
                class="mw-datatable__header-content"
              >
                <ColumnSlotRenderer
                  v-if="col.headerSlot"
                  :render="col.headerSlot"
                  :scope="{ column: col.rawProps }"
                />
                <span
                  v-else-if="col.header !== undefined"
                  class="mw-datatable__header-title"
                >
                  {{ col.header }}
                </span>

                <span
                  v-if="col.sortable"
                  class="mw-datatable__sort-icon"
                  aria-hidden="true"
                >
                  <ArrowUp
                    v-if="isColumnSorted(col) && effectiveSortOrder === 1"
                    class="mw-datatable__sort-svg"
                    aria-hidden="true"
                  />
                  <ArrowDown
                    v-else-if="isColumnSorted(col) && effectiveSortOrder === -1"
                    class="mw-datatable__sort-svg"
                    aria-hidden="true"
                  />
                  <ArrowUpDown
                    v-else
                    class="mw-datatable__sort-svg mw-datatable__sort-svg--unsorted"
                    aria-hidden="true"
                  />
                </span>
              </div>

              <span
                v-if="resizableColumns"
                class="mw-datatable__resizer"
                data-column-resizer
                @mousedown.stop="onResizeStart($event, col)"
                @touchstart.stop="onResizeStart($event, col)"
              />
            </th>
          </tr>
        </thead>

        <tbody class="mw-datatable__tbody">
          <template v-if="displayedRows.length > 0">
            <template
              v-for="(row, rowIndex) in displayedRows"
              :key="getRowKeyAttr(row, rowIndex)"
            >
              <tr
                :class="[
                  'mw-datatable__row',
                  {
                    'mw-datatable__row--selected': isRowSelected(row),
                  },
                  rowClass ? rowClass(row) : undefined,
                ]"
                :style="rowStyle ? rowStyle(row) : undefined"
                :aria-selected="
                  effectiveSelectionMode
                    ? isRowSelected(row)
                      ? 'true'
                      : 'false'
                    : undefined
                "
                :data-state="isRowSelected(row) ? 'selected' : undefined"
                :data-row-key="String(getRowKeyAttr(row, rowIndex))"
                @click="onRowClick($event, row, rowIndex)"
              >
                <td
                  v-for="col in visibleColumns"
                  :key="col.key"
                  :class="[
                    'mw-datatable__body-cell',
                    {
                      'mw-datatable__cell--frozen': col.frozen,
                      'mw-datatable__cell--frozen-right':
                        col.frozen && col.alignFrozen === 'right',
                    },
                    col.class,
                    col.bodyClass,
                  ]"
                  :style="getBodyCellStyle(col)"
                  :data-frozen="col.frozen ? col.alignFrozen : undefined"
                >
                  <template v-if="col.selectionMode === 'multiple'">
                    <button
                      type="button"
                      role="checkbox"
                      class="mw-datatable__checkbox mw-control"
                      data-row-action
                      :aria-checked="isRowSelected(row) ? 'true' : 'false'"
                      :data-state="isRowSelected(row) ? 'checked' : 'unchecked'"
                      aria-label="Select row"
                      @click.stop="
                        toggleRowSelection($event, row, rowIndex, 'checkbox')
                      "
                    >
                      <Check
                        v-if="isRowSelected(row)"
                        class="mw-datatable__checkbox-icon"
                        aria-hidden="true"
                      />
                    </button>
                  </template>

                  <template v-else-if="col.selectionMode === 'single'">
                    <button
                      type="button"
                      role="radio"
                      class="mw-datatable__radio mw-control"
                      data-row-action
                      :aria-checked="isRowSelected(row) ? 'true' : 'false'"
                      :data-state="isRowSelected(row) ? 'checked' : 'unchecked'"
                      aria-label="Select row"
                      @click.stop="
                        toggleRowSelection($event, row, rowIndex, 'radiobutton')
                      "
                    >
                      <span
                        v-if="isRowSelected(row)"
                        class="mw-datatable__radio-dot"
                        aria-hidden="true"
                      />
                    </button>
                  </template>

                  <template v-else-if="col.expander">
                    <button
                      type="button"
                      class="mw-datatable__expander"
                      data-row-action
                      :aria-expanded="isRowExpanded(row) ? 'true' : 'false'"
                      aria-label="Toggle Row"
                      @click.stop="toggleRowExpansion($event, row)"
                    >
                      <ChevronDown
                        v-if="isRowExpanded(row)"
                        class="mw-datatable__expander-icon"
                        aria-hidden="true"
                      />
                      <ChevronRight
                        v-else
                        class="mw-datatable__expander-icon"
                        aria-hidden="true"
                      />
                    </button>
                  </template>

                  <ColumnSlotRenderer
                    v-else-if="col.bodySlot"
                    :render="col.bodySlot"
                    :scope="{
                      data: row,
                      index: rowIndex,
                      field: col.field,
                      column: col.rawProps,
                      frozenRow: false,
                    }"
                  />

                  <template v-else>
                    {{ formatCellValue(resolveFieldData(row, col.field)) }}
                  </template>
                </td>
              </tr>

              <tr
                v-if="isRowExpanded(row) && $slots.expansion"
                class="mw-datatable__row mw-datatable__row-expansion"
                :data-expanded-row="String(getRowKeyAttr(row, rowIndex))"
              >
                <td
                  :colspan="Math.max(1, visibleColumns.length)"
                  class="mw-datatable__expansion-cell"
                >
                  <slot name="expansion" :data="row" :index="rowIndex" />
                </td>
              </tr>
            </template>
          </template>

          <tr
            v-else
            class="mw-datatable__empty-row"
          >
            <td
              :colspan="Math.max(1, visibleColumns.length)"
              class="mw-datatable__empty-cell"
            >
              <slot name="empty">
                {{ emptyMessage || "暂无数据" }}
              </slot>
            </td>
          </tr>
        </tbody>

        <tfoot
          v-if="hasColumnFooters"
          class="mw-datatable__tfoot"
        >
          <tr class="mw-datatable__footer-row">
            <td
              v-for="col in visibleColumns"
              :key="col.key"
              :class="[
                'mw-datatable__footer-cell',
                {
                  'mw-datatable__cell--frozen': col.frozen,
                },
                col.class,
                col.footerClass,
              ]"
              :style="getFooterCellStyle(col)"
            >
              <ColumnSlotRenderer
                v-if="col.footerSlot"
                :render="col.footerSlot"
                :scope="{ column: col.rawProps }"
              />
              <template v-else-if="col.footer !== undefined">
                {{ col.footer }}
              </template>
            </td>
          </tr>
        </tfoot>
      </table>
    </div>

    <Paginator
      v-if="paginator"
      class="mw-datatable__paginator"
      :first="effectiveFirst"
      :rows="effectiveRows"
      :total-records="effectiveTotalRecords"
      :rows-per-page-options="rowsPerPageOptions"
      :template="paginatorTemplate"
      :current-page-report-template="currentPageReportTemplate"
      :always-show="alwaysShowPaginator"
      @page="onPaginatorPage"
    >
      <template v-if="$slots.paginatorstart" #start="slotProps">
        <slot name="paginatorstart" v-bind="slotProps" />
      </template>
      <template v-if="$slots.paginatorend" #end="slotProps">
        <slot name="paginatorend" v-bind="slotProps" />
      </template>
    </Paginator>

    <div
      v-if="$slots.footer"
      class="mw-datatable__footer"
    >
      <slot name="footer" />
    </div>
  </div>
</template>

<style scoped>
.mw-datatable {
  --mw-datatable-row-h: var(--size-lg-h);
  --mw-datatable-face: var(--mw-datatable-bg, var(--bg-raised));
  --mw-datatable-row-fill: transparent;
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
  overflow: hidden;
  border: var(--border-width) solid var(--mw-datatable-border, var(--border-subtle));
  border-radius: var(--mw-datatable-radius, var(--radius-card));
  background: var(--mw-datatable-face);
  color: var(--text-primary);
  font-family: var(--font-sans);
  font-size: var(--control-font);
}

.mw-datatable--xs {
  --mw-datatable-row-h: var(--size-sm-h);
}

.mw-datatable--sm {
  --mw-datatable-row-h: var(--size-md-h);
}

.mw-datatable--lg {
  --mw-datatable-row-h: calc(var(--size-lg-h) + var(--space-2));
}

.mw-datatable--flex-scrollable {
  flex: 1 1 auto;
  min-height: 0;
  height: 100%;
}

.mw-datatable__header {
  padding: var(--space-3) var(--space-4);
  border-bottom: var(--border-width) solid var(--border-subtle);
}

.mw-datatable__footer {
  padding: var(--space-3) var(--space-4);
  border-top: var(--border-width) solid var(--border-subtle);
}

.mw-datatable__paginator {
  border-top: var(--border-width) solid var(--border-subtle);
}

.mw-datatable__table-container {
  width: 100%;
  overflow-x: auto;
}

.mw-datatable--flex-scrollable > .mw-datatable__table-container {
  flex: 1 1 auto;
  min-height: 0;
  overflow: auto;
}

.mw-datatable__table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  text-align: start;
  font-variant-numeric: tabular-nums;
}

.mw-datatable__header-cell,
.mw-datatable__body-cell,
.mw-datatable__footer-cell {
  height: var(--mw-datatable-row-h);
  padding: var(--space-1) var(--space-3);
  border-bottom: var(--border-width) solid var(--border-subtle);
  line-height: var(--leading-tight);
  vertical-align: middle;
}

.mw-datatable__header-cell {
  position: relative;
  border-bottom-color: var(--border-default);
  background: transparent;
  color: var(--text-tertiary);
  font-size: var(--type-caption-size);
  font-weight: var(--weight-medium);
  text-align: start;
  white-space: nowrap;
  user-select: none;
}

.mw-datatable--scrollable .mw-datatable__thead .mw-datatable__header-cell {
  position: sticky;
  top: 0;
  z-index: 2;
  background: var(--mw-datatable-face);
}

.mw-datatable__header-cell--sortable {
  cursor: pointer;
  transition:
    background-color var(--duration-fast) var(--ease-standard),
    color var(--duration-fast) var(--ease-standard);
}

.mw-datatable__header-cell--sortable:hover {
  background: linear-gradient(var(--fill-subtle), var(--fill-subtle)), var(--mw-datatable-face);
  color: var(--text-secondary);
}

.mw-datatable__header-cell--sortable:focus-visible {
  outline: var(--focus-width) solid var(--focus-color);
  outline-offset: calc(var(--focus-width) * -1);
}

.mw-datatable__header-cell--sorted {
  color: var(--text-primary);
}

.mw-datatable__header-content {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
}

.mw-datatable__sort-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--text-tertiary);
}

.mw-datatable__header-cell--sorted .mw-datatable__sort-icon {
  color: var(--text-accent);
}

.mw-datatable__sort-svg {
  width: var(--icon-sm);
  height: var(--icon-sm);
}

.mw-datatable__sort-svg--unsorted {
  opacity: 0.5;
  transition: opacity var(--duration-fast) var(--ease-standard);
}

.mw-datatable__header-cell--sortable:hover .mw-datatable__sort-svg--unsorted,
.mw-datatable__header-cell--sortable:focus-visible .mw-datatable__sort-svg--unsorted {
  opacity: 1;
}

.mw-datatable__resizer {
  position: absolute;
  top: 0;
  inset-inline-end: 0;
  width: var(--space-2);
  height: 100%;
  cursor: col-resize;
  user-select: none;
  touch-action: none;
}

.mw-datatable__resizer:hover::after {
  content: "";
  position: absolute;
  top: 20%;
  bottom: 20%;
  inset-inline-end: var(--space-0-5);
  width: var(--space-0-5);
  border-radius: var(--radius-full);
  background: var(--accent);
}

.mw-datatable__body-cell {
  background-color: var(--mw-datatable-row-fill);
  color: var(--text-primary);
  transition: background-color var(--duration-fast) var(--ease-standard);
}

.mw-datatable__tbody > .mw-datatable__row:last-child > .mw-datatable__body-cell,
.mw-datatable__tbody > .mw-datatable__row:last-child > .mw-datatable__expansion-cell,
.mw-datatable__tbody > .mw-datatable__empty-row > .mw-datatable__empty-cell {
  border-bottom: 0;
}

.mw-datatable--striped .mw-datatable__tbody > .mw-datatable__row:nth-child(even) {
  --mw-datatable-row-fill: var(--fill-subtle);
}

.mw-datatable--hoverable .mw-datatable__tbody > .mw-datatable__row:hover {
  --mw-datatable-row-fill: var(--fill-subtle);
}

.mw-datatable--hoverable.mw-datatable--striped .mw-datatable__tbody > .mw-datatable__row:hover {
  --mw-datatable-row-fill: var(--fill-default);
}

.mw-datatable__tbody > .mw-datatable__row--selected,
.mw-datatable--striped .mw-datatable__tbody > .mw-datatable__row--selected:nth-child(even) {
  --mw-datatable-row-fill: var(--fill-selected);
}

.mw-datatable--hoverable .mw-datatable__tbody > .mw-datatable__row--selected:hover {
  --mw-datatable-row-fill: var(--fill-selected-hover);
}

.mw-datatable__cell--frozen {
  position: sticky;
  z-index: 1;
}

/* 冻结列压在滚动内容之上，必须是实底：半透明行态叠在表面色上。 */
.mw-datatable__body-cell.mw-datatable__cell--frozen,
.mw-datatable__footer-cell.mw-datatable__cell--frozen {
  background:
    linear-gradient(var(--mw-datatable-row-fill), var(--mw-datatable-row-fill)),
    var(--mw-datatable-face);
}

.mw-datatable__thead .mw-datatable__cell--frozen {
  z-index: 3;
  background: var(--mw-datatable-face);
}

.mw-datatable__checkbox,
.mw-datatable__radio {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: var(--icon-lg);
  height: var(--icon-lg);
  padding: 0;
  cursor: pointer;
  vertical-align: middle;
}

.mw-datatable__checkbox {
  border-radius: var(--radius-xs);
}

.mw-datatable__radio {
  border-radius: var(--radius-full);
}

.mw-datatable__checkbox[data-state="checked"],
.mw-datatable__checkbox[data-state="indeterminate"],
.mw-datatable__radio[data-state="checked"] {
  background-color: var(--accent);
  background-image: none;
  border-color: var(--accent);
  color: var(--text-on-accent);
}

.mw-datatable__checkbox-icon {
  width: var(--icon-xs);
  height: var(--icon-xs);
}

.mw-datatable__radio-dot {
  width: var(--space-2);
  height: var(--space-2);
  border-radius: var(--radius-full);
  background: currentColor;
}

.mw-datatable__expander {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: var(--control-h);
  height: var(--control-h);
  padding: 0;
  border: none;
  border-radius: var(--control-radius);
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
  transition:
    background-color var(--duration-fast) var(--ease-standard),
    color var(--duration-fast) var(--ease-standard);
}

.mw-datatable__expander:hover {
  background: var(--fill-default);
  color: var(--text-primary);
}

.mw-datatable__expander:focus-visible {
  outline: var(--focus-width) solid var(--focus-color);
  outline-offset: calc(var(--focus-width) * -1);
}

.mw-datatable__expander-icon {
  width: var(--control-icon);
  height: var(--control-icon);
}

.mw-datatable__expansion-cell {
  padding: var(--space-3) var(--space-4);
  border-bottom: var(--border-width) solid var(--border-subtle);
  background: var(--fill-subtle);
}

.mw-datatable__empty-cell {
  padding: var(--space-12) var(--space-4);
  color: var(--text-secondary);
  font-size: var(--type-body-sm-size);
  line-height: var(--type-body-sm-line);
  text-align: center;
}

.mw-datatable__loading-overlay {
  position: absolute;
  inset: 0;
  z-index: 4;
  display: flex;
  align-items: center;
  justify-content: center;
  background: color-mix(in srgb, var(--mw-datatable-face) 60%, transparent);
}

.mw-datatable__loading-spinner {
  width: var(--icon-2xl);
  height: var(--icon-2xl);
  border: var(--focus-width) solid var(--accent);
  border-right-color: transparent;
  border-radius: var(--radius-full);
  animation: mw-datatable-spin calc(var(--duration-slower) * 2) linear infinite;
}

@keyframes mw-datatable-spin {
  to {
    transform: rotate(360deg);
  }
}

@media (prefers-reduced-motion: reduce) {
  .mw-datatable__header-cell--sortable,
  .mw-datatable__body-cell,
  .mw-datatable__sort-svg--unsorted,
  .mw-datatable__expander {
    transition: none;
  }
  .mw-datatable__loading-spinner {
    animation: none;
  }
}
</style>
