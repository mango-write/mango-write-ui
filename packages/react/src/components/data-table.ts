import {
  Children,
  Fragment,
  isValidElement,
  type CSSProperties,
  type HTMLAttributes,
  type ReactElement,
  type ReactNode,
} from "react";

export type DataTableSize = "small" | "large" | "xs" | "sm" | "md" | "lg";
export type DataTableSelectionMode = "single" | "multiple";
export type DataTableFrozenAlign = "left" | "right";
export type DataTableColumnResizeMode = "fit" | "expand";
export type DataTableSortDirection = "asc" | "desc";

export interface DataTableSortingRule {
  key: string;
  order: DataTableSortDirection;
}

export interface DataTablePaginationState {
  pageIndex: number;
  pageSize: number;
  total: number;
}

export interface PaginatorPageEvent {
  page: number;
  first: number;
  rows: number;
  pageCount: number;
}

export interface PaginatorSlotProps {
  first: number;
  rows: number;
  page: number;
  pageCount: number;
  totalRecords: number;
}

export interface PaginatorProps extends Omit<HTMLAttributes<HTMLElement>, "onChange"> {
  /** 当前页起始记录下标（0-based，默认 0） */
  first?: number;
  /** 每页显示行数（默认 10） */
  rows?: number;
  /** 总记录数（默认 0） */
  totalRecords?: number;
  /** 每页行数下拉可选项 */
  rowsPerPageOptions?: number[];
  /** 分页器布局模板 */
  template?: string;
  /** 页码摘要文案模板，如 '{first} - {last} of {totalRecords}' */
  currentPageReportTemplate?: string;
  /** 总页数不超过 1 时是否仍然显示（默认 true） */
  alwaysShow?: boolean;
  /** 页码按钮最大显示数量（默认 5） */
  pageLinkSize?: number;
  /** 是否禁用分页交互 */
  disabled?: boolean;
  /** 分页导航无障碍标签 */
  ariaLabel?: string;
  /** 起始记录下标变更回调 */
  onFirstChange?: (first: number) => void;
  /** 每页条数变更回调 */
  onRowsChange?: (rows: number) => void;
  /** 切页与每页条数变更事件 */
  onPage?: (event: PaginatorPageEvent) => void;
  /** 左侧扩展内容 */
  start?: ReactNode | ((props: PaginatorSlotProps) => ReactNode);
  /** 右侧扩展内容 */
  end?: ReactNode | ((props: PaginatorSlotProps) => ReactNode);
}

export interface PaginatorEmits {
  onFirstChange?: (first: number) => void;
  onRowsChange?: (rows: number) => void;
  onPage?: (event: PaginatorPageEvent) => void;
}

export interface ComputedPaginatorModel {
  effectiveRows: number;
  effectiveTotal: number;
  pageCount: number;
  effectiveFirst: number;
  currentPage: number;
  shouldRender: boolean;
  pageLinks: number[];
  isFirstDisabled: boolean;
  isLastDisabled: boolean;
  currentPageReportText: string;
}

export function computePaginatorModel(input: {
  first?: number;
  rows?: number;
  totalRecords?: number;
  alwaysShow?: boolean;
  pageLinkSize?: number;
  disabled?: boolean;
  currentPageReportTemplate?: string;
}): ComputedPaginatorModel {
  const effectiveRows = Math.max(1, input.rows && input.rows > 0 ? input.rows : 10);
  const effectiveTotal = Math.max(0, input.totalRecords ?? 0);
  const pageCount = Math.max(1, Math.ceil(effectiveTotal / effectiveRows));
  const rawFirst = Math.max(0, input.first ?? 0);
  const effectiveFirst =
    effectiveTotal === 0
      ? 0
      : Math.min(rawFirst, (pageCount - 1) * effectiveRows);
  const currentPage =
    effectiveTotal === 0
      ? 0
      : Math.min(
          pageCount - 1,
          Math.max(0, Math.floor(effectiveFirst / effectiveRows)),
        );

  const alwaysShow = input.alwaysShow ?? true;
  const shouldRender = alwaysShow
    ? true
    : effectiveTotal > effectiveRows && pageCount > 1;

  const linkSize = Math.max(1, input.pageLinkSize ?? 5);
  const visibleCount = Math.min(linkSize, pageCount);
  const half = Math.floor(visibleCount / 2);
  const start = Math.max(0, Math.min(currentPage - half, pageCount - visibleCount));
  const pageLinks: number[] = [];
  for (let i = 0; i < visibleCount; i += 1) {
    pageLinks.push(start + i);
  }

  const isDisabled = Boolean(input.disabled);
  const isFirstDisabled = isDisabled || currentPage <= 0;
  const isLastDisabled = isDisabled || currentPage >= pageCount - 1;

  const tpl =
    input.currentPageReportTemplate ?? "({currentPage} of {totalPages})";
  const firstOneBased = effectiveTotal > 0 ? effectiveFirst + 1 : 0;
  const lastOneBased =
    effectiveTotal > 0 ? Math.min(effectiveFirst + effectiveRows, effectiveTotal) : 0;
  const currentPageReportText = tpl
    .replace(/\{first\}/g, String(firstOneBased))
    .replace(/\{last\}/g, String(lastOneBased))
    .replace(/\{rows\}/g, String(effectiveRows))
    .replace(/\{totalRecords\}/g, String(effectiveTotal))
    .replace(/\{currentPage\}/g, String(currentPage + 1))
    .replace(/\{totalPages\}/g, String(pageCount));

  return {
    effectiveRows,
    effectiveTotal,
    pageCount,
    effectiveFirst,
    currentPage,
    shouldRender,
    pageLinks,
    isFirstDisabled,
    isLastDisabled,
    currentPageReportText,
  };
}

