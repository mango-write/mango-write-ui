<script setup lang="ts">
import { computed, ref } from "vue";
import { Plus } from "lucide-vue-next";
import {
  Button,
  Column,
  DataTable,
  Dialog,
  FormField,
  InputNumber,
  InputText,
  Select,
  Tag,
  Textarea,
  ToggleSwitch,
} from "../../../src";
import { api } from "../../api/entries/dialog";
import ApiTable from "../../kit/ApiTable.vue";
import DocPage from "../../kit/DocPage.vue";
import DocSection from "../../kit/DocSection.vue";
import Specimen from "../../kit/Specimen.vue";
import StateGrid from "../../kit/StateGrid.vue";
import StateRow from "../../kit/StateRow.vue";
import UsagePlayground from "../../kit/UsagePlayground.vue";
import { t } from "../../i18n";
import { usage } from "../../usage/entries/dialog";

const basicOpen = ref(false);
const maxOpen = ref(false);
const maskOpen = ref(false);
const headlessOpen = ref(false);
const lockedEscOpen = ref(false);

const smOpen = ref(false);
const mdOpen = ref(false);
const lgOpen = ref(false);
const xlOpen = ref(false);
const xlDrillTarget = ref<string | null>(null);

const s = {
  demo: { zh: "在线演示", en: "Live demo" },
  demoDesc: {
    zh: "调整配置即时预览；查看生成代码，一键复制到项目。",
    en: "Tweak the options for a live preview; view the generated code and copy it into your project.",
  },
  whenToUse: { zh: "何时使用", en: "When to use" },
  do1: {
    zh: "需要用户完成一段完整输入或配置再返回主流程，例如新建草稿、配置导出参数、编辑题录元数据。",
    en: "The user must finish a full input or configuration before returning to the main flow, e.g. creating a draft, configuring export options, or editing bibliographic metadata.",
  },
  do2: {
    zh: "按内容复杂度选用 <code>size=\"sm | md | lg | xl\"</code> 四档标准宽度；分析弹窗下钻明细时使用 <code>:can-back=\"true\"</code> 同窗切换，不在弹窗上叠开第二个弹窗。",
    en: "Pick from the four standard width tiers (<code>size=\"sm | md | lg | xl\"</code>); drill down in-place with <code>:can-back=\"true\"</code> rather than stacking a second modal.",
  },
  dont1: {
    zh: "一句话的二元拦截（「是否删除」）用 <code>useConfirm</code> + <code>ConfirmHost</code>，不要手搭 <code>Dialog</code>。",
    en: "For one-line binary confirmations (“delete or not”), use <code>useConfirm</code> + <code>ConfirmHost</code> instead of hand-rolling a <code>Dialog</code>.",
  },
  dont2: {
    zh: "遮罩只压暗（<code>--scrim</code>）不加模糊，避免双层模糊让厚霜面板失去通透层次。",
    en: "The scrim only dims (<code>--scrim</code>), never blurs — stacked blurs would rob the thick-frost panel of its layered clarity.",
  },
  surfaceTitle: { zh: "底面与交互演示", en: "Surfaces and interaction" },
  surfaceDesc: {
    zh: "厚霜面板压在压暗遮罩之上，内部控件使用半透明叠层。下方可点击按钮唤起真实模态框，也可直接检视浅色与深色下的厚霜解剖结构。",
    en: "A thick-frost panel pressed over a dimming scrim, with translucent fills inside. The buttons below open real dialogs; you can also inspect the thick-frost anatomy in light and dark.",
  },
  newDraftDialog: { zh: "新建草稿弹窗", en: "New draft dialog" },
  maximizableDialog: { zh: "可最大化弹窗", en: "Maximizable dialog" },
  scrimClosable: { zh: "遮罩点击可关闭", en: "Scrim click closes" },
  previewTitle: { zh: "新建写作草稿", en: "New writing draft" },
  escClose: { zh: "Esc 关闭", en: "Esc closes" },
  previewDesc: {
    zh: "设置草稿标题与默认引文样式，创建后可在工作区随时修改。",
    en: "Set the draft title and default citation style; both can be changed later in the workspace.",
  },
  cancel: { zh: "取消", en: "Cancel" },
  createDraft: { zh: "创建草稿", en: "Create draft" },
  basicTitle: { zh: "新建写作草稿", en: "New writing draft" },
  basicDesc: {
    zh: "设置草稿标题与默认引文样式，创建后可在工作区随时切换。",
    en: "Set the draft title and default citation style; switch them anytime in the workspace afterwards.",
  },
  fieldTitle: { zh: "草稿标题", en: "Draft title" },
  titlePlaceholder: { zh: "输入论文或综述标题", en: "Paper or review title" },
  fieldCite: { zh: "引用体例", en: "Citation style" },
  fieldNote: { zh: "研究备忘", en: "Research note" },
  draftTitleValue: { zh: "气候模型参数化方案综述", en: "A review of climate model parameterization schemes" },
  draftNoteValue: {
    zh: "重点对比对流参数化与云微物理过程在东亚季风区的偏差特征。",
    en: "Focus on the bias characteristics of convective parameterization and cloud microphysics over the East Asian monsoon region.",
  },
  saveCreate: { zh: "保存并创建", en: "Save and create" },
  maxTitle: { zh: "文献导入字段核对", en: "Reference import field check" },
  maxDesc: {
    zh: "右上角支持最大化切换；最大化后圆角归零并退为实心纸面底（底下已无可透出内容）。",
    en: "Maximizable from the top-right corner; maximized, the radius drops to zero and the panel falls back to a solid paper surface (nothing left to see through).",
  },
  maxBody: {
    zh: "解析器已从 PDF 首页抽取题录信息：标题、作者列表、DOI 与摘要。点击右上角最大化按钮可在全屏视口下核对长篇参考文献。",
    en: "The parser extracted bibliographic fields from the PDF front page: title, authors, DOI, and abstract. Use the maximize button in the top-right to review long reference lists at full viewport size.",
  },
  match: { zh: "匹配度", en: "Match" },
  close: { zh: "关闭", en: "Close" },
  confirmImport: { zh: "确认入库", en: "Confirm import" },
  maskTitle: { zh: "快速预览说明", en: "Quick preview notes" },
  maskDesc: {
    zh: "已开启 dismissableMask，点击遮罩空白处或按 Escape 均可关闭。",
    en: "With dismissable-mask on, clicking the empty scrim or pressing Escape closes the dialog.",
  },
  maskBody: {
    zh: "非表单类的纯阅读型弹窗可开启遮罩点击关闭，减少用户的鼠标移动距离；含未保存输入的表单弹窗应保持默认关闭以防误触丢失数据。",
    en: "Read-only dialogs can close on scrim clicks to shorten the cursor trip; form dialogs with unsaved input should keep the default (off) so a stray click cannot lose data.",
  },
  gotIt: { zh: "知道了", en: "Got it" },

  sizeTitle: { zh: "四档尺寸与同窗下钻", en: "Four size tiers and in-place drill-down" },
  sizeDesc: {
    zh: "预设 sm (27.5rem) / md (40rem) / lg (53.75rem) / xl (68.75rem) 四档宽度；头部、#scope 范围条、#toolbar 子表单栏与底栏固定不滚，支持 :body-scroll=\"false\" 内部表格滚动与 :can-back=\"true\" 同窗二级下钻。",
    en: "Preset sm (27.5rem), md (40rem), lg (53.75rem), and xl (68.75rem) tiers; header, #scope bar, #toolbar strip, and footer stay pinned, supporting :body-scroll=\"false\" inner table scroll and :can-back=\"true\" in-place drill-down.",
  },
  open: { zh: "打开", en: "Open" },
  tierSmDesc: { zh: "27.5rem — 单栏轻量修改、配额调整", en: "27.5rem — Single-column quick edits, quota tweaks" },
  tierMdDesc: { zh: "40rem — 双栏配置表单（.mw-dialog-grid）与左右分栏底栏（#footer-left）", en: "40rem — Two-column form (.mw-dialog-grid) with split footer (#footer-left)" },
  tierLgDesc: { zh: "53.75rem — 固定 #toolbar 子表单 + 内部表格独立滚动（:body-scroll=\"false\"）", en: "53.75rem — Pinned #toolbar subform + independent scrolling table (:body-scroll=\"false\")" },
  tierXlDesc: { zh: "68.75rem — 带 #scope 范围条的同窗多级下钻（:can-back=\"true\"）", en: "68.75rem — In-place multi-level drill-down with #scope bar (:can-back=\"true\")" },

  smDialogTitle: { zh: "调整用户配额", en: "Adjust user quota" },
  smScope: { zh: "林知夏 · usr_01H9X8A", en: "Lin Zhixia · usr_01H9X8A" },
  smDeltaLabel: { zh: "增减额度 (Tokens)", en: "Quota delta (Tokens)" },
  smReasonLabel: { zh: "变更原因备注", en: "Audit reason" },
  smReasonPlaceholder: { zh: "例如：学术会议试用补贴", en: "e.g. Academic workshop grant" },

  mdDialogTitle: { zh: "编辑模型与计费单价", en: "Edit model & token pricing" },
  mdBasicSec: { zh: "基础路由标识", en: "Routing identity" },
  mdPriceSec: { zh: "Token 计费单价（元 / 百万 Tokens）", en: "Token pricing (CNY / 1M tokens)" },
  mdModelKey: { zh: "模型标识 (modelKey)", en: "Model key" },
  mdDisplayName: { zh: "展示名称", en: "Display name" },
  mdEndpoint: { zh: "上游端点覆盖", en: "Upstream endpoint override" },
  mdInputPrice: { zh: "输入单价 (Input)", en: "Input price" },
  mdOutputPrice: { zh: "输出单价 (Output)", en: "Output price" },
  mdEnabledLabel: { zh: "立即向线上路由开放该模型", en: "Enable model for live routing" },
  saveBtn: { zh: "保存修改", en: "Save changes" },

  lgDialogTitle: { zh: "角色成员与范围授权 · 财务审计员", en: "Role members & scope grants · Billing Auditor" },
  lgScopeBar: {
    zh: "上部 #toolbar 授权栏与底栏固定常驻（:body-scroll=\"false\"），仅中部成员表独立滚动。",
    en: "Top #toolbar grant bar and footer stay pinned (:body-scroll=\"false\"); only the member table scrolls.",
  },
  colUser: { zh: "用户", en: "User" },
  colScope: { zh: "授权产品域", en: "Product scope" },
  colExpires: { zh: "到期日", en: "Expires at" },
  colAction: { zh: "操作", en: "Action" },
  revokeBtn: { zh: "撤销", en: "Revoke" },
  addGrantUser: { zh: "新增授权账号", en: "Grant user email / ID" },
  addGrantScope: { zh: "授权范围", en: "Grant scope" },
  addGrantBtn: { zh: "添加授权", en: "Add grant" },
  searchPlaceholder: { zh: "输入邮箱或用户 ID…", en: "Enter email or user ID…" },

  xlSummaryTitle: { zh: "活跃与留存分群下钻", en: "Active & retention cohort drill-down" },
  xlDrillTitle: { zh: "分群成员明细 · 高频写作核心群", en: "Cohort members · High-frequency writers" },
  xlScopeBase: {
    zh: "时间窗：2026-10-09 — 2026-11-07 · 产品：Write · 端：Web",
    en: "Window: 2026-10-09 — 2026-11-07 · Product: Write · Client: Web",
  },
  xlBackLabel: { zh: "返回分群汇总矩阵", en: "Back to cohort matrix" },
  xlDrillFilterTag: { zh: "当前聚焦：高频写作核心群 (328 人)", en: "Focused: High-frequency writers (328)" },
  xlClearDrill: { zh: "返回汇总", en: "Back to summary" },
  colCohort: { zh: "用户分群", en: "Cohort segment" },
  colUsers: { zh: "活跃用户", en: "Active users" },
  colRetention: { zh: "次周留存率", en: "W1 retention" },
  colAvgTokens: { zh: "人均 Tokens", en: "Avg tokens" },
  drillIntoCohort: { zh: "同窗下钻名单 →", en: "Drill in-place →" },
  colPlan: { zh: "档位", en: "Plan" },
  colQuota: { zh: "额度", en: "Quota" },
  colLastActive: { zh: "最近活跃", en: "Last active" },

  stateTitle: { zh: "状态与行为", en: "States and behavior" },
  stateDesc: {
    zh: "支持键盘焦点环捕获、Escape 拦截、无头部自定义布局及最大化还原。",
    en: "Supports focus trapping, Escape blocking, headless custom layouts, and maximize/restore.",
  },
  colStandard: { zh: "标准模态", en: "Standard modal" },
  colMaximizable: { zh: "可最大化", en: "Maximizable" },
  colScrim: { zh: "遮罩可点关", en: "Scrim closable" },
  colHeadless: { zh: "无头部模式", en: "Headless" },
  colEscLocked: { zh: "锁定 Esc", en: "Esc locked" },
  rowInteraction: { zh: "交互触发", en: "Interaction" },
  btnStandard: { zh: "标准表单", en: "Standard form" },
  btnMax: { zh: "可最大化", en: "Maximizable" },
  btnScrim: { zh: "遮罩关闭", en: "Scrim close" },
  btnHeadless: { zh: "无头部", en: "Headless" },
  btnNoEsc: { zh: "禁用 Esc", en: "No Esc" },
  headlessAria: { zh: "命令速览", en: "Command cheat sheet" },
  headlessTitle: { zh: "无头部模式（showHeader: false）", en: "Headless mode (showHeader: false)" },
  headlessBody: {
    zh: "隐藏可见标题栏时，组件自动生成屏幕阅读器专属标题（<code>ariaLabel</code>），满足无障碍规范。",
    en: "With the visible title bar hidden, the component generates a screen-reader-only title (<code>ariaLabel</code>) to stay accessible.",
  },
  done: { zh: "完成", en: "Done" },
  lockedTitle: { zh: "关键同步进行中", en: "Critical sync in progress" },
  lockedDesc: {
    zh: "已设置 :close-on-escape=\"false\" 与 :closable=\"false\"，防止中途误关。",
    en: "With :close-on-escape=\"false\" and :closable=\"false\", accidental mid-flow closes are blocked.",
  },
  lockedBody: {
    zh: "此时按 Escape 或点击遮罩均不会关闭对话框，必须通过底栏的明确动作按钮结束流程。",
    en: "Neither Escape nor a scrim click closes the dialog now; the flow must end through an explicit footer action.",
  },
  doneClose: { zh: "完成并关闭", en: "Done" },
  api: { zh: "接口", en: "API" },
} as const;

