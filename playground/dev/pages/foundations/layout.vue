<script setup lang="ts">
import { ref } from "vue";
import { vScrollFade } from "@mango-write/ui-vue";
import DocPage from "../../kit/DocPage.vue";
import DocSection from "../../kit/DocSection.vue";
import Specimen from "../../kit/Specimen.vue";
import { useTokenValues } from "../../kit/tokens";
import { t, type Bi } from "../../i18n";

const fadeHost = ref<HTMLElement | null>(null);
const { values: fadeValues } = useTokenValues(fadeHost, () => [
  "--scroll-fade-size",
  "--scroll-fade-size-sm",
]);

const breakpoints = [
  { w: "640", n: "sm", use: { zh: "大屏手机横屏", en: "Large phones in landscape" } },
  { w: "768", n: "md", use: { zh: "平板；页面留白 16 → 24；手机档边界", en: "Tablets; page gutter 16 → 24; the phone-tier boundary" } },
  { w: "1024", n: "lg", use: { zh: "小笔记本", en: "Small laptops" } },
  { w: "1280", n: "xl", use: { zh: "标准桌面；页面留白 24 → 32；不得出现横向滚动", en: "Standard desktops; page gutter 24 → 32; no horizontal scrolling" } },
  { w: "1536", n: "2xl", use: { zh: "大屏", en: "Large screens" } },
];
const containers = [
  { token: "--container-prose", use: { zh: "长文阅读（约 40 个汉字）", en: "Long-form reading (about 40 CJK characters)" } },
  { token: "--container-content", use: { zh: "内容页", en: "Content pages" } },
  { token: "--container-page", use: { zh: "整页上限", en: "Full-page ceiling" } },
];
const scrollItems = [
  "1 · Vaswani et al. (2017) — Attention Is All You Need",
  "2 · Devlin et al. (2019) — BERT: Pre-training of Deep Bidirectional Transformers",
  "3 · Brown et al. (2020) — Language Models are Few-Shot Learners",
  "4 · Jumper et al. (2021) — Highly accurate protein structure prediction with AlphaFold",
  "5 · Ouyang et al. (2022) — Training language models to follow instructions",
  "6 · Touvron et al. (2023) — LLaMA: Open and Efficient Foundation Language Models",
  "7 · Abramson et al. (2024) — Accurate structure prediction of biomolecular interactions",
];
const scrollTags: Bi[] = [
  { zh: "全部文献", en: "All references" },
  { zh: "未读材料", en: "Unread" },
  { zh: "高被引论文", en: "Highly cited" },
  { zh: "方法学对照", en: "Methods comparison" },
  { zh: "实验基线", en: "Experimental baselines" },
  { zh: "待精读批注", en: "To annotate" },
  { zh: "综述与脉络", en: "Reviews & threads" },
  { zh: "附录图表", en: "Appendix figures" },
];

