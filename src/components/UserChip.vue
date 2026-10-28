<script setup lang="ts">
import Avatar from "primevue/avatar";
import Tag from "primevue/tag";
import { computed } from "vue";
import HoverCard from "./HoverCard.vue";
import UserCard, { type UserProfile } from "./UserCard.vue";

defineOptions({ inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    user: UserProfile;
    variant?: "text" | "tag" | "avatar" | "person";
    size?: "small" | "medium" | "large";
    showCard?: boolean;
    href?: string | null;
  }>(),
  { variant: "text", size: "medium", showCard: true, href: null },
);

const displayName = computed(() => props.user.name.trim());
const initials = computed(() => displayName.value.slice(0, 1).toUpperCase());
const isLink = computed(() => Boolean(props.href));
const sizeClass = computed(() => `mw-user-chip--size-${props.size}`);
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
      <Tag v-else severity="secondary" class="mw-user-chip__tag">
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
  display: inline-flex;
  align-items: center;
  vertical-align: baseline;
  color: var(--color-brand-700);
  /* RouterLink 分支是 <a>：链接下划线/配色交给上面的 interactive 态，不吃 UA 默认 */
  text-decoration: none;
  line-height: inherit;
  /* 作为 flex 子项时允许收缩，名字走省略，头像由 flex: 0 0 auto 保圆径 */
  min-width: 0;
}

.mw-user-chip--interactive {
  cursor: pointer;
}

.mw-user-chip__text {
  color: inherit;
  font-weight: 500;
  transition: color var(--motion-duration-fast) var(--motion-ease-standard);
}

.mw-user-chip--interactive:hover .mw-user-chip__text,
.mw-user-chip--interactive:focus-visible .mw-user-chip__text {
  color: var(--color-brand-600);
  text-decoration: underline;
  text-decoration-thickness: 1px;
  text-underline-offset: 0.16em;
}

:deep(.p-tag.mw-user-chip__tag) {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  height: var(--mw-user-chip-tag-size, 1.75rem);
  padding: 0 0.625rem 0 var(--mw-user-chip-tag-avatar-padding, 0.25rem);
  border: 0;
  border-radius: var(--radius-pill);
  overflow: hidden;
  background: var(--color-brand-50);
  color: var(--color-brand-700);
  font-size: var(--mw-user-chip-tag-font-size, 0.8125rem);
  font-weight: 600;
  line-height: 1;
}

:deep(.p-avatar.mw-user-chip__avatar) {
  flex: 0 0 auto;
  width: var(--mw-user-chip-tag-avatar-size, 1.25rem);
  height: var(--mw-user-chip-tag-avatar-size, 1.25rem);
  background: var(--color-brand-100);
  color: var(--color-brand-700);
  border-radius: 50%;
  font-size: calc(var(--mw-user-chip-tag-font-size, 0.8125rem) * 0.86);
}

.mw-user-chip--size-small {
  --mw-user-chip-tag-size: 1.5rem;
  --mw-user-chip-tag-avatar-size: 1rem;
  --mw-user-chip-tag-avatar-padding: 0.25rem;
  --mw-user-chip-tag-font-size: 0.75rem;
  --mw-user-chip-person-avatar-size: 1rem;
  --mw-user-chip-person-font-size: 0.75rem;
}

.mw-user-chip--size-medium {
  --mw-user-chip-tag-size: 1.75rem;
  --mw-user-chip-tag-avatar-size: 1.25rem;
  --mw-user-chip-tag-avatar-padding: 0.25rem;
  --mw-user-chip-tag-font-size: 0.8125rem;
  --mw-user-chip-person-avatar-size: 1.25rem;
  --mw-user-chip-person-font-size: 0.8125rem;
}

.mw-user-chip--size-large {
  --mw-user-chip-tag-size: 2.125rem;
  --mw-user-chip-tag-avatar-size: 1.625rem;
  --mw-user-chip-tag-avatar-padding: 0.25rem;
  --mw-user-chip-tag-font-size: 0.875rem;
  --mw-user-chip-person-avatar-size: 1.625rem;
  --mw-user-chip-person-font-size: 0.875rem;
}

/* 纯头像变体用 Tag 的整档高度当圆径，三档尺寸才与 tag 视觉同阶（tag 内嵌头像
   比整档小，是因为 chip 有 padding；独立圆头像没有这层包裹）。 */
:deep(.p-avatar.mw-user-chip__avatar-only) {
  flex: 0 0 auto;
  width: var(--mw-user-chip-tag-size, 1.75rem);
  height: var(--mw-user-chip-tag-size, 1.75rem);
  background: var(--color-brand-100);
  color: var(--color-brand-700);
  border-radius: 50%;
  font-size: calc(var(--mw-user-chip-tag-font-size, 0.8125rem) * 0.86);
}

/* person 变体：头像 + 用户名行内展示，无 pill。头像固定圆径且不随 flex 压缩
   （flex: 0 0 auto），行内 flex 里被挤瘪头像会变成椭圆。 */
.mw-user-chip__person {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  min-width: 0;
}

:deep(.p-avatar.mw-user-chip__person-avatar) {
  flex: 0 0 auto;
  width: var(--mw-user-chip-person-avatar-size, 1.25rem);
  height: var(--mw-user-chip-person-avatar-size, 1.25rem);
  background: var(--color-brand-100);
  color: var(--color-brand-700);
  border-radius: 50%;
  font-size: calc(var(--mw-user-chip-person-font-size, 0.8125rem) * 0.86);
}

.mw-user-chip__person-name {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--color-brand-700);
  font-weight: 500;
  line-height: 1.4;
  transition: color var(--motion-duration-fast) var(--motion-ease-standard);
}

.mw-user-chip--interactive:hover .mw-user-chip__person-name,
.mw-user-chip--interactive:focus-visible .mw-user-chip__person-name {
  color: var(--color-brand-600);
  text-decoration: underline;
  text-decoration-thickness: 1px;
  text-underline-offset: 0.16em;
}

.mw-user-chip:focus-visible {
  outline: 0;
  border-radius: var(--radius-sm);
  box-shadow: var(--effect-focus-ring);
}

@media (prefers-reduced-motion: reduce) {
  .mw-user-chip__text {
    transition: none;
  }
}
</style>
