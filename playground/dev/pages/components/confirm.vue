<script setup lang="ts">
import { AlertTriangle, Archive, HelpCircle, Trash2 } from "lucide-vue-next";
import { ref } from "vue";
import { Badge, Button, ConfirmHost, useConfirm } from "@mango-write/ui-vue";
import { api } from "../../api/entries/confirm";
import ApiTable from "../../kit/ApiTable.vue";
import DocPage from "../../kit/DocPage.vue";
import DocSection from "../../kit/DocSection.vue";
import Specimen from "../../kit/Specimen.vue";
import StateGrid from "../../kit/StateGrid.vue";
import StateRow from "../../kit/StateRow.vue";
import UsagePlayground from "../../kit/UsagePlayground.vue";
import { t } from "../../i18n";
import { usage } from "../../usage/entries/confirm";

const confirm = useConfirm();

const s = {
  demo: { zh: "在线演示", en: "Live demo" },
  demoDesc: {
    zh: "调整配置即时预览；查看生成代码，一键复制到项目。",
    en: "Tweak the options for a live preview; view the generated code and copy it into your project.",
  },
  whenToUse: { zh: "何时使用", en: "When to use" },
  do1: {
    zh: "不可逆或高代价动作前的最后一步拦截：删除文献、清空回收站、移除成员、覆盖版本。",
    en: "A final gate before irreversible or high-cost actions: deleting references, emptying the trash, removing members, overwriting versions.",
  },
  do2: {
    zh: "优先使用 <code>const ok = await confirm.ask(...)</code> 的异步返回值写法，线性表达业务分支。",
    en: "Prefer the async form <code>const ok = await confirm.ask(...)</code> and express business branches linearly.",
  },
  dont1: {
    zh: "需要用户输入原因或勾选选项时用 <code>Dialog</code>；确认框只做「继续 / 取消」二元决策。",
    en: "Use a <code>Dialog</code> when the user must type a reason or tick options; the confirm is strictly a binary “continue / cancel” decision.",
  },
  dont2: {
    zh: "常规低风险操作不要弹确认框；优先直接执行并用 <code>Toast</code> 提供「撤销」动作。",
    en: "Don't confirm routine low-risk actions; execute directly and offer an “Undo” action via <code>Toast</code>.",
  },
  surfaceTitle: { zh: "底面与交互演示", en: "Surfaces and interaction" },
  surfaceDesc: {
    zh: "ConfirmHost 采用 .mw-frost--thick 厚霜材质。点击按钮体验真实确认流，下方并排展示常规询问与危险拦截两种静态解剖态。",
    en: "ConfirmHost uses the .mw-frost--thick material. Click the buttons to run real confirm flows; below, a regular prompt and a danger gate sit side by side as static anatomy.",
  },
  askPublishBtn: { zh: "触发常规确认", en: "Run regular confirm" },
  askDeleteBtn: { zh: "触发危险删除", en: "Run danger delete" },
  notTriggered: { zh: "尚未触发", en: "Not triggered yet" },
  pubTitle: { zh: "发布当前版本？", en: "Publish this version?" },
  pubMsg: {
    zh: "发布后团队成员将看到最新修订，并生成可回溯的版本快照。",
    en: "Team members will see the latest revisions, and a traceable version snapshot is created.",
  },
  reviewAgain: { zh: "再检查一下", en: "Review again" },
  publishNow: { zh: "立即发布", en: "Publish now" },
  publishOk: { zh: "已确认：立即发布", en: "Confirmed: publish now" },
  publishCancel: { zh: "已取消：再检查一下", en: "Cancelled: review again" },
  delTitle: { zh: "永久删除该文献？", en: "Delete this reference permanently?" },
  delMsg: {
    zh: "「Vaswani et al. (2017)」及其下的 12 条批注将从文库移除。",
    en: "“Vaswani et al. (2017)” and its 12 annotations will be removed from the library.",
  },
  delDesc: {
    zh: "此操作不可撤销；正文中已插入的引用角标将转为待修复状态。",
    en: "This cannot be undone; citation markers already inserted in the document switch to a pending-repair state.",
  },
  keep: { zh: "保留", en: "Keep" },
  keepDefaultFocus: { zh: "保留 (默认焦点)", en: "Keep (default focus)" },
  deleteForever: { zh: "永久删除", en: "Delete forever" },
  deleteOk: { zh: "已确认：永久删除", en: "Confirmed: delete forever" },
  deleteCancel: { zh: "已取消：保留文献", en: "Cancelled: reference kept" },
  variantTitle: { zh: "变体与动作严重度", en: "Variants and accept severity" },
  variantDesc: {
    zh: "acceptSeverity 支持 primary / danger / warn / secondary 四档；danger: true 时自动联动红色警告图标、危险按钮与取消键初始聚焦。",
    en: "acceptSeverity takes primary / danger / warn / secondary; with danger: true the red warning icon, danger button, and reject-focus engage automatically.",
  },
  sevPrimaryBtn: { zh: "primary 主操作", en: "primary — main action" },
  sevDangerBtn: { zh: "danger 危险动作", en: "danger — destructive" },
  sevWarnBtn: { zh: "warn 覆盖警告", en: "warn — overwrite warning" },
  sevSecondaryBtn: { zh: "secondary 中性确认", en: "secondary — neutral confirm" },
  sevGroupBtn: { zh: "分组宿主 group", en: "Grouped host (group)" },
  focusTitle: { zh: "状态与焦点保护", en: "States and focus protection" },
  focusDesc: {
    zh: "内置同帧回车防穿透保护与调用方卸载自动回收（onScopeDispose），切换路由或组件销毁时挂起的确认框自动结算为 false。",
    en: "Built-in same-frame Enter passthrough protection and auto-reclaim when the caller unmounts (onScopeDispose); pending confirms settle to false on route change or unmount.",
  },
  colRegular: { zh: "常规 (聚焦确认)", en: "Regular (focus accept)" },
  colDanger: { zh: "危险 (聚焦取消)", en: "Danger (focus reject)" },
  colScrim: { zh: "遮罩可点关", en: "Scrim closable" },
  colEsc: { zh: "禁用 Esc", en: "No Esc" },
  rowExperience: { zh: "交互体验", en: "Interaction" },
  btnRegular: { zh: "常规确认", en: "Regular confirm" },
  btnDanger: { zh: "危险确认", en: "Danger confirm" },
  btnScrim: { zh: "遮罩关闭", en: "Scrim close" },
  btnLockEsc: { zh: "锁定 Esc", en: "Lock Esc" },
  maskTitle: { zh: "切换引用体例？", en: "Switch citation style?" },
  maskMsg: {
    zh: "已开启 dismissableMask，点击背景遮罩同样会结算为 false。",
    en: "With dismissableMask on, clicking the backdrop also settles to false.",
  },
  maskOk: { zh: "已确认：切换体例", en: "Confirmed: style switched" },
  maskCancel: { zh: "已取消（含遮罩/Esc）", en: "Cancelled (scrim/Esc included)" },
  escTitle: { zh: "终止正在运行的导出任务？", en: "Stop the running export job?" },
  escMsg: {
    zh: "已设置 closeOnEscape: false，必须显式点击按钮作出选择。",
    en: "With closeOnEscape: false, the choice must be made by explicitly clicking a button.",
  },
  stopTask: { zh: "终止任务", en: "Stop job" },
  escOk: { zh: "已确认：终止任务", en: "Confirmed: job stopped" },
  escCancel: { zh: "已取消：继续运行", en: "Cancelled: still running" },
  groupTitle: { zh: "独立分组宿主 (group='scoped-demo')", en: "Isolated group host (group='scoped-demo')" },
  groupMsg: {
    zh: "该请求由本页局部挂载的 ConfirmHost 消费，支持自定义插槽或局部队列。",
    en: "This request is consumed by the locally mounted ConfirmHost on this page, supporting custom slots or a local queue.",
  },
  confirmLabel: { zh: "确认", en: "Confirm" },
  groupOk: { zh: "已确认 (scoped-demo)", en: "Confirmed (scoped-demo)" },
  groupCancel: { zh: "已取消 (scoped-demo)", en: "Cancelled (scoped-demo)" },
  api: { zh: "接口", en: "API" },
} as const;

