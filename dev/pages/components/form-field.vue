<script setup lang="ts">
import { ref } from "vue";
import { FormField, InputNumber, InputText, Select, Textarea } from "../../../src";
import { api } from "../../api/entries/form-field";
import ApiTable from "../../kit/ApiTable.vue";
import CodeBlock from "../../kit/CodeBlock.vue";
import DocPage from "../../kit/DocPage.vue";
import DocSection from "../../kit/DocSection.vue";
import Specimen from "../../kit/Specimen.vue";

const title = ref("大语言模型辅助的系统综述方法");
const limit = ref<number | null>(8000);
const summary = ref("");
const venue = ref("journal");
const venues = [
  { label: "期刊论文", value: "journal" },
  { label: "会议论文", value: "conference" },
  { label: "学位论文", value: "thesis" },
];
</script>

<template>
  <DocPage lead="给控件配上常驻标签、说明与错误：负责 label 关联、aria-describedby 与错误播报，控件只需接住插槽传下来的状态。">
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
        <li data-kind="do">所有表单输入都包一层：标签常驻显示，不靠占位符。</li>
        <li data-kind="do">说明写「怎么填」，错误写「哪里错了、怎么改」。</li>
        <li data-kind="dont">不要同时堆说明和错误的长段落；错误出现时说明可以省略。</li>
        <li data-kind="dont">错误不只靠红色：始终有文字，并以 <code>role="alert"</code> 播报。</li>
      </ul>
    </DocSection>

    <DocSection title="版式" desc="标签 body-sm / medium / --text-secondary；标签到控件 --space-1-5；说明 caption / --text-tertiary；错误 caption / --danger-text。">
      <Specimen :surfaces="['paper', 'frost']" layout="stack">
        <FormField v-slot="{ inputId, describedBy, invalid }" input-id="ff-title" label="论文标题" hint="使用投稿系统中的正式标题" required>
          <InputText :id="inputId" v-model="title" :aria-describedby="describedBy" :invalid="invalid" fluid />
        </FormField>
        <FormField v-slot="{ inputId, describedBy, invalid }" input-id="ff-limit" label="字数上限" error="字数上限不能超过 6000">
          <InputNumber v-model="limit" :input-id="inputId" :aria-describedby="describedBy" :invalid="invalid" suffix=" 字" />
        </FormField>
      </Specimen>
    </DocSection>

    <DocSection title="表单" desc="字段之间用 --space-4；不同控件共享同一套标签与消息样式。">
      <Specimen :surfaces="['raised']" themes="both" layout="stack">
        <FormField v-slot="{ inputId, describedBy }" input-id="ff-venue" label="发表类型">
          <Select v-model="venue" :input-id="inputId" :options="venues" option-label="label" option-value="value" :aria-describedby="describedBy" />
        </FormField>
        <FormField v-slot="{ inputId, describedBy, invalid }" input-id="ff-summary" label="一句话摘要" hint="不超过 120 字，会显示在团队文库卡片上">
          <Textarea :id="inputId" v-model="summary" :rows="2" :aria-describedby="describedBy" :invalid="invalid" />
        </FormField>
        <FormField v-slot="{ inputId }" input-id="ff-disabled" label="归属团队" hint="草稿创建后不可更改">
          <InputText :id="inputId" model-value="计算语言学课题组" disabled fluid />
        </FormField>
      </Specimen>
    </DocSection>

    <DocSection title="接口">
      <ApiTable :api="api" />
    </DocSection>
  </DocPage>
</template>
