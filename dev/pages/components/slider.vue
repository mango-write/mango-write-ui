<script setup lang="ts">
import { ref } from "vue";
import { Slider } from "../../../src";
import DocPage from "../../kit/DocPage.vue";
import DocSection from "../../kit/DocSection.vue";
import Specimen from "../../kit/Specimen.vue";
import StateGrid from "../../kit/StateGrid.vue";
import StateRow from "../../kit/StateRow.vue";

const fontSize = ref(16);
const yearRange = ref<[number, number]>([2019, 2026]);
const similarity = ref(75);
const zoomLevel = ref(100);
</script>

<template>
  <DocPage lead="滑动条：在连续或定步长的数值区间内拖拽取值。轨道用 --fill-strong，已填充段与手柄描边用品牌色，手柄本身为抬起实体面。">
    <DocSection title="何时使用">
      <ul class="doc-rules">
        <li data-kind="do">调节即时预览的相对量或区间：字号缩放、发表年份范围、检索相似度阈值。</li>
        <li data-kind="do">需要双端闭区间筛选时开启 <code>range</code>，<code>v-model</code> 绑定二元数组 <code>[start, end]</code>。</li>
        <li data-kind="dont">需要输入精确数值（如页码、经费金额）时用 <code>InputNumber</code>。</li>
      </ul>
    </DocSection>

    <DocSection title="底面" desc="纸面与霜面并排。单值与双端区间（range）共享同一套轨道与手柄几何。">
      <Specimen :surfaces="['paper', 'frost']" layout="stack">
        <div class="doc-stack" style="gap: var(--space-1)">
          <div class="doc-row" style="justify-content: space-between">
            <span class="doc-note">阅读字号</span>
            <span class="doc-note">{{ fontSize }} px</span>
          </div>
          <Slider v-model="fontSize" :min="12" :max="24" :step="1" aria-label="阅读字号" />
        </div>
        <div class="doc-stack" style="gap: var(--space-1)">
          <div class="doc-row" style="justify-content: space-between">
            <span class="doc-note">发表年份区间</span>
            <span class="doc-note">{{ yearRange[0] }} – {{ yearRange[1] }}</span>
          </div>
          <Slider v-model="yearRange" range :min="2010" :max="2026" :step="1" aria-label="发表年份区间" />
        </div>
      </Specimen>
    </DocSection>

    <DocSection title="方向与步长" desc="支持水平（默认）与垂直（vertical）方向，方向键按 step 增减，PageUp/PageDown 按 10 倍步长移动。">
      <Specimen themes="single">
        <div style="flex: 1; min-width: 200px" class="doc-stack">
          <span class="doc-note">步长 step=5（当前 {{ similarity }}%）</span>
          <Slider v-model="similarity" :min="0" :max="100" :step="5" aria-label="相似度阈值" />
        </div>
        <div class="doc-row" style="gap: var(--space-3); padding-inline: var(--space-4)">
          <Slider v-model="zoomLevel" orientation="vertical" :min="50" :max="150" :step="10" aria-label="垂直缩放" />
          <span class="doc-note">垂直 {{ zoomLevel }}%</span>
        </div>
      </Specimen>
    </DocSection>

    <DocSection title="状态" desc="聚焦时手柄呈现品牌色外环；禁用态降低整体不透明度并禁止拖拽。">
      <Specimen themes="both">
        <StateGrid :columns="['单值默认', '双端区间', '只读', '禁用', '错误']" label-width="56px">
          <StateRow label="水平">
            <div style="width: 120px"><Slider :model-value="45" aria-label="单值默认" /></div>
            <div style="width: 120px"><Slider :model-value="[20, 80]" range aria-label="双端区间" /></div>
            <div style="width: 120px"><Slider :model-value="60" readonly aria-label="只读" /></div>
            <div style="width: 120px"><Slider :model-value="45" disabled aria-label="禁用" /></div>
            <div style="width: 120px"><Slider :model-value="30" invalid aria-label="错误" /></div>
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
          <tr><td><code>modelValue</code></td><td><code>number | [number, number]</code></td><td>当前数值或起止区间（<code>v-model</code>）</td></tr>
          <tr><td><code>min</code> / <code>max</code> / <code>step</code></td><td><code>number</code></td><td>最小值（默认 0）、最大值（默认 100）与步长（默认 1）</td></tr>
          <tr><td><code>range</code></td><td><code>boolean</code></td><td>开启双滑块区间选择</td></tr>
          <tr><td><code>orientation</code></td><td><code>horizontal · vertical</code></td><td>方向，默认 <code>horizontal</code></td></tr>
          <tr><td><code>disabled</code> / <code>readonly</code> / <code>invalid</code></td><td><code>boolean</code></td><td>禁用、只读与错误态</td></tr>
          <tr><td><code>@slideend</code></td><td><code>{ originalEvent, value }</code></td><td>拖拽结束或键盘释放时触发</td></tr>
        </tbody>
      </table>
    </DocSection>
  </DocPage>
</template>
