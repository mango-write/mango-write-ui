<script setup lang="ts">
import { FileUp, Upload } from "lucide-vue-next";
import { ref } from "vue";
import { Button, FileDropZone } from "../../../src";
import { api } from "../../api/entries/file-drop-zone";
import ApiTable from "../../kit/ApiTable.vue";
import DocPage from "../../kit/DocPage.vue";
import DocSection from "../../kit/DocSection.vue";
import Specimen from "../../kit/Specimen.vue";
import StateGrid from "../../kit/StateGrid.vue";
import StateRow from "../../kit/StateRow.vue";
import UsagePlayground from "../../kit/UsagePlayground.vue";
import { t } from "../../i18n";
import { usage } from "../../usage/entries/file-drop-zone";

const s = {
  demo: { zh: "在线演示", en: "Live demo" },
  demoDesc: {
    zh: "调整配置即时预览；查看生成代码，一键复制到项目。",
    en: "Tweak the options for a live preview; view the generated code and copy it into your project.",
  },
  whenToUse: { zh: "何时使用", en: "When to use" },
  rule1: {
    zh: "导入是该区域的主要动作（工具页空态、导入对话框）。",
    en: "Import is the area's primary action (tool-page empty states, import dialogs).",
  },
  rule2: {
    zh: '在霜面或分组卡里用 <code>surface="inlay"</code>；嵌进更大区域时用 <code>plain</code> / <code>bare</code> 去框。',
    en: 'Use <code>surface="inlay"</code> on frost or grouped cards; <code>plain</code> / <code>bare</code> to drop the frame inside larger areas.',
  },
  rule3: {
    zh: "只是表单里的一个附件字段时，用按钮触发文件选择即可，不需要大面积放置区。",
    en: "A single attachment field in a form just needs a button-triggered file picker, not a large drop area.",
  },
  rule4: {
    zh: "不在区域内重复写「支持拖拽」以外的长说明；格式与大小限制一行写清。",
    en: "Don't pad the area with long copy beyond “drag & drop”; state format and size limits in one line.",
  },
  variants: { zh: "变体", en: "Variants" },
  variantsDesc: {
    zh: "solid = 控件面；inlay = 半透明内嵌面。边框为虚线 --border-strong，拖入时转品牌色并铺 --accent-subtle。",
    en: "solid = control surface; inlay = translucent inset. The dashed border uses --border-strong and turns brand color with a --accent-subtle wash on dragover.",
  },
  importPdf: { zh: "导入 PDF", en: "Import PDF" },
  dropPdf: { zh: "拖入 PDF 或点击选择", en: "Drop a PDF or click to browse" },
  pdfHint: { zh: "单个文件不超过 100 MB，可多选", en: "Up to 100 MB per file, multiple allowed" },
  uploadImages: { zh: "上传图片", en: "Upload images" },
  pickedPrefix: { zh: "已选择：", en: "Selected: " },
  listSep: { zh: "、", en: ", " },
  chromeless: { zh: "去框档", en: "Chromeless" },
  chromelessDesc: {
    zh: "bare：横向单行，配合自定布局；plain：纵向布局不变但去掉框与底。两者拖入时都以内收虚线 outline 提示。",
    en: "bare: one horizontal row for custom layouts; plain: keeps the vertical layout but drops frame and fill. Both show an inset dashed outline on dragover.",
  },
  appendFiles: { zh: "追加文件", en: "Append files" },
  appendHint: { zh: "拖入以追加到合并列表", en: "Drop to append to the merge list" },
  chooseFiles: { zh: "选择文件", en: "Choose files" },
  importLabel: { zh: "导入", en: "Import" },
  plainHint: { zh: "plain：嵌在大区域里", en: "plain: embedded in a larger area" },
  states: { zh: "状态", en: "States" },
  statesDesc: {
    zh: "拖入态请拖一个文件进来体验；焦点用 Tab 键查看外环。",
    en: "Drag a file in to see the dragover state; Tab to see the focus ring.",
  },
  colDefault: { zh: "默认", en: "Default" },
  colDisabled: { zh: "禁用", en: "Disabled" },
  dropHere: { zh: "拖入文件", en: "Drop files here" },
  quotaUsed: { zh: "额度已用完", en: "Quota exhausted" },
  api: { zh: "接口", en: "API" },
} as const;

