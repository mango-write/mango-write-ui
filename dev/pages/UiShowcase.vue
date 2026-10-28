<script setup lang="ts">
/**
 * MangoWrite · 组件库 / Component catalog  (dev-only, route `/dev/ui`)
 *
 * Renders real PrimeVue and MangoWrite UI components so the shared theme can
 * be checked end-to-end without a host application. Add new public components
 * and newly themed PrimeVue components here or in ExtendedShowcase.
 *
 * Host-specific business components stay in their owning application.
 */
import Accordion from "primevue/accordion";
import AccordionContent from "primevue/accordioncontent";
import AccordionHeader from "primevue/accordionheader";
import AccordionPanel from "primevue/accordionpanel";
import AutoComplete from "primevue/autocomplete";
import Avatar from "primevue/avatar";
import Badge from "primevue/badge";
import Breadcrumb from "primevue/breadcrumb";
import Button from "primevue/button";
import Card from "primevue/card";
import Checkbox from "primevue/checkbox";
import Chip from "primevue/chip";
import Column from "primevue/column";
import DataTable from "primevue/datatable";
import DataView from "primevue/dataview";
import DatePicker from "primevue/datepicker";
import Dialog from "primevue/dialog";
import Divider from "primevue/divider";
import Drawer from "primevue/drawer";
import FileUpload from "primevue/fileupload";
import InlineMessage from "primevue/inlinemessage";
import InputNumber from "primevue/inputnumber";
import InputText from "primevue/inputtext";
import Menu from "primevue/menu";
import Message from "primevue/message";
import MultiSelect from "primevue/multiselect";
import Paginator from "primevue/paginator";
import Popover from "primevue/popover";
import ProgressBar from "primevue/progressbar";
import ProgressSpinner from "primevue/progressspinner";
import RadioButton from "primevue/radiobutton";
import Rating from "primevue/rating";
import Select from "primevue/select";
import SelectButton from "primevue/selectbutton";
import Skeleton from "primevue/skeleton";
import Slider from "primevue/slider";
import Splitter from "primevue/splitter";
import SplitterPanel from "primevue/splitterpanel";
import ScrollPanel from "primevue/scrollpanel";
import Tab from "primevue/tab";
import TabList from "primevue/tablist";
import TabPanel from "primevue/tabpanel";
import TabPanels from "primevue/tabpanels";
import Tabs from "primevue/tabs";
import Tag from "primevue/tag";
import Textarea from "primevue/textarea";
import Timeline from "primevue/timeline";
import ToggleSwitch from "primevue/toggleswitch";
import FloatLabel from "primevue/floatlabel";
import IconField from "primevue/iconfield";
import InputIcon from "primevue/inputicon";
import InputGroup from "primevue/inputgroup";
import InputGroupAddon from "primevue/inputgroupaddon";
import Listbox from "primevue/listbox";
import Step from "primevue/step";
import StepList from "primevue/steplist";
import StepPanel from "primevue/steppanel";
import StepPanels from "primevue/steppanels";
import Stepper from "primevue/stepper";
import Tree from "primevue/tree";
import TreeSelect from "primevue/treeselect";
import { useConfirm } from "primevue/useconfirm";
import { useToast } from "primevue/usetoast";
import { computed, ref } from "vue";
import { AppLogo, AsyncSlot, FormField, HoverCard, SearchableMultiSelect, SearchableSelect } from "../../src";
import ExtendedShowcase from "./ExtendedShowcase.vue";

const toast = useToast();
const confirm = useConfirm();

// demo state
const tocOpen = ref(false);
const text = ref("Scaling Rectified Flow Transformers");
const area = ref("本文提出一种直接偏好优化方法（DPO），无需显式奖励模型即可对齐语言模型。");
const num = ref(12);
const now = new Date();
// 默认落在当月 12 号：选中日与「今天」描边不同格，两态才各自可量。
const date = ref<Date | null>(new Date(now.getFullYear(), now.getMonth(), 12));
const checked = ref(true);
const radio = ref("apa");
const toggle = ref(true);
const slider = ref(40);
const rating = ref(4);
const demoPageFirst = ref(0);
const demoPageRows = ref(10);

// Tree / TreeSelect / Listbox / Stepper state
const treeNodes = ref([
  {
    key: "0",
    label: "我的文献",
    icon: "pi pi-fw pi-folder",
    children: [
      {
        key: "0-0",
        label: "深度学习",
        icon: "pi pi-fw pi-folder",
        children: [
          { key: "0-0-0", label: "DPO.pdf", icon: "pi pi-fw pi-file" },
          { key: "0-0-1", label: "PPO.pdf", icon: "pi pi-fw pi-file" }
        ]
      },
      {
        key: "0-1",
        label: "大语言模型",
        icon: "pi pi-fw pi-folder",
        children: [
          { key: "0-1-0", label: "LLaMA.pdf", icon: "pi pi-fw pi-file" }
        ]
      }
    ]
  },
  {
    key: "1",
    label: "未分类",
    icon: "pi pi-fw pi-folder-open",
    children: [
      { key: "1-0", label: "Draft.docx", icon: "pi pi-fw pi-file" }
    ]
  }
]);
const selectedTreeNodeKeys = ref({});
const selectedTreeSelectKey = ref(null);

const citeStyles = [
  { name: "APA 7th Edition", code: "apa" },
  { name: "GB/T 7714-2015", code: "gbt" },
  { name: "MLA 9th Edition", code: "mla" },
  { name: "IEEE", code: "ieee" },
  { name: "Harvard", code: "harvard" }
];
const selectedCiteStyle = ref(citeStyles[0]);

const searchKeyword = ref("");
const username = ref("");
const price = ref(99);
const urlPath = ref("mango-write");

const zones = [
  { label: "JCR Q1 · 中科院一区", value: "q1" },
  { label: "JCR Q2 · 中科院二区", value: "q2" },
  { label: "JCR Q3 · 中科院三区", value: "q3" }
];
const zone = ref("q1");

const topics = ["Diffusion", "RLHF", "Scaling Law", "Agent", "Multimodal"];
const topicOptions = topics.map((label) => ({ label }));
const selectedTopics = ref<string[]>(["Diffusion", "RLHF"]);
const selectedTopicsAC = ref<string[]>(["Diffusion", "RLHF"]);

const views = ["列表", "网格"];
const view = ref("列表");

const suggestions = ref<string[]>([]);
const acValue = ref("");
const search = (e: { query: string }) => {
  suggestions.value = ["Diffusion Models Beat GANs", "Differentiable Architecture Search", "DiffPose"].filter(
    (s) => s.toLowerCase().includes(e.query.toLowerCase())
  );
};

const papers = [
  { title: "Scaling Rectified Flow Transformers", venue: "ICML 2024", zone: "Q1", year: 2024 },
  { title: "Direct Preference Optimization", venue: "NeurIPS 2023", zone: "Q1", year: 2023 },
  { title: "Diffusion Models Beat GANs", venue: "NeurIPS 2021", zone: "Q2", year: 2021 }
];
const selectedPapers = ref<(typeof papers)[number][]>([papers[1]!]);

const showcaseToc = [
  {
    label: "设计基建",
    href: "#chapter-foundations",
    items: [
      { label: "品牌色阶", href: "#foundation-brand" },
      { label: "语义状态色", href: "#foundation-status" },
      { label: "文本层级", href: "#foundation-text" },
      { label: "字族", href: "#foundation-fonts" },
      { label: "层级色阶", href: "#foundation-elevation" }
    ]
  },
  {
    label: "原子组件",
    href: "#chapter-atoms",
    items: [
      { label: "Button", href: "#atoms-button" },
      { label: "输入控件", href: "#atoms-input" },
      { label: "FormField", href: "#atoms-form-field" },
      { label: "输入组合", href: "#atoms-input-composition" },
      { label: "FileUpload", href: "#atoms-fileupload" },
      { label: "选择控件", href: "#atoms-selection" },
      { label: "勾选 / 开关", href: "#atoms-state" },
      { label: "工具条档", href: "#atoms-toolbar" }
    ]
  },
  {
    label: "数据展示",
    href: "#chapter-data",
    items: [
      { label: "Tag / Avatar", href: "#data-tags" },
      { label: "Card", href: "#data-card" },
      { label: "分组卡列表", href: "#data-group-list" },
      { label: "DataTable", href: "#data-table" },
      { label: "DataView", href: "#data-dataview" },
      { label: "Tabs / Timeline", href: "#data-tabs" },
      { label: "Progress / Skeleton", href: "#data-progress" },
      { label: "Tree", href: "#data-tree" }
    ]
  },
  {
    label: "反馈与覆盖层",
    href: "#chapter-feedback",
    items: [
      { label: "Message", href: "#feedback-message" },
      { label: "AsyncSlot 四态", href: "#feedback-async" },
      { label: "Toast", href: "#feedback-toast" },
      { label: "覆盖层", href: "#feedback-overlays" },
      { label: "Tooltip", href: "#feedback-tooltip" },
      { label: "HoverCard", href: "#feedback-hovercard" },
      { label: "ConfirmDialog", href: "#feedback-confirm" }
    ]
  },
  {
    label: "导航与布局",
    href: "#chapter-navigation",
    items: [
      { label: "segmented", href: "#navigation-segmented" },
      { label: "Breadcrumb / Paginator", href: "#navigation-breadcrumb" },
      { label: "Stepper", href: "#navigation-stepper" },
      { label: "Splitter", href: "#layout-splitter" },
      { label: "ScrollPanel", href: "#layout-scroll-panel" }
    ]
  },
  {
    label: "更多表单",
    href: "#chapter-form-extras",
    items: [
      { label: "密码与格式输入", href: "#form-text-extras" },
      { label: "级联与颜色", href: "#form-choice-extras" },
      { label: "组合与容器", href: "#form-group-extras" }
    ]
  },
  {
    label: "更多导航",
    href: "#chapter-menu-extras",
    items: [
      { label: "组合按钮", href: "#menu-button-extras" },
      { label: "菜单族", href: "#menu-navigation-extras" }
    ]
  },
  {
    label: "数据与面板",
    href: "#chapter-data-extras",
    items: [
      { label: "数据重排", href: "#data-reorder-extras" },
      { label: "树与虚拟列表", href: "#data-tree-extras" },
      { label: "面板与延迟内容", href: "#data-panel-extras" }
    ]
  },
  {
    label: "反馈与媒体",
    href: "#chapter-media-extras",
    items: [
      { label: "阻塞与确认", href: "#media-feedback-extras" },
      { label: "图片与轮播", href: "#media-image-extras" },
      { label: "头像与指标", href: "#media-misc-extras" }
    ]
  },
  {
    label: "UI 包组件",
    href: "#chapter-ui-package",
    items: [
      { label: "ImageLightbox", href: "#package-lightbox" },
      { label: "SiteHeader / SiteFooter", href: "#package-site-chrome" }
    ]
  }
];