const s = {
  workbenchTitle: { zh: "工作台壳", en: "Workbench shell" },
  workbenchDesc: {
    zh: "画布（--bg-canvas）上：顶栏不画面；左栏、中栏、右栏是纸面浮岛（--bg-surface + 发丝边 + 轻阴影），浮岛间距 --shell-gutter，圆角 --radius-sheet。",
    en: "On the canvas (--bg-canvas): the top bar doesn't paint; sidebar, main, and aside are paper islands (--bg-surface + hairline border + light shadow), spaced by --shell-gutter with --radius-sheet corners.",
  },
  topbar: { zh: "顶栏", en: "Top bar" },
  sidebar: { zh: "左栏", en: "Sidebar" },
  mainCol: { zh: "中栏 · 纸面", en: "Main · paper" },
  asideCol: { zh: "右栏", en: "Aside" },
  shellRule1: {
    zh: "轨道内容（tab 行、面板身、脚行）一律透明，继承浮岛的纸面。",
    en: "Track content (tab rows, panel bodies, footer rows) stays transparent and inherits the island's paper.",
  },
  shellRule2: {
    zh: "页头钉在浮岛顶部（滚动容器之外），滚动只发生在浮岛内部。",
    en: "Page headers pin to the island's top (outside the scroll container); scrolling happens only inside islands.",
  },
  shellRule3: {
    zh: "工作台页面根不铺底色——会盖住画布，浮岛之间的缝就读成断层。",
    en: "Don't paint a background on the workbench page root — it covers the canvas and the gaps between islands read as breaks.",
  },
  breakpointsTitle: { zh: "断点", en: "Breakpoints" },
  breakpointsDesc: {
    zh: "CSS 变量不能用于媒体查询，下表是唯一约定；组件层档位判定在 app 内统一封装。",
    en: "CSS variables can't be used in media queries, so this table is the only contract; component-level tier checks are wrapped in one place per app.",
  },
  colWidth: { zh: "宽度", en: "Width" },
  colName: { zh: "名", en: "Name" },
  colBehavior: { zh: "行为", en: "Behavior" },
  containersTitle: { zh: "容器", en: "Containers" },
  containersDesc: {
    zh: "页面左右留白 --page-gutter 随视口三档变化（16 / 24 / 32）。",
    en: "The --page-gutter side padding changes in three viewport steps (16 / 24 / 32).",
  },
  fadeTitle: { zh: "滚动边缘渐隐（Scroll Edge Fade）", en: "Scroll edge fade" },
  fadeDesc: {
    zh: "凡滚动出容器窗口的内容，在内容出口方向施加 mask-image 渐变淡出；滚到顶/底/左/右尽头时对应侧自动恢复清晰。两档刻度 Token 实时读取自 var.css。",
    en: "Content scrolled past the container window fades out toward its exit edge via a mask-image gradient; when scrolled to the top/bottom/left/right end, the corresponding side sharpens automatically. Both tier tokens are read live from var.css.",
  },
  fadeStandard: { zh: "标准档（面板、列表、对话框主体、数据表格）", en: "standard tier (panels, lists, dialog bodies, data tables)" },
  fadeCompact: { zh: "紧凑档（下拉菜单、Listbox、横向标签条/胶囊条）", en: "compact tier (dropdown menus, listboxes, horizontal tab/pill strips)" },
  fadeDemo1Title: { zh: "纵向滚动 · 标准档 <code>v-scroll-fade</code>（24px）", en: "Vertical scroll · standard tier <code>v-scroll-fade</code> (24px)" },
  fadeDemo2Title: { zh: "横向胶囊条 · 紧凑档 <code>v-scroll-fade.sm</code>（12px）", en: "Horizontal pill strip · compact tier <code>v-scroll-fade.sm</code> (12px)" },
  fadeDemoNote: {
    zh: "试着上下/左右滚动：有内容溢出的出口方向淡出，贴边到头的一侧保持清晰。",
    en: "Scroll up/down or left/right: the exit edge with overflowing content fades, while the side flush at its end stays sharp.",
  },
  fadeRule1: {
    zh: "面板、对话框主体、列表与表格用标准档 <code>v-scroll-fade</code>（<code>--scroll-fade-size: 24px</code>）；下拉菜单、Listbox 与横向标签栏用紧凑档 <code>v-scroll-fade.sm</code>（<code>--scroll-fade-size-sm: 12px</code>）。",
    en: "Panels, dialog bodies, lists, and tables use the standard tier <code>v-scroll-fade</code> (<code>--scroll-fade-size: 24px</code>); dropdown menus, listboxes, and horizontal tab bars use the compact tier <code>v-scroll-fade.sm</code> (<code>--scroll-fade-size-sm: 12px</code>).",
  },
  fadeRule2: {
    zh: "统一走 <code>mask-image</code> 裁切 alpha 通道，不在边缘盖实色渐变伪元素——纸面、卡片、凹陷井与 <code>.mw-frost</code> 霜面上一律通透成立。",
    en: "Always clip the alpha channel via <code>mask-image</code>, never cover edges with solid-gradient pseudo-elements — it holds transparently on paper, cards, sunken wells, and <code>.mw-frost</code> alike.",
  },
  fadeRule3: {
    zh: "禁止在未溢出或已滚到尽头的一侧保留常驻遮罩——首尾行在尽头处必须 100% 清晰可见。",
    en: "Never keep a permanent mask on a side that isn't overflowing or has reached its end — the first/last lines must be 100% visible at the ends.",
  },
  rulesTitle: { zh: "规则", en: "Rules" },
  ruleDesktop: {
    zh: "1280 宽不出现横向滚动或内容被压碎；1440 宽下展示足够多的真实信息；390 宽主链路可达。",
    en: "At 1280 wide: no horizontal scrolling or crushed content; at 1440 wide: enough real information on display; at 390 wide: the main flows stay reachable.",
  },
  rulePhone: {
    zh: "手机档是单栏 + 页内展开；窄屏浮层用 CSS 换形，不 v-if 双实例（状态不丢）。",
    en: "The phone tier is single-column with in-page expansion; narrow-screen overlays reshape via CSS, not v-if twin instances (state is never lost).",
  },
  ruleTables: {
    zh: "数据表格在窄屏保持表格形态横向滚动，不折成卡片流。",
    en: "Data tables keep their table form with horizontal scrolling on narrow screens; they don't fold into card streams.",
  },
} as const;
</script>

