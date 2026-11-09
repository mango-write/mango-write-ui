<script setup lang="ts">
import { computed, ref } from "vue";
import { MousePointerClick, Copy } from "lucide-vue-next";
import {
  Accordion,
  AccordionContent,
  AccordionHeader,
  AccordionPanel,
  AppLogo,
  Avatar,
  Badge,
  Button,
  Checkbox,
  DataTable,
  Dialog,
  Column,
  FormField,
  HoverCard,
  InputText,
  Message,
  Paginator,
  Popover,
  ProgressBar,
  Select,
  Skeleton,
  Slider,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Tag,
  ToggleSwitch,
  useNotify,
} from "@mango-write/ui-vue";
import CodeBlock from "../kit/CodeBlock.vue";
import TopBar from "../kit/TopBar.vue";
import { docGroups } from "../registry";
import { apiEntries } from "../api";
import { alt, locale, t, type Bi } from "../i18n";

const githubUrl = "https://github.com/mango-write/mango-write-ui";
const changelogUrl = `${githubUrl}/blob/main/CHANGELOG.md`;

/* 数字不手写:组件数、接口行数、规范篇数都从单一真相源统计,元数据更新即跟随。 */
const inventory = docGroups
  .filter((group) => group.base === "/components")
  .flatMap((group) => group.entries);
const componentCount = inventory.length;
/* 按 i % 3 轮转分作三行;中行反向滚动,与上下两行错开 */
const marqueeRows = [0, 1, 2].map((row) => inventory.filter((_, i) => i % 3 === row));
const apiRowCount = Object.values(apiEntries).reduce((sum, entry) => sum + entry.rows.length, 0);
const foundationCount = docGroups.find((group) => group.id === "foundations")?.entries.length ?? 0;

const s = {
  changelogChip: { zh: "v0.1.0 · 更新日志", en: "v0.1.0 · Changelog" },
  brand: { zh: "纸与霜", en: "Paper & Frost" },
  titleSuffix: { zh: "设计语言", en: " Design Language" },
  lede1: {
    zh: "MangoWrite 全线产品共用的设计语言与 Vue 3组件库：",
    en: "The design language and Vue 3 component library shared by every MangoWrite product:",
  },
  lede2: {
    zh: "纸面与霜面双材质，浅色深色双主题，为长时间阅读与写作而生。",
    en: "paper and frost materials, light and dark themes, built for long reading and writing sessions.",
  },
  quickStart: { zh: "快速上手", en: "Get started" },
  copyPrompt: { zh: "复制 Prompt 给 LLM", en: "Copy prompt for LLMs" },
  statComponents: { zh: "个组件", en: "components" },
  statApiRows: { zh: "个接口行", en: "API rows" },
  statNotes: { zh: "篇设计规范", en: "design notes" },
  statThemes: { zh: "套主题", en: "themes" },
  collageAria: { zh: "真组件拼贴:三张霜卡,可交互", en: "Live component collage: three frost cards, interactive" },
  darkMode: { zh: "深色模式", en: "Dark mode" },
  paperTitle: { zh: "论文标题", en: "Paper title" },
  titlePlaceholder: { zh: "给论文起个标题", en: "Name your paper" },
  autoSync: { zh: "自动同步", en: "Auto sync" },
  syncToCloud: { zh: "自动同步到云端", en: "Sync to the cloud automatically" },
  saveDraft: { zh: "保存草稿", en: "Save draft" },
  preview: { zh: "预览", en: "Preview" },
  liveSlider: { zh: "实时联动 · 拖动滑块", en: "Live linkage · drag the slider" },
  demoProgress: { zh: "示例进度", en: "Demo progress" },
  shareTeam: { zh: "共享给团队", en: "Share with team" },
  mango: { zh: "芒果写作", en: "MangoWrite" },
  statesFeedback: { zh: "状态与反馈", en: "States & feedback" },
  indexed: { zh: "已收录", en: "Indexed" },
  inReview: { zh: "评审中", en: "In review" },
  newComments: { zh: "3 条新批注", en: "3 new comments" },
  dedupDone: { zh: "文献去重完成,移除 2 条重复。", en: "Deduplication finished; 2 duplicates removed." },
  export: { zh: "导出", en: "Export" },
  keepWriting: { zh: "继续写作", en: "Keep writing" },
  marqueeAria: { zh: "组件清单", en: "Component list" },
  trialEyebrow: { zh: "试驾", en: "Hands-on" },
  trialTitle: { zh: "亲手试试我们的组件", en: "Try the components yourself" },
  allInteractive: { zh: "全部可交互", en: "Everything is live" },
  tabControls: { zh: "控件", en: "Inputs" },
  tabFeedback: { zh: "反馈", en: "Feedback" },
  tabOverlays: { zh: "浮层", en: "Overlays" },
  tabStructure: { zh: "结构", en: "Structure" },
  cellInput: { zh: "文本框", en: "Input" },
  composeHint: {
    zh: "输入法组合期间不回写,组合结束一次提交",
    en: "No writes while the IME is composing; one commit when it ends",
  },
  cellSelect: { zh: "下拉选择", en: "Select" },
  section: { zh: "章节", en: "Section" },
  pickSection: { zh: "选择章节", en: "Pick a section" },
  cellChecks: { zh: "复选与开关", en: "Checkboxes & switches" },
  cellSlider: { zh: "滑块", en: "Slider" },
  sliderNote: {
    zh: "当前值 {v} —— 拖动时,「反馈」页的进度条与首页霜卡同步走。",
    en: "Current value {v} — drag it and the progress bar on the Feedback tab and the hero frost card move in sync.",
  },
  cellToast: { zh: "轻提示", en: "Toasts" },
  toastOk: { zh: "保存成功", en: "Saved" },
  toastOkBody: { zh: "草稿已保存", en: "Draft saved" },
  toastOkDetail: { zh: "自动同步到云端。", en: "Synced to the cloud automatically." },
  toastWarn: { zh: "空间不足", en: "Storage low" },
  toastWarnBody: { zh: "存储空间不足", en: "Storage space is running low" },
  toastWarnDetail: { zh: "免费档位剩余 12%。", en: "12% left on the free tier." },
  toastErr: { zh: "校验失败", en: "Validation failed" },
  toastErrBody: { zh: "检查失败", en: "Check failed" },
  toastErrDetail: { zh: "3 处引用缺少年份。", en: "3 references are missing years." },
  toastNote: {
    zh: "通知从右上角滑入,悬停会暂停自动关闭。",
    en: "Toasts slide in from the top right; hovering pauses the auto-dismiss.",
  },
  cellMessage: { zh: "提示条", en: "Messages" },
  msgFormat: { zh: "引用格式已按 GB/T 7714 重排。", en: "Citations reformatted to GB/T 7714." },
  msgYears: { zh: "有 3 条来源缺少年份。", en: "3 sources are missing years." },
  cellProgress: { zh: "进度与骨架", en: "Progress & skeleton" },
  cellPopover: { zh: "弹出层", en: "Popover" },
  filterRefs: { zh: "筛选文献", en: "Filter references" },
  filter: { zh: "筛选", en: "Filter" },
  onlyFulltext: { zh: "仅全文", en: "Full text only" },
  withPdf: { zh: "附 PDF", en: "With PDF" },
  clear: { zh: "清除", en: "Clear" },
  cellHoverCard: { zh: "悬停卡片", en: "Hover card" },
  hoverCardBrand: { zh: "纸与霜设计语言", en: "The Paper & Frost design language" },
  hoverCardBody: {
    zh: "MangoWrite 全线产品共用,长文阅读不刺眼。",
    en: "Shared by every MangoWrite product; easy on the eyes for long reads.",
  },
  cellTooltip: { zh: "文字提示", en: "Tooltip" },
  hoverMe: { zh: "悬停我", en: "Hover me" },
  tooltipText: {
    zh: "悬停与聚焦都会展开,Escape 立即收起",
    en: "Opens on hover and focus; Escape dismisses instantly",
  },
  cellDialog: { zh: "对话框", en: "Dialog" },
  exportPdf: { zh: "导出为 PDF", en: "Export as PDF" },
  exportDesc: { zh: "包含全部正文与图表", en: "Includes all body text and figures" },
  exportBody: {
    zh: "导出范围与版式可在下一步确认。",
    en: "You can confirm the scope and layout in the next step.",
  },
  startExport: { zh: "开始导出", en: "Start export" },
  exportStarted: { zh: "已开始导出", en: "Export started" },
  exportStartedBody: {
    zh: "完成后会在通知中心提示你。",
    en: "We'll notify you in the notification center when it's done.",
  },
  cellTable: { zh: "数据表格", en: "Data table" },
  colTitle: { zh: "标题", en: "Title" },
  colVenue: { zh: "来源", en: "Venue" },
  colCited: { zh: "被引", en: "Citations" },
  cellAccordion: { zh: "折叠面板", en: "Accordion" },
  qStyles: { zh: "样式如何引入?", en: "How do I import the styles?" },
  aStyles: {
    zh: "聚合入口一次引入基础与组件样式,不需要按组件分批搬运。",
    en: "The aggregation entry pulls in base and component styles at once; no per-component hauling.",
  },
  qTree: { zh: "支持按需引入吗?", en: "Is tree-shaking supported?" },
  aTree: {
    zh: "支持。ESM 导出 + tree-shaking,没 import 的组件不会进产物。",
    en: "Yes. ESM exports plus tree-shaking keep un-imported components out of the bundle.",
  },
  cellPaginator: { zh: "分页", en: "Pagination" },
  papersPager: { zh: "文献分页", en: "References pagination" },
  pagerNote: { zh: "共 87 条 · 当前从第 {v} 条开始", en: "87 records · currently starting at record {v}" },
  llmEyebrow: { zh: "LLM 友好", en: "LLM friendly" },
  llmTitle: { zh: "把整库文档喂给任何模型", en: "Feed the whole library to any model" },
  llmDesc: {
    zh: "让 Agent 一键接入，快速使用 MangoWrite UI 开发优美应用。",
    en: "Let agents plug in with one click and build beautiful apps on MangoWrite UI fast.",
  },
  fileIndex: { zh: "入口索引", en: "Entry index" },
  fileFull: { zh: "整库单文件,一次读完", en: "The whole library in one file, one read" },
  fileApi: { zh: "单组件接口 + 示例,共 {n} 份", en: "Per-component API references, {n} files" },
  termHead: { zh: "终端 · 产物一览", en: "Terminal · artifacts" },
  featEyebrow: { zh: "纸与霜", en: "Paper & Frost" },
  featTitle: { zh: "我们的设计语言", en: "Our design language" },
  featDesc: { zh: "六层 token、双材质、双主题", en: "Six token layers, two materials, two themes" },
  light: { zh: "浅色", en: "Light" },
  dark: { zh: "深色", en: "Dark" },
  qsEyebrow: { zh: "接入", en: "Integrate" },
  qsTitle: { zh: "三行开始", en: "Three lines to start" },
  qsInstall: { zh: "安装依赖", en: "Install dependencies" },
  qsStyles: { zh: "在入口引入样式(聚合基础与组件样式)", en: "Import the styles at your entry (base and components aggregated)" },
  qsImport: { zh: "按需取用,想用哪个 import 哪个", en: "Import exactly the components you use" },
  qsRead: { zh: "阅读完整指引", en: "Read the full guide" },
  prodEyebrow: { zh: "实战", en: "In production" },
  prodTitle: { zh: "由它驱动的产品", en: "Products powered by it" },
  prodResearch: { zh: "芒果写作 · 科研平台", en: "MangoWrite · Research platform" },
  prodResearchBody: {
    zh: "AI 科研写作工作台:素材、理解、沉淀、写作、发布的数据闭环。",
    en: "The AI research writing workbench: a closed data loop from sources through understanding, notes, writing, to publishing.",
  },
  prodResearchCta: { zh: "前往科研平台 →", en: "Open the research platform →" },
  prodDeai: { zh: "芒果写作降 AI", en: "MangoWrite Rewrite" },
  prodDeaiBody: {
    zh: "论文降 AI 率、降 AIGC 率与 AI 率检测,改写全程可追溯。",
    en: "Lower AI-detection and AIGC scores with detection checks and fully traceable rewriting.",
  },
  prodDeaiCta: { zh: "前往降 AI →", en: "Open Rewrite →" },
  footer: { zh: "© 2026 MangoWrite · 以 Apache-2.0 发布", en: "© 2026 MangoWrite · Released under Apache-2.0" },
  footerAria: { zh: "机器可读文档", en: "Machine-readable docs" },
} as const;