const events = [
  { status: "导入", date: "03-12" },
  { status: "解析完成", date: "03-12" },
  { status: "精读批注", date: "03-14" },
  { status: "引用入稿", date: "03-18" }
];

const breadcrumbItems = [{ label: "文献库" }, { label: "多模态" }, { label: "DPO" }];
const breadcrumbHome = { icon: "pi pi-home" };

const menuItems = [
  {
    label: "操作",
    items: [
      { label: "查看原文", icon: "pi pi-file" },
      { label: "翻译", icon: "pi pi-language" },
      { label: "重新解析", icon: "pi pi-refresh", disabled: true }
    ]
  },
  { separator: true },
  { label: "删除", icon: "pi pi-trash" }
];
const menu = ref<InstanceType<typeof Menu> | null>(null);
const popover = ref<InstanceType<typeof Popover> | null>(null);

// 第 02 章 · DataView 演示：排序是消费方的 computed，组件不内置
const dvQuery = ref("");
const dvSortOptions = [
  { label: "按年份", value: "year" },
  { label: "按标题", value: "title" }
];
const dvSort = ref("year");
const dvPapers = computed(() =>
  [...papers].sort((a, b) => (dvSort.value === "year" ? b.year - a.year : a.title.localeCompare(b.title)))
);

const dialogOpen = ref(false);
const drawerOpen = ref(false);

// 工具条档 demo（ghost / tinted 两态） i18n-allow
const chipDemoOptions = [
  { label: "2026", value: "2026" },
  { label: "2025", value: "2025" },
];
const chipDemoQuery = ref("");
const chipDemoEmpty = ref<string | null>(null);
const chipDemoValue = ref<string | null>("2026");

const asyncDemoStatus = ref<"loading" | "empty" | "error" | "ready">("loading");
const asyncDemoStates: { label: string; value: typeof asyncDemoStatus.value }[] = [
  { label: "加载", value: "loading" },
  { label: "空", value: "empty" },
  { label: "错误", value: "error" },
  { label: "内容", value: "ready" },
];

// segmented demo：半透明胶囊轨道 + 滑动 liquid glass 品牌胶囊，按段位滑动
// （与 AppShell 生产实现同款定位方式；本 demo 的段是原生 button，ref 直接给
// 元素——生产的 RouterLink 是组件，ref 要取 $el 解包，见 AppShell）。
const shellSeg = ref<"library" | "writer">("library");
const shellSegItems = [
  { id: "library", label: "文献库", icon: "pi pi-book" },
  { id: "writer", label: "写作器", icon: "pi pi-pencil" }
] as const;
const shellSegEls = ref<(HTMLElement | null)[]>([]);
const shellSegThumbStyle = computed(() => {
  const index = shellSegItems.findIndex((item) => item.id === shellSeg.value);
  const el = shellSegEls.value[index];
  if (!el) return { opacity: "0" };
  return {
    width: `${el.offsetWidth}px`,
    transform: `translateX(${el.offsetLeft}px)`
  };
});

function fireToast() {
  toast.add({ severity: "success", summary: "已保存", detail: "草稿已同步到云端", life: 2400 });
}

/** 五种 severity 各一条，供 #feedback-toast 逐条点开比对尺寸与文字层级。 */
const toastSeeds: { severity: "success" | "info" | "warn" | "error" | "secondary"; summary: string; detail?: string }[] = [
  { severity: "success", summary: "已保存", detail: "草稿已同步到云端" },
  { severity: "info", summary: "检测到 3 篇重复文献", detail: "可在素材库里合并，各自的锚点都会保留" },
  { severity: "warn", summary: "云端存储空间不足", detail: "剩余 0.4 GB，建议先清理已解析的原文" },
  { severity: "error", summary: "解析失败", detail: "这篇 PDF 有 320 页，超出单次导入上限。可以重试，或改用分段导入。" },
  { severity: "secondary", summary: "已加入文献库" }
];

function fireToastSeed(severity: (typeof toastSeeds)[number]["severity"]) {
  const seed = toastSeeds.find((item) => item.severity === severity)!;
  toast.add({ severity: seed.severity, summary: seed.summary, detail: seed.detail, life: 6000 });
}

function confirmDanger() {
  confirm.require({
    header: "确认删除",
    message: "删除后将移入回收站，30 天内可恢复。",
    icon: "pi pi-trash",
    acceptLabel: "删除",
    rejectLabel: "取消",
    rejectProps: { severity: "secondary", text: true },
    acceptProps: { severity: "danger" }
  });
}

function confirmWarning() {
  confirm.require({
    header: "切换模型？",
    message: "切换模型会新建一个对话，当前上下文将被压缩。",
    icon: "pi pi-exclamation-triangle",
    acceptLabel: "切换",
    rejectLabel: "取消",
    rejectProps: { severity: "secondary", text: true }
  });
}

function confirmInfo() {
  confirm.require({
    header: "启用功能",
    message: "开启后可在设置中随时关闭。",
    icon: "pi pi-info-circle",
    acceptLabel: "启用",
    rejectLabel: "取消",
    rejectProps: { severity: "secondary", text: true }
  });
}
</script>