<template>
  <DocPage>
    <DocSection :title="s.workbenchTitle" :desc="s.workbenchDesc">
      <div class="shell">
        <div class="shell__top"><span class="shell__logo" />{{ t(s.topbar) }} · --shell-topbar-h</div>
        <div class="shell__body">
          <div class="shell__sheet shell__sheet--side">{{ t(s.sidebar) }}<br /><code>--shell-sidebar-w</code></div>
          <div class="shell__sheet shell__sheet--main">{{ t(s.mainCol) }}<br /><code>flex: 1</code></div>
          <div class="shell__sheet shell__sheet--aside">{{ t(s.asideCol) }}<br /><code>--shell-aside-w</code></div>
        </div>
      </div>
      <ul class="doc-rules">
        <li data-kind="do" v-html="t(s.shellRule1)" />
        <li data-kind="do" v-html="t(s.shellRule2)" />
        <li data-kind="dont" v-html="t(s.shellRule3)" />
      </ul>
    </DocSection>

    <DocSection :title="s.breakpointsTitle" :desc="s.breakpointsDesc">
      <table class="doc-table">
        <thead><tr><th>{{ t(s.colWidth) }}</th><th>{{ t(s.colName) }}</th><th>{{ t(s.colBehavior) }}</th></tr></thead>
        <tbody>
          <tr v-for="row in breakpoints" :key="row.w"><td class="mw-tabular">≥ {{ row.w }}px</td><td><code>{{ row.n }}</code></td><td>{{ t(row.use) }}</td></tr>
        </tbody>
      </table>
    </DocSection>

    <DocSection :title="s.containersTitle" :desc="s.containersDesc">
      <div class="doc-stack">
        <div v-for="row in containers" :key="row.token" class="container-bar" :style="{ maxWidth: `var(${row.token})` }">
          <code>{{ row.token }}</code><span>{{ t(row.use) }}</span>
        </div>
      </div>
    </DocSection>

    <DocSection :title="s.fadeTitle" :desc="s.fadeDesc">
      <div ref="fadeHost" class="doc-stack" style="margin-bottom: var(--space-3)">
        <div class="container-bar">
          <code>--scroll-fade-size</code>
          <span>{{ fadeValues["--scroll-fade-size"] || "24px" }} · {{ t(s.fadeStandard) }}</span>
        </div>
        <div class="container-bar">
          <code>--scroll-fade-size-sm</code>
          <span>{{ fadeValues["--scroll-fade-size-sm"] || "12px" }} · {{ t(s.fadeCompact) }}</span>
        </div>
      </div>
      <Specimen>
        <div class="fade-demo-grid">
          <div class="fade-demo-card">
            <div class="fade-demo-title" v-html="t(s.fadeDemo1Title)" />
            <ul v-scroll-fade class="fade-demo-list mw-scroll">
              <li v-for="item in scrollItems" :key="item" class="fade-demo-item">{{ item }}</li>
            </ul>
          </div>
          <div class="fade-demo-card">
            <div class="fade-demo-title" v-html="t(s.fadeDemo2Title)" />
            <div v-scroll-fade.sm class="fade-demo-strip mw-scroll">
              <span v-for="(tag, i) in scrollTags" :key="i" class="fade-demo-pill">{{ t(tag) }}</span>
            </div>
            <div class="fade-demo-note">{{ t(s.fadeDemoNote) }}</div>
          </div>
        </div>
      </Specimen>
      <ul class="doc-rules">
        <li data-kind="do" v-html="t(s.fadeRule1)" />
        <li data-kind="do" v-html="t(s.fadeRule2)" />
        <li data-kind="dont" v-html="t(s.fadeRule3)" />
      </ul>
    </DocSection>

    <DocSection :title="s.rulesTitle">
      <ul class="doc-rules">
        <li v-html="t(s.ruleDesktop)" />
        <li v-html="t(s.rulePhone)" />
        <li v-html="t(s.ruleTables)" />
      </ul>
    </DocSection>
  </DocPage>