/* 拼贴头像的字首示字:zh 用品牌字「芒」,en 用首字母 */
const mangoInitial = { zh: "芒", en: "M" } as const;
const paperGlyph = { zh: "纸", en: "Paper" } as const;
const frostGlyph = { zh: "霜", en: "Frost" } as const;
const cancel = { zh: "取消", en: "Cancel" } as const;

const stats = [
  { value: String(componentCount), label: s.statComponents },
  { value: String(apiRowCount), label: s.statApiRows },
  { value: String(foundationCount), label: s.statNotes },
  { value: "2", label: s.statThemes },
];

const features = [
  {
    demo: "tokens",
    title: { zh: "六层 Token 单源", en: "Six token layers, one source" },
    body: {
      zh: "颜色、文字、尺寸、圆角、层级、动效各占一层,var.css 是唯一数值来源,机械门禁禁止裸值——设计决策有据可查。",
      en: "Color, type, size, radius, elevation, and motion each get a layer; var.css is the only source of values and a mechanical gate bans raw ones — every design decision stays traceable.",
    },
  },
  {
    demo: "materials",
    title: { zh: "纸与霜双材质", en: "Paper & frost, two materials" },
    body: {
      zh: "纸面承载内容,霜面承载浮层;模糊、高光与投影成对出现,低性能与弱透明环境自动降级,压在哪都不脏。",
      en: "Paper carries content, frost carries overlays; blur, sheen, and shadow come in pairs and degrade automatically on low-power or weak-transparency environments — never muddy on any surface.",
    },
  },
  {
    demo: "themes",
    title: { zh: "浅深双主题", en: "Light & dark themes" },
    body: {
      zh: "每个语义色都有浅色基值与深色覆盖,跟随系统或手动指定;data-theme 可挂在任意子树,局部对照只需一个属性。",
      en: "Every semantic color has a light base and a dark override, following the system or a manual pick; data-theme scopes to any subtree, so local comparison takes one attribute.",
    },
  },
  {
    demo: "typescript",
    title: { zh: "TypeScript 全量", en: "Fully typed" },
    body: {
      zh: "全部 props、事件与插槽都有类型,示例代码可以直接粘进 lang=\"ts\" 的 SFC;接口表与类型同源维护。",
      en: "Every prop, event, and slot is typed; sample code pastes straight into a lang=\"ts\" SFC, and API tables are maintained from the same source as the types.",
    },
  },
  {
    demo: "a11y",
    title: { zh: "无障碍内建", en: "Accessibility built in" },
    body: {
      zh: "原生语义打底,aria 落点、焦点环与键盘路径开箱即用;触控目标不小于 44px,聚焦态永远看得见。",
      en: "Native semantics first: aria targets, focus rings, and keyboard paths work out of the box; touch targets stay at 44px and focus is always visible.",
    },
  },
  {
    demo: "tree",
    title: { zh: "按需引入", en: "Import on demand" },
    body: {
      zh: "ESM 导出,tree-shaking 只打包你 import 的组件;样式单文件一次引入,不需要按组件分批搬运。",
      en: "ESM exports plus tree-shaking bundle only what you import; styles arrive as one file — no per-component hauling.",
    },
  },
] as const;

/* 试驾区状态:每个面板都是真的在跑。 */
const playgroundTab = ref("controls");
const demoTitle = ref("");
const demoSection = ref<string>();
/* Select 按 option-label 渲染,选项标签取词后传入 */
const sectionOptions = computed(() => [
  { label: t({ zh: "摘要与关键词", en: "Abstract & keywords" }), value: "abstract" },
  { label: t({ zh: "引言与文献综述", en: "Introduction & related work" }), value: "intro" },
  { label: t({ zh: "理论背景与假设", en: "Background & hypotheses" }), value: "theory" },
  { label: t({ zh: "数据采集与预处理", en: "Data collection & preprocessing" }), value: "data" },
  { label: t({ zh: "材料与方法", en: "Materials & methods" }), value: "methods" },
  { label: t({ zh: "实验结果与消融分析", en: "Results & ablation" }), value: "results" },
  { label: t({ zh: "讨论与研究局限", en: "Discussion & limitations" }), value: "discussion" },
  { label: t({ zh: "结论与未来工作", en: "Conclusion & future work" }), value: "conclusion" },
  { label: t({ zh: "附录与开源说明", en: "Appendix & open-source notes" }), value: "appendix" },
]);
const demoShare = ref(false);
const demoSync = ref(true);
const demoProgress = ref(64);