<template>
  <!-- 整页滚动已禁（岛内自滚，见 styles.css 的 .mw-main）：本页自己就是滚动
       容器（mw-scroll），TOC 的锚点跳转滚的也是这一层。 -->
  <div class="ks-root mw-scroll">
  <div class="ks">
    <nav class="ks-toc" :class="{ 'ks-toc--open': tocOpen }" aria-label="组件导航">
      <div class="ks-toc__head">
        <span class="ks-kicker">Quick jump</span>
        <span class="ks-toc__hint">点击跳转到对应组件</span>
        <button
          type="button"
          class="ks-toc__toggle"
          :aria-expanded="tocOpen ? 'true' : 'false'"
          aria-controls="ks-toc-grid"
          @click="tocOpen = !tocOpen"
        >
          {{ tocOpen ? "收起" : "展开" }}
        </button>
      </div>
      <!-- 移动端展开时面板有 40vh 高，跳完不收起就会盖住目标块 -->
      <div id="ks-toc-grid" class="ks-toc__grid" @click="tocOpen = false">
        <section v-for="group in showcaseToc" :key="group.href" class="ks-toc__group">
          <a :href="group.href" class="ks-toc__section">{{ group.label }}</a>
          <div class="ks-toc__items">
            <a v-for="item in group.items" :key="item.href" :href="item.href" class="ks-toc__item">
              {{ item.label }}
            </a>
          </div>
        </section>
      </div>
    </nav>

    <main class="ks-content">
      <header class="ks-hero">
        <AppLogo />
        <div>
          <h1 class="tw:text-2xl tw:font-bold tw:tracking-tight">组件库</h1>
          <p class="tw:mt-1 tw:text-muted tw:text-sm">
            原生 PrimeVue 与 MangoWrite UI 公共组件的真实展示，样式来自统一 token 桥接。
          </p>
        </div>
      </header>

    <section id="chapter-foundations" class="ks-chapter">
      <div class="ks-kicker">00 · Foundations</div>
      <h2 class="ks-h2">设计基建</h2>

      <div class="ks-block">
        <div id="foundation-brand" class="ks-block-title">品牌色阶 · text-primary / bg-primary</div>
        <div class="ks-stage">
          <div class="ks-swatch-row">
            <div v-for="s in ['50', '100', '200', '300', '400', '500', '600', '700']" :key="s" class="ks-swatch">
              <span class="ks-swatch-chip" :style="{ background: `var(--color-brand-${s})` }" />
              <code>{{ s }}</code>
            </div>
          </div>
        </div>
        <div id="foundation-status" class="ks-block-title">语义状态色</div>
        <div class="ks-stage tw:gap-3">
          <span class="ks-dot tw:bg-primary">primary</span>
          <span class="ks-dot tw:bg-success">success</span>
          <span class="ks-dot tw:bg-info">info</span>
          <span class="ks-dot tw:bg-warning">warning</span>
          <span class="ks-dot tw:bg-danger">danger</span>
        </div>
        <div id="foundation-text" class="ks-block-title">文本层级 · text-default / muted / subtle / faint</div>
        <div class="ks-stage tw:gap-6">
          <span class="tw:text-default tw:text-lg tw:font-semibold">学术写作 Aa</span>
          <span class="tw:text-muted tw:text-lg">学术写作 Aa</span>
          <span class="tw:text-subtle tw:text-lg">学术写作 Aa</span>
          <span class="tw:text-faint tw:text-lg">学术写作 Aa</span>
        </div>
        <div id="foundation-fonts" class="ks-block-title">字族 · font-sans / serif / mono</div>
        <div class="ks-stage tw:gap-6">
          <span class="tw:font-sans tw:text-lg">界面文字 Interface</span>
          <span class="tw:font-serif tw:text-lg">长文阅读 Long-form</span>
          <span class="tw:font-mono tw:text-lg">10.48550/arXiv · 1,284</span>
        </div>

        <div id="foundation-elevation" class="ks-block-title">层级色阶 · elevation 0/1/2/3</div>
        <div class="ks-stage ks-stage--elev">
          <div class="ks-elev ks-elev-0"><code>--elevation-0</code><span>页面底 / 中栏容器</span></div>
          <div class="ks-elev ks-elev-1"><code>--elevation-1</code><span>左栏 · 右栏 Copilot</span></div>
          <div class="ks-elev ks-elev-2"><code>--elevation-2</code><span>分组卡 / 内容面</span></div>
          <div class="ks-elev ks-elev-3"><code>--elevation-3</code><span>浮层</span></div>
        </div>
        <p class="ks-note">
          只写层号（<code>background: var(--elevation-2-surface)</code>），不写阴影——浅色展开成阴影、
          深色展开成亮度。
        </p>
      </div>
    </section>

    <section id="chapter-atoms" class="ks-chapter">
      <div class="ks-kicker">01 · Atoms</div>
      <h2 class="ks-h2">原子组件</h2>

      <div class="ks-block">
        <div id="atoms-button" class="ks-block-title">Button — 实体风格 (Solid / Severities)</div>
        <div class="ks-stage">
          <Button label="Primary" />
          <Button label="Secondary" severity="secondary" />
          <Button label="Success" severity="success" />
          <Button label="Info" severity="info" />
          <Button label="Warning" severity="warn" />
          <Button label="Danger" severity="danger" />
          <Button label="Contrast" severity="contrast" />
        </div>

        <div class="ks-block-title tw:mt-4">Button — 描边风格 (Outlined)</div>
        <div class="ks-stage">
          <Button label="Primary" variant="outlined" />
          <Button label="Secondary" severity="secondary" variant="outlined" />
          <Button label="Success" severity="success" variant="outlined" />
          <Button label="Info" severity="info" variant="outlined" />
          <Button label="Warning" severity="warn" variant="outlined" />
          <Button label="Danger" severity="danger" variant="outlined" />
          <Button label="Contrast" severity="contrast" variant="outlined" />
        </div>

        <div class="ks-block-title tw:mt-4">Button — 文本风格 (Text)</div>
        <div class="ks-stage">
          <Button label="Primary" variant="text" />
          <Button label="Secondary" severity="secondary" variant="text" />
          <Button label="Success" severity="success" variant="text" />
          <Button label="Info" severity="info" variant="text" />
          <Button label="Warning" severity="warn" variant="text" />
          <Button label="Danger" severity="danger" variant="text" />
          <Button label="Contrast" severity="contrast" variant="text" />
        </div>

        <div class="ks-block-title tw:mt-4">Button — 链接风格 (Link)</div>
        <div class="ks-stage">
          <Button label="Primary Link" variant="link" />
          <Button label="Secondary Link" severity="secondary" variant="link" />
          <Button label="Danger Link" severity="danger" variant="link" />
        </div>

        <div class="ks-block-title tw:mt-4">Button — 形状与图标 (Shapes & Icons)</div>
        <div class="ks-stage tw:items-center">
          <Button label="Rounded" rounded />
          <Button label="Rounded Success" severity="success" rounded />
          <Button label="Rounded Danger Outlined" severity="danger" variant="outlined" rounded />
          <Button icon="pi pi-plus" aria-label="Add" />
          <Button icon="pi pi-pencil" severity="secondary" aria-label="Edit" />
          <Button icon="pi pi-trash" severity="danger" rounded aria-label="Delete" />
          <Button label="搜索文档" icon="pi pi-search" />
          <Button label="下一步" icon="pi pi-arrow-right" icon-pos="right" severity="secondary" />
        </div>

        <div class="ks-block-title tw:mt-4">Button — 尺寸与状态 (Sizes, States & Shadow)</div>
        <div class="ks-stage tw:items-center">
          <Button label="Small" size="small" />
          <Button label="Default" />
          <Button label="Large" size="large" />
          <Button label="Loading" loading />
          <Button label="Disabled" disabled />
          <Button label="Disabled Outlined" severity="secondary" variant="outlined" disabled />
          <Button label="Raised Solid" raised />
          <Button label="Raised Outlined" severity="secondary" variant="outlined" raised />
        </div>

        <div class="ks-block-title tw:mt-4">Button — 徽标指示 (Badges)</div>
        <div class="ks-stage tw:items-center">
          <Button icon="pi pi-bell" severity="secondary" badge="3" badge-severity="danger" aria-label="通知" />
          <Button icon="pi pi-bell" severity="secondary" badge="12" badge-severity="danger" aria-label="通知" />
          <Button label="Messages" badge="8" badge-severity="warn" />
          <Button icon="pi pi-send" size="small" badge="+2" aria-label="发送" />
          <Button icon="pi pi-send" badge="+2" aria-label="发送" />
          <Button icon="pi pi-send" size="large" badge="+2" aria-label="发送" />
        </div>
      </div>

      <div class="ks-block">
        <div id="atoms-input" class="ks-block-title">输入控件</div>
        <div class="ks-stage ks-stage--col">
          <div class="ks-cell">
            <label class="ks-cell-label">InputText</label>
            <InputText v-model="text" placeholder="输入论文标题…" fluid />
          </div>
          <div class="ks-cell">
            <label class="ks-cell-label">InputText · invalid</label>
            <InputText model-value="" placeholder="标题不能为空" invalid fluid />
          </div>
          <div class="ks-cell">
            <label class="ks-cell-label">Textarea</label>
            <Textarea v-model="area" rows="3" auto-resize fluid />
          </div>
          <div class="ks-cell">
            <label class="ks-cell-label">InputNumber</label>
            <InputNumber v-model="num" show-buttons :min="0" />
          </div>
          <div class="ks-cell">
            <label class="ks-cell-label">InputNumber · sm 尺寸</label>
            <InputNumber v-model="num" show-buttons :min="0" size="small" />
          </div>
          <div class="ks-cell">
            <label class="ks-cell-label">InputNumber · 列容器内不拉伸</label>
            <div class="tw:flex tw:flex-col tw:gap-2 tw:w-full">
              <InputNumber v-model="num" show-buttons :min="0" />
              <InputNumber v-model="num" show-buttons :min="0" size="small" />
            </div>
          </div>
          <div class="ks-cell">
            <label class="ks-cell-label">InputNumber · 无按钮（可占满宽度）</label>
            <InputNumber v-model="num" :min="0" fluid />
          </div>
        </div>
      </div>

      <div class="ks-block">
        <div id="atoms-form-field" class="ks-block-title">FormField — 常驻标签、说明与错误关联</div>
        <p class="ks-note">
          用于需要一个常驻标签的输入字段；slot props 把 inputId / describedBy / invalid / required 交给
          PrimeVue 或自研 combo。简单勾选行、搜索工具条不需要包一层，placeholder 不能替标签。
        </p>
        <div class="ks-stage ks-stage--col">
          <FormField input-id="showcase-title" label="论文标题" required v-slot="{ inputId, required }">
            <InputText :id="inputId" v-model="text" :required="required" fluid />
          </FormField>
          <FormField
            input-id="showcase-zone"
            label="期刊分区"
            hint="选择论文发表期刊最接近的分区"
            v-slot="{ inputId, describedBy, invalid }"
          >
            <SearchableSelect
              :input-id="inputId"
              v-model="zone"
              :options="zones"
              option-label="label"
              option-value="value"
              :aria-describedby="describedBy"
              :invalid="invalid"
              show-clear
            />
          </FormField>
          <FormField
            input-id="showcase-doi"
            label="DOI"
            error="DOI 格式不完整，请检查前缀与年份"
            v-slot="{ inputId, describedBy, invalid }"
          >
            <InputText
              :id="inputId"
              model-value="10.1000"
              :aria-describedby="describedBy"
              :invalid="invalid"
              fluid
            />
          </FormField>
        </div>
      </div>

      <div class="ks-block">
        <div id="atoms-input-composition" class="ks-block-title">高级输入与组合 — InputGroup / IconField / FloatLabel</div>
        <div class="ks-stage ks-stage--col tw:gap-4">
          <div class="tw:flex tw:flex-wrap tw:gap-6 tw:w-full">
            <div class="ks-cell tw:flex-1 tw:min-w-[200px]">
              <label class="ks-cell-label">IconField (Prefix)</label>
              <IconField>
                <InputIcon class="pi pi-search" />
                <InputText v-model="searchKeyword" placeholder="检索文献…" fluid />
              </IconField>
            </div>
            <div class="ks-cell tw:flex-1 tw:min-w-[200px]">
              <label class="ks-cell-label">IconField (Suffix)</label>
              <IconField>
                <InputText v-model="searchKeyword" placeholder="检索作者…" fluid />
                <InputIcon class="pi pi-user" />
              </IconField>
            </div>
            <div class="ks-cell tw:flex-1 tw:min-w-[200px] tw:pt-3">
              <FloatLabel>
                <InputText id="float-username" v-model="username" fluid />
                <label for="float-username">用户名 / 邮箱</label>
              </FloatLabel>
            </div>
          </div>
          <div class="tw:flex tw:flex-wrap tw:gap-6 tw:w-full tw:mt-2">
            <div class="ks-cell tw:flex-1 tw:min-w-[280px]">
              <label class="ks-cell-label">InputGroup (Prefix Label + Button)</label>
              <InputGroup>
                <InputGroupAddon>https://</InputGroupAddon>
                <InputText v-model="urlPath" placeholder="站点路径" />
                <Button label="检查" severity="secondary" />
              </InputGroup>
            </div>
            <div class="ks-cell tw:flex-1 tw:min-w-[240px]">
              <label class="ks-cell-label">InputGroup (Checkbox + Number + Suffix)</label>
              <InputGroup>
                <InputGroupAddon><Checkbox v-model="checked" binary /></InputGroupAddon>
                <InputNumber v-model="price" placeholder="价格" />
                <InputGroupAddon>.00</InputGroupAddon>
              </InputGroup>
            </div>
          </div>
        </div>
      </div>

      <div class="ks-block">
        <div id="atoms-fileupload" class="ks-block-title">FileUpload — 上传（拖拽区 / 文件清单 / 进度）</div>
        <p class="ks-note">
          PrimeVue 不自带空态与按钮文案：<code>#empty</code> 槽与「选择 / 上传 / 取消」label 都由消费方给，
          生产必须走 i18n。root 面只作用于 advanced（basic 仍是裸按钮）；root 是块级、随容器拉伸，
          <strong>组件上的 class / style 会被转发给 choose 按钮</strong>（BaseComponent 把两者声明成
          prop），往组件上写宽度类只会拉宽按钮、挤瘪同排的另外两枚。
        </p>
        <div class="ks-stage ks-stage--col">
          <div class="ks-cell tw:w-full">
            <label class="ks-cell-label">advanced — 空态 / 文件清单 / 超限报错（选一个 &gt; 1MB 的文件试试）</label>
            <FileUpload
              :max-file-size="1000000"
              choose-label="选择文件"
              upload-label="上传"
              cancel-label="取消"
            >
              <template #empty>
                <span class="tw:text-muted tw:text-sm">拖入 PDF / 图片，或点击「选择文件」</span>
              </template>
            </FileUpload>
          </div>
          <div class="ks-cell tw:w-full">
            <label class="ks-cell-label">advanced · disabled — 置灰要说明原因与出路，不是哑掉的按钮</label>
            <FileUpload
              :max-file-size="1000000"
              disabled
              choose-label="选择文件"
              upload-label="上传"
              cancel-label="取消"
            >
              <template #empty>
                <span class="tw:text-muted tw:text-sm">云端空间已满，先清理存储后再上传</span>
              </template>
            </FileUpload>
          </div>
          <div class="ks-cell">
            <label class="ks-cell-label">basic — 紧凑按钮（未选文件的文案走 #filelabel 槽，同样是消费方的事）</label>
            <FileUpload mode="basic" :max-file-size="1000000" choose-label="选择文件">
              <template #filelabel>未选择文件</template>
            </FileUpload>
          </div>
        </div>
      </div>

      <div class="ks-block">
        <div id="atoms-selection" class="ks-block-title">选择控件</div>
        <div class="ks-stage">
          <div class="ks-cell">
            <label class="ks-cell-label">Select — 单选</label>
            <Select v-model="zone" :options="zones" option-label="label" option-value="value" placeholder="选择分区…" />
          </div>
          <div class="ks-cell">
            <label for="showcase-search-zone" class="ks-cell-label">SearchableSelect — 可搜索单选（方向键 + Enter）</label>
            <SearchableSelect
              input-id="showcase-search-zone"
              v-model="zone"
              :options="zones"
              option-label="label"
              option-value="value"
              placeholder="选择分区…"
              show-clear
            />
          </div>
          <div class="ks-cell">
            <label for="showcase-search-topics" class="ks-cell-label">SearchableMultiSelect — 多选（chip 按钮删除）</label>
            <SearchableMultiSelect
              input-id="showcase-search-topics"
              v-model="selectedTopicsAC"
              :options="topicOptions"
              option-label="label"
              option-value="label"
              placeholder="选择主题…"
            />
          </div>
          <div class="ks-cell">
            <label for="showcase-search-disabled" class="ks-cell-label">SearchableMultiSelect · disabled（不暴露删除）</label>
            <SearchableMultiSelect
              input-id="showcase-search-disabled"
              v-model="selectedTopicsAC"
              :options="topicOptions"
              option-label="label"
              option-value="label"
              disabled
            />
          </div>
          <div class="ks-cell">
            <label class="ks-cell-label">MultiSelect — 原生多选（面板内过滤 · chip 展示）</label>
            <MultiSelect
              v-model="selectedTopics"
              :options="topics"
              display="chip"
              filter
              placeholder="选择主题…"
              :max-selected-labels="3"
            />
          </div>
          <div class="ks-cell">
            <label class="ks-cell-label">DatePicker</label>
            <DatePicker v-model="date" show-icon placeholder="选择日期…" />
          </div>
          <div class="ks-cell">
            <label class="ks-cell-label">DatePicker · inline — 面板常驻，可直接量格子尺寸（inline 贴页面、底下没内容可透，因此不升玻璃；点开的浮层才是 liquid glass）</label>
            <DatePicker v-model="date" inline style="width: 250px" />
          </div>
          <div class="ks-cell">
            <label class="ks-cell-label">AutoComplete</label>
            <AutoComplete v-model="acValue" :suggestions="suggestions" placeholder="联想检索…" @complete="search" />
          </div>
          <div class="ks-cell">
            <label class="ks-cell-label">TreeSelect</label>
            <TreeSelect v-model="selectedTreeSelectKey" :options="treeNodes" placeholder="选择文献分类…" selection-mode="single" />
          </div>
          <div class="ks-cell">
            <label class="ks-cell-label">Listbox (Inline Selection)</label>
            <Listbox v-model="selectedCiteStyle" :options="citeStyles" option-label="name" class="tw:w-56" />
          </div>
          <div class="ks-cell">
            <label class="ks-cell-label">SelectButton</label>
            <SelectButton v-model="view" :options="views" />
          </div>
        </div>
      </div>

      <div class="ks-block">
        <div id="atoms-state" class="ks-block-title">勾选 / 开关 / 滑块 / 评分</div>
        <div class="ks-stage tw:items-center tw:gap-6">
          <label class="ks-inline"><Checkbox v-model="checked" binary /> 已精读</label>
          <label class="ks-inline"><RadioButton v-model="radio" value="apa" /> APA 7</label>
          <label class="ks-inline"><RadioButton v-model="radio" value="gbt" /> GB/T 7714</label>
          <label class="ks-inline"><ToggleSwitch v-model="toggle" /> AI 实时建议</label>
          <div class="ks-inline" style="min-width: 220px"><Slider v-model="slider" class="tw:w-48" /></div>
          <Rating v-model="rating" />
        </div>
      </div>

      <div class="ks-block">
        <div id="atoms-toolbar" class="ks-block-title">工具条档 · 行级 mw-toolbar</div>
        <div class="ks-stage ks-stage--bar mw-toolbar">
          <IconField class="tw:flex-1 tw:min-w-[10rem]">
            <InputIcon class="pi pi-search" />
            <InputText v-model="chipDemoQuery" placeholder="搜索" fluid />
          </IconField>
          <Select
            v-model="chipDemoEmpty"
            class="tw:flex-shrink-0"
            :options="chipDemoOptions"
            option-label="label"
            option-value="value"
            placeholder="年份"
            show-clear
          />
          <Select
            v-model="chipDemoValue"
            class="tw:flex-shrink-0"
            :class="{ 'is-active': chipDemoValue }"
            :options="chipDemoOptions"
            option-label="label"
            option-value="value"
            placeholder="分区"
            show-clear
          />
          <Button icon="pi pi-sliders-h" severity="secondary" variant="text" />
          <Button icon="pi pi-sort-alt" severity="secondary" variant="text" />
        </div>
        <p class="ks-note">
          <code>mw-toolbar</code> 是<strong>行级</strong>档位类：挂在工具条那一行上，行内的搜索框 / Select /
          SearchableMultiSelect / icon-only 按钮一并进档（全行统一 h32），新工具条只写这一个类，不必给每个
          控件包壳。未生效 = ghost（无填充、发丝描边），生效 = 品牌淡底 + 品牌字 + 品牌描边，
          <strong>由消费方在控件根或任一祖先挂 <code>is-active</code></strong> 决定——组件不知道「默认值算不算
          生效」。档只管外观，布局归消费方（搜索框 <code>flex-1</code> 撑满、筛选格 <code>flex-shrink-0</code>
          按内容收）。表单里的 Select 就该是字段档，<strong>不要为此去改 Select 或 MangoPreset</strong>。
        </p>
      </div>
    </section>

    <section id="chapter-data" class="ks-chapter">
      <div class="ks-kicker">02 · Data</div>
      <h2 class="ks-h2">数据展示</h2>

      <div class="ks-block">
        <div id="data-tags" class="ks-block-title">Tag / Chip / Badge / Avatar</div>
        <div class="ks-stage tw:items-center tw:gap-3">
          <Tag value="综述" />
          <Tag value="Q1" severity="success" />
          <Tag value="待精读" severity="warn" />
          <Tag value="重复" severity="danger" />
          <Chip label="毕业论文" removable />
          <Chip label="Diffusion" icon="pi pi-tag" />
          <Badge value="3" />
          <Badge value="12" severity="danger" />
          <Avatar label="LY" shape="circle" />
          <Avatar icon="pi pi-user" />
        </div>
      </div>

      <div class="ks-block">
        <div id="data-card" class="ks-block-title">Card</div>
        <div class="ks-stage">
          <Card class="tw:w-80">
            <template #title>Direct Preference Optimization</template>
            <template #subtitle>NeurIPS 2023 · Q1</template>
            <template #content>
              <p class="tw:text-muted tw:text-sm tw:m-0">无需显式奖励模型即可对齐语言模型的偏好优化方法。</p>
            </template>
            <template #footer>
              <div class="tw:flex tw:gap-2">
                <Button label="精读" size="small" />
                <Button label="引用" size="small" severity="secondary" />
              </div>
            </template>
          </Card>
        </div>
      </div>

      <div class="ks-block">
        <div id="data-group-list" class="ks-block-title">分组卡列表 · 一组一卡 + 内缩分隔线</div>
        <div class="ks-stage">
          <div class="mw-group-card ks-group-demo">
            <div
              v-for="(row, i) in [
                { title: 'Attention Is All You Need', meta: 'Vaswani et al. · NeurIPS 2017', state: 'starred' },
                { title: 'Direct Preference Optimization: Your Language Model is Secretly a Reward Model', meta: 'Rafailov et al. · NeurIPS 2023', state: 'needsCompletion' },
                { title: 'LoRA: Low-Rank Adaptation of Large Language Models', meta: 'Hu et al. · ICLR 2022', state: 'default' }
              ]"
              :key="row.title"
              class="ks-group-row"
              :class="{ 'ks-group-row--selected': i === 1 }"
            >
              <div class="ks-row-check">
                <Checkbox :model-value="i === 1" binary :tabindex="-1" />
              </div>
              <div class="ks-row-thumb" />
              <div class="ks-row-main">
                <div class="tw:flex tw:items-center tw:gap-2">
                  <span class="tw:text-[15px] tw:font-semibold tw:truncate">{{ row.title }}</span>
                  <i
                    class="pi text-sm"
                    :class="row.state === 'starred' ? 'pi-star-fill ks-star-on' : 'pi-star tw:text-faint'"
                  />
                </div>
                <div class="tw:flex tw:items-center tw:gap-1.5 tw:mt-1.5 tw:text-[11px] tw:text-faint">
                  <span class="tw:tabular-nums">2026-03-12 14:05</span>
                  <Tag v-if="row.state === 'needsCompletion'" severity="warn" class="tw:text-[11px]">待补全</Tag>
                  <span class="ks-row-reveal">✦ Q1 · IF 12.2</span>
                </div>
              </div>
              <div class="tw:flex tw:items-center tw:gap-2 tw:justify-end">
                <span class="ks-row-reveal tw:text-[11px] tw:text-subtle">引用 92,481</span>
                <Button icon="pi pi-ellipsis-v" severity="secondary" variant="text" size="small" class="ks-row-reveal" />
              </div>
            </div>
          </div>
        </div>
          <p class="ks-note">
          同构列表一律分组卡：一组 N 行共用一张卡（<code>--radius-lg</code> · elevation-2），行间分隔线<strong>内缩、
          左端与内容起点对齐</strong>。行交互三态：静息（常驻可点 ≤ 2 = 星标 + 状态徽标）· hover（checkbox 与 ⋯
          显现、行底色 bg-soft）· 选中（品牌淡底 + checkbox 保持可见）。打开 = 点击标题链接（行体点击放行文本
          选中与复制，不接管导航）；hover 显现的操作在右键菜单里都有同名项；键盘 ↑↓/Enter/Space/⌘A 可达。
          卡片只用于异构入口块与图片网格，且不套娃。生产范例见
          <code>SourceList</code>。
        </p>
      </div>

      <div class="ks-block">
        <div id="data-table" class="ks-block-title">DataTable</div>
        <p class="ks-note">
          行高与 Listbox / Menu / Tree 同档——td 的行高钉在 <code>primevue-theme.css</code> 的统一名单里，
          body 单元格没有类名，只能按结构选中。斑马条走 <code>--color-surface-muted</code>、行 hover 走
          <code>--color-bg-soft</code>，两档不同色，条纹上 hover 仍然看得见；选中带品牌色，与中性 hover
          纱底一眼可分。
        </p>
        <DataTable
          v-model:selection="selectedPapers"
          :value="papers"
          data-key="title"
          size="small"
          striped-rows
          selection-mode="multiple"
          class="tw:w-full"
        >
          <Column selection-mode="multiple" header-checkbox-aria-label="全选" />
          <Column field="title" header="标题" sortable />
          <Column field="venue" header="来源" sortable />
          <Column header="分区">
            <template #body="{ data }">
              <Tag :value="data.zone" :severity="data.zone === 'Q1' ? 'success' : 'info'" />
            </template>
          </Column>
          <Column field="year" header="年份" sortable />
        </DataTable>
      </div>

      <div class="ks-block">
        <div id="data-dataview" class="ks-block-title">DataView — 列表 / 网格壳（全透明，行卡归消费方）</div>
        <p class="ks-note">
          DataView 只提供结构：root / header / content / footer 全透明、不带边框，header / footer 只给
          12px 间距；同构列表的长相走上方分组卡范式，行与卡片由消费方渲染（网格直接摆 Card，不套娃），
          头部的筛选 / 排序行照 <code>mw-toolbar</code> 收档，排序是消费方的 computed。
        </p>
        <div class="ks-stage ks-stage--col">
          <DataView :value="dvPapers" data-key="title" layout="list" paginator :rows="2" class="tw:w-full">
            <template #header>
              <div class="mw-toolbar tw:w-full tw:flex tw:items-center tw:gap-2">
                <IconField class="tw:flex-1 tw:min-w-[10rem]">
                  <InputIcon class="pi pi-search" />
                  <InputText v-model="dvQuery" placeholder="搜索" fluid />
                </IconField>
                <Select
                  v-model="dvSort"
                  class="tw:flex-shrink-0"
                  :options="dvSortOptions"
                  option-label="label"
                  option-value="value"
                />
              </div>
            </template>
            <template #list="{ items }">
              <div class="mw-group-card">
                <div v-for="p in items as typeof papers" :key="p.title" class="ks-dv-row">
                  <span class="ks-dv-row__title">{{ p.title }}</span>
                  <span class="ks-dv-row__meta">{{ p.venue }}</span>
                  <Tag :value="p.zone" :severity="p.zone === 'Q1' ? 'success' : 'info'" />
                </div>
              </div>
            </template>
          </DataView>
          <DataView :value="papers" data-key="title" layout="grid" class="tw:w-full">
            <template #grid="{ items }">
              <div class="tw:grid tw:grid-cols-1 tw:gap-3 tw:md:grid-cols-3">
                <Card v-for="(p, i) in items as typeof papers" :key="i">
                  <template #title>{{ p.title }}</template>
                  <template #content>
                    <p class="tw:text-sm tw:text-muted tw:m-0">{{ p.venue }} · {{ p.year }}</p>
                  </template>
                </Card>
              </div>
            </template>
          </DataView>
        </div>
      </div>

      <div class="ks-block">
        <div id="data-tabs" class="ks-block-title">Tabs / Accordion / Timeline</div>
        <div class="ks-stage ks-stage--col">
          <Tabs value="0">
            <TabList>
              <Tab value="0">摘要</Tab>
              <Tab value="1">批注</Tab>
              <Tab value="2">引用</Tab>
            </TabList>
            <TabPanels>
              <TabPanel value="0"><p class="tw:text-muted tw:text-sm tw:m-0">论文摘要内容…</p></TabPanel>
              <TabPanel value="1"><p class="tw:text-muted tw:text-sm tw:m-0">3 条批注</p></TabPanel>
              <TabPanel value="2"><p class="tw:text-muted tw:text-sm tw:m-0">引用 12 次</p></TabPanel>
            </TabPanels>
          </Tabs>

          <Accordion value="0" class="tw:w-full">
            <AccordionPanel value="0">
              <AccordionHeader>方法</AccordionHeader>
              <AccordionContent><p class="tw:text-muted tw:text-sm tw:m-0">方法章节…</p></AccordionContent>
            </AccordionPanel>
            <AccordionPanel value="1">
              <AccordionHeader>实验</AccordionHeader>
              <AccordionContent><p class="tw:text-muted tw:text-sm tw:m-0">实验章节…</p></AccordionContent>
            </AccordionPanel>
          </Accordion>

          <Timeline :value="events" layout="horizontal" align="top">
            <template #content="{ item }">
              <div class="tw:text-sm tw:font-medium">{{ item.status }}</div>
              <div class="tw:text-faint tw:text-xs tw:font-mono">{{ item.date }}</div>
            </template>
          </Timeline>
        </div>
      </div>

      <div class="ks-block">
        <div id="data-progress" class="ks-block-title">Progress / Skeleton / Divider</div>
        <div class="ks-stage ks-stage--col">
          <ProgressBar :value="62" class="tw:w-full" />
          <div class="ks-stage tw:items-center">
            <ProgressSpinner style="width: 32px; height: 32px" stroke-width="4" />
            <Skeleton width="12rem" height="1rem" />
            <Skeleton shape="circle" size="2.5rem" />
          </div>
          <Divider />
        </div>
      </div>

      <div class="ks-block">
        <div id="data-tree" class="ks-block-title">Tree — 树形层级</div>
        <div class="ks-stage">
          <!-- 多选直接用 selection-mode="multiple"（点击行即勾/取消，metaKeySelection
               默认已是 false）；不用 "checkbox" 模式——那会在每一级都摆一个方框，
               层级越深越啰嗦，且与 MultiSelect/Select 的选中态观感不统一。 -->
          <Tree v-model:selectionKeys="selectedTreeNodeKeys" :value="treeNodes" selection-mode="multiple" class="tw:w-full md:tw:w-80" />
        </div>
      </div>
    </section>

    <section id="chapter-feedback" class="ks-chapter">
      <div class="ks-kicker">03 · Feedback</div>
      <h2 class="ks-h2">反馈与覆盖层</h2>

      <div class="ks-block">
        <div id="feedback-message" class="ks-block-title">Message / InlineMessage</div>
        <div class="ks-stage ks-stage--col">
          <Message severity="success" icon="pi pi-check-circle">已为本分类生成知识图谱</Message>
          <Message severity="info" icon="pi pi-info-circle">检测到 3 篇重复文献</Message>
          <Message severity="warn" icon="pi pi-exclamation-triangle">云端存储空间不足</Message>
          <Message severity="error" icon="pi pi-times-circle">解析失败，请重试</Message>
          <div class="ks-stage tw:gap-3">
            <InlineMessage severity="success">已保存</InlineMessage>
            <InlineMessage severity="error">DOI 格式不正确</InlineMessage>
          </div>
        </div>
      </div>

      <div class="ks-block">
        <div id="feedback-async" class="ks-block-title">AsyncSlot — 加载 / 空 / 错误 / 内容</div>
        <p class="ks-note">
          取数区域默认走同一个四态容器；#loading 可以替换成与真实内容同形的骨架，skeleton=none 时仍保留读屏反馈。
          空态给下一步，错误给恢复动作，不用 v-if 直接把内容闪成空白。
        </p>
        <div class="ks-stage ks-stage--col">
          <SelectButton
            v-model="asyncDemoStatus"
            :options="asyncDemoStates"
            option-label="label"
            option-value="value"
            :allow-empty="false"
          />
          <AsyncSlot
            :status="asyncDemoStatus"
            skeleton="none"
            empty-title="还没有文献"
            empty-hint="导入一篇 PDF 或粘贴 DOI 开始"
            error-hint="网络连接中断，请检查后重试"
            @retry="asyncDemoStatus = 'ready'"
          >
            <template #loading>
              <div class="tw:flex tw:flex-col tw:gap-3 tw:w-full" aria-hidden="true">
                <Skeleton height="2.75rem" />
                <Skeleton height="2.75rem" />
                <Skeleton height="2.75rem" width="62%" />
              </div>
            </template>
            <template #empty-action>
              <Button label="导入文献" icon="pi pi-upload" @click="asyncDemoStatus = 'ready'" />
            </template>
            <div class="mw-group-card">
              <div class="mw-group-card__row">
                <div>
                  <div class="tw:font-medium">Direct Preference Optimization</div>
                  <div class="tw:text-sm tw:text-subtle">NeurIPS 2023 · 已加入文献库</div>
                </div>
              </div>
            </div>
          </AsyncSlot>
        </div>
      </div>

      <div class="ks-block">
        <div id="feedback-toast" class="ks-block-title">Toast — 浮在内容上的紧凑反馈</div>
        <p class="ks-note">
          Toast 对标 <strong>Message</strong>，不对标 Dialog：同一族反馈文字——320px 宽、14px 文字、16px
          图标，summary 14/500、detail 13/400 降到次级灰。面板是浮层共用的 liquid glass，不涂 severity
          色底、边框与投影交给材质，severity 只染图标——色文字是垫在 Message 的色底上的，玻璃面上过不了
          对比度。强调色在 <code>theme-overrides.ts</code> 的 <code>toastSeverity()</code> 收口，图标染色在
          <code>primevue-theme.css</code>。
        </p>
        <div class="ks-stage tw:gap-3 tw:flex-wrap">
          <Button label="success" severity="success" variant="outlined" @click="fireToastSeed('success')" />
          <Button label="info" severity="info" variant="outlined" @click="fireToastSeed('info')" />
          <Button label="warn" severity="warn" variant="outlined" @click="fireToastSeed('warn')" />
          <Button label="error" severity="danger" variant="outlined" @click="fireToastSeed('error')" />
          <Button label="secondary" severity="secondary" variant="outlined" @click="fireToastSeed('secondary')" />
        </div>
      </div>

      <div class="ks-block">
        <div id="feedback-overlays" class="ks-block-title">覆盖层 · Dialog / Drawer / Popover</div>
        <div class="ks-stage tw:gap-3">
          <Button label="打开 Dialog" severity="secondary" @click="dialogOpen = true" />
          <Button label="打开 Drawer" severity="secondary" @click="drawerOpen = true" />
          <Button label="Popover" severity="secondary" @click="popover?.toggle($event)" />
        </div>
      </div>

      <div class="ks-block">
        <div id="feedback-tooltip" class="ks-block-title">Tooltip — 纯文本提示（v-tooltip · HoverCard 底座）</div>
        <p class="ks-note">
          纯文本提示一律用自研 <code>v-tooltip</code> 指令（<code>shared/components/tooltip.ts</code>），不是
          PrimeVue Tooltip：面板与 HoverCard 同一枚 liquid glass。值只接字符串，方向用修饰符
          <code>.top</code>（默认）/ <code>.right</code> / <code>.bottom</code> / <code>.left</code>，放不下自动
          翻转，长文本自动换行。富内容（组件、按钮、多行结构）走下面的 HoverCard。
        </p>
        <div class="ks-stage tw:gap-3 tw:flex-wrap">
          <Button v-tooltip.top="'上方向（默认推荐）'" label="top" severity="secondary" />
          <Button v-tooltip.right="'右方向'" label="right" severity="secondary" />
          <Button v-tooltip.bottom="'下方向'" label="bottom" severity="secondary" />
          <Button v-tooltip.left="'左方向'" label="left" severity="secondary" />
          <Button
            v-tooltip.top="'引用 92,481 · 最近同步 14:05'"
            icon="pi pi-star"
            severity="secondary"
            variant="text"
            aria-label="收藏"
          />
          <Button
            v-tooltip.top="'长文本自动换行：本文提出一种直接偏好优化方法（DPO），无需显式奖励模型即可对齐语言模型，并在下游任务上取得稳定收益。'"
            label="长文本 · pre-wrap"
            severity="secondary"
          />
        </div>
      </div>

      <div class="ks-block">
        <div id="feedback-hovercard" class="ks-block-title">HoverCard — 纯提示 / 交互弹层</div>
        <p class="ks-note">
          纯文本继续用 <code>v-tooltip</code>；富内容用 HoverCard，interactive=false 是 tooltip，interactive=true
          是带名称的非模态 dialog，Tab 可进入、Escape 归还焦点。trigger 本身可聚焦时传 <code>:focusable="false"</code>，
          避免双重 tab 停靠；面板挂 body，展开期间实时重对准并自动翻转。
        </p>
        <div class="ks-stage ks-stage--col tw:gap-5">
          <div class="ks-cell">
            <label class="ks-cell-label">富内容卡 — 可交互（hover 移进卡片点按钮）</label>
            <HoverCard :focusable="false" label="文献详细信息">
              <Button label="悬停看文献卡" severity="secondary" />
              <template #content>
                <div class="ks-hovercard-demo">
                  <div class="ks-hovercard-demo__title">Direct Preference Optimization</div>
                  <div class="ks-hovercard-demo__meta">Rafailov et al. · NeurIPS 2023 · Q1</div>
                  <p class="ks-hovercard-demo__body">
                    无需显式奖励模型即可对齐语言模型的偏好优化方法，训练稳定且推理开销与基线一致。
                  </p>
                  <div class="ks-hovercard-demo__actions">
                    <Button label="查看原文" size="small" @click="fireToast" />
                    <Button label="引用" size="small" severity="secondary" @click="fireToast" />
                  </div>
                </div>
              </template>
            </HoverCard>
          </div>

          <div class="ks-cell">
            <label class="ks-cell-label">四向放置 + 视口边缘自动翻转（拖窄窗口看效果）</label>
            <div class="tw:flex tw:flex-wrap tw:gap-3">
              <HoverCard v-for="p in (['top', 'right', 'bottom', 'left'] as const)" :key="p" :placement="p" :focusable="false">
                <Button :label="p" severity="secondary" variant="outlined" />
                <template #content>
                  期望方向 <code>{{ p }}</code>，放不下时翻到对侧。
                </template>
              </HoverCard>
            </div>
          </div>

          <div class="ks-cell">
            <label class="ks-cell-label">纯提示（interactive=false，面板不吃指针）· 长文本按 max-width 换行</label>
            <HoverCard :interactive="false" :focusable="false">
              <Button label="悬停看长文本" severity="secondary" variant="text" />
              <template #content>
                本卡片不接指针事件，鼠标划过即走。长内容按面板 max-width（320px）换行，适合批注全文、
                失败原因等只读信息；开合带 showDelay / hideDelay，指针扫过不会乱弹。
              </template>
            </HoverCard>
          </div>

          <div class="ks-cell">
            <label class="ks-cell-label">disabled — 不响应 hover / 焦点</label>
            <HoverCard disabled :focusable="false">
              <Button label="禁用中" severity="secondary" disabled />
              <template #content>不会出现</template>
            </HoverCard>
          </div>
        </div>
      </div>

      <div class="ks-block">
        <div id="feedback-confirm" class="ks-block-title">ConfirmDialog · 二次确认</div>
        <div class="ks-stage tw:gap-3">
          <Button label="删除（danger）" severity="danger" @click="confirmDanger" />
          <Button label="切换模型（warning）" severity="warn" @click="confirmWarning" />
          <Button label="启用功能（info）" severity="info" @click="confirmInfo" />
        </div>
      </div>
    </section>

    <section id="chapter-navigation" class="ks-chapter">
      <div class="ks-kicker">04 · Navigation</div>
      <h2 class="ks-h2">导航</h2>

      <div class="ks-block">
        <div id="navigation-segmented" class="ks-block-title">segmented · 胶囊轨道 + 品牌胶囊滑过去</div>
        <div class="ks-stage ks-stage--bar">
          <nav class="mw-segmented" aria-label="segmented 演示">
            <span class="mw-segmented-thumb" :style="shellSegThumbStyle" aria-hidden="true" />
            <button
              v-for="(item, index) in shellSegItems"
              :key="item.id"
              :ref="(el) => (shellSegEls[index] = el as HTMLElement | null)"
              type="button"
              class="mw-segmented-item"
              :class="shellSeg === item.id && 'mw-segmented-item--active'"
              @click="shellSeg = item.id"
            >
              <i :class="item.icon" />
              <span>{{ item.label }}</span>
            </button>
          </nav>
        </div>
        <p class="ks-note">
          两段共用一枚半透明胶囊轨道（<code>--material-hover</code> 岛面洗色——实心块会把玻璃材质打断），
          选中块是 liquid glass 品牌胶囊，按段位 <code>translateX</code> 滑过去。
        </p>
      </div>

      <div class="ks-block">
        <div id="navigation-breadcrumb" class="ks-block-title">Breadcrumb / Paginator / Menu</div>
        <div class="ks-stage ks-stage--col">
          <Breadcrumb :model="breadcrumbItems" :home="breadcrumbHome" />
          <Paginator
            v-model:first="demoPageFirst"
            v-model:rows="demoPageRows"
            :total-records="120"
            :rows-per-page-options="[10, 20, 50]"
            template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown JumpToPageInput"
            currentPageReportTemplate="第 {first} - {last} 条，共 {totalRecords} 条"
          />
          <div>
            <Button label="打开 Menu" icon="pi pi-bars" severity="secondary" @click="menu?.toggle($event)" />
            <Menu ref="menu" :model="menuItems" popup />
          </div>
          <p class="ks-note">
            裸 PrimeVue Menu：行内边距与 Listbox / Select 选项同档，hover 与键盘焦点态在玻璃面上走
            <code>--material-hover</code>。disabled 行与可用项同色不是漏改——这一族在 Aura 里只把 disabled
            处理成「不给 hover 反应」，没有置灰文字色的 token，整族淡化是一个跨组件决定。生产的右键 / kebab
            菜单契约（危险项染色、右列快捷键、置灰原因 tooltip）由 <code>ObjectMenuHost</code> 的
            <code>#item</code> 模板承载，验收去 Library 右键看；这里不放 ContextMenu demo——
            <code>ui:check</code> 禁止页面直连，它只有 ObjectMenuHost 一个宿主。
          </p>
        </div>
      </div>

      <div class="ks-block">
        <div id="navigation-stepper" class="ks-block-title">Stepper — 步骤条 / 线性工作流</div>
        <div class="ks-stage">
          <Stepper value="1" class="tw:w-full">
            <StepList>
              <Step value="1">上传文献</Step>
              <Step value="2">校对元数据</Step>
              <Step value="3">提取批注</Step>
            </StepList>
            <StepPanels>
              <StepPanel value="1">
                <div class="tw:p-4 tw:bg-surface tw:border tw:border-line tw:rounded-lg tw:min-h-[100px] tw:flex tw:flex-col tw:justify-between">
                  <p class="tw:text-muted tw:text-sm tw:m-0">第一步：拖拽 PDF 或图片文件到上传区域开始解析。</p>
                  <div class="tw:flex tw:justify-end tw:mt-4">
                    <Button label="下一步" size="small" icon="pi pi-arrow-right" icon-pos="right" />
                  </div>
                </div>
              </StepPanel>
            </StepPanels>
          </Stepper>
        </div>
      </div>
    </section>

    <section id="chapter-layout" class="ks-chapter">
      <div class="ks-kicker">05 · Layout</div>
      <h2 class="ks-h2">布局组件</h2>

      <div class="ks-block">
        <div id="layout-splitter" class="ks-block-title">Splitter · 可拖拽分栏</div>
        <div class="ks-stage">
          <Splitter class="tw:h-48 tw:w-full">
            <SplitterPanel :size="35" :min-size="20" class="ks-layout-panel">导航面板</SplitterPanel>
            <SplitterPanel :size="65" class="ks-layout-panel">内容面板</SplitterPanel>
          </Splitter>
        </div>
      </div>

      <div class="ks-block">
        <div id="layout-scroll-panel" class="ks-block-title">ScrollPanel · 局部滚动区域</div>
        <div class="ks-stage">
          <ScrollPanel class="tw:h-36 tw:w-full">
            <p v-for="n in 8" :key="n" class="tw:m-0 tw:px-4 tw:py-2 tw:text-sm">
              局部滚动内容 {{ n }}，页面与目录保持当前位置。
            </p>
          </ScrollPanel>
        </div>
      </div>
    </section>

    <ExtendedShowcase />

    </main>

    <Dialog v-model:visible="dialogOpen" modal header="确认删除" :style="{ width: '26rem' }">
      <p class="tw:text-muted tw:text-sm">删除后将移入回收站，30 天内可恢复。</p>
      <template #footer>
        <Button label="取消" variant="text" @click="dialogOpen = false" />
        <Button label="删除" severity="danger" @click="dialogOpen = false" />
      </template>
    </Dialog>

    <Drawer v-model:visible="drawerOpen" header="筛选" position="right">
      <p class="tw:text-muted tw:text-sm">抽屉内容区。</p>
    </Drawer>

    <Popover ref="popover">
      <div class="tw:text-sm tw:w-56">
        <div class="tw:font-medium tw:mb-1">引用预览</div>
        <p class="tw:text-muted tw:m-0">Rafailov et al., NeurIPS 2023.</p>
      </div>
    </Popover>
  </div>
  </div>
