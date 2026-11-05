<script setup lang="ts">
import { AlertCircle, CheckCircle2, X } from "lucide-vue-next";
import { ref } from "vue";
import { Button, ToastHost, useNotify } from "../../../src";
import { api } from "../../api/entries/toast";
import ApiTable from "../../kit/ApiTable.vue";
import DocPage from "../../kit/DocPage.vue";
import DocSection from "../../kit/DocSection.vue";
import Specimen from "../../kit/Specimen.vue";
import StateGrid from "../../kit/StateGrid.vue";
import StateRow from "../../kit/StateRow.vue";
import UsagePlayground from "../../kit/UsagePlayground.vue";
import { t } from "../../i18n";
import { usage } from "../../usage/entries/toast";

const notify = useNotify();
const syncStep = ref(0);

const s = {
  demo: { zh: "在线演示", en: "Live demo" },
  demoDesc: {
    zh: "调整配置即时预览；查看生成代码，一键复制到项目。",
    en: "Tweak the options for a live preview; view the generated code and copy it into your project.",
  },
  whenToUse: { zh: "何时使用", en: "When to use" },
  do1: {
    zh: "轻量操作反馈：「已复制 BibTeX」「草稿已保存」「PDF 解析已完成」。",
    en: "Lightweight operation feedback: “BibTeX copied”, “Draft saved”, “PDF parsing finished”.",
  },
  do2: {
    zh: "附带单个低门槛补救动作（如 <code>action: { label: 'Undo', onClick }</code>），替代前置确认弹窗。",
    en: "Attach a single low-cost remediation action (e.g. <code>action: { label: 'Undo', onClick }</code>) instead of an upfront confirm dialog.",
  },
  dont1: {
    zh: "需要用户必读并排查的长篇报错或表单校验说明，用内联 <code>Message</code> 或 <code>FormField</code>。",
    en: "For long error reports or validation notes the user must read and act on, use inline <code>Message</code> or <code>FormField</code>.",
  },
  dont2: {
    zh: "同一后台任务的进度推进请传入相同 <code>id</code> 原位更新，不要连续推入多条堆满视口。",
    en: "For progress on the same background task, pass the same <code>id</code> to update in place instead of stacking toasts across the viewport.",
  },
  anatomyTitle: { zh: "底面与静态解剖", en: "Surface and static anatomy" },
  anatomyDesc: {
    zh: "Toast 自身为 .mw-frost 霜面浮层，状态色只染左侧图标，正文保持高对比度 primary / secondary。指针移入或焦点进入时自动暂停倒计时。",
    en: "A toast is a .mw-frost floating layer; status color tints only the leading icon while body text keeps high-contrast primary / secondary. The countdown pauses on hover or focus.",
  },
  undoToastBtn: { zh: "发送带撤销提示", en: "Send with undo" },
  inPlaceBtn: { zh: "同 ID 原位更新", en: "In-place update (same id)" },
  clearAllBtn: { zh: "清空全部", en: "Clear all" },
  movedTitle: { zh: "已移入回收站", en: "Moved to trash" },
  movedDetail: {
    zh: "「2026 基金申请书初稿」可在 30 天内恢复。",
    en: "“2026 grant application draft” can be restored within 30 days.",
  },
  undo: { zh: "撤销", en: "Undo" },
  restoredTitle: { zh: "已恢复草稿", en: "Draft restored" },
  restoredDetail: { zh: "文档已还原至原文件夹。", en: "The document was restored to its original folder." },
  doiFailTitle: { zh: "DOI 解析失败", en: "DOI lookup failed" },
  doiFailDetail: {
    zh: "CrossRef 响应超时，请稍后重试或手动填写题录。",
    en: "CrossRef timed out; retry later or fill in the entry manually.",
  },
  lifecycleTitle: { zh: "语义与生命周期", en: "Severities and lifecycle" },
  lifecycleDesc: {
    zh: "四种严重度默认停留时长按信息紧急度递增：success / info 3.2s，warn 4.8s，error 6.5s；传 life: 0 则常驻直至手动关闭。",
    en: "Default dwell time grows with urgency: success / info 3.2s, warn 4.8s, error 6.5s; pass life: 0 to stay until manually dismissed.",
  },
  btnSuccess: { zh: "成功 (3.2s)", en: "Success (3.2s)" },
  btnInfo: { zh: "信息 (3.2s)", en: "Info (3.2s)" },
  btnWarn: { zh: "警告 (4.8s)", en: "Warn (4.8s)" },
  btnError: { zh: "错误 (6.5s)", en: "Error (6.5s)" },
  btnSticky: { zh: "常驻提示 (life: 0)", en: "Sticky (life: 0)" },
  insertedTitle: { zh: "引用已插入", en: "Citation inserted" },
  insertedDetail: {
    zh: "已按 GB/T 7714 格式更新文末参考文献表。",
    en: "The reference list was updated in GB/T 7714 format.",
  },
  exportingTitle: { zh: "正在后台导出", en: "Exporting in the background" },
  exportingDetail: {
    zh: "Word 文档生成完成后将自动开始下载。",
    en: "The download starts automatically once the Word file is ready.",
  },
  unanchoredTitle: { zh: "发现 2 处未锚定引用", en: "2 unanchored citations found" },
  unanchoredDetail: {
    zh: "建议在导出前核对正文中的黄色高亮标记。",
    en: "Check the yellow highlights in the body before exporting.",
  },
  saveFailTitle: { zh: "保存失败", en: "Save failed" },
  saveFailDetail: {
    zh: "协同房间连接中断，正在尝试重连。",
    en: "The collab room connection dropped; reconnecting.",
  },
  offlineTitle: { zh: "离线编辑模式", en: "Offline editing mode" },
  offlineDetail: {
    zh: "网络恢复后将自动合并本地协同变更（life: 0 常驻）。",
    en: "Local collab changes merge automatically once the network returns (life: 0 keeps it sticky).",
  },
  hostTitle: { zh: "状态与宿主方位", en: "States and host placement" },
  hostDesc: {
    zh: "ToastHost 支持 6 个视口锚定方位与多 group 隔离；error 级自动切换 role='alert' 与 assertive 读屏播报。",
    en: "ToastHost supports 6 viewport anchors and multi-group isolation; error toasts switch to role='alert' with assertive announcement.",
  },
  colSuccess: { zh: "成功 success", en: "Success" },
  colInfo: { zh: "信息 info", en: "Info" },
  colWarn: { zh: "警告 warn", en: "Warn" },
  colError: { zh: "错误 error", en: "Error" },
  colBottom: { zh: "右下角宿主", en: "Bottom-right host" },
  rowClick: { zh: "点击体验", en: "Click to try" },
  savedTitle: { zh: "已保存修改", en: "Changes saved" },
  copiedTitle: { zh: "已复制链接", en: "Link copied" },
  quotaTitle: { zh: "配额即将用尽", en: "Quota almost used up" },
  netFailTitle: { zh: "网络请求异常", en: "Network request failed" },
  bottomTitle: { zh: "右下角分组宿主", en: "Bottom-right group host" },
  bottomDetail: {
    zh: "通过 group='bottom-demo' 投递至底部 ToastHost。",
    en: "Delivered to the bottom ToastHost via group='bottom-demo'.",
  },
  syncRunning: { zh: "正在同步题录元数据…", en: "Syncing bibliographic metadata…" },
  syncDone: { zh: "题录元数据同步完成", en: "Bibliographic metadata synced" },
  api: { zh: "接口", en: "API" },
} as const;

