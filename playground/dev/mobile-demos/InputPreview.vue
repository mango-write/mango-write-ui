<script setup lang="ts">
import { MpFormField, MpInput, MpPageHeader, MpSearchBar, MpTextarea } from "@mango-write/ui-mp";
import { mpSim } from "./state";
import { t } from "../i18n";
</script>

<template>
  <main class="mp-preview__scroll mp-preview__pad">
    <MpPageHeader :title="t({ zh: '输入', en: 'Input' })" :description="t({ zh: '标签、提示和错误与真实控件关联。', en: 'Labels, hints, and errors connect to real controls.' })" />
    <MpSearchBar v-model="mpSim.input.query" :clearable="mpSim.input.clearable" :disabled="mpSim.input.disabled" :placeholder="t({ zh: '搜索标题或 DOI', en: 'Search title or DOI' })" />
    <MpFormField input-id="demo-title" :label="t({ zh: '研究标题', en: 'Research title' })" :error="mpSim.input.invalid ? t({ zh: '请填写研究标题', en: 'Enter a research title' }) : undefined" required>
      <template #default="{ inputId, describedBy, invalid, required }">
        <MpInput v-model="mpSim.input.inputValue" :input-id="inputId" :aria-describedby="describedBy" :invalid="invalid" :required="required" :clearable="mpSim.input.clearable" :disabled="mpSim.input.disabled" />
      </template>
    </MpFormField>
    <MpFormField input-id="demo-note" :label="t({ zh: '研究记录', en: 'Research note' })">
      <MpTextarea v-model="mpSim.input.textareaValue" input-id="demo-note" :maxlength="mpSim.input.maxlength" :invalid="mpSim.input.invalid" :disabled="mpSim.input.disabled" />
    </MpFormField>
  </main>
</template>