</template>

<style scoped>
.ks-root {
  /* 整页滚动禁用后长内容不再顶开 .mw-main：本页高度钉满主区、内部自滚
     （overflow 来自 mw-scroll，与 IconShowcase 同一模式）。 */
  flex: 1;
  min-height: 0;
  height: 100%;
  background: var(--color-bg);
  /* No `scroll-behavior: smooth` here: Chrome silently drops the fragment
     navigation scroll for far-off anchors inside a (nested) scroll container
     when it is smooth — the TOC links then do nothing. Instant scroll works. */
}

.ks {
  max-width: none;
  margin: 0;
  padding: 32px 32px 120px;
  display: flex;
  align-items: flex-start;
  gap: 32px;
}

.ks-hero {
  display: flex;
  align-items: center;
  gap: 14px;
  padding-bottom: 28px;
  border-bottom: 1px solid var(--color-border-subtle);
}

.ks-toc {
  position: sticky;
  top: 16px;
  /* 页内浮层层号：sticky 但不给 z-index，DOM 更靠后的定位元素（DataTable 吸顶
     表头 z:10、position:relative 的按钮、徽标 z:1）滚动时全画在它上面。取在演示区
     所有定位元素之上、全局浮层（--z-floating 900 / PrimeVue overlay 1100）之下。 */
  z-index: 20;
  flex: 0 0 208px;
  align-self: start;
  width: 208px;
  /* 自滚后 sticky 的是 .ks-root（可见高度 = 视口 − 顶栏带 − 沟缝），不是视口：
     按 100dvh 算会把最后几项钉到折叠线之下，够也够不着。 */
  max-height: calc(100dvh - var(--layout-topbar-height) - var(--canvas-gutter) * 3 - 32px);
  overflow-y: auto;
  margin-top: 40px;
  padding: 14px 16px 16px;
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-lg);
  background: var(--color-surface-base);
  box-shadow: var(--shadow-md);
}

