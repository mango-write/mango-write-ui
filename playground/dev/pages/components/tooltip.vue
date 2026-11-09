<script setup lang="ts">
import { Bold, Bookmark, Copy, Download, Italic, Link2, Sparkles } from "lucide-vue-next";
import { ref } from "vue";
import { Button, vTooltip } from "@mango-write/ui-vue";
import { api } from "../../api/entries/tooltip";
import ApiTable from "../../kit/ApiTable.vue";
import DocPage from "../../kit/DocPage.vue";
import DocSection from "../../kit/DocSection.vue";
import Specimen from "../../kit/Specimen.vue";
import StateGrid from "../../kit/StateGrid.vue";
import StateRow from "../../kit/StateRow.vue";
import UsagePlayground from "../../kit/UsagePlayground.vue";
import { t } from "../../i18n";
import { usage } from "../../usage/entries/tooltip";

const copied = ref(false);
function toggleCopyTip() {
  copied.value = !copied.value;
}

const s = {
  demo: { zh: "在线演示", en: "Live demo" },
  demoDesc: {
    zh: "调整配置即时预览；查看生成代码，一键复制到项目。",
    en: "Tweak the options for a live preview; view the generated code and copy it into your project.",
  },
  whenToUse: { zh: "何时使用", en: "When to use" },
  do1: {
    zh: "为工具栏 icon-only 按钮提供动作名称与快捷键提示（如 <code>\"加粗 (⌘B)\"</code>）。",
    en: "Give toolbar icon-only buttons an action name and shortcut hint (e.g. <code>\"Bold (⌘B)\"</code>).",
  },
  do2: {
    zh: "为空间受限的单行截断标识（如长文件名、引用键）补充完整纯文本。",
    en: "Supply the full plain text for space-constrained truncated labels (e.g. long filenames, cite keys).",
  },
  dont1: {
    zh: "需要放置按钮、链接或多行结构化内容时用 <code>HoverCard</code>，不要往指令里塞富内容。",
    en: "Use a <code>HoverCard</code> for buttons, links, or multi-line structured content; don't stuff rich content into the directive.",
  },
  dont2: {
    zh: "按钮本身已有完整文字标签且无快捷键等补充信息时，不要重复挂载同文 Tooltip。",
    en: "Don't mount a duplicate tooltip repeating a button's own full label when there's nothing extra (like a shortcut) to add.",
  },
  toolbarTitle: { zh: "底面与工具条实景", en: "Surface and toolbar in context" },
  toolbarDesc: {
    zh: "指令生成的 DOM 挂载在 body 下并复用全局 .mw-hovercard__panel 厚霜样式。下方可悬停体验工具条图标提示，并直接对照静态面板外观。",
    en: "The directive's DOM mounts under body and reuses the global .mw-hovercard__panel thick-frost styling. Hover the toolbar icons below, and compare the static panels directly.",
  },
  bold: { zh: "加粗", en: "Bold" },
  boldTip: { zh: "加粗 (⌘B)", en: "Bold (⌘B)" },
  italic: { zh: "斜体", en: "Italic" },
  italicTip: { zh: "斜体 (⌘I)", en: "Italic (⌘I)" },
  cite: { zh: "插入文献引用", en: "Insert citation" },
  citeTip: { zh: "插入文献引用 (⌘K)", en: "Insert citation (⌘K)" },
  bookmark: { zh: "加入收藏夹", en: "Add to favorites" },
  aiPolish: { zh: "AI 润色", en: "AI polish" },
  aiTip: { zh: "AI 润色当前段落", en: "AI-polish the current paragraph" },
  staticExport: { zh: "导出 PDF 预印本", en: "Export PDF preprint" },
  dirTitle: { zh: "方向修饰符", en: "Direction modifiers" },
  dirDesc: {
    zh: "通过指令修饰符 .top（默认）/ .bottom / .left / .right 指定首选方向；靠近视口边缘时自动向对侧翻转。",
    en: "Pick the preferred side with the .top (default) / .bottom / .left / .right modifiers; flips to the opposite side near the viewport edge.",
  },
  topBtn: { zh: "上方 .top", en: "Top .top" },
  topTip: { zh: "上方提示 (.top 默认)", en: "Hint above (.top default)" },
  bottomBtn: { zh: "下方 .bottom", en: "Bottom .bottom" },
  bottomTip: { zh: "下方提示 (.bottom)", en: "Hint below (.bottom)" },
  leftBtn: { zh: "左侧 .left", en: "Left .left" },
  leftTip: { zh: "左侧提示 (.left)", en: "Hint left (.left)" },
  rightBtn: { zh: "右侧 .right", en: "Right .right" },
  rightTip: { zh: "右侧提示 (.right)", en: "Hint right (.right)" },
  stateTitle: { zh: "状态与响应式更新", en: "States and reactive updates" },
  stateDesc: {
    zh: "支持鼠标悬停与键盘 Tab 聚焦触发；绑定值动态更新时原位刷新文本并重算坐标，传入空字符串自动隐藏。",
    en: "Triggers on hover and keyboard Tab focus; the text refreshes in place and coordinates recompute when the bound value changes, and an empty string hides it.",
  },
  colIconBtn: { zh: "图标按钮", en: "Icon button" },
  colDynamic: { zh: "动态文案更新", en: "Dynamic text updates" },
  colTruncated: { zh: "截断文本补全", en: "Truncated text completion" },
  colEmpty: { zh: "空字符串静默", en: "Empty string stays silent" },
  rowHoverTab: { zh: "悬停 / Tab", en: "Hover / Tab" },
  downloadTip: { zh: "下载 PDF 原文", en: "Download PDF source" },
  copiedTip: { zh: "已复制到剪贴板 ✓", en: "Copied to clipboard ✓" },
  switchTip: { zh: "点击切换提示文案", en: "Click to toggle the tooltip text" },
  copiedLabel: { zh: "已复制", en: "Copied" },
  copyKeyLabel: { zh: "复制引用键", en: "Copy cite key" },
  truncatedFile: {
    zh: "2026-東亞季風區對流參數化方案敏感性試驗數據集.nc",
    en: "2026-east-asian-monsoon-convection-param-sensitivity-dataset.nc",
  },
  emptyBtn: { zh: "空值不弹出", en: "Empty shows nothing" },
  api: { zh: "接口", en: "API" },
} as const;
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

    <DocSection :title="s.toolbarTitle" :desc="s.toolbarDesc">
      <Specimen :surfaces="['paper', 'frost']" layout="stack">
        <div class="doc-row mw-toolbar">
          <Button v-tooltip.top="t(s.boldTip)" size="sm" variant="text" severity="secondary" :icon="Bold" :aria-label="t(s.bold)" />
          <Button v-tooltip.top="t(s.italicTip)" size="sm" variant="text" severity="secondary" :icon="Italic" :aria-label="t(s.italic)" />
          <Button v-tooltip.top="t(s.citeTip)" size="sm" variant="text" severity="secondary" :icon="Link2" :aria-label="t(s.cite)" />
          <Button v-tooltip.top="t(s.bookmark)" size="sm" variant="text" severity="secondary" :icon="Bookmark" :aria-label="t(s.bookmark)" />
          <Button v-tooltip.top="t(s.aiTip)" size="sm" variant="tinted" :icon="Sparkles" :aria-label="t(s.aiPolish)" />
        </div>

        <div class="doc-row">
          <span class="tooltip-static">{{ t(s.boldTip) }}</span>
          <span class="tooltip-static">{{ t(s.citeTip) }}</span>
          <span class="tooltip-static">{{ t(s.staticExport) }}</span>
        </div>
      </Specimen>
    </DocSection>

    <DocSection :title="s.dirTitle" :desc="s.dirDesc">
      <Specimen themes="single">
        <Button v-tooltip.top="t(s.topTip)" size="sm" severity="secondary" :label="t(s.topBtn)" />
        <Button v-tooltip.bottom="t(s.bottomTip)" size="sm" severity="secondary" :label="t(s.bottomBtn)" />
        <Button v-tooltip.left="t(s.leftTip)" size="sm" severity="secondary" :label="t(s.leftBtn)" />
        <Button v-tooltip.right="t(s.rightTip)" size="sm" severity="secondary" :label="t(s.rightBtn)" />
      </Specimen>
    </DocSection>

    <DocSection :title="s.stateTitle" :desc="s.stateDesc">
      <Specimen themes="both">
        <StateGrid :columns="[s.colIconBtn, s.colDynamic, s.colTruncated, s.colEmpty]" label-width="76px">
          <StateRow :label="s.rowHoverTab">
            <Button
              v-tooltip.top="t(s.downloadTip)"
              size="sm"
              severity="secondary"
              :icon="Download"
              :aria-label="t(s.downloadTip)"
            />
            <Button
              v-tooltip.top="copied ? t(s.copiedTip) : t(s.switchTip)"
              size="sm"
              variant="tinted"
              :icon="Copy"
              :label="copied ? t(s.copiedLabel) : t(s.copyKeyLabel)"
              @click="toggleCopyTip"
            />
            <span v-tooltip.top="t(s.truncatedFile)" class="truncated-pill" tabindex="0">
              {{ t(s.truncatedFile) }}
            </span>
            <Button v-tooltip.top="''" size="sm" variant="text" severity="secondary" :label="t(s.emptyBtn)" />
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
.tooltip-static {
  display: inline-block;
  padding: var(--space-1-5) var(--space-2-5);
  border-radius: var(--radius-md);
  background-color: var(--frost-bg-thick);
  -webkit-backdrop-filter: var(--frost-blur);
  backdrop-filter: var(--frost-blur);
  border: var(--border-width) solid var(--frost-border);
  box-shadow: var(--frost-highlight), var(--shadow-floating);
  color: var(--text-primary);
  font-size: var(--type-caption-size);
  line-height: var(--type-caption-line);
}

.truncated-pill {
  display: inline-block;
  max-width: 150px;
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-sm);
  background: var(--fill-default);
  color: var(--text-secondary);
  font-size: var(--type-caption-size);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