const smQuotaDelta = ref(20000);
const smQuotaReason = ref("");

const modelForm = ref({
  key: "deepseek-r1-0528",
  name: "DeepSeek R1 (0528)",
  endpoint: "https://api.deepseek.com/v1/chat/completions",
  inputPrice: 4,
  outputPrice: 16,
  enabled: true,
});

const newGrantEmail = ref("");
const newGrantScope = ref("write");
const grantScopeOptions = [
  { label: "Write", value: "write" },
  { label: "Rewrite", value: "rewrite" },
  { label: "All Products", value: "all" },
];

const grantRows = computed(() => [
  {
    id: "gr_1",
    user: t({ zh: "林知夏 (lin@tsinghua.edu.cn)", en: "Lin Zhixia (lin@tsinghua.edu.cn)" }),
    scope: "Write + Rewrite",
    expires: "2027-06-30",
  },
  {
    id: "gr_2",
    user: t({ zh: "陈怀瑾 (chen@pku.edu.cn)", en: "Chen Huaijin (chen@pku.edu.cn)" }),
    scope: "Write",
    expires: "2027-03-15",
  },
  {
    id: "gr_3",
    user: t({ zh: "宋清如 (song@fudan.edu.cn)", en: "Song Qingru (song@fudan.edu.cn)" }),
    scope: "Rewrite",
    expires: "2026-12-31",
  },
]);

