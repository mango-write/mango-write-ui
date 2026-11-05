<script setup lang="ts">
import { ref } from "vue";
import { Button, Dialog, FormField, InputText, Select, Textarea } from "../../../src";
import { api } from "../../api/entries/dialog";
import ApiTable from "../../kit/ApiTable.vue";
import CodeBlock from "../../kit/CodeBlock.vue";
import DocPage from "../../kit/DocPage.vue";
import DocSection from "../../kit/DocSection.vue";
import Specimen from "../../kit/Specimen.vue";
import StateGrid from "../../kit/StateGrid.vue";
import StateRow from "../../kit/StateRow.vue";

const basicOpen = ref(false);
const maxOpen = ref(false);
const maskOpen = ref(false);
const headlessOpen = ref(false);
const lockedEscOpen = ref(false);
const sizedOpen = ref(false);
const activeWidth = ref("32rem");

const draftTitle = ref("气候模型参数化方案综述");
const draftCiteStyle = ref("apa");
const draftNote = ref("重点对比对流参数化与云微物理过程在东亚季风区的偏差特征。");
const citeStyles = [
  { label: "APA 7th Edition", value: "apa" },
  { label: "IEEE Numeric", value: "ieee" },
  { label: "GB/T 7714-2015", value: "gbt" },
];

const widthPresets = [
  { label: "紧凑 24rem", value: "24rem", desc: "轻量重命名、创建标签、快捷授权" },
  { label: "标准 32rem", value: "32rem", desc: "默认尺寸，适合常规单列配置表单" },
  { label: "宽幅 44rem", value: "44rem", desc: "双列字段、引用预览或导入映射" },
] as const;

function openWithWidth(width: string) {
  activeWidth.value = width;
  sizedOpen.value = true;
}
</script>

