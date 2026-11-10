<script setup lang="ts">
import { Filter, Plus } from "lucide-vue-next";
import { Button, InputText, Tag } from "@mango-write/ui-vue";
import DocPage from "../../kit/DocPage.vue";
import DocSection from "../../kit/DocSection.vue";
import Specimen from "../../kit/Specimen.vue";
import { t, type Bi } from "../../i18n";

const principles = [
  { n: "01", en: "Paper first", title: { zh: "纸先于一切", en: "Paper first" }, desc: { zh: "正文落在不透明、偏暖的纸面上；壳、工具条、侧栏退后，不与内容抢亮度。", en: "Body text sits on an opaque, warm-tinted paper surface; the shell, toolbars, and sidebar step back and never compete with content for brightness." } },
  { n: "02", en: "Frost for floating", title: { zh: "浮起来的才是霜", en: "Frost for floating" }, desc: { zh: "只有浮在内容之上的层用毛玻璃；霜底色足够厚，文字永远可读。同屏霜层 ≤ 2。", en: "Only layers floating above content use frosted glass; the frost base is thick enough that text always stays legible. At most 2 frost layers on screen." } },
  { n: "03", en: "Tint, don't paint", title: { zh: "着色不铺色", en: "Tint, don't paint" }, desc: { zh: "组件内部的填充都是半透明叠层，放在纸面、画布、霜面上都成立，材质不被实色块打断。", en: "Fills inside components are translucent overlays that hold on paper, canvas, and frost alike, so the material is never broken up by solid blocks." } },
  { n: "04", en: "Ember for action", title: { zh: "橙色只给动作", en: "Ember for action" }, desc: { zh: "品牌橙只用于主操作、选中、焦点与关键强调；一个区块至多一个实心主按钮。", en: "Brand orange is reserved for primary actions, selection, focus, and key emphasis; one solid primary button per block at most." } },
  { n: "05", en: "One size axis", title: { zh: "一根尺寸轴", en: "One size axis" }, desc: { zh: "高度、字号、图标、内距、圆角由同一档位派生；密度由容器与平台上下文决定，不由组件各自决定。", en: "Height, font size, icon, padding, and radius all derive from one tier; density is decided by the container and platform context, not by each component." } },
  { n: "06", en: "Quiet motion", title: { zh: "安静的动", en: "Quiet motion" }, desc: { zh: "动效解释因果，不表演；只动 transform、opacity 与颜色，尊重减少动态偏好。", en: "Motion explains cause and effect and never performs; it animates only transform, opacity, and color, honoring reduced-motion preferences." } },
];

interface WingRow {
  wing: Bi;
  spec: string;
  target: Bi;
  geometry: Bi;
  interaction: Bi;
}

const wings: WingRow[] = [
  {
    wing: { zh: "Core · 核心设计基因", en: "Core · Shared DNA" },
    spec: "DESIGN.md · var.css",
    target: { zh: "跨端共享不变量（@mango-write/ui-core）", en: "Cross-platform invariants (@mango-write/ui-core)" },
    geometry: { zh: "4px 间距网格、四档尺寸槽位（xs/sm/md/lg）、同心圆角法则", en: "4px spacing grid, 4 size slots (xs/sm/md/lg), concentric radius rule" },
    interaction: { zh: "暖纸色板、着色不铺色半透明墨色、霜材质、黄金分割动效曲线", en: "Warm paper palette, translucent ink tints, frost material, golden-ratio motion" },
  },
  {
    wing: { zh: "Desktop · 精细工作台", en: "Desktop · Precision Workbench" },
    spec: "DESIGN-DESKTOP.md",
    target: { zh: "Web 工作台 / Electron 桌面端 / Admin 后台", en: "Web Workbench / Electron Desktop / Admin Console" },
    geometry: { zh: "24 / 28 / 32(默认) / 40px 指针轴 · 默认 13px 字号 · 画布多浮岛", en: "24 / 28 / 32(default) / 40px pointer axis · 13px default font · Floating islands" },
    interaction: { zh: "1px 清晰描边控件 · Hover + Focus Ring · 锚定下拉与四档居中弹窗", en: "1px bordered controls · Hover + Focus Ring · Anchored popovers & 4-tier dialogs" },
  },
  {
    wing: { zh: "Mobile · 纸与霜 · 掌上版", en: "Mobile · Paper & Frost Touch" },
    spec: "DESIGN-MOBILE.md · mobile-tokens.css",
    target: { zh: "微信小程序（@mango-write/ui-mp）/ 移动端伴侣", en: "WeChat Mini Program (@mango-write/ui-mp) / Mobile Companion" },
    geometry: { zh: "44 / 48 / 52px 交互尺寸 · 默认 16px/17px 字号 · 通栏内容流", en: "44 / 48 / 52px interactive sizes · 16px/17px body type · Flush content feeds" },
    interaction: { zh: "填充输入 · Press-first 阻尼 · 可访问底部抽屉与真实胶囊避让", en: "Filled fields · Press-first damping · Accessible bottom sheets and real capsule clearance" },
  },
];

