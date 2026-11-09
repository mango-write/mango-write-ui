<script setup lang="ts">
import { ref } from "vue";
import { DatePicker } from "@mango-write/ui-vue";
import { api } from "../../api/entries/date-picker";
import ApiTable from "../../kit/ApiTable.vue";
import DocPage from "../../kit/DocPage.vue";
import DocSection from "../../kit/DocSection.vue";
import Specimen from "../../kit/Specimen.vue";
import StateGrid from "../../kit/StateGrid.vue";
import StateRow from "../../kit/StateRow.vue";
import UsagePlayground from "../../kit/UsagePlayground.vue";
import { t } from "../../i18n";
import { usage } from "../../usage/entries/date-picker";

const singleDate = ref<Date | null>(new Date(2026, 10, 4));
const rangeDates = ref<Array<Date | null>>([new Date(2026, 10, 1), new Date(2026, 10, 15)]);
const multipleDates = ref<Array<Date | null>>([
  new Date(2026, 10, 3),
  new Date(2026, 10, 8),
  new Date(2026, 10, 19),
]);
const dateTime24 = ref<Date | null>(new Date(2026, 10, 4, 14, 30));
const timeOnly12 = ref<Date | null>(new Date(2026, 10, 4, 9, 45));
const boundedDate = ref<Date | null>(new Date(2026, 10, 10));
const minDate = new Date(2026, 10, 5);
const maxDate = new Date(2026, 10, 25);