.ks-content {
  flex: 1 1 auto;
  min-width: 0;
}

.ks-toc__head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 16px;
}

.ks-toc__hint {
  color: var(--color-text-tertiary);
  font-size: 12px;
}

/* 折叠只在窄屏有意义：桌面侧栏常驻展开，按钮不渲染 */
.ks-toc__toggle {
  display: none;
}

.ks-toc__grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 12px;
}

.ks-toc__group {
  min-width: 0;
}

.ks-toc__section,
.ks-toc__item {
  border-radius: var(--radius-xs);
  text-decoration: none;
  transition: color var(--motion-duration-fast) var(--motion-ease-standard),
    background var(--motion-duration-fast) var(--motion-ease-standard);
}

.ks-toc__section {
  display: inline-flex;
  color: var(--color-brand-700);
  font-size: 13px;
  font-weight: 600;
  line-height: 1.4;
}

.ks-toc__items {
  display: flex;
  flex-wrap: wrap;
  gap: 3px 6px;
  margin-top: 5px;
}

.ks-toc__item {
  padding: 2px 4px;
  color: var(--color-text-secondary);
  font-size: 11.5px;
  line-height: 1.4;
}

.ks-toc__section:hover,
.ks-toc__item:hover {
  background: var(--color-brand-50);
  color: var(--color-brand-700);
}

