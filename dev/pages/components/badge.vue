<script setup lang="ts">
import { Badge } from "../../../src";
import { api } from "../../api/entries/badge";
import ApiTable from "../../kit/ApiTable.vue";
import DocPage from "../../kit/DocPage.vue";
import DocSection from "../../kit/DocSection.vue";
import Specimen from "../../kit/Specimen.vue";
import StateGrid from "../../kit/StateGrid.vue";
import StateRow from "../../kit/StateRow.vue";

const severities = [
  { label: "主色 primary", value: "primary" },
  { label: "次要 secondary", value: "secondary" },
  { label: "成功 success", value: "success" },
  { label: "信息 info", value: "info" },
  { label: "警告 warning", value: "warning" },
  { label: "危险 danger", value: "danger" },
  { label: "反色 contrast", value: "contrast" },
] as const;

const sizes = ["xs", "sm", "md", "lg"] as const;
</script>

<template>
  <DocPage lead="紧凑计数与状态圆点：用于未读数、待处理提案数或轻量状态指示，字偶距固定为等宽数字（tabular-nums）。">
    <DocSection title="何时使用">
      <ul class="doc-rules">
        <li data-kind="do">展示简洁的数字计数（如未读批注数、待确认引用数）或无文本的状态圆点。</li>
        <li data-kind="do">不传 <code>value</code> 且无默认插槽时自动退化为 8px 状态圆点（<code>.mw-badge--dot</code>）。</li>
        <li data-kind="dont">承载词组或分类名称时请用 <code>Tag</code>；需要用户点击移除时请用 <code>Chip</code>。</li>
        <li data-kind="dont">不在同一导航项旁堆叠多个高饱和度徽标，避免视觉噪音。</li>
      </ul>
    </DocSection>

    <DocSection title="底面" desc="纸面与霜面并排。主色、危险色与反色使用实心底以确保醒目，其余语义色采用柔和着色底。">
      <Specimen :surfaces="['paper', 'frost']" layout="stack">
        <div class="doc-row">
          <Badge v-for="s in severities" :key="s.value" :severity="s.value" :value="12" />
        </div>
        <div class="doc-row">
          <span v-for="s in severities" :key="`dot-${s.value}`" class="doc-row" style="gap: 6px">
            <Badge :severity="s.value" />
            <span class="doc-note">{{ s.label.split(" ")[0] }}</span>
          </span>
        </div>
      </Specimen>
    </DocSection>

    <DocSection title="尺寸" desc="xs / sm / md / lg 四档，默认跟随密度上下文。圆点模式尺寸恒定为 8px。">
      <Specimen themes="single" layout="stack">
        <div v-for="s in sizes" :key="s" class="doc-row">
          <span class="doc-note" style="width: 24px">{{ s }}</span>
          <Badge :size="s" :value="3" />
          <Badge :size="s" severity="secondary" :value="42" />
          <Badge :size="s" severity="danger" value="99+" />
          <Badge :size="s" severity="success" value="NEW" />
        </div>
      </Specimen>
    </DocSection>

    <DocSection title="状态" desc="各语义色在单位数、多位数、插槽文本与圆点形态下的对比。">
      <Specimen themes="both">
        <StateGrid :columns="['单位数', '多位数', '文本插槽', '圆点指示']" label-width="88px">
          <StateRow v-for="s in severities" :key="s.value" :label="s.label.split(' ')[0]">
            <Badge :severity="s.value" :value="6" />
            <Badge :severity="s.value" value="128" />
            <Badge :severity="s.value">v2</Badge>
            <Badge :severity="s.value" />
          </StateRow>
        </StateGrid>
      </Specimen>
    </DocSection>

    <DocSection title="接口">
      <ApiTable :api="api" />
    </DocSection>
  </DocPage>
</template>
