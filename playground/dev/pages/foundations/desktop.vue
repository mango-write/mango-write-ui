<script setup lang="ts">
import { computed, ref } from "vue";
import { Filter, Plus, Search, Settings2 } from "lucide-vue-next";
import { Button, InputText, Select, SelectButton, Tag } from "@mango-write/ui-vue";
import DocPage from "../../kit/DocPage.vue";
import DocSection from "../../kit/DocSection.vue";
import Specimen from "../../kit/Specimen.vue";
import { t, type Bi } from "../../i18n";

const viewMode = ref("list");
const filterScope = ref("all");
const searchVal = ref("");

const s = {
  optList: { zh: "列表", en: "List" },
  optBoard: { zh: "看板", en: "Board" },
  optGraph: { zh: "图谱", en: "Graph" },
  scopeAll: { zh: "全部文献 (128)", en: "All References (128)" },
  scopeRecent: { zh: "近 7 天新增 (14)", en: "Last 7 Days (14)" },
  scopeAnnotated: { zh: "已精读批注 (42)", en: "Annotated (42)" },
  specTitle: { zh: "桌面端核心契约（DESIGN-DESKTOP.md）", en: "Desktop Core Contracts (DESIGN-DESKTOP.md)" },
  specDesc: {
    zh: "面向键鼠（1px 指针精度 + 快捷键）、50–65cm 视距与 1280px+ 宽屏视口，追求高信息密度、清晰边界与零视线跳跃。",
    en: "Tailored for mouse/keyboard (1px pointer precision + shortcuts), 50–65cm viewing distance, and 1280px+ viewports — optimizing for density, crisp boundaries, and minimal eye travel.",
  },
  colDim: { zh: "维度", en: "Dimension" },
  colToken: { zh: "Token / 机制", en: "Token / Mechanism" },
  colSpec: { zh: "桌面端规范", en: "Desktop Contract" },
  colReason: { zh: "人机工学依据", en: "Ergonomic Rationale" },
  workbenchTitle: { zh: "桌面工具条与紧凑密度上下文（32px md / 28px sm）", en: "Desktop Toolbar & Compact Density Context (32px md / 28px sm)" },
  workbenchDesc: {
    zh: "桌面端默认采用 32px（md）描边控件与就近锚定下拉框；工具条容器（.mw-toolbar / .mw-size-sm）一键收敛为 28px 发丝边紧凑态。",
    en: "Desktop defaults to 32px (md) bordered controls and anchored popovers; toolbar containers (.mw-toolbar / .mw-size-sm) step down to 28px hairline controls.",
  },
  rowMd: { zh: "标准表单行（md · 32px）", en: "Standard Form Row (md · 32px)" },
  rowToolbar: { zh: "工作台工具条（.mw-toolbar · 28px）", en: "Workbench Toolbar (.mw-toolbar · 28px)" },
  searchPlaceholder: { zh: "按标题、DOI 或作者检索（⌘K）", en: "Filter by title, DOI, or author (⌘K)" },
  filterBtn: { zh: "高级筛选", en: "Filters" },
  newDraftBtn: { zh: "新建文稿", en: "New Draft" },
  tagSynced: { zh: "云端已同步", en: "Cloud Synced" },
  settingsAria: { zh: "视图设置", en: "View settings" },
  shellsTitle: { zh: "管理后台四壳模板与垂直三层滚动纪律", en: "Admin 4-Shell Templates & Vertical 3-Layer Scrolling" },
  shellsDesc: {
    zh: "后台与复杂桌面视图严格区分「固定常驻页面要素（L1 页头 + L2 筛选/摘要/表头）」与「唯一可滚动数据层（L3 Data Plane）」，严禁双滚动条套娃或弹窗叠弹窗。",
    en: "Admin and complex desktop views strictly separate fixed Page Chrome (L1 Header + L2 Filters/Summary/Table Head) from the single scrollable Data Plane (L3), forbidding nested scrollbars or stacked dialogs.",
  },
} as const;

