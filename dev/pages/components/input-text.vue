<script setup lang="ts">
import { ref } from "vue";
import { InputText } from "../../../src";
import DocPage from "../../kit/DocPage.vue";
import DocSection from "../../kit/DocSection.vue";
import Specimen from "../../kit/Specimen.vue";
import StateGrid from "../../kit/StateGrid.vue";
import StateRow from "../../kit/StateRow.vue";

const title = ref("基于检索增强的综述写作流程");
</script>

<template>
  <DocPage lead="输入单行文本：标题、关键词、引用键、检索词。可输入面统一用半透明控件面，聚焦时边框转品牌色并带一圈晕。">
    <DocSection title="何时使用">
      <ul class="doc-rules">
        <li data-kind="do">短文本、一行能写完的值：草稿标题、团队名称、DOI。</li>
        <li data-kind="do">需要前后缀或图标时，外面套 <code>InputGroup</code> / <code>IconField</code>，不要在输入框里手写定位。</li>
        <li data-kind="dont">多行内容（摘要、批注）用 <code>Textarea</code>；数值用 <code>InputNumber</code>。</li>
        <li data-kind="dont">不用占位符代替标签：标签交给 <code>FormField</code> 常驻显示。</li>
      </ul>
    </DocSection>

    <DocSection title="底面" desc="纸面与霜面、浅色与深色并排。控件面是半透明叠层，放进弹出层不会出现实色块。">
      <Specimen :surfaces="['paper', 'frost']" layout="stack">
        <InputText v-model="title" fluid />
        <InputText placeholder="搜索文献、作者或 DOI" fluid />
      </Specimen>
    </DocSection>

    <DocSection title="尺寸" desc="xs / sm / md / lg 四档，默认跟随密度上下文（md）。高度、字号与内距由同一档位派生，与同档按钮对齐。">
      <Specimen themes="single" layout="stack">
        <div v-for="s in (['xs', 'sm', 'md', 'lg'] as const)" :key="s" class="doc-row">
          <span class="doc-note" style="width: 24px">{{ s }}</span>
          <InputText :size="s" placeholder="引用键，如 zhang2024" />
        </div>
        <div class="doc-row mw-size-sm">
          <span class="doc-note">.mw-size-sm 容器</span>
          <InputText placeholder="不传 size，跟随容器" />
        </div>
      </Specimen>
    </DocSection>

    <DocSection title="状态" desc="hover / 焦点请用指针与 Tab 键体验。只读保持文字完整可读，禁用才降级。">
      <Specimen themes="both">
        <StateGrid :columns="['空', '有值', '禁用', '只读', '错误']" label-width="56px">
          <StateRow label="md">
            <InputText placeholder="草稿标题" />
            <InputText model-value="课题组周报" />
            <InputText model-value="课题组周报" disabled />
            <InputText model-value="10.1000/xyz123" readonly />
            <InputText model-value="zhang 2024" invalid />
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
          <tr><td><code>v-model</code></td><td><code>string</code></td><td>输入法组合期间不回写，组合结束一次提交</td></tr>
          <tr><td><code>size</code></td><td><code>xs · sm · md · lg</code></td><td>不传则跟随密度上下文</td></tr>
          <tr><td><code>invalid</code> / <code>disabled</code> / <code>readonly</code></td><td><code>boolean</code></td><td>状态；错误说明由 <code>FormField</code> 负责</td></tr>
          <tr><td><code>fluid</code></td><td><code>boolean</code></td><td>撑满父容器宽度</td></tr>
        </tbody>
      </table>
    </DocSection>
  </DocPage>
</template>
