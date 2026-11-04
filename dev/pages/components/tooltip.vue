<script setup lang="ts">
import { Bold, Bookmark, Copy, Download, Italic, Link2, Sparkles } from "lucide-vue-next";
import { ref } from "vue";
import { Button, vTooltip } from "../../../src";
import DocPage from "../../kit/DocPage.vue";
import DocSection from "../../kit/DocSection.vue";
import Specimen from "../../kit/Specimen.vue";
import StateGrid from "../../kit/StateGrid.vue";
import StateRow from "../../kit/StateRow.vue";

const copied = ref(false);
function toggleCopyTip() {
  copied.value = !copied.value;
}
</script>

<template>
  <DocPage
    lead="文字提示指令：通过 v-tooltip 为纯图标按钮或截断文本附加简短说明。与 HoverCard 共用视口系定位算法与厚霜面板（.mw-hovercard__panel），无箭头、悬停 150ms 出场、按 Esc 或滚出视口自动收起。"
  >
    <DocSection title="何时使用">
      <ul class="doc-rules">
        <li data-kind="do">为工具栏 icon-only 按钮提供动作名称与快捷键提示（如 <code>"加粗 (⌘B)"</code>）。</li>
        <li data-kind="do">为空间受限的单行截断标识（如长文件名、引用键）补充完整纯文本。</li>
        <li data-kind="dont">需要放置按钮、链接或多行结构化内容时用 <code>HoverCard</code>，不要往指令里塞富内容。</li>
        <li data-kind="dont">按钮本身已有完整文字标签且无快捷键等补充信息时，不要重复挂载同文 Tooltip。</li>
      </ul>
    </DocSection>

    <DocSection
      title="底面与工具条实景"
      desc="指令生成的 DOM 挂载在 body 下并复用全局 .mw-hovercard__panel 厚霜样式。下方可悬停体验工具条图标提示，并直接对照静态面板外观。"
    >
      <Specimen :surfaces="['paper', 'frost']" layout="stack">
        <div class="doc-row mw-toolbar">
          <Button v-tooltip.top="'加粗 (⌘B)'" size="sm" variant="text" severity="secondary" :icon="Bold" aria-label="加粗" />
          <Button v-tooltip.top="'斜体 (⌘I)'" size="sm" variant="text" severity="secondary" :icon="Italic" aria-label="斜体" />
          <Button v-tooltip.top="'插入文献引用 (⌘K)'" size="sm" variant="text" severity="secondary" :icon="Link2" aria-label="插入文献引用" />
          <Button v-tooltip.top="'加入收藏夹'" size="sm" variant="text" severity="secondary" :icon="Bookmark" aria-label="加入收藏夹" />
          <Button v-tooltip.top="'AI 润色当前段落'" size="sm" variant="tinted" :icon="Sparkles" aria-label="AI 润色" />
        </div>

        <div class="doc-row">
          <span class="tooltip-static">加粗 (⌘B)</span>
          <span class="tooltip-static">插入文献引用 (⌘K)</span>
          <span class="tooltip-static">导出 PDF 预印本</span>
        </div>
      </Specimen>
    </DocSection>

    <DocSection
      title="方向修饰符"
      desc="通过指令修饰符 .top（默认）/ .bottom / .left / .right 指定首选方向；靠近视口边缘时自动向对侧翻转。"
    >
      <Specimen themes="single">
        <Button v-tooltip.top="'上方提示 (.top 默认)'" size="sm" severity="secondary" label="上方 .top" />
        <Button v-tooltip.bottom="'下方提示 (.bottom)'" size="sm" severity="secondary" label="下方 .bottom" />
        <Button v-tooltip.left="'左侧提示 (.left)'" size="sm" severity="secondary" label="左侧 .left" />
        <Button v-tooltip.right="'右侧提示 (.right)'" size="sm" severity="secondary" label="右侧 .right" />
      </Specimen>
    </DocSection>

    <DocSection
      title="状态与响应式更新"
      desc="支持鼠标悬停与键盘 Tab 聚焦触发；绑定值动态更新时原位刷新文本并重算坐标，传入空字符串自动隐藏。"
    >
      <Specimen themes="both">
        <StateGrid :columns="['图标按钮', '动态文案更新', '截断文本补全', '空字符串静默']" label-width="76px">
          <StateRow label="悬停 / Tab">
            <Button
              v-tooltip.top="'下载 PDF 原文'"
              size="sm"
              severity="secondary"
              :icon="Download"
              aria-label="下载 PDF 原文"
            />
            <Button
              v-tooltip.top="copied ? '已复制到剪贴板 ✓' : '点击切换提示文案'"
              size="sm"
              variant="tinted"
              :icon="Copy"
              :label="copied ? '已复制' : '复制引用键'"
              @click="toggleCopyTip"
            />
            <span
              v-tooltip.top="'2026-東亞季風區對流參數化方案敏感性試驗數據集.nc'"
              class="truncated-pill"
              tabindex="0"
            >
              2026-東亞季風區對流參數化方案敏感性試驗數據集.nc
            </span>
            <Button v-tooltip.top="''" size="sm" variant="text" severity="secondary" label="空值不弹出" />
          </StateRow>
        </StateGrid>
      </Specimen>
    </DocSection>

    <DocSection title="接口">
      <table class="doc-table">
        <thead>
          <tr><th>用法 / 修饰符</th><th>类型</th><th>说明</th></tr>
        </thead>
        <tbody>
          <tr><td><code>v-tooltip="text"</code></td><td><code>string</code></td><td>提示纯文本；为空字符串时不渲染面板</td></tr>
          <tr><td><code>.top</code> / <code>.right</code> / <code>.bottom</code> / <code>.left</code></td><td>修饰符</td><td>首选弹出方向，不传默认 <code>.top</code></td></tr>
          <tr><td>触发与收起</td><td>交互约束</td><td><code>mouseenter</code> / <code>focusin</code> 延迟 150ms 展开；<code>mouseleave</code> / <code>focusout</code> / <code>click</code> / <code>Escape</code> 立即收起</td></tr>
          <tr><td>无障碍关联</td><td>DOM 属性</td><td>展开期间自动为宿主元素挂载 <code>aria-describedby</code> 指向 <code>role="tooltip"</code> 面板</td></tr>
        </tbody>
      </table>
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
