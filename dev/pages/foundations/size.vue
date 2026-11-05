<script setup lang="ts">
import { ref } from "vue";
import { Filter, Search, Settings2 } from "lucide-vue-next";
import { Button, InputText } from "../../../src";
import DocPage from "../../kit/DocPage.vue";
import DocSection from "../../kit/DocSection.vue";
import Specimen from "../../kit/Specimen.vue";
import { useTokenValues } from "../../kit/tokens";
import { t, type Bi } from "../../i18n";

const sizes = ["xs", "sm", "md", "lg"] as const;
const parts = ["h", "font", "icon", "px", "gap", "radius"] as const;
const usage: Record<(typeof sizes)[number], Bi> = {
  xs: { zh: "嵌入式微控件", en: "Embedded micro controls" },
  sm: { zh: "紧凑行、表格行内", en: "Compact rows, inline in tables" },
  md: { zh: "默认：表单、对话框、页头", en: "Default: forms, dialogs, page headers" },
  lg: { zh: "营销与空态主 CTA", en: "Primary CTAs in marketing and empty states" },
};
const spaces = ["0-5", "1", "1-5", "2", "2-5", "3", "4", "5", "6", "8", "10", "12", "16", "20"];

const host = ref<HTMLElement | null>(null);
const { values } = useTokenValues(host, () => [
  ...sizes.flatMap((size) => parts.map((p) => `--size-${size}-${p}`)),
  ...spaces.map((sp) => `--space-${sp}`),
]);

function px(v: string | undefined) {
  if (!v) return "";
  return v.endsWith("rem") ? `${Number.parseFloat(v) * 16}px` : v;
}
const field = ref("");

const s = {
  axisTitle: { zh: "尺寸轴", en: "Size axis" },
  axisDesc: {
    zh: "每档一次定义高度、字号、图标、横向内距、间隙与圆角。图标约为高度的一半，icon-only 控件恒为正方形。",
    en: "Each tier defines height, font size, icon, horizontal padding, gap, and radius in one place. Icons are about half the height; icon-only controls are always square.",
  },
  colTier: { zh: "档", en: "Tier" },
  colHeight: { zh: "高", en: "Height" },
  colFont: { zh: "字号", en: "Font" },
  colIcon: { zh: "图标", en: "Icon" },
  colPadding: { zh: "内距", en: "Padding" },
  colGap: { zh: "间隙", en: "Gap" },
  colRadius: { zh: "圆角", en: "Radius" },
  colUsage: { zh: "用途", en: "Usage" },
  colExample: { zh: "示例", en: "Example" },
  search: { zh: "检索", en: "Search" },
  apply: { zh: "应用", en: "Apply" },
  settings: { zh: "设置", en: "Settings" },
  densityTitle: { zh: "密度上下文", en: "Density contexts" },
  densityDesc: {
    zh: "组件读继承的 --control-*。传 size = 该组件定档；容器挂 .mw-size-* = 容器内所有未定档控件跟随。这是改密度的唯一方式。",
    en: "Components read inherited --control-*. Passing size pins that one component; putting .mw-size-* on a container makes every unpinned control inside follow. This is the only way to change density.",
  },
  defaultMd: { zh: "默认（md）", en: "Default (md)" },
  containerSm: { zh: "容器 .mw-size-sm", en: "Container .mw-size-sm" },
  toolbarRole: { zh: "工具条角色", en: "Toolbar role" },
  searchRefs: { zh: "搜索文献", en: "Search references" },
  filter: { zh: "筛选", en: "Filter" },
  import: { zh: "导入", en: "Import" },
  onlyMine: { zh: "仅看我的", en: "Only mine" },
  searchAria: { zh: "搜索", en: "Search" },
  ruleDo: {
    zh: "同一行里的输入、下拉、按钮必须同档——容器定档天然保证这一点。",
    en: "Inputs, selects, and buttons on the same row must share a tier — container-level tiers guarantee this for free.",
  },
  ruleDont: {
    zh: "不为省空间把单个控件缩成 sm；省空间的正解是收窄容器、砍字段。",
    en: "Don't shrink a single control to sm to save space; the right fix is narrowing the container or cutting fields.",
  },
  ruleHit: {
    zh: "触屏（pointer: coarse）下控件视觉不变，命中区由伪元素扩到 <span class=\"doc-code\">--hit-min</span>。",
    en: "On touch (pointer: coarse) controls look unchanged; pseudo-elements grow the hit area to <span class=\"doc-code\">--hit-min</span>.",
  },
  spacingTitle: { zh: "间距", en: "Spacing" },
  spacingDesc: {
    zh: "4px 网格。组件内部 1 / 1.5 / 2 / 3；组件之间 2 / 3 / 4；区块之间 6 / 8；页面级 12 / 16。半档（0-5 / 1-5 / 2-5）只给控件内部微调。",
    en: "A 4px grid. Inside components 1 / 1.5 / 2 / 3; between components 2 / 3 / 4; between sections 6 / 8; page level 12 / 16. Half steps (0-5 / 1-5 / 2-5) are for fine-tuning inside controls only.",
  },
} as const;
</script>

