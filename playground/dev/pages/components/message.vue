<script setup lang="ts">
import { CheckCircle2, Info, ShieldAlert, Sparkles, TriangleAlert } from "lucide-vue-next";
import { ref } from "vue";
import { Button, Message } from "@mango-write/ui-vue";
import { api } from "../../api/entries/message";
import ApiTable from "../../kit/ApiTable.vue";
import DocPage from "../../kit/DocPage.vue";
import DocSection from "../../kit/DocSection.vue";
import Specimen from "../../kit/Specimen.vue";
import StateGrid from "../../kit/StateGrid.vue";
import StateRow from "../../kit/StateRow.vue";
import UsagePlayground from "../../kit/UsagePlayground.vue";
import { t } from "../../i18n";
import { usage } from "../../usage/entries/message";

const severities = [
  { label: { zh: "信息", en: "Info" }, value: "info", text: { zh: "正在后台同步文献元数据，解析完成后将自动更新引用锚点。", en: "Syncing reference metadata in the background; citation anchors update automatically when parsing finishes." } },
  { label: { zh: "成功", en: "Success" }, value: "success", text: { zh: "全文 PDF 解析完成，已提取 18 条图表与 42 处参考文献。", en: "Full-text PDF parsed; 18 figures and 42 references extracted." } },
  { label: { zh: "警告", en: "Warning" }, value: "warning", text: { zh: "检测到 2 处引用未关联文库条目，导出前请核对来源。", en: "2 references are not linked to library entries; verify the sources before exporting." } },
  { label: { zh: "错误", en: "Error" }, value: "error", text: { zh: "DOI 解析服务连接超时，请检查网络或手动填写题录信息。", en: "The DOI resolver timed out; check the network or fill in the record manually." } },
  { label: { zh: "次要", en: "Secondary" }, value: "secondary", text: { zh: "当前工作区处于只读历史快照视图，修改不会写回正文。", en: "This workspace is a read-only historical snapshot; edits will not write back to the body." } },
  { label: { zh: "反色", en: "Contrast" }, value: "contrast", text: { zh: "快捷键提示：按 ⌘K 可随时唤起全局文献与指令检索。", en: "Shortcut: press ⌘K to open global reference and command search anytime." } },
] as const;

const resetKey = ref(0);

const s = {
  demo: { zh: "在线演示", en: "Live demo" },
  demoDesc: {
    zh: "调整配置即时预览；查看生成代码，一键复制到项目。",
    en: "Tweak the options for a live preview; view the generated code and copy it into your project.",
  },
  whenToUse: { zh: "何时使用", en: "When to use" },
  rule1: {
    zh: "在区块顶部或表单区域内展示与上下文紧密相关的提示、警告或阻断性错误说明。",
    en: "Contextual notices, warnings, or blocking error explanations at the top of a block or inside a form area.",
  },
  rule2: {
    zh: "需要用户读完后收起非阻断提示时开启 <code>closable</code>。",
    en: "Turn on <code>closable</code> when users should dismiss a non-blocking notice after reading.",
  },
  rule3: {
    zh: "操作完成后的短暂轻提示请用 <code>useNotify()</code>（Toast），不要在页面里闪现再消失一段 <code>Message</code>。",
    en: "For brief post-action toasts use <code>useNotify()</code> (Toast); don't flash a <code>Message</code> in the page and make it vanish.",
  },
  rule4: {
    zh: "单个字段的校验报错直接挂在 <code>FormField</code> 的 <code>error</code> 属性上，不单独放一整条 <code>Message</code>。",
    en: "A single field's validation error belongs on <code>FormField</code>'s <code>error</code> prop, not in a standalone <code>Message</code>.",
  },
  baseTitle: { zh: "底面", en: "Surfaces" },
  baseDesc: {
    zh: "纸面与霜面并排。语义细边（--*-border）与着色底（--*-subtle）在两类底面上都保持清晰层次。",
    en: "Paper and frost side by side. Semantic hairlines (--*-border) and tinted fills (--*-subtle) keep a clear hierarchy on both surfaces.",
  },
  legalNote: {
    zh: "文献全文仅在当前团队空间内按法务档位共享，原始字节严格按用户隔离。",
    en: "Full texts are shared only within this team space under the legal tier; raw bytes stay strictly user-isolated.",
  },
  proposalNote: {
    zh: "当前草稿包含未处理的修订提案，导出 Word 前建议先确认或拒绝。",
    en: "This draft has unresolved revision proposals; confirm or reject them before exporting to Word.",
  },
  variantsTitle: { zh: "变体", en: "Variants" },
  variantsDesc: {
    zh: "六种语义等级：info / success / warning (warn) / error / secondary / contrast。error 与 warn 自动声明 role='alert'。",
    en: "Six tones: info / success / warning (warn) / error / secondary / contrast. error and warn automatically declare role='alert'.",
  },
  statesTitle: { zh: "状态", en: "States" },
  statesDesc: {
    zh: "各语义等级在纯文本、带图标与可关闭（closable）状态下的对比。",
    en: "Each tone as plain text, with icon, and closable.",
  },
  colText: { zh: "纯文本", en: "Text" },
  colIcon: { zh: "带图标", en: "With icon" },
  colClosable: { zh: "可关闭 (closable)", en: "Closable" },
  feedbackText: { zh: "操作反馈或上下文说明文本。", en: "Action feedback or contextual explanation." },
  iconText: { zh: "带前置图标的提示内容。", en: "Notice content with a leading icon." },
  closableText: { zh: "可点击右侧按钮关闭此提示。", en: "Click the button on the right to dismiss this notice." },
  restore: { zh: "恢复已关闭的提示条", en: "Restore dismissed notices" },
  api: { zh: "接口", en: "API" },
} as const;
</script>