function triggerUndoToast() {
  notify.success(t(s.movedTitle), t(s.movedDetail), {
    action: {
      label: t(s.undo),
      onClick: () => {
        notify.info(t(s.restoredTitle), t(s.restoredDetail));
      },
    },
  });
}

function triggerInPlaceUpdate() {
  syncStep.value += 1;
  const step = syncStep.value;
  notify.add({
    id: "biblio-sync-demo",
    severity: step % 2 === 1 ? "info" : "success",
    summary: step % 2 === 1 ? t(s.syncRunning) : t(s.syncDone),
    detail: t({
      zh: `第 ${step} 次原位更新（固定 id="biblio-sync-demo"，不重复刷屏）`,
      en: `In-place update #${step} (fixed id="biblio-sync-demo", no re-mount spam)`,
    }),
    life: 4000,
  });
}

function triggerSticky() {
  notify.warn(t(s.offlineTitle), t(s.offlineDetail), {
    life: 0,
  });
}

function triggerBottomRight() {
  notify.info(t(s.bottomTitle), t(s.bottomDetail), {
    group: "bottom-demo",
  });
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

    <DocSection :title="s.anatomyTitle" :desc="s.anatomyDesc">
      <Specimen :surfaces="['paper', 'frost']" layout="stack">
        <div class="doc-row">
          <Button size="sm" :label="t(s.undoToastBtn)" @click="triggerUndoToast" />
          <Button size="sm" severity="secondary" :label="t(s.inPlaceBtn)" @click="triggerInPlaceUpdate" />
          <Button size="sm" variant="text" severity="secondary" :label="t(s.clearAllBtn)" @click="notify.removeAllGroups()" />
        </div>

        <div class="toast-preview-grid">
          <div class="toast-sample mw-frost">
            <CheckCircle2 class="toast-sample__icon toast-sample__icon--success" :size="16" />
            <div class="toast-sample__body">
              <div class="toast-sample__summary">{{ t(s.movedTitle) }}</div>
              <div class="toast-sample__detail">{{ t(s.movedDetail) }}</div>
              <button type="button" class="toast-sample__action" @click="triggerUndoToast">{{ t(s.undo) }}</button>
            </div>
            <X class="toast-sample__close" :size="14" />
          </div>

          <div class="toast-sample mw-frost">
            <AlertCircle class="toast-sample__icon toast-sample__icon--error" :size="16" />
            <div class="toast-sample__body">
              <div class="toast-sample__summary">{{ t(s.doiFailTitle) }}</div>
              <div class="toast-sample__detail">{{ t(s.doiFailDetail) }}</div>
            </div>
            <X class="toast-sample__close" :size="14" />
          </div>
        </div>
      </Specimen>
    </DocSection>

    <DocSection :title="s.lifecycleTitle" :desc="s.lifecycleDesc">
      <Specimen themes="single">
        <Button
          size="sm"
          :label="t(s.btnSuccess)"
          @click="notify.success(t(s.insertedTitle), t(s.insertedDetail))"
        />
        <Button
          size="sm"
          severity="secondary"
          :label="t(s.btnInfo)"
          @click="notify.info(t(s.exportingTitle), t(s.exportingDetail))"
        />
        <Button
          size="sm"
          variant="tinted"
          :label="t(s.btnWarn)"
          @click="notify.warn(t(s.unanchoredTitle), t(s.unanchoredDetail))"
        />
        <Button
          size="sm"
          severity="danger"
          :label="t(s.btnError)"
          @click="notify.error(t(s.saveFailTitle), t(s.saveFailDetail))"
        />
        <Button size="sm" variant="outlined" severity="secondary" :label="t(s.btnSticky)" @click="triggerSticky" />
      </Specimen>
    </DocSection>

    <DocSection :title="s.hostTitle" :desc="s.hostDesc">
      <Specimen themes="both">
        <StateGrid :columns="[s.colSuccess, s.colInfo, s.colWarn, s.colError, s.colBottom]" label-width="76px">
          <StateRow :label="s.rowClick">
            <Button size="sm" severity="secondary" label="Success" @click="notify.success(t(s.savedTitle))" />
            <Button size="sm" severity="secondary" label="Info" @click="notify.info(t(s.copiedTitle))" />
            <Button size="sm" severity="secondary" label="Warn" @click="notify.warn(t(s.quotaTitle))" />
            <Button size="sm" severity="danger" label="Error" @click="notify.error(t(s.netFailTitle))" />
            <Button size="sm" variant="tinted" label="Bottom-Right" @click="triggerBottomRight" />
          </StateRow>
        </StateGrid>
      </Specimen>
      <ToastHost group="bottom-demo" position="bottom-right" />
    </DocSection>

    <DocSection :title="s.api">
      <ApiTable :api="api" />
    </DocSection>
  </DocPage>
</template>

<style scoped>
.toast-preview-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--space-3);
}

