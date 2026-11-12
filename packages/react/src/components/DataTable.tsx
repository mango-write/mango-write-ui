import {
  Fragment,
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactElement,
  type Ref,
  type RefAttributes,
  type TouchEvent as ReactTouchEvent,
} from "react";
import {
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Check,
  ChevronDown,
  ChevronRight,
  Minus,
  RotateCw,
} from "lucide-react";
import { useScrollFade } from "../lib/scroll-fade";
import { useUiLocale } from "../locale";
import { Button } from "./Button";
import { Paginator } from "./Paginator";
import {
  flattenClassValue,
  isInteractiveRowTarget,
  resolveFieldData,
  resolveNormalizedColumns,
  resolveRowKey,
  type ColumnProps,
  type DataTableColumnResizeEndEvent,
  type DataTableColumnResizeMode,
  type DataTableEmits,
  type DataTableExportCSVOptions,
  type DataTableFieldAccessor,
  type DataTableFrozenAlign,
  type DataTableHandle,
  type DataTablePageEvent,
  type DataTablePaginationState,
  type DataTableProps,
  type DataTableRowClickEvent,
  type DataTableRowCollapseEvent,
  type DataTableRowExpandEvent,
  type DataTableRowSelectAllEvent,
  type DataTableRowSelectEvent,
  type DataTableRowUnselectAllEvent,
  type DataTableRowUnselectEvent,
  type DataTableSelectionMode,
  type DataTableSize,
  type DataTableSortDirection,
  type DataTableSortEvent,
  type DataTableSortingRule,
  type NormalizedDataTableColumn,
  type PaginatorPageEvent,
} from "./data-table";

export type {
  ColumnProps,
  DataTableColumnResizeEndEvent,
  DataTableColumnResizeMode,
  DataTableEmits,
  DataTableExportCSVOptions,
  DataTableFieldAccessor,
  DataTableFrozenAlign,
  DataTableHandle,
  DataTablePageEvent,
  DataTablePaginationState,
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
  DataTableSortDirection,
  DataTableSortEvent,
  DataTableSortingRule,
} from "./data-table";

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

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