const notify = useNotify();

/* 给 LLM 的随身 prompt:一键复制,贴进任何模型对话,让它先读整库文档再动手。 */
const llmsFullUrl = "https://ui.mangowrite.com/llms-full.txt";
const llmPrompt = computed(() =>
  t({
    zh: `请先阅读 ${llmsFullUrl} —— 这是 MangoWrite UI(「纸与霜」设计语言的 Vue 3 组件库)的全量文档。读完后,用它的组件与设计 token 实现我接下来的界面需求。`,
    en: `Start by reading ${llmsFullUrl} — the complete docs for MangoWrite UI, the Vue 3 component library of the Paper & Frost design language. Then build my next UI request with its components and design tokens.`,
  }),
);
async function copyLlmPrompt() {
  try {
    await navigator.clipboard.writeText(llmPrompt.value);
    notify.success(t(s.copyPrompt), t({ zh: "粘贴到你的 LLM 对话,让它先读文档再动手。", en: "Paste it into your LLM chat so it reads the docs first." }));
  } catch {
    notify.warn(
      t({ zh: "复制失败", en: "Copy failed" }),
      t({ zh: "浏览器拒绝了剪贴板权限,请手动打开 llms-full.txt 复制。", en: "The browser denied clipboard access; open llms-full.txt and copy manually." }),
    );
  }
}
const filterFulltext = ref(true);
const filterPdf = ref(false);
const exportOpen = ref(false);
const accordionValue = ref<string | null>("import");
const paginatorFirst = ref(0);

/* DataTable 直读字符串字段,假数据按当前语言整体重建 */
const papers = computed(() => [
  { id: 1, title: t({ zh: "引文锚点与偏移坐标系", en: "Citation anchors and offset coordinate systems" }), venue: t({ zh: "情报学报", en: "J. Inf. Sci." }), cited: 12 },
  { id: 2, title: t({ zh: "长文档分段改写的一致性", en: "Consistency in sectioned long-document rewriting" }), venue: t({ zh: "中文信息学报", en: "J. Chin. Inf. Process." }), cited: 23 },
  { id: 3, title: t({ zh: "协同编辑中的操作合并", en: "Operation merging in collaborative editing" }), venue: "CHI", cited: 8 },
  { id: 4, title: t({ zh: "多模态图表抽取", en: "Multimodal figure extraction" }), venue: "ICDAR", cited: 5 },
]);

/* 快速上手示例(字符串里的闭合标签要转义,避免截断 SFC)。 */
const quickstartCode = computed(() =>
  [
    `<script setup lang="ts">`,
    `import { Button } from "@mango-write/ui-vue";`,
    `<\/script>`,
    ``,
    `<template>`,
    `  <Button label="${t({ zh: "你好,纸与霜", en: "Hello, Paper & Frost" })}" />`,
    `</template>`,
  ].join("\n"),
);
</script>