.toast-sample {
  display: flex;
  align-items: flex-start;
  gap: var(--space-2-5);
  padding: var(--space-3);
  border-radius: var(--radius-float);
  font-size: var(--type-body-sm-size);
  line-height: var(--type-body-sm-line);
}

.toast-sample__icon {
  flex-shrink: 0;
  margin-top: 2px;
}

.toast-sample__icon--success {
  color: var(--success);
}

.toast-sample__icon--error {
  color: var(--danger);
}

.toast-sample__body {
  flex: 1 1 auto;
  min-width: 0;
  display: grid;
  gap: var(--space-0-5);
}

.toast-sample__summary {
  color: var(--text-primary);
  font-weight: var(--weight-semibold);
}

.toast-sample__detail {
  color: var(--text-secondary);
  font-size: var(--type-caption-size);
  line-height: var(--type-caption-line);
}

.toast-sample__action {
  justify-self: start;
  margin-top: var(--space-1);
  padding: 0 var(--size-xs-px);
  height: var(--size-xs-h);
  border: 0;
  border-radius: var(--size-xs-radius);
  background: var(--accent-subtle);
  color: var(--text-accent);
  font-size: var(--type-caption-size);
  font-weight: var(--weight-medium);
  cursor: pointer;
}

.toast-sample__close {
  flex-shrink: 0;
  color: var(--text-tertiary);
}
</style>
