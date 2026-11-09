<script setup lang="ts">
import { ArrowRight, Download, Filter, Plus, Settings, Sparkles, Trash2 } from "lucide-vue-next";
import { Button } from "@mango-write/ui-vue";
import { api } from "../../api/entries/button";
import ApiTable from "../../kit/ApiTable.vue";
import DocPage from "../../kit/DocPage.vue";
import DocSection from "../../kit/DocSection.vue";
import Specimen from "../../kit/Specimen.vue";
import StateGrid from "../../kit/StateGrid.vue";
import StateRow from "../../kit/StateRow.vue";
import UsagePlayground from "../../kit/UsagePlayground.vue";
import { t, type Bi } from "../../i18n";
import { usage } from "../../usage/entries/button";

const variants = [
  { label: { zh: "主操作", en: "Primary" }, props: { severity: "primary" } },
  { label: { zh: "次操作", en: "Secondary" }, props: { severity: "secondary" } },
  { label: { zh: "着色", en: "Tinted" }, props: { variant: "tinted", severity: "primary" } },
  { label: { zh: "描边", en: "Outlined" }, props: { variant: "outlined", severity: "secondary" } },
  { label: { zh: "幽灵", en: "Text" }, props: { variant: "text", severity: "secondary" } },
  { label: { zh: "危险", en: "Danger" }, props: { severity: "danger" } },
  { label: { zh: "危险着色", en: "Danger tinted" }, props: { variant: "tinted", severity: "danger" } },
  { label: { zh: "反色", en: "Contrast" }, props: { severity: "contrast" } },
] as const;