</template>

<style scoped>
.shell {
  display: grid;
  gap: var(--space-2);
  padding: 0 var(--space-2) var(--space-2);
  height: 300px;
  grid-template-rows: auto 1fr;
  border-radius: var(--radius-card);
  background: var(--bg-canvas);
  border: var(--border-width) solid var(--border-subtle);
  font-size: var(--type-caption-size);
  color: var(--text-secondary);
}

.shell__top {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  height: 40px;
  padding: 0 var(--space-2);
}

.shell__logo {
  width: 18px;
  height: 18px;
  border-radius: var(--radius-sm);
  background: var(--accent);
}

.shell__body {
  display: flex;
  gap: var(--space-2);
  min-height: 0;
}

.shell__sheet {
  padding: var(--space-3);
  border-radius: var(--radius-sheet);
  background: var(--shell-sheet-bg);
  border: var(--border-width) solid var(--shell-sheet-border);
  box-shadow: var(--shell-sheet-shadow);
}

.shell__sheet code {
  color: var(--text-tertiary);
  font-family: var(--font-mono);
  font-size: var(--type-micro-size);
}

.shell__sheet--side {
  width: 22%;
}

.shell__sheet--main {
  flex: 1;
}

.shell__sheet--aside {
  width: 26%;
}

.container-bar {
  display: flex;
  justify-content: space-between;
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-sm);
  background: var(--accent-subtle);
  box-shadow: inset 0 0 0 1px var(--accent-border);
  font-size: var(--type-caption-size);
}

.container-bar code {
  font-family: var(--font-mono);
}

.container-bar span {
  color: var(--text-secondary);
}

.fade-demo-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: var(--space-3);
  width: 100%;
}

.fade-demo-card {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  min-width: 0;
  padding: var(--space-3);
  border-radius: var(--radius-card);
  border: var(--border-width) solid var(--border-subtle);
  background: var(--fill-subtle);
}

.fade-demo-title {
  color: var(--text-secondary);
  font-size: var(--type-caption-size);
  font-weight: var(--weight-medium);
}

.fade-demo-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  max-height: 132px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.fade-demo-item {
  padding: var(--space-1-5) var(--space-2);
  border-radius: var(--radius-sm);
  background: var(--fill-default);
  color: var(--text-primary);
  font-size: var(--type-caption-size);
  line-height: var(--type-caption-line);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.fade-demo-strip {
  display: flex;
  align-items: center;
  gap: var(--space-1-5);
  padding-block: var(--space-1);
  overflow-x: auto;
  scrollbar-width: none;
}

.fade-demo-strip::-webkit-scrollbar {
  display: none;
}

.fade-demo-pill {
  flex-shrink: 0;
  padding: var(--space-1) var(--space-2-5);
  border-radius: var(--radius-full);
  border: var(--border-width) solid var(--border-default);
  background: var(--fill-default);
  color: var(--text-primary);
  font-size: var(--type-caption-size);
  white-space: nowrap;
}

.fade-demo-note {
  color: var(--text-tertiary);
  font-size: var(--type-caption-size);
  line-height: var(--type-caption-line);
}
</style>