<template>
  <div class="landing">
    <TopBar />

    <main class="landing-main">
      <div class="landing-container">
        <!-- 首屏:文案 + 真组件霜卡拼贴 -->
        <section class="hero">
        <div class="hero__stage" aria-hidden="true">
          <i class="hero__glow hero__glow--a" />
          <i class="hero__glow hero__glow--b" />
          <i class="hero__glow hero__glow--c" />
          <i class="hero__dots" />
        </div>
        <div class="hero__grid">
          <div class="hero__copy">
            <div class="hero__chips anim-rise" style="--rise-delay: 40ms">
              <a class="hero__chip" :href="changelogUrl" target="_blank" rel="noreferrer">
                {{ t(s.changelogChip) }}
              </a>
              <span class="hero__chip">Apache-2.0</span>
              <span class="hero__chip">Vue 3 · TypeScript</span>
            </div>
            <h1 class="hero__title anim-rise" style="--rise-delay: 120ms">
              <span class="hero__title-ink">{{ t(s.brand) }}</span>{{ t(s.titleSuffix) }}
            </h1>
            <p class="hero__lede anim-rise" style="--rise-delay: 200ms">
              {{ t(s.lede1) }}
              <br />
              {{ t(s.lede2) }}
            </p>
            <div class="hero__cta anim-rise" style="--rise-delay: 280ms">
              <RouterLink class="hero__cta-primary" to="/getting-started/installation">
                {{ t(s.quickStart) }}
              </RouterLink>
              <a class="hero__cta-ghost" :href="githubUrl" target="_blank" rel="noreferrer">
                GitHub
              </a>
              <button type="button" class="hero__cta-ghost" @click="copyLlmPrompt">
                <Copy :size="18" aria-hidden="true" />
                {{ t(s.copyPrompt) }}
              </button>
            </div>
            <dl class="hero__stats anim-rise" style="--rise-delay: 360ms">
              <div v-for="stat in stats" :key="stat.label.en" class="hero__stats-item">
                <dt class="hero__stats-value">{{ stat.value }}</dt>
                <dd class="hero__stats-label">{{ t(stat.label) }}</dd>
              </div>
            </dl>
          </div>

          <div class="collage" role="group" :aria-label="t(s.collageAria)">
            <i class="collage__under" aria-hidden="true">
              <i class="collage__blob collage__blob--a" />
              <i class="collage__blob collage__blob--b" />
              <i class="collage__blob collage__blob--c" />
              <i class="collage__blob collage__blob--d" />
            </i>
            <div
              class="collage-card collage-card--a mw-frost anim-rise"
              data-theme="dark"
              style="--rise-delay: 300ms; --bob-delay: 0s; --bob-dur: 8s"
            >
              <span class="collage-card__label">{{ t(s.darkMode) }}</span>
              <FormField v-slot="{ inputId }" input-id="collage-title" :label="t(s.paperTitle)" required>
                <InputText
                  v-model="demoTitle"
                  :id="inputId"
                  :placeholder="t(s.titlePlaceholder)"
                  size="sm"
                  fluid
                />
              </FormField>
              <label class="collage-card__check">
                <ToggleSwitch v-model="demoSync" :aria-label="t(s.autoSync)" />
                <span>{{ t(s.syncToCloud) }}</span>
              </label>
              <div class="collage-card__actions">
                <Button size="sm" :label="t(s.saveDraft)" />
                <Button size="sm" variant="text" severity="secondary" :label="t(s.preview)" />
              </div>
            </div>

            <div
              class="collage-card collage-card--b mw-frost anim-rise"
              style="--rise-delay: 420ms; --bob-delay: -2.5s; --bob-dur: 7s"
            >
              <span class="collage-card__label">{{ t(s.liveSlider) }}</span>
              <Slider v-model="demoProgress" :max="100" :aria-label="t(s.demoProgress)" />
              <ProgressBar :value="demoProgress" />
              <div class="collage-card__row">
                <label class="collage-card__check">
                  <Checkbox v-model="demoShare" binary :aria-label="t(s.shareTeam)" />
                  <span>{{ t(s.shareTeam) }}</span>
                </label>
                <Avatar :label="t(mangoInitial)" shape="circle" size="sm" :aria-label="t(s.mango)" />
              </div>
            </div>

            <div
              class="collage-card collage-card--c mw-frost anim-rise"
              style="--rise-delay: 540ms; --bob-delay: -5s; --bob-dur: 9s"
            >
              <span class="collage-card__label">{{ t(s.statesFeedback) }}</span>
              <div class="collage-card__tags">
                <Tag :value="t(s.indexed)" severity="success" rounded />
                <Tag :value="t(s.inReview)" severity="warn" rounded />
                <Badge value="3" severity="info" size="sm" :aria-label="t(s.newComments)" />
              </div>
              <Message severity="success">{{ t(s.dedupDone) }}</Message>
              <div class="collage-card__actions">
                <Button size="sm" variant="outlined" severity="secondary" :label="t(s.export)" />
                <Button size="sm" :label="t(s.keepWriting)" />
              </div>
            </div>
          </div>
        </div>
        </section>
      </div>

      <!-- 组件清单:一条霜带里的三行真实目录跑马灯,每一枚都链到对应文档 -->
      <div class="mq mw-frost" :aria-label="t(s.marqueeAria)">
        <div
          v-for="(row, i) in marqueeRows"
          :key="'mq-row-' + i"
          class="mq__row"
          :class="{ 'mq__row--reverse': i === 1 }"
          data-scroll-fade-x="both"
          :style="i === 1 ? { '--mq-delay': '-30s' } : undefined"
        >
          <div class="mq__track">
            <ul class="mq__list">
              <li v-for="entry in row" :key="entry.slug">
                <RouterLink :to="`/components/${entry.slug}`" class="mq__item">
                  <b>{{ alt(entry.title, locale) }}</b>
                  <span>{{ t(entry.title) }}</span>
                </RouterLink>
              </li>
            </ul>
            <ul class="mq__list" aria-hidden="true">
              <li v-for="entry in row" :key="'dup-' + entry.slug">
                <RouterLink :to="`/components/${entry.slug}`" class="mq__item" tabindex="-1">
                  <b>{{ alt(entry.title, locale) }}</b>
                  <span>{{ t(entry.title) }}</span>
                </RouterLink>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div class="landing-container">
        <!-- 试驾区 -->
        <section class="sec">
        <header class="sec__head">
          <div>
            <p class="sec__eyebrow">{{ t(s.trialEyebrow) }}</p>
            <h2 class="sec__title">{{ t(s.trialTitle) }}</h2>
          </div>
          <span class="pg-hint"><MousePointerClick :size="14" aria-hidden="true" />{{ t(s.allInteractive) }}</span>
        </header>

        <div class="pg">
          <Tabs v-model:value="playgroundTab">
            <TabList>
              <Tab value="controls">{{ t(s.tabControls) }}</Tab>
              <Tab value="feedback">{{ t(s.tabFeedback) }}</Tab>
              <Tab value="overlays">{{ t(s.tabOverlays) }}</Tab>
              <Tab value="structure">{{ t(s.tabStructure) }}</Tab>
            </TabList>
            <TabPanels>
              <TabPanel value="controls">
                <div class="pg__grid">
                  <div class="pg-cell">
                    <h3 class="pg-cell__label">{{ t(s.cellInput) }}</h3>
                    <FormField
                      v-slot="{ inputId, describedBy }"
                      input-id="pg-title"
                      :label="t(s.paperTitle)"
                      :hint="t(s.composeHint)"
                    >
                      <InputText
                        v-model="demoTitle"
                        :id="inputId"
                        :aria-describedby="describedBy"
                        :placeholder="t(s.paperTitle)"
                        fluid
                      />
                    </FormField>
                  </div>
                  <div class="pg-cell">
                    <h3 class="pg-cell__label">{{ t(s.cellSelect) }}</h3>
                    <FormField v-slot="{ inputId }" input-id="pg-section" :label="t(s.section)">
                      <Select
                        v-model="demoSection"
                        :id="inputId"
                        :options="sectionOptions"
                        option-label="label"
                        option-value="value"
                        :placeholder="t(s.pickSection)"
                        show-clear
                        fluid
                      />
                    </FormField>
                  </div>
                  <div class="pg-cell">
                    <h3 class="pg-cell__label">{{ t(s.cellChecks) }}</h3>
                    <div class="pg-stack">
                      <label class="pg-check">
                        <Checkbox v-model="demoShare" binary :aria-label="t(s.shareTeam)" />
                        <span>{{ t(s.shareTeam) }}</span>
                      </label>
                      <label class="pg-check">
                        <ToggleSwitch v-model="demoSync" :aria-label="t(s.autoSync)" />
                        <span>{{ t(s.syncToCloud) }}</span>
                      </label>
                    </div>
                  </div>
                  <div class="pg-cell">
                    <h3 class="pg-cell__label">{{ t(s.cellSlider) }}</h3>
                    <Slider v-model="demoProgress" :max="100" :aria-label="t(s.demoProgress)" />
                    <p class="pg-note">{{ t(s.sliderNote).replace("{v}", String(demoProgress)) }}</p>
                  </div>
                </div>
              </TabPanel>

              <TabPanel value="feedback">
                <div class="pg__grid">
                  <div class="pg-cell">
                    <h3 class="pg-cell__label">{{ t(s.cellToast) }}</h3>
                    <div class="pg__row">
                      <Button
                        size="sm"
                        severity="success"
                        :label="t(s.toastOk)"
                        @click="notify.success(t(s.toastOkBody), t(s.toastOkDetail))"
                      />
                      <Button
                        size="sm"
                        severity="warning"
                        :label="t(s.toastWarn)"
                        @click="notify.warn(t(s.toastWarnBody), t(s.toastWarnDetail))"
                      />
                      <Button
                        size="sm"
                        severity="danger"
                        :label="t(s.toastErr)"
                        @click="notify.error(t(s.toastErrBody), t(s.toastErrDetail))"
                      />
                    </div>
                    <p class="pg-note">{{ t(s.toastNote) }}</p>
                  </div>
                  <div class="pg-cell">
                    <h3 class="pg-cell__label">{{ t(s.cellMessage) }}</h3>
                    <div class="pg-stack">
                      <Message severity="info">{{ t(s.msgFormat) }}</Message>
                      <Message severity="success">{{ t(s.dedupDone) }}</Message>
                      <Message severity="warn">{{ t(s.msgYears) }}</Message>
                    </div>
                  </div>
                  <div class="pg-cell">
                    <h3 class="pg-cell__label">{{ t(s.cellProgress) }}</h3>
                    <ProgressBar :value="demoProgress" />
                    <div class="pg-skeleton">
                      <Skeleton shape="circle" size="40px" aria-hidden="true" />
                      <div class="pg-skeleton__lines">
                        <Skeleton width="100%" height="14px" aria-hidden="true" />
                        <Skeleton width="64%" height="14px" aria-hidden="true" />
                      </div>
                    </div>
                  </div>
                </div>
              </TabPanel>

              <TabPanel value="overlays">
                <div class="pg__row pg__row--wrap">
                  <div class="pg-cell pg-cell--inline">
                    <h3 class="pg-cell__label">{{ t(s.cellPopover) }}</h3>
                    <Popover :aria-label="t(s.filterRefs)">
                      <template #trigger>
                        <Button variant="outlined" severity="secondary" :label="t(s.filter)" />
                      </template>
                      <div class="pg-stack">
                        <label class="pg-check">
                          <Checkbox v-model="filterFulltext" binary :aria-label="t(s.onlyFulltext)" />
                          <span>{{ t(s.onlyFulltext) }}</span>
                        </label>
                        <label class="pg-check">
                          <Checkbox v-model="filterPdf" binary :aria-label="t(s.withPdf)" />
                          <span>{{ t(s.withPdf) }}</span>
                        </label>
                        <Button
                          variant="text"
                          severity="secondary"
                          size="sm"
                          :label="t(s.clear)"
                          @click="filterFulltext = false; filterPdf = false"
                        />
                      </div>
                    </Popover>
                  </div>
                  <div class="pg-cell pg-cell--inline">
                    <h3 class="pg-cell__label">{{ t(s.cellHoverCard) }}</h3>
                    <HoverCard placement="top">
                      <span class="pg-anchor">{{ t(s.mango) }}</span>
                      <template #content>
                        <div class="pg-hovercard">
                          <AppLogo />
                          <div>
                            <strong>{{ t(s.hoverCardBrand) }}</strong>
                            <p>{{ t(s.hoverCardBody) }}</p>
                          </div>
                        </div>
                      </template>
                    </HoverCard>
                  </div>
                  <div class="pg-cell pg-cell--inline">
                    <h3 class="pg-cell__label">{{ t(s.cellTooltip) }}</h3>
                    <Button
                      variant="text"
                      severity="secondary"
                      :label="t(s.hoverMe)"
                      v-tooltip="t(s.tooltipText)"
                    />
                  </div>
                  <div class="pg-cell pg-cell--inline">
                    <h3 class="pg-cell__label">{{ t(s.cellDialog) }}</h3>
                    <Button :label="t(s.exportPdf)" @click="exportOpen = true" />
                  </div>
                </div>
              </TabPanel>

              <TabPanel value="structure">
                <div class="pg__grid pg__grid--two">
                  <div class="pg-cell pg-cell--wide">
                    <h3 class="pg-cell__label">{{ t(s.cellTable) }}</h3>
                    <DataTable :value="papers" data-key="id" striped-rows row-hover>
                      <Column field="title" :header="t(s.colTitle)" sortable />
                      <Column field="venue" :header="t(s.colVenue)" />
                      <Column field="cited" :header="t(s.colCited)" sortable />
                    </DataTable>
                  </div>
                  <div class="pg-cell">
                    <h3 class="pg-cell__label">{{ t(s.cellAccordion) }}</h3>
                    <Accordion v-model:value="accordionValue">
                      <AccordionPanel value="import">
                        <AccordionHeader>{{ t(s.qStyles) }}</AccordionHeader>
                        <AccordionContent>
                          <code class="pg-code">import "@mango-write/ui-vue/theme.css"</code>
                          {{ t(s.aStyles) }}
                        </AccordionContent>
                      </AccordionPanel>
                      <AccordionPanel value="tree">
                        <AccordionHeader>{{ t(s.qTree) }}</AccordionHeader>
                        <AccordionContent>
                          {{ t(s.aTree) }}
                        </AccordionContent>
                      </AccordionPanel>
                    </Accordion>
                  </div>
                  <div class="pg-cell">
                    <h3 class="pg-cell__label">{{ t(s.cellPaginator) }}</h3>
                    <Paginator
                      v-model:first="paginatorFirst"
                      :rows="10"
                      :total-records="87"
                      :aria-label="t(s.papersPager)"
                    />
                    <p class="pg-note" style="text-align: center;">{{ t(s.pagerNote).replace("{v}", String(paginatorFirst + 1)) }}</p>
                  </div>
                </div>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </div>

        <Dialog v-model:open="exportOpen" :title="t(s.exportPdf)" :description="t(s.exportDesc)">
          <p class="pg-dialog-body">{{ t(s.exportBody) }}</p>
          <template #footer>
            <Button variant="text" severity="secondary" :label="t(cancel)" @click="exportOpen = false" />
            <Button
              :label="t(s.startExport)"
              @click="
                exportOpen = false;
                notify.success(t(s.exportStarted), t(s.exportStartedBody));
              "
            />
          </template>
        </Dialog>
      </section>

        <!-- LLM 产物:固定墨色舞台 -->
        <section class="sec">
        <div class="llm">
          <div class="llm__copy">
            <p class="llm__eyebrow">{{ t(s.llmEyebrow) }}</p>
            <h2 class="llm__title">{{ t(s.llmTitle) }}</h2>
            <p class="llm__desc">
              {{ t(s.llmDesc) }}
            </p>
            <ul class="llm__files">
              <li>
                <a href="/llms.txt" target="_blank" rel="noreferrer">llms.txt</a>
                <span>{{ t(s.fileIndex) }}</span>
              </li>
              <li>
                <a href="/llms-full.txt" target="_blank" rel="noreferrer">llms-full.txt</a>
                <span>{{ t(s.fileFull) }}</span>
              </li>
              <li>
                <a href="/api/button.md" target="_blank" rel="noreferrer">api/button.md</a>
                <span>{{ t(s.fileApi).replace("{n}", String(componentCount)) }}</span>
              </li>
            </ul>
          </div>
          <div class="llm__term" :aria-label="t(s.termHead)">
            <p class="llm__term-head">{{ t(s.termHead) }}</p>
            <!-- i18n-allow:start 终端示意是 llms-full.txt 产物原貌,产物保持中文 -->
            <pre v-scroll-fade.sm class="llm__term-body mw-scroll"><span>$ ls</span>
