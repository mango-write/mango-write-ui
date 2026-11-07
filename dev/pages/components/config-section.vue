<script setup lang="ts">
import { ref } from "vue";
import { ConfigRow, ConfigSection, InputNumber, InputText, Select, ToggleSwitch } from "../../../src";
import { api } from "../../api/entries/config-section";
import ApiTable from "../../kit/ApiTable.vue";
import DocPage from "../../kit/DocPage.vue";
import DocSection from "../../kit/DocSection.vue";
import Specimen from "../../kit/Specimen.vue";
import UsagePlayground from "../../kit/UsagePlayground.vue";
import { t } from "../../i18n";
import { usage } from "../../usage/entries/config-section";

const signupEnabled = ref(true);
const dailyQuota = ref(50000);
const defaultModel = ref("deepseek-r1");
const webhookUrl = ref("https://internal.mangowrite.com/hooks/audit");
const fallbackUrl = ref("https://backup-gw.mangowrite.com/v1");

const modelOptions = [
  { label: "DeepSeek R1", value: "deepseek-r1" },
  { label: "DeepSeek V3", value: "deepseek-v3" },
];

const s = {
  demo: { zh: "在线演示", en: "Live demo" },
  demoDesc: {
    zh: "调整配置即时预览；查看生成代码，一键复制到项目。",
    en: "Tweak the options for a live preview; view the generated code and copy it into your project.",
  },
  whenToUse: { zh: "何时使用", en: "When to use" },
  do1: {
    zh: "承载系统参数、计费规则、功能开关等需要对齐标签、控件与长说明的横向设置项列表。",
    en: "Render horizontal setting lists where labels, controls, and descriptions must align cleanly.",
  },
  do2: {
    zh: "通过 <code>keyHint</code> 在悬停标签时暴露底层配置键名（如 <code>billing.daily_free_tokens</code>），保持界面整洁的同时方便运维排查。",
    en: "Expose underlying config keys via <code>keyHint</code> on hover so the UI stays clean while remaining debuggable.",
  },
  dont1: {
    zh: "不要在每个 <code>ConfigSection</code> 底部重复放置局部保存按钮；整页共享顶栏唯一保存出口。",
    en: "Do not place local Save buttons inside each <code>ConfigSection</code>; share a single page-level Save action.",
  },
  dont2: {
    zh: "弹窗内的垂直短表单使用 <code>FormField</code>，不混用三列横向的 <code>ConfigRow</code>。",
    en: "Use vertical <code>FormField</code> inside compact modal forms rather than three-column <code>ConfigRow</code>.",
  },
  anatomyTitle: { zh: "三列网格对齐", en: "Three-column grid alignment" },
  anatomyDesc: {
    zh: "宽容器下按「168px 标签 + 280px 控件 + 自适应说明」三列对齐，标签悬停展示底层配置键名。",
    en: "Aligns as 168px label + 280px control + flexible hint in wide containers, revealing the config key on label hover.",
  },
  secTitle: { zh: "推理路由与配额参数", en: "Inference routing and quota parameters" },
  row1Label: { zh: "开放新用户自助注册", en: "Enable self-serve signup" },
  row1Hint: {
    zh: "关闭后仅允许持有有效团队邀请或兑换码的用户完成注册。",
    en: "When off, only users with a valid team invite or redeem code can register.",
  },
  row2Label: { zh: "默认推理主模型", en: "Default primary model" },
  row2Hint: {
    zh: "新建会话与文献精读默认调用的上游模型标识。",
    en: "Upstream model identifier used by default for new sessions and close reading.",
  },
  row3Label: { zh: "免费档日配额上限", en: "Free-tier daily token cap" },
  row3Hint: {
    zh: "每日凌晨 00:00 (UTC+8) 自动重置的单账户免费额度。",
    en: "Per-account free quota reset daily at 00:00 (UTC+8).",
  },
  statusTitle: { zh: "状态行色调", en: "Status line tones" },
  statusDesc: {
    zh: "底部跨列状态行支持 muted、success、warning、danger 四种语义色调，用于呈现默认值来源、同步状态、延迟生效提示或探测告警。",
    en: "The full-width bottom status line supports muted, success, warning, and danger tones for default provenance, sync state, delayed rollout notices, or probe alerts.",
  },
  statusSecTitle: { zh: "网关连通性与计费同步状态", en: "Gateway connectivity and billing sync status" },
  stMutedStatus: { zh: "默认值：deepseek-r1（未覆盖平台基准配置）", en: "Default: deepseek-r1 (platform baseline not overridden)" },
  stSuccessLabel: { zh: "审计回调地址", en: "Audit webhook URL" },
  stSuccessHint: { zh: "关键管理操作实时推送的 HTTPS 端点。", en: "HTTPS endpoint receiving real-time admin audit events." },
  stSuccessStatus: { zh: "已同步至全部网关节点（最近探测 200 OK）", en: "Synced across all gateway nodes (last probe 200 OK)" },
  stWarnStatus: { zh: "修改已暂存，将在下个整点结算周期生效", en: "Staged change takes effect at the next hourly billing cycle" },
  stDangerLabel: { zh: "备用降级端点", en: "Fallback endpoint" },
  stDangerHint: { zh: "主网关超时或 5xx 时自动切换的容灾集群地址。", en: "Failover cluster URL used when the primary gateway times out." },
  stDangerStatus: { zh: "上游端点连通性探测失败 (HTTP 502 Bad Gateway)", en: "Upstream endpoint connectivity probe failed (HTTP 502 Bad Gateway)" },
  narrowTitle: { zh: "窄容器自适应与浅深主题", en: "Narrow container adaptation & themes" },
  narrowDesc: {
    zh: "基于 CSS Container Queries（container-type: inline-size）：容器窄于 720px 时说明自动折至第二列下方，窄于 520px 时退化为单列垂直堆叠。",
    en: "Powered by CSS Container Queries: wraps the hint under the control below 720px and stacks into a single column below 520px.",
  },
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
        <li data-kind="do" v-html="t(s.do1)" />
        <li data-kind="do" v-html="t(s.do2)" />
        <li data-kind="dont" v-html="t(s.dont1)" />
        <li data-kind="dont" v-html="t(s.dont2)" />
      </ul>
    </DocSection>

    <DocSection :title="s.anatomyTitle" :desc="s.anatomyDesc">
      <Specimen themes="single" layout="stack">
        <ConfigSection :title="t(s.secTitle)">
          <ConfigRow
            :label="t(s.row1Label)"
            key-hint="auth.signup_enabled"
            :hint="t(s.row1Hint)"
          >
            <ToggleSwitch v-model="signupEnabled" />
          </ConfigRow>
          <ConfigRow
            :label="t(s.row2Label)"
            key-hint="llm.default_model"
            :hint="t(s.row2Hint)"
          >
            <Select
              v-model="defaultModel"
              :options="modelOptions"
              option-label="label"
              option-value="value"
            />
          </ConfigRow>
          <ConfigRow
            :label="t(s.row3Label)"
            key-hint="billing.daily_free_tokens"
            :hint="t(s.row3Hint)"
          >
            <InputNumber v-model="dailyQuota" :min="0" :step="5000" />
          </ConfigRow>
        </ConfigSection>
      </Specimen>
    </DocSection>

    <DocSection :title="s.statusTitle" :desc="s.statusDesc">
      <Specimen themes="single" layout="stack">
        <ConfigSection :title="t(s.statusSecTitle)">
          <ConfigRow
            :label="t(s.row2Label)"
            key-hint="llm.default_model"
            :hint="t(s.row2Hint)"
            :status="t(s.stMutedStatus)"
            status-tone="muted"
          >
            <Select
              v-model="defaultModel"
              :options="modelOptions"
              option-label="label"
              option-value="value"
            />
          </ConfigRow>
          <ConfigRow
            :label="t(s.stSuccessLabel)"
            key-hint="audit.webhook_url"
            :hint="t(s.stSuccessHint)"
            :status="t(s.stSuccessStatus)"
            status-tone="success"
          >
            <InputText v-model="webhookUrl" />
          </ConfigRow>
          <ConfigRow
            :label="t(s.row3Label)"
            key-hint="billing.daily_free_tokens"
            :hint="t(s.row3Hint)"
            :status="t(s.stWarnStatus)"
            status-tone="warning"
          >
            <InputNumber v-model="dailyQuota" :min="0" :step="5000" />
          </ConfigRow>
          <ConfigRow
            :label="t(s.stDangerLabel)"
            key-hint="llm.fallback_endpoint"
            :hint="t(s.stDangerHint)"
            :status="t(s.stDangerStatus)"
            status-tone="danger"
          >
            <InputText v-model="fallbackUrl" />
          </ConfigRow>
        </ConfigSection>
      </Specimen>
    </DocSection>

    <DocSection :title="s.narrowTitle" :desc="s.narrowDesc">
      <Specimen themes="both" layout="stack">
        <ConfigSection :title="t(s.secTitle)">
          <ConfigRow
            :label="t(s.row1Label)"
            key-hint="auth.signup_enabled"
            :hint="t(s.row1Hint)"
            :status="t(s.stSuccessStatus)"
            status-tone="success"
          >
            <ToggleSwitch v-model="signupEnabled" />
          </ConfigRow>
          <ConfigRow
            :label="t(s.stDangerLabel)"
            key-hint="llm.fallback_endpoint"
            :hint="t(s.stDangerHint)"
            :status="t(s.stDangerStatus)"
            status-tone="danger"
          >
            <InputText v-model="fallbackUrl" />
          </ConfigRow>
        </ConfigSection>
      </Specimen>
    </DocSection>

    <DocSection :title="s.api">
      <ApiTable :api="api" />
    </DocSection>
  </DocPage>
</template>
