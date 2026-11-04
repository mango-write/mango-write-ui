<script setup lang="ts">
import { AlertCircle, CheckCircle2, X } from "lucide-vue-next";
import { ref } from "vue";
import { Button, ToastHost, useNotify } from "../../../src";
import DocPage from "../../kit/DocPage.vue";
import DocSection from "../../kit/DocSection.vue";
import Specimen from "../../kit/Specimen.vue";
import StateGrid from "../../kit/StateGrid.vue";
import StateRow from "../../kit/StateRow.vue";

const notify = useNotify();
const syncStep = ref(0);

function triggerUndoToast() {
  notify.success("已移入回收站", "「2026 基金申请书初稿」可在 30 天内恢复。", {
    action: {
      label: "撤销",
      onClick: () => {
        notify.info("已恢复草稿", "文档已还原至原文件夹。");
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
    summary: step % 2 === 1 ? "正在同步题录元数据…" : "题录元数据同步完成",
    detail: `第 ${step} 次原位更新（固定 id="biblio-sync-demo"，不重复刷屏）`,
    life: 4000,
  });
}

function triggerSticky() {
  notify.warn("离线编辑模式", "网络恢复后将自动合并本地协同变更（life: 0 常驻）。", {
    life: 0,
  });
}

function triggerBottomRight() {
  notify.info("右下角分组宿主", "通过 group='bottom-demo' 投递至底部 ToastHost。", {
    group: "bottom-demo",
  });
}
</script>

<template>
  <DocPage
    lead="非阻塞轻提示：操作完成或后台状态变更后在视口角落短暂浮现，不打断当前焦点。采用霜材质（.mw-frost），支持四级语义、行内动作按钮、同 ID 原位更新与指针悬停暂停倒计时。"
  >
    <DocSection title="何时使用">
      <ul class="doc-rules">
        <li data-kind="do">轻量操作反馈：「已复制 BibTeX」「草稿已保存」「PDF 解析已完成」。</li>
        <li data-kind="do">附带单个低门槛补救动作（如 <code>action: { label: '撤销', onClick }</code>），替代前置确认弹窗。</li>
        <li data-kind="dont">需要用户必读并排查的长篇报错或表单校验说明，用内联 <code>Message</code> 或 <code>FormField</code>。</li>
        <li data-kind="dont">同一后台任务的进度推进请传入相同 <code>id</code> 原位更新，不要连续推入多条堆满视口。</li>
      </ul>
    </DocSection>

    <DocSection
      title="底面与静态解剖"
      desc="Toast 自身为 .mw-frost 霜面浮层，状态色只染左侧图标，正文保持高对比度 primary / secondary。指针移入或焦点进入时自动暂停倒计时。"
    >
      <Specimen :surfaces="['paper', 'frost']" layout="stack">
        <div class="doc-row">
          <Button size="sm" label="发送带撤销提示" @click="triggerUndoToast" />
          <Button size="sm" severity="secondary" label="同 ID 原位更新" @click="triggerInPlaceUpdate" />
          <Button size="sm" variant="text" severity="secondary" label="清空全部" @click="notify.removeAllGroups()" />
        </div>

        <div class="toast-preview-grid">
          <div class="toast-sample mw-frost">
            <CheckCircle2 class="toast-sample__icon toast-sample__icon--success" :size="16" />
            <div class="toast-sample__body">
              <div class="toast-sample__summary">已移入回收站</div>
              <div class="toast-sample__detail">「2026 基金申请书初稿」可在 30 天内恢复。</div>
              <button type="button" class="toast-sample__action" @click="triggerUndoToast">撤销</button>
            </div>
            <X class="toast-sample__close" :size="14" />
          </div>

          <div class="toast-sample mw-frost">
            <AlertCircle class="toast-sample__icon toast-sample__icon--error" :size="16" />
            <div class="toast-sample__body">
              <div class="toast-sample__summary">DOI 解析失败</div>
              <div class="toast-sample__detail">CrossRef 响应超时，请稍后重试或手动填写题录。</div>
            </div>
            <X class="toast-sample__close" :size="14" />
          </div>
        </div>
      </Specimen>
    </DocSection>

    <DocSection
      title="语义与生命周期"
      desc="四种严重度默认停留时长按信息紧急度递增：success / info 3.2s，warn 4.8s，error 6.5s；传 life: 0 则常驻直至手动关闭。"
    >
      <Specimen themes="single">
        <Button
          size="sm"
          label="成功 (3.2s)"
          @click="notify.success('引用已插入', '已按 GB/T 7714 格式更新文末参考文献表。')"
        />
        <Button
          size="sm"
          severity="secondary"
          label="信息 (3.2s)"
          @click="notify.info('正在后台导出', 'Word 文档生成完成后将自动开始下载。')"
        />
        <Button
          size="sm"
          variant="tinted"
          label="警告 (4.8s)"
          @click="notify.warn('发现 2 处未锚定引用', '建议在导出前核对正文中的黄色高亮标记。')"
        />
        <Button
          size="sm"
          severity="danger"
          label="错误 (6.5s)"
          @click="notify.error('保存失败', '协同房间连接中断，正在尝试重连。')"
        />
        <Button size="sm" variant="outlined" severity="secondary" label="常驻提示 (life: 0)" @click="triggerSticky" />
      </Specimen>
    </DocSection>

    <DocSection title="状态与宿主方位" desc="ToastHost 支持 6 个视口锚定方位与多 group 隔离；error 级自动切换 role='alert' 与 assertive 读屏播报。">
      <Specimen themes="both">
        <StateGrid :columns="['成功 success', '信息 info', '警告 warn', '错误 error', '右下角宿主']" label-width="76px">
          <StateRow label="点击体验">
            <Button size="sm" severity="secondary" label="Success" @click="notify.success('已保存修改')" />
            <Button size="sm" severity="secondary" label="Info" @click="notify.info('已复制链接')" />
            <Button size="sm" severity="secondary" label="Warn" @click="notify.warn('配额即将用尽')" />
            <Button size="sm" severity="danger" label="Error" @click="notify.error('网络请求异常')" />
            <Button size="sm" variant="tinted" label="Bottom-Right" @click="triggerBottomRight" />
          </StateRow>
        </StateGrid>
      </Specimen>
      <ToastHost group="bottom-demo" position="bottom-right" />
    </DocSection>

    <DocSection title="接口">
      <table class="doc-table">
        <thead>
          <tr><th>属性 / 方法</th><th>取值</th><th>说明</th></tr>
        </thead>
        <tbody>
          <tr><td><code>useNotify()</code></td><td><code>NotifyStore</code></td><td>返回通知存储实例：<code>success / info / warn / error / add / remove / removeGroup / removeAllGroups</code></td></tr>
          <tr><td><code>severity</code></td><td><code>success · info · warn · error</code></td><td>语义级别；<code>error</code> 使用 <code>role="alert"</code>，其余使用 <code>role="status"</code></td></tr>
          <tr><td><code>summary</code> / <code>detail</code></td><td><code>string</code></td><td>主标题与辅助详情说明</td></tr>
          <tr><td><code>life</code></td><td><code>number</code></td><td>自动关闭毫秒数；传 <code>0</code> 常驻不自动消失，悬停或聚焦期间计时器自动暂停</td></tr>
          <tr><td><code>id</code></td><td><code>string</code></td><td>指定稳定 ID 时原位更新现有提示并保持 <code>announceKey</code>，不重复挂载 DOM</td></tr>
          <tr><td><code>action</code></td><td><code>{ label: string, onClick: () =&gt; void }</code></td><td>底部行内操作按钮（如「撤销」「查看」）</td></tr>
          <tr><td><code>ToastHost: position / group</code></td><td><code>top-right · top-left · bottom-right · bottom-left · top-center · bottom-center</code></td><td>挂载方位（默认 <code>top-right</code>）与消费分组名</td></tr>
        </tbody>
      </table>
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
