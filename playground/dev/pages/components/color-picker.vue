<script setup lang="ts">
import { ref } from "vue";
import { ColorPicker } from "@mango-write/ui-vue";
import { api } from "../../api/entries/color-picker";
import ApiTable from "../../kit/ApiTable.vue";
import DocPage from "../../kit/DocPage.vue";
import DocSection from "../../kit/DocSection.vue";
import Specimen from "../../kit/Specimen.vue";
import StateGrid from "../../kit/StateGrid.vue";
import StateRow from "../../kit/StateRow.vue";
import UsagePlayground from "../../kit/UsagePlayground.vue";
import { t } from "../../i18n";
import { usage } from "../../usage/entries/color-picker";

const s = {
  demo: { zh: "在线演示", en: "Live demo" },
  demoDesc: {
    zh: "调整配置即时预览；查看生成代码，一键复制到项目。",
    en: "Tweak the options for a live preview; view the generated code and copy it into your project.",
  },
  whenToUse: { zh: "何时使用", en: "When to use" },
  rule1: {
    zh: "用户需要自定义任意颜色，例如给文库标签上色。",
    en: "The user needs to pick an arbitrary color, e.g. coloring a library tag.",
  },
  rule2: {
    zh: "只有少量预设色时，用一排色块按钮让用户直接点选，比取色器快。",
    en: "With only a few preset colors, a row of swatch buttons is faster than a picker.",
  },
  rule3: {
    zh: "不要让颜色成为唯一信息：标签仍需名称。",
    en: "Never let color be the only signal: tags still need names.",
  },
  surfaces: { zh: "底面", en: "Surfaces" },
  surfacesDesc: {
    zh: "纸面与霜面并排；色块外圈是控件面，内圆角与外圆角同心。",
    en: "Paper and frost side by side; the swatch's outer ring is the control surface, with the inner radius concentric to the outer.",
  },
  tagColor: { zh: "标签颜色", en: "Tag color" },
  seriesColor: { zh: "图表系列颜色", en: "Chart series color" },
  sizes: { zh: "尺寸", en: "Sizes" },
  sizesDesc: {
    zh: "没有 size 参数，边长取 --control-h；放进 .mw-size-* 容器即换档。inline 固定为 lg 档边长。",
    en: "No size prop; the edge length comes from --control-h and switches with the .mw-size-* container. inline is fixed at the lg edge.",
  },
  tierColor: { zh: "档颜色", en: "color" },
  inlineColor: { zh: "内联颜色", en: "Inline color" },
  states: { zh: "状态", en: "States" },
  colDefault: { zh: "默认", en: "Default" },
  colDisabled: { zh: "禁用", en: "Disabled" },
  colReadonly: { zh: "只读", en: "Readonly" },
  colInvalid: { zh: "错误", en: "Invalid" },
  swatch: { zh: "色块", en: "Swatch" },
  api: { zh: "接口", en: "API" },
} as const;

const tag = ref("f97316");
const label = ref("3b82c4");
</script>

<template>
  <DocPage>
    <DocSection :title="s.demo" :desc="s.demoDesc">
      <UsagePlayground :entry="usage" />
    </DocSection>
    <DocSection :title="s.whenToUse">
      <ul class="doc-rules">
        <li data-kind="do" v-html="t(s.rule1)" />
        <li data-kind="dont" v-html="t(s.rule2)" />
        <li data-kind="dont" v-html="t(s.rule3)" />
      </ul>
    </DocSection>

    <DocSection :title="s.surfaces" :desc="s.surfacesDesc">
      <Specimen :surfaces="['paper', 'frost']">
        <ColorPicker v-model="tag" :aria-label="t(s.tagColor)" />
        <ColorPicker v-model="label" :aria-label="t(s.seriesColor)" />
        <span class="doc-note">#{{ tag }} · #{{ label }}</span>
      </Specimen>
    </DocSection>

    <DocSection :title="s.sizes" :desc="s.sizesDesc">
      <Specimen themes="single">
        <div v-for="size in (['xs', 'sm', 'md', 'lg'] as const)" :key="size" class="doc-row" :class="`mw-size-${size}`">
          <span class="doc-note">{{ size }}</span>
          <ColorPicker v-model="tag" :aria-label="`${size} ${t(s.tierColor)}`" />
        </div>
        <div class="doc-row">
          <span class="doc-note">inline</span>
          <ColorPicker v-model="tag" inline :aria-label="t(s.inlineColor)" />
        </div>
      </Specimen>
    </DocSection>

    <DocSection :title="s.states">
      <Specimen themes="both">
        <StateGrid :columns="[s.colDefault, s.colDisabled, s.colReadonly, s.colInvalid]" label-width="48px">
          <StateRow :label="s.swatch">
            <ColorPicker v-model="tag" :aria-label="t(s.colDefault)" />
            <ColorPicker v-model="tag" disabled :aria-label="t(s.colDisabled)" />
            <ColorPicker v-model="tag" readonly :aria-label="t(s.colReadonly)" />
            <ColorPicker v-model="tag" invalid :aria-label="t(s.colInvalid)" />
          </StateRow>
        </StateGrid>
      </Specimen>
    </DocSection>

    <DocSection :title="s.api">
      <ApiTable :api="api" />
    </DocSection>
  </DocPage>
</template>