const picked = ref<string[]>([]);
function onFiles(files: File[]) {
  picked.value = files.map((f) => f.name);
}
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

    <DocSection :title="s.variants" :desc="s.variantsDesc">
      <Specimen :surfaces="['paper', 'frost']" layout="stack">
        <FileDropZone class="demo-drop" multiple accept=".pdf" :aria-label="t(s.importPdf)" @files="onFiles">
          <FileUp class="demo-drop__icon" />
          <strong class="demo-drop__title">{{ t(s.dropPdf) }}</strong>
          <span class="demo-drop__hint">{{ t(s.pdfHint) }}</span>
        </FileDropZone>
        <FileDropZone class="demo-drop" surface="inlay" :aria-label="t(s.uploadImages)" @files="onFiles">
          <strong class="demo-drop__title">{{ t(s.uploadImages) }}</strong>
          <span class="demo-drop__hint">PNG / JPG / HEIC</span>
        </FileDropZone>
      </Specimen>
      <p v-if="picked.length" class="doc-note">{{ t(s.pickedPrefix) }}{{ picked.join(t(s.listSep)) }}</p>
    </DocSection>

    <DocSection :title="s.chromeless" :desc="s.chromelessDesc">
      <Specimen themes="both" layout="stack">
        <FileDropZone bare class="demo-bare" :aria-label="t(s.appendFiles)" @files="onFiles">
          <Upload class="demo-drop__icon demo-drop__icon--sm" />
          <span>{{ t(s.appendHint) }}</span>
          <Button size="sm" severity="secondary" :label="t(s.chooseFiles)" style="margin-inline-start: auto" />
        </FileDropZone>
        <FileDropZone plain class="demo-drop" :aria-label="t(s.importLabel)" @files="onFiles">
          <strong class="demo-drop__title">{{ t(s.plainHint) }}</strong>
        </FileDropZone>
      </Specimen>
    </DocSection>

    <DocSection :title="s.states" :desc="s.statesDesc">
      <Specimen themes="both">
        <StateGrid :columns="[s.colDefault, s.colDisabled]" label-width="48px">
          <StateRow label="solid">
            <FileDropZone class="demo-drop demo-drop--sm" :aria-label="t(s.colDefault)"><span class="demo-drop__hint">{{ t(s.dropHere) }}</span></FileDropZone>
            <FileDropZone class="demo-drop demo-drop--sm" disabled :aria-label="t(s.colDisabled)"><span class="demo-drop__hint">{{ t(s.quotaUsed) }}</span></FileDropZone>
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
.demo-drop {
  gap: var(--space-1);
  padding: var(--space-6) var(--space-4);
}

.demo-drop--sm {
  width: 200px;
  padding: var(--space-4);
}

.demo-drop__icon {
  width: var(--icon-2xl);
  height: var(--icon-2xl);
  color: var(--text-tertiary);
}

.demo-drop__icon--sm {
  width: var(--icon-md);
  height: var(--icon-md);
}

.demo-drop__title {
  color: var(--text-primary);
  font-size: var(--type-body-sm-size);
  line-height: var(--type-body-sm-line);
  font-weight: var(--weight-medium);
}

.demo-drop__hint {
  color: var(--text-tertiary);
  font-size: var(--type-caption-size);
  line-height: var(--type-caption-line);
}

.demo-bare {
  padding: var(--space-2) var(--space-3);
  font-size: var(--type-body-sm-size);
}
</style>
