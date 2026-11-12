<script setup lang="ts">
import { computed } from "vue";
import { InputText, SelectButton, ToggleSwitch } from "@mango-write/ui-vue";
import MpDocPage from "../../kit/MpDocPage.vue";
import { mobileApi } from "../../mobile-demos/api";
import { mpSim } from "../../mobile-demos/state";
import { t } from "../../i18n";

const variantOptions = computed(() => [
  { label: t({ zh: "填充 filled", en: "filled" }), value: "filled" },
  { label: t({ zh: "着色 tinted", en: "tinted" }), value: "tinted" },
  { label: t({ zh: "描边 outlined", en: "outlined" }), value: "outlined" },
  { label: t({ zh: "幽灵 text", en: "text" }), value: "text" },
]);
const severityOptions = computed(() => [
  { label: t({ zh: "主操作 primary", en: "primary" }), value: "primary" },
  { label: t({ zh: "次操作 secondary", en: "secondary" }), value: "secondary" },
  { label: t({ zh: "危险 danger", en: "danger" }), value: "danger" },
  { label: t({ zh: "反色 contrast", en: "contrast" }), value: "contrast" },
]);
const sizeOptions = [
  { label: "sm · 36px", value: "sm" }, // i18n-allow 尺寸档位
  { label: "md · 44px", value: "md" }, // i18n-allow 尺寸档位
  { label: "lg · 48px", value: "lg" }, // i18n-allow 尺寸档位
];
const code = computed(() => `<MpButton label="${mpSim.button.label}"${mpSim.button.variant !== "filled" ? ` variant="${mpSim.button.variant}"` : ""}${mpSim.button.severity !== "primary" ? ` severity="${mpSim.button.severity}"` : ""}${mpSim.button.size !== "md" ? ` size="${mpSim.button.size}"` : ""}${mpSim.button.fluid ? " fluid" : ""}${mpSim.button.loading ? " loading" : ""}${mpSim.button.disabled ? " disabled" : ""} />`);
</script>

<template>
  <MpDocPage slug="button" :code="code" :api="mobileApi.button" :guidelines="[
    { kind: 'do', zh: '<strong>双翼统一语义</strong>：变体（filled / tinted / outlined / text）、语义（primary / secondary / danger / contrast）与宽度（fluid）同桌面端 Button 一一对齐；filled + secondary 为纸面有界次按钮，反色黑底使用 contrast。', en: '<strong>Unified cross-platform semantics</strong>: variants (filled / tinted / outlined / text), severities (primary / secondary / danger / contrast), and fluid width match desktop Button 1:1.' },
    { kind: 'do', zh: '<strong>掌上三档尺寸</strong>：sm（36px 行内次要）、md（44px 默认标准触控）、lg（48px 底部通栏主操作）。', en: '<strong>Palm-scale tiers</strong>: sm (36px inline), md (44px default touch), lg (48px bottom primary).' },
    { kind: 'dont', zh: '不在同一底轨并排放两个实心主按钮；图标按钮必须传入 aria-label。', en: 'Never place two filled primary buttons side by side in one bottom rail; icon-only buttons require aria-label.' },
  ]">
    <div class="mp-field">
      <div class="mp-field__head"><span class="mp-field__label">{{ t({ zh: "按钮文字", en: "Label" }) }}</span><code class="mp-field__prop">label</code></div>
      <InputText v-model="mpSim.button.label" size="sm" fluid />
    </div>
    <div class="mp-field">
      <div class="mp-field__head"><span class="mp-field__label">{{ t({ zh: "形态", en: "Variant" }) }}</span><code class="mp-field__prop">variant</code></div>
      <SelectButton size="sm" :model-value="mpSim.button.variant" :options="variantOptions" option-label="label" option-value="value" :allow-empty="false" @update:model-value="mpSim.button.variant = $event as typeof mpSim.button.variant" />
    </div>
    <div class="mp-field">
      <div class="mp-field__head"><span class="mp-field__label">{{ t({ zh: "语义", en: "Severity" }) }}</span><code class="mp-field__prop">severity</code></div>
      <SelectButton size="sm" :model-value="mpSim.button.severity" :options="severityOptions" option-label="label" option-value="value" :allow-empty="false" @update:model-value="mpSim.button.severity = $event as typeof mpSim.button.severity" />
    </div>
    <div class="mp-field">
      <div class="mp-field__head"><span class="mp-field__label">{{ t({ zh: "尺寸", en: "Size" }) }}</span><code class="mp-field__prop">size</code></div>
      <SelectButton size="sm" :model-value="mpSim.button.size" :options="sizeOptions" option-label="label" option-value="value" :allow-empty="false" @update:model-value="mpSim.button.size = $event as typeof mpSim.button.size" />
    </div>
    <div class="mp-field">
      <div class="mp-field__head"><span class="mp-field__label">{{ t({ zh: "撑满宽度", en: "Fluid width" }) }}</span><code class="mp-field__prop">fluid</code></div>
      <ToggleSwitch v-model="mpSim.button.fluid" />
    </div>
    <div class="mp-field">
      <div class="mp-field__head"><span class="mp-field__label">{{ t({ zh: "加载中", en: "Loading" }) }}</span><code class="mp-field__prop">loading</code></div>
      <ToggleSwitch v-model="mpSim.button.loading" />
    </div>
    <div class="mp-field">
      <div class="mp-field__head"><span class="mp-field__label">{{ t({ zh: "禁用", en: "Disabled" }) }}</span><code class="mp-field__prop">disabled</code></div>
      <ToggleSwitch v-model="mpSim.button.disabled" />
    </div>
  </MpDocPage>
</template>
