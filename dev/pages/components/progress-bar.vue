<script setup lang="ts">
import { ref } from "vue";
import { Button, ProgressBar } from "../../../src";
import DocPage from "../../kit/DocPage.vue";
import DocSection from "../../kit/DocSection.vue";
import Specimen from "../../kit/Specimen.vue";
import StateGrid from "../../kit/StateGrid.vue";
import StateRow from "../../kit/StateRow.vue";

const progress = ref(64);
</script>

<template>
  <DocPage lead="线性进度条（ProgressBar）：表达上传、文献解析或批量导出等耗时任务的完成度。支持精确百分比（determinate）与未知时长脉动（indeterminate）。">
    <DocSection title="何时使用">
      <ul class="doc-rules">
        <li data-kind="do"><strong>定量模式</strong>（<code>determinate</code>）：已知总步数或字节进度（如 PDF 上传、语料批处理进度）。</li>
        <li data-kind="do"><strong>不定量模式</strong>（<code>indeterminate</code>）：后台任务正在进行但无法预估剩余百分比；轨道自动收窄为 6px 细条。</li>
        <li data-kind="dont">局部按钮或行内槽位的即时加载请用 <code>Button loading</code> 或 <code>ProgressSpinner</code>。</li>
        <li data-kind="dont">当进度值较小时（如 &lt; 15%），若轨道内放不下长自定义文案，请设 <code>:show-value="false"</code> 并在进度条上方独立排版标题与百分比。</li>
      </ul>
    </DocSection>

    <DocSection title="底面" desc="纸面与霜面并排。轨道使用中性填充底与细边框，指示器采用品牌强调色（--accent）。">
      <Specimen :surfaces="['paper', 'frost']" layout="stack">
        <div style="width: 100%">
          <ProgressBar :value="progress" aria-label="PDF 解析进度" />
        </div>
        <div style="width: 100%">
          <ProgressBar mode="indeterminate" aria-label="正在生成引用索引" />
        </div>
      </Specimen>
    </DocSection>

    <DocSection title="模式与数值" desc="支持隐藏内置百分比文本或通过默认作用域插槽自定义文案；数值自动钳制在 0–100 之间。">
      <Specimen themes="single" layout="stack">
        <div class="doc-row">
          <span class="doc-note" style="width: 96px">默认百分比</span>
          <div style="flex: 1">
            <ProgressBar :value="progress" aria-label="默认百分比" />
          </div>
        </div>
        <div class="doc-row">
          <span class="doc-note" style="width: 96px">自定义插槽</span>
          <div style="flex: 1">
            <ProgressBar :value="progress" aria-label="自定义插槽">
              <template #default="{ value }">已解析 {{ Math.round(value) }} / 100 篇</template>
            </ProgressBar>
          </div>
        </div>
        <div class="doc-row">
          <span class="doc-note" style="width: 96px">隐藏内置数值</span>
          <div style="flex: 1">
            <ProgressBar :value="progress" :show-value="false" aria-label="隐藏内置数值" />
          </div>
        </div>
        <div class="doc-row">
          <span class="doc-note" style="width: 96px">indeterminate</span>
          <div style="flex: 1">
            <ProgressBar mode="indeterminate" aria-label="不定量进度" />
          </div>
        </div>
        <div class="doc-row">
          <Button size="xs" severity="secondary" label="-15%" @click="progress = Math.max(0, progress - 15)" />
          <Button size="xs" severity="secondary" label="+15%" @click="progress = Math.min(100, progress + 15)" />
          <Button size="xs" variant="text" severity="secondary" label="设为 100%" @click="progress = 100" />
        </div>
      </Specimen>
    </DocSection>

    <DocSection title="状态" desc="不同进度阶段与模式在浅色、深色主题下的对比。开启系统「减少动态效果」时动画自动停用。">
      <Specimen themes="both">
        <StateGrid :columns="['0%', '35%', '75%', '100%']" label-width="104px">
          <StateRow label="显示数值">
            <div style="width: 140px"><ProgressBar :value="0" aria-label="0%" /></div>
            <div style="width: 140px"><ProgressBar :value="35" aria-label="35%" /></div>
            <div style="width: 140px"><ProgressBar :value="75" aria-label="75%" /></div>
            <div style="width: 140px"><ProgressBar :value="100" aria-label="100%" /></div>
          </StateRow>
          <StateRow label="无文字细轨">
            <div style="width: 140px"><ProgressBar :value="0" :show-value="false" aria-label="0%" /></div>
            <div style="width: 140px"><ProgressBar :value="35" :show-value="false" aria-label="35%" /></div>
            <div style="width: 140px"><ProgressBar :value="75" :show-value="false" aria-label="75%" /></div>
            <div style="width: 140px"><ProgressBar mode="indeterminate" aria-label="加载中" /></div>
          </StateRow>
        </StateGrid>
      </Specimen>
    </DocSection>

    <DocSection title="接口">
      <table class="doc-table">
        <thead>
          <tr><th>属性 / 插槽</th><th>取值</th><th>说明</th></tr>
        </thead>
        <tbody>
          <tr><td><code>value</code></td><td><code>number</code></td><td>当前进度百分比（0–100，超出范围自动钳制）；默认 <code>0</code></td></tr>
          <tr><td><code>mode</code></td><td><code>determinate · indeterminate</code></td><td>定量或不确定时长模式；默认 <code>determinate</code></td></tr>
          <tr><td><code>showValue</code></td><td><code>boolean</code></td><td>是否在指示条内显示百分比文本；默认 <code>true</code></td></tr>
          <tr><td><code>#default</code></td><td><code>{ value: number }</code></td><td>自定义指示器内的进度文案（仅在 <code>determinate</code> 下渲染）</td></tr>
        </tbody>
      </table>
    </DocSection>
  </DocPage>
</template>
