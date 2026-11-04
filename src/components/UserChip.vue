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

<style scoped>
.mw-user-chip {
  --mw-user-chip-h: calc(var(--control-h) - var(--space-1));
  --mw-user-chip-avatar: calc(var(--control-h) - var(--space-3));
  display: inline-flex;
  align-items: center;
  min-width: 0;
  vertical-align: baseline;
  color: var(--text-accent);
  text-decoration: none;
  line-height: inherit;
}

.mw-user-chip--interactive {
  cursor: pointer;
}

.mw-user-chip__text,
.mw-user-chip__person-name {
  color: inherit;
  font-weight: var(--weight-medium);
  transition: color var(--duration-fast) var(--ease-standard);
}

.mw-user-chip--interactive:hover :is(.mw-user-chip__text, .mw-user-chip__person-name),
.mw-user-chip--interactive:focus-visible :is(.mw-user-chip__text, .mw-user-chip__person-name) {
  text-decoration: underline;
  text-decoration-thickness: 1px;
  text-underline-offset: 0.16em;
}

.mw-user-chip__tag {
  gap: var(--space-1-5);
  height: var(--mw-user-chip-h);
  padding-inline: var(--space-1) calc(var(--control-px) - var(--space-0-5));
  overflow: hidden;
  font-size: var(--control-font);
  font-weight: var(--weight-medium);
  line-height: 1;
}

.mw-user-chip--interactive:hover .mw-user-chip__tag {
  background-color: var(--accent-subtle-hover);
}

.mw-user-chip--interactive:hover .mw-user-chip__avatar {
  background-color: var(--accent-border);
}

.mw-user-chip__avatar,
.mw-user-chip__person-avatar,
.mw-user-chip__avatar-only {
  flex: 0 0 auto;
  --mw-avatar-size: var(--mw-user-chip-avatar);
  background-color: var(--accent-subtle-hover);
  color: var(--text-accent);
  font-size: calc(var(--control-font) * 0.86);
}

.mw-user-chip__avatar-only {
  --mw-avatar-size: var(--mw-user-chip-h);
}

.mw-user-chip__person {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1-5);
  min-width: 0;
  font-size: var(--control-font);
}

.mw-user-chip__person-name {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  line-height: var(--type-body-sm-line);
}

.mw-user-chip:focus-visible {
  outline: var(--focus-width) solid var(--focus-color);
  outline-offset: var(--focus-offset);
  border-radius: var(--radius-xs);
}

@media (prefers-reduced-motion: reduce) {
  .mw-user-chip__text,
  .mw-user-chip__person-name {
    transition: none;
  }
}
</style>