function formatDimension(val: number | string | undefined): string | undefined {
  if (val === undefined || val === "") return undefined;
  return typeof val === "number" ? `${val}px` : val;
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

function extractClientX(event: MouseEvent | TouchEvent | PointerEvent): number {
  if ("touches" in event) {
    const touch = event.touches[0] ?? event.changedTouches[0];
    return touch ? touch.clientX : 0;
  }
  return typeof event.clientX === "number" ? event.clientX : 0;
}

interface ActiveColumnResize {
  colKey: string;
  field?: string;
  thEl: HTMLElement;
  startX: number;
  startWidth: number;
  currentWidth: number;
}

const DataTableBase = forwardRef<DataTableHandle, DataTableProps<any>>(
  function MwDataTable(props, forwardedRef) {
    const {
      value,
      data,
      rows: rowsOrPageSize,
      columns: columnsProp,
      rowKey,
      dataKey,
      loading = false,
      loadingContent,
      readOnly = false,
      readonly: readonlyProp = false,
      error,
      errorMessage,
      onRetry,
      lazy = false,
      serverSide = false,
      mode,
      pagination: paginationProp,
      onPaginationChange,
      paginator: paginatorProp,
      alwaysShowPaginator = true,
      first: firstProp,
      totalRecords: totalRecordsProp,
      rowsPerPageOptions,
      paginatorTemplate,
      currentPageReportTemplate,
      paginatorStart,
      paginatorEnd,
      onFirstChange,
      onRowsChange,
      onPage,
      selection: selectionProp,
      selectionMode: selectionModeProp,
      selectionValueMode,
      metaKeySelection = false,
      onSelectionChange,
      onRowSelect,
      onRowUnselect,
      onRowSelectAll,
      onRowUnselectAll,
      expandedKeys: expandedKeysProp,
      onExpandedKeysChange,
      expandedRows: expandedRowsProp,
      onExpandedRowsChange,
      expansion,
      renderExpansion,
      onRowExpand,
      onRowCollapse,
      sorting: sortingProp,
      onSortingChange,
      sortField: sortFieldProp,
      sortOrder: sortOrderProp,
      removableSort = false,
      onSortFieldChange,
      onSortOrderChange,
      onSort,
      onRowClick: onRowClickProp,
      scrollable = false,
      scrollHeight,
      resizableColumns = false,
      columnResizeMode = "fit",
      onColumnResizeEnd,
      stripedRows = false,
      rowHover = false,
      size,
      rowClassName,
      rowClass,
      rowStyle,
      tableStyle,
      tableClassName,
      tableClass,
      responsiveLayout: _responsiveLayout,
      header,
      footer,
      empty,
      emptyMessage,
      csvSeparator = ",",
      exportFilename = "download",
      className,
      style,
      children,
      ...restAttrs
    } = props;

    const { t } = useUiLocale();
    const isReadonly = Boolean(readOnly || readonlyProp);
    const isServerMode = Boolean(lazy || serverSide || mode === "server");
    const effectiveRowKey = rowKey ?? dataKey;

    const rawRows = useMemo<readonly any[]>(() => {
      if (Array.isArray(value)) return value;
      if (Array.isArray(data)) return data;
      if (Array.isArray(rowsOrPageSize)) return rowsOrPageSize;
      return [];
    }, [value, data, rowsOrPageSize]);

    const rowsCountProp =
      typeof rowsOrPageSize === "number" ? rowsOrPageSize : undefined;

    const visibleColumns = useMemo<NormalizedDataTableColumn<any>[]>(
      () => resolveNormalizedColumns(columnsProp, children),
      [columnsProp, children],
    );

    const hasColumnFooters = useMemo(
      () =>
        visibleColumns.some(
          (col) =>
            Boolean(col.footerRenderer) ||
            col.footerNode !== undefined ||
            col.footer !== undefined,
        ),
      [visibleColumns],
    );

    // Pagination state (supports both unified `pagination` and `paginator + first + rows`)
    const isPaginated =
      paginatorProp !== undefined ? paginatorProp : paginationProp !== undefined;

    const [uncontrolledFirst, setUncontrolledFirst] = useState<number>(
      Math.max(0, firstProp ?? 0),
    );
    const [uncontrolledPageSize, setUncontrolledPageSize] = useState<number>(
      rowsCountProp && rowsCountProp > 0 ? rowsCountProp : 10,
    );

    const effectivePageSize = useMemo(() => {
      if (paginationProp !== undefined) {
        return Math.max(1, paginationProp.pageSize || 10);
      }
      if (rowsCountProp !== undefined && rowsCountProp > 0) {
        return rowsCountProp;
      }
      return Math.max(1, uncontrolledPageSize || 10);
    }, [paginationProp, rowsCountProp, uncontrolledPageSize]);

    const effectiveFirst = useMemo(() => {
      if (paginationProp !== undefined) {
        return Math.max(0, paginationProp.pageIndex) * effectivePageSize;
      }
      if (firstProp !== undefined && Number.isFinite(firstProp)) {
        return Math.max(0, firstProp);
      }
      return Math.max(0, uncontrolledFirst);
    }, [paginationProp, effectivePageSize, firstProp, uncontrolledFirst]);

    const currentPageIndex = Math.floor(effectiveFirst / effectivePageSize);

    // Sorting state (supports both unified `sorting: {key, order}[]` and `sortField/sortOrder`)
    const [uncontrolledSorting, setUncontrolledSorting] = useState<
      DataTableSortingRule[]
    >(() => {
      if (sortingProp !== undefined) return [...sortingProp];
      if (sortFieldProp && sortOrderProp && sortOrderProp !== 0) {
        return [
          {
            key: sortFieldProp,
            order: sortOrderProp > 0 ? "asc" : "desc",
          },
        ];
      }
      return [];
    });

    const effectiveSorting = useMemo<readonly DataTableSortingRule[]>(() => {
      if (sortingProp !== undefined) {
        return sortingProp;
      }
      if (sortFieldProp !== undefined || sortOrderProp !== undefined) {
        if (sortFieldProp && (sortOrderProp ?? 0) !== 0) {
          return [
            {
              key: sortFieldProp,
              order: (sortOrderProp ?? 1) > 0 ? "asc" : "desc",
            },
          ];
        }
        return [];
      }
      return uncontrolledSorting;
    }, [sortingProp, sortFieldProp, sortOrderProp, uncontrolledSorting]);

    const primarySortRule = effectiveSorting[0];
    const effectiveSortField = primarySortRule?.key;
    const effectiveSortOrder = primarySortRule
      ? primarySortRule.order === "asc"
        ? 1
        : -1
      : 0;

    // Selection state
    const [uncontrolledSelection, setUncontrolledSelection] =
      useState<any>(selectionProp);
    const effectiveSelection =
      selectionProp !== undefined ? selectionProp : uncontrolledSelection;

    const columnSelectionMode = useMemo<DataTableSelectionMode | undefined>(
      () => visibleColumns.find((col) => col.selectionMode)?.selectionMode,
      [visibleColumns],
    );
    const effectiveSelectionMode = selectionModeProp ?? columnSelectionMode;
    const isMultipleSelection =
      effectiveSelectionMode === "multiple" || Array.isArray(effectiveSelection);

    const resolvedSelectionValueMode = useMemo<"key" | "row">(() => {
      if (selectionValueMode) return selectionValueMode;
      if (Array.isArray(effectiveSelection) && effectiveSelection.length > 0) {
        const sample = effectiveSelection[0];
        return sample !== null && typeof sample === "object" ? "row" : "key";
      }
      if (!Array.isArray(effectiveSelection) && effectiveSelection != null) {
        return typeof effectiveSelection === "object" ? "row" : "key";
      }
      if (rowKey !== undefined && dataKey === undefined) {
        return "key";
      }
      return "row";
    }, [selectionValueMode, effectiveSelection, rowKey, dataKey]);

    // Expansion state (supports both `expandedKeys` and `expandedRows`)
    const [uncontrolledExpanded, setUncontrolledExpanded] = useState<any>(
      expandedKeysProp ?? expandedRowsProp,
    );
    const isExpandedKeysControlled = expandedKeysProp !== undefined;
    const isExpandedRowsControlled = expandedRowsProp !== undefined;
    const effectiveExpanded = isExpandedKeysControlled
      ? expandedKeysProp
      : isExpandedRowsControlled
        ? expandedRowsProp
        : uncontrolledExpanded;

    // Column resizing & sticky measurement
    const [columnWidths, setColumnWidths] = useState<Record<string, number>>({});
    const [measuredThWidths, setMeasuredThWidths] = useState<
      Record<string, number>
    >({});
    const thRefs = useRef<Record<string, HTMLTableCellElement | null>>({});

    const getColumnSortField = useCallback(
      (col: NormalizedDataTableColumn<any>): string | undefined => {
        if (col.sortField) return col.sortField;
        if (typeof col.field === "string" && col.field) return col.field;
        return col.columnKey ?? col.key;
      },
      [],
    );

    const getRowKeyAttr = useCallback(
      (row: any, index: number): string | number => {
        const key = resolveRowKey(row, effectiveRowKey, index);
        if (typeof key === "string" || typeof key === "number") {
          return key;
        }
        return index;
      },
      [effectiveRowKey],
    );

    // TanStack Table integration
    const tanstackColumns = useMemo<ColumnDef<any, any>[]>(
      () =>
        visibleColumns.map((col) => {
          const sortFieldKey = getColumnSortField(col);
          return {
            id: col.key,
            accessorFn: (row) => resolveFieldData(row, col.field),
            enableSorting: col.sortable,
            sortUndefined: false,
            sortingFn: (rowA, rowB) =>
              compareCellValues(
                resolveFieldData(rowA.original, col.field ?? sortFieldKey),
                resolveFieldData(rowB.original, col.field ?? sortFieldKey),
                1,
              ),
            size: columnWidths[col.key] ?? parsePixelWidth(col.width) ?? 120,
            minSize: parsePixelWidth(col.minWidth) ?? 32,
          };
        }),
      [visibleColumns, getColumnSortField, columnWidths],
    );

    const tanstackSorting = useMemo<SortingState>(() => {
      return effectiveSorting.map((rule) => {
        const matched = visibleColumns.find(
          (col) => getColumnSortField(col) === rule.key,
        );
        return {
          id: matched ? matched.key : rule.key,
          desc: rule.order === "desc",
        };
      });
    }, [effectiveSorting, visibleColumns, getColumnSortField]);

    const clampedLocalPageIndex = useMemo(() => {
      if (isServerMode || !isPaginated) return currentPageIndex;
      if (rawRows.length === 0) return 0;
      const maxPage = Math.max(
        0,
        Math.ceil(rawRows.length / effectivePageSize) - 1,
      );
      return Math.min(currentPageIndex, maxPage);
    }, [isServerMode, isPaginated, currentPageIndex, rawRows.length, effectivePageSize]);

    const table = useReactTable({
      data: rawRows as any[],
      columns: tanstackColumns,
      getRowId: (row, index) => String(getRowKeyAttr(row, index)),
      state: {
        sorting: tanstackSorting,
        pagination: {
          pageIndex: clampedLocalPageIndex,
          pageSize: effectivePageSize,
        },
        columnSizing: columnWidths,
      },
      manualSorting: isServerMode,
      manualPagination: isServerMode || !isPaginated,
      getCoreRowModel: getCoreRowModel(),
      getSortedRowModel: isServerMode ? undefined : getSortedRowModel(),
      getPaginationRowModel:
        isServerMode || !isPaginated ? undefined : getPaginationRowModel(),
    });

    const sortedRows = useMemo<readonly any[]>(() => {
      if (isServerMode) return rawRows;
      return table.getPrePaginationRowModel().rows.map((r) => r.original);
    }, [isServerMode, rawRows, table, tanstackSorting, tanstackColumns]);

    const displayedRows = useMemo<readonly any[]>(() => {
      if (isServerMode) return rawRows;
      return table.getRowModel().rows.map((r) => r.original);
    }, [
      isServerMode,
      rawRows,
      table,
      tanstackSorting,
      tanstackColumns,
      clampedLocalPageIndex,
      effectivePageSize,
    ]);

    const effectiveTotalRecords = useMemo(() => {
      if (paginationProp !== undefined) return paginationProp.total;
      if (totalRecordsProp !== undefined) return totalRecordsProp;
      return sortedRows.length;
    }, [paginationProp, totalRecordsProp, sortedRows.length]);

    // Sync measured DOM widths for sticky frozen columns
    const hasFrozenColumns = useMemo(
      () => visibleColumns.some((col) => col.frozen),
      [visibleColumns],
    );

    useIsomorphicLayoutEffect(() => {
      if (!hasFrozenColumns) return;
      const measure = () => {
        const next: Record<string, number> = {};
        let changed = false;
        for (const col of visibleColumns) {
          const el = thRefs.current[col.key];
          if (!el) continue;
          const rectW = el.getBoundingClientRect?.().width ?? 0;
          const w = rectW > 0 ? Math.round(rectW) : el.offsetWidth;
          if (w > 0) {
            next[col.key] = w;
          }
        }
        setMeasuredThWidths((prev) => {
          const keys = new Set([...Object.keys(prev), ...Object.keys(next)]);
          for (const k of keys) {
            if (prev[k] !== next[k]) {
              changed = true;
              break;
            }
          }
          return changed ? next : prev;
        });
      };

      measure();
      if (typeof ResizeObserver === "undefined") return;
      const ro = new ResizeObserver(() => measure());
      for (const col of visibleColumns) {
        const el = thRefs.current[col.key];
        if (el) ro.observe(el);
      }
      return () => ro.disconnect();
    }, [hasFrozenColumns, visibleColumns, columnWidths]);

    const frozenOffsets = useMemo(() => {
      const map: Record<string, { side: "left" | "right"; offset: number }> = {};
      if (!hasFrozenColumns) return map;

      const getColEffectiveWidth = (col: NormalizedDataTableColumn<any>): number => {
        if (columnWidths[col.key] !== undefined) return columnWidths[col.key]!;
        if (measuredThWidths[col.key] !== undefined) {
          return measuredThWidths[col.key]!;
        }
        const parsed = parsePixelWidth(col.width);
        if (parsed !== undefined) return parsed;
        if (col.selectionMode || col.expander) return 44;
        return 0;
      };

      let leftAccum = 0;
      for (const col of visibleColumns) {
        if (col.frozen && col.alignFrozen !== "right") {
          map[col.key] = { side: "left", offset: leftAccum };
          leftAccum += getColEffectiveWidth(col);
        }
      }

      let rightAccum = 0;
      for (let i = visibleColumns.length - 1; i >= 0; i -= 1) {
        const col = visibleColumns[i]!;
        if (col.frozen && col.alignFrozen === "right") {
          map[col.key] = { side: "right", offset: rightAccum };
          rightAccum += getColEffectiveWidth(col);
        }
      }
      return map;
    }, [hasFrozenColumns, visibleColumns, columnWidths, measuredThWidths]);

    const rowsEqual = useCallback(
      (a: any, b: any): boolean => {
        if (a === b) return true;
        if (a == null || b == null) return false;
        if (effectiveRowKey) {
          const keyA =
            typeof a === "object" ? resolveRowKey(a, effectiveRowKey) : a;
          const keyB =
            typeof b === "object" ? resolveRowKey(b, effectiveRowKey) : b;
          if (keyA !== undefined && keyB !== undefined) {
            return keyA === keyB;
          }
        }
        return false;
      },
      [effectiveRowKey],
    );

    const toSelectionUnit = useCallback(
      (row: any): any => {
        if (resolvedSelectionValueMode === "key" && effectiveRowKey) {
          const key = resolveRowKey(row, effectiveRowKey);
          if (key !== undefined) return key;
        }
        return row;
      },
      [resolvedSelectionValueMode, effectiveRowKey],
    );

    const isRowSelected = useCallback(
      (row: any): boolean => {
        if (effectiveSelection == null) return false;
        if (Array.isArray(effectiveSelection)) {
          return effectiveSelection.some((item) => rowsEqual(item, row));
        }
        return rowsEqual(effectiveSelection, row);
      },
      [effectiveSelection, rowsEqual],
    );

    const allCurrentPageSelected = useMemo(() => {
      if (displayedRows.length === 0) return false;
      return displayedRows.every((row) => isRowSelected(row));
    }, [displayedRows, isRowSelected]);

    const someCurrentPageSelected = useMemo(() => {
      if (displayedRows.length === 0 || allCurrentPageSelected) return false;
      return displayedRows.some((row) => isRowSelected(row));
    }, [displayedRows, allCurrentPageSelected, isRowSelected]);

    function commitSelection(nextValue: any) {
      if (selectionProp === undefined) {
        setUncontrolledSelection(nextValue);
      }
      onSelectionChange?.(nextValue);
    }

    function toggleRowSelection(
      nativeEvent: Event,
      row: any,
      rowIndex: number,
      triggerType: string,
    ) {
      if (isReadonly) return;

      if (isMultipleSelection) {
        const currentList = Array.isArray(effectiveSelection)
          ? effectiveSelection
          : [];
        if (isRowSelected(row)) {
          // Off-page server items/IDs do not match `row`, so they stay intact
          const nextList = currentList.filter((item) => !rowsEqual(item, row));
          commitSelection(nextList);
          onRowUnselect?.({
            originalEvent: nativeEvent,
            data: row,
            index: rowIndex,
            type: triggerType,
          });
        } else {
          const nextList = [...currentList, toSelectionUnit(row)];
          commitSelection(nextList);
          onRowSelect?.({
            originalEvent: nativeEvent,
            data: row,
            index: rowIndex,
            type: triggerType,
          });
        }
        return;
      }

      if (effectiveSelectionMode === "single") {
        if (isRowSelected(row)) {
          const allowUnselect =
            triggerType !== "row" ||
            !metaKeySelection ||
            (nativeEvent as MouseEvent).metaKey ||
            (nativeEvent as MouseEvent).ctrlKey;
          if (allowUnselect) {
            commitSelection(null);
            onRowUnselect?.({
              originalEvent: nativeEvent,
              data: row,
              index: rowIndex,
              type: triggerType,
            });
          }
        } else {
          commitSelection(toSelectionUnit(row));
          onRowSelect?.({
            originalEvent: nativeEvent,
            data: row,
            index: rowIndex,
            type: triggerType,
          });
        }
      }
    }

    function handleToggleSelectAll(event: ReactMouseEvent<HTMLButtonElement>) {
      event.stopPropagation();
      if (isReadonly) return;

      const currentList = Array.isArray(effectiveSelection)
        ? effectiveSelection
        : [];
      const pageRows = displayedRows;

      if (allCurrentPageSelected) {
        const nextList = currentList.filter(
          (item) => !pageRows.some((row) => rowsEqual(item, row)),
        );
        commitSelection(nextList);
        onRowUnselectAll?.({ originalEvent: event.nativeEvent });
      } else {
        const newlySelected = pageRows
          .filter((row) => !currentList.some((item) => rowsEqual(item, row)))
          .map((row) => toSelectionUnit(row));
        const nextList = [...currentList, ...newlySelected];
        commitSelection(nextList);
        onRowSelectAll?.({
          originalEvent: event.nativeEvent,
          data: pageRows as any[],
        });
      }
    }

    const isRowExpanded = useCallback(
      (row: any): boolean => {
        if (!effectiveExpanded) return false;
        if (Array.isArray(effectiveExpanded)) {
          return effectiveExpanded.some((item) => rowsEqual(item, row));
        }
        if (typeof effectiveExpanded === "object") {
          const key = resolveRowKey(row, effectiveRowKey);
          if (typeof key === "string" || typeof key === "number") {
            return Boolean((effectiveExpanded as Record<string | number, boolean>)[key]);
          }
        }
        return false;
      },
      [effectiveExpanded, rowsEqual, effectiveRowKey],
    );

    function toggleRowExpansion(
      event: ReactMouseEvent<HTMLButtonElement>,
      row: any,
    ) {
      event.stopPropagation();
      const currentlyExpanded = isRowExpanded(row);
      const key = resolveRowKey(row, effectiveRowKey);
      const useKeyMode =
        isExpandedKeysControlled ||
        onExpandedKeysChange !== undefined ||
        (rowKey !== undefined &&
          !isExpandedRowsControlled &&
          onExpandedRowsChange === undefined);

      let nextExpanded: any;
      if (Array.isArray(effectiveExpanded)) {
        if (currentlyExpanded) {
          nextExpanded = effectiveExpanded.filter(
            (item) => !rowsEqual(item, row),
          );
        } else {
          const unit =
            useKeyMode && (typeof key === "string" || typeof key === "number")
              ? key
              : row;
          nextExpanded = [...effectiveExpanded, unit];
        }
      } else if (
        effectiveExpanded !== null &&
        effectiveExpanded !== undefined &&
        typeof effectiveExpanded === "object"
      ) {
        const mapKey =
          typeof key === "string" || typeof key === "number" ? key : String(key);
        const clone = {
          ...(effectiveExpanded as Record<string | number, boolean>),
        };
        if (currentlyExpanded) {
          delete clone[mapKey];
        } else {
          clone[mapKey] = true;
        }
        nextExpanded = clone;
      } else if (useKeyMode && (typeof key === "string" || typeof key === "number")) {
        nextExpanded = currentlyExpanded ? [] : [key];
      } else {
        nextExpanded = currentlyExpanded ? [] : [row];
      }

      if (!isExpandedKeysControlled && !isExpandedRowsControlled) {
        setUncontrolledExpanded(nextExpanded);
      }
      onExpandedKeysChange?.(nextExpanded);
      onExpandedRowsChange?.(nextExpanded);

      if (currentlyExpanded) {
        onRowCollapse?.({ originalEvent: event.nativeEvent, data: row });
      } else {
        onRowExpand?.({ originalEvent: event.nativeEvent, data: row });
      }
    }

    function handleRowClick(
      event: ReactMouseEvent<HTMLTableRowElement>,
      row: any,
      rowIndex: number,
    ) {
      const rowEl = event.currentTarget;
      if (isInteractiveRowTarget(event.target, rowEl)) {
        return;
      }
      onRowClickProp?.({
        originalEvent: event.nativeEvent,
        data: row,
        index: rowIndex,
      });
      if (
        !isReadonly &&
        (selectionModeProp === "single" || selectionModeProp === "multiple")
      ) {
        toggleRowSelection(event.nativeEvent, row, rowIndex, "row");
      }
    }

    function isColumnSorted(col: NormalizedDataTableColumn<any>): boolean {
      if (!col.sortable) return false;
      const field = getColumnSortField(col);
      return Boolean(
        field && effectiveSorting.some((rule) => rule.key === field),
      );
    }

    function getColumnSortDirection(
      col: NormalizedDataTableColumn<any>,
    ): DataTableSortDirection | undefined {
      if (!col.sortable) return undefined;
      const field = getColumnSortField(col);
      if (!field) return undefined;
      return effectiveSorting.find((rule) => rule.key === field)?.order;
    }

    function getAriaSort(
      col: NormalizedDataTableColumn<any>,
    ): "ascending" | "descending" | "none" | undefined {
      if (!col.sortable) return undefined;
      const dir = getColumnSortDirection(col);
      if (!dir) return "none";
      return dir === "asc" ? "ascending" : "descending";
    }

    function triggerHeaderSort(
      target: EventTarget | null,
      col: NormalizedDataTableColumn<any>,
    ) {
      if (!col.sortable) return;
      if (
        target instanceof Element &&
        target.closest("[data-column-resizer]")
      ) {
        return;
      }
      const field = getColumnSortField(col);
      if (!field) return;

      const currentDir = getColumnSortDirection(col);
      let nextField: string | undefined = field;
      let nextOrder = 1;
      let nextRules: DataTableSortingRule[];

      if (currentDir === "asc") {
        nextOrder = -1;
        nextRules = [{ key: field, order: "desc" }];
      } else if (currentDir === "desc") {
        if (removableSort) {
          nextField = undefined;
          nextOrder = 0;
          nextRules = [];
        } else {
          nextOrder = 1;
          nextRules = [{ key: field, order: "asc" }];
        }
      } else {
        nextOrder = 1;
        nextRules = [{ key: field, order: "asc" }];
      }

      if (
        sortingProp === undefined &&
        sortFieldProp === undefined &&
        sortOrderProp === undefined
      ) {
        setUncontrolledSorting(nextRules);
      }

      onSortingChange?.(nextRules);
      onSortFieldChange?.(nextField);
      onSortOrderChange?.(nextOrder);
      onSort?.({
        sortField: nextField ?? "",
        sortOrder: nextOrder,
        first: effectiveFirst,
        rows: effectivePageSize,
      });
    }

    function handleHeaderClick(
      event: ReactMouseEvent<HTMLTableCellElement>,
      col: NormalizedDataTableColumn<any>,
    ) {
      triggerHeaderSort(event.target, col);
    }

    function handleHeaderKeyDown(
      event: ReactKeyboardEvent<HTMLTableCellElement>,
      col: NormalizedDataTableColumn<any>,
    ) {
      if (!col.sortable) return;
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        triggerHeaderSort(event.target, col);
      }
    }

    function handlePaginatorPage(event: PaginatorPageEvent) {
      if (paginationProp === undefined && firstProp === undefined) {
        setUncontrolledFirst(event.first);
      }
      if (paginationProp === undefined && rowsCountProp === undefined) {
        setUncontrolledPageSize(event.rows);
      }
      onPaginationChange?.({
        pageIndex: event.page,
        pageSize: event.rows,
        total: effectiveTotalRecords,
      });
      onFirstChange?.(event.first);
      if (event.rows !== effectivePageSize) {
        onRowsChange?.(event.rows);
      }
      onPage?.({
        ...event,
        sortField: effectiveSortField,
        sortOrder: effectiveSortOrder,
      });
    }

    // Column resize drag handling
    const activeResizeRef = useRef<ActiveColumnResize | null>(null);
    const onColumnResizeEndRef = useRef(onColumnResizeEnd);
    onColumnResizeEndRef.current = onColumnResizeEnd;
    const cleanupResizeRef = useRef<(() => void) | null>(null);

    useEffect(() => {
      return () => {
        activeResizeRef.current = null;
        cleanupResizeRef.current?.();
      };
    }, []);

    function resolveInitialColumnWidth(
      col: NormalizedDataTableColumn<any>,
      thEl: HTMLElement,
    ): number {
      const existing = columnWidths[col.key];
      if (existing !== undefined && existing > 0) return existing;

      const fromDomStyle = parsePixelWidth(thEl.style.width);
      if (fromDomStyle !== undefined) return fromDomStyle;

      const fromPropWidth = parsePixelWidth(col.width);
      if (fromPropWidth !== undefined) return fromPropWidth;

      if (col.headerStyle) {
        const fromHeaderObj = parsePixelWidth(col.headerStyle.width);
        if (fromHeaderObj !== undefined) return fromHeaderObj;
      }
      if (col.style) {
        const fromStyleObj = parsePixelWidth(col.style.width);
        if (fromStyleObj !== undefined) return fromStyleObj;
      }

      const rectWidth = thEl.getBoundingClientRect?.().width ?? 0;
      if (rectWidth > 0) return rectWidth;
      if (thEl.offsetWidth > 0) return thEl.offsetWidth;
      return 120;
    }

    function startColumnResize(
      nativeEvent: MouseEvent | TouchEvent | PointerEvent,
      targetEl: HTMLElement | null,
      col: NormalizedDataTableColumn<any>,
    ) {
      if (!resizableColumns || activeResizeRef.current) return;
      const thEl = (targetEl?.closest("th") ??
        targetEl?.parentElement) as HTMLElement | null;
      if (!thEl) return;

      const startX = extractClientX(nativeEvent);
      const startWidth = resolveInitialColumnWidth(col, thEl);
      const state: ActiveColumnResize = {
        colKey: col.key,
        field: typeof col.field === "string" ? col.field : undefined,
        thEl,
        startX,
        startWidth,
        currentWidth: startWidth,
      };
      activeResizeRef.current = state;

      const applyWidth = (clientX: number) => {
        const delta = clientX - state.startX;
        const nextWidth = Math.max(32, Math.round(state.startWidth + delta));
        state.currentWidth = nextWidth;
        state.thEl.style.width = `${nextWidth}px`;
        state.thEl.style.minWidth = `${nextWidth}px`;
        state.thEl.style.maxWidth = `${nextWidth}px`;
        setColumnWidths((prev) => ({
          ...prev,
          [state.colKey]: nextWidth,
        }));
      };

      const onMove = (ev: MouseEvent | TouchEvent | PointerEvent) => {
        if (!activeResizeRef.current) return;
        applyWidth(extractClientX(ev));
      };

      const cleanup = () => {
        if (typeof window === "undefined") return;
        window.removeEventListener("mousemove", onMove);
        window.removeEventListener("mouseup", onEnd);
        window.removeEventListener("touchmove", onMove);
        window.removeEventListener("touchend", onEnd);
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onEnd);
        cleanupResizeRef.current = null;
      };

      const onEnd = (ev: MouseEvent | TouchEvent | PointerEvent) => {
        if (!activeResizeRef.current) return;
        const endX = extractClientX(ev);
        if (endX !== state.startX && state.currentWidth === state.startWidth) {
          applyWidth(endX);
        }
        const delta = state.currentWidth - state.startWidth;
        activeResizeRef.current = null;
        cleanup();
        onColumnResizeEndRef.current?.({
          element: state.thEl,
          delta,
          field: state.field,
        });
      };

      cleanupResizeRef.current = cleanup;

      if (typeof window !== "undefined") {
        window.addEventListener("mousemove", onMove);
        window.addEventListener("mouseup", onEnd);
        window.addEventListener("touchmove", onMove);
        window.addEventListener("touchend", onEnd);
        window.addEventListener("pointermove", onMove);
        window.addEventListener("pointerup", onEnd);
      }
    }

    function handleResizePointerDown(
      event: ReactPointerEvent<HTMLSpanElement>,
      col: NormalizedDataTableColumn<any>,
    ) {
      event.stopPropagation();
      startColumnResize(event.nativeEvent, event.currentTarget, col);
    }

    function handleResizeMouseDown(
      event: ReactMouseEvent<HTMLSpanElement>,
      col: NormalizedDataTableColumn<any>,
    ) {
      event.stopPropagation();
      startColumnResize(event.nativeEvent, event.currentTarget, col);
    }

    function handleResizeTouchStart(
      event: ReactTouchEvent<HTMLSpanElement>,
      col: NormalizedDataTableColumn<any>,
    ) {
      event.stopPropagation();
      startColumnResize(event.nativeEvent, event.currentTarget, col);
    }

    function getBaseColumnStyle(col: NormalizedDataTableColumn<any>): CSSProperties {
      const styleObj: CSSProperties = {};
      const w = formatDimension(col.width);
      const minW = formatDimension(col.minWidth);
      if (w !== undefined) styleObj.width = w;
      if (minW !== undefined) styleObj.minWidth = minW;

      const resized = columnWidths[col.key];
      if (resized !== undefined) {
        styleObj.width = `${resized}px`;
        styleObj.minWidth = `${resized}px`;
        styleObj.maxWidth = `${resized}px`;
      }

      if (col.frozen) {
        styleObj.position = "sticky";
        const frozenMeta = frozenOffsets[col.key];
        const offsetPx = `${frozenMeta?.offset ?? 0}px`;
        if (col.alignFrozen === "right") {
          styleObj.insetInlineEnd = offsetPx;
        } else {
          styleObj.insetInlineStart = offsetPx;
        }
        styleObj.zIndex = 1;
      }

      return styleObj;
    }

    function getHeaderCellStyle(col: NormalizedDataTableColumn<any>): CSSProperties {
      return {
        ...col.style,
        ...col.headerStyle,
        ...getBaseColumnStyle(col),
      };
    }

    function getBodyCellStyle(col: NormalizedDataTableColumn<any>): CSSProperties {
      return {
        ...col.style,
        ...col.bodyStyle,
        ...getBaseColumnStyle(col),
      };
    }

    function getFooterCellStyle(col: NormalizedDataTableColumn<any>): CSSProperties {
      return {
        ...col.style,
        ...col.footerStyle,
        ...getBaseColumnStyle(col),
      };
    }

    const exportCSV = useCallback(
      (options?: DataTableExportCSVOptions): string => {
        const sep = csvSeparator || ",";
        const exportCols = visibleColumns.filter(
          (col) => col.exportable && !col.selectionMode && !col.expander,
        );

        let rowsToExport: readonly any[];
        if (options?.selectionOnly) {
          const selList = Array.isArray(effectiveSelection)
            ? effectiveSelection
            : effectiveSelection != null
              ? [effectiveSelection]
              : [];
          rowsToExport = selList
            .map((item) => {
              if (item !== null && typeof item === "object") return item;
              return sortedRows.find((r) => rowsEqual(r, item));
            })
            .filter((r) => r !== undefined);
        } else {
          rowsToExport = sortedRows;
        }

        const headerLine = exportCols
          .map((col) =>
            escapeCsvCell(
              col.header ??
                (typeof col.field === "string" ? col.field : col.key),
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
            const filename =
              options?.filename || exportFilename || "download";
            link.setAttribute(
              "download",
              filename.endsWith(".csv") ? filename : `${filename}.csv`,
            );
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
          } catch {
            // Ignore lack of download support in headless test DOMs
          }
        }

        return csvContent;
      },
      [
        csvSeparator,
        visibleColumns,
        effectiveSelection,
        sortedRows,
        rowsEqual,
        exportFilename,
      ],
    );

    useImperativeHandle(
      forwardedRef,
      () => ({
        exportCSV,
      }),
      [exportCSV],
    );

    const resolvedSize = useMemo(() => {
      if (size === "small" || size === "sm") return "sm";
      if (size === "large" || size === "lg") return "lg";
      if (size === "xs") return "xs";
      if (size === "md") return "md";
      return undefined;
    }, [size]);

    const isFlexScrollable = Boolean(scrollable && scrollHeight === "flex");

    const rootClasses = flattenClassValue(
      "mw-datatable",
      resolvedSize ? `mw-datatable--${resolvedSize} mw-size-${resolvedSize}` : undefined,
      {
        "mw-datatable--scrollable": scrollable,
        "mw-datatable--flex-scrollable": isFlexScrollable,
        "mw-datatable--striped": stripedRows,
        "mw-datatable--hoverable": rowHover || Boolean(effectiveSelectionMode),
        "mw-datatable--resizable": resizableColumns,
        "mw-datatable--resizable-fit":
          resizableColumns && columnResizeMode === "fit",
        "mw-datatable--resizable-expand":
          resizableColumns && columnResizeMode === "expand",
      },
      className,
    );

    const tableContainerStyle = useMemo<CSSProperties | undefined>(() => {
      if (scrollable && scrollHeight && scrollHeight !== "flex") {
        return {
          maxHeight: scrollHeight,
          overflow: "auto",
        };
      }
      return undefined;
    }, [scrollable, scrollHeight]);

    const scrollFadeRef = useScrollFade<HTMLDivElement>({
      stickyHeader: scrollable ? ".mw-datatable__thead" : undefined,
    });

    const hasHeaderSlot =
      header !== undefined && header !== null && header !== false;
    const hasFooterSlot =
      footer !== undefined && footer !== null && footer !== false;
    const hasExpansionRenderer =
      renderExpansion !== undefined ||
      (expansion !== undefined && expansion !== null && expansion !== false);
    const hasError =
      error !== undefined && error !== null && error !== false && error !== "";

    const mergedTableClass = [
      "mw-datatable__table",
      tableClassName,
      tableClass,
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <div
        {...restAttrs}
        className={rootClasses}
        style={style}
        aria-busy={loading || undefined}
        aria-readonly={isReadonly || undefined}
        data-loading={loading ? "true" : undefined}
        data-readonly={isReadonly ? "true" : undefined}
        data-error={hasError ? "true" : undefined}
        data-size={resolvedSize}
      >
        {hasHeaderSlot ? (
          <div className="mw-datatable__header">{header}</div>
        ) : null}

        {loading ? (
          <div
            className="mw-datatable__loading-overlay"
            data-testid="datatable-loading"
          >
            {loadingContent !== undefined ? (
              loadingContent
            ) : (
              <span
                className="mw-datatable__loading-spinner"
                aria-hidden="true"
              />
            )}
          </div>
        ) : null}

        <div
          ref={scrollFadeRef}
          className="mw-datatable__table-container mw-scroll"
          style={tableContainerStyle}
        >
          <table className={mergedTableClass} style={tableStyle} role="table">
            <thead className="mw-datatable__thead">
              <tr className="mw-datatable__header-row">
                {visibleColumns.map((col) => {
                  const sorted = isColumnSorted(col);
                  const sortDir = getColumnSortDirection(col);
                  const thClass = flattenClassValue(
                    "mw-datatable__header-cell",
                    {
                      "mw-datatable__header-cell--sortable": col.sortable,
                      "mw-datatable__header-cell--sorted": sorted,
                      "mw-datatable__cell--frozen": col.frozen,
                      "mw-datatable__cell--frozen-right":
                        col.frozen && col.alignFrozen === "right",
                    },
                    col.classValue,
                    col.headerClassValue,
                  );

                  return (
                    <th
                      key={col.key}
                      ref={(node) => {
                        thRefs.current[col.key] = node;
                      }}
                      scope="col"
                      className={thClass}
                      style={getHeaderCellStyle(col)}
                      aria-sort={getAriaSort(col)}
                      tabIndex={col.sortable ? 0 : undefined}
                      data-field={
                        typeof col.field === "string" ? col.field : undefined
                      }
                      data-sortable={col.sortable ? "true" : undefined}
                      data-sorted={sorted ? "true" : undefined}
                      data-frozen={col.frozen ? col.alignFrozen : undefined}
                      onClick={(ev) => handleHeaderClick(ev, col)}
                      onKeyDown={(ev) => handleHeaderKeyDown(ev, col)}
                    >
                      {col.selectionMode === "multiple" ? (
                        <button
                          type="button"
                          role="checkbox"
                          className="mw-datatable__checkbox mw-control"
                          data-row-action=""
                          disabled={isReadonly}
                          data-disabled={isReadonly ? "" : undefined}
                          aria-disabled={isReadonly || undefined}
                          aria-checked={
                            someCurrentPageSelected
                              ? "mixed"
                              : allCurrentPageSelected
                                ? "true"
                                : "false"
                          }
                          data-state={
                            someCurrentPageSelected
                              ? "indeterminate"
                              : allCurrentPageSelected
                                ? "checked"
                                : "unchecked"
                          }
                          aria-label="Select all rows"
                          onClick={handleToggleSelectAll}
                        >
                          {someCurrentPageSelected ? (
                            <Minus
                              className="mw-datatable__checkbox-icon"
                              aria-hidden="true"
                            />
                          ) : allCurrentPageSelected ? (
                            <Check
                              className="mw-datatable__checkbox-icon"
                              aria-hidden="true"
                            />
                          ) : null}
                        </button>
                      ) : (
                        <div className="mw-datatable__header-content">
                          {col.headerRenderer ? (
                            col.headerRenderer({ column: col.rawProps })
                          ) : col.headerNode !== undefined ? (
                            col.headerNode
                          ) : col.header !== undefined ? (
                            <span className="mw-datatable__header-title">
                              {col.header}
                            </span>
                          ) : null}

                          {col.sortable ? (
                            <span
                              className="mw-datatable__sort-icon"
                              aria-hidden="true"
                            >
                              {sorted && sortDir === "asc" ? (
                                <ArrowUp
                                  className="mw-datatable__sort-svg"
                                  aria-hidden="true"
                                />
                              ) : sorted && sortDir === "desc" ? (
                                <ArrowDown
                                  className="mw-datatable__sort-svg"
                                  aria-hidden="true"
                                />
                              ) : (
                                <ArrowUpDown
                                  className="mw-datatable__sort-svg mw-datatable__sort-svg--unsorted"
                                  aria-hidden="true"
                                />
                              )}
                            </span>
                          ) : null}
                        </div>
                      )}

                      {resizableColumns ? (
                        <span
                          className="mw-datatable__resizer"
                          data-column-resizer=""
                          onPointerDown={(ev) => handleResizePointerDown(ev, col)}
                          onMouseDown={(ev) => handleResizeMouseDown(ev, col)}
                          onTouchStart={(ev) => handleResizeTouchStart(ev, col)}
                        />
                      ) : null}
                    </th>
                  );
                })}
              </tr>
            </thead>

            <tbody className="mw-datatable__tbody">
              {hasError ? (
                <tr
                  className="mw-datatable__empty-row mw-datatable__error-row"
                  data-error="true"
                >
                  <td
                    colSpan={Math.max(1, visibleColumns.length)}
                    className="mw-datatable__empty-cell"
                    role="alert"
                  >
                    {typeof error !== "boolean" ? (
                      error
                    ) : (
                      <span>
                        {errorMessage ?? t("common.async.errorTitle")}
                      </span>
                    )}
                    {onRetry ? (
                      <div className="mw-async-action">
                        <Button
                          label={t("common.async.retry")}
                          icon={RotateCw}
                          severity="secondary"
                          variant="outlined"
                          size="sm"
                          onClick={() => onRetry()}
                        />
                      </div>
                    ) : null}
                  </td>
                </tr>
              ) : displayedRows.length > 0 ? (
                displayedRows.map((row, rowIndex) => {
                  const rowKeyVal = getRowKeyAttr(row, rowIndex);
                  const selected = isRowSelected(row);
                  const expanded = isRowExpanded(row);
                  const trClass = flattenClassValue(
                    "mw-datatable__row",
                    { "mw-datatable__row--selected": selected },
                    rowClassName ? rowClassName(row, rowIndex) : undefined,
                    rowClass ? rowClass(row) : undefined,
                  );

                  return (
                    <Fragment key={rowKeyVal}>
                      <tr
                        className={trClass}
                        style={rowStyle ? rowStyle(row) : undefined}
                        aria-selected={
                          effectiveSelectionMode
                            ? selected
                              ? "true"
                              : "false"
                            : undefined
                        }
                        data-state={selected ? "selected" : undefined}
                        data-row-key={String(rowKeyVal)}
                        onClick={(ev) => handleRowClick(ev, row, rowIndex)}
                      >
                        {visibleColumns.map((col) => {
                          const tdClass = flattenClassValue(
                            "mw-datatable__body-cell",
                            {
                              "mw-datatable__cell--frozen": col.frozen,
                              "mw-datatable__cell--frozen-right":
                                col.frozen && col.alignFrozen === "right",
                            },
                            col.classValue,
                            col.bodyClassValue,
                          );
                          const cellVal = resolveFieldData(row, col.field);

                          return (
                            <td
                              key={col.key}
                              className={tdClass}
                              style={getBodyCellStyle(col)}
                              data-frozen={col.frozen ? col.alignFrozen : undefined}
                            >
                              {col.selectionMode === "multiple" ? (
                                <button
                                  type="button"
                                  role="checkbox"
                                  className="mw-datatable__checkbox mw-control"
                                  data-row-action=""
                                  disabled={isReadonly}
                                  data-disabled={isReadonly ? "" : undefined}
                                  aria-disabled={isReadonly || undefined}
                                  aria-checked={selected ? "true" : "false"}
                                  data-state={selected ? "checked" : "unchecked"}
                                  aria-label="Select row"
                                  onClick={(ev) => {
                                    ev.stopPropagation();
                                    toggleRowSelection(
                                      ev.nativeEvent,
                                      row,
                                      rowIndex,
                                      "checkbox",
                                    );
                                  }}
                                >
                                  {selected ? (
                                    <Check
                                      className="mw-datatable__checkbox-icon"
                                      aria-hidden="true"
                                    />
                                  ) : null}
                                </button>
                              ) : col.selectionMode === "single" ? (
                                <button
                                  type="button"
                                  role="radio"
                                  className="mw-datatable__radio mw-control"
                                  data-row-action=""
                                  disabled={isReadonly}
                                  data-disabled={isReadonly ? "" : undefined}
                                  aria-disabled={isReadonly || undefined}
                                  aria-checked={selected ? "true" : "false"}
                                  data-state={selected ? "checked" : "unchecked"}
                                  aria-label="Select row"
                                  onClick={(ev) => {
                                    ev.stopPropagation();
                                    toggleRowSelection(
                                      ev.nativeEvent,
                                      row,
                                      rowIndex,
                                      "radiobutton",
                                    );
                                  }}
                                >
                                  {selected ? (
                                    <span
                                      className="mw-datatable__radio-dot"
                                      aria-hidden="true"
                                    />
                                  ) : null}
                                </button>
                              ) : col.expander ? (
                                <button
                                  type="button"
                                  className="mw-datatable__expander"
                                  data-row-action=""
                                  aria-expanded={expanded ? "true" : "false"}
                                  aria-label="Toggle Row"
                                  onClick={(ev) => toggleRowExpansion(ev, row)}
                                >
                                  {expanded ? (
                                    <ChevronDown
                                      className="mw-datatable__expander-icon"
                                      aria-hidden="true"
                                    />
                                  ) : (
                                    <ChevronRight
                                      className="mw-datatable__expander-icon"
                                      aria-hidden="true"
                                    />
                                  )}
                                </button>
                              ) : col.bodyRenderer ? (
                                col.bodyRenderer({
                                  data: row,
                                  row,
                                  value: cellVal,
                                  index: rowIndex,
                                  field: col.field,
                                  column: col.rawProps,
                                  frozenRow: false,
                                })
                              ) : col.bodyNode !== undefined ? (
                                col.bodyNode
                              ) : (
                                formatCellValue(cellVal)
                              )}
                            </td>
                          );
                        })}
                      </tr>

                      {expanded && hasExpansionRenderer ? (
                        <tr
                          className="mw-datatable__row mw-datatable__row-expansion"
                          data-expanded-row={String(rowKeyVal)}
                        >
                          <td
                            colSpan={Math.max(1, visibleColumns.length)}
                            className="mw-datatable__expansion-cell"
                          >
                            {renderExpansion
                              ? renderExpansion(row, rowIndex)
                              : typeof expansion === "function"
                                ? expansion({
                                    data: row,
                                    row,
                                    index: rowIndex,
                                  })
                                : expansion}
                          </td>
                        </tr>
                      ) : null}
                    </Fragment>
                  );
                })
              ) : (
                <tr className="mw-datatable__empty-row">
                  <td
                    colSpan={Math.max(1, visibleColumns.length)}
                    className="mw-datatable__empty-cell"
                  >
                    {empty !== undefined ? empty : emptyMessage || "暂无数据"}
                  </td>
                </tr>
              )}
            </tbody>

            {hasColumnFooters ? (
              <tfoot className="mw-datatable__tfoot">
                <tr className="mw-datatable__footer-row">
                  {visibleColumns.map((col) => {
                    const tfClass = flattenClassValue(
                      "mw-datatable__footer-cell",
                      { "mw-datatable__cell--frozen": col.frozen },
                      col.classValue,
                      col.footerClassValue,
                    );
                    return (
                      <td
                        key={col.key}
                        className={tfClass}
                        style={getFooterCellStyle(col)}
                      >
                        {col.footerRenderer
                          ? col.footerRenderer({ column: col.rawProps })
                          : col.footerNode !== undefined
                            ? col.footerNode
                            : col.footer !== undefined
                              ? col.footer
                              : null}
                      </td>
                    );
                  })}
                </tr>
              </tfoot>
            ) : null}
          </table>
        </div>

        {isPaginated ? (
          <Paginator
            className="mw-datatable__paginator"
            first={effectiveFirst}
            rows={effectivePageSize}
            totalRecords={effectiveTotalRecords}
            rowsPerPageOptions={rowsPerPageOptions}
            template={paginatorTemplate}
            currentPageReportTemplate={currentPageReportTemplate}
            alwaysShow={alwaysShowPaginator}
            start={paginatorStart}
            end={paginatorEnd}
            onPage={handlePaginatorPage}
          />
        ) : null}

        {hasFooterSlot ? (
          <div className="mw-datatable__footer">{footer}</div>
        ) : null}
      </div>
    );
  },
);

DataTableBase.displayName = "MwDataTable";

export type DataTableComponent = (<T = any>(
  props: DataTableProps<T> & RefAttributes<DataTableHandle> & { ref?: Ref<DataTableHandle> },
) => ReactElement | null) & {
  displayName?: string;
};

export const DataTable: DataTableComponent =
  DataTableBase as unknown as DataTableComponent;

export default DataTable;
