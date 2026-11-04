<script setup lang="ts">
defineProps<{ title: string; desc?: string; id?: string }>();
</script>

<template>
  <section :id="id" class="doc-section">
    <h2 class="doc-section__title">{{ title }}</h2>
    <p v-if="desc" class="doc-section__desc">{{ desc }}</p>
    <div class="doc-section__body">
      <slot />
    </div>
  </section>
</template>
