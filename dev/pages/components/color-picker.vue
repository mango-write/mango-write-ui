<script setup lang="ts">
import { ref } from "vue";
import { ColorPicker } from "../../../src";
import DocPage from "../../kit/DocPage.vue";
import DocSection from "../../kit/DocSection.vue";
import Specimen from "../../kit/Specimen.vue";
import StateGrid from "../../kit/StateGrid.vue";
import StateRow from "../../kit/StateRow.vue";

const tag = ref("f97316");
const label = ref("3b82c4");
</script>

<template>
  <DocPage lead="选一个颜色：标签色、批注色、图表系列色。触发器是一个与控件同高的方形色块，面板由系统原生取色器提供（跟随系统主题）。">
    <DocSection title="何时使用">
      <ul class="doc-rules">
        <li data-kind="do">用户需要自定义任意颜色，例如给文库标签上色。</li>
        <li data-kind="dont">只有少量预设色时，用一排色块按钮让用户直接点选，比取色器快。</li>
        <li data-kind="dont">不要让颜色成为唯一信息：标签仍需名称。</li>
      </ul>
    </DocSection>

    <DocSection title="底面" desc="纸面与霜面并排；色块外圈是控件面，内圆角与外圆角同心。">
      <Specimen :surfaces="['paper', 'frost']">
        <ColorPicker v-model="tag" aria-label="标签颜色" />
        <ColorPicker v-model="label" aria-label="图表系列颜色" />
        <span class="doc-note">#{{ tag }} · #{{ label }}</span>
      </Specimen>
    </DocSection>

    <DocSection title="尺寸" desc="没有 size 参数，边长取 --control-h；放进 .mw-size-* 容器即换档。inline 固定为 lg 档边长。">
      <Specimen themes="single">
        <div v-for="s in (['xs', 'sm', 'md', 'lg'] as const)" :key="s" class="doc-row" :class="`mw-size-${s}`">
          <span class="doc-note">{{ s }}</span>
          <ColorPicker v-model="tag" :aria-label="`${s} 档颜色`" />
        </div>
        <div class="doc-row">
          <span class="doc-note">inline</span>
          <ColorPicker v-model="tag" inline aria-label="内联颜色" />
        </div>
      </Specimen>
    </DocSection>

    <DocSection title="状态">
      <Specimen themes="both">
        <StateGrid :columns="['默认', '禁用', '只读', '错误']" label-width="48px">
          <StateRow label="色块">
            <ColorPicker v-model="tag" aria-label="默认" />
            <ColorPicker v-model="tag" disabled aria-label="禁用" />
            <ColorPicker v-model="tag" readonly aria-label="只读" />
            <ColorPicker v-model="tag" invalid aria-label="错误" />
          </StateRow>
        </StateGrid>
      </Specimen>
    </DocSection>

    <DocSection title="接口">
      <table class="doc-table">
        <thead>
          <tr><th>属性</th><th>取值</th><th>说明</th></tr>
        </thead>
        <tbody>
          <tr><td><code>v-model</code></td><td><code>string</code></td><td>按 <code>format</code> 输出；hex 默认不带 #（传入带 # 则保留）</td></tr>
          <tr><td><code>format</code></td><td><code>hex · rgb · hsb</code></td><td>输出格式</td></tr>
          <tr><td><code>inline</code></td><td><code>boolean</code></td><td>更大的色块</td></tr>
          <tr><td><code>disabled</code> / <code>readonly</code> / <code>invalid</code></td><td><code>boolean</code></td><td>状态</td></tr>
        </tbody>
      </table>
    </DocSection>
  </DocPage>
</template>