api/            llms.txt
CHANGELOG.md    llms-full.txt
<span>$ head -6 llms-full.txt</span>
# @mango-write/ui-vue · 纸与霜设计语言
Vue 3 组件库 · {{ componentCount }} 组件 · Apache-2.0
## 按钮 Button
| 名称 | 取值 | 说明 |
| --- | --- | --- |
| variant | primary · outlined · text | 视觉变体…</pre>
            <!-- i18n-allow:end -->
          </div>
        </div>
      </section>

      <!-- 特性 -->
      <section class="sec">
        <header class="sec__head">
          <div>
            <p class="sec__eyebrow">{{ t(s.featEyebrow) }}</p>
            <h2 class="sec__title">{{ t(s.featTitle) }}</h2>
            <p class="sec__desc">{{ t(s.featDesc) }}</p>
          </div>
        </header>
        <div class="feat__grid">
          <article v-for="feature in features" :key="feature.demo" class="feat">
            <div class="feat__demo" aria-hidden="true">
              <div v-if="feature.demo === 'tokens'" class="feat-tokens">
                <i class="feat-tokens__dot" data-c="accent" />
                <i class="feat-tokens__dot" data-c="success" />
                <i class="feat-tokens__dot" data-c="warning" />
                <i class="feat-tokens__dot" data-c="info" />
                <i class="feat-tokens__dot" data-c="danger" />
                <code>--accent</code>
              </div>
              <div v-else-if="feature.demo === 'materials'" class="feat-mats">
                <span class="feat-mats__paper">{{ t(paperGlyph) }}</span>
                <span class="feat-mats__frost mw-frost">{{ t(frostGlyph) }}</span>
              </div>
              <div v-else-if="feature.demo === 'themes'" class="feat-themes">
                <span class="feat-themes__half" data-theme="light">
                  <i /><b>{{ t(s.light) }}</b>
                </span>
                <span class="feat-themes__half" data-theme="dark">
                  <i /><b>{{ t(s.dark) }}</b>
                </span>
              </div>
              <code v-else-if="feature.demo === 'typescript'" class="feat__code">
                &lt;Button variant="outlined" /&gt;
              </code>
              <div v-else-if="feature.demo === 'a11y'" class="feat-focus">
                <span class="feat-focus__ring">focus-visible</span>
              </div>
              <code v-else class="feat__code">import { Button } from "@mango-write/ui-vue"</code>
            </div>
            <h3 class="feat__title">{{ t(feature.title) }}</h3>
            <p class="feat__body">{{ t(feature.body) }}</p>
          </article>
        </div>
      </section>

      <!-- 快速上手 -->
      <section class="sec">
        <div class="qs">
          <div class="qs__copy">
            <p class="sec__eyebrow">{{ t(s.qsEyebrow) }}</p>
            <h2 class="sec__title">{{ t(s.qsTitle) }}</h2>
            <ol class="qs__steps">
              <li>
                <code>pnpm add @mango-write/ui-vue</code>
                <span>{{ t(s.qsInstall) }}</span>
              </li>
              <li>
                <code>import "@mango-write/ui-vue/theme.css"</code>
                <span>{{ t(s.qsStyles) }}</span>
              </li>
              <li>
                <code>import { Button } from "@mango-write/ui-vue"</code>
                <span>{{ t(s.qsImport) }}</span>
              </li>
            </ol>
            <RouterLink class="hero__cta-primary" to="/getting-started/installation">
              {{ t(s.qsRead) }}
            </RouterLink>
          </div>
          <div class="qs__code">
            <CodeBlock title="App.vue" :code="quickstartCode" />
          </div>
        </div>
      </section>

      <!-- 由它驱动的产品 -->
      <section class="sec">
        <header class="sec__head">
          <div>
            <p class="sec__eyebrow">{{ t(s.prodEyebrow) }}</p>
            <h2 class="sec__title">{{ t(s.prodTitle) }}</h2>
          </div>
        </header>
        <div class="prod__grid">
          <a
            class="prod mw-frost"
            href="https://mangowrite.com"
            target="_blank"
            rel="noreferrer"
          >
            <h3 class="prod__title">{{ t(s.prodResearch) }}</h3>
            <p class="prod__body">{{ t(s.prodResearchBody) }}</p>
            <span class="prod__cta">{{ t(s.prodResearchCta) }}</span>
          </a>
          <a
            class="prod mw-frost"
            href="https://rewrite.mangowrite.com"
            target="_blank"
            rel="noreferrer"
          >
            <h3 class="prod__title">{{ t(s.prodDeai) }}</h3>
            <p class="prod__body">{{ t(s.prodDeaiBody) }}</p>
            <span class="prod__cta">{{ t(s.prodDeaiCta) }}</span>
          </a>
        </div>
      </section>
      </div>
    </main>

    <footer class="landing-footer">
      <span>{{ t(s.footer) }}</span>
      <nav class="landing-footer__links" :aria-label="t(s.footerAria)">
        <a href="/llms.txt" target="_blank" rel="noreferrer">llms.txt</a>
        <a href="/llms-full.txt" target="_blank" rel="noreferrer">llms-full.txt</a>
        <a :href="githubUrl" target="_blank" rel="noreferrer">github.com/mango-write/mango-write-ui</a>
      </nav>
    </footer>
  </div>