const viewOptions = computed(() => [
  { label: t(s.optList), value: "list" },
  { label: t(s.optBoard), value: "board" },
  { label: t(s.optGraph), value: "graph" },
]);

const scopeOptions = computed(() => [
  { label: t(s.scopeAll), value: "all" },
  { label: t(s.scopeRecent), value: "recent" },
  { label: t(s.scopeAnnotated), value: "annotated" },
]);

interface SpecRow {
  dim: Bi;
  token: string;
  spec: Bi;
  reason: Bi;
}

const desktopSpecs: SpecRow[] = [
  {
    dim: { zh: "指针尺寸轴", en: "Pointer Size Axis" },
    token: "--size-xs/sm/md/lg-h: 24 / 28 / 32 / 40px",
    spec: { zh: "默认 md = 32px，工具栏 sm = 28px，微控件 xs = 24px", en: "Default md = 32px, toolbar sm = 28px, micro xs = 24px" },
    reason: { zh: "面向 1px 鼠标指针与高信息密度多列工作台", en: "Designed for 1px mouse pointers and high-density multi-column workbenches" },
  },
  {
    dim: { zh: "紧凑界面字号", en: "Compact UI Typography" },
    token: "--type-body-sm-size: 13px (0.8125rem)",
    spec: { zh: "控件、表格、菜单统一 13px / 20px 行高", en: "Controls, tables, and menus use 13px / 20px line height" },
    reason: { zh: "50–65cm 桌面视距下兼顾单行信息量与长时间阅读清晰度", en: "Balances single-line density and long-session legibility at 50–65cm viewing distance" },
  },
  {
    dim: { zh: "清晰描边控件", en: "Bordered Control Surface" },
    token: "--control-border + --control-face + --control-inset",
    spec: { zh: "1px 半透明墨色边 + 微渐变表面 + 顶底内高光", en: "1px translucent ink border + subtle gradient face + top/bottom inner highlight" },
    reason: { zh: "在大面积白纸（--bg-surface）上明确界定可输入区与可点击区", en: "Clearly delineates inputs and clickable targets across large paper surfaces" },
  },
  {
    dim: { zh: "Hover 与焦点环", en: "Hover & Focus Ring" },
    token: ":hover -> --fill-default · :focus-visible -> --focus-shadow",
    spec: { zh: "鼠标悬停 110ms 变色预演；键盘 Tab 展示 2px 橙色焦点环或 3px 焦点晕", en: "110ms hover preview; keyboard Tab shows 2px orange focus ring or 3px focus halo" },
    reason: { zh: "桌面端高频依赖鼠标悬停探索与全键盘导航", en: "Desktop workflows rely heavily on hover discovery and full keyboard navigation" },
  },
  {
    dim: { zh: "锚定浮层与四档弹窗", en: "Anchored Popovers & 4-Tier Dialogs" },
    token: "Popover / Select + Dialog (440 / 640 / 860 / 1100px)",
    spec: { zh: "下拉菜单就近锚定触发器弹出；复杂任务使用 sm/md/lg/xl 居中模态窗", en: "Dropdowns anchor directly to triggers; complex tasks use sm/md/lg/xl centered dialogs" },
    reason: { zh: "避免视线在宽屏上大幅跳跃，支持同窗多级下钻", en: "Prevents long eye travel across wide monitors and supports in-place drill-down" },
  },
];