const cohortRows = computed(() => [
  {
    key: "power",
    cohort: t({ zh: "高频写作核心群 (周活 ≥ 4 天)", en: "High-frequency writers (≥ 4d/wk)" }),
    users: "328",
    retention: "86.4%",
    avgTokens: "142,800",
  },
  {
    key: "importer",
    cohort: t({ zh: "文献重度导入群 (周导入 ≥ 10 篇)", en: "Heavy literature importers (≥ 10/wk)" }),
    users: "614",
    retention: "74.2%",
    avgTokens: "68,500",
  },
]);

const cohortMemberRows = computed(() => [
  {
    id: "usr_01",
    name: t({ zh: "林知夏 (lin@tsinghua.edu.cn)", en: "Lin Zhixia (lin@tsinghua.edu.cn)" }),
    plan: "Pro",
    quota: "128,400",
    lastActive: "2026-11-07 14:12",
  },
  {
    id: "usr_02",
    name: t({ zh: "陈怀瑾 (chen@pku.edu.cn)", en: "Chen Huaijin (chen@pku.edu.cn)" }),
    plan: "Team",
    quota: "512,000",
    lastActive: "2026-11-07 13:58",
  },
]);

/* InputText/Textarea 直读字符串,v-model 默认值按当前语言取词;用户输入优先 */
const draftTitleEdits = ref<string | null>(null);
const draftTitle = computed({
  get: () => draftTitleEdits.value ?? t(s.draftTitleValue),
  set: (value: string) => (draftTitleEdits.value = value),
});
const draftCiteStyle = ref("apa");
const draftNoteEdits = ref<string | null>(null);
const draftNote = computed({
  get: () => draftNoteEdits.value ?? t(s.draftNoteValue),
  set: (value: string) => (draftNoteEdits.value = value),
});
const citeStyles = [
  { label: "APA 7th Edition", value: "apa" },
  { label: "IEEE Numeric", value: "ieee" },
  { label: "GB/T 7714-2015", value: "gbt" },
];

