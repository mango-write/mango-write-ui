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

const picked = ref<string[]>([]);
function onFiles(files: File[]) {
  picked.value = files.map((f) => f.name);
}
</script>

<template>
  <DocPage lead="拖入或点击选择文件：导入 PDF、上传图片、合并文档。两条路径都归一成 File[]；过滤、上传与后续流程归调用方。">
    <DocSection title="何时使用">
      <ul class="doc-rules">
        <li data-kind="do">导入是该区域的主要动作（工具页空态、导入对话框）。</li>
        <li data-kind="do">在霜面或分组卡里用 <code>surface="inlay"</code>；嵌进更大区域时用 <code>plain</code> / <code>bare</code> 去框。</li>
        <li data-kind="dont">只是表单里的一个附件字段时，用按钮触发文件选择即可，不需要大面积放置区。</li>
        <li data-kind="dont">不在区域内重复写「支持拖拽」以外的长说明；格式与大小限制一行写清。</li>
      </ul>
    </DocSection>

    <DocSection title="变体" desc="solid = 控件面；inlay = 半透明内嵌面。边框为虚线 --border-strong，拖入时转品牌色并铺 --accent-subtle。">
      <Specimen :surfaces="['paper', 'frost']" layout="stack">
        <FileDropZone class="demo-drop" multiple accept=".pdf" aria-label="导入 PDF" @files="onFiles">
          <FileUp class="demo-drop__icon" />
          <strong class="demo-drop__title">拖入 PDF 或点击选择</strong>
          <span class="demo-drop__hint">单个文件不超过 100 MB，可多选</span>
        </FileDropZone>
        <FileDropZone class="demo-drop" surface="inlay" aria-label="上传图片" @files="onFiles">
          <strong class="demo-drop__title">上传图片</strong>
          <span class="demo-drop__hint">PNG / JPG / HEIC</span>
        </FileDropZone>
      </Specimen>
      <p v-if="picked.length" class="doc-note">已选择：{{ picked.join("、") }}</p>
    </DocSection>

    <DocSection title="去框档" desc="bare：横向单行，配合自定布局；plain：纵向布局不变但去掉框与底。两者拖入时都以内收虚线 outline 提示。">
      <Specimen themes="both" layout="stack">
        <FileDropZone bare class="demo-bare" aria-label="追加文件" @files="onFiles">
          <Upload class="demo-drop__icon demo-drop__icon--sm" />
          <span>拖入以追加到合并列表</span>
          <Button size="sm" severity="secondary" label="选择文件" style="margin-inline-start: auto" />
        </FileDropZone>
        <FileDropZone plain class="demo-drop" aria-label="导入" @files="onFiles">
          <strong class="demo-drop__title">plain：嵌在大区域里</strong>
        </FileDropZone>
      </Specimen>
    </DocSection>

    <DocSection title="状态" desc="拖入态请拖一个文件进来体验；焦点用 Tab 键查看外环。">
      <Specimen themes="both">
        <StateGrid :columns="['默认', '禁用']" label-width="48px">
          <StateRow label="solid">
            <FileDropZone class="demo-drop demo-drop--sm" aria-label="默认"><span class="demo-drop__hint">拖入文件</span></FileDropZone>
            <FileDropZone class="demo-drop demo-drop--sm" disabled aria-label="禁用"><span class="demo-drop__hint">额度已用完</span></FileDropZone>
          </StateRow>
        </StateGrid>
      </Specimen>
    </DocSection>

    <DocSection title="接口">
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
