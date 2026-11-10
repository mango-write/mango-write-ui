<script setup lang="ts">
import MpIcon from "./MpIcon.vue";

defineOptions({
  name: "MwMpCell",
  inheritAttrs: true,
  options: { styleIsolation: "shared", virtualHost: false },
} as any);

export interface MpCellProps {
  title: string;
  subtitle?: string;
  meta?: string;
  value?: string;
  clickable?: boolean;
  selectable?: boolean;
  selected?: boolean;
  disabled?: boolean;
  arrow?: boolean;
  dataTestid?: string;
}

const props = withDefaults(defineProps<MpCellProps>(), {
  subtitle: undefined,
  meta: undefined,
  value: undefined,
  clickable: false,
  selectable: false,
  selected: false,
  disabled: false,
  arrow: false,
  dataTestid: undefined,
});
const emit = defineEmits<{ click: [event: MouseEvent | KeyboardEvent] }>();

function onClick(event: MouseEvent | KeyboardEvent): void {
  if ((!props.clickable && !props.selectable) || props.disabled) return;
  emit("click", event);
}
</script>

<template>
  <div
    :data-testid="dataTestid || ($attrs['data-testid'] as string | undefined)"
    :role="selectable ? 'option' : clickable ? 'button' : undefined"
    :tabindex="(clickable || selectable) && !disabled ? 0 : undefined"
    :aria-disabled="(clickable || selectable) && disabled ? 'true' : undefined"
    :aria-selected="selectable ? (selected ? 'true' : 'false') : undefined"
    :hover-class="(clickable || selectable) && !disabled ? 'is-pressed' : 'none'"
    class="mw-mp-cell"
    :class="{
      'mw-mp-cell--clickable': (clickable || selectable) && !disabled,
      'mw-mp-cell--selected is-selected': selected,
      'mw-mp-cell--with-lead': Boolean($slots.lead),
      'is-disabled': disabled,
    }"
    @click="onClick"
    @keydown.enter.prevent="onClick"
    @keyup.space.prevent="onClick"
  >
    <div v-if="$slots.lead" class="mw-mp-cell__lead"><slot name="lead" /></div>
    <div class="mw-mp-cell__body">
      <div class="mw-mp-cell__title-row">
        <span class="mw-mp-cell__title">{{ title }}</span>
        <slot name="title-extra" />
      </div>
      <div v-if="subtitle" class="mw-mp-cell__subtitle">{{ subtitle }}</div>
      <div v-if="meta || $slots.meta" class="mw-mp-cell__meta">
        <slot name="meta"><span>{{ meta }}</span></slot>
      </div>
    </div>
    <div v-if="value || arrow || selected || $slots.end" class="mw-mp-cell__end">
      <slot name="end">
        <span v-if="value" class="mw-mp-cell__value">{{ value }}</span>
        <MpIcon v-if="selected" name="check" :size="22" />
        <MpIcon v-else-if="arrow" name="chevron-right" :size="20" />
      </slot>
    </div>
  </div>
</template>