function openXlDrill() {
  xlDrillTarget.value = null;
  xlOpen.value = true;
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
      <Specimen :surfaces="['paper', 'frost']" layout="stack" min-height="260px">
        <div class="doc-row">
          <Button size="sm" :label="t(s.newDraftDialog)" @click="basicOpen = true" />
          <Button size="sm" severity="secondary" :label="t(s.maximizableDialog)" @click="maxOpen = true" />
          <Button size="sm" variant="tinted" :label="t(s.scrimClosable)" @click="maskOpen = true" />
        </div>
        <div class="dialog-preview">
          <div class="dialog-preview__scrim" aria-hidden="true" />
          <div class="dialog-preview__card mw-frost mw-frost--thick">
            <div class="dialog-preview__head">
              <strong>{{ t(s.previewTitle) }}</strong>
              <span class="doc-note">{{ t(s.escClose) }}</span>
            </div>
            <p class="dialog-preview__desc">{{ t(s.previewDesc) }}</p>
            <div class="dialog-preview__foot">
              <Button size="sm" variant="text" severity="secondary" :label="t(s.cancel)" />
              <Button size="sm" :label="t(s.createDraft)" />
            </div>
          </div>
        </div>
      </Specimen>

      <Dialog v-model:open="basicOpen" :title="t(s.basicTitle)" :description="t(s.basicDesc)">
        <div class="doc-stack">
          <FormField input-id="dialog-draft-title" :label="t(s.fieldTitle)" required>
            <InputText
              id="dialog-draft-title"
              v-model="draftTitle"
              :placeholder="t(s.titlePlaceholder)"
              fluid
            />
          </FormField>
          <FormField input-id="dialog-cite-style" :label="t(s.fieldCite)">
            <Select
              input-id="dialog-cite-style"
              v-model="draftCiteStyle"
              :options="citeStyles"
              option-label="label"
              option-value="value"
              fluid
            />
          </FormField>
          <FormField input-id="dialog-draft-note" :label="t(s.fieldNote)">
            <Textarea id="dialog-draft-note" v-model="draftNote" :rows="3" fluid />
          </FormField>
        </div>
        <template #footer>
          <Button variant="text" severity="secondary" :label="t(s.cancel)" @click="basicOpen = false" />
          <Button :label="t(s.saveCreate)" @click="basicOpen = false" />
        </template>
      </Dialog>

      <Dialog
        v-model:open="maxOpen"
        :title="t(s.maxTitle)"
        :description="t(s.maxDesc)"
        maximizable
        width="38rem"
      >
        <div class="doc-stack">
          <p style="margin: 0">{{ t(s.maxBody) }}</p>
          <div class="mw-inlay" style="padding: var(--space-3); font-size: var(--type-body-sm-size)">
            <strong>DOI:</strong> 10.1038/s41586-024-07123-x · <strong>{{ t(s.match) }}:</strong> 98.4%
          </div>
        </div>
        <template #footer>
          <Button variant="text" severity="secondary" :label="t(s.close)" @click="maxOpen = false" />
          <Button :label="t(s.confirmImport)" @click="maxOpen = false" />
        </template>
      </Dialog>

      <Dialog
        v-model:open="maskOpen"
        :title="t(s.maskTitle)"
        :description="t(s.maskDesc)"
        dismissable-mask
        width="26rem"
      >
        <p style="margin: 0">{{ t(s.maskBody) }}</p>
        <template #footer>
          <Button :label="t(s.gotIt)" @click="maskOpen = false" />
        </template>
      </Dialog>
    </DocSection>

    <DocSection :title="s.sizeTitle" :desc="s.sizeDesc">
      <Specimen themes="single" layout="stack">
        <div class="doc-row">
          <span class="doc-note" style="width: 48px">sm</span>
          <Button size="sm" severity="secondary" :label="`${t(s.open)} sm`" @click="smOpen = true" />
          <span class="doc-note">{{ t(s.tierSmDesc) }}</span>
        </div>
        <div class="doc-row">
          <span class="doc-note" style="width: 48px">md</span>
          <Button size="sm" severity="secondary" :label="`${t(s.open)} md`" @click="mdOpen = true" />
          <span class="doc-note">{{ t(s.tierMdDesc) }}</span>
        </div>
        <div class="doc-row">
          <span class="doc-note" style="width: 48px">lg</span>
          <Button size="sm" severity="secondary" :label="`${t(s.open)} lg`" @click="lgOpen = true" />
          <span class="doc-note">{{ t(s.tierLgDesc) }}</span>
        </div>
        <div class="doc-row">
          <span class="doc-note" style="width: 48px">xl</span>
          <Button size="sm" :label="`${t(s.open)} xl`" @click="openXlDrill" />
          <span class="doc-note">{{ t(s.tierXlDesc) }}</span>
        </div>
      </Specimen>

      <Dialog
        v-model:open="smOpen"
        size="sm"
        :title="t(s.smDialogTitle)"
        :scope-text="t(s.smScope)"
      >
        <div class="doc-stack">
          <FormField input-id="dialog-sm-delta" :label="t(s.smDeltaLabel)">
            <InputNumber input-id="dialog-sm-delta" v-model="smQuotaDelta" :step="5000" />
          </FormField>
          <FormField input-id="dialog-sm-reason" :label="t(s.smReasonLabel)">
            <InputText id="dialog-sm-reason" v-model="smQuotaReason" :placeholder="t(s.smReasonPlaceholder)" />
          </FormField>
        </div>
        <template #footer>
          <Button variant="outlined" :label="t(s.cancel)" @click="smOpen = false" />
          <Button :label="t(s.saveBtn)" @click="smOpen = false" />
        </template>
      </Dialog>

      <Dialog
        v-model:open="mdOpen"
        size="md"
        :title="t(s.mdDialogTitle)"
      >
        <template #header-extra>
          <Tag value="DeepSeek" severity="info" />
        </template>
        <div class="mw-dialog-grid">
          <h4 class="mw-dialog-section-title">{{ t(s.mdBasicSec) }}</h4>
          <FormField input-id="dialog-model-key" :label="t(s.mdModelKey)">
            <InputText id="dialog-model-key" v-model="modelForm.key" />
          </FormField>
          <FormField input-id="dialog-model-name" :label="t(s.mdDisplayName)">
            <InputText id="dialog-model-name" v-model="modelForm.name" />
          </FormField>
          <FormField input-id="dialog-model-endpoint" class="mw-dialog-span" :label="t(s.mdEndpoint)">
            <InputText id="dialog-model-endpoint" v-model="modelForm.endpoint" />
          </FormField>
          <div class="mw-dialog-divider" />
          <h4 class="mw-dialog-section-title">{{ t(s.mdPriceSec) }}</h4>
          <FormField input-id="dialog-model-in-price" :label="t(s.mdInputPrice)">
            <InputNumber input-id="dialog-model-in-price" v-model="modelForm.inputPrice" :min="0" :step="0.5" />
          </FormField>
          <FormField input-id="dialog-model-out-price" :label="t(s.mdOutputPrice)">
            <InputNumber input-id="dialog-model-out-price" v-model="modelForm.outputPrice" :min="0" :step="0.5" />
          </FormField>
        </div>
        <template #footer-left>
          <ToggleSwitch v-model="modelForm.enabled" />
          <span>{{ t(s.mdEnabledLabel) }}</span>
        </template>
        <template #footer>
          <Button variant="outlined" :label="t(s.cancel)" @click="mdOpen = false" />
          <Button :label="t(s.saveBtn)" @click="mdOpen = false" />
        </template>
      </Dialog>

      <Dialog
        v-model:open="lgOpen"
        size="lg"
        :body-scroll="false"
        :title="t(s.lgDialogTitle)"
        :scope-text="t(s.lgScopeBar)"
      >
        <template #toolbar>
          <div class="mw-dialog-subform">
            <FormField input-id="dialog-grant-user" :label="t(s.addGrantUser)" style="flex: 1; min-width: 200px">
              <InputText id="dialog-grant-user" v-model="newGrantEmail" :placeholder="t(s.searchPlaceholder)" />
            </FormField>
            <FormField input-id="dialog-grant-scope" :label="t(s.addGrantScope)" style="width: 160px">
              <Select
                v-model="newGrantScope"
                :options="grantScopeOptions"
                option-label="label"
                option-value="value"
              />
            </FormField>
            <Button size="sm" :icon="Plus" :label="t(s.addGrantBtn)" />
          </div>
        </template>
        <div class="mw-dialog-scroll">
          <DataTable :value="grantRows" data-key="id">
            <Column field="user" :header="t(s.colUser)" />
            <Column field="scope" :header="t(s.colScope)" />
            <Column field="expires" :header="t(s.colExpires)" />
            <Column field="action" :header="t(s.colAction)">
              <template #body>
                <Button size="xs" variant="text" severity="danger" :label="t(s.revokeBtn)" />
              </template>
            </Column>
          </DataTable>
        </div>
        <template #footer>
          <Button variant="outlined" :label="t(s.close)" @click="lgOpen = false" />
        </template>
      </Dialog>

      <Dialog
        v-model:open="xlOpen"
        size="xl"
        :body-scroll="false"
        :can-back="Boolean(xlDrillTarget)"
        :back-label="t(s.xlBackLabel)"
        :title="xlDrillTarget ? t(s.xlDrillTitle) : t(s.xlSummaryTitle)"
        :scope-text="t(s.xlScopeBase)"
        @back="xlDrillTarget = null"
      >
        <template #scope>
          <div v-if="xlDrillTarget" class="doc-row">
            <Tag :value="t(s.xlDrillFilterTag)" severity="info" />
            <Button size="xs" variant="text" :label="t(s.xlClearDrill)" @click="xlDrillTarget = null" />
          </div>
        </template>

        <div class="mw-dialog-scroll">
          <DataTable v-if="!xlDrillTarget" :value="cohortRows" data-key="key">
            <Column field="cohort" :header="t(s.colCohort)" />
            <Column field="users" :header="t(s.colUsers)" />
            <Column field="retention" :header="t(s.colRetention)" />
            <Column field="avgTokens" :header="t(s.colAvgTokens)" />
            <Column field="action" :header="t(s.colAction)">
              <template #body="{ data }">
                <Button size="xs" variant="text" :label="t(s.drillIntoCohort)" @click="xlDrillTarget = data.key" />
              </template>
            </Column>
          </DataTable>

          <DataTable v-else :value="cohortMemberRows" data-key="id">
            <Column field="name" :header="t(s.colUser)" />
            <Column field="plan" :header="t(s.colPlan)" />
            <Column field="quota" :header="t(s.colQuota)" />
            <Column field="lastActive" :header="t(s.colLastActive)" />
          </DataTable>
        </div>

        <template #footer>
          <Button variant="outlined" :label="t(s.close)" @click="xlOpen = false" />
        </template>
      </Dialog>
    </DocSection>

    <DocSection :title="s.stateTitle" :desc="s.stateDesc">
      <Specimen themes="both">
        <StateGrid
          :columns="[s.colStandard, s.colMaximizable, s.colScrim, s.colHeadless, s.colEscLocked]"
          label-width="76px"
        >
          <StateRow :label="s.rowInteraction">
            <Button size="sm" :label="t(s.btnStandard)" @click="basicOpen = true" />
            <Button size="sm" severity="secondary" :label="t(s.btnMax)" @click="maxOpen = true" />
            <Button size="sm" severity="secondary" :label="t(s.btnScrim)" @click="maskOpen = true" />
            <Button size="sm" severity="secondary" :label="t(s.btnHeadless)" @click="headlessOpen = true" />
            <Button size="sm" severity="secondary" :label="t(s.btnNoEsc)" @click="lockedEscOpen = true" />
          </StateRow>
        </StateGrid>
      </Specimen>

      <Dialog v-model:open="headlessOpen" :show-header="false" :aria-label="t(s.headlessAria)" dismissable-mask width="26rem">
        <div class="doc-stack">
          <strong style="color: var(--text-primary)">{{ t(s.headlessTitle) }}</strong>
          <p style="margin: 0" v-html="t(s.headlessBody)" />
        </div>
        <template #footer>
          <Button size="sm" :label="t(s.done)" @click="headlessOpen = false" />
        </template>
      </Dialog>

      <Dialog
        v-model:open="lockedEscOpen"
        :title="t(s.lockedTitle)"
        :description="t(s.lockedDesc)"
        :close-on-escape="false"
        :closable="false"
        width="26rem"
      >
        <p style="margin: 0">{{ t(s.lockedBody) }}</p>
        <template #footer>
          <Button :label="t(s.doneClose)" @click="lockedEscOpen = false" />
        </template>
      </Dialog>
    </DocSection>

    <DocSection :title="s.api">
      <ApiTable :api="api" />
    </DocSection>
  </DocPage>
</template>

<style scoped>
.dialog-preview {
  position: relative;
  padding: var(--space-5);
  border-radius: var(--radius-md);
  overflow: hidden;
}

.dialog-preview__scrim {
  position: absolute;
  inset: 0;
  background: var(--scrim);
}

.dialog-preview__card {
  position: relative;
  max-width: 380px;
  margin-inline: auto;
  padding: var(--space-4) var(--space-5);
  border-radius: var(--radius-dialog);
  display: grid;
  gap: var(--space-2);
}

.dialog-preview__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: var(--text-primary);
  font-size: var(--type-title-size);
}

.dialog-preview__desc {
  margin: 0;
  color: var(--text-secondary);
  font-size: var(--type-body-sm-size);
  line-height: var(--type-body-sm-line);
}

.dialog-preview__foot {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-2);
  margin-top: var(--space-2);
}
</style>
