<script setup lang="ts">
import { ref } from "vue";
import { Accordion, AccordionContent, AccordionHeader, AccordionPanel } from "../../../src";
import { api } from "../../api/entries/accordion";
import ApiTable from "../../kit/ApiTable.vue";
import DocPage from "../../kit/DocPage.vue";
import DocSection from "../../kit/DocSection.vue";
import Specimen from "../../kit/Specimen.vue";
import UsagePlayground from "../../kit/UsagePlayground.vue";
import { t } from "../../i18n";
import { usage } from "../../usage/entries/accordion";

const singleOpen = ref<string | null>("meta");
const multiOpen = ref<string[]>(["abstract", "cite"]);

const s = {
  demo: { zh: "在线演示", en: "Live demo" },
  demoDesc: {
    zh: "调整配置即时预览；查看生成代码，一键复制到项目。",
    en: "Tweak the options for a live preview; view the generated code and copy it into your project.",
  },
  whenToUse: { zh: "何时使用", en: "When to use" },
  do1: {
    zh: "检查器侧栏的分节属性（题录元数据、导出参数、审校规则）、FAQ 列表。",
    en: "Sectioned properties in an inspector sidebar (bibliographic metadata, export options, review rules), FAQ lists.",
  },
  do2: {
    zh: "需要同时对照多节内容时开启 <code>multiple</code>。",
    en: "Enable <code>multiple</code> when several sections must be compared at once.",
  },
  dont1: {
    zh: "核心必填表单项不要藏进默认收起的手风琴。",
    en: "Don't hide core required form fields inside a collapsed-by-default accordion.",
  },
  dont2: {
    zh: "不要把手风琴当作主导航使用。",
    en: "Don't use an accordion as the primary navigation.",
  },
  surfaceTitle: { zh: "底面", en: "Surface" },
  surfaceDesc: {
    zh: "纸面与霜面并排。面板之间以 --border-subtle 分割，展开箭头平滑旋转。",
    en: "Paper and frost side by side. Panels are separated by --border-subtle, and the expand chevron rotates smoothly.",
  },
  panelMeta: { zh: "题录元数据", en: "Bibliographic metadata" },
  panelMetaBody: {
    zh: "DOI: 10.1038/s41586-026-00001-x · 期刊：Nature · 发表年份：2026",
    en: "DOI: 10.1038/s41586-026-00001-x · Journal: Nature · Year: 2026",
  },
  panelExport: { zh: "导出格式设置", en: "Export format settings" },
  panelExportBody: {
    zh: "目标模板：ACM sigconf · 参考文献样式：BibTeX",
    en: "Target template: ACM sigconf · Reference style: BibTeX",
  },
  panelLocked: { zh: "团队归档策略（管理员）", en: "Team archival policy (admin)" },
  panelLockedBody: { zh: "仅团队管理员可修改。", en: "Only team admins can change this." },
  multiTitle: { zh: "多项展开（Multiple）", en: "Multiple expanded panels" },
  multiDesc: { zh: "允许多个面板同时保持展开状态。", en: "Several panels can stay open at the same time." },
  panelAbstract: { zh: "摘要与关键词", en: "Abstract & keywords" },
  panelAbstractBody: {
    zh: "包含中英文双语摘要及 5 个受控关键词。",
    en: "Contains the bilingual abstract and 5 controlled keywords.",
  },
  panelCite: { zh: "引用校验结果", en: "Citation validation results" },
  panelCiteBody: {
    zh: "全部 18 处正文引用均已匹配文库条目，0 处悬空引用。",
    en: "All 18 in-text citations match library entries; 0 dangling citations.",
  },
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

    <DocSection :title="s.surfaceTitle" :desc="s.surfaceDesc">
      <Specimen :surfaces="['paper', 'frost']" layout="stack">
        <Accordion v-model:value="singleOpen">
          <AccordionPanel value="meta">
            <AccordionHeader>{{ t(s.panelMeta) }}</AccordionHeader>
            <AccordionContent>
              <p class="doc-note">{{ t(s.panelMetaBody) }}</p>
            </AccordionContent>
          </AccordionPanel>
          <AccordionPanel value="export">
            <AccordionHeader>{{ t(s.panelExport) }}</AccordionHeader>
            <AccordionContent>
              <p class="doc-note">{{ t(s.panelExportBody) }}</p>
            </AccordionContent>
          </AccordionPanel>
          <AccordionPanel value="locked" disabled>
            <AccordionHeader>{{ t(s.panelLocked) }}</AccordionHeader>
            <AccordionContent>
              <p class="doc-note">{{ t(s.panelLockedBody) }}</p>
            </AccordionContent>
          </AccordionPanel>
        </Accordion>
      </Specimen>
    </DocSection>

    <DocSection :title="s.multiTitle" :desc="s.multiDesc">
      <Specimen themes="both" layout="stack">
        <Accordion v-model:value="multiOpen" multiple>
          <AccordionPanel value="abstract">
            <AccordionHeader>{{ t(s.panelAbstract) }}</AccordionHeader>
            <AccordionContent>
              <p class="doc-note">{{ t(s.panelAbstractBody) }}</p>
            </AccordionContent>
          </AccordionPanel>
          <AccordionPanel value="cite">
            <AccordionHeader>{{ t(s.panelCite) }}</AccordionHeader>
            <AccordionContent>
              <p class="doc-note">{{ t(s.panelCiteBody) }}</p>
            </AccordionContent>
          </AccordionPanel>
        </Accordion>
      </Specimen>
    </DocSection>

    <DocSection :title="s.api">
      <ApiTable :api="api" />
    </DocSection>
  </DocPage>
</template>