.ks-toc__section:focus-visible,
.ks-toc__item:focus-visible {
  outline: 0;
  box-shadow: var(--effect-focus-ring);
}

.ks-chapter {
  padding-top: 40px;
  scroll-margin-top: 20px;
}

.ks-block-title[id] {
  scroll-margin-top: 20px;
}

.ks-kicker {
  font-family: var(--font-family-mono);
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--color-brand-600);
}

.ks-h2 {
  margin: 8px 0 20px;
  font-size: 22px;
  font-weight: 700;
  letter-spacing: -0.015em;
}

.ks-block {
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-lg);
  background: var(--color-surface-base);
  box-shadow: var(--shadow-xs);
  padding: 18px 20px 22px;
  margin-bottom: 18px;
}

.ks-block-title {
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text-secondary);
  margin: 0 0 12px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.ks-block-title::after {
  content: "";
  flex: 1;
  height: 1px;
  background: var(--color-border-subtle);
}

.ks-block .ks-block-title:not(:first-child) {
  margin-top: 22px;
}

.ks-stage {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  align-items: flex-start;
  padding: 18px;
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-md);
  /* 舞台 = 演示件所坐的画布：跟 surface-base 走，深色下不再是白板。 */
  background: var(--color-surface-base);
}

.ks-stage + .ks-stage {
  margin-top: 12px;
}

