<script setup lang="ts">
import { MpButton, MpIcon, MpPageHeader, MpSectionHeader } from "@mango-write/ui-mp";
import { mpSim } from "./state";
import { t } from "../i18n";
</script>

<template>
  <main class="mp-preview__scroll mp-preview__pad">
    <MpPageHeader
      :title="t({ zh: '按钮', en: 'Action buttons' })"
      :description="t({ zh: '与桌面端共享 filled / tinted / outlined / text 变体与动作语义。', en: 'Shares filled / tinted / outlined / text variants and severities with desktop.' })"
    />
    <MpSectionHeader :title="t({ zh: '当前配置', en: 'Current configuration' })" />
    <div class="mp-preview__specimen">
      <MpButton
        :label="mpSim.button.label"
        :variant="mpSim.button.variant"
        :severity="mpSim.button.severity"
        :size="mpSim.button.size"
        :fluid="mpSim.button.fluid"
        :disabled="mpSim.button.disabled"
        :loading="mpSim.button.loading"
      />
    </div>
    <MpSectionHeader :title="t({ zh: '变体与语义', en: 'Variants & severities' })" />
    <div class="mp-preview__row">
      <MpButton size="sm" :label="t({ zh: '主操作', en: 'Primary' })" />
      <MpButton size="sm" severity="secondary" :label="t({ zh: '次操作', en: 'Secondary' })" />
      <MpButton size="sm" variant="tinted" :label="t({ zh: '着色', en: 'Tinted' })" />
      <MpButton size="sm" variant="outlined" severity="secondary" :label="t({ zh: '描边', en: 'Outlined' })" />
      <MpButton size="sm" variant="text" severity="secondary" :label="t({ zh: '幽灵', en: 'Text' })" />
      <MpButton size="sm" severity="danger" :label="t({ zh: '危险', en: 'Danger' })" />
      <MpButton size="sm" severity="contrast" :label="t({ zh: '反色', en: 'Contrast' })" />
    </div>
    <MpSectionHeader :title="t({ zh: '三档交互尺寸', en: 'Three interactive sizes' })" />
    <div class="mp-preview__row">
      <MpButton size="sm" variant="tinted" severity="secondary" label="sm · 36" />
      <MpButton size="md" label="md · 44" />
      <MpButton size="lg" label="lg · 48" />
    </div>
    <MpSectionHeader :title="t({ zh: '图标动作', en: 'Icon action' })" />
    <div class="mp-preview__row">
      <MpButton icon-only :aria-label="t({ zh: '新建', en: 'Create' })"><MpIcon name="plus" :size="22" /></MpButton>
      <MpButton icon-only severity="secondary" :aria-label="t({ zh: '搜索', en: 'Search' })"><MpIcon name="search" :size="20" /></MpButton>
      <MpButton icon-only variant="tinted" severity="secondary" :aria-label="t({ zh: '更多', en: 'More' })"><MpIcon name="grid" :size="20" /></MpButton>
    </div>
  </main>
</template>
