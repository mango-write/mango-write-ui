<script setup lang="ts">
import DocPage from "../../kit/DocPage.vue";
import DocSection from "../../kit/DocSection.vue";

const breakpoints = [
  ["640", "sm", "大屏手机横屏"],
  ["768", "md", "平板；页面留白 16 → 24；手机档边界"],
  ["1024", "lg", "小笔记本"],
  ["1280", "xl", "标准桌面；页面留白 24 → 32；不得出现横向滚动"],
  ["1536", "2xl", "大屏"],
];
const containers = [
  ["--container-prose", "长文阅读（约 40 个汉字）"],
  ["--container-content", "内容页"],
  ["--container-page", "整页上限"],
];
</script>

<template>
  <DocPage lead="壳稳定、内容流动。工作台是一张画布上的几座浮岛；内容页把正文收在可读的行宽里。">
    <DocSection title="工作台壳" desc="画布（--bg-canvas）上：顶栏不画面；左栏、中栏、右栏是纸面浮岛（--bg-surface + 发丝边 + 轻阴影），浮岛间距 --shell-gutter，圆角 --radius-sheet。">
      <div class="shell">
        <div class="shell__top"><span class="shell__logo" />顶栏 · --shell-topbar-h</div>
        <div class="shell__body">
          <div class="shell__sheet shell__sheet--side">左栏<br /><code>--shell-sidebar-w</code></div>
          <div class="shell__sheet shell__sheet--main">中栏 · 纸面<br /><code>flex: 1</code></div>
          <div class="shell__sheet shell__sheet--aside">右栏<br /><code>--shell-aside-w</code></div>
        </div>
      </div>
      <ul class="doc-rules">
        <li data-kind="do">轨道内容（tab 行、面板身、脚行）一律透明，继承浮岛的纸面。</li>
        <li data-kind="do">页头钉在浮岛顶部（滚动容器之外），滚动只发生在浮岛内部。</li>
        <li data-kind="dont">工作台页面根不铺底色——会盖住画布，浮岛之间的缝就读成断层。</li>
      </ul>
    </DocSection>

    <DocSection title="断点" desc="CSS 变量不能用于媒体查询，下表是唯一约定；组件层档位判定在 app 内统一封装。">
      <table class="doc-table">
        <thead><tr><th>宽度</th><th>名</th><th>行为</th></tr></thead>
        <tbody>
          <tr v-for="[w, n, u] in breakpoints" :key="w"><td class="mw-tabular">≥ {{ w }}px</td><td><code>{{ n }}</code></td><td>{{ u }}</td></tr>
        </tbody>
      </table>
    </DocSection>

    <DocSection title="容器" desc="页面左右留白 --page-gutter 随视口三档变化（16 / 24 / 32）。">
      <div class="doc-stack">
        <div v-for="[t, u] in containers" :key="t" class="container-bar" :style="{ maxWidth: `var(${t})` }">
          <code>{{ t }}</code><span>{{ u }}</span>
        </div>
      </div>
    </DocSection>

    <DocSection title="规则">
      <ul class="doc-rules">
        <li>1280 宽不出现横向滚动或内容被压碎；1440 宽下展示足够多的真实信息；390 宽主链路可达。</li>
        <li>手机档是单栏 + 页内展开；窄屏浮层用 CSS 换形，不 v-if 双实例（状态不丢）。</li>
        <li>数据表格在窄屏保持表格形态横向滚动，不折成卡片流。</li>
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
</style>