<template>
  <DocPage>
    <DocSection :title="s.demo" :desc="s.demoDesc">
      <UsagePlayground :entry="usage" />
    </DocSection>
    <DocSection :title="s.whenToUse">
      <ul class="doc-rules">
        <li data-kind="do" v-html="t(s.rule1)" />
        <li data-kind="do" v-html="t(s.rule2)" />
        <li data-kind="dont" v-html="t(s.rule3)" />
        <li data-kind="dont" v-html="t(s.rule4)" />
      </ul>
    </DocSection>

    <DocSection :title="s.baseTitle" :desc="s.baseDesc">
      <Specimen :surfaces="['paper', 'frost']" layout="stack">
        <Message severity="info" :icon="Info">
          {{ t(s.legalNote) }}
        </Message>
        <Message severity="warning" :icon="TriangleAlert" closable>
          {{ t(s.proposalNote) }}
        </Message>
      </Specimen>
    </DocSection>

    <DocSection :title="s.variantsTitle" :desc="s.variantsDesc">
      <Specimen themes="single" layout="stack">
        <Message v-for="sv in severities" :key="sv.value" :severity="sv.value" :icon="Sparkles">
          {{ t(sv.text) }}
        </Message>
      </Specimen>
    </DocSection>

    <DocSection :title="s.statesTitle" :desc="s.statesDesc">
      <Specimen themes="both" layout="stack">
        <StateGrid :columns="[s.colText, s.colIcon, s.colClosable]" label-width="88px">
          <StateRow v-for="sv in severities" :key="`${sv.value}-${resetKey}`" :label="sv.label">
            <div style="width: 220px">
              <Message :severity="sv.value">{{ t(s.feedbackText) }}</Message>
            </div>
            <div style="width: 220px">
              <Message
                :severity="sv.value"
                :icon="sv.value === 'error' ? ShieldAlert : sv.value === 'warning' ? TriangleAlert : sv.value === 'success' ? CheckCircle2 : Info"
              >
                {{ t(s.iconText) }}
              </Message>
            </div>
            <div style="width: 240px">
              <Message :severity="sv.value" :icon="Info" closable>
                {{ t(s.closableText) }}
              </Message>
            </div>
          </StateRow>
        </StateGrid>
        <div class="doc-row">
          <Button size="xs" variant="text" severity="secondary" :label="t(s.restore)" @click="resetKey++" />
        </div>
      </Specimen>
    </DocSection>

    <DocSection :title="s.api">
      <ApiTable :api="api" />
    </DocSection>
  </DocPage>
</template>