<template>
  <DocPage
    lead="模态覆盖层：打断当前流以完成聚焦的子任务或表单。采用厚霜材质（.mw-frost--thick）配压暗遮罩（--scrim），头部、正文滚动区与底栏动作分区固定。"
  >
    <DocSection title="示例">
      <CodeBlock
        v-for="ex in api.examples"
        :key="ex.title"
        :code="ex.code"
        :title="ex.title"
      />
    </DocSection>
    <DocSection title="何时使用">
      <ul class="doc-rules">
        <li data-kind="do">需要用户完成一段完整输入或配置再返回主流程，例如新建草稿、配置导出参数、编辑题录元数据。</li>
        <li data-kind="do">承载中等复杂度的子表单或预览，需要独立滚动区（<code>.mw-dialog__body</code>）与明确的主次底栏动作。</li>
        <li data-kind="dont">一句话的二元拦截（「是否删除」）用 <code>useConfirm</code> + <code>ConfirmHost</code>，不要手搭 <code>Dialog</code>。</li>
        <li data-kind="dont">遮罩只压暗（<code>--scrim</code>）不加模糊，避免双层模糊让厚霜面板失去通透层次。</li>
      </ul>
    </DocSection>

    <DocSection
      title="底面与交互演示"
      desc="厚霜面板压在压暗遮罩之上，内部控件使用半透明叠层。下方可点击按钮唤起真实模态框，也可直接检视浅色与深色下的厚霜解剖结构。"
    >
      <Specimen :surfaces="['paper', 'frost']" layout="stack" min-height="260px">
        <div class="doc-row">
          <Button size="sm" label="新建草稿弹窗" @click="basicOpen = true" />
          <Button size="sm" severity="secondary" label="可最大化弹窗" @click="maxOpen = true" />
          <Button size="sm" variant="tinted" label="遮罩点击可关闭" @click="maskOpen = true" />
        </div>
        <div class="dialog-preview">
          <div class="dialog-preview__scrim" aria-hidden="true" />
          <div class="dialog-preview__card mw-frost mw-frost--thick">
            <div class="dialog-preview__head">
              <strong>新建写作草稿</strong>
              <span class="doc-note">Esc 关闭</span>
            </div>
            <p class="dialog-preview__desc">设置草稿标题与默认引文样式，创建后可在工作区随时修改。</p>
            <div class="dialog-preview__foot">
              <Button size="sm" variant="text" severity="secondary" label="取消" />
              <Button size="sm" label="创建草稿" />
            </div>
          </div>
        </div>
      </Specimen>

      <Dialog
        v-model:open="basicOpen"
        title="新建写作草稿"
        description="设置草稿标题与默认引文样式，创建后可在工作区随时切换。"
      >
        <div class="doc-stack">
          <FormField input-id="dialog-draft-title" label="草稿标题" required>
            <InputText id="dialog-draft-title" v-model="draftTitle" placeholder="输入论文或综述标题" fluid />
          </FormField>
          <FormField input-id="dialog-cite-style" label="引用体例">
            <Select
              input-id="dialog-cite-style"
              v-model="draftCiteStyle"
              :options="citeStyles"
              option-label="label"
              option-value="value"
              fluid
            />
          </FormField>
          <FormField input-id="dialog-draft-note" label="研究备忘">
            <Textarea id="dialog-draft-note" v-model="draftNote" :rows="3" fluid />
          </FormField>
        </div>
        <template #footer>
          <Button variant="text" severity="secondary" label="取消" @click="basicOpen = false" />
          <Button label="保存并创建" @click="basicOpen = false" />
        </template>
      </Dialog>

      <Dialog
        v-model:open="maxOpen"
        title="文献导入字段核对"
        description="右上角支持最大化切换；最大化后圆角归零并退为实心纸面底（底下已无可透出内容）。"
        maximizable
        width="38rem"
      >
        <div class="doc-stack">
          <p style="margin: 0">
            解析器已从 PDF 首页抽取题录信息：标题、作者列表、DOI 与摘要。点击右上角最大化按钮可在全屏视口下核对长篇参考文献。
          </p>
          <div class="mw-inlay" style="padding: var(--space-3); font-size: var(--type-body-sm-size)">
            <strong>DOI:</strong> 10.1038/s41586-024-07123-x · <strong>匹配度:</strong> 98.4%
          </div>
        </div>
        <template #footer>
          <Button variant="text" severity="secondary" label="关闭" @click="maxOpen = false" />
          <Button label="确认入库" @click="maxOpen = false" />
        </template>
      </Dialog>

      <Dialog
        v-model:open="maskOpen"
        title="快速预览说明"
        description="已开启 dismissableMask，点击遮罩空白处或按 Escape 均可关闭。"
        dismissable-mask
        width="26rem"
      >
        <p style="margin: 0">非表单类的纯阅读型弹窗可开启遮罩点击关闭，减少用户的鼠标移动距离；含未保存输入的表单弹窗应保持默认关闭以防误触丢失数据。</p>
        <template #footer>
          <Button label="知道了" @click="maskOpen = false" />
        </template>
      </Dialog>
    </DocSection>

    <DocSection
      title="尺寸与宽度"
      desc="默认宽度 min(32rem, calc(100vw - 32px))；可通过 width 传入任意 CSS 宽度，或开启 maximizable 支持全屏切换。"
    >
      <Specimen themes="single" layout="stack">
        <div v-for="w in widthPresets" :key="w.value" class="doc-row">
          <span class="doc-note" style="width: 84px">{{ w.label }}</span>
          <Button size="sm" severity="secondary" :label="`打开 ${w.value}`" @click="openWithWidth(w.value)" />
          <span class="doc-note">{{ w.desc }}</span>
        </div>
      </Specimen>

      <Dialog
        v-model:open="sizedOpen"
        :title="`宽度规格：${activeWidth}`"
        :description="`当前弹窗绑定 width=&quot;${activeWidth}&quot;，在小屏视口下自动夹紧为 100vw - 32px。`"
        :width="activeWidth"
      >
        <p style="margin: 0">
          对话框的头部、说明区与底栏固定不滚动；当正文高度超出视口上限（<code>calc(100vh - 32px)</code>）时，正文区 <code>.mw-dialog__body</code> 自动启用细滚动条。
        </p>
        <template #footer>
          <Button variant="text" severity="secondary" label="关闭" @click="sizedOpen = false" />
        </template>
      </Dialog>
    </DocSection>

    <DocSection title="状态与行为" desc="支持键盘焦点环捕获、Escape 拦截、无头部自定义布局及最大化还原。">
      <Specimen themes="both">
        <StateGrid :columns="['标准模态', '可最大化', '遮罩可点关', '无头部模式', '锁定 Esc']" label-width="76px">
          <StateRow label="交互触发">
            <Button size="sm" label="标准表单" @click="basicOpen = true" />
            <Button size="sm" severity="secondary" label="可最大化" @click="maxOpen = true" />
            <Button size="sm" severity="secondary" label="遮罩关闭" @click="maskOpen = true" />
            <Button size="sm" severity="secondary" label="无头部" @click="headlessOpen = true" />
            <Button size="sm" severity="secondary" label="禁用 Esc" @click="lockedEscOpen = true" />
          </StateRow>
        </StateGrid>
      </Specimen>

      <Dialog
        v-model:open="headlessOpen"
        :show-header="false"
        aria-label="命令速览"
        dismissable-mask
        width="26rem"
      >
        <div class="doc-stack">
          <strong style="color: var(--text-primary)">无头部模式（showHeader: false）</strong>
          <p style="margin: 0">隐藏可见标题栏时，组件自动生成屏幕阅读器专属标题（<code>ariaLabel</code>），满足无障碍规范。</p>
        </div>
        <template #footer>
          <Button size="sm" label="完成" @click="headlessOpen = false" />
        </template>
      </Dialog>

      <Dialog
        v-model:open="lockedEscOpen"
        title="关键同步进行中"
        description="已设置 :close-on-escape=&quot;false&quot; 与 :closable=&quot;false&quot;，防止中途误关。"
        :close-on-escape="false"
        :closable="false"
        width="26rem"
      >
        <p style="margin: 0">此时按 Escape 或点击遮罩均不会关闭对话框，必须通过底栏的明确动作按钮结束流程。</p>
        <template #footer>
          <Button label="完成并关闭" @click="lockedEscOpen = false" />
        </template>
      </Dialog>
    </DocSection>

    <DocSection title="接口">
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