</template>

<style scoped>
.landing {
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  background: var(--bg-canvas);
  color: var(--text-primary);
}

/* ── 首屏 ─────────────────────────────────────────── */
.landing-main {
  flex: 1;
  width: 100%;
  display: flex;
  flex-direction: column;
  padding: 0 0 var(--space-12);
}

.landing-container {
  width: 100%;
  max-width: var(--container-content);
  margin: 0 auto;
  padding: 0 var(--space-6);
  box-sizing: border-box;
}

.hero {
  position: relative;
  overflow: clip;
  padding: var(--space-10) 0 var(--space-8);
}

.hero__stage {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
}

.hero__glow {
  position: absolute;
  border-radius: var(--radius-full);
}

/* 光斑溢出量必须小于 (尺寸 − 0.7×半径)/2 的安全余量,否则会在 overflow:clip 处留下硬切线 */
.hero__glow--a {
  top: calc(var(--space-16) * -1);
  right: calc(var(--space-16) * -1);
  width: calc(var(--space-20) * 7);
  height: calc(var(--space-20) * 7);
  background: radial-gradient(closest-side, color-mix(in srgb, var(--accent) 16%, transparent), transparent 72%);
}

.hero__glow--b {
  bottom: calc(var(--space-16) * -1);
  left: calc(var(--space-16) * -1);
  width: calc(var(--space-20) * 6);
  height: calc(var(--space-20) * 6);
  background: radial-gradient(closest-side, color-mix(in srgb, var(--accent-pressed) 10%, transparent), transparent 70%);
}

.hero__glow--c {
  top: calc(var(--space-16));
  left: calc(var(--space-20) * 3);
  width: calc(var(--space-20) * 4);
  height: calc(var(--space-20) * 4);
  background: radial-gradient(closest-side, color-mix(in srgb, var(--info) 8%, transparent), transparent 70%);
}

.hero__dots {
  position: absolute;
  inset: 0;
  background-image: radial-gradient(color-mix(in srgb, var(--ink-rgb) 15%, transparent) 1px, transparent 1px);
  background-size: var(--space-4) var(--space-4);
  -webkit-mask-image: linear-gradient(to bottom, color-mix(in srgb, var(--text-primary) 85%, transparent), transparent 82%);
  mask-image: linear-gradient(to bottom, color-mix(in srgb, var(--text-primary) 85%, transparent), transparent 82%);
}

.hero__grid {
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 1.04fr) minmax(0, 0.96fr);
  gap: var(--space-10);
  align-items: center;
}

.hero__copy {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--space-4);
}

.hero__chips {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.hero__chip {
  display: inline-flex;
  align-items: center;
  height: var(--size-sm-h);
  padding: 0 var(--space-2-5);
  border: var(--border-width) solid var(--border-subtle);
  border-radius: var(--radius-full);
  background: var(--bg-surface);
  color: var(--text-secondary);
  font-size: var(--type-caption-size);
  line-height: var(--type-caption-line);
  text-decoration: none;
}

a.hero__chip:hover {
  border-color: var(--border-strong);
  color: var(--text-primary);
}

.hero__title {
  margin: 0;
  font-family: var(--font-serif);
  font-size: calc(var(--type-display-lg-size) * 1.45);
  line-height: var(--type-display-lg-line);
  font-weight: var(--weight-bold);
  letter-spacing: var(--tracking-display);
}

.hero__title-ink {
  background-image: linear-gradient(104deg, var(--accent) 20%, var(--text-accent) 88%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.hero__lede {
  margin: 0;
  max-width: 38em;
  font-size: var(--type-body-lg-size);
  line-height: var(--type-body-lg-line);
  color: var(--text-secondary);
}

.hero__cta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-3);
}

.hero__cta-primary,
.hero__cta-ghost {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  height: var(--size-lg-h);
  padding: 0 var(--size-lg-px);
  border-radius: var(--size-lg-radius);
  font-size: var(--size-lg-font);
  font-weight: var(--weight-medium);
  text-decoration: none;
}

.hero__cta-primary {
  background: var(--accent);
  color: var(--text-on-accent);
}

.hero__cta-primary:hover {
  background: var(--accent-hover);
}

.hero__cta-primary:active {
  background: var(--accent-pressed);
}

.hero__cta-ghost {
  border: var(--border-width) solid var(--border-default);
  color: var(--text-primary);
}

/* 同一样式给 <button> 复用(复制 Prompt):重置原生底色与字体。 */
button.hero__cta-ghost {
  background: transparent;
  cursor: pointer;
  font-family: inherit;
}

.hero__cta-ghost:hover {
  background: var(--fill-default);
}

.hero__stats {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-8);
  margin: var(--space-2) 0 0;
}

.hero__stats-item {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.hero__stats-value {
  font-size: var(--type-headline-size);
  line-height: var(--type-headline-line);
  font-weight: var(--weight-semibold);
}

.hero__stats-label {
  margin: 0;
  font-size: var(--type-caption-size);
  color: var(--text-tertiary);
}

/* ── 霜卡拼贴(签名元素:真组件,不是截图) ───────────── */
.collage {
  position: relative;
  min-height: calc(var(--space-12) * 12);
}

.collage-card {
  position: absolute;
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  padding: var(--space-4);
  border-radius: var(--radius-card);
  animation:
    rise var(--duration-slower) var(--ease-enter) backwards var(--rise-delay, 0s),
    bob var(--bob-dur, 8s) ease-in-out infinite alternate var(--bob-delay, 0s);
}

.collage__under {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

/* 霜下要有鲜艳内容,半透明才看得见——配方同 foundations/frost 的「鲜艳图片」底 */
.collage__blob {
  position: absolute;
  aspect-ratio: 1;
  border-radius: var(--radius-full);
  animation: collage-drift var(--drift-dur, 26s) ease-in-out infinite alternate var(--drift-delay, 0s);
}

.collage__blob--a {
  left: 0;
  top: 28%;
  width: 42%;
  background: radial-gradient(closest-side, var(--palette-mango-400), transparent 72%);
  --drift-x: 5%;
  --drift-y: 6%;
}

.collage__blob--b {
  right: 2%;
  top: 26%;
  width: 40%;
  background: radial-gradient(closest-side, var(--palette-blue-400), transparent 70%);
  --drift-x: -6%;
  --drift-y: 4%;
  --drift-delay: -9s;
}

.collage__blob--c {
  left: 16%;
  bottom: 0;
  width: 44%;
  background: radial-gradient(closest-side, var(--palette-green-400), transparent 70%);
  --drift-x: 4%;
  --drift-y: -5%;
  --drift-delay: -17s;
}

.collage__blob--d {
  right: 14%;
  top: 0;
  width: 34%;
  background: radial-gradient(closest-side, var(--palette-amber-300), transparent 66%);
  --drift-x: -4%;
  --drift-y: 7%;
  --drift-delay: -5s;
}

@keyframes collage-drift {
  from {
    translate: 0 0;
  }
  to {
    translate: var(--drift-x, 4%) var(--drift-y, -4%);
  }
}

.collage-card--a {
  top: 0;
  left: 0;
  width: 62%;
  max-width: calc(var(--space-12) * 6.5);
  rotate: -2deg;
}

.collage-card--b {
  top: calc(var(--space-12) * 2.6);
  right: 0;
  width: 56%;
  max-width: calc(var(--space-12) * 5.8);
  rotate: 1.6deg;
}

.collage-card--c {
  top: calc(var(--space-12) * 6.9);
  left: calc(var(--space-8));
  width: 66%;
  max-width: calc(var(--space-12) * 7);
  rotate: -1.2deg;
}

.collage-card__label {
  font-size: var(--type-micro-size);
  line-height: var(--type-micro-line);
  font-weight: var(--weight-medium);
  letter-spacing: var(--tracking-caps);
  text-transform: uppercase;
  color: var(--text-tertiary);
}

.collage-card__check {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--type-body-sm-size);
  line-height: var(--type-body-sm-line);
  color: var(--text-secondary);
  cursor: pointer;
}

.collage-card__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
}

