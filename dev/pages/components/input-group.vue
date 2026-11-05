<script setup lang="ts">
import { Copy, Link } from "lucide-vue-next";
import { Button, InputGroup, InputGroupAddon, InputNumber, InputText } from "../../../src";
import { api } from "../../api/entries/input-group";
import ApiTable from "../../kit/ApiTable.vue";
import DocPage from "../../kit/DocPage.vue";
import DocSection from "../../kit/DocSection.vue";
import Specimen from "../../kit/Specimen.vue";
import StateGrid from "../../kit/StateGrid.vue";
import StateRow from "../../kit/StateRow.vue";
</script>

<template>
  <DocPage lead="把输入框与前后缀、按钮拼成一个整体：DOI 前缀、单位、复制链接。各段共享同一控件面与 --control-h，附加段底色为 --fill-subtle。">
    <DocSection title="何时使用">
      <ul class="doc-rules">
        <li data-kind="do">固定前后缀帮助理解输入：<code>https://doi.org/</code>、<code>字</code>、<code>%</code>。</li>
        <li data-kind="do">与输入强相关的单个动作贴在末尾：复制、生成、检索。</li>
        <li data-kind="dont">不要拼超过一个按钮；多个动作放到字段外。</li>
        <li data-kind="dont">纯装饰图标用 <code>IconField</code>，不要占一整个附加段。</li>
      </ul>
    </DocSection>

    <DocSection title="组合" desc="纸面与霜面并排；附加段是半透明填充，霜面上不出现实色块。">
      <Specimen :surfaces="['paper', 'frost']" layout="stack">
        <InputGroup>
          <InputGroupAddon>https://doi.org/</InputGroupAddon>
          <InputText placeholder="10.1038/s41586-024-07000-0" />
        </InputGroup>
        <InputGroup>
          <InputGroupAddon><Link /></InputGroupAddon>
          <InputText model-value="https://mangowrite.com/s/a8f2c" readonly />
          <Button severity="secondary" label="复制" :icon="Copy" />
        </InputGroup>
        <InputGroup style="width: 220px">
          <InputNumber :model-value="3000" :use-grouping="false" />
          <InputGroupAddon>字</InputGroupAddon>
        </InputGroup>
      </Specimen>
    </DocSection>

    <DocSection title="密度" desc="InputGroup 读容器的 --control-*：把 .mw-size-* 挂在组上，附加段、输入框与按钮一起换档。">
      <Specimen themes="single" layout="stack">
        <div v-for="s in (['xs', 'sm', 'md', 'lg'] as const)" :key="s" class="doc-row">
          <span class="doc-note" style="width: 24px">{{ s }}</span>
          <InputGroup :class="`mw-size-${s}`" style="width: 360px">
            <InputGroupAddon>@</InputGroupAddon>
            <InputText placeholder="团队成员邮箱" />
            <Button severity="secondary" label="邀请" />
          </InputGroup>
        </div>
      </Specimen>
    </DocSection>

    <DocSection title="状态" desc="聚焦或错误时，输入段抬到最上层，焦点晕与红色边框不会被相邻段遮住。">
      <Specimen themes="both">
        <StateGrid :columns="['默认', '禁用', '只读', '错误']" label-width="48px">
          <StateRow label="前缀">
            <InputGroup style="width: 200px"><InputGroupAddon>DOI</InputGroupAddon><InputText placeholder="10.xxxx/…" /></InputGroup>
            <InputGroup style="width: 200px"><InputGroupAddon>DOI</InputGroupAddon><InputText model-value="10.1000/182" disabled /></InputGroup>
            <InputGroup style="width: 200px"><InputGroupAddon>DOI</InputGroupAddon><InputText model-value="10.1000/182" readonly /></InputGroup>
            <InputGroup style="width: 200px"><InputGroupAddon>DOI</InputGroupAddon><InputText model-value="10.1000" invalid /></InputGroup>
          </StateRow>
        </StateGrid>
      </Specimen>
    </DocSection>

    <DocSection title="接口">
      <ApiTable :api="api" />
    </DocSection>
  </DocPage>
</template>
