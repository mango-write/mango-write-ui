<script setup lang="ts">
import DocPage from "../../kit/DocPage.vue";
import DocSection from "../../kit/DocSection.vue";
import Specimen from "../../kit/Specimen.vue";

const zs = [
  ["--z-raised", "模块内抬升"],
  ["--z-sticky", "粘性表头、页头"],
  ["--z-dropdown", "下拉、菜单、弹出层"],
  ["--z-overlay", "对话框、灯箱"],
  ["--z-toast", "轻提示"],
  ["--z-tooltip", "文字提示"],
];
</script>

<template>
  <DocPage lead="写「第几层」，不写「要多重的阴影」。浅色靠阴影抬升，深色靠亮度抬升、阴影只负责分离。">
    <DocSection title="四层" desc="0 平面 → 1 抬起 → 2 浮动（霜）→ 3 覆盖（厚霜 + 遮罩）。">
      <Specimen :surfaces="['canvas']" min-height="320px">
        <div class="layers">
          <div class="layer layer--0"><b>0 平面</b><span>--bg-surface</span></div>
          <div class="layer layer--1"><b>1 抬起</b><span>--bg-raised · --shadow-raised</span></div>
          <div class="layer layer--2 mw-frost"><b>2 浮动</b><span>.mw-frost · --shadow-floating</span></div>
          <div class="layer layer--3 mw-frost mw-frost--thick"><b>3 覆盖</b><span>.mw-frost--thick · --shadow-overlay</span></div>
        </div>
      </Specimen>
    </DocSection>

    <DocSection title="层级秩序" desc="所有 body 级浮层都由本库渲染，z 值只用下列 token；模块内部排序用 isolation: isolate + 1–10。">
      <table class="doc-table">
        <thead><tr><th>token</th><th>用途</th></tr></thead>
        <tbody>
          <tr v-for="[t, u] in zs" :key="t"><td><code>{{ t }}</code></td><td>{{ u }}</td></tr>
        </tbody>
      </table>
    </DocSection>

    <DocSection title="规则">
      <ul class="doc-rules">
        <li data-kind="do">卡片 = 抬起面 + 发丝边 + 轻阴影；不再叠第二层卡片（不套娃）。</li>
        <li data-kind="do">对话框只压暗遮罩，不模糊背景：让面板浮起来的是亮度差。</li>
        <li data-kind="dont">不为「想更醒目」而选更高的层；层号表达语义位置。</li>
      </ul>
    </DocSection>
  </DocPage>
</template>

<style scoped>
.layers {
  position: relative;
  width: 100%;
  height: 260px;
}

.layer {
  position: absolute;
  display: grid;
  align-content: start;
  gap: var(--space-1);
  width: 52%;
  height: 120px;
  padding: var(--space-3) var(--space-4);
  font-size: var(--type-body-sm-size);
}

.layer span {
  color: var(--text-tertiary);
  font-family: var(--font-mono);
  font-size: var(--type-micro-size);
}

.layer--0 {
  left: 0;
  top: 0;
  background: var(--bg-surface);
  border-radius: var(--radius-sheet);
  border: var(--border-width) solid var(--border-subtle);
}

.layer--1 {
  left: 14%;
  top: 40px;
  background: var(--bg-raised);
  border-radius: var(--radius-card);
  border: var(--border-width) solid var(--border-subtle);
  box-shadow: var(--shadow-raised);
}

.layer--2 {
  left: 30%;
  top: 84px;
  border-radius: var(--radius-float);
}

.layer--3 {
  left: 46%;
  top: 128px;
  border-radius: var(--radius-dialog);
}
</style>
