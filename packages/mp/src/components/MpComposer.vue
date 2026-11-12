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
  inline?: boolean;
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
  inline: false,
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
  <div
    v-if="inline"
    :data-testid="attrs['data-testid']"
    class="mw-mp-composer mw-mp-composer--inline mw-frost"
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
      size="md"
      class="mw-mp-composer__send"
      :disabled="disabled || !modelValue.trim()"
      :loading="loading"
      :aria-label="sendLabel"
      :data-testid="submitTestid"
      @click="submit"
    >
      <MpIcon v-if="!loading" name="send" :size="20" />
    </MpButton>
  </div>
  <MpBottomActionBar
    v-else
    :data-testid="attrs['data-testid']"
    :offset-bottom="offsetBottom"
    :contained="contained"
  >
    <div class="mw-mp-composer mw-frost">
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
        size="md"
        class="mw-mp-composer__send"
        :disabled="disabled || !modelValue.trim()"
        :loading="loading"
        :aria-label="sendLabel"
        :data-testid="submitTestid"
        @click="submit"
      >
        <MpIcon v-if="!loading" name="send" :size="20" />
      </MpButton>
    </div>
  </MpBottomActionBar>
</template>
