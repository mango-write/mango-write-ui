<script setup lang="ts">
import { ref } from "vue";
import { SearchableMultiSelect } from "../../../src";
import DocPage from "../../kit/DocPage.vue";
import DocSection from "../../kit/DocSection.vue";
import Specimen from "../../kit/Specimen.vue";
import StateGrid from "../../kit/StateGrid.vue";
import StateRow from "../../kit/StateRow.vue";

const tags = ref<string[]>(["methodology", "dataset", "benchmark"]);
const crowdedTags = ref<string[]>(["methodology", "dataset", "benchmark", "ablation", "reproducible"]);

const tagOptions = [
  { label: "方法论 (Methodology)", value: "methodology", code: "MTH" },
  { label: "数据集 (Dataset)", value: "dataset", code: "DAT" },
  { label: "基准评测 (Benchmark)", value: "benchmark", code: "BMK" },
  { label: "消融实验 (Ablation)", value: "ablation", code: "ABL" },
  { label: "可复现性 (Reproducible)", value: "reproducible", code: "REP" },
  { label: "综述 (Survey)", value: "survey", code: "SRV" },
];

function filterByLabelOrCode(option: Record<string, unknown>, query: string): boolean {
  const label = String(option.label ?? "").toLowerCase();
  const code = String(option.code ?? "").toLowerCase();
  return label.includes(query) || code.includes(query);
}
</script>

<template>
  <DocPage lead="可搜索多选：已选项以 chip 排在框内，尾随光标直接打字过滤；借助 ResizeObserver 与隐藏量算行按容器真实可用宽度动态折叠为 +N。">
    <DocSection title="何时使用">
      <ul class="doc-rules">
        <li data-kind="do">需要高频输入检索并多选（如文献标签、关键词、分类），且工具栏或表单列宽有限。</li>
        <li data-kind="do">通过 <code>optionFilter</code> 自定义多字段匹配（如同时匹配名称、拼音或缩写码）。</li>
        <li data-kind="dont">需要远程异步搜索时用 <code>AsyncSearchSelect</code>；选人场景直接用封装好头像的 <code>UserSelect</code>。</li>
      </ul>
    </DocSection>

    <DocSection title="底面" desc="纸面与霜面并排。框内 chip 使用 --fill-default，点击 × 或按 Backspace 即可移除末尾项。">
      <Specimen :surfaces="['paper', 'frost']" layout="stack">
        <SearchableMultiSelect
          v-model="tags"
          :options="tagOptions"
          option-label="label"
          option-value="value"
          placeholder="输入过滤并添加文献标签…"
          aria-label="文献标签"
        />
      </Specimen>
    </DocSection>

    <DocSection title="动态宽度折叠与自定义过滤" desc="根据容器真实宽度测量每个 chip，放不下的自动收进 +N；下方右例支持输入缩写码（如 MTH / BMK）过滤。">
      <Specimen themes="single" layout="stack">
        <div class="doc-row">
          <span class="doc-note" style="width: 88px">窄容器 260px</span>
          <div style="width: 260px">
            <SearchableMultiSelect
              v-model="crowdedTags"
              :options="tagOptions"
              option-label="label"
              option-value="value"
              placeholder="选择标签"
              aria-label="窄容器折叠演示"
            />
          </div>
        </div>
        <div class="doc-row">
          <span class="doc-note" style="width: 88px">自定义过滤</span>
          <div style="flex: 1; min-width: 240px">
            <SearchableMultiSelect
              v-model="tags"
              :options="tagOptions"
              option-label="label"
              option-value="value"
              :option-filter="filterByLabelOrCode"
              placeholder="试试输入 MTH、DAT 或中文…"
              aria-label="支持缩写码检索"
            >
              <template #option="{ option }">
                <span class="doc-row" style="justify-content: space-between; width: 100%">
                  <span>{{ option.label }}</span>
                  <span class="doc-note">{{ option.code }}</span>
                </span>
              </template>
            </SearchableMultiSelect>
          </div>
        </div>
      </Specimen>
    </DocSection>

    <DocSection title="尺寸" desc="支持 small / 默认 md / large 三档。">
      <Specimen themes="single" layout="stack">
        <div class="doc-row">
          <span class="doc-note" style="width: 48px">small</span>
          <div style="flex: 1">
            <SearchableMultiSelect v-model="tags" size="small" :options="tagOptions" option-label="label" option-value="value" aria-label="小号" />
          </div>
        </div>
        <div class="doc-row">
          <span class="doc-note" style="width: 48px">md</span>
          <div style="flex: 1">
            <SearchableMultiSelect v-model="tags" :options="tagOptions" option-label="label" option-value="value" aria-label="默认" />
          </div>
        </div>
        <div class="doc-row">
          <span class="doc-note" style="width: 48px">large</span>
          <div style="flex: 1">
            <SearchableMultiSelect v-model="tags" size="large" :options="tagOptions" option-label="label" option-value="value" aria-label="大号" />
          </div>
        </div>
      </Specimen>
    </DocSection>

    <DocSection title="状态" desc="窄宽下自动收拢；禁用态隐藏单个 chip 的移除按钮。">
      <Specimen themes="both">
        <StateGrid :columns="['空态占位', '宽容器展开', '窄容器 +N', '禁用', '错误']" label-width="48px">
          <StateRow label="md">
            <div style="width: 180px">
              <SearchableMultiSelect :model-value="[]" :options="tagOptions" option-label="label" option-value="value" placeholder="添加标签…" aria-label="空态占位" />
            </div>
            <div style="width: 240px">
              <SearchableMultiSelect :model-value="['methodology', 'dataset']" :options="tagOptions" option-label="label" option-value="value" aria-label="宽容器展开" />
            </div>
            <div style="width: 190px">
              <SearchableMultiSelect v-model="crowdedTags" :options="tagOptions" option-label="label" option-value="value" aria-label="窄容器折叠" />
            </div>
            <div style="width: 200px">
              <SearchableMultiSelect :model-value="['methodology', 'dataset']" :options="tagOptions" option-label="label" option-value="value" disabled aria-label="禁用" />
            </div>
            <div style="width: 180px">
              <SearchableMultiSelect :model-value="[]" :options="tagOptions" option-label="label" option-value="value" invalid placeholder="至少一项" aria-label="错误" />
            </div>
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
          <tr><td><code>modelValue</code></td><td><code>unknown[]</code></td><td>选中值数组（<code>v-model</code>）</td></tr>
          <tr><td><code>options</code> / <code>optionLabel</code> / <code>optionValue</code></td><td><code>Record[] / string</code></td><td>候选对象列表、展示字段名与取值字段名</td></tr>
          <tr><td><code>optionFilter</code></td><td><code>(option, query) =&gt; boolean</code></td><td>自定义过滤谓词（<code>query</code> 已转小写）</td></tr>
          <tr><td><code>size</code></td><td><code>"small" | "large"</code></td><td>尺寸档位，不传为 <code>md</code></td></tr>
          <tr><td><code>#chip</code></td><td><code>{ option, label, index, remove }</code></td><td>自定义已选 chip 渲染（如 <code>UserSelect</code> 的头像胶囊）</td></tr>
          <tr><td><code>#option</code></td><td><code>{ option, label, selected }</code></td><td>自定义浮层选项行内容</td></tr>
        </tbody>
      </table>
    </DocSection>
  </DocPage>
</template>
