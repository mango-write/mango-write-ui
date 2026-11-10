<script setup lang="ts">
import { computed } from "vue";
import { InputNumber, ToggleSwitch } from "@mango-write/ui-vue";
import MpDocPage from "../../kit/MpDocPage.vue";
import { mobileApi } from "../../mobile-demos/api";
import { mpSim } from "../../mobile-demos/state";
import { t } from "../../i18n";

const code = computed(() =>
  t({
    zh: `<MpSearchBar v-model="query"${mpSim.input.clearable ? " clearable" : ' :clearable="false"'} @search="onSearch" />
<MpFormField input-id="title" label="研究标题" required>
  <template #default="{ inputId, describedBy, invalid, required }">
    <MpInput v-model="title" :input-id="inputId" :aria-describedby="describedBy" :invalid="invalid" :required="required"${mpSim.input.clearable ? " clearable" : ""} />
  </template>
</MpFormField>`,
    en: `<MpSearchBar v-model="query"${mpSim.input.clearable ? " clearable" : ' :clearable="false"'} @search="onSearch" />
<MpFormField input-id="title" label="Research title" required>
  <template #default="{ inputId, describedBy, invalid, required }">
    <MpInput v-model="title" :input-id="inputId" :aria-describedby="describedBy" :invalid="invalid" :required="required"${mpSim.input.clearable ? " clearable" : ""} />
  </template>
</MpFormField>`,
  }),
);
</script>

<template>
  <MpDocPage slug="input" :code="code" :api="mobileApi.input" :guidelines="[
    { kind: 'do', zh: '<strong>凹陷输入底面</strong>：输入框默认采用 --bg-sunken 凹陷底色与发丝边，聚焦时升起为 --bg-raised 并显示品牌外环。', en: '<strong>Sunken field surface</strong>: inputs use --bg-sunken with a hairline border and elevate to --bg-raised on focus.' },
    { kind: 'do', zh: '<strong>无障碍关联</strong>：通过 MpFormField 将 label、提示与错误消息关联到真实输入控件。', en: '<strong>Accessible association</strong>: connect labels, hints, and errors to the input via MpFormField.' },
    { kind: 'dont', zh: '不用 placeholder 代替表单标签；中文输入法组合阶段（composition）不提前触发搜索提交。', en: 'Never replace labels with placeholders; IME composition must not trigger early search submission.' },
  ]">
    <div class="mp-field">
      <div class="mp-field__head"><span class="mp-field__label">{{ t({ zh: "可一键清空", en: "Clearable" }) }}</span><code class="mp-field__prop">clearable</code></div>
      <ToggleSwitch v-model="mpSim.input.clearable" />
    </div>
    <div class="mp-field">
      <div class="mp-field__head"><span class="mp-field__label">{{ t({ zh: "错误校验态", en: "Invalid" }) }}</span><code class="mp-field__prop">invalid</code></div>
      <ToggleSwitch v-model="mpSim.input.invalid" />
    </div>
    <div class="mp-field">
      <div class="mp-field__head"><span class="mp-field__label">{{ t({ zh: "禁用", en: "Disabled" }) }}</span><code class="mp-field__prop">disabled</code></div>
      <ToggleSwitch v-model="mpSim.input.disabled" />
    </div>
    <div class="mp-field">
      <div class="mp-field__head"><span class="mp-field__label">{{ t({ zh: "最大字数限制", en: "Max length" }) }}</span><code class="mp-field__prop">maxlength</code></div>
      <InputNumber size="sm" fluid :model-value="mpSim.input.maxlength" :min="50" :max="1000" @update:model-value="mpSim.input.maxlength = $event ?? 300" />
    </div>
  </MpDocPage>
</template>
