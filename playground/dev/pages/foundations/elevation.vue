<script setup lang="ts">
import DocPage from "../../kit/DocPage.vue";
import DocSection from "../../kit/DocSection.vue";
import Specimen from "../../kit/Specimen.vue";
import { t } from "../../i18n";

const zs = [
  { token: "--z-raised", use: { zh: "模块内抬升", en: "Lift within a module" } },
  { token: "--z-sticky", use: { zh: "粘性表头、页头", en: "Sticky table headers, page header" } },
  { token: "--z-dropdown", use: { zh: "下拉、菜单、弹出层", en: "Dropdowns, menus, popovers" } },
  { token: "--z-overlay", use: { zh: "对话框、灯箱", en: "Dialogs, lightbox" } },
  { token: "--z-toast", use: { zh: "轻提示", en: "Toasts" } },
  { token: "--z-tooltip", use: { zh: "文字提示", en: "Tooltips" } },
];

const s = {
  layersTitle: { zh: "四层", en: "Four layers" },
  layersDesc: {
    zh: "0 平面 → 1 抬起 → 2 浮动（霜）→ 3 覆盖（厚霜 + 遮罩）。",
    en: "0 flat → 1 raised → 2 floating (frost) → 3 overlay (thick frost + scrim).",
  },
  layer0: { zh: "0 平面", en: "0 Flat" },
  layer1: { zh: "1 抬起", en: "1 Raised" },
  layer2: { zh: "2 浮动", en: "2 Floating" },
  layer3: { zh: "3 覆盖", en: "3 Overlay" },
  zTitle: { zh: "层级秩序", en: "Stacking order" },
  zDesc: {
    zh: "所有 body 级浮层都由本库渲染，z 值只用下列 token；模块内部排序用 isolation: isolate + 1–10。",
    en: "All body-level overlays are rendered by this library and use only the z tokens below; ordering within a module uses isolation: isolate + 1–10.",
  },
  colUsage: { zh: "用途", en: "Usage" },
  rulesTitle: { zh: "规则", en: "Rules" },
  ruleCard: {
    zh: "卡片 = 抬起面 + 发丝边 + 轻阴影；不再叠第二层卡片（不套娃）。",
    en: "A card = raised surface + hairline border + light shadow; never stack a second card on top (no nesting).",
  },
  ruleDialog: {
    zh: "对话框只压暗遮罩，不模糊背景：让面板浮起来的是亮度差。",
    en: "Dialogs dim the scrim only and never blur the background: brightness difference is what lifts the panel.",
  },
  ruleDont: {
    zh: "不为「想更醒目」而选更高的层；层号表达语义位置。",
    en: "Never pick a higher layer just to stand out; layer numbers express semantic position.",
  },
} as const;
</script>

<template>
  <DocPage>
    <DocSection :title="s.layersTitle" :desc="s.layersDesc">
      <Specimen :surfaces="['canvas']" min-height="320px">
        <div class="layers">
          <div class="layer layer--0"><b>{{ t(s.layer0) }}</b><span>--bg-surface</span></div>
          <div class="layer layer--1"><b>{{ t(s.layer1) }}</b><span>--bg-raised · --shadow-raised</span></div>
          <div class="layer layer--2 mw-frost"><b>{{ t(s.layer2) }}</b><span>.mw-frost · --shadow-floating</span></div>
          <div class="layer layer--3 mw-frost mw-frost--thick"><b>{{ t(s.layer3) }}</b><span>.mw-frost--thick · --shadow-overlay</span></div>
        </div>
      </Specimen>
    </DocSection>

    <DocSection :title="s.zTitle" :desc="s.zDesc">
      <table class="doc-table">
        <thead><tr><th>token</th><th>{{ t(s.colUsage) }}</th></tr></thead>
        <tbody>
          <tr v-for="row in zs" :key="row.token"><td><code>{{ row.token }}</code></td><td>{{ t(row.use) }}</td></tr>
        </tbody>
      </table>
    </DocSection>

    <DocSection :title="s.rulesTitle">
      <ul class="doc-rules">
        <li data-kind="do" v-html="t(s.ruleCard)" />
        <li data-kind="do" v-html="t(s.ruleDialog)" />
        <li data-kind="dont" v-html="t(s.ruleDont)" />
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