.ks-note {
  margin: 0 0 12px;
  font-size: 12.5px;
  line-height: 1.6;
  color: var(--color-text-secondary);
}

.ks-note code {
  font-family: var(--font-family-mono);
  font-size: 11px;
  background: var(--color-bg-soft);
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-sm);
  padding: 1px 5px;
}

.ks-stage--col {
  flex-direction: column;
}

/* HoverCard 演示卡内容（面板内的富内容，宽度由内容决定） */
.ks-hovercard-demo {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 220px;
  max-width: 300px;
}

.ks-hovercard-demo__title {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-primary);
  line-height: 1.4;
}

.ks-hovercard-demo__meta {
  font-family: var(--font-family-mono);
  font-size: 11px;
  color: var(--color-text-tertiary);
}

.ks-hovercard-demo__body {
  margin: 2px 0 0;
  font-size: 12px;
  line-height: 1.6;
  color: var(--color-text-secondary);
}

.ks-hovercard-demo__actions {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}

.ks-cell {
  display: flex;
  flex-direction: column;
  gap: 7px;
  min-width: 220px;
}

.ks-cell-label {
  font-family: var(--font-family-mono);
  font-size: 10.5px;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--color-text-quaternary);
  font-weight: 500;
}

.ks-inline {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 13.5px;
  color: var(--color-text-primary);
}

