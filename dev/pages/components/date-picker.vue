<script setup lang="ts">
import { ref } from "vue";
import { DatePicker } from "../../../src";
import DocPage from "../../kit/DocPage.vue";
import DocSection from "../../kit/DocSection.vue";
import Specimen from "../../kit/Specimen.vue";
import StateGrid from "../../kit/StateGrid.vue";
import StateRow from "../../kit/StateRow.vue";

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
</script>

<template>
  <DocPage
    lead="日期与时间选择：支持单日、起止区间、多日点选与时间步进器，同时允许按格式直接键入文本。输入框采用半透明控件面（.mw-control），弹出日历面板为霜材质（.mw-frost）。"
  >
    <DocSection title="何时使用">
      <ul class="doc-rules">
        <li data-kind="do">录入稿件截止日、文献发表日期、实验采样时刻，或按日期区间（<code>selectionMode="range"</code>）筛选记录。</li>
        <li data-kind="do">既支持展开霜面日历面板点选，也支持直接键入 <code>YYYY-MM-DD</code> 快速提交。</li>
        <li data-kind="dont">仅选择四位发表年份（如 1990–2026）时用 <code>InputNumber</code> 或 <code>Select</code>，不必展开完整月历。</li>
        <li data-kind="dont">不用占位符替代字段标题；字段名称应由外层 <code>FormField</code> 常驻提供。</li>
      </ul>
    </DocSection>

    <DocSection
      title="底面"
      desc="纸面与霜面、浅色与深色并排。点击输入框或日历图标展开 .mw-frost 日历浮层，选中日以品牌色实心标记，区间内日期以 --fill-selected 承托。"
    >
      <Specimen :surfaces="['paper', 'frost']" layout="stack">
        <DatePicker
          v-model="singleDate"
          show-icon
          show-clear
          show-button-bar
          placeholder="选择发表日期"
          aria-label="发表日期"
        />
        <DatePicker
          v-model="rangeDates"
          selection-mode="range"
          show-icon
          show-clear
          hide-on-range-selection
          placeholder="选择起止日期区间"
          aria-label="日期区间"
        />
      </Specimen>
    </DocSection>

    <DocSection
      title="选择模式与时间步进"
      desc="支持 single / range / multiple 三种日期模式，以及 showTime（日期+时间）、timeOnly（纯时间）与 minDate / maxDate 边界约束。"
    >
      <Specimen themes="single" layout="stack">
        <div class="doc-row">
          <span class="doc-note" style="width: 112px">单日 + 底栏</span>
          <DatePicker v-model="singleDate" show-icon show-button-bar show-clear aria-label="单日选择" />
        </div>
        <div class="doc-row">
          <span class="doc-note" style="width: 112px">起止区间 range</span>
          <DatePicker
            v-model="rangeDates"
            selection-mode="range"
            show-icon
            hide-on-range-selection
            aria-label="起止区间"
          />
        </div>
        <div class="doc-row">
          <span class="doc-note" style="width: 112px">多日 multiple</span>
          <DatePicker
            v-model="multipleDates"
            selection-mode="multiple"
            show-icon
            show-clear
            aria-label="多日选择"
          />
        </div>
        <div class="doc-row">
          <span class="doc-note" style="width: 112px">日期 + 24h 时间</span>
          <DatePicker v-model="dateTime24" show-time hour-format="24" show-icon aria-label="日期与24小时时间" />
        </div>
        <div class="doc-row">
          <span class="doc-note" style="width: 112px">纯时间 12h</span>
          <DatePicker v-model="timeOnly12" time-only hour-format="12" show-icon aria-label="12小时制时间" />
        </div>
        <div class="doc-row">
          <span class="doc-note" style="width: 112px">可选范围限制</span>
          <DatePicker
            v-model="boundedDate"
            :min-date="minDate"
            :max-date="maxDate"
            show-icon
            aria-label="受限日期范围"
          />
          <span class="doc-note">仅允许当月 5 日 – 25 日</span>
        </div>
      </Specimen>
    </DocSection>

    <DocSection title="尺寸" desc="sm / md / lg 三档，默认 md，与同档输入框和按钮严格同高。">
      <Specimen themes="single" layout="stack">
        <div v-for="s in (['sm', 'md', 'lg'] as const)" :key="s" class="doc-row">
          <span class="doc-note" style="width: 24px">{{ s }}</span>
          <DatePicker v-model="singleDate" :size="s" show-icon show-clear :aria-label="`${s} 档日期选择`" />
        </div>
      </Specimen>
    </DocSection>

    <DocSection title="状态" desc="支持清除按钮、只读检视、禁用降级与错误红框语义；日历数字统一启用 tabular-nums 等宽对齐。">
      <Specimen themes="both">
        <StateGrid :columns="['空', '有值可清除', '只读', '禁用', '错误']" label-width="48px">
          <StateRow label="md">
            <DatePicker :model-value="null" placeholder="YYYY-MM-DD" show-icon aria-label="空状态" />
            <DatePicker v-model="singleDate" show-icon show-clear aria-label="有值可清除" />
            <DatePicker :model-value="singleDate" readonly show-icon aria-label="只读状态" />
            <DatePicker :model-value="singleDate" disabled show-icon aria-label="禁用状态" />
            <DatePicker :model-value="null" placeholder="必填日期" invalid show-icon aria-label="错误状态" />
          </StateRow>
        </StateGrid>
      </Specimen>
    </DocSection>

    <DocSection title="接口">
      <table class="doc-table">
        <thead>
          <tr><th>属性 / 事件</th><th>取值</th><th>说明</th></tr>
        </thead>
        <tbody>
          <tr><td><code>v-model</code></td><td><code>Date | string | Array&lt;Date | null&gt; | null</code></td><td>绑定日期值；<code>range</code> 与 <code>multiple</code> 模式下为数组</td></tr>
          <tr><td><code>selectionMode</code></td><td><code>single · range · multiple</code></td><td>单日（默认）、起止区间或多日选择</td></tr>
          <tr><td><code>showTime</code> / <code>timeOnly</code> / <code>hourFormat</code></td><td><code>boolean</code> / <code>"24" · "12"</code></td><td>附加时间步进器、仅选择时间、小时制（默认 <code>"24"</code>）</td></tr>
          <tr><td><code>dateFormat</code></td><td><code>string</code></td><td>展示格式，默认 <code>"yy-mm-dd"</code>（4 位年-2 位月-2 位日）</td></tr>
          <tr><td><code>minDate</code> / <code>maxDate</code></td><td><code>Date | null</code></td><td>最小与最大可选日期边界，越界日期置灰禁选</td></tr>
          <tr><td><code>showIcon</code> / <code>showClear</code> / <code>showButtonBar</code></td><td><code>boolean</code></td><td>右侧日历/时钟触发钮、清空按钮、底部「今天 / 清除」动作栏</td></tr>
          <tr><td><code>size</code> / <code>fluid</code> / <code>invalid</code> / <code>disabled</code> / <code>readonly</code></td><td><code>sm · md · lg</code> / <code>boolean</code></td><td>尺寸档位、撑满容器宽度与表单状态</td></tr>
        </tbody>
      </table>
    </DocSection>
  </DocPage>
</template>
