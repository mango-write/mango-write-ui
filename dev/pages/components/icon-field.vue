<script setup lang="ts">
import { AtSign, Loader2, Search, X } from "lucide-vue-next";
import { IconField, InputIcon, InputText } from "../../../src";
import { api } from "../../api/entries/icon-field";
import ApiTable from "../../kit/ApiTable.vue";
import DocPage from "../../kit/DocPage.vue";
import DocSection from "../../kit/DocSection.vue";
import Specimen from "../../kit/Specimen.vue";
import StateGrid from "../../kit/StateGrid.vue";
import StateRow from "../../kit/StateRow.vue";
</script>

<template>
  <DocPage lead="在输入框内放一个提示图标：搜索、提及、加载中。图标取 --control-icon、颜色 --text-tertiary，输入框内距自动让位。">
    <DocSection title="何时使用">
      <ul class="doc-rules">
        <li data-kind="do">图标说明输入的性质（搜索、@ 提及），或表达异步状态（检索中）。</li>
        <li data-kind="do">左右各放一个：左侧说明，右侧状态。</li>
        <li data-kind="dont">图标本身不可点击（<code>pointer-events: none</code>）；需要可点的清除 / 提交按钮时用 <code>InputGroup</code> 拼按钮。</li>
        <li data-kind="dont">不要用图标代替文字标签。</li>
      </ul>
    </DocSection>

    <DocSection title="底面" desc="纸面与霜面并排；检索框常放在弹出层顶部。">
      <Specimen :surfaces="['paper', 'frost']" layout="stack">
        <IconField>
          <InputIcon><Search /></InputIcon>
          <InputText placeholder="搜索文献库：标题、作者、DOI" fluid />
        </IconField>
        <IconField>
          <InputIcon><AtSign /></InputIcon>
          <InputText placeholder="提及团队成员" fluid />
          <InputIcon><Loader2 class="doc-spin" /></InputIcon>
        </IconField>
      </Specimen>
    </DocSection>

    <DocSection title="密度" desc="IconField 读容器的 --control-*：把 .mw-size-* 挂在 IconField 或它的容器上，图标与内距一起换档（不要只给内部 InputText 传 size）。">
      <Specimen themes="single" layout="stack">
        <div v-for="s in (['xs', 'sm', 'md', 'lg'] as const)" :key="s" class="doc-row">
          <span class="doc-note" style="width: 24px">{{ s }}</span>
          <IconField :class="`mw-size-${s}`" style="width: 280px">
            <InputIcon><Search /></InputIcon>
            <InputText placeholder="检索草稿" fluid />
          </IconField>
        </div>
      </Specimen>
    </DocSection>

    <DocSection title="状态">
      <Specimen themes="both">
        <StateGrid :columns="['空', '有值', '禁用', '只读', '错误']" label-width="48px">
          <StateRow label="左图标">
            <IconField style="width: 168px"><InputIcon><Search /></InputIcon><InputText placeholder="搜索" fluid /></IconField>
            <IconField style="width: 168px"><InputIcon><Search /></InputIcon><InputText model-value="transformer" fluid /></IconField>
            <IconField style="width: 168px"><InputIcon><Search /></InputIcon><InputText model-value="transformer" disabled fluid /></IconField>
            <IconField style="width: 168px"><InputIcon><Search /></InputIcon><InputText model-value="transformer" readonly fluid /></IconField>
            <IconField style="width: 168px"><InputIcon><Search /></InputIcon><InputText model-value="??" invalid fluid /></IconField>
          </StateRow>
          <StateRow label="右图标">
            <IconField style="width: 168px"><InputText placeholder="成员" fluid /><InputIcon><X /></InputIcon></IconField>
            <IconField style="width: 168px"><InputText model-value="李明" fluid /><InputIcon><X /></InputIcon></IconField>
            <IconField style="width: 168px"><InputText model-value="李明" disabled fluid /><InputIcon><X /></InputIcon></IconField>
            <IconField style="width: 168px"><InputText model-value="李明" readonly fluid /><InputIcon><X /></InputIcon></IconField>
            <IconField style="width: 168px"><InputText model-value="未知成员" invalid fluid /><InputIcon><X /></InputIcon></IconField>
          </StateRow>
        </StateGrid>
      </Specimen>
    </DocSection>

    <DocSection title="接口">
      <ApiTable :api="api" />
    </DocSection>
  </DocPage>
</template>

<style scoped>
.doc-spin {
  animation: doc-spin 1s linear infinite;
}

@keyframes doc-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