const shells = [
  {
    code: "AdminListPage",
    title: { zh: "列表检索壳", en: "List & Search Shell" },
    desc: { zh: "页头主操作 → 顶部汇总条 → 单行即时筛选栏（无搜索/重置按钮） → 表头吸顶 DataTable（仅 tbody 内滚） → 底栏 Paginator。", en: "Header actions → Summary bar → Single-line instant filter bar → Sticky-header DataTable (tbody scroll only) → Bottom Paginator." },
  },
  {
    code: "AdminConfigPage",
    title: { zh: "配置表单壳", en: "Configuration Form Shell" },
    desc: { zh: "页头常驻「N 项未保存」与唯一「保存」按钮（高危改动配一句确认） → ConfigSection 分组卡 → ConfigRow 三列栅格（168px 标签 / 280px 控件 / 余宽后果说明）。", en: "Header 'N unsaved' badge + single Save button → ConfigSection cards → 3-column ConfigRow grid (168px label / 280px control / consequence note)." },
  },
  {
    code: "AdminDetailPage",
    title: { zh: "对象详情壳", en: "Entity Detail Shell" },
    desc: { zh: "返回按钮与对象名注入宿主顶栏左侧 → 顶部常驻 StatCard 状态摘要网格 → 页内 Tabs → 下方唯一滚动明细区。", en: "Back button & entity title injected into shell header lead → Sticky StatCard summary grid → In-page Tabs → Single scrollable detail plane." },
  },
  {
    code: "AdminBoardPage",
    title: { zh: "数据看板壳", en: "Analytics Board Shell" },
    desc: { zh: "全局时间窗与产品/端筛选上呈页头右侧 → StatBar 核心指标行（等宽数字） → AdminBoardSection 趋势卡（右上角 #drill 同窗下钻）。", en: "Global time range & dimension filters in header actions → Tabular StatBar → AdminBoardSection cards with top-right #drill in-place drill-down." },
  },
];
</script>

<template>
  <DocPage>
    <DocSection :title="s.specTitle" :desc="s.specDesc">
      <table class="doc-table">
        <thead>
          <tr>
            <th>{{ t(s.colDim) }}</th>
            <th>{{ t(s.colToken) }}</th>
            <th>{{ t(s.colSpec) }}</th>
            <th>{{ t(s.colReason) }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, i) in desktopSpecs" :key="i">
            <td style="white-space: nowrap; font-weight: var(--weight-semibold)">{{ t(row.dim) }}</td>
            <td><code>{{ row.token }}</code></td>
            <td>{{ t(row.spec) }}</td>
            <td>{{ t(row.reason) }}</td>
          </tr>
        </tbody>
      </table>
    </DocSection>

    <DocSection :title="s.workbenchTitle" :desc="s.workbenchDesc">
      <Specimen :surfaces="['paper', 'frost']" layout="stack">
        <div class="doc-row">
          <span class="doc-note" style="width: 180px">{{ t(s.rowMd) }}</span>
          <InputText v-model="searchVal" :placeholder="t(s.searchPlaceholder)" style="width: 220px" />
          <Select
            v-model="filterScope"
            :options="scopeOptions"
            option-label="label"
            option-value="value"
            style="width: 168px"
          />
          <Button severity="secondary" variant="outlined" :icon="Filter" :label="t(s.filterBtn)" />
          <Button :icon="Plus" :label="t(s.newDraftBtn)" />
        </div>
        <div class="doc-row mw-toolbar mw-size-sm">
          <span class="doc-note" style="width: 180px">{{ t(s.rowToolbar) }}</span>
          <SelectButton
            v-model="viewMode"
            :options="viewOptions"
            option-label="label"
            option-value="value"
          />
          <Button severity="secondary" :icon="Search" :label="t(s.filterBtn)" />
          <Tag :value="t(s.tagSynced)" severity="success" />
          <Button variant="text" severity="secondary" :icon="Settings2" :aria-label="t(s.settingsAria)" />
        </div>
      </Specimen>
    </DocSection>

    <DocSection :title="s.shellsTitle" :desc="s.shellsDesc">
      <div class="doc-grid">
        <div v-for="sh in shells" :key="sh.code" class="doc-card">
          <p class="doc__eyebrow">{{ sh.code }}</p>
          <h3 style="margin-top: var(--space-1-5)">{{ t(sh.title) }}</h3>
          <p>{{ t(sh.desc) }}</p>
        </div>
      </div>
    </DocSection>
  </DocPage>
</template>
