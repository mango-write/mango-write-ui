<script setup lang="ts">
import { ref } from "vue";
import { ToggleSwitch } from "../../../src";
import { api } from "../../api/entries/toggle-switch";
import ApiTable from "../../kit/ApiTable.vue";
import CodeBlock from "../../kit/CodeBlock.vue";
import DocPage from "../../kit/DocPage.vue";
import DocSection from "../../kit/DocSection.vue";
import Specimen from "../../kit/Specimen.vue";
import StateGrid from "../../kit/StateGrid.vue";
import StateRow from "../../kit/StateRow.vue";

const autoCite = ref(true);
const trackChanges = ref(false);
const fullAccess = ref(true);
</script>

<template>
  <DocPage lead="拨动开关：切换即刻生效的二元状态。滑块始终是带抬起阴影的实体圆片，轨道在关闭态用 --fill-strong、开启态用品牌色。">
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
        <li data-kind="do">切换立即生效的偏好或模式：「开启修订留痕」「实时校对引用」「深色模式」。</li>
        <li data-kind="do">常置于设置行右侧，左侧配清晰的标题与一行辅助说明。</li>
        <li data-kind="dont">需要点击底部「保存 / 提交」按钮才生效的表单字段用 <code>Checkbox</code>。</li>
        <li data-kind="dont">不在开关文案中写否定句（如「关闭自动同步」），避免开闭语义反转。</li>
      </ul>
    </DocSection>

    <DocSection title="底面" desc="纸面与霜面并排。滑块（Thumb）使用 --bg-raised 实体底与 --shadow-raised，不随霜面变透明。">
      <Specimen :surfaces="['paper', 'frost']" layout="stack">
        <label class="doc-row" style="justify-content: space-between; cursor: pointer">
          <span>粘贴 DOI 时自动解析题录</span>
          <ToggleSwitch v-model="autoCite" aria-label="粘贴 DOI 时自动解析题录" />
        </label>
        <label class="doc-row" style="justify-content: space-between; cursor: pointer">
          <span>审阅模式（记录所有正文增删）</span>
          <ToggleSwitch v-model="trackChanges" aria-label="审阅模式" />
        </label>
      </Specimen>
    </DocSection>

    <DocSection title="变体与组合" desc="典型设置卡片行：左侧标题与说明，右侧开关对齐。">
      <Specimen :surfaces="['raised']" themes="single" layout="stack">
        <div class="doc-row" style="justify-content: space-between">
          <div>
            <div style="font-weight: var(--weight-medium)">AI 提案自动落盘</div>
            <div class="doc-note">允许助手在生成恢复点后直接写入草稿正文</div>
          </div>
          <ToggleSwitch v-model="fullAccess" aria-label="AI 提案自动落盘" />
        </div>
      </Specimen>
    </DocSection>

    <DocSection title="状态" desc="支持空格与回车切换；只读与禁用态在捕获阶段拦截指针与键盘事件。">
      <Specimen themes="both">
        <StateGrid :columns="['关闭', '开启', '只读', '关闭禁用', '开启禁用', '错误']" label-width="64px">
          <StateRow label="默认">
            <ToggleSwitch :model-value="false" aria-label="关闭" />
            <ToggleSwitch :model-value="true" aria-label="开启" />
            <ToggleSwitch :model-value="true" readonly aria-label="只读" />
            <ToggleSwitch :model-value="false" disabled aria-label="关闭禁用" />
            <ToggleSwitch :model-value="true" disabled aria-label="开启禁用" />
            <ToggleSwitch :model-value="false" invalid aria-label="错误" />
          </StateRow>
        </StateGrid>
      </Specimen>
    </DocSection>

    <DocSection title="接口">
      <ApiTable :api="api" />
    </DocSection>
  </DocPage>
</template>
