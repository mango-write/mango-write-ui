<script setup lang="ts">
import { ref } from "vue";
import { Select } from "../../../src";
import { api } from "../../api/entries/select";
import ApiTable from "../../kit/ApiTable.vue";
import CodeBlock from "../../kit/CodeBlock.vue";
import DocPage from "../../kit/DocPage.vue";
import DocSection from "../../kit/DocSection.vue";
import Specimen from "../../kit/Specimen.vue";
import StateGrid from "../../kit/StateGrid.vue";
import StateRow from "../../kit/StateRow.vue";

const sourceType = ref<string | null>("journal");
const sourceTypes = [
  { label: "期刊论文 (Journal Article)", value: "journal" },
  { label: "会议论文 (Conference Paper)", value: "conference" },
  { label: "学位论文 (Thesis)", value: "thesis" },
  { label: "预印本 (Preprint)", value: "preprint" },
  { label: "专著章节 (Book Section)", value: "book", disabled: true },
];

const journal = ref<string | null>("nature");
const journals = [
  { label: "Nature", value: "nature", issn: "0028-0836" },
  { label: "Science", value: "science", issn: "0036-8075" },
  { label: "Cell", value: "cell", issn: "0092-8674" },
  { label: "PNAS", value: "pnas", issn: "0027-8424" },
  { label: "NeurIPS Proceedings", value: "neurips", issn: "1049-5258" },
];

const customVenue = ref<string | null>("arXiv:2611.00421");
</script>

<template>
  <DocPage lead="下拉单选：从收起的候选列表中择一。触发器遵循控件面规范，展开面板为霜面浮层（mw-frost），选中项右侧带勾号。">
    <DocSection title="示例">
      <CodeBlock
        v-for="ex in api.examples"
        :key="ex.title"
        :code="ex.code"
        :title="ex.title"
      />
    </DocSection>
    <DocSection title="何时使用">
      <ul class="doc-rules">
        <li data-kind="do">候选项在 5 个以上，或表单空间不足以平铺展示。</li>
        <li data-kind="do">开启 <code>filter</code> 在弹出面板顶部提供筛选框；开启 <code>editable</code> 允许既可选预设又可手填。</li>
        <li data-kind="do">触发器宽度按最宽候选锁定（封顶 <code>--mw-select-fit-max</code>，默认 24rem），切换选择不漂移；覆写 <code>--mw-select-fit-text</code> 可关闭，或用 <code>fluid</code> 撑满容器。</li>
        <li data-kind="dont">若核心交互是「聚焦直接在框内打字过滤」，用更紧凑的 <code>SearchableSelect</code>。</li>
        <li data-kind="dont">仅 2–4 个短选项且用于视图/范围切换时，用 <code>SelectButton</code>。</li>
      </ul>
    </DocSection>

    <DocSection title="底面" desc="纸面与霜面并排。触发器在霜面上为半透明控件面，弹出列表始终挂在 body 的霜面浮层上。">
      <Specimen :surfaces="['paper', 'frost']">
        <Select
          v-model="sourceType"
          :options="sourceTypes"
          option-label="label"
          option-value="value"
          option-disabled="disabled"
          placeholder="选择文献类型"
          aria-label="文献类型"
        />
        <Select
          v-model="journal"
          :options="journals"
          option-label="label"
          option-value="value"
          filter
          show-clear
          filter-placeholder="筛选期刊名称…"
          placeholder="选择目标期刊"
          aria-label="目标期刊"
        />
      </Specimen>
    </DocSection>

    <DocSection title="变体" desc="支持面板内搜索（filter）、一键清空（showClear）、自由编辑（editable）与自定义选项插槽（#option）。">
      <Specimen themes="single">
        <Select
          v-model="journal"
          :options="journals"
          option-label="label"
          option-value="value"
          filter
          show-clear
          placeholder="自定义选项插槽"
          aria-label="带 ISSN 的期刊选择"
        >
          <template #option="{ option }">
            <span class="doc-row" style="justify-content: space-between; width: 100%; gap: var(--space-4)">
              <span>{{ option.label }}</span>
              <span class="doc-note">{{ option.issn }}</span>
            </span>
          </template>
        </Select>
        <Select
          v-model="customVenue"
          :options="journals"
          option-label="label"
          option-value="label"
          editable
          placeholder="可选择或直接输入发表来源"
          aria-label="可编辑来源"
        />
      </Specimen>
    </DocSection>

    <DocSection title="尺寸" desc="xs / sm / md / lg 四档，不传则跟随外层密度上下文。">
      <Specimen themes="single" layout="stack">
        <div v-for="s in (['xs', 'sm', 'md', 'lg'] as const)" :key="s" class="doc-row">
          <span class="doc-note" style="width: 24px">{{ s }}</span>
          <Select
            v-model="sourceType"
            :size="s"
            :options="sourceTypes"
            option-label="label"
            option-value="value"
            :aria-label="`${s} 档下拉选择`"
          />
        </div>
      </Specimen>
    </DocSection>

    <DocSection title="状态" desc="方向键上下导航、Enter 确认、Esc 关闭并归还焦点。">
      <Specimen themes="both">
        <StateGrid :columns="['未选占位', '已选可清', '加载中', '只读', '禁用', '错误']" label-width="48px">
          <StateRow label="md">
            <Select :model-value="null" :options="sourceTypes" option-label="label" option-value="value" placeholder="请选择…" aria-label="未选占位" />
            <Select v-model="sourceType" :options="sourceTypes" option-label="label" option-value="value" show-clear aria-label="已选可清" />
            <Select :model-value="null" :options="sourceTypes" option-label="label" option-value="value" loading placeholder="加载中…" aria-label="加载中" />
            <Select v-model="sourceType" :options="sourceTypes" option-label="label" option-value="value" readonly aria-label="只读" />
            <Select v-model="sourceType" :options="sourceTypes" option-label="label" option-value="value" disabled aria-label="禁用" />
            <Select :model-value="null" :options="sourceTypes" option-label="label" option-value="value" invalid placeholder="必选项" aria-label="错误" />
          </StateRow>
        </StateGrid>
      </Specimen>
    </DocSection>

    <DocSection title="接口">
      <ApiTable :api="api" />
    </DocSection>
  </DocPage>
</template>
