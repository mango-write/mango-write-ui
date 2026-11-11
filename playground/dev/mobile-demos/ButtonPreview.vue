<script setup lang="ts">
import { MpButton, MpCellGroup, MpIcon, MpPageHeader } from "@mango-write/ui-mp";
import { mpSim } from "./state";
import { t } from "../i18n";
</script>

<template>
  <main class="mp-preview__scroll mp-preview__pad">
    <MpPageHeader :title="t({ zh: '按钮', en: 'Action buttons' })" :description="t({ zh: '每个区域一个主动作，目标不小于 44px。', en: 'One primary action per region, targets at least 44px.' })" />
    <MpCellGroup :title="t({ zh: '当前配置', en: 'Current configuration' })">
      <div class="mp-preview__stack">
        <MpButton :label="mpSim.button.label" :variant="mpSim.button.variant" :severity="mpSim.button.severity" :size="mpSim.button.size" :block="mpSim.button.block" :disabled="mpSim.button.disabled" :loading="mpSim.button.loading" />
      </div>
    </MpCellGroup>
    <MpCellGroup :title="t({ zh: '三档交互尺寸', en: 'Three interactive sizes' })">
      <div class="mp-preview__row"><MpButton size="sm" variant="tinted" severity="secondary" label="sm · 36" /><MpButton size="md" label="md · 44" /><MpButton size="lg" label="lg · 48" /></div>
    </MpCellGroup>
    <MpCellGroup :title="t({ zh: '图标动作', en: 'Icon action' })">
      <MpButton icon-only variant="tinted" severity="secondary" :aria-label="t({ zh: '新建', en: 'Create' })"><MpIcon name="plus" :size="24" /></MpButton>
    </MpCellGroup>
  </main>
</template>
