import type { Component } from "vue";

export interface DocEntry {
  slug: string;
  title: string;
  en: string;
  load: () => Promise<{ default: Component }>;
}

export interface DocGroup {
  id: string;
  title: string;
  base: string;
  entries: DocEntry[];
}

const f = import.meta.glob<{ default: Component }>("./pages/foundations/*.vue");
const c = import.meta.glob<{ default: Component }>("./pages/components/*.vue");

function foundation(slug: string, title: string, en: string): DocEntry {
  return { slug, title, en, load: f[`./pages/foundations/${slug}.vue`]! };
}

function component(slug: string, title: string, en: string): DocEntry {
  return { slug, title, en, load: c[`./pages/components/${slug}.vue`]! };
}

export const docGroups: DocGroup[] = [
  {
    id: "foundations",
    title: "基础",
    base: "/dev/ui/foundations",
    entries: [
      foundation("overview", "设计原则", "Principles"),
      foundation("color", "颜色", "Color"),
      foundation("typography", "文字", "Typography"),
      foundation("size", "尺寸与间距", "Size & Spacing"),
      foundation("radius", "圆角", "Radius"),
      foundation("elevation", "层级与阴影", "Elevation"),
      foundation("frost", "霜材质", "Frost"),
      foundation("motion", "动效", "Motion"),
      foundation("icon", "图标", "Iconography"),
      foundation("layout", "布局", "Layout"),
    ],
  },
  {
    id: "actions",
    title: "操作",
    base: "/dev/ui/components",
    entries: [
      component("button", "按钮", "Button"),
      component("select-button", "分段选择", "SelectButton"),
      component("menu", "菜单", "Menu"),
      component("action-menu", "对象菜单", "ActionMenu"),
    ],
  },
  {
    id: "inputs",
    title: "输入",
    base: "/dev/ui/components",
    entries: [
      component("input-text", "文本框", "InputText"),
      component("textarea", "多行文本", "Textarea"),
      component("input-number", "数字输入", "InputNumber"),
      component("icon-field", "图标输入框", "IconField"),
      component("input-group", "输入组", "InputGroup"),
      component("form-field", "表单字段", "FormField"),
      component("checkbox", "复选框", "Checkbox"),
      component("radio-button", "单选框", "RadioButton"),
      component("toggle-switch", "开关", "ToggleSwitch"),
      component("slider", "滑块", "Slider"),
      component("color-picker", "取色器", "ColorPicker"),
      component("file-drop-zone", "文件拖放区", "FileDropZone"),
    ],
  },
  {
    id: "selection",
    title: "选择",
    base: "/dev/ui/components",
    entries: [
      component("select", "下拉选择", "Select"),
      component("multi-select", "多选", "MultiSelect"),
      component("searchable-select", "可搜索选择", "SearchableSelect"),
      component("searchable-multi-select", "可搜索多选", "SearchableMultiSelect"),
      component("async-search-select", "远程搜索选择", "AsyncSearchSelect"),
      component("user-select", "成员选择", "UserSelect"),
      component("listbox", "列表框", "Listbox"),
      component("date-picker", "日期选择", "DatePicker"),
    ],
  },
  {
    id: "display",
    title: "展示",
    base: "/dev/ui/components",
    entries: [
      component("badge", "徽标", "Badge"),
      component("tag", "标签", "Tag"),
      component("chip", "纸片", "Chip"),
      component("avatar", "头像", "Avatar"),
      component("user-chip", "成员纸片", "UserChip"),
      component("user-card", "成员卡片", "UserCard"),
      component("message", "提示条", "Message"),
      component("progress-bar", "进度条", "ProgressBar"),
      component("progress-spinner", "加载指示", "ProgressSpinner"),
      component("skeleton", "骨架屏", "Skeleton"),
      component("app-logo", "品牌标识", "AppLogo"),
    ],
  },
  {
    id: "overlays",
    title: "浮层",
    base: "/dev/ui/components",
    entries: [
      component("dialog", "对话框", "Dialog"),
      component("confirm", "确认框", "Confirm"),
      component("toast", "轻提示", "Toast"),
      component("popover", "弹出层", "Popover"),
      component("hover-card", "悬停卡片", "HoverCard"),
      component("tooltip", "文字提示", "Tooltip"),
      component("image-lightbox", "图片灯箱", "ImageLightbox"),
    ],
  },
  {
    id: "structure",
    title: "结构",
    base: "/dev/ui/components",
    entries: [
      component("tabs", "标签页", "Tabs"),
      component("accordion", "折叠面板", "Accordion"),
      component("data-table", "数据表格", "DataTable"),
      component("paginator", "分页", "Paginator"),
      component("page-header", "页头", "PageHeader"),
      component("async-slot", "异步四态", "AsyncSlot"),
      component("not-found-page", "404 页", "NotFoundPage"),
      component("site", "营销站框架", "SiteHeader / SiteFooter"),
    ],
  },
];
