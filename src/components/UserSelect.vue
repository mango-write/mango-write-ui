<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import SearchableMultiSelect from "./SearchableMultiSelect.vue";
import UserChip from "./UserChip.vue";
import type { UserSelectOption } from "./user-select";

const props = defineProps<{
  modelValue: string[];
  users: UserSelectOption[];
  placeholder?: string;
  disabled?: boolean;
  emptyMessage?: string;
}>();
const emit = defineEmits<{ (e: "update:modelValue", value: string[]): void }>();
const { t } = useI18n();

const placeholderText = computed(() => props.placeholder ?? t("common.userSelect.placeholder"));
const emptyMessageText = computed(() => props.emptyMessage ?? t("common.userSelect.empty"));

function asUser(option: Record<string, unknown>): UserSelectOption {
  return option as unknown as UserSelectOption;
}

function filterUser(option: Record<string, unknown>, query: string): boolean {
  const user = asUser(option);
  return user.name.toLowerCase().includes(query) || (user.email ?? "").toLowerCase().includes(query);
}

function onUpdate(value: unknown[]) {
  emit("update:modelValue", value as string[]);
}
</script>

<template>
  <SearchableMultiSelect
    :model-value="modelValue"
    :options="users"
    option-label="name"
    option-value="id"
    :option-filter="filterUser"
    :placeholder="placeholderText"
    :disabled="disabled"
    :empty-message="emptyMessageText"
    @update:model-value="onUpdate"
  >
    <template #chip="{ option, remove }">
      <span class="mw-user-select__chip">
        <UserChip :user="asUser(option)" variant="tag" :show-card="false" />
        <i class="pi pi-times mw-user-select__remove" @mousedown.stop.prevent="remove()" />
      </span>
    </template>
    <template #option="{ option }">
      <span class="tw:flex tw:items-center tw:gap-2 tw:min-w-0">
        <UserChip :user="asUser(option)" variant="avatar" :show-card="false" class="tw:shrink-0" />
        <span class="tw:truncate">{{ asUser(option).name }}</span>
        <span v-if="asUser(option).email" class="tw:truncate tw:text-muted tw:text-xs">{{ asUser(option).email }}</span>
      </span>
    </template>
  </SearchableMultiSelect>
</template>

<style scoped>
.mw-user-select__chip {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  max-width: 100%;
}
.mw-user-select__remove {
  flex-shrink: 0;
  color: var(--color-text-tertiary);
  font-size: 0.75rem;
  cursor: pointer;
  border-radius: var(--radius-pill);
  transition: color 0.15s;
}
.mw-user-select__remove:hover {
  color: var(--color-text-primary);
}
</style>