const s = {
  demo: { zh: "在线演示", en: "Live demo" },
  demoDesc: {
    zh: "调整配置即时预览；查看生成代码，一键复制到项目。",
    en: "Tweak the options for a live preview; view the generated code and copy it into your project.",
  },
  whenToUse: { zh: "何时使用", en: "When to use" },
  primaryDo: {
    zh: "<strong>主操作</strong>（primary）：本区块唯一最重要的动作，例如「保存修改」「导入」。",
    en: "<strong>Primary</strong>: the single most important action in the block, e.g. “Save changes”, “Import”.",
  },
  secondaryDo: {
    zh: "<strong>次操作</strong>（secondary）：与主操作并列的常规动作，例如「取消」「预览」。",
    en: "<strong>Secondary</strong>: everyday actions alongside the primary, e.g. “Cancel”, “Preview”.",
  },
  tintedDo: {
    zh: "<strong>着色</strong>（tinted）：页面级的重要但非唯一动作，或需要品牌提示又不能抢主操作时。",
    en: "<strong>Tinted</strong>: page-level actions that matter but aren't the one primary, or when you want brand presence without stealing focus.",
  },
  textDo: {
    zh: "<strong>幽灵</strong>（text）：工具条、行内与低频动作；icon-only 默认用它。",
    en: "<strong>Text</strong>: toolbars, inline and low-frequency actions; the default for icon-only buttons.",
  },
  dont1: {
    zh: "不在同一区块放两个实心主按钮；不用按钮做导航（用链接）。",
    en: "Never place two solid primary buttons in one block; don't use buttons for navigation (use links).",
  },
  dont2: {
    zh: "状态色（success / info / warning）不承担动作，作为按钮时自动退为着色样式。",
    en: "Status colors (success / info / warning) carry no action; as buttons they automatically fall back to tinted styling.",
  },
  variants: { zh: "变体", en: "Variants" },
  variantsDesc: {
    zh: "纸面与霜面、浅色与深色并排。霜面上的按钮不铺实色底，次操作是半透明控件面。",
    en: "Paper and frost, light and dark, side by side. On frost, buttons drop solid fills and secondary actions become translucent control surfaces.",
  },
  linkButton: { zh: "链接按钮", en: "Link button" },
  capsuleTitle: { zh: "胶囊按钮（Capsule / Rounded）", en: "Capsule buttons (rounded)" },
  capsuleDesc: {
    zh: "rounded 属性将圆角切为 --radius-full，文字按钮横向内距自动放宽 1.25× 补偿半圆弧收窄，icon-only 则为正圆。常用于悬浮操作条、筛选胶囊、AI 快捷指令与营销 CTA。",
    en: "The rounded prop switches the radius to --radius-full; text buttons widen horizontal padding by 1.25× to compensate for the arc, and icon-only buttons become circles. Common in floating action bars, filter pills, AI shortcuts, and marketing CTAs.",
  },
  startWriting: { zh: "开始写作", en: "Start writing" },
  filters: { zh: "筛选条件", en: "Filters" },
  aiPolish: { zh: "AI 润色", en: "AI polish" },
  exportPdf: { zh: "导出 PDF", en: "Export PDF" },
  collapse: { zh: "收起", en: "Collapse" },
  create: { zh: "新建", en: "New" },
  aiAssistant: { zh: "AI 助手", en: "AI assistant" },
  capsule: { zh: "胶囊", en: "Capsule" },
  sizes: { zh: "尺寸", en: "Sizes" },
  sizesDesc: {
    zh: "xs / sm / md / lg 四档，默认 md。高度、字号、图标、内距与圆角由同一档位派生；图标约为高度的一半。",
    en: "Four tiers, xs / sm / md / lg, defaulting to md. Height, font size, icon, padding, and radius all derive from the tier; icons are about half the height.",
  },
  save: { zh: "保存修改", en: "Save changes" },
  export: { zh: "导出", en: "Export" },
  createNew: { zh: "新建", en: "New" },
  ai: { zh: "AI", en: "AI" },
  settings: { zh: "设置", en: "Settings" },
  density: { zh: "密度上下文", en: "Density contexts" },
  densityDesc: {
    zh: "不传 size 的按钮跟随容器：在容器上挂 .mw-size-sm 即整组切档，组件本身不改。工具条角色 .mw-toolbar 让控件去底只留发丝边。",
    en: "Buttons without a size follow their container: put .mw-size-sm on the container and the whole group switches tiers without touching the components. The .mw-toolbar role strips control fills down to hairlines.",
  },
  apply: { zh: "应用", en: "Apply" },
  reset: { zh: "重置", en: "Reset" },
  remove: { zh: "删除", en: "Delete" },
  defaultMd: { zh: "默认 md", en: "Default md" },
  states: { zh: "状态", en: "States" },
  statesDesc: {
    zh: "hover / 按下 / 焦点请直接用指针与 Tab 键体验；焦点为 2px 品牌色外环。",
    en: "Try hover, press, and focus directly with a pointer and the Tab key; focus is a 2px brand-color ring.",
  },
  colDefault: { zh: "默认", en: "Default" },
  colDisabled: { zh: "禁用", en: "Disabled" },
  colLoading: { zh: "加载", en: "Loading" },
  colBadge: { zh: "徽标", en: "Badge" },
  buttonLabel: { zh: "按钮", en: "Button" },
  messageLabel: { zh: "消息", en: "Messages" },
  icons: { zh: "图标", en: "Icons" },
  iconsDesc: {
    zh: "统一使用 Lucide 图标组件，尺寸与描边由 --control-icon 与 --icon-stroke 自动锁定；图标可在左或右。",
    en: "Icons are always Lucide components; size and stroke lock to --control-icon and --icon-stroke. Icons can lead or trail.",
  },
  leadingIcon: { zh: "前置图标", en: "Leading icon" },
  aiGenerate: { zh: "AI 生成", en: "AI generate" },
  nextStep: { zh: "下一步", en: "Next" },
  roundedFilter: { zh: "圆角筛选", en: "Rounded filter" },
  composition: { zh: "组合", en: "Composition" },
  cancel: { zh: "取消", en: "Cancel" },
  deleteDraft: { zh: "删除草稿", en: "Delete draft" },
  preview: { zh: "预览", en: "Preview" },
  publish: { zh: "发布", en: "Publish" },
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
        <li data-kind="do" v-html="t(s.primaryDo)" />
        <li data-kind="do" v-html="t(s.secondaryDo)" />
        <li data-kind="do" v-html="t(s.tintedDo)" />
        <li data-kind="do" v-html="t(s.textDo)" />
        <li data-kind="dont" v-html="t(s.dont1)" />
        <li data-kind="dont" v-html="t(s.dont2)" />
      </ul>
    </DocSection>

    <DocSection :title="s.variants" :desc="s.variantsDesc">
      <Specimen :surfaces="['paper', 'frost']">
        <Button v-for="v in variants" :key="v.label.en" v-bind="v.props" :label="t(v.label)" />
        <Button variant="link" :label="t(s.linkButton)" />
      </Specimen>
    </DocSection>

    <DocSection :title="s.capsuleTitle" :desc="s.capsuleDesc">
      <Specimen :surfaces="['paper', 'frost']" layout="stack">
        <div class="doc-row">
          <Button rounded :label="t(s.startWriting)" :icon="Sparkles" />
          <Button rounded severity="secondary" :label="t(s.filters)" :icon="Filter" />
          <Button rounded variant="tinted" :label="t(s.aiPolish)" :icon="Sparkles" />
          <Button rounded variant="outlined" severity="secondary" :label="t(s.exportPdf)" :icon="Download" />
          <Button rounded variant="text" severity="secondary" :label="t(s.collapse)" />
          <Button rounded severity="secondary" :icon="Plus" :aria-label="t(s.create)" />
          <Button rounded variant="tinted" :icon="Sparkles" :aria-label="t(s.aiAssistant)" />
        </div>
        <div class="doc-row">
          <Button v-for="size in (['xs', 'sm', 'md', 'lg'] as const)" :key="size" rounded :size="size" :label="`${t(s.capsule)} ${size}`" />
          <Button
            v-for="size in (['xs', 'sm', 'md', 'lg'] as const)"
            :key="`icon-${size}`"
            rounded
            :size="size"
            severity="secondary"
            :icon="Plus"
            :aria-label="`${t(s.create)} ${size}`"
          />
        </div>
      </Specimen>
    </DocSection>

    <DocSection :title="s.sizes" :desc="s.sizesDesc">
      <Specimen themes="single" layout="stack">
        <div v-for="size in (['xs', 'sm', 'md', 'lg'] as const)" :key="size" class="doc-row">
          <span class="doc-note" style="width: 24px">{{ size }}</span>
          <Button :size="size" :label="t(s.save)" />
          <Button :size="size" severity="secondary" :label="t(s.export)" :icon="Download" />
          <Button :size="size" variant="tinted" :label="t(s.createNew)" :icon="Plus" />
          <Button :size="size" variant="text" severity="secondary" :icon="Sparkles" :aria-label="t(s.ai)" />
          <Button :size="size" severity="secondary" :icon="Settings" :aria-label="t(s.settings)" />
        </div>
      </Specimen>
    </DocSection>

    <DocSection :title="s.density" :desc="s.densityDesc">
      <Specimen themes="single" layout="stack">
        <div class="doc-row mw-size-sm">
          <span class="doc-note">.mw-size-sm</span>
          <Button :label="t(s.apply)" />
          <Button severity="secondary" :label="t(s.reset)" />
          <Button variant="text" severity="secondary" :icon="Trash2" :aria-label="t(s.remove)" />
        </div>
        <div class="doc-row">
          <span class="doc-note">{{ t(s.defaultMd) }}</span>
          <Button :label="t(s.apply)" />
          <Button severity="secondary" :label="t(s.reset)" />
          <Button variant="text" severity="secondary" :icon="Trash2" :aria-label="t(s.remove)" />
        </div>
      </Specimen>
    </DocSection>

    <DocSection :title="s.states" :desc="s.statesDesc">
      <Specimen themes="both">
        <StateGrid :columns="[s.colDefault, s.colDisabled, s.colLoading, s.colBadge]" label-width="88px">
          <StateRow v-for="v in variants.slice(0, 6)" :key="v.label.en" :label="v.label">
            <Button v-bind="v.props" :label="t(s.buttonLabel)" />
            <Button v-bind="v.props" :label="t(s.buttonLabel)" disabled />
            <Button v-bind="v.props" :label="t(s.buttonLabel)" loading />
            <Button v-bind="v.props" :label="t(s.messageLabel)" :badge="3" />
          </StateRow>
        </StateGrid>
      </Specimen>
    </DocSection>

    <DocSection :title="s.icons" :desc="s.iconsDesc">
      <Specimen themes="single">
        <Button severity="secondary" :label="t(s.leadingIcon)" :icon="Plus" />
        <Button severity="secondary" :label="t(s.aiGenerate)" :icon="Sparkles" />
        <Button severity="secondary" :label="t(s.nextStep)" :icon="ArrowRight" icon-pos="right" />
        <Button severity="secondary" :label="t(s.roundedFilter)" :icon="Filter" rounded />
      </Specimen>
    </DocSection>

    <DocSection :title="s.composition">
      <Specimen :surfaces="['raised']" themes="single" layout="stack">
        <div class="doc-row" style="justify-content: flex-end">
          <Button variant="text" severity="secondary" :label="t(s.cancel)" />
          <Button :label="t(s.save)" />
        </div>
        <div class="doc-row" style="justify-content: space-between">
          <Button variant="tinted" severity="danger" :label="t(s.deleteDraft)" :icon="Trash2" />
          <div class="doc-row">
            <Button severity="secondary" :label="t(s.preview)" />
            <Button :label="t(s.publish)" />
          </div>
        </div>
      </Specimen>
    </DocSection>

    <DocSection :title="s.api">
      <ApiTable :api="api" />
    </DocSection>
  </DocPage>
</template>
