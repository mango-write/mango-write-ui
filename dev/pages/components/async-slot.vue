<script setup lang="ts">
import { ref } from "vue";
import { AsyncSlot, Button, SelectButton } from "../../../src";
import { api } from "../../api/entries/async-slot";
import ApiTable from "../../kit/ApiTable.vue";
import DocPage from "../../kit/DocPage.vue";
import DocSection from "../../kit/DocSection.vue";
import Specimen from "../../kit/Specimen.vue";

type Status = "loading" | "empty" | "error" | "ready";
const status = ref<Status>("ready");
const statusOptions = [
  { label: "就绪 (ready)", value: "ready" },
  { label: "加载中 (loading)", value: "loading" },
  { label: "空态 (empty)", value: "empty" },
  { label: "错误 (error)", value: "error" },
];
</script>

<template>
  <DocPage lead="四态异步容器：把「加载骨架 / 空态邀请 / 错误重试 / 真实内容」四态切换与 L3 交叉淡入收敛为一个组件。">
    <DocSection title="何时使用">
      <ul class="doc-rules">
        <li data-kind="do">所有依赖接口数据的列表、卡片组与详情区一律包裹 <code>AsyncSlot</code>。</li>
        <li data-kind="do">空态必须给 <code>emptyTitle</code> 或 <code>#empty</code>，引导用户完成下一步动作。</li>
        <li data-kind="dont">不要在业务页面手写 <code>v-if="loading" ... v-else-if="error"</code> 裸切。</li>
      </ul>
    </DocSection>

    <DocSection title="交互切换与底面" desc="点击分段控件切换四态，观察 180ms 区域级交叉淡入与纸/霜双面表现。">
      <div class="doc-row" style="margin-bottom: var(--space-3)">
        <SelectButton
          v-model="status"
          :options="statusOptions"
          option-label="label"
          option-value="value"
          :allow-empty="false"
          size="sm"
          aria-label="切换异步状态"
        />
      </div>
      <Specimen :surfaces="['paper', 'frost']" layout="stack">
        <AsyncSlot
          :status="status"
          skeleton="list"
          empty-title="common.async.empty"
          @retry="status = 'ready'"
        >
          <template #empty>
            <div style="text-align: center; padding: var(--space-3)">
              <p style="margin: 0 0 var(--space-2); font-weight: var(--weight-semibold)">尚无文库条目</p>
              <p class="doc-note" style="margin: 0 0 var(--space-3)">拖入 PDF 或从浏览器插件一键采集文献。</p>
              <Button size="sm" @click="status = 'ready'">载入示例文献</Button>
            </div>
          </template>
          <div style="display: flex; flex-direction: column; gap: var(--space-2)">
            <div style="padding: var(--space-2-5); border-radius: var(--radius-md); background: var(--fill-subtle)">
              <strong>Attention Is All You Need</strong>
              <p class="doc-note" style="margin: var(--space-1) 0 0">Vaswani et al. · NeurIPS 2017 · 已解析全文锚点</p>
            </div>
            <div style="padding: var(--space-2-5); border-radius: var(--radius-md); background: var(--fill-subtle)">
              <strong>Deep Residual Learning for Image Recognition</strong>
              <p class="doc-note" style="margin: var(--space-1) 0 0">He et al. · CVPR 2016 · 14 条阅读批注</p>
            </div>
          </div>
        </AsyncSlot>
      </Specimen>
    </DocSection>

    <DocSection title="骨架形态（list / card / text）" desc="加载态骨架形状应与真实内容保持一致。">
      <Specimen themes="both" layout="stack">
        <AsyncSlot status="loading" skeleton="card" />
        <AsyncSlot status="loading" skeleton="text" />
      </Specimen>
    </DocSection>

    <DocSection title="接口">
      <ApiTable :api="api" />
    </DocSection>
  </DocPage>
</template>
