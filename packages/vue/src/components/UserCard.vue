<script setup lang="ts">
import { Mail } from "lucide-vue-next";
import Avatar from "./Avatar.vue";
import Tag from "./Tag.vue";
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
        :size="size === 'large' ? 'xlarge' : 'lg'"
        class="mw-user-card__avatar"
      />
      <div class="mw-user-card__identity">
        <div class="mw-user-card__name-line">
          <strong class="mw-user-card__name">{{ displayName }}</strong>
          <Tag v-if="user.badge" severity="primary" rounded class="mw-user-card__badge-tag mw-size-xs">{{ user.badge }}</Tag>
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
      <Mail class="mw-user-card__detail-icon" aria-hidden="true" />
      <span class="mw-user-card__email">{{ user.email }}</span>
    </div>
    <p v-if="user.description" class="mw-user-card__description">{{ user.description }}</p>
    <slot name="card" :user="user" />
  </div>
</template>

<style scoped>
.mw-user-card {
  box-sizing: border-box;
  padding: var(--space-3);
  color: var(--text-primary);
  font-family: var(--font-sans);
}

.mw-user-card--large {
  width: auto;
  padding: var(--space-1) var(--space-1) var(--space-1) 0;
}

.mw-user-card__head {
  display: flex;
  align-items: center;
  gap: var(--space-2-5);
}

.mw-user-card__avatar {
  flex: 0 0 auto;
  --mw-avatar-size: calc(var(--size-md-h) + var(--space-1));
  background-color: var(--accent-subtle-hover);
  color: var(--text-accent);
}

.mw-user-card--large .mw-user-card__avatar {
  --mw-avatar-size: var(--space-12);
}

.mw-user-card__identity {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: var(--space-0-5);
}

.mw-user-card__name-line,
.mw-user-card__id-line {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: var(--space-1-5);
}

.mw-user-card__name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: var(--type-title-sm-size);
  font-weight: var(--weight-semibold);
  line-height: var(--type-title-sm-line);
}

.mw-user-card--large .mw-user-card__name {
  font-size: var(--type-title-size);
  line-height: var(--type-title-line);
}

.mw-user-card__badge-tag {
  flex: 0 0 auto;
}

.mw-user-card__id {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--text-tertiary);
  font-family: var(--font-mono);
  font-size: var(--type-caption-size);
  line-height: var(--type-caption-line);
}

.mw-user-card__role,
.mw-user-card__detail,
.mw-user-card__description {
  margin-top: var(--space-2-5);
  color: var(--text-secondary);
  font-size: var(--type-caption-size);
  line-height: var(--type-caption-line);
}

.mw-user-card__detail {
  display: flex;
  align-items: center;
  gap: var(--space-1-5);
}

.mw-user-card__detail-icon {
  flex: 0 0 auto;
  width: var(--icon-xs);
  height: var(--icon-xs);
  color: var(--text-tertiary);
  font-size: var(--icon-xs);
}

.mw-user-card__email {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.mw-user-card__description {
  margin-bottom: 0;
}
</style>
