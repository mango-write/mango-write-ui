<script setup lang="ts">
import { ArrowRight, Download, Filter, Plus, Settings, Sparkles, Trash2 } from "lucide-vue-next";
import { Button } from "../../../src";
import { api } from "../../api/entries/button";
import ApiTable from "../../kit/ApiTable.vue";
import CodeBlock from "../../kit/CodeBlock.vue";
import DocPage from "../../kit/DocPage.vue";
import DocSection from "../../kit/DocSection.vue";
import Specimen from "../../kit/Specimen.vue";
import StateGrid from "../../kit/StateGrid.vue";
import StateRow from "../../kit/StateRow.vue";

const variants = [
  { label: "主操作 primary", props: { severity: "primary" } },
  { label: "次操作 secondary", props: { severity: "secondary" } },
  { label: "着色 tinted", props: { variant: "tinted", severity: "primary" } },
  { label: "描边 outlined", props: { variant: "outlined", severity: "secondary" } },
  { label: "幽灵 text", props: { variant: "text", severity: "secondary" } },
  { label: "危险 danger", props: { severity: "danger" } },
  { label: "危险着色", props: { variant: "tinted", severity: "danger" } },
  { label: "反色 contrast", props: { severity: "contrast" } },
] as const;
</script>

<template>
  <DocPage lead="触发一个动作。按钮的视觉重量表达动作的重要性：一个区块只有一个实心主按钮，其余逐级降权。">
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
        <li data-kind="do"><strong>主操作</strong>（primary）：本区块唯一最重要的动作，例如「保存修改」「导入」。</li>
        <li data-kind="do"><strong>次操作</strong>（secondary）：与主操作并列的常规动作，例如「取消」「预览」。</li>
        <li data-kind="do"><strong>着色</strong>（tinted）：页面级的重要但非唯一动作，或需要品牌提示又不能抢主操作时。</li>
        <li data-kind="do"><strong>幽灵</strong>（text）：工具条、行内与低频动作；icon-only 默认用它。</li>
        <li data-kind="dont">不在同一区块放两个实心主按钮；不用按钮做导航（用链接）。</li>
        <li data-kind="dont">状态色（success / info / warning）不承担动作，作为按钮时自动退为着色样式。</li>
      </ul>
    </DocSection>

    <DocSection title="变体" desc="纸面与霜面、浅色与深色并排。霜面上的按钮不铺实色底，次操作是半透明控件面。">
      <Specimen :surfaces="['paper', 'frost']">
        <Button v-for="v in variants" :key="v.label" v-bind="v.props" :label="v.label.split(' ')[0]" />
        <Button variant="link" label="链接按钮" />
      </Specimen>
    </DocSection>

    <DocSection
      title="胶囊按钮（Capsule / Rounded）"
      desc="rounded 属性将圆角切为 --radius-full，文字按钮横向内距自动放宽 1.25× 补偿半圆弧收窄，icon-only 则为正圆。常用于悬浮操作条、筛选胶囊、AI 快捷指令与营销 CTA。"
    >
      <Specimen :surfaces="['paper', 'frost']" layout="stack">
        <div class="doc-row">
          <Button rounded label="开始写作" :icon="Sparkles" />
          <Button rounded severity="secondary" label="筛选条件" :icon="Filter" />
          <Button rounded variant="tinted" label="AI 润色" :icon="Sparkles" />
          <Button rounded variant="outlined" severity="secondary" label="导出 PDF" :icon="Download" />
          <Button rounded variant="text" severity="secondary" label="收起" />
          <Button rounded severity="secondary" :icon="Plus" aria-label="新建" />
          <Button rounded variant="tinted" :icon="Sparkles" aria-label="AI 助手" />
        </div>
        <div class="doc-row">
          <Button v-for="s in (['xs', 'sm', 'md', 'lg'] as const)" :key="s" rounded :size="s" :label="`胶囊 ${s}`" />
          <Button
            v-for="s in (['xs', 'sm', 'md', 'lg'] as const)"
            :key="`icon-${s}`"
            rounded
            :size="s"
            severity="secondary"
            :icon="Plus"
            :aria-label="`新建 ${s}`"
          />
        </div>
      </Specimen>
    </DocSection>

    <DocSection title="尺寸" desc="xs / sm / md / lg 四档，默认 md。高度、字号、图标、内距与圆角由同一档位派生；图标约为高度的一半。">
      <Specimen themes="single" layout="stack">
        <div v-for="s in (['xs', 'sm', 'md', 'lg'] as const)" :key="s" class="doc-row">
          <span class="doc-note" style="width: 24px">{{ s }}</span>
          <Button :size="s" label="保存修改" />
          <Button :size="s" severity="secondary" label="导出" :icon="Download" />
          <Button :size="s" variant="tinted" label="新建" :icon="Plus" />
          <Button :size="s" variant="text" severity="secondary" :icon="Sparkles" aria-label="AI" />
          <Button :size="s" severity="secondary" :icon="Settings" aria-label="设置" />
        </div>
      </Specimen>
    </DocSection>

    <DocSection
      title="密度上下文"
      desc="不传 size 的按钮跟随容器：在容器上挂 .mw-size-sm 即整组切档，组件本身不改。工具条角色 .mw-toolbar 让控件去底只留发丝边。"
    >
      <Specimen themes="single" layout="stack">
        <div class="doc-row mw-size-sm">
          <span class="doc-note">.mw-size-sm</span>
          <Button label="应用" />
          <Button severity="secondary" label="重置" />
          <Button variant="text" severity="secondary" :icon="Trash2" aria-label="删除" />
        </div>
        <div class="doc-row">
          <span class="doc-note">默认 md</span>
          <Button label="应用" />
          <Button severity="secondary" label="重置" />
          <Button variant="text" severity="secondary" :icon="Trash2" aria-label="删除" />
        </div>
      </Specimen>
    </DocSection>

    <DocSection title="状态" desc="hover / 按下 / 焦点请直接用指针与 Tab 键体验；焦点为 2px 品牌色外环。">
      <Specimen themes="both">
        <StateGrid :columns="['默认', '禁用', '加载', '徽标']" label-width="88px">
          <StateRow v-for="v in variants.slice(0, 6)" :key="v.label" :label="v.label.split(' ')[0]">
            <Button v-bind="v.props" label="按钮" />
            <Button v-bind="v.props" label="按钮" disabled />
            <Button v-bind="v.props" label="按钮" loading />
            <Button v-bind="v.props" label="消息" :badge="3" />
          </StateRow>
        </StateGrid>
      </Specimen>
    </DocSection>

    <DocSection title="图标" desc="统一使用 Lucide 图标组件，尺寸与描边由 --control-icon 与 --icon-stroke 自动锁定；图标可在左或右。">
      <Specimen themes="single">
        <Button severity="secondary" label="前置图标" :icon="Plus" />
        <Button severity="secondary" label="AI 生成" :icon="Sparkles" />
        <Button severity="secondary" label="下一步" :icon="ArrowRight" icon-pos="right" />
        <Button severity="secondary" label="圆角筛选" :icon="Filter" rounded />
      </Specimen>
    </DocSection>

    <DocSection title="组合">
      <Specimen :surfaces="['raised']" themes="single" layout="stack">
        <div class="doc-row" style="justify-content: flex-end">
          <Button variant="text" severity="secondary" label="取消" />
          <Button label="保存修改" />
        </div>
        <div class="doc-row" style="justify-content: space-between">
          <Button variant="tinted" severity="danger" label="删除草稿" :icon="Trash2" />
          <div class="doc-row">
            <Button severity="secondary" label="预览" />
            <Button label="发布" />
          </div>
        </div>
      </Specimen>
    </DocSection>

    <DocSection title="接口">
      <ApiTable :api="api" />
    </DocSection>
  </DocPage>
</template>
