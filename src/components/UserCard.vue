<script setup lang="ts">
import Avatar from "primevue/avatar";
import Tag from "primevue/tag";
import { computed } from "vue";

export interface UserProfile {
  id?: string | null;
  handle?: string | null;
  name: string;
  avatar?: string | null;
  email?: string | null;
  badge?: string | null;
  role?: string | null;
  description?: string | null;
}

const props = withDefaults(
  defineProps<{
    user: UserProfile;
    size?: "medium" | "large";
  }>(),
  { size: "medium" },
);

const displayName = computed(() => props.user.name.trim());
const initials = computed(() => displayName.value.slice(0, 1).toUpperCase());
const displayedId = computed(() => props.user.handle ?? props.user.id ?? null);
</script>

<template>
  <div class="mw-user-card" :class="{ 'mw-user-card--large': size === 'large' }">
    <div class="mw-user-card__head">
      <Avatar
        :image="user.avatar || undefined"
        :label="user.avatar ? undefined : initials"
        shape="circle"
        size="large"
        class="mw-user-card__avatar"
      />
      <div class="mw-user-card__identity">
        <div class="mw-user-card__name-line">
          <strong class="mw-user-card__name">{{ displayName }}</strong>
          <Tag v-if="user.badge" class="mw-user-card__badge-tag">{{ user.badge }}</Tag>
          <slot name="name-actions" />
        </div>
        <div v-if="displayedId" class="mw-user-card__id-line">
          <span class="mw-user-card__id">{{ displayedId }}</span>
          <slot name="id-actions" />
        </div>
      </div>
    </div>

    <div v-if="user.role" class="mw-user-card__role">{{ user.role }}</div>
    <div v-if="user.email" class="mw-user-card__detail">
      <i class="pi pi-envelope" aria-hidden="true" />
      <span class="mw-user-card__email">{{ user.email }}</span>
    </div>
    <p v-if="user.description" class="mw-user-card__description">{{ user.description }}</p>
    <slot name="card" :user="user" />
  </div>
</template>

<style scoped>
.mw-user-card {
  padding: 0.75rem;
  color: var(--color-text-primary);
}

.mw-user-card--medium {
  width: 16rem;
}

.mw-user-card--large {
  width: auto;
  padding: 0.25rem 0.25rem 0.25rem 0;
}

.mw-user-card-head {
  display: flex;
  align-items: center;
  gap: 0.625rem;
}

:deep(.p-avatar.mw-user-card-avatar) {
  flex: 0 0 auto;
  width: 2.25rem;
  height: 2.25rem;
  background: var(--color-brand-100);
  color: var(--color-brand-700);
  font-size: 0.9rem;
}

.mw-user-card--large :deep(.p-avatar.mw-user-card-avatar) {
  width: 3.25rem;
  height: 3.25rem;
  font-size: 1.25rem;
}

.mw-user-card__identity {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 0.125rem;
}

.mw-user-card__name-line {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 0.375rem;
}

.mw-user-card__name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 0.875rem;
  line-height: 1.35;
}

.mw-user-card--large .mw-user-card__name {
  font-size: 1rem;
}

:deep(.p-tag.mw-user-card__badge-tag) {
  flex: 0 0 auto;
  padding: 0.1rem 0.45rem;
  background: var(--color-brand-100);
  border: 1px solid var(--color-brand-300);
  border-radius: var(--radius-pill);
  color: var(--color-brand-700);
  font-size: 0.6875rem;
  font-weight: 500;
  line-height: 1.2;
}

.mw-user-card__id-line {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 0.375rem;
}

.mw-user-card__id {
  font-family: var(--font-family-mono);
  font-size: 0.72rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.mw-user-card__role {
  margin-top: 0.625rem;
  font-size: 0.75rem;
  color: var(--color-text-secondary);
}

.mw-user-card__detail,
.mw-user-card__description {
  color: var(--color-text-secondary);
  font-size: 0.75rem;
  line-height: 1.5;
}

.mw-user-card__detail {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  margin-top: 0.625rem;
}

.mw-user-card__detail .pi {
  flex: 0 0 auto;
  color: var(--color-brand-600);
  font-size: 0.7rem;
}

.mw-user-card__description {
  margin: 0.625rem 0 0;
  color: var(--color-text-tertiary);
}
</style>