export type DataTableFieldAccessor<T = any> = string | ((row: T) => any);

export type DataTableClassValue =
  | string
  | Record<string, boolean>
  | Array<string | Record<string, boolean> | undefined | null | false>
  | undefined;

export function flattenClassValue(
  ...values: Array<DataTableClassValue | false | null | undefined>
): string {
  const tokens: string[] = [];
  const visit = (val: DataTableClassValue | false | null | undefined) => {
    if (!val) return;
    if (typeof val === "string") {
      if (val.trim()) tokens.push(val.trim());
      return;
    }
    if (Array.isArray(val)) {
      for (const item of val) visit(item);
      return;
    }
    if (typeof val === "object") {
      for (const [k, active] of Object.entries(val)) {
        if (active) tokens.push(k);
      }
    }
  };
  for (const v of values) visit(v);
  return tokens.join(" ");
}

export interface ColumnHeaderScope<T = any> {
  column: ColumnProps<T>;
}

export interface ColumnBodyScope<T = any> {
  data: T;
  row: T;
  value: any;
  index: number;
  field?: DataTableFieldAccessor<T>;
  column: ColumnProps<T>;
  frozenRow: boolean;
}

export interface ColumnProps<T = any> {
  /** 字段路径（支持点路径如 'a.b'）或取值函数 */
  field?: DataTableFieldAccessor<T>;
  /** 表头标题或渲染函数 */
  header?: ReactNode | ((props: ColumnHeaderScope<T>) => ReactNode);
  /** 表尾内容或渲染函数 */
  footer?: ReactNode | ((props: ColumnHeaderScope<T>) => ReactNode);
  /** 自定义单元格渲染函数 */
  body?: (props: ColumnBodyScope<T>) => ReactNode;
  /** 自定义单元格渲染函数（别名） */
  cell?: (props: ColumnBodyScope<T>) => ReactNode;
  /** 子节点或作用域单元格渲染函数 */
  children?: ReactNode | ((props: ColumnBodyScope<T>) => ReactNode);
  /** 是否允许点击列头排序 */
  sortable?: boolean;
  /** 自定义排序字段名（未指定时回退到 field） */
  sortField?: string;
  /** 列的唯一标识 key */
  columnKey?: string;
  /** 选择列模式：单选或多选 */
  selectionMode?: DataTableSelectionMode;
  /** 是否为行展开触发列 */
  expander?: boolean;
  /** 是否为固定列（sticky） */
  frozen?: boolean;
  /** 固定列停靠方向（默认 'left'） */
  alignFrozen?: DataTableFrozenAlign;
  /** CSV 导出时是否包含该列（默认 true） */
  exportable?: boolean;
  /** 表头与单元格共用内联样式 */
  style?: CSSProperties;
  /** 表头与单元格共用类名 */
  className?: string;
  /** 兼容 Vue/Prime 类名属性 */
  class?: DataTableClassValue;
  /** 表头单元格内联样式 */
  headerStyle?: CSSProperties;
  /** 表头单元格类名 */
  headerClassName?: string;
  headerClass?: DataTableClassValue;
  /** 数据单元格内联样式 */
  bodyStyle?: CSSProperties;
  /** 数据单元格类名 */
  bodyClassName?: string;
  bodyClass?: DataTableClassValue;
  /** 表尾单元格内联样式 */
  footerStyle?: CSSProperties;
  /** 表尾单元格类名 */
  footerClassName?: string;
  footerClass?: DataTableClassValue;
  /** 列宽（数值按 px 处理，字符串原样透传） */
  width?: number | string;
  /** 最小列宽（数值按 px 处理，字符串原样透传） */
  minWidth?: number | string;
  /** 是否隐藏该列 */
  hidden?: boolean;
}

