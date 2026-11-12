<script setup lang="ts">
import { MpCell, MpCellGroup, MpIcon, MpPageHeader, MpSectionHeader, type MpIconName } from "@mango-write/ui-mp";
import { demoText } from "./content";
import { t } from "../i18n";

const icons: MpIconName[] = ["journal", "library", "assistant", "search", "send", "quote", "success", "warning", "error", "attachment"];
</script>

<template>
  <main class="mp-preview__scroll mp-preview__pad">
    <MpPageHeader :title="t({ zh: '移动基础', en: 'Mobile foundations' })" :description="t({ zh: '同一语义令牌驱动 H5 与小程序。', en: 'One semantic token system for H5 and Mini Programs.' })" />
    <MpSectionHeader :title="t({ zh: '统一矢量图标', en: 'Unified vector icons' })" />
    <div class="mp-icon-grid">
      <span v-for="icon in icons" :key="icon"><MpIcon :name="icon" :size="24" /><small>{{ icon }}</small></span>
    </div>
    <MpCellGroup :title="t({ zh: '纸卡标本', en: 'Paper card specimen' })">
      <MpCell :title="demoText.title" :subtitle="demoText.subtitle" :meta="t({ zh: '15px 标题 · 44px 最小触控', en: '15px title · 44px minimum target' })" clickable arrow />
    </MpCellGroup>
  </main>
</template>
