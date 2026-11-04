<script setup lang="ts">
import { AlignLeft, Columns2, LayoutList } from "lucide-vue-next";
import { ref } from "vue";
import { SelectButton } from "../../../src";
import DocPage from "../../kit/DocPage.vue";
import DocSection from "../../kit/DocSection.vue";
import Specimen from "../../kit/Specimen.vue";
import StateGrid from "../../kit/StateGrid.vue";
import StateRow from "../../kit/StateRow.vue";

const scope = ref("mine");
const scopes = [
  { label: "我的", value: "mine" },
  { label: "团队", value: "team" },
  { label: "全部", value: "all" },
];
const view = ref("list");
const views = [
  { label: "列表", value: "list", icon: LayoutList },
  { label: "对照", value: "split", icon: Columns2 },
  { label: "正文", value: "prose", icon: AlignLeft },
];
const marks = ref<string[]>(["note"]);
const markOptions = [
  { label: "批注", value: "note" },
  { label: "划线", value: "highlight" },
  { label: "引用", value: "cite" },
];
const withDisabled = [
  { label: "草稿", value: "draft" },
  { label: "已发布", value: "published" },
  { label: "归档", value: "archived", disabled: true },
];
const status = ref("draft");
</script>

<template>
  <DocPage lead="分段控件：在 2–5 个互斥选项间切换视图或筛选范围。轨道是半透明填充，选中段抬起为控件面并带一层抬起阴影。">
    <DocSection title="何时使用">
      <ul class="doc-rules">
        <li data-kind="do">切换同一内容的视图或范围：「我的 / 团队 / 全部」「列表 / 对照」。</li>
        <li data-kind="do">选项少且短，全部同时可见；可多选（<code>multiple</code>）做轻量筛选。</li>
        <li data-kind="dont">切换的是不同页面内容时用 <code>Tabs</code>；选项多于 5 个用 <code>Select</code>。</li>
        <li data-kind="dont">不用它触发动作；它只表达「当前选中什么」。</li>
      </ul>
    </DocSection>

    <DocSection title="底面" desc="纸面与霜面并排。深色下选中段改用 --fill-strong，避免近乎透明。">
      <Specimen :surfaces="['paper', 'frost']" layout="stack">
        <SelectButton v-model="scope" :options="scopes" option-label="label" option-value="value" aria-label="文库范围" :allow-empty="false" />
        <SelectButton v-model="view" :options="views" option-label="label" option-value="value" aria-label="阅读视图" :allow-empty="false">
          <template #option="{ option }">
            <component :is="option.icon" />
            <span>{{ option.label }}</span>
          </template>
        </SelectButton>
      </Specimen>
    </DocSection>

    <DocSection title="尺寸" desc="xs / sm / md / lg，默认跟随密度上下文。轨道圆角 --control-radius，段圆角 = 轨道圆角 − 轨道内边距（同心）。">
      <Specimen themes="single" layout="stack">
        <div v-for="s in (['xs', 'sm', 'md', 'lg'] as const)" :key="s" class="doc-row">
          <span class="doc-note" style="width: 24px">{{ s }}</span>
          <SelectButton v-model="scope" :size="s" :options="scopes" option-label="label" option-value="value" :aria-label="`${s} 档范围`" />
        </div>
      </Specimen>
    </DocSection>

    <DocSection title="状态" desc="方向键在段之间移动焦点；焦点为品牌色外环。">
      <Specimen themes="both">
        <StateGrid :columns="['默认', '多选', '单项禁用', '整组禁用', '错误']" label-width="40px">
          <StateRow label="md">
            <SelectButton v-model="scope" :options="scopes" option-label="label" option-value="value" aria-label="默认" />
            <SelectButton v-model="marks" multiple :options="markOptions" option-label="label" option-value="value" aria-label="多选" />
            <SelectButton v-model="status" :options="withDisabled" option-label="label" option-value="value" aria-label="单项禁用" />
            <SelectButton v-model="scope" :options="scopes" option-label="label" option-value="value" disabled aria-label="整组禁用" />
            <SelectButton :model-value="null" :options="scopes" option-label="label" option-value="value" invalid aria-label="错误" />
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
          <tr><td><code>options</code> / <code>optionLabel</code> / <code>optionValue</code> / <code>optionDisabled</code></td><td>—</td><td>选项与取值方式</td></tr>
          <tr><td><code>multiple</code></td><td><code>boolean</code></td><td>多选时 v-model 为数组</td></tr>
          <tr><td><code>allowEmpty</code></td><td><code>boolean</code></td><td>再次点击选中段是否取消选择；视图切换应设为 false</td></tr>
          <tr><td><code>size</code></td><td><code>xs · sm · md · lg</code></td><td>不传则跟随密度上下文</td></tr>
          <tr><td><code>#option</code></td><td><code>{ option, index }</code></td><td>自定义段内容；图标取 <code>--control-icon</code></td></tr>
        </tbody>
      </table>
    </DocSection>
  </DocPage>
</template>