export interface DataTablePageEvent extends PaginatorPageEvent {
  sortField?: string;
  sortOrder?: number;
}

export interface DataTableSortEvent {
  sortField: string;
  sortOrder: number;
  first: number;
  rows: number;
}

export interface DataTableRowClickEvent<T = any> {
  originalEvent: Event;
  data: T;
  index: number;
}

export interface DataTableRowSelectEvent<T = any> {
  originalEvent: Event;
  data: T;
  index: number;
  type: string;
}

export interface DataTableRowUnselectEvent<T = any> {
  originalEvent: Event;
  data: T;
  index: number;
  type: string;
}

export interface DataTableRowSelectAllEvent<T = any> {
  originalEvent: Event;
  data: T[];
}

export interface DataTableRowUnselectAllEvent {
  originalEvent: Event;
}

export interface DataTableRowExpandEvent<T = any> {
  originalEvent: Event;
  data: T;
}

export interface DataTableRowCollapseEvent<T = any> {
  originalEvent: Event;
  data: T;
}

export interface DataTableColumnResizeEndEvent {
  element: HTMLElement;
  delta: number;
  field?: string;
}

export interface DataTableExportCSVOptions {
  selectionOnly?: boolean;
  filename?: string;
}

export interface DataTableHandle {
  exportCSV: (options?: DataTableExportCSVOptions) => string;
}

