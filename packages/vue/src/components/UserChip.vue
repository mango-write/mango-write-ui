<script setup lang="ts">
import Avatar from "./Avatar.vue";
import Tag from "./Tag.vue";
import { computed } from "vue";
import HoverCard from "./HoverCard.vue";
import UserCard, { type UserProfile } from "./UserCard.vue";

defineOptions({ inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    user: UserProfile;
    variant?: "text" | "tag" | "avatar" | "person";
    size?: "xs" | "sm" | "md" | "lg" | "small" | "medium" | "large";
    showCard?: boolean;
    href?: string | null;
  }>(),
  { variant: "text", size: undefined, showCard: true, href: null },
);

const displayName = computed(() => props.user.name.trim());
const initials = computed(() => displayName.value.slice(0, 1).toUpperCase());
const isLink = computed(() => Boolean(props.href));
const resolvedSize = computed(() => {
  if (props.size === "small" || props.size === "sm") return "sm";
  if (props.size === "medium" || props.size === "md") return "md";
  if (props.size === "large" || props.size === "lg") return "lg";
  if (props.size === "xs") return "xs";
  return undefined;
});
const sizeClass = computed(() =>
  props.size ? [`mw-user-chip--size-${props.size}`, `mw-size-${resolvedSize.value}`] : undefined,
);
</script>

<template>
  <HoverCard :disabled="!showCard" :label="user.name" :focusable="false">
    <component
      :is="isLink ? 'a' : 'span'"
      v-bind="$attrs"
      class="mw-user-chip"
      :href="href || undefined"
      :class="[
        `mw-user-chip--${variant}`,
        { 'mw-user-chip--interactive': showCard || isLink },
        variant !== 'text' && sizeClass,
      ]"
      :tabindex="!isLink && showCard ? 0 : undefined"
      :aria-label="variant === 'avatar' ? user.name : undefined"
    >
      <span v-if="variant === 'text'" class="mw-user-chip__text">@{{ displayName }}</span>
      <Avatar
        v-else-if="variant === 'avatar'"
        :image="user.avatar || undefined"
        :label="user.avatar ? undefined : initials"
        shape="circle"
        class="mw-user-chip__avatar-only"
      />
      <span v-else-if="variant === 'person'" class="mw-user-chip__person">
        <Avatar
          :image="user.avatar || undefined"
          :label="user.avatar ? undefined : initials"
          shape="circle"
          class="mw-user-chip__person-avatar"
        />
        <span class="mw-user-chip__person-name">{{ displayName }}</span>
      </span>
      <Tag v-else severity="primary" rounded class="mw-user-chip__tag">
        <Avatar
          :image="user.avatar || undefined"
          :label="user.avatar ? undefined : initials"
          shape="circle"
          class="mw-user-chip__avatar"
        />
        <span>{{ displayName }}</span>
      </Tag>
    </component>

    <template #content>
      <UserCard :user="user">
        <template #id-actions><slot name="id-actions" /></template>
        <template #card="slotProps"><slot name="card" :user="slotProps.user" /></template>
      </UserCard>
    </template>
  </HoverCard>
</template>
