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
import Paginator from "./Paginator.vue";
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
  size: "md",
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

const resolvedSize = computed(() => {
  if (props.size === "small" || props.size === "sm") return "sm";
  if (props.size === "large" || props.size === "lg") return "lg";
  return "md";
});

const isFlexScrollable = computed(
  () => Boolean(props.scrollable && props.scrollHeight === "flex"),
);

const rootClass = computed(() => [
  "mw-datatable",
  "p-datatable",
  `mw-datatable--${resolvedSize.value}`,
  {
    "p-datatable-sm": resolvedSize.value === "sm",
    "p-datatable-lg": resolvedSize.value === "lg",
    "mw-datatable--scrollable": props.scrollable,
    "p-datatable-scrollable": props.scrollable,
    "mw-datatable--flex-scrollable": isFlexScrollable.value,
    "p-datatable-flex-scrollable": isFlexScrollable.value,
    "mw-datatable--striped": props.stripedRows,
    "p-datatable-striped": props.stripedRows,
    "mw-datatable--hoverable":
      props.rowHover || Boolean(effectiveSelectionMode.value),
    "p-datatable-hoverable":
      props.rowHover || Boolean(effectiveSelectionMode.value),
    "mw-datatable--resizable": props.resizableColumns,
    "p-datatable-resizable": props.resizableColumns,
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
      class="mw-datatable__header p-datatable-header"
    >
      <slot name="header" />
    </div>

    <div
      v-if="loading"
      class="mw-datatable__loading-overlay p-datatable-loading-overlay"
      data-testid="datatable-loading"
    >
      <slot name="loading">
        <span class="mw-datatable__loading-spinner" aria-hidden="true" />
      </slot>
    </div>

    <div
      class="mw-datatable__table-container p-datatable-table-container mw-scroll"
      :style="tableContainerStyle"
    >
      <table
        :class="['mw-datatable__table', 'p-datatable-table', tableClass]"
        :style="tableStyle"
        role="table"
      >
        <thead class="mw-datatable__thead p-datatable-thead">
          <tr class="mw-datatable__header-row">
            <th
              v-for="col in visibleColumns"
              :key="col.key"
              scope="col"
              :class="[
                'mw-datatable__header-cell',
                'p-datatable-header-cell',
                {
                  'mw-datatable__header-cell--sortable': col.sortable,
                  'p-datatable-sortable-column': col.sortable,
                  'mw-datatable__header-cell--sorted': isColumnSorted(col),
                  'p-datatable-column-sorted': isColumnSorted(col),
                  'mw-datatable__cell--frozen': col.frozen,
                  'p-datatable-frozen-column': col.frozen,
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
                  <svg
                    v-if="someCurrentPageSelected"
                    class="mw-datatable__checkbox-icon"
                    viewBox="0 0 16 16"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M3.5 8H12.5"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                    />
                  </svg>
                  <svg
                    v-else-if="allCurrentPageSelected"
                    class="mw-datatable__checkbox-icon"
                    viewBox="0 0 16 16"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M3.5 8.5L6.5 11.5L12.5 4.5"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                </button>
              </template>

              <div
                v-else
                class="mw-datatable__header-content p-datatable-column-header-content"
              >
                <ColumnSlotRenderer
                  v-if="col.headerSlot"
                  :render="col.headerSlot"
                  :scope="{ column: col.rawProps }"
                />
                <span
                  v-else-if="col.header !== undefined"
                  class="mw-datatable__header-title p-datatable-column-title"
                >
                  {{ col.header }}
                </span>

                <span
                  v-if="col.sortable"
                  class="mw-datatable__sort-icon p-sortable-column-icon"
                  aria-hidden="true"
                >
                  <svg
                    v-if="isColumnSorted(col) && effectiveSortOrder === 1"
                    viewBox="0 0 16 16"
                    fill="none"
                    class="mw-datatable__sort-svg"
                  >
                    <path
                      d="M8 3.5V12.5M8 3.5L4.5 7M8 3.5L11.5 7"
                      stroke="currentColor"
                      stroke-width="1.5"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                  <svg
                    v-else-if="isColumnSorted(col) && effectiveSortOrder === -1"
                    viewBox="0 0 16 16"
                    fill="none"
                    class="mw-datatable__sort-svg"
                  >
                    <path
                      d="M8 12.5V3.5M8 12.5L4.5 9M8 12.5L11.5 9"
                      stroke="currentColor"
                      stroke-width="1.5"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                  <svg
                    v-else
                    viewBox="0 0 16 16"
                    fill="none"
                    class="mw-datatable__sort-svg mw-datatable__sort-svg--unsorted"
                  >
                    <path
                      d="M5.5 6L8 3.5L10.5 6M5.5 10L8 12.5L10.5 10"
                      stroke="currentColor"
                      stroke-width="1.5"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                </span>
              </div>

              <span
                v-if="resizableColumns"
                class="mw-datatable__resizer p-column-resizer"
                data-column-resizer
                @mousedown.stop="onResizeStart($event, col)"
                @touchstart.stop="onResizeStart($event, col)"
              />
            </th>
          </tr>
        </thead>

        <tbody class="mw-datatable__tbody p-datatable-tbody">
          <template v-if="displayedRows.length > 0">
            <template
              v-for="(row, rowIndex) in displayedRows"
              :key="getRowKeyAttr(row, rowIndex)"
            >
              <tr
                :class="[
                  'mw-datatable__row',
                  'p-datatable-row',
                  {
                    'mw-datatable__row--selected': isRowSelected(row),
                    'p-datatable-row-selected': isRowSelected(row),
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
                    'p-datatable-body-cell',
                    {
                      'mw-datatable__cell--frozen': col.frozen,
                      'p-datatable-frozen-column': col.frozen,
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
                      <svg
                        v-if="isRowSelected(row)"
                        class="mw-datatable__checkbox-icon"
                        viewBox="0 0 16 16"
                        fill="none"
                        aria-hidden="true"
                      >
                        <path
                          d="M3.5 8.5L6.5 11.5L12.5 4.5"
                          stroke="currentColor"
                          stroke-width="2"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        />
                      </svg>
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
                      class="mw-datatable__expander p-datatable-row-toggle-button"
                      data-row-action
                      :aria-expanded="isRowExpanded(row) ? 'true' : 'false'"
                      aria-label="Toggle Row"
                      @click.stop="toggleRowExpansion($event, row)"
                    >
                      <svg
                        class="mw-datatable__expander-icon"
                        viewBox="0 0 16 16"
                        fill="none"
                        aria-hidden="true"
                      >
                        <path
                          :d="
                            isRowExpanded(row)
                              ? 'M4 6L8 10L12 6'
                              : 'M6 4L10 8L6 12'
                          "
                          stroke="currentColor"
                          stroke-width="1.75"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        />
                      </svg>
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
                class="mw-datatable__row mw-datatable__row-expansion p-datatable-row-expansion"
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
            class="mw-datatable__empty-row p-datatable-empty-message"
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
          class="mw-datatable__tfoot p-datatable-tfoot"
        >
          <tr class="mw-datatable__footer-row">
            <td
              v-for="col in visibleColumns"
              :key="col.key"
              :class="[
                'mw-datatable__footer-cell',
                'p-datatable-footer-cell',
                {
                  'mw-datatable__cell--frozen': col.frozen,
                  'p-datatable-frozen-column': col.frozen,
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
      class="mw-datatable__paginator p-paginator-bottom"
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
      class="mw-datatable__footer p-datatable-footer"
    >
      <slot name="footer" />
    </div>
  </div>
</template>

<style scoped>
.mw-datatable {
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
  font-family: var(--font-family-sans);
  font-size: var(--font-size-body-sm);
  color: var(--color-text-primary);
}

.mw-datatable--flex-scrollable {
  flex: 1 1 auto;
  min-height: 0;
  height: 100%;
}

.mw-datatable__header {
  padding: var(--space-3) var(--space-4);
  background: var(--color-surface-muted);
  border-bottom: 1px solid var(--color-border-subtle);
}

.mw-datatable__footer {
  padding: var(--space-3) var(--space-4);
  background: var(--color-surface-muted);
  border-top: 1px solid var(--color-border-subtle);
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
}

.mw-datatable__header-cell,
.mw-datatable__body-cell,
.mw-datatable__footer-cell {
  padding: var(--space-3) var(--space-4);
  line-height: 1.25;
  border-bottom: 1px solid var(--color-border-subtle);
  vertical-align: middle;
}

.mw-datatable--sm .mw-datatable__header-cell,
.mw-datatable--sm .mw-datatable__body-cell,
.mw-datatable--sm .mw-datatable__footer-cell {
  padding: var(--space-2) var(--space-3);
  font-size: var(--font-size-caption);
}

.mw-datatable--lg .mw-datatable__header-cell,
.mw-datatable--lg .mw-datatable__body-cell,
.mw-datatable--lg .mw-datatable__footer-cell {
  padding: var(--space-4) var(--space-5);
  font-size: var(--font-size-body);
}

.mw-datatable__header-cell {
  position: relative;
  background: var(--color-surface-muted);
  color: var(--color-text-secondary);
  font-weight: 600;
  white-space: nowrap;
  user-select: none;
}

.mw-datatable--scrollable .mw-datatable__thead .mw-datatable__header-cell {
  position: sticky;
  top: 0;
  z-index: 2;
}

.mw-datatable__header-cell--sortable {
  cursor: pointer;
  transition:
    background-color var(--motion-duration-fast) var(--motion-ease-standard),
    color var(--motion-duration-fast) var(--motion-ease-standard);
}

.mw-datatable__header-cell--sortable:hover {
  background: var(--color-bg-hover);
  color: var(--color-text-primary);
}

.mw-datatable__header-cell--sortable:focus-visible {
  outline: none;
  box-shadow: inset 0 0 0 2px var(--color-brand-500);
}

.mw-datatable__header-cell--sorted {
  color: var(--color-brand-700);
  background: rgb(var(--color-brand-500-rgb) / 0.08);
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
  color: currentColor;
}

.mw-datatable__sort-svg {
  width: 14px;
  height: 14px;
}

.mw-datatable__sort-svg--unsorted {
  opacity: 0.45;
}

.mw-datatable__resizer {
  position: absolute;
  top: 0;
  inset-inline-end: 0;
  width: 8px;
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
  inset-inline-end: 2px;
  width: 2px;
  border-radius: var(--radius-pill);
  background: var(--color-brand-500);
}

.mw-datatable__body-cell {
  background: var(--color-surface-base);
  color: var(--color-text-primary);
}

.mw-datatable--striped
  .mw-datatable__tbody
  > .mw-datatable__row:nth-child(even):not(.mw-datatable__row--selected)
  > .mw-datatable__body-cell {
  background: var(--color-surface-muted);
}

.mw-datatable--hoverable
  .mw-datatable__tbody
  > .mw-datatable__row:not(.mw-datatable__row--selected):hover
  > .mw-datatable__body-cell {
  background: var(--color-bg-soft);
}

.mw-datatable__row--selected > .mw-datatable__body-cell {
  background: rgb(var(--color-brand-500-rgb) / 0.12);
}

.mw-datatable__cell--frozen {
  position: sticky;
  z-index: 1;
}

.mw-datatable__thead .mw-datatable__cell--frozen {
  z-index: 3;
}

.mw-datatable__checkbox,
.mw-datatable__radio {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  padding: 0;
  cursor: pointer;
  vertical-align: middle;
}

.mw-datatable__checkbox {
  border-radius: var(--radius-xs);
}

.mw-datatable__radio {
  border-radius: var(--radius-pill);
}

.mw-datatable__checkbox[data-state="checked"],
.mw-datatable__checkbox[data-state="indeterminate"],
.mw-datatable__radio[data-state="checked"] {
  background-color: var(--color-brand-500);
  background-image: none;
  border-color: var(--color-brand-500);
  color: var(--color-text-on-brand);
}

.mw-datatable__checkbox-icon {
  width: 12px;
  height: 12px;
}

.mw-datatable__radio-dot {
  width: 8px;
  height: 8px;
  border-radius: var(--radius-pill);
  background: currentColor;
}

.mw-datatable__expander {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  padding: 0;
  border: none;
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--color-text-secondary);
  cursor: pointer;
  transition:
    background-color var(--motion-duration-fast) var(--motion-ease-standard),
    color var(--motion-duration-fast) var(--motion-ease-standard);
}

.mw-datatable__expander:hover {
  background: var(--material-hover);
  color: var(--color-text-primary);
}

.mw-datatable__expander-icon {
  width: 14px;
  height: 14px;
}

.mw-datatable__expansion-cell {
  padding: var(--space-3) var(--space-4);
  background: var(--color-bg-soft);
  border-bottom: 1px solid var(--color-border-subtle);
}

.mw-datatable__empty-cell {
  padding: var(--space-6) var(--space-4);
  text-align: center;
  color: var(--color-text-tertiary);
}

.mw-datatable__loading-overlay {
  position: absolute;
  inset: 0;
  z-index: 4;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgb(var(--color-brand-500-rgb) / 0.04);
}

.mw-datatable__loading-spinner {
  width: 24px;
  height: 24px;
  border-radius: var(--radius-pill);
  border: 2px solid var(--color-brand-500);
  border-right-color: transparent;
  animation: mw-datatable-spin var(--motion-duration-spatial) linear infinite;
}

@keyframes mw-datatable-spin {
  to {
    transform: rotate(360deg);
  }
}

@media (prefers-reduced-motion: reduce) {
  .mw-datatable__header-cell--sortable,
  .mw-datatable__expander {
    transition: none;
  }
  .mw-datatable__loading-spinner {
    animation: none;
  }
}
</style>
