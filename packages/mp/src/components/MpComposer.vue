<script setup lang="ts">
import { useAttrs } from "vue";
import MpBottomActionBar from "./MpBottomActionBar.vue";
import MpButton from "./MpButton.vue";
import MpIcon from "./MpIcon.vue";
import MpInput from "./MpInput.vue";

defineOptions({
  name: "MwMpComposer",
  inheritAttrs: true,
  options: { styleIsolation: "shared", virtualHost: false },
} as any);
const attrs = useAttrs();

export interface MpComposerProps {
  modelValue?: string;
  placeholder?: string;
  sendLabel?: string;
  disabled?: boolean;
  loading?: boolean;
  offsetBottom?: string;
  contained?: boolean;
  inputTestid?: string;
  submitTestid?: string;
}

const props = withDefaults(defineProps<MpComposerProps>(), {
  modelValue: "",
  placeholder: "输入消息…",
  sendLabel: "发送",
  disabled: false,
  loading: false,
  offsetBottom: undefined,
  contained: false,
  inputTestid: "mp-composer-input",
  submitTestid: "mp-composer-submit",
});
const emit = defineEmits<{
  "update:modelValue": [value: string];
  submit: [value: string];
}>();

function submit(): void {
  const value = props.modelValue.trim();
  if (!value || props.disabled || props.loading) return;
  emit("submit", value);
}
</script>

<template>
  <MpBottomActionBar
    :data-testid="attrs['data-testid']"
    :offset-bottom="offsetBottom"
    :contained="contained"
    class="mw-mp-composer"
  >
    <MpInput
      :model-value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      aria-label="消息内容"
      :data-testid="inputTestid"
      @update:model-value="emit('update:modelValue', $event)"
      @enter="submit"
    />
    <MpButton
      icon-only
      :disabled="disabled || !modelValue.trim()"
      :loading="loading"
      :aria-label="sendLabel"
      :data-testid="submitTestid"
      @click="submit"
    >
      <MpIcon v-if="!loading" name="send" :size="22" />
    </MpButton>
  </MpBottomActionBar>
</template>
