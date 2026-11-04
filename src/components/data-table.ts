import {
  Comment,
  Fragment,
  isVNode,
  type PropType,
  type Slot,
  type StyleValue,
  type VNode,
  type VNodeArrayChildren,
  type VNodeChild,
  defineComponent,
} from "vue";

export type DataTableSize = "small" | "large" | "sm" | "md" | "lg";
export type DataTableSelectionMode = "single" | "multiple";
export type DataTableFrozenAlign = "left" | "right";
export type DataTableColumnResizeMode = "fit" | "expand";

export interface PaginatorPageEvent {
  page: number;
  first: number;
  rows: number;
  pageCount: number;
}

export interface PaginatorProps {
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
}

export interface PaginatorEmits {
  "update:first": [value: number];
  "update:rows": [value: number];
  page: [event: PaginatorPageEvent];
}

export type DataTableFieldAccessor<T = any> = string | ((row: T) => any);

export type DataTableClassValue =
  | string
  | Record<string, boolean>
  | Array<string | Record<string, boolean>>;

export interface ColumnProps<T = any> {
  /** 字段路径（支持点路径如 'a.b'）或取值函数 */
  field?: DataTableFieldAccessor<T>;
  /** 表头标题文本 */
  header?: string;
  /** 表尾文本 */
  footer?: string;
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
  style?: string | Record<string, string>;
  /** 表头与单元格共用类名 */
  class?: DataTableClassValue;
  /** 表头单元格内联样式 */
  headerStyle?: string | Record<string, string>;
  /** 表头单元格类名 */
  headerClass?: DataTableClassValue;
  /** 数据单元格内联样式 */
  bodyStyle?: string | Record<string, string>;
  /** 数据单元格类名 */
  bodyClass?: DataTableClassValue;
  /** 表尾单元格内联样式 */
  footerStyle?: string | Record<string, string>;
  /** 表尾单元格类名 */
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

export interface DataTableProps<T = any> {
  /** 表格数据源 */
  value?: readonly T[];
  /** 行唯一键字段名或函数（用于跨排序/分页稳定保持选中与展开状态） */
  dataKey?: string | ((row: T) => string | number);
  /** 是否处于加载态 */
  loading?: boolean;
  /** 是否启用服务端懒加载模式（开启后不做本地切片与本地排序） */
  lazy?: boolean;
  /** 是否启用内置底部分页器 */
  paginator?: boolean;
  /** 总页数不超过 1 时是否仍显示分页器（默认 true） */
  alwaysShowPaginator?: boolean;
  /** 每页行数（默认 10） */
  rows?: number;
  /** 当前页起始行索引（0-based，默认 0） */
  first?: number;
  /** 总记录数（lazy 模式下由服务端返回） */
  totalRecords?: number;
  /** 每页行数可选项 */
  rowsPerPageOptions?: number[];
  /** 分页器模板 */
  paginatorTemplate?: string;
  /** 分页器摘要文案模板 */
  currentPageReportTemplate?: string;
  /** 当前选中行（单选为行对象，多选为行对象数组） */
  selection?: any;
  /** 行选择模式 */
  selectionMode?: DataTableSelectionMode;
  /** 是否需要按住 Meta/Ctrl 键切换行选中 */
  metaKeySelection?: boolean;
  /** 当前展开行（支持行/ID 数组或 Record<key, boolean> 映射表） */
  expandedRows?: any;
  /** 当前排序字段（支持 v-model:sortField） */
  sortField?: string;
  /** 当前排序方向：1 升序、-1 降序、0 不排序（支持 v-model:sortOrder） */
  sortOrder?: number;
  /** 第三次点击表头是否恢复未排序状态（默认 false） */
  removableSort?: boolean;
  /** 是否启用滚动容器 */
  scrollable?: boolean;
  /** 滚动容器高度（如 'flex' 或 '400px'） */
  scrollHeight?: string;
  /** 是否允许拖拽调整列宽 */
  resizableColumns?: boolean;
  /** 列宽拖拽模式（默认 'fit'） */
  columnResizeMode?: DataTableColumnResizeMode;
  /** 是否显示斑马纹行 */
  stripedRows?: boolean;
  /** 是否启用行悬停高亮 */
  rowHover?: boolean;
  /** 表格尺寸密度 */
  size?: DataTableSize;
  /** 自定义行类名函数 */
  rowClass?: (data: T) => string | Record<string, boolean> | undefined;
  /** 自定义行内联样式函数 */
  rowStyle?: (data: T) => string | Record<string, string> | undefined;
  /** 内部 <table> 元素内联样式 */
  tableStyle?: string | Record<string, string>;
  /** 内部 <table> 元素类名 */
  tableClass?: string;
  /** 响应式布局模式（兼容属性） */
  responsiveLayout?: string;
  /** 空数据兜底文案 */
  emptyMessage?: string;
  /** CSV 导出分隔符（默认 ','） */
  csvSeparator?: string;
  /** CSV 导出文件名（不含扩展名，默认 'download'） */
  exportFilename?: string;
}

export interface DataTableEmits<T = any> {
  "update:selection": [value: any];
  "update:expandedRows": [value: any];
  "update:first": [value: number];
  "update:rows": [value: number];
  "update:sortField": [value: string | undefined];
  "update:sortOrder": [value: number | undefined];
  page: [event: DataTablePageEvent];
  sort: [event: DataTableSortEvent];
  "row-click": [event: DataTableRowClickEvent<T>];
  "row-select": [event: DataTableRowSelectEvent<T>];
  "row-unselect": [event: DataTableRowUnselectEvent<T>];
  "row-select-all": [event: DataTableRowSelectAllEvent<T>];
  "row-unselect-all": [event: DataTableRowUnselectAllEvent];
  "row-expand": [event: DataTableRowExpandEvent<T>];
  "row-collapse": [event: DataTableRowCollapseEvent<T>];
  "column-resize-end": [event: DataTableColumnResizeEndEvent];
}

export interface NormalizedDataTableColumn {
  key: string;
  field?: DataTableFieldAccessor;
  header?: string;
  footer?: string;
  sortable: boolean;
  sortField?: string;
  columnKey?: string;
  selectionMode?: DataTableSelectionMode;
  expander: boolean;
  frozen: boolean;
  alignFrozen: DataTableFrozenAlign;
  exportable: boolean;
  style?: StyleValue;
  class?: DataTableClassValue;
  headerStyle?: StyleValue;
  headerClass?: DataTableClassValue;
  bodyStyle?: StyleValue;
  bodyClass?: DataTableClassValue;
  footerStyle?: StyleValue;
  footerClass?: DataTableClassValue;
  width?: number | string;
  minWidth?: number | string;
  hidden: boolean;
  rawProps: ColumnProps;
  headerSlot?: Slot;
  bodySlot?: Slot;
  footerSlot?: Slot;
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
    if (field in row) {
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

/**
 * 判断点击目标是否为行内交互控件（按钮、链接、输入框、复选框、行操作标记等）。
 * 若返回 true，则不应触发行级 @row-click 或自动行选择/行展开。
 */
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

function readProp<T = any>(
  raw: Record<string, any>,
  camelKey: string,
  kebabKey?: string,
): T | undefined {
  if (raw[camelKey] !== undefined) return raw[camelKey] as T;
  if (kebabKey && raw[kebabKey] !== undefined) return raw[kebabKey] as T;
  return undefined;
}

function resolveBooleanProp(
  raw: Record<string, any>,
  camelKey: string,
  kebabKey?: string,
  defaultValue = false,
): boolean {
  const val = readProp< unknown >(raw, camelKey, kebabKey);
  if (val === undefined) return defaultValue;
  if (val === "" || val === true || val === "true") return true;
  if (val === false || val === "false") return false;
  return Boolean(val);
}

export function isColumnVNode(vnode: VNode): boolean {
  if (!vnode || typeof vnode.type !== "object" || vnode.type === null) {
    return false;
  }
  const typeObj = vnode.type as Record<string, any>;
  return (
    typeObj.__mwColumn === true ||
    typeObj.name === "MwColumn" ||
    typeObj.__name === "Column"
  );
}

export function extractColumnsFromVNodes(
  nodes: VNodeArrayChildren | VNodeChild | undefined,
): NormalizedDataTableColumn[] {
  const result: NormalizedDataTableColumn[] = [];

  function walk(children: VNodeArrayChildren | VNodeChild | undefined) {
    if (!children) return;
    if (Array.isArray(children)) {
      for (const child of children) {
        walk(child as VNodeChild);
      }
      return;
    }
    if (!isVNode(children)) return;
    if (children.type === Comment) return;
    if (children.type === Fragment) {
      if (Array.isArray(children.children)) {
        walk(children.children);
      }
      return;
    }
    if (isColumnVNode(children)) {
      const idx = result.length;
      const raw = (children.props ?? {}) as Record<string, any>;
      const slots =
        children.children &&
        typeof children.children === "object" &&
        !Array.isArray(children.children)
          ? (children.children as Record<string, Slot | undefined>)
          : {};

      const field = readProp<DataTableFieldAccessor>(raw, "field");
      const columnKey = readProp<string>(raw, "columnKey", "column-key");
      const sortField = readProp<string>(raw, "sortField", "sort-field");
      const selectionMode = readProp<DataTableSelectionMode>(
        raw,
        "selectionMode",
        "selection-mode",
      );
      const expander = resolveBooleanProp(raw, "expander", "expander", false);
      const sortable = resolveBooleanProp(raw, "sortable", "sortable", false);
      const frozen = resolveBooleanProp(raw, "frozen", "frozen", false);
      const alignFrozen =
        readProp<DataTableFrozenAlign>(raw, "alignFrozen", "align-frozen") ??
        "left";
      const exportable = resolveBooleanProp(
        raw,
        "exportable",
        "exportable",
        !selectionMode && !expander,
      );
      const hidden = resolveBooleanProp(raw, "hidden", "hidden", false);

      const header = readProp<string>(raw, "header");
      const footer = readProp<string>(raw, "footer");
      const style = readProp<StyleValue>(raw, "style");
      const cls = readProp<DataTableClassValue>(raw, "class");
      const headerStyle = readProp<StyleValue>(
        raw,
        "headerStyle",
        "header-style",
      );
      const headerClass = readProp<DataTableClassValue>(
        raw,
        "headerClass",
        "header-class",
      );
      const bodyStyle = readProp<StyleValue>(raw, "bodyStyle", "body-style");
      const bodyClass = readProp<DataTableClassValue>(
        raw,
        "bodyClass",
        "body-class",
      );
      const footerStyle = readProp<StyleValue>(
        raw,
        "footerStyle",
        "footer-style",
      );
      const footerClass = readProp<DataTableClassValue>(
        raw,
        "footerClass",
        "footer-class",
      );
      const width = readProp<number | string>(raw, "width");
      const minWidth = readProp<number | string>(raw, "minWidth", "min-width");

      const vnodeKey =
        children.key != null ? String(children.key) : undefined;
      const resolvedKey =
        columnKey ??
        (typeof field === "string" && field ? field : undefined) ??
        vnodeKey ??
        `col-${idx}`;

      const rawProps: ColumnProps = {
        field,
        header,
        footer,
        sortable,
        sortField,
        columnKey,
        selectionMode,
        expander,
        frozen,
        alignFrozen,
        exportable,
        style: style as ColumnProps["style"],
        class: cls,
        headerStyle: headerStyle as ColumnProps["headerStyle"],
        headerClass,
        bodyStyle: bodyStyle as ColumnProps["bodyStyle"],
        bodyClass,
        footerStyle: footerStyle as ColumnProps["footerStyle"],
        footerClass,
        width,
        minWidth,
        hidden,
      };

      result.push({
        key: resolvedKey,
        field,
        header,
        footer,
        sortable,
        sortField,
        columnKey,
        selectionMode,
        expander,
        frozen,
        alignFrozen,
        exportable,
        style,
        class: cls,
        headerStyle,
        headerClass,
        bodyStyle,
        bodyClass,
        footerStyle,
        footerClass,
        width,
        minWidth,
        hidden,
        rawProps,
        headerSlot: slots.header,
        bodySlot: slots.body ?? slots.default,
        footerSlot: slots.footer,
      });
    }
  }

  walk(nodes);
  return result.filter((c) => !c.hidden);
}

/**
 * 稳定渲染列作用域插槽的辅助组件，避免在模板中使用内联匿名组件导致子组件重复卸载挂载。
 */
export const ColumnSlotRenderer = defineComponent({
  name: "MwColumnSlotRenderer",
  props: {
    render: {
      type: Function as PropType<(scope: Record<string, unknown>) => VNodeChild>,
      required: true,
    },
    scope: {
      type: Object as PropType<Record<string, unknown>>,
      required: true,
    },
  },
  setup(props) {
    return () => props.render(props.scope);
  },
});