.ks-swatch-row {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.ks-swatch {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.ks-swatch-chip {
  width: 56px;
  height: 40px;
  border-radius: var(--radius);
  border: 1px solid var(--color-border-subtle);
}

.ks-swatch code {
  font-family: var(--font-family-mono);
  font-size: 11px;
  color: var(--color-text-tertiary);
}

.ks-dot {
  display: inline-flex;
  align-items: center;
  padding: 6px 12px;
  border-radius: var(--radius-pill);
  /* 饱和面上的文字走 on-brand 语义（浅深两套都是深墨），别写死白。 */
  color: var(--color-text-on-brand);
  font-size: 12.5px;
  font-weight: 500;
}

.ks-layout-panel {
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-secondary);
}

@media (max-width: 900px) {
  .ks {
    flex-direction: column;
    gap: 16px;
    padding: 24px 16px 80px;
  }

  .ks-content {
    width: 100%;
  }

  .ks-toc {
    flex: 0 0 auto;
    position: sticky;
    top: 8px;
    width: 100%;
    max-height: 40vh;
    margin-top: 16px;
    transform: none;
    padding: 10px 12px;
  }

  .ks-toc__hint {
    display: none;
  }

  .ks-toc__toggle {
    display: inline-flex;
    align-items: center;
    min-height: 32px;
    padding: 0 12px;
    border: 1px solid var(--color-border-subtle);
    border-radius: var(--radius-sm);
    background: var(--color-bg-soft);
    color: var(--color-text-secondary);
    font-size: 12px;
  }

  /* 默认收起：整块导航有 30+ 项，展开就有 40vh 高的板子压在正文上 */
  .ks-toc__grid {
    display: none;
  }

  .ks-toc--open .ks-toc__grid {
    display: flex;
  }

  /* 收起后仍有一条吸顶栏，锚点留白按条高给，否则跳过去目标正好被压在底下 */
  .ks-chapter,
  .ks-block-title[id] {
    scroll-margin-top: 64px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .ks-toc__section,
  .ks-toc__item {
    transition: none;
  }
}

/* 单行横排舞台（工具条档 / segmented） */
.ks-stage--bar {
  align-items: center;
}

/* elevation 色阶 demo：只写层号，不写阴影 */
.ks-stage--elev {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
}

.ks-elev {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 14px 12px;
  border-radius: var(--radius);
  font-size: 12px;
}

.ks-elev code {
  font-family: var(--font-family-mono);
  font-size: 11.5px;
}

.ks-elev span {
  color: var(--color-text-secondary);
}

.ks-elev-0 {
  background: var(--elevation-0-surface);
  box-shadow: var(--elevation-0-shadow);
  outline: 1px dashed var(--color-border-strong);
}

.ks-elev-1 {
  background: var(--elevation-1-surface);
  box-shadow: var(--elevation-1-shadow);
  outline: 1px dashed var(--color-border-strong);
}

.ks-elev-2 {
  background: var(--elevation-2-surface);
  box-shadow: var(--elevation-2-shadow);
}

.ks-elev-3 {
  background: var(--elevation-3-surface);
  box-shadow: var(--elevation-3-shadow);
}

/* 分组卡列表 demo */
.ks-group-demo {
  width: 100%;
  max-width: 720px;
  --row-gap: 0.75rem;
}

.ks-group-row {
  position: relative;
  display: grid;
  grid-template-columns: 22px 44px minmax(0, 1fr) auto;
  gap: var(--row-gap);
  align-items: center;
  padding: 12px 16px;
  cursor: default;
}

.ks-group-row + .ks-group-row::before {
  content: "";
  position: absolute;
  top: 0;
  left: calc(22px + 44px + 2 * var(--row-gap) + 1rem);
  right: 1rem;
  height: 1px;
  background: var(--color-border-subtle);
}

.ks-group-row:hover {
  background: var(--color-bg-soft);
}

.ks-group-row--selected {
  background: var(--color-brand-50);
}

.ks-row-check {
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity var(--motion-duration-fast) var(--motion-ease-standard);
}

.ks-group-row:hover .ks-row-check,
.ks-group-row--selected .ks-row-check {
  opacity: 1;
}

.ks-row-thumb {
  width: 44px;
  height: 56px;
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-sm);
  background:
    repeating-linear-gradient(180deg, var(--color-border-strong) 0 2px, transparent 2px 8px);
}

.ks-row-main {
  min-width: 0;
}

.ks-star-on {
  color: var(--color-brand-500);
}

.ks-row-reveal {
  opacity: 0;
  transition: opacity var(--motion-duration-fast) var(--motion-ease-standard);
}

.ks-group-row:hover .ks-row-reveal,
.ks-group-row--selected .ks-row-reveal {
  opacity: 1;
}

/* DataView 演示行：分组卡里的一行，分隔线同样内缩到内容起点 */
.ks-dv-row {
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto auto;
  gap: 12px;
  align-items: center;
  padding: 10px 16px;
}

.ks-dv-row + .ks-dv-row::before {
  content: "";
  position: absolute;
  top: 0;
  left: 1rem;
  right: 1rem;
  height: 1px;
  background: var(--color-border-subtle);
}

.ks-dv-row:hover {
  background: var(--color-bg-soft);
}

.ks-dv-row__title {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 13.5px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.ks-dv-row__meta {
  font-family: var(--font-family-mono);
  font-size: 11.5px;
  color: var(--color-text-tertiary);
}
</style>