export interface DataTableProps<T = any>
  extends Omit<HTMLAttributes<HTMLDivElement>, "onSelect"> {
  /** 表格数据源 */
  value?: readonly T[];
  /** 表格数据源（别名） */
  data?: readonly T[];
  /** 每页行数（number）或表格数据源（readonly T[]，兼容统一表格契约） */
  rows?: number | readonly T[];
  /** 数组形式列配置（可与声明式 <Column /> 子节点二选一） */
  columns?: readonly ColumnProps<T>[];
  /** 稳定业务主键字段或取值函数 */
  rowKey?: string | ((row: T) => string | number);
  /** 行唯一键字段名或函数（兼容 dataKey） */
  dataKey?: string | ((row: T) => string | number);
  /** 是否处于加载态 */
  loading?: boolean;
  /** 自定义加载遮罩内容 */
  loadingContent?: ReactNode;
  /** 是否只读（只读态禁用选择切换） */
  readOnly?: boolean;
  readonly?: boolean;
  /** 错误态内容或标记 */
  error?: ReactNode | boolean;
  /** 错误态兜底文案 */
  errorMessage?: string;
  /** 错误态重试回调 */
  onRetry?: () => void;
  /** 是否启用服务端模式（开启后不做本地切片与本地排序） */
  lazy?: boolean;
  serverSide?: boolean;
  mode?: "local" | "server";
  /** 统一分页受控对象 { pageIndex, pageSize, total } */
  pagination?: DataTablePaginationState;
  onPaginationChange?: (pagination: DataTablePaginationState) => void;
  /** 是否启用内置底部分页器 */
  paginator?: boolean;
  /** 总页数不超过 1 时是否仍显示分页器（默认 true） */
  alwaysShowPaginator?: boolean;
  /** 当前页起始行索引（0-based，默认 0） */
  first?: number;
  /** 总记录数（服务端模式下由服务端返回） */
  totalRecords?: number;
  /** 每页行数可选项 */
  rowsPerPageOptions?: number[];
  /** 分页器模板 */
  paginatorTemplate?: string;
  /** 分页器摘要文案模板 */
  currentPageReportTemplate?: string;
  paginatorStart?: PaginatorProps["start"];
  paginatorEnd?: PaginatorProps["end"];
  onFirstChange?: (first: number) => void;
  onRowsChange?: (rows: number) => void;
  onPage?: (event: DataTablePageEvent) => void;
  /** 当前选中项（支持 ID / ID 数组 或 行对象 / 行对象数组） */
  selection?: any;
  /** 行选择模式 */
  selectionMode?: DataTableSelectionMode;
  /** 选中值输出形态（不传时按输入值或 rowKey/dataKey 自动推断） */
  selectionValueMode?: "key" | "row";
  /** 是否需要按住 Meta/Ctrl 键取消单选行 */
  metaKeySelection?: boolean;
  onSelectionChange?: (selection: any) => void;
  onRowSelect?: (event: DataTableRowSelectEvent<T>) => void;
  onRowUnselect?: (event: DataTableRowUnselectEvent<T>) => void;
  onRowSelectAll?: (event: DataTableRowSelectAllEvent<T>) => void;
  onRowUnselectAll?: (event: DataTableRowUnselectAllEvent) => void;
  /** 受控展开行主键集合（ID 数组或 Record<id, boolean>） */
  expandedKeys?: ReadonlyArray<string | number> | Record<string | number, boolean>;
  onExpandedKeysChange?: (keys: any) => void;
  /** 受控展开行（兼容行数组或 Record<key, boolean>） */
  expandedRows?: any;
  onExpandedRowsChange?: (expandedRows: any) => void;
  /** 行展开详情渲染函数 */
  expansion?: ReactNode | ((props: { data: T; row: T; index: number }) => ReactNode);
  renderExpansion?: (row: T, index: number) => ReactNode;
  onRowExpand?: (event: DataTableRowExpandEvent<T>) => void;
  onRowCollapse?: (event: DataTableRowCollapseEvent<T>) => void;
  /** 统一排序状态 { key, order: 'asc' | 'desc' }[] */
  sorting?: readonly DataTableSortingRule[];
  onSortingChange?: (sorting: DataTableSortingRule[]) => void;
  /** 当前排序字段 */
  sortField?: string;
  /** 当前排序方向：1 升序、-1 降序、0 不排序 */
  sortOrder?: number;
  /** 第三次点击表头是否恢复未排序状态（默认 false） */
  removableSort?: boolean;
  onSortFieldChange?: (sortField: string | undefined) => void;
  onSortOrderChange?: (sortOrder: number | undefined) => void;
  onSort?: (event: DataTableSortEvent) => void;
  /** 行点击回调（行内按钮/链接/选择控件等交互元素不会冒泡触发） */
  onRowClick?: (event: DataTableRowClickEvent<T>) => void;
  /** 是否启用滚动容器 */
  scrollable?: boolean;
  /** 滚动容器高度（如 'flex' 或 '400px'） */
  scrollHeight?: string;
  /** 是否允许拖拽调整列宽 */
  resizableColumns?: boolean;
  /** 列宽拖拽模式（默认 'fit'） */
  columnResizeMode?: DataTableColumnResizeMode;
  onColumnResizeEnd?: (event: DataTableColumnResizeEndEvent) => void;
  /** 是否显示斑马纹行 */
  stripedRows?: boolean;
  /** 是否启用行悬停高亮 */
  rowHover?: boolean;
  /** 表格尺寸密度 */
  size?: DataTableSize;
  /** 自定义行类名函数 */
  rowClassName?: (data: T, index: number) => string | undefined;
  rowClass?: (data: T) => DataTableClassValue;
  /** 自定义行内联样式函数 */
  rowStyle?: (data: T) => CSSProperties | undefined;
  /** 内部 <table> 元素内联样式 */
  tableStyle?: CSSProperties;
  /** 内部 <table> 元素类名 */
  tableClassName?: string;
  tableClass?: string;
  /** 响应式布局模式（兼容属性） */
  responsiveLayout?: string;
  /** 顶部扩展槽 */
  header?: ReactNode;
  /** 底部扩展槽 */
  footer?: ReactNode;
  /** 空态节点 */
  empty?: ReactNode;
  /** 空数据兜底文案 */
  emptyMessage?: string;
  /** CSV 导出分隔符（默认 ','） */
  csvSeparator?: string;
  /** CSV 导出文件名（不含扩展名，默认 'download'） */
  exportFilename?: string;
  children?: ReactNode;
}