const layers = [
  ["① Palette", "--palette-*", { zh: "原料色板；只给语义层用，组件禁止引用", en: "Raw palette; for the semantic layer only — components must not reference it" }],
  ["② Scale", "--space-* · --size-* · --mp-size-* · --type-* · --mp-type-* · --radius-*", { zh: "与主题无关的刻度（Desktop 默认 + Mobile 触控作用域覆写）", en: "Theme-independent scales (Desktop default + Mobile touch scope overrides)" }],
  ["③ Semantic", "--bg-* · --text-* · --accent · --danger …", { zh: "语义色；浅色基值 + 深色覆盖", en: "Semantic colors; light-theme base values plus dark overrides" }],
  ["④ Derived", "--fill-* · --border-* · --*-subtle · --focus-*", { zh: "由语义派生的半透明叠层", en: "Translucent overlays derived from semantics" }],
  ["⑤ Domain", "--color-mark-* · --code-* · --lightbox-* · --site-*", { zh: "业务域专用", en: "Reserved for product domains" }],
  ["⑥ Legacy", "--color-brand-* · --material-* …", { zh: "旧名映射，只给存量 app；冻结", en: "Legacy name mapping for existing apps; frozen" }],
];

const s = {
  atAGlance: { zh: "一眼看懂", en: "At a glance" },
  atAGlanceDesc: {
    zh: "同一组控件放在纸面与霜面、浅色与深色上——这套语言的全部承诺就是它们看起来是同一家人。",
    en: "The same controls on paper and frost, light and dark — the whole promise of this design language is that they read as one family.",
  },
  searchPlaceholder: { zh: "搜索文献、草稿或引用", en: "Search references, drafts, or citations" },
  filter: { zh: "筛选", en: "Filter" },
  importRefs: { zh: "导入文献", en: "Import references" },
  synced: { zh: "已同步", en: "Synced" },
  archTitle: { zh: "一核双翼：Core · Desktop · Mobile 协同架构", en: "One Core, Two Wings: Core · Desktop · Mobile Architecture" },
  archDesc: {
    zh: "键鼠桌面工作台与拇指掌上伴侣共享同一个「纸与霜」色彩与材质灵魂，但在几何尺寸、框线密度、状态反馈与浮层范式上各自遵从原生人机工学。",
    en: "The desktop mouse-and-keyboard workbench and the thumb-driven mobile companion share the same Paper & Frost soul, while adapting geometry, border density, feedback, and overlays to native ergonomics.",
  },
  colWing: { zh: "体系", en: "System" },
  colSpec: { zh: "权威源", en: "Source of Truth" },
  colTarget: { zh: "适用端", en: "Target" },
  colGeometry: { zh: "空间与几何刻度", en: "Space & Geometry" },
  colInteraction: { zh: "材质与交互范式", en: "Material & Interaction" },
  principlesTitle: { zh: "六条核心原则", en: "Six Core Principles" },
  principlesDesc: { zh: "跨端共享，冲突时按序取舍。", en: "Shared across all platforms; when they conflict, decide in this order." },
  tokenStructure: { zh: "Token 结构", en: "Token structure" },
  tokenDesc: {
    zh: "组件只读 ②③④⑤ 与自己的 --mw-* 局部变量；门禁 scripts/check-tokens.mjs 强制。",
    en: "Components read only tiers ②③④⑤ plus their own --mw-* locals; the scripts/check-tokens.mjs gate enforces this.",
  },
  colLayer: { zh: "层", en: "Layer" },
  colExample: { zh: "示例", en: "Example" },
  colNotes: { zh: "说明", en: "Notes" },
  howToRead: { zh: "怎么读这个站", en: "How to read this site" },
  read1: {
    zh: "每个示例都在<strong>浅色与深色并排</strong>渲染（主题作用域可以挂在任意元素上）；右上角切换的是页面本身与浮层的主题。",
    en: "Every example renders <strong>light and dark side by side</strong> (a theme scope can attach to any element); the toggle in the top right switches the theme of the page itself and its overlays.",
  },
  read2: {
    zh: "<strong>霜面</strong>示例底下垫了有色内容（色块、高亮、正文），用来检验霜的可读性与整体性。",
    en: "<strong>Frost</strong> examples sit over colored content beneath (color blobs, highlights, body text) to test the frost's legibility and cohesion.",
  },
  read3: {
    zh: "数值实时从 <span class=\"doc-code\">var.css</span> 与 <span class=\"doc-code\">mobile-tokens.css</span> 读取；规范正文见包内 <span class=\"doc-code\">DESIGN.md</span>、<span class=\"doc-code\">DESIGN-DESKTOP.md</span> 与 <span class=\"doc-code\">DESIGN-MOBILE.md</span>。",
    en: "Values are read live from <span class=\"doc-code\">var.css</span> and <span class=\"doc-code\">mobile-tokens.css</span>; full specs live in <span class=\"doc-code\">DESIGN.md</span>, <span class=\"doc-code\">DESIGN-DESKTOP.md</span>, and <span class=\"doc-code\">DESIGN-MOBILE.md</span>.",
  },
} as const;
</script>

