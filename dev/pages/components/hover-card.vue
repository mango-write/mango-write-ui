<script setup lang="ts">
import { computed } from "vue";
import { BookOpen, ExternalLink } from "lucide-vue-next";
import { Button, HoverCard, Tag, UserCard, UserChip, type UserProfile } from "../../../src";
import { api } from "../../api/entries/hover-card";
import ApiTable from "../../kit/ApiTable.vue";
import DocPage from "../../kit/DocPage.vue";
import DocSection from "../../kit/DocSection.vue";
import Specimen from "../../kit/Specimen.vue";
import StateGrid from "../../kit/StateGrid.vue";
import StateRow from "../../kit/StateRow.vue";
import UsagePlayground from "../../kit/UsagePlayground.vue";
import { t } from "../../i18n";
import { usage } from "../../usage/entries/hover-card";

const s = {
  demo: { zh: "在线演示", en: "Live demo" },
  demoDesc: {
    zh: "调整配置即时预览；查看生成代码，一键复制到项目。",
    en: "Tweak the options for a live preview; view the generated code and copy it into your project.",
  },
  whenToUse: { zh: "何时使用", en: "When to use" },
  do1: {
    zh: "正文内联锚点的上下文预览：引用角标 <code>[1]</code>、协作者 <code>UserChip</code>、双链笔记标题。",
    en: "Context previews for inline anchors in the body: citation markers <code>[1]</code>, collaborator <code>UserChip</code>s, backlink note titles.",
  },
  do2: {
    zh: "面板内含链接或操作按钮时保持默认 <code>interactive: true</code>，用户可将指针移入卡片或按 Tab 键进入。",
    en: "Keep the default <code>interactive: true</code> when the panel contains links or action buttons, so users can move the pointer in or Tab into the card.",
  },
  dont1: {
    zh: "单行纯文本提示（如工具栏图标说明）用 <code>v-tooltip</code> 指令。",
    en: "For single-line plain-text hints (e.g. toolbar icon explanations), use the <code>v-tooltip</code> directive.",
  },
  dont2: {
    zh: "锚点本身已是可聚焦控件（<code>Button</code> / <code>a</code>）时，务必传 <code>:focusable=\"false\"</code> 避免双重 Tab 停靠。",
    en: "When the anchor is already a focusable control (<code>Button</code> / <code>a</code>), pass <code>:focusable=\"false\"</code> to avoid a double Tab stop.",
  },
  previewTitle: { zh: "底面与阅读流预览", en: "Surface and reading-flow preview" },
  previewDesc: {
    zh: "将指针悬停或 Tab 聚焦至引用角标与成员纸片体验延迟展开；下方同时给出静态卡片样式供对照。",
    en: "Hover or Tab onto the citation marker and member chip to feel the delayed reveal; a static card is shown below for comparison.",
  },
  bodyPrefix: {
    zh: "对流参数化方案的不确定性仍是区域气候预估的主要误差来源",
    en: "Uncertainty in convective parameterization remains the dominant error source in regional climate projections",
  },
  midBy: { zh: "，本节由", en: ". Simulation comparison experiments were contributed by " },
  tail: { zh: "负责补充模拟对比实验。", en: "." },
  citeLabel: { zh: "引用文献详情", en: "Reference details" },
  citedNote: { zh: "被引 142 次", en: "142 citations" },
  locateBtn: { zh: "定位文库", en: "Locate in library" },
  memberLabel: { zh: "成员名片", en: "Member card" },
  staticTag: { zh: "静态解剖预览", en: "Static anatomy preview" },
  dirTitle: { zh: "弹出方向", en: "Placement" },
  dirDesc: {
    zh: "支持 top（默认）/ right / bottom / left 四向；当首选方向放不下且对侧空间更充裕时自动翻转，并在滚动期间实时跟随锚点。",
    en: "Supports top (default) / right / bottom / left; flips automatically when the preferred side doesn't fit and the opposite side has more room, and tracks the anchor while scrolling.",
  },
  dirCardLabel: { zh: "方向预览", en: "Placement preview" },
  dirCardPrefix: { zh: "方向：", en: "Placement: " },
  dirCardBody: {
    zh: "视口系 fixed 定位，内部容器滚动时紧跟锚点不漂移。",
    en: "Positioned in the viewport (fixed); tracks the anchor without drifting when inner containers scroll.",
  },
  modeTitle: { zh: "状态与交互模式", en: "States and interaction modes" },
  modeDesc: {
    zh: "区分可交互卡片（role='dialog'）与纯展示提示（interactive=false, role='tooltip'）。",
    en: "Distinguishes interactive cards (role='dialog') from display-only hints (interactive=false, role='tooltip').",
  },
  colInteractive: { zh: "可交互 (默认)", en: "Interactive (default)" },
  colTooltipOnly: { zh: "纯提示 (interactive=false)", en: "Tooltip only (interactive=false)" },
  colWrapBtn: { zh: "包裹按钮 (focusable=false)", en: "Wrapping a button (focusable=false)" },
  colBlock: { zh: "块级盒 (block)", en: "Block box (block)" },
  colDisabled: { zh: "禁用 (disabled)", en: "Disabled" },
  rowHover: { zh: "悬停体验", en: "Hover to try" },
  interactiveLabel: { zh: "可交互卡片", en: "Interactive card" },
  anchorClick: { zh: "[可移入点击]", en: "[Hover & click]" },
  interactiveTitle: { zh: "支持指针停留与 Tab 进入", en: "Pointer can stay; Tab can enter" },
  openSourceBtn: { zh: "打开原文", en: "Open source" },
  tooltipAnchor: { zh: "[纯提示模式]", en: "[Tooltip only]" },
  tooltipBody: {
    zh: "pointer-events: none，指针移出锚点即收起。",
    en: "pointer-events: none; collapses as soon as the pointer leaves the anchor.",
  },
  btnNoteLabel: { zh: "按钮悬浮说明", en: "Button hover note" },
  btnNoTab: { zh: "无双重 Tab", en: "No double Tab" },
  btnNoteBody: {
    zh: "触发器本身可聚焦，设 focusable=false。",
    en: "The trigger is focusable itself; set focusable=false.",
  },
  blockLabel: { zh: "整行悬停", en: "Full-row hover" },
  blockAnchor: { zh: "整行块级锚点", en: "Full-row block anchor" },
  blockBody: {
    zh: "block=true 时外层 wrapper 为 display: block。",
    en: "With block=true the outer wrapper is display: block.",
  },
  disabledAnchor: { zh: "[已禁用]", en: "[Disabled]" },
  noPopup: { zh: "不会弹出", en: "Nothing pops up" },
  api: { zh: "接口", en: "API" },
} as const;

