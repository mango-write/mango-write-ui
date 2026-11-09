<script setup lang="ts">
import { computed, ref } from "vue";
import { FormField, InputNumber, InputText, Select, Textarea } from "@mango-write/ui-vue";
import { api } from "../../api/entries/form-field";
import ApiTable from "../../kit/ApiTable.vue";
import DocPage from "../../kit/DocPage.vue";
import DocSection from "../../kit/DocSection.vue";
import Specimen from "../../kit/Specimen.vue";
import UsagePlayground from "../../kit/UsagePlayground.vue";
import { t } from "../../i18n";
import { usage } from "../../usage/entries/form-field";

const s = {
  demo: { zh: "在线演示", en: "Live demo" },
  demoDesc: {
    zh: "调整配置即时预览；查看生成代码，一键复制到项目。",
    en: "Tweak the options for a live preview; view the generated code and copy it into your project.",
  },
  whenToUse: { zh: "何时使用", en: "When to use" },
  rule1: {
    zh: "所有表单输入都包一层：标签常驻显示，不靠占位符。",
    en: "Wrap every form input: the label stays visible, never placeholder-only.",
  },
  rule2: {
    zh: "说明写「怎么填」，错误写「哪里错了、怎么改」。",
    en: "Hints say how to fill it in; errors say what's wrong and how to fix it.",
  },
  rule3: {
    zh: "不要同时堆说明和错误的长段落；错误出现时说明可以省略。",
    en: "Don't pile long hint and error paragraphs together; the hint may be dropped while the error shows.",
  },
  rule4: {
    zh: '错误不只靠红色：始终有文字，并以 <code>role="alert"</code> 播报。',
    en: 'Errors aren\'t color-only: always include text, announced via <code>role="alert"</code>.',
  },
  layout: { zh: "版式", en: "Layout" },
  layoutDesc: {
    zh: "标签 body-sm / medium / --text-secondary；标签到控件 --space-1-5；说明 caption / --text-tertiary；错误 caption / --danger-text。",
    en: "Label body-sm / medium / --text-secondary; label-to-control --space-1-5; hint caption / --text-tertiary; error caption / --danger-text.",
  },
  paperTitle: { zh: "论文标题", en: "Paper title" },
  officialTitleHint: { zh: "使用投稿系统中的正式标题", en: "Use the official title from the submission system" },
  demoTitle: { zh: "大语言模型辅助的系统综述方法", en: "LLM-assisted systematic review methods" },
  wordLimit: { zh: "字数上限", en: "Word limit" },
  wordLimitError: { zh: "字数上限不能超过 6000", en: "The word limit cannot exceed 6000" },
  wordsSuffix: { zh: " 字", en: " words" },
  form: { zh: "表单", en: "Form" },
  formDesc: {
    zh: "字段之间用 --space-4；不同控件共享同一套标签与消息样式。",
    en: "Fields are spaced with --space-4; different controls share one label and message style.",
  },
  venueType: { zh: "发表类型", en: "Publication type" },
  venueJournal: { zh: "期刊论文", en: "Journal article" },
  venueConference: { zh: "会议论文", en: "Conference paper" },
  venueThesis: { zh: "学位论文", en: "Thesis" },
  oneLineSummary: { zh: "一句话摘要", en: "One-line summary" },
  summaryHint: {
    zh: "不超过 120 字，会显示在团队文库卡片上",
    en: "Keep it under 120 characters; it shows on team library cards",
  },
  owningTeam: { zh: "归属团队", en: "Owning team" },
  teamHint: { zh: "草稿创建后不可更改", en: "Fixed after the draft is created" },
  demoTeam: { zh: "计算语言学课题组", en: "Computational Linguistics Group" },
  api: { zh: "接口", en: "API" },
} as const;

const title = ref(t(s.demoTitle));
const limit = ref<number | null>(8000);
const summary = ref("");
const venue = ref("journal");
const venues = computed(() => [
  { label: t(s.venueJournal), value: "journal" },
  { label: t(s.venueConference), value: "conference" },
  { label: t(s.venueThesis), value: "thesis" },
]);
</script>

<template>
  <DocPage>
    <DocSection :title="s.demo" :desc="s.demoDesc">
      <UsagePlayground :entry="usage" />
    </DocSection>
    <DocSection :title="s.whenToUse">
      <ul class="doc-rules">
        <li data-kind="do" v-html="t(s.rule1)" />
        <li data-kind="do" v-html="t(s.rule2)" />
        <li data-kind="dont" v-html="t(s.rule3)" />
        <li data-kind="dont" v-html="t(s.rule4)" />
      </ul>
    </DocSection>

    <DocSection :title="s.layout" :desc="s.layoutDesc">
      <Specimen :surfaces="['paper', 'frost']" layout="stack">
        <FormField v-slot="{ inputId, describedBy, invalid }" input-id="ff-title" :label="t(s.paperTitle)" :hint="t(s.officialTitleHint)" required>
          <InputText :id="inputId" v-model="title" :aria-describedby="describedBy" :invalid="invalid" fluid />
        </FormField>
        <FormField v-slot="{ inputId, describedBy, invalid }" input-id="ff-limit" :label="t(s.wordLimit)" :error="t(s.wordLimitError)">
          <InputNumber v-model="limit" :input-id="inputId" :aria-describedby="describedBy" :invalid="invalid" :suffix="t(s.wordsSuffix)" />
        </FormField>
      </Specimen>
    </DocSection>

    <DocSection :title="s.form" :desc="s.formDesc">
      <Specimen :surfaces="['raised']" themes="both" layout="stack">
        <FormField v-slot="{ inputId, describedBy }" input-id="ff-venue" :label="t(s.venueType)">
          <Select v-model="venue" :input-id="inputId" :options="venues" option-label="label" option-value="value" :aria-describedby="describedBy" />
        </FormField>
        <FormField v-slot="{ inputId, describedBy, invalid }" input-id="ff-summary" :label="t(s.oneLineSummary)" :hint="t(s.summaryHint)">
          <Textarea :id="inputId" v-model="summary" :rows="2" :aria-describedby="describedBy" :invalid="invalid" />
        </FormField>
        <FormField v-slot="{ inputId }" input-id="ff-disabled" :label="t(s.owningTeam)" :hint="t(s.teamHint)">
          <InputText :id="inputId" :model-value="t(s.demoTeam)" disabled fluid />
        </FormField>
      </Specimen>
    </DocSection>

    <DocSection :title="s.api">
      <ApiTable :api="api" />
    </DocSection>
  </DocPage>
</template>