export interface DataTableEmits<T = any> {
  onSelectionChange?: (selection: any) => void;
  onExpandedKeysChange?: (keys: any) => void;
  onExpandedRowsChange?: (expandedRows: any) => void;
  onFirstChange?: (first: number) => void;
  onRowsChange?: (rows: number) => void;
  onPaginationChange?: (pagination: DataTablePaginationState) => void;
  onSortingChange?: (sorting: DataTableSortingRule[]) => void;
  onSortFieldChange?: (sortField: string | undefined) => void;
  onSortOrderChange?: (sortOrder: number | undefined) => void;
  onPage?: (event: DataTablePageEvent) => void;
  onSort?: (event: DataTableSortEvent) => void;
  onRowClick?: (event: DataTableRowClickEvent<T>) => void;
  onRowSelect?: (event: DataTableRowSelectEvent<T>) => void;
  onRowUnselect?: (event: DataTableRowUnselectEvent<T>) => void;
  onRowSelectAll?: (event: DataTableRowSelectAllEvent<T>) => void;
  onRowUnselectAll?: (event: DataTableRowUnselectAllEvent) => void;
  onRowExpand?: (event: DataTableRowExpandEvent<T>) => void;
  onRowCollapse?: (event: DataTableRowCollapseEvent<T>) => void;
  onColumnResizeEnd?: (event: DataTableColumnResizeEndEvent) => void;
}

export interface NormalizedDataTableColumn<T = any> {
  key: string;
  field?: DataTableFieldAccessor<T>;
  header?: string;
  headerRenderer?: (props: ColumnHeaderScope<T>) => ReactNode;
  headerNode?: ReactNode;
  footer?: string;
  footerRenderer?: (props: ColumnHeaderScope<T>) => ReactNode;
  footerNode?: ReactNode;
  bodyRenderer?: (props: ColumnBodyScope<T>) => ReactNode;
  bodyNode?: ReactNode;
  sortable: boolean;
  sortField?: string;
  columnKey?: string;
  selectionMode?: DataTableSelectionMode;
  expander: boolean;
  frozen: boolean;
  alignFrozen: DataTableFrozenAlign;
  exportable: boolean;
  style?: CSSProperties;
  classValue?: DataTableClassValue;
  headerStyle?: CSSProperties;
  headerClassValue?: DataTableClassValue;
  bodyStyle?: CSSProperties;
  bodyClassValue?: DataTableClassValue;
  footerStyle?: CSSProperties;
  footerClassValue?: DataTableClassValue;
  width?: number | string;
  minWidth?: number | string;
  hidden: boolean;
  rawProps: ColumnProps<T>;
}

/**
 * 解析行数据中的字段值（支持函数、直接属性与点路径如 'values.q1' / 'source.title'）
 */
export function resolveFieldData(row: any, field?: DataTableFieldAccessor): any {
  if (row == null || field == null) return undefined;
  if (typeof field === "function") {
    return field(row);
  }
  if (typeof field === "string") {
    if (typeof row === "object" && field in row) {
      return row[field];
    }
    if (field.includes(".")) {
      const parts = field.split(".");
      let current: any = row;
      for (const part of parts) {
        if (current == null) return undefined;
        current = current[part];
      }
      return current;
    }
  }
  return undefined;
}

/**
 * 解析行的稳定唯一键（用于跨排序/分页的选择与展开匹配）
 */
export function resolveRowKey(
  row: any,
  dataKey?: string | ((row: any) => string | number),
  fallbackIndex?: number,
): unknown {
  if (row == null) return fallbackIndex ?? row;
  if (typeof dataKey === "function") {
    return dataKey(row);
  }
  if (typeof dataKey === "string" && dataKey.length > 0) {
    return resolveFieldData(row, dataKey);
  }
  return row;
}

const INTERACTIVE_ROW_SELECTOR = [
  "button",
  "a",
  "input",
  "select",
  "textarea",
  "label",
  '[role="button"]',
  '[role="checkbox"]',
  '[role="radio"]',
  '[role="switch"]',
  '[role="menuitem"]',
  '[role="option"]',
  '[role="combobox"]',
  "[data-row-action]",
  "[data-column-resizer]",
].join(", ");

export function isInteractiveRowTarget(
  target: EventTarget | null,
  rowEl?: HTMLElement | null,
): boolean {
  if (!target || !(target instanceof Element)) return false;
  const matched = target.closest(INTERACTIVE_ROW_SELECTOR);
  if (!matched) return false;
  if (rowEl && matched === rowEl) return false;
  if (rowEl && !rowEl.contains(matched)) return false;
  return true;
}