const severityLabels = {
  primary: { zh: "品牌主操作", en: "Primary action" },
  danger: { zh: "危险删除", en: "Destructive delete" },
  warn: { zh: "覆盖警告", en: "Overwrite warning" },
  secondary: { zh: "中性次操作", en: "Neutral secondary" },
} as const;

/* 结果徽标按点击时语言结算;初始态在渲染点取词以跟随切换 */
const lastOutcome = ref<string | null>(null);

async function askPublish() {
  const ok = await confirm.ask({
    title: t(s.pubTitle),
    message: t(s.pubMsg),
    acceptLabel: t(s.publishNow),
    rejectLabel: t(s.reviewAgain),
  });
  lastOutcome.value = ok ? t(s.publishOk) : t(s.publishCancel);
}

async function askDelete() {
  const ok = await confirm.ask({
    title: t(s.delTitle),
    message: t(s.delMsg),
    description: t(s.delDesc),
    danger: true,
    acceptLabel: t(s.deleteForever),
    rejectLabel: t(s.keep),
  });
  lastOutcome.value = ok ? t(s.deleteOk) : t(s.deleteCancel);
}

async function askSeverity(severity: "primary" | "danger" | "warn" | "secondary") {
  const ok = await confirm.ask({
    title: t({ zh: `${t(severityLabels[severity])}确认`, en: `Confirm: ${t(severityLabels[severity])}` }),
    message: t({
      zh: `当前确认按钮使用 acceptSeverity="${severity}"。`,
      en: `The confirm button uses acceptSeverity="${severity}".`,
    }),
    danger: severity === "danger",
    acceptSeverity: severity,
    icon: severity === "warn" ? Archive : undefined,
    acceptLabel: t(severityLabels[severity]),
  });
  lastOutcome.value = ok
    ? t({ zh: `已确认 (${severity})`, en: `Confirmed (${severity})` })
    : t({ zh: `已取消 (${severity})`, en: `Cancelled (${severity})` });
}

