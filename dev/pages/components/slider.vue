<script setup lang="ts">
import { ref } from "vue";
import { Slider } from "../../../src";
import { api } from "../../api/entries/slider";
import ApiTable from "../../kit/ApiTable.vue";
import DocPage from "../../kit/DocPage.vue";
import DocSection from "../../kit/DocSection.vue";
import Specimen from "../../kit/Specimen.vue";
import StateGrid from "../../kit/StateGrid.vue";
import StateRow from "../../kit/StateRow.vue";

const fontSize = ref(16);
const yearRange = ref<[number, number]>([2019, 2026]);
const continuousValue = ref(50);
const similarity = ref(75);
const ticked = ref(50);
const zoomLevel = ref(100);
</script>

<template>
  <DocPage lead="滑动条：缺省无级连续拖动，显式传入 step 后按刻度吸附并可开启刻度标记。轨道用 --fill-strong，已填充段与手柄描边用品牌色，手柄本身为抬起实体面。">
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

    <DocSection title="连续、步长与刻度" desc="缺省无级连续拖动（值为连续浮点）；显式传入 step 后拖动按刻度吸附，方向键按 step 增减，PageUp/PageDown 按 10 倍步长移动。showTicks 在轨道上渲染每个刻度的小节点（需显式 step），刻度数量 = 范围 / step + 1，max 端点必含——注意短轨道上的刻度密度。">
      <Specimen themes="single" layout="stack">
        <div class="doc-row" style="align-items: stretch; gap: var(--space-5)">
          <div style="flex: 1; min-width: 200px" class="doc-stack">
            <span class="doc-note">连续（缺省无 step，当前 {{ continuousValue.toFixed(1) }}）</span>
            <Slider v-model="continuousValue" :min="0" :max="100" aria-label="连续模式" />
          </div>
          <div style="flex: 1; min-width: 200px" class="doc-stack">
            <span class="doc-note">步长 step=5（当前 {{ similarity }}%）</span>
            <Slider v-model="similarity" :min="0" :max="100" :step="5" aria-label="相似度阈值" />
          </div>
        </div>
        <div style="flex: 1; min-width: 200px" class="doc-stack">
          <span class="doc-note">刻度标记 step=25 + showTicks（当前 {{ ticked }}）</span>
          <Slider v-model="ticked" :min="0" :max="100" :step="25" show-ticks aria-label="刻度标记" />
        </div>
        <div class="doc-row" style="gap: var(--space-3); padding-block: var(--space-2); padding-inline: var(--space-4)">
          <Slider v-model="zoomLevel" orientation="vertical" :min="50" :max="150" :step="25" show-ticks aria-label="垂直缩放" />
          <span class="doc-note">垂直 step=25 + showTicks（{{ zoomLevel }}%）</span>
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
      <ApiTable :api="api" />
    </DocSection>
  </DocPage>
</template>