const s = {
  demo: { zh: "在线演示", en: "Live demo" },
  demoDesc: {
    zh: "调整配置即时预览；查看生成代码，一键复制到项目。",
    en: "Tweak the options for a live preview; view the generated code and copy it into your project.",
  },
  whenToUse: { zh: "何时使用", en: "When to use" },
  rule1: {
    zh: "录入稿件截止日、文献发表日期、实验采样时刻，或按日期区间（<code>selectionMode=\"range\"</code>）筛选记录。",
    en: "Entry deadlines, publication dates, sampling times, or filtering records by range (<code>selectionMode=\"range\"</code>).",
  },
  rule2: {
    zh: "既支持展开霜面日历面板点选，也支持直接键入 <code>YYYY-MM-DD</code> 快速提交；需要常驻展开的月历或手记热力筛选时使用同源组件 <code>Calendar</code>。",
    en: "Pick from the frost calendar panel or type <code>YYYY-MM-DD</code> directly; for an always-visible month view or activity-heat filtering, use the companion <code>Calendar</code> component.",
  },
  rule3: {
    zh: "仅选择四位发表年份（如 1990–2026）时用 <code>InputNumber</code> 或 <code>Select</code>，不必展开完整月历。",
    en: "For a four-digit publication year (e.g. 1990–2026), use <code>InputNumber</code> or <code>Select</code> instead of a full month calendar.",
  },
  rule4: {
    zh: "不用占位符替代字段标题；字段名称应由外层 <code>FormField</code> 常驻提供。",
    en: "Don't use the placeholder as the field label; the name should live in the surrounding <code>FormField</code>.",
  },
  baseTitle: { zh: "底面", en: "Surfaces" },
  baseDesc: {
    zh: "纸面与霜面、浅色与深色并排。点击输入框或日历图标展开 .mw-frost 日历浮层，选中日以品牌色实心标记，区间内日期以 --fill-selected 承托。",
    en: "Paper and frost, light and dark, side by side. Click the input or calendar icon to open the .mw-frost overlay; the selected day marks in solid brand color and in-range days sit on --fill-selected.",
  },
  pubPh: { zh: "选择发表日期", en: "Pick a publication date" },
  pubAria: { zh: "发表日期", en: "Publication date" },
  rangePh: { zh: "选择起止日期区间", en: "Pick a date range" },
  rangeAria: { zh: "日期区间", en: "Date range" },
  modesTitle: { zh: "选择模式与时间步进", en: "Selection modes and time stepping" },
  modesDesc: {
    zh: "支持 single / range / multiple 三种日期模式，以及 showTime（日期+时间）、timeOnly（纯时间）与 minDate / maxDate 边界约束。",
    en: "Three date modes — single / range / multiple — plus showTime (date + time), timeOnly (time only), and minDate / maxDate bounds.",
  },
  noteSingle: { zh: "单日 + 底栏", en: "Single + button bar" },
  noteRange: { zh: "起止区间 range", en: "Range" },
  noteMultiple: { zh: "多日 multiple", en: "Multiple" },
  noteTime24: { zh: "日期 + 24h 时间", en: "Date + 24h time" },
  noteTime12: { zh: "纯时间 12h", en: "Time only, 12h" },
  noteBounded: { zh: "可选范围限制", en: "Bounded range" },
  boundedNote: { zh: "仅允许当月 5 日 – 25 日", en: "Only the 5th–25th of this month" },
  singleAria: { zh: "单日选择", en: "Single date" },
  rangeModeAria: { zh: "起止区间", en: "Range" },
  multiAria: { zh: "多日选择", en: "Multiple dates" },
  time24Aria: { zh: "日期与24小时时间", en: "Date and 24-hour time" },
  time12Aria: { zh: "12小时制时间", en: "12-hour time" },
  boundedAria: { zh: "受限日期范围", en: "Bounded date range" },
  sizes: { zh: "尺寸", en: "Sizes" },
  sizesDesc: {
    zh: "sm / md / lg 三档，默认 md，与同档输入框和按钮严格同高。",
    en: "Three tiers, sm / md / lg, default md; heights match same-tier inputs and buttons exactly.",
  },
  sizeAria: { zh: "档日期选择", en: "date picker" },
  states: { zh: "状态", en: "States" },
  statesDesc: {
    zh: "支持清除按钮、只读检视、禁用降级与错误红框语义；日历数字统一启用 tabular-nums 等宽对齐。",
    en: "Clear button, read-only viewing, disabled fallback, and error semantics; calendar digits always align with tabular-nums.",
  },
  colEmpty: { zh: "空", en: "Empty" },
  colClearable: { zh: "有值可清除", en: "Clearable" },
  colReadonly: { zh: "只读", en: "Read-only" },
  colDisabled: { zh: "禁用", en: "Disabled" },
  colError: { zh: "错误", en: "Error" },
  requiredPh: { zh: "必填日期", en: "Required date" },
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
        <li data-kind="do" v-html="t(s.rule1)" />
        <li data-kind="do" v-html="t(s.rule2)" />
        <li data-kind="dont" v-html="t(s.rule3)" />
        <li data-kind="dont" v-html="t(s.rule4)" />
      </ul>
    </DocSection>

    <DocSection :title="s.baseTitle" :desc="s.baseDesc">
      <Specimen :surfaces="['paper', 'frost']" layout="stack">
        <DatePicker
          v-model="singleDate"
          show-icon
          show-clear
          show-button-bar
          :placeholder="t(s.pubPh)"
          :aria-label="t(s.pubAria)"
        />
        <DatePicker
          v-model="rangeDates"
          selection-mode="range"
          show-icon
          show-clear
          hide-on-range-selection
          :placeholder="t(s.rangePh)"
          :aria-label="t(s.rangeAria)"
        />
      </Specimen>
    </DocSection>

    <DocSection :title="s.modesTitle" :desc="s.modesDesc">
      <Specimen themes="single" layout="stack">
        <div class="doc-row">
          <span class="doc-note" style="width: 112px">{{ t(s.noteSingle) }}</span>
          <DatePicker v-model="singleDate" show-icon show-button-bar show-clear :aria-label="t(s.singleAria)" />
        </div>
        <div class="doc-row">
          <span class="doc-note" style="width: 112px">{{ t(s.noteRange) }}</span>
          <DatePicker
            v-model="rangeDates"
            selection-mode="range"
            show-icon
            hide-on-range-selection
            :aria-label="t(s.rangeModeAria)"
          />
        </div>
        <div class="doc-row">
          <span class="doc-note" style="width: 112px">{{ t(s.noteMultiple) }}</span>
          <DatePicker
            v-model="multipleDates"
            selection-mode="multiple"
            show-icon
            show-clear
            :aria-label="t(s.multiAria)"
          />
        </div>
        <div class="doc-row">
          <span class="doc-note" style="width: 112px">{{ t(s.noteTime24) }}</span>
          <DatePicker v-model="dateTime24" show-time hour-format="24" show-icon :aria-label="t(s.time24Aria)" />
        </div>
        <div class="doc-row">
          <span class="doc-note" style="width: 112px">{{ t(s.noteTime12) }}</span>
          <DatePicker v-model="timeOnly12" time-only hour-format="12" show-icon :aria-label="t(s.time12Aria)" />
        </div>
        <div class="doc-row">
          <span class="doc-note" style="width: 112px">{{ t(s.noteBounded) }}</span>
          <DatePicker
            v-model="boundedDate"
            :min-date="minDate"
            :max-date="maxDate"
            show-icon
            :aria-label="t(s.boundedAria)"
          />
          <span class="doc-note">{{ t(s.boundedNote) }}</span>
        </div>
      </Specimen>
    </DocSection>

    <DocSection :title="s.sizes" :desc="s.sizesDesc">
      <Specimen themes="single" layout="stack">
        <div v-for="sz in (['sm', 'md', 'lg'] as const)" :key="sz" class="doc-row">
          <span class="doc-note" style="width: 24px">{{ sz }}</span>
          <DatePicker v-model="singleDate" :size="sz" show-icon show-clear :aria-label="`${sz} ${t(s.sizeAria)}`" />
        </div>
      </Specimen>
    </DocSection>

    <DocSection :title="s.states" :desc="s.statesDesc">
      <Specimen themes="both">
        <StateGrid :columns="[s.colEmpty, s.colClearable, s.colReadonly, s.colDisabled, s.colError]" label-width="48px">
          <StateRow label="md">
            <DatePicker :model-value="null" placeholder="YYYY-MM-DD" show-icon :aria-label="t(s.colEmpty)" />
            <DatePicker v-model="singleDate" show-icon show-clear :aria-label="t(s.colClearable)" />
            <DatePicker :model-value="singleDate" readonly show-icon :aria-label="t(s.colReadonly)" />
            <DatePicker :model-value="singleDate" disabled show-icon :aria-label="t(s.colDisabled)" />
            <DatePicker :model-value="null" :placeholder="t(s.requiredPh)" invalid show-icon :aria-label="t(s.colError)" />
          </StateRow>
        </StateGrid>
      </Specimen>
    </DocSection>

    <DocSection :title="s.api">
      <ApiTable :api="api" />
    </DocSection>
  </DocPage>
</template>
