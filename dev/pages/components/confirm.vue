<script setup lang="ts">
import { AlertTriangle, Archive, HelpCircle, Trash2 } from "lucide-vue-next";
import { ref } from "vue";
import { Badge, Button, ConfirmHost, useConfirm } from "../../../src";
import DocPage from "../../kit/DocPage.vue";
import DocSection from "../../kit/DocSection.vue";
import Specimen from "../../kit/Specimen.vue";
import StateGrid from "../../kit/StateGrid.vue";
import StateRow from "../../kit/StateRow.vue";

const confirm = useConfirm();
const lastOutcome = ref<string>("尚未触发");

async function askPublish() {
  const ok = await confirm.ask({
    title: "发布当前版本？",
    message: "发布后团队成员将看到最新修订，并生成可回溯的版本快照。",
    acceptLabel: "立即发布",
    rejectLabel: "再检查一下",
  });
  lastOutcome.value = ok ? "已确认：立即发布" : "已取消：再检查一下";
}

async function askDelete() {
  const ok = await confirm.ask({
    title: "永久删除该文献？",
    message: "「Vaswani et al. (2017)」及其下的 12 条批注将从文库移除。",
    description: "此操作不可撤销；正文中已插入的引用角标将转为待修复状态。",
    danger: true,
    acceptLabel: "永久删除",
    rejectLabel: "保留",
  });
  lastOutcome.value = ok ? "已确认：永久删除" : "已取消：保留文献";
}

async function askSeverity(severity: "primary" | "danger" | "warn" | "secondary") {
  const labels = {
    primary: "品牌主操作",
    danger: "危险删除",
    warn: "覆盖警告",
    secondary: "中性次操作",
  } as const;
  const ok = await confirm.ask({
    title: `${labels[severity]}确认`,
    message: `当前确认按钮使用 acceptSeverity="${severity}"。`,
    danger: severity === "danger",
    acceptSeverity: severity,
    icon: severity === "warn" ? Archive : undefined,
    acceptLabel: labels[severity],
  });
  lastOutcome.value = ok ? `已确认 (${severity})` : `已取消 (${severity})`;
}

async function askMaskDismiss() {
  const ok = await confirm.ask({
    title: "切换引用体例？",
    message: "已开启 dismissableMask，点击背景遮罩同样会结算为 false。",
    dismissableMask: true,
  });
  lastOutcome.value = ok ? "已确认：切换体例" : "已取消（含遮罩/Esc）";
}

async function askLockedEsc() {
  const ok = await confirm.ask({
    title: "终止正在运行的导出任务？",
    message: "已设置 closeOnEscape: false，必须显式点击按钮作出选择。",
    danger: true,
    closeOnEscape: false,
    acceptLabel: "终止任务",
  });
  lastOutcome.value = ok ? "已确认：终止任务" : "已取消：继续运行";
}

async function askScopedGroup() {
  const ok = await confirm.ask({
    group: "scoped-demo",
    title: "独立分组宿主 (group='scoped-demo')",
    message: "该请求由本页局部挂载的 ConfirmHost 消费，支持自定义插槽或局部队列。",
    acceptLabel: "确认",
  });
  lastOutcome.value = ok ? "已确认 (scoped-demo)" : "已取消 (scoped-demo)";
}
</script>