export function isColumnElement(
  node: unknown,
): node is ReactElement<ColumnProps<any>> {
  if (!isValidElement(node)) return false;
  const typeAny = node.type as unknown as {
    __mwColumn?: boolean;
    displayName?: string;
    name?: string;
  };
  if (typeof typeAny === "function" || (typeof typeAny === "object" && typeAny !== null)) {
    return (
      typeAny.__mwColumn === true ||
      typeAny.displayName === "MwColumn" ||
      typeAny.name === "MwColumn"
    );
  }
  return false;
}

export function normalizeColumnConfig<T = any>(
  raw: ColumnProps<T>,
  index: number,
  explicitKey?: string,
): NormalizedDataTableColumn<T> {
  const selectionMode = raw.selectionMode;
  const expander = Boolean(raw.expander);
  const sortable = Boolean(raw.sortable);
  const frozen = Boolean(raw.frozen);
  const alignFrozen: DataTableFrozenAlign = raw.alignFrozen ?? "left";
  const exportable =
    raw.exportable !== undefined ? Boolean(raw.exportable) : !selectionMode && !expander;
  const hidden = Boolean(raw.hidden);

  const resolvedKey =
    raw.columnKey ??
    explicitKey ??
    (typeof raw.field === "string" && raw.field ? raw.field : undefined) ??
    `col-${index}`;

  const headerRenderer =
    typeof raw.header === "function" ? raw.header : undefined;
  const headerStr =
    typeof raw.header === "string" || typeof raw.header === "number"
      ? String(raw.header)
      : undefined;
  const headerNode =
    typeof raw.header !== "function" && headerStr === undefined ? raw.header : undefined;

  const footerRenderer =
    typeof raw.footer === "function" ? raw.footer : undefined;
  const footerStr =
    typeof raw.footer === "string" || typeof raw.footer === "number"
      ? String(raw.footer)
      : undefined;
  const footerNode =
    typeof raw.footer !== "function" && footerStr === undefined ? raw.footer : undefined;

  const bodyRenderer =
    raw.body ??
    raw.cell ??
    (typeof raw.children === "function" ? raw.children : undefined);
  const bodyNode =
    !bodyRenderer && raw.children !== undefined && typeof raw.children !== "function"
      ? raw.children
      : undefined;

  return {
    key: resolvedKey,
    field: raw.field,
    header: headerStr,
    headerRenderer,
    headerNode,
    footer: footerStr,
    footerRenderer,
    footerNode,
    bodyRenderer,
    bodyNode,
    sortable,
    sortField: raw.sortField,
    columnKey: raw.columnKey,
    selectionMode,
    expander,
    frozen,
    alignFrozen,
    exportable,
    style: raw.style,
    classValue: flattenClassValue(raw.className, raw.class) || undefined,
    headerStyle: raw.headerStyle,
    headerClassValue:
      flattenClassValue(raw.headerClassName, raw.headerClass) || undefined,
    bodyStyle: raw.bodyStyle,
    bodyClassValue: flattenClassValue(raw.bodyClassName, raw.bodyClass) || undefined,
    footerStyle: raw.footerStyle,
    footerClassValue:
      flattenClassValue(raw.footerClassName, raw.footerClass) || undefined,
    width: raw.width,
    minWidth: raw.minWidth,
    hidden,
    rawProps: raw,
  };
}

export function extractColumnsFromChildren<T = any>(
  children: ReactNode,
): NormalizedDataTableColumn<T>[] {
  const result: NormalizedDataTableColumn<T>[] = [];

  function walk(nodes: ReactNode) {
    Children.forEach(nodes, (child) => {
      if (!isValidElement(child)) return;
      if (child.type === Fragment) {
        const fragProps = child.props as { children?: ReactNode };
        walk(fragProps.children);
        return;
      }
      if (isColumnElement(child)) {
        const rawKey =
          child.key != null ? String(child.key).replace(/^\.\$/, "") : undefined;
        result.push(
          normalizeColumnConfig<T>(
            child.props as ColumnProps<T>,
            result.length,
            rawKey,
          ),
        );
      }
    });
  }

  walk(children);
  return result.filter((col) => !col.hidden);
}

export function resolveNormalizedColumns<T = any>(
  columnsProp: readonly ColumnProps<T>[] | undefined,
  children: ReactNode,
): NormalizedDataTableColumn<T>[] {
  if (columnsProp && columnsProp.length > 0) {
    return columnsProp
      .map((col, idx) => normalizeColumnConfig(col, idx))
      .filter((col) => !col.hidden);
  }
  return extractColumnsFromChildren<T>(children);
}