async function askMaskDismiss() {
  const ok = await confirm.ask({
    title: t(s.maskTitle),
    message: t(s.maskMsg),
    dismissableMask: true,
  });
  lastOutcome.value = ok ? t(s.maskOk) : t(s.maskCancel);
}

async function askLockedEsc() {
  const ok = await confirm.ask({
    title: t(s.escTitle),
    message: t(s.escMsg),
    danger: true,
    closeOnEscape: false,
    acceptLabel: t(s.stopTask),
  });
  lastOutcome.value = ok ? t(s.escOk) : t(s.escCancel);
}

async function askScopedGroup() {
  const ok = await confirm.ask({
    group: "scoped-demo",
    title: t(s.groupTitle),
    message: t(s.groupMsg),
    acceptLabel: t(s.confirmLabel),
  });
  lastOutcome.value = ok ? t(s.groupOk) : t(s.groupCancel);
}
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

    <DocSection :title="s.surfaceTitle" :desc="s.surfaceDesc">
      <Specimen :surfaces="['paper', 'frost']" layout="stack">
        <div class="doc-row">
          <Button size="sm" :label="t(s.askPublishBtn)" @click="askPublish" />
          <Button size="sm" severity="danger" :icon="Trash2" :label="t(s.askDeleteBtn)" @click="askDelete" />
          <Badge severity="info">{{ lastOutcome ?? t(s.notTriggered) }}</Badge>
        </div>

        <div class="confirm-preview-grid">
          <div class="confirm-card mw-frost mw-frost--thick">
            <div class="confirm-card__head">
              <span class="confirm-card__icon"><HelpCircle :size="18" /></span>
              <strong>{{ t(s.pubTitle) }}</strong>
            </div>
            <p class="confirm-card__msg">{{ t(s.pubMsg) }}</p>
            <div class="confirm-card__foot">
              <Button size="sm" severity="secondary" :label="t(s.reviewAgain)" />
              <Button size="sm" :label="t(s.publishNow)" />
            </div>
          </div>

          <div class="confirm-card mw-frost mw-frost--thick">
            <div class="confirm-card__head">
              <span class="confirm-card__icon confirm-card__icon--danger"><AlertTriangle :size="18" /></span>
              <strong>{{ t(s.delTitle) }}</strong>
            </div>
            <p class="confirm-card__msg">{{ t(s.delMsg) }}</p>
            <div class="confirm-card__foot">
              <Button size="sm" severity="secondary" :label="t(s.keepDefaultFocus)" />
              <Button size="sm" severity="danger" :label="t(s.deleteForever)" />
            </div>
          </div>
        </div>
      </Specimen>
    </DocSection>

    <DocSection :title="s.variantTitle" :desc="s.variantDesc">
      <Specimen themes="single">
        <Button size="sm" :label="t(s.sevPrimaryBtn)" @click="askSeverity('primary')" />
        <Button size="sm" severity="danger" :label="t(s.sevDangerBtn)" @click="askSeverity('danger')" />
        <Button size="sm" variant="tinted" :label="t(s.sevWarnBtn)" @click="askSeverity('warn')" />
        <Button size="sm" severity="secondary" :label="t(s.sevSecondaryBtn)" @click="askSeverity('secondary')" />
        <Button size="sm" variant="outlined" severity="secondary" :label="t(s.sevGroupBtn)" @click="askScopedGroup" />
      </Specimen>
      <ConfirmHost group="scoped-demo" />
    </DocSection>

    <DocSection :title="s.focusTitle" :desc="s.focusDesc">
      <Specimen themes="both">
        <StateGrid :columns="[s.colRegular, s.colDanger, s.colScrim, s.colEsc]" label-width="76px">
          <StateRow :label="s.rowExperience">
            <Button size="sm" :label="t(s.btnRegular)" @click="askPublish" />
            <Button size="sm" severity="danger" :label="t(s.btnDanger)" @click="askDelete" />
            <Button size="sm" severity="secondary" :label="t(s.btnScrim)" @click="askMaskDismiss" />
            <Button size="sm" severity="secondary" :label="t(s.btnLockEsc)" @click="askLockedEsc" />
          </StateRow>
        </StateGrid>
      </Specimen>
    </DocSection>

    <DocSection :title="s.api">
      <ApiTable :api="api" />
    </DocSection>
  </DocPage>
</template>

<style scoped>
.confirm-preview-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: var(--space-3);
}

.confirm-card {
  padding: var(--space-4);
  border-radius: var(--radius-dialog);
  display: grid;
  gap: var(--space-2-5);
}

.confirm-card__head {
  display: flex;
  align-items: center;
  gap: var(--space-2-5);
  color: var(--text-primary);
  font-size: var(--type-title-sm-size);
}

.confirm-card__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: var(--size-sm-h);
  height: var(--size-sm-h);
  border-radius: var(--radius-sm);
  background: var(--info-subtle);
  color: var(--info);
  flex-shrink: 0;
}

.confirm-card__icon--danger {
  background: var(--danger-subtle);
  color: var(--danger);
}

.confirm-card__msg {
  margin: 0;
  color: var(--text-secondary);
  font-size: var(--type-body-sm-size);
  line-height: var(--type-body-sm-line);
}

.confirm-card__foot {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-2);
}
</style>