<template>
  <DocPage
    lead="命令式二次确认：通过 useConfirm().ask() 唤起厚霜确认框并返回 Promise<boolean>。破坏性操作自动切换危险视觉并将初始焦点落在「取消」上，防止连按回车误穿。"
  >
    <DocSection title="何时使用">
      <ul class="doc-rules">
        <li data-kind="do">不可逆或高代价动作前的最后一步拦截：删除文献、清空回收站、移除成员、覆盖版本。</li>
        <li data-kind="do">优先使用 <code>const ok = await confirm.ask(...)</code> 的异步返回值写法，线性表达业务分支。</li>
        <li data-kind="dont">需要用户输入原因或勾选选项时用 <code>Dialog</code>；确认框只做「继续 / 取消」二元决策。</li>
        <li data-kind="dont">常规低风险操作不要弹确认框；优先直接执行并用 <code>Toast</code> 提供「撤销」动作。</li>
      </ul>
    </DocSection>

    <DocSection
      title="底面与交互演示"
      desc="ConfirmHost 采用 .mw-frost--thick 厚霜材质。点击按钮体验真实确认流，下方并排展示常规询问与危险拦截两种静态解剖态。"
    >
      <Specimen :surfaces="['paper', 'frost']" layout="stack">
        <div class="doc-row">
          <Button size="sm" label="触发常规确认" @click="askPublish" />
          <Button size="sm" severity="danger" :icon="Trash2" label="触发危险删除" @click="askDelete" />
          <Badge severity="info">{{ lastOutcome }}</Badge>
        </div>

        <div class="confirm-preview-grid">
          <div class="confirm-card mw-frost mw-frost--thick">
            <div class="confirm-card__head">
              <span class="confirm-card__icon"><HelpCircle :size="18" /></span>
              <strong>发布当前版本？</strong>
            </div>
            <p class="confirm-card__msg">发布后团队成员将看到最新修订，并生成可回溯的版本快照。</p>
            <div class="confirm-card__foot">
              <Button size="sm" severity="secondary" label="再检查一下" />
              <Button size="sm" label="立即发布" />
            </div>
          </div>

          <div class="confirm-card mw-frost mw-frost--thick">
            <div class="confirm-card__head">
              <span class="confirm-card__icon confirm-card__icon--danger"><AlertTriangle :size="18" /></span>
              <strong>永久删除该文献？</strong>
            </div>
            <p class="confirm-card__msg">「Vaswani et al. (2017)」及其下的 12 条批注将从文库移除。</p>
            <div class="confirm-card__foot">
              <Button size="sm" severity="secondary" label="保留 (默认焦点)" />
              <Button size="sm" severity="danger" label="永久删除" />
            </div>
          </div>
        </div>
      </Specimen>
    </DocSection>

    <DocSection
      title="变体与动作严重度"
      desc="acceptSeverity 支持 primary / danger / warn / secondary 四档；danger: true 时自动联动红色警告图标、危险按钮与取消键初始聚焦。"
    >
      <Specimen themes="single">
        <Button size="sm" label="primary 主操作" @click="askSeverity('primary')" />
        <Button size="sm" severity="danger" label="danger 危险动作" @click="askSeverity('danger')" />
        <Button size="sm" variant="tinted" label="warn 覆盖警告" @click="askSeverity('warn')" />
        <Button size="sm" severity="secondary" label="secondary 中性确认" @click="askSeverity('secondary')" />
        <Button size="sm" variant="outlined" severity="secondary" label="分组宿主 group" @click="askScopedGroup" />
      </Specimen>
      <ConfirmHost group="scoped-demo" />
    </DocSection>

    <DocSection
      title="状态与焦点保护"
      desc="内置同帧回车防穿透保护与调用方卸载自动回收（onScopeDispose），切换路由或组件销毁时挂起的确认框自动结算为 false。"
    >
      <Specimen themes="both">
        <StateGrid :columns="['常规 (聚焦确认)', '危险 (聚焦取消)', '遮罩可点关', '禁用 Esc']" label-width="76px">
          <StateRow label="交互体验">
            <Button size="sm" label="常规确认" @click="askPublish" />
            <Button size="sm" severity="danger" label="危险确认" @click="askDelete" />
            <Button size="sm" severity="secondary" label="遮罩关闭" @click="askMaskDismiss" />
            <Button size="sm" severity="secondary" label="锁定 Esc" @click="askLockedEsc" />
          </StateRow>
        </StateGrid>
      </Specimen>
    </DocSection>

    <DocSection title="接口">
      <table class="doc-table">
        <thead>
          <tr><th>属性 / 方法</th><th>取值</th><th>说明</th></tr>
        </thead>
        <tbody>
          <tr><td><code>confirm.ask(options)</code></td><td><code>Promise&lt;boolean&gt;</code></td><td>入队一条确认请求，用户点击确认结算为 <code>true</code>，取消/关闭结算为 <code>false</code></td></tr>
          <tr><td><code>title</code> / <code>message</code> / <code>description</code></td><td><code>string</code></td><td>标题、主消息与次级补充说明（兼容 <code>header</code>）</td></tr>
          <tr><td><code>danger</code></td><td><code>boolean</code></td><td>破坏性操作：图标切为警告红、确认钮切为 <code>danger</code>、初始焦点移至「取消」且拦截容器回车</td></tr>
          <tr><td><code>acceptSeverity</code></td><td><code>primary · danger · warn · secondary</code></td><td>确认按钮语义；默认随 <code>danger</code> 派生</td></tr>
          <tr><td><code>defaultFocus</code></td><td><code>accept · reject · none</code></td><td>打开时的初始焦点；常规默认 <code>accept</code>，危险默认 <code>reject</code></td></tr>
          <tr><td><code>closeOnEscape</code> / <code>dismissableMask</code> / <code>signal</code></td><td><code>boolean / AbortSignal</code></td><td>按 Esc 取消（默认 true）、点遮罩取消（默认 false）、外部信号中止</td></tr>
          <tr><td><code>ConfirmHost: group / #default / #message</code></td><td><code>string / 插槽</code></td><td>按 <code>group</code> 隔离消费队列；可通过作用域插槽完全自定义内容结构</td></tr>
        </tbody>
      </table>
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
