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
