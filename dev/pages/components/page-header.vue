<script setup lang="ts">
import { BookOpen, Plus, Upload } from "lucide-vue-next";
import { Button, PageHeader } from "../../../src";
import { api } from "../../api/entries/page-header";
import ApiTable from "../../kit/ApiTable.vue";
import DocPage from "../../kit/DocPage.vue";
import DocSection from "../../kit/DocSection.vue";
import Specimen from "../../kit/Specimen.vue";
import UsagePlayground from "../../kit/UsagePlayground.vue";
import { t } from "../../i18n";
import { usage } from "../../usage/entries/page-header";

const s = {
  demo: { zh: "在线演示", en: "Live demo" },
  demoDesc: {
    zh: "调整配置即时预览；查看生成代码，一键复制到项目。",
    en: "Tweak the options for a live preview; view the generated code and copy it into your project.",
  },
  whenToUse: { zh: "何时使用", en: "When to use" },
  do1: {
    zh: "作为工作岛（<code>.mw-island</code>）顶部首行，放在滚动容器之外自然钉顶。",
    en: "As the top row of a work island (<code>.mw-island</code>), placed outside the scroll container so it pins naturally.",
  },
  do2: {
    zh: "右侧 <code>#actions</code> 放本页最高频的 1–2 个操作按钮。",
    en: "Put this page's 1–2 most frequent actions in the right-hand <code>#actions</code> slot.",
  },
  dont1: {
    zh: "不要在同一个工作岛内放两个 <code>PageHeader</code>。",
    en: "Don't put two <code>PageHeader</code>s in the same work island.",
  },
  surfaceTitle: { zh: "底面", en: "Surface" },
  surfaceDesc: {
    zh: "纸面与霜面并排。左侧图标块使用 --accent-subtle 半透明品牌底，右侧动作区自动推至末端。",
    en: "Paper and frost side by side. The leading icon block sits on a translucent --accent-subtle brand fill, and the actions area pushes to the end automatically.",
  },
  libraryTitle: { zh: "我的文库", en: "My library" },
  importPdf: { zh: "导入 PDF", en: "Import PDF" },
  newDraft: { zh: "新建草稿", en: "New draft" },
  plainTitle: { zh: "纯标题变体", en: "Title-only variant" },
  plainDesc: {
    zh: "不传 #icon 或 #actions 时保持同等高度与基线节奏。",
    en: "Without #icon or #actions, the header keeps the same height and baseline rhythm.",
  },
  accountTitle: { zh: "账户与安全设置", en: "Account & security settings" },
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
      </ul>
    </DocSection>

    <DocSection :title="s.surfaceTitle" :desc="s.surfaceDesc">
      <Specimen :surfaces="['paper', 'frost']" layout="stack">
        <PageHeader :title="t(s.libraryTitle)">
          <template #icon><BookOpen /></template>
          <template #actions>
            <Button size="sm" variant="outlined">
              <Upload />
              <span>{{ t(s.importPdf) }}</span>
            </Button>
            <Button size="sm">
              <Plus />
              <span>{{ t(s.newDraft) }}</span>
            </Button>
          </template>
        </PageHeader>
      </Specimen>
    </DocSection>

    <DocSection :title="s.plainTitle" :desc="s.plainDesc">
      <Specimen themes="both" layout="stack">
        <PageHeader :title="t(s.accountTitle)" />
      </Specimen>
    </DocSection>

    <DocSection :title="s.api">
      <ApiTable :api="api" />
    </DocSection>
  </DocPage>
</template>