<template>
  <DocPage>
    <DocSection :title="s.atAGlance" :desc="s.atAGlanceDesc">
      <Specimen :surfaces="['paper', 'frost']">
        <InputText :placeholder="t(s.searchPlaceholder)" style="width: 220px" />
        <Button severity="secondary" :label="t(s.filter)" :icon="Filter" />
        <Button :label="t(s.importRefs)" :icon="Plus" />
        <Tag :value="t(s.synced)" severity="success" />
      </Specimen>
    </DocSection>

    <DocSection :title="s.archTitle" :desc="s.archDesc">
      <table class="doc-table">
        <thead>
          <tr>
            <th>{{ t(s.colWing) }}</th>
            <th>{{ t(s.colSpec) }}</th>
            <th>{{ t(s.colTarget) }}</th>
            <th>{{ t(s.colGeometry) }}</th>
            <th>{{ t(s.colInteraction) }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(w, i) in wings" :key="i">
            <td style="white-space: nowrap; font-weight: var(--weight-semibold)">{{ t(w.wing) }}</td>
            <td><code>{{ w.spec }}</code></td>
            <td>{{ t(w.target) }}</td>
            <td>{{ t(w.geometry) }}</td>
            <td>{{ t(w.interaction) }}</td>
          </tr>
        </tbody>
      </table>
    </DocSection>

    <DocSection :title="s.principlesTitle" :desc="s.principlesDesc">
      <div class="doc-grid">
        <div v-for="p in principles" :key="p.n" class="doc-card">
          <p class="doc__eyebrow">{{ p.n }} · {{ p.en }}</p>
          <h3 style="margin-top: var(--space-1-5)">{{ t(p.title) }}</h3>
          <p>{{ t(p.desc) }}</p>
        </div>
      </div>
    </DocSection>

    <DocSection :title="s.tokenStructure" :desc="s.tokenDesc">
      <table class="doc-table">
        <thead>
          <tr><th>{{ t(s.colLayer) }}</th><th>{{ t(s.colExample) }}</th><th>{{ t(s.colNotes) }}</th></tr>
        </thead>
        <tbody>
          <tr v-for="(l, i) in layers" :key="i">
            <td style="white-space: nowrap; font-weight: var(--weight-medium)">{{ l[0] }}</td>
            <td><code>{{ l[1] }}</code></td>
            <td>{{ t(l[2]) }}</td>
          </tr>
        </tbody>
      </table>
    </DocSection>

    <DocSection :title="s.howToRead">
      <ul class="doc-rules">
        <li v-html="t(s.read1)" />
        <li v-html="t(s.read2)" />
        <li v-html="t(s.read3)" />
      </ul>
    </DocSection>
  </DocPage>
</template>