.collage-card__tags {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.collage-card__actions {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

/* ── 组件清单跑马灯(真实目录,一条霜带三行) ─────────── */
.mq {
  display: grid;
  gap: var(--space-2);
  padding: var(--space-3) 0;
  margin: var(--space-6) 0 0;
}

.mq__row {
  overflow: hidden;
}

.mq__track {
  display: flex;
  width: max-content;
  animation: marquee 72s linear infinite var(--mq-delay, 0s);
}

.mq__row--reverse .mq__track {
  animation-direction: reverse;
}

.mq__row:hover .mq__track {
  animation-play-state: paused;
}

.mq__list {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin: 0;
  padding: 0 var(--space-2) 0 0;
  list-style: none;
}

/* 霜面内部只用半透明叠层,chip 不铺不透明底 */
.mq__item {
  display: inline-flex;
  align-items: baseline;
  gap: var(--space-1-5);
  white-space: nowrap;
  padding: var(--space-1) var(--space-3);
  border: var(--border-width) solid var(--border-subtle);
  border-radius: var(--radius-full);
  font-size: var(--type-caption-size);
  line-height: var(--type-caption-line);
  text-decoration: none;
  color: var(--text-secondary);
}

.mq__item b {
  font-weight: var(--weight-medium);
  color: var(--text-primary);
}

.mq__item span {
  color: var(--text-tertiary);
}

.mq__item:hover {
  border-color: var(--border-strong);
  background: var(--fill-default);
}

/* ── 通用段落 ─────────────────────────────────────── */
.sec {
  margin-top: calc(var(--space-12) * 2);
}

.sec__head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: var(--space-4);
  margin-bottom: var(--space-5);
}

.sec__eyebrow {
  margin: 0;
  color: var(--text-accent);
  font-size: var(--type-caption-size);
  line-height: var(--type-caption-line);
  font-weight: var(--weight-semibold);
  letter-spacing: var(--tracking-caps);
  text-transform: uppercase;
}

.sec__title {
  margin: var(--space-1) 0 0;
  font-family: var(--font-serif);
  font-size: var(--type-headline-size);
  line-height: var(--type-headline-line);
  font-weight: var(--weight-semibold);
  letter-spacing: var(--tracking-title);
}

.sec__desc {
  max-width: var(--container-prose);
  margin: var(--space-2) 0 0;
  color: var(--text-secondary);
  font-size: var(--type-body-size);
  line-height: var(--type-body-line);
}

.pg-hint {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1-5);
  padding: 0 var(--space-2-5);
  height: var(--size-sm-h);
  border: var(--border-width) solid var(--border-subtle);
  border-radius: var(--radius-full);
  color: var(--text-tertiary);
  font-size: var(--type-caption-size);
  white-space: nowrap;
}

/* ── 试驾区 ───────────────────────────────────────── */
.pg {
  padding: var(--space-5) var(--space-5) var(--space-6);
  border: var(--border-width) solid var(--border-subtle);
  border-radius: var(--radius-xl);
  background: var(--bg-surface);
  box-shadow: var(--shadow-raised);
}

.pg__grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(300px, 100%), 1fr));
  gap: var(--space-4);
  padding-top: var(--space-4);
}

/* 结构页只有「折叠 + 分页」一对半宽单元；300px 档会把分页挤到换行并空出第三列 */
.pg__grid--two {
  grid-template-columns: repeat(auto-fit, minmax(min(420px, 100%), 1fr));
}

.pg-cell {
  padding: var(--space-4) var(--space-5);
  border: var(--border-width) solid var(--border-subtle);
  border-radius: var(--radius-card);
  background: var(--bg-raised);
  min-width: 0;
}

.pg-cell--wide {
  grid-column: 1 / -1;
}

.pg-cell--inline {
  flex: 1 1 auto;
}

.pg-cell__label {
  margin: 0 0 var(--space-3);
  font-size: var(--type-caption-size);
  line-height: var(--type-caption-line);
  font-weight: var(--weight-medium);
  color: var(--text-tertiary);
}

.pg-stack {
  display: grid;
  gap: var(--space-3);
}

.pg__row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-3);
}

.pg__row--wrap {
  align-items: stretch;
  padding-top: var(--space-4);
}

.pg__row--wrap .pg-cell {
  flex: 1 1 220px;
}

.pg-check {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--type-body-sm-size);
  line-height: var(--type-body-sm-line);
  color: var(--text-secondary);
  cursor: pointer;
}

.pg-note {
  margin: var(--space-3) 0 0;
  font-size: var(--type-caption-size);
  line-height: var(--type-caption-line);
  color: var(--text-tertiary);
}

.pg-skeleton {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  margin-top: var(--space-4);
}

.pg-skeleton__lines {
  flex: 1;
  display: grid;
  gap: var(--space-2);
}

.pg-anchor {
  color: var(--text-accent);
  font-weight: var(--weight-medium);
  text-decoration: underline dotted;
  text-underline-offset: calc(var(--space-0-5) * 2);
  cursor: help;
}

.pg-hovercard {
  display: flex;
  align-items: flex-start;
  gap: var(--space-3);
  max-width: 260px;
}

.pg-hovercard p {
  margin: var(--space-1) 0 0;
  font-size: var(--type-caption-size);
  line-height: var(--type-caption-line);
  color: var(--text-secondary);
}

.pg-code {
  font-family: var(--font-mono);
  font-size: var(--type-caption-size);
  padding: 0 var(--space-1);
  border-radius: var(--radius-xs);
  background: var(--fill-default);
}

.pg-dialog-body {
  margin: 0;
  color: var(--text-secondary);
  font-size: var(--type-body-size);
  line-height: var(--type-body-line);
}

/* ── LLM 舞台(墨色,不随主题翻转) ─────────────────── */
.llm {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: var(--space-8);
  padding: var(--space-8);
  border-radius: var(--radius-2xl);
  background: var(--site-ink);
  color: var(--site-on-ink);
}

.llm__eyebrow {
  margin: 0;
  color: var(--accent-hover);
  font-size: var(--type-caption-size);
  line-height: var(--type-caption-line);
  font-weight: var(--weight-semibold);
  letter-spacing: var(--tracking-caps);
  text-transform: uppercase;
}

.llm__title {
  margin: var(--space-2) 0 0;
  font-family: var(--font-serif);
  font-size: var(--type-headline-size);
  line-height: var(--type-headline-line);
  font-weight: var(--weight-semibold);
}

.llm__desc {
  margin: var(--space-3) 0 0;
  max-width: 32em;
  color: var(--site-on-ink-muted);
  font-size: var(--type-body-size);
  line-height: var(--type-body-line);
}

.llm__files {
  margin: var(--space-5) 0 0;
  padding: 0;
  list-style: none;
  display: grid;
  gap: var(--space-2);
}

.llm__files li {
  display: flex;
  align-items: baseline;
  gap: var(--space-3);
}

.llm__files a {
  font-family: var(--font-mono);
  font-size: var(--type-body-sm-size);
  color: var(--site-on-ink);
  text-decoration: underline;
  text-decoration-color: var(--site-ink-line);
  text-underline-offset: calc(var(--space-0-5) * 2);
}

.llm__files a:hover {
  text-decoration-color: var(--accent-hover);
}

.llm__files span {
  color: var(--site-on-ink-muted);
  font-size: var(--type-caption-size);
}

.llm__term {
  overflow: hidden;
  border: var(--border-width) solid var(--site-ink-line);
  border-radius: var(--radius-card);
  background: var(--site-ink-raised);
}