/* UserChip/UserCard 直读字符串字段,名片按当前语言重建 */
const authorProfile = computed<UserProfile>(() => ({
  id: "u-lin-2026",
  handle: "@lin_wei",
  name: t({ zh: "林蔚", en: "Lin Wei" }),
  badge: t({ zh: "通讯作者", en: "Corresponding author" }),
  role: t({ zh: "地球系统模式实验室 · 研究员", en: "Earth System Modeling Lab · Researcher" }),
  email: "linwei@example.edu.cn",
  description: t({
    zh: "主要从事海气耦合模式、极端降水归因与科学智能辅助写作研究。",
    en: "Works on air–sea coupled models, extreme-precipitation attribution, and AI-assisted scientific writing.",
  }),
}));
</script>

<template>
  <DocPage>
    <DocSection :title="s.demo" :desc="s.demoDesc">
      <UsagePlayground :entry="usage" />
    </DocSection>
    <DocSection :title="s.whenToUse">
      <ul class="doc-rules">
        <li data-kind="do" v-html="t(s.do1)" />
        <li data-kind="do" v-html="t(s.do2)" />
        <li data-kind="dont" v-html="t(s.dont1)" />
        <li data-kind="dont" v-html="t(s.dont2)" />
      </ul>
    </DocSection>

    <DocSection :title="s.previewTitle" :desc="s.previewDesc">
      <Specimen :surfaces="['paper', 'frost']" layout="stack">
        <p style="margin: 0; font-size: var(--type-body-size); line-height: var(--type-body-line)">
          {{ t(s.bodyPrefix) }}
          <HoverCard placement="top" :label="t(s.citeLabel)">
            <span class="cite-anchor">[1]</span>
            <template #content>
              <div class="cite-card">
                <div class="cite-card__meta">
                  <Tag severity="primary" rounded>Nature · 2024</Tag>
                  <span class="doc-note">{{ t(s.citedNote) }}</span>
                </div>
                <strong class="cite-card__title">
                  Convective parameterization uncertainty in high-resolution climate projections
                </strong>
                <span class="cite-card__authors">Lin, W., Zhang, H., &amp; Vance, E.</span>
                <div class="doc-row" style="justify-content: space-between; margin-top: var(--space-1)">
                  <span class="doc-note">10.1038/s41586-024-07123-x</span>
                  <Button size="xs" variant="text" :icon="ExternalLink" :label="t(s.locateBtn)" />
                </div>
              </div>
            </template>
          </HoverCard>
          {{ t(s.midBy) }}
          <HoverCard placement="bottom" :label="t(s.memberLabel)">
            <UserChip :user="authorProfile" :show-card="false" />
            <template #content>
              <UserCard :user="authorProfile" />
            </template>
          </HoverCard>
          {{ t(s.tail) }}
        </p>

        <div class="hovercard-static mw-frost mw-frost--thick">
          <div class="cite-card">
            <div class="cite-card__meta">
              <Tag severity="info" rounded>{{ t(s.staticTag) }}</Tag>
              <span class="doc-note">.mw-hovercard__panel--card</span>
            </div>
            <strong class="cite-card__title">Attention Is All You Need</strong>
            <span class="cite-card__authors">Vaswani, A., Shazeer, N., Parmar, N., et al. · NeurIPS 2017</span>
          </div>
        </div>
      </Specimen>
    </DocSection>

    <DocSection :title="s.dirTitle" :desc="s.dirDesc">
      <Specimen themes="single">
        <HoverCard
          v-for="p in (['top', 'right', 'bottom', 'left'] as const)"
          :key="p"
          :placement="p"
          :focusable="false"
          :label="t(s.dirCardLabel)"
        >
          <Button size="sm" severity="secondary" :label="`placement=${p}`" />
          <template #content>
            <div class="cite-card" style="max-width: 220px">
              <strong class="cite-card__title">{{ t(s.dirCardPrefix) }}{{ p }}</strong>
              <span class="cite-card__authors">{{ t(s.dirCardBody) }}</span>
            </div>
          </template>
        </HoverCard>
      </Specimen>
    </DocSection>

    <DocSection :title="s.modeTitle" :desc="s.modeDesc">
      <Specimen themes="both">
        <StateGrid
          :columns="[s.colInteractive, s.colTooltipOnly, s.colWrapBtn, s.colBlock, s.colDisabled]"
          label-width="76px"
        >
          <StateRow :label="s.rowHover">
            <HoverCard :label="t(s.interactiveLabel)">
              <span class="cite-anchor">{{ t(s.anchorClick) }}</span>
              <template #content>
                <div class="cite-card" style="max-width: 220px">
                  <strong class="cite-card__title">{{ t(s.interactiveTitle) }}</strong>
                  <Button size="xs" variant="tinted" :icon="BookOpen" :label="t(s.openSourceBtn)" />
                </div>
              </template>
            </HoverCard>

            <HoverCard :interactive="false">
              <span class="cite-anchor">{{ t(s.tooltipAnchor) }}</span>
              <template #content>
                <div class="cite-card" style="max-width: 220px">
                  <span class="cite-card__authors">{{ t(s.tooltipBody) }}</span>
                </div>
              </template>
            </HoverCard>

            <HoverCard :focusable="false" :label="t(s.btnNoteLabel)">
              <Button size="sm" severity="secondary" :label="t(s.btnNoTab)" />
              <template #content>
                <span class="doc-note">{{ t(s.btnNoteBody) }}</span>
              </template>
            </HoverCard>

            <HoverCard block :label="t(s.blockLabel)">
              <div class="block-anchor">{{ t(s.blockAnchor) }}</div>
              <template #content>
                <span class="doc-note">{{ t(s.blockBody) }}</span>
              </template>
            </HoverCard>

            <HoverCard disabled>
              <span class="cite-anchor" style="opacity: var(--opacity-disabled)">{{ t(s.disabledAnchor) }}</span>
              <template #content>
                <span>{{ t(s.noPopup) }}</span>
              </template>
            </HoverCard>
          </StateRow>
        </StateGrid>
      </Specimen>
    </DocSection>

    <DocSection :title="s.api">
      <ApiTable :api="api" />
    </DocSection>
  </DocPage>
</template>

<style scoped>
.cite-anchor {
  display: inline-flex;
  align-items: center;
  padding: 0 var(--space-1-5);
  border-radius: var(--radius-xs);
  background: var(--accent-subtle);
  color: var(--text-accent);
  font-family: var(--font-mono);
  font-size: var(--type-caption-size);
  font-weight: var(--weight-medium);
  cursor: pointer;
}

.cite-card {
  display: grid;
  gap: var(--space-1-5);
  max-width: 280px;
}

.cite-card__meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-2);
}

.cite-card__title {
  color: var(--text-primary);
  font-size: var(--type-body-sm-size);
  line-height: var(--type-body-sm-line);
  font-weight: var(--weight-semibold);
}

.cite-card__authors {
  color: var(--text-secondary);
  font-size: var(--type-caption-size);
  line-height: var(--type-caption-line);
}

.hovercard-static {
  max-width: 300px;
  padding: var(--space-3);
  border-radius: var(--radius-float);
}

.block-anchor {
  padding: var(--space-1) var(--space-2-5);
  border-radius: var(--radius-sm);
  background: var(--fill-default);
  font-size: var(--type-caption-size);
}
</style>
