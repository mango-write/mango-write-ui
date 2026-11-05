<script setup lang="ts">
import { computed, ref } from "vue";
import { Button, Dialog, FormField, InputText, Select, Textarea } from "../../../src";
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
const sizedOpen = ref(false);
const activeWidth = ref("32rem");

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
    zh: "承载中等复杂度的子表单或预览，需要独立滚动区（<code>.mw-dialog__body</code>）与明确的主次底栏动作。",
    en: "Hosting medium-complexity sub-forms or previews that need their own scroll area (<code>.mw-dialog__body</code>) and clear primary/secondary footer actions.",
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
  sizeTitle: { zh: "尺寸与宽度", en: "Sizes and widths" },
  sizeDesc: {
    zh: "默认宽度 min(32rem, calc(100vw - 32px))；可通过 width 传入任意 CSS 宽度，或开启 maximizable 支持全屏切换。",
    en: "Defaults to min(32rem, calc(100vw - 32px)); pass any CSS width via width, or enable maximizable for a fullscreen toggle.",
  },
  open: { zh: "打开", en: "Open" },
  widthSpec: { zh: "宽度规格：", en: "Width spec: " },
  sizedBody: {
    zh: "对话框的头部、说明区与底栏固定不滚动；当正文高度超出视口上限（<code>calc(100vh - 32px)</code>）时，正文区 <code>.mw-dialog__body</code> 自动启用细滚动条。",
    en: "The header, description, and footer stay fixed; when the body exceeds the viewport cap (<code>calc(100vh - 32px)</code>), the body area <code>.mw-dialog__body</code> enables a thin scrollbar automatically.",
  },
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

const widthPresets = [
  {
    label: { zh: "紧凑 24rem", en: "Compact 24rem" },
    value: "24rem",
    desc: { zh: "轻量重命名、创建标签、快捷授权", en: "Lightweight renames, tag creation, quick approvals" },
  },
  {
    label: { zh: "标准 32rem", en: "Standard 32rem" },
    value: "32rem",
    desc: { zh: "默认尺寸，适合常规单列配置表单", en: "The default; fits regular single-column configuration forms" },
  },
  {
    label: { zh: "宽幅 44rem", en: "Wide 44rem" },
    value: "44rem",
    desc: { zh: "双列字段、引用预览或导入映射", en: "Two-column fields, citation previews, or import mappings" },
  },
] as const;

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

function openWithWidth(width: string) {
  activeWidth.value = width;
  sizedOpen.value = true;
}

function sizedDescription(width: string): string {
  return t({
    zh: `当前弹窗绑定 width=&quot;${width}&quot;，在小屏视口下自动夹紧为 100vw - 32px。`,
    en: `This dialog binds width=&quot;${width}&quot;; on small viewports it clamps to 100vw - 32px.`,
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
        <div v-for="w in widthPresets" :key="w.value" class="doc-row">
          <span class="doc-note" style="width: 84px">{{ t(w.label) }}</span>
          <Button size="sm" severity="secondary" :label="`${t(s.open)} ${w.value}`" @click="openWithWidth(w.value)" />
          <span class="doc-note">{{ t(w.desc) }}</span>
        </div>
      </Specimen>

      <Dialog
        v-model:open="sizedOpen"
        :title="`${t(s.widthSpec)}${activeWidth}`"
        :description="sizedDescription(activeWidth)"
        :width="activeWidth"
      >
        <p style="margin: 0" v-html="t(s.sizedBody)" />
        <template #footer>
          <Button variant="text" severity="secondary" :label="t(s.close)" @click="sizedOpen = false" />
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