.llm__term-head {
  margin: 0;
  padding: var(--space-2) var(--space-4);
  border-bottom: var(--border-width) solid var(--site-ink-line);
  color: var(--site-on-ink-muted);
  font-size: var(--type-micro-size);
  letter-spacing: var(--tracking-caps);
  text-transform: uppercase;
}

.llm__term-body {
  margin: 0;
  padding: var(--space-4);
  overflow-x: auto;
  font-family: var(--font-mono);
  font-size: var(--type-caption-size);
  line-height: var(--type-body-sm-line);
  color: var(--site-on-ink);
}

.llm__term-body span {
  color: var(--accent-hover);
}

/* ── 特性 ─────────────────────────────────────────── */
.feat__grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(300px, 100%), 1fr));
  gap: var(--space-4);
}

.feat {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  padding: var(--space-5);
  border: var(--border-width) solid var(--border-subtle);
  border-radius: var(--radius-card);
  background: var(--bg-surface);
}

.feat__demo {
  display: flex;
  align-items: center;
  min-height: calc(var(--space-12) * 1.5);
  padding: var(--space-3);
  border-radius: var(--radius-md);
  background: var(--bg-sunken);
  overflow: hidden;
}

.feat__title {
  margin: 0;
  font-size: var(--type-title-lg-size);
  line-height: var(--type-title-lg-line);
  font-weight: var(--weight-semibold);
}

.feat__body {
  margin: 0;
  font-size: var(--type-body-sm-size);
  line-height: var(--type-body-sm-line);
  color: var(--text-secondary);
}

.feat-tokens {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.feat-tokens__dot {
  width: calc(var(--space-4));
  height: calc(var(--space-4));
  border-radius: var(--radius-full);
}

.feat-tokens__dot[data-c="accent"] { background: var(--accent); }
.feat-tokens__dot[data-c="success"] { background: var(--success); }
.feat-tokens__dot[data-c="warning"] { background: var(--warning); }
.feat-tokens__dot[data-c="info"] { background: var(--info); }
.feat-tokens__dot[data-c="danger"] { background: var(--danger); }

.feat-tokens code {
  margin-left: var(--space-2);
  font-family: var(--font-mono);
  font-size: var(--type-caption-size);
  color: var(--text-tertiary);
}

.feat-mats {
  flex: 1;
  align-self: stretch;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-5);
}

.feat-mats__paper,
.feat-mats__frost {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: calc(var(--space-12) * 1.5);
  height: calc(var(--space-12) * 1.5);
  border-radius: var(--radius-md);
  font-size: var(--type-body-sm-size);
  color: var(--text-secondary);
}

.feat-mats__paper {
  background: var(--bg-raised);
  border: var(--border-width) solid var(--border-subtle);
}

.feat-mats__frost {
  border-radius: var(--radius-md);
}

.feat-themes {
  display: flex;
  width: 100%;
  max-width: calc(var(--space-12) * 6);
  border: var(--border-width) solid var(--border-subtle);
  border-radius: var(--radius-md);
  overflow: hidden;
}

.feat-themes__half {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  padding: var(--space-3) 0;
  background: var(--bg-surface);
}

.feat-themes__half i {
  width: var(--space-3);
  height: var(--space-3);
  border-radius: var(--radius-full);
  background: var(--accent);
}

.feat-themes__half b {
  font-size: var(--type-caption-size);
  font-weight: var(--weight-medium);
  color: var(--text-secondary);
}

.feat__code {
  font-family: var(--font-mono);
  font-size: var(--type-caption-size);
  color: var(--text-secondary);
  white-space: normal;
  min-width: 0;
}

.feat-focus__ring {
  display: inline-flex;
  align-items: center;
  height: var(--control-h);
  padding: 0 var(--control-px);
  border: var(--border-width) solid var(--accent);
  border-radius: var(--control-radius);
  box-shadow: var(--focus-shadow);
  font-size: var(--control-font);
  color: var(--text-primary);
}

/* ── 快速上手 ─────────────────────────────────────── */
.qs {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: var(--space-8);
  align-items: center;
}

.qs__steps {
  margin: var(--space-4) 0 var(--space-6);
  padding: 0;
  list-style: none;
  display: grid;
  gap: var(--space-3);
  counter-reset: qs-step;
}

.qs__steps li {
  position: relative;
  padding-left: var(--space-8);
  counter-increment: qs-step;
}

.qs__steps li::before {
  content: counter(qs-step);
  position: absolute;
  left: 0;
  top: 50%;
  translate: 0 -50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: calc(var(--space-5));
  height: calc(var(--space-5));
  border-radius: var(--radius-full);
  background: var(--accent-subtle);
  color: var(--text-accent);
  font-size: var(--type-caption-size);
  font-weight: var(--weight-semibold);
}

.qs__steps code {
  display: block;
  font-family: var(--font-mono);
  font-size: var(--type-body-sm-size);
  color: var(--text-primary);
}

.qs__steps span {
  font-size: var(--type-caption-size);
  color: var(--text-tertiary);
}

.qs__code {
  min-width: 0;
}

/* ── 产品 ─────────────────────────────────────────── */
.prod__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--space-4);
}

.prod {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  padding: var(--space-6);
  border-radius: var(--radius-card);
  text-decoration: none;
  color: inherit;
  transition: transform var(--duration-base) var(--ease-standard);
}

.prod:hover {
  transform: translateY(calc(var(--space-1) * -1));
}

.prod__title {
  margin: 0;
  font-size: var(--type-title-lg-size);
  line-height: var(--type-title-lg-line);
  font-weight: var(--weight-semibold);
}

.prod__body {
  margin: 0;
  font-size: var(--type-body-size);
  line-height: var(--type-body-line);
  color: var(--text-secondary);
}

.prod__cta {
  margin-top: var(--space-1);
  font-size: var(--type-body-sm-size);
  font-weight: var(--weight-medium);
  color: var(--text-accent);
}

/* ── 页脚 ─────────────────────────────────────────── */
.landing-footer {
  flex: none;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: var(--space-3);
  padding: var(--space-4) var(--space-6);
  border-top: var(--border-width) solid var(--border-subtle);
  font-size: var(--type-caption-size);
  color: var(--text-tertiary);
}

.landing-footer a {
  color: inherit;
}

.landing-footer a:hover {
  color: var(--text-primary);
}

.landing-footer__links {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-4);
}

/* ── 动效 ─────────────────────────────────────────── */
@keyframes rise {
  from {
    opacity: 0;
    transform: translateY(var(--motion-enter-offset));
  }
  to {
    opacity: 1;
    transform: none;
  }
}

@keyframes bob {
  from {
    transform: translateY(0);
  }
  to {
    transform: translateY(calc(var(--space-2) * -1));
  }
}

@keyframes marquee {
  from {
    transform: translateX(0);
  }
  to {
    transform: translateX(-50%);
  }
}

.anim-rise {
  animation: rise var(--duration-slower) var(--ease-enter) backwards var(--rise-delay, 0s);
}

/* ── 降级与响应式 ─────────────────────────────────── */
@media (prefers-reduced-motion: reduce) {
  .anim-rise,
  .collage-card,
  .collage__blob,
  .mq__track {
    animation: none;
  }
}

@media (max-width: 1080px) {
  .hero__grid {
    grid-template-columns: minmax(0, 1fr);
  }

  .collage {
    min-height: 0;
    display: grid;
    gap: var(--space-4);
    margin-top: var(--space-4);
  }

  .collage-card {
    position: relative;
    width: 100%;
    max-width: calc(var(--space-12) * 11);
  }

  .collage-card--a,
  .collage-card--b,
  .collage-card--c {
    rotate: 0deg;
  }

  .llm,
  .qs {
    grid-template-columns: minmax(0, 1fr);
  }
}

@media (max-width: 720px) {
  .landing-container {
    padding: 0 var(--space-4);
  }

  .hero {
    padding-top: var(--space-6);
  }

  .hero__title {
    font-size: var(--type-display-lg-size);
  }

  .sec {
    margin-top: calc(var(--space-12) * 1.5);
  }

  .sec__head {
    flex-direction: column;
    align-items: flex-start;
  }

  .prod__grid {
    grid-template-columns: minmax(0, 1fr);
  }

  .hero__stats {
    gap: var(--space-5);
  }
}

</style>