<template>
  <DocPage>
    <DocSection :title="s.axisTitle" :desc="s.axisDesc">
      <div ref="host">
        <table class="doc-table">
          <thead>
            <tr>
              <th>{{ t(s.colTier) }}</th><th>{{ t(s.colHeight) }}</th><th>{{ t(s.colFont) }}</th><th>{{ t(s.colIcon) }}</th><th>{{ t(s.colPadding) }}</th><th>{{ t(s.colGap) }}</th><th>{{ t(s.colRadius) }}</th><th>{{ t(s.colUsage) }}</th><th>{{ t(s.colExample) }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="sz in sizes" :key="sz">
              <td><code>{{ sz }}</code></td>
              <td v-for="p in parts" :key="p" class="mw-tabular">{{ px(values[`--size-${sz}-${p}`]) }}</td>
              <td>{{ t(usage[sz]) }}</td>
              <td>
                <div class="doc-row" :class="`mw-size-${sz}`" style="flex-wrap: nowrap; gap: var(--space-2)">
                  <InputText v-model="field" :placeholder="t(s.search)" style="width: 96px" />
                  <Button :label="t(s.apply)" />
                  <Button variant="text" severity="secondary" :icon="Settings2" :aria-label="t(s.settings)" />
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </DocSection>

    <DocSection :title="s.densityTitle" :desc="s.densityDesc">
      <Specimen themes="single" layout="stack">
        <div class="doc-row">
          <span class="doc-note" style="width: 96px">{{ t(s.defaultMd) }}</span>
          <InputText :placeholder="t(s.searchRefs)" style="width: 200px" />
          <Button severity="secondary" :label="t(s.filter)" :icon="Filter" />
          <Button :label="t(s.import)" />
        </div>
        <div class="doc-row mw-size-sm">
          <span class="doc-note" style="width: 96px">{{ t(s.containerSm) }}</span>
          <InputText :placeholder="t(s.searchRefs)" style="width: 200px" />
          <Button severity="secondary" :label="t(s.filter)" :icon="Filter" />
          <Button :label="t(s.import)" />
        </div>
        <div class="doc-row mw-toolbar">
          <span class="doc-note" style="width: 96px">{{ t(s.toolbarRole) }}</span>
          <InputText :placeholder="t(s.searchRefs)" style="width: 200px" />
          <Button severity="secondary" :label="t(s.filter)" :icon="Filter" />
          <Button severity="secondary" class="is-active" :label="t(s.onlyMine)" />
          <Button variant="text" severity="secondary" :icon="Search" :aria-label="t(s.searchAria)" />
        </div>
      </Specimen>
      <ul class="doc-rules">
        <li data-kind="do" v-html="t(s.ruleDo)" />
        <li data-kind="dont" v-html="t(s.ruleDont)" />
        <li v-html="t(s.ruleHit)" />
      </ul>
    </DocSection>

    <DocSection :title="s.spacingTitle" :desc="s.spacingDesc">
      <div class="space-scale">
        <div v-for="sp in spaces" :key="sp" class="space-row">
          <code>--space-{{ sp }}</code>
          <span class="mw-tabular">{{ values[`--space-${sp}`] }}</span>
          <span class="space-bar" :style="{ width: `var(--space-${sp})` }" />
        </div>
      </div>
    </DocSection>
  </DocPage>
</template>

<style scoped>
.space-scale {
  display: grid;
  gap: var(--space-1-5);
}

.space-row {
  display: grid;
  grid-template-columns: 120px 48px 1fr;
  align-items: center;
  gap: var(--space-3);
  font-size: var(--type-caption-size);
  color: var(--text-secondary);
}

.space-row code {
  font-family: var(--font-mono);
  color: var(--text-primary);
}

.space-bar {
  height: 12px;
  border-radius: var(--radius-2xs);
  background: var(--accent);
}
</style>
