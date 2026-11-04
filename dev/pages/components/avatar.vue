<script setup lang="ts">
import { Bot, Building2, User, Users } from "lucide-vue-next";
import { Avatar } from "../../../src";
import DocPage from "../../kit/DocPage.vue";
import DocSection from "../../kit/DocSection.vue";
import Specimen from "../../kit/Specimen.vue";
import StateGrid from "../../kit/StateGrid.vue";
import StateRow from "../../kit/StateRow.vue";

const portraitSvg =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#d96b27"/><stop offset="100%" stop-color="#9e3d12"/></linearGradient></defs><rect width="96" height="96" fill="url(#g)"/><circle cx="48" cy="36" r="16" fill="#fff3eb"/><path d="M20 84c4-16 16-24 28-24s24 8 28 24" fill="#fff3eb"/></svg>',
  );

const sizes = [
  { label: "xs", value: "xs" },
  { label: "sm", value: "sm" },
  { label: "md", value: "md" },
  { label: "lg", value: "lg" },
  { label: "xlarge", value: "xlarge" },
] as const;
</script>

<template>
  <DocPage lead="头像（Avatar）：代表用户、团队空间或 AI 助手的视觉标识。支持图像、首字母缩略与图标三种载体，图像加载失败时自动优雅降级。">
    <DocSection title="何时使用">
      <ul class="doc-rules">
        <li data-kind="do">个人用户与协作者统一使用圆形（<code>shape="circle"</code>）；团队空间、工作区或应用实体使用方形（<code>shape="square"</code>）。</li>
        <li data-kind="do">同时传入 <code>image</code> 与 <code>label</code>（或 <code>icon</code>），以便在图片地址失效时自动回退到首字母或图标。</li>
        <li data-kind="dont">需要行内提及并悬停展示用户资料卡时，不要手拼 <code>Avatar + 文本</code>，请直接用 <code>UserChip</code>。</li>
        <li data-kind="dont"><code>label</code> 仅放 1–2 个字符（中文单字或英文首字母缩写），不放完整姓名。</li>
      </ul>
    </DocSection>

    <DocSection title="底面" desc="纸面与霜面并排。无图像时使用 --fill-strong 填充底与次级文字色，在两类底面上都具备清晰边界。">
      <Specimen :surfaces="['paper', 'frost']">
        <Avatar :image="portraitSvg" label="林" shape="circle" aria-label="林知远" />
        <Avatar label="沈" shape="circle" aria-label="沈墨" />
        <Avatar :icon="User" shape="circle" aria-label="匿名审稿人" />
        <Avatar label="NLP" shape="square" aria-label="NLP 课题组" />
        <Avatar :icon="Bot" shape="square" aria-label="科研助手" />
      </Specimen>
    </DocSection>

    <DocSection title="尺寸" desc="xs / sm / md / lg / xlarge 五档，默认跟随密度上下文。方形头像圆角随尺寸档位同心缩放。">
      <Specimen themes="single" layout="stack">
        <div v-for="s in sizes" :key="s.value" class="doc-row">
          <span class="doc-note" style="width: 48px">{{ s.label }}</span>
          <Avatar :size="s.value" shape="circle" :image="portraitSvg" label="林" />
          <Avatar :size="s.value" shape="circle" label="林" />
          <Avatar :size="s.value" shape="circle" :icon="User" />
          <Avatar :size="s.value" shape="square" label="组" />
          <Avatar :size="s.value" shape="square" :icon="Users" />
        </div>
      </Specimen>
    </DocSection>

    <DocSection title="状态" desc="方形（square）与圆形（circle）在图像、字符、图标及图像加载失败回退下的表现。">
      <Specimen themes="both">
        <StateGrid :columns="['图像', '字符缩略', '用户图标', '实体图标', '图像失败回退']" label-width="72px">
          <StateRow label="圆形 circle">
            <Avatar shape="circle" :image="portraitSvg" label="林" />
            <Avatar shape="circle" label="林" />
            <Avatar shape="circle" :icon="User" />
            <Avatar shape="circle" :icon="Bot" />
            <Avatar shape="circle" image="data:image/gif;base64,invalid" label="回" />
          </StateRow>
          <StateRow label="方形 square">
            <Avatar shape="square" :image="portraitSvg" label="课题" />
            <Avatar shape="square" label="课题" />
            <Avatar shape="square" :icon="Users" />
            <Avatar shape="square" :icon="Building2" />
            <Avatar shape="square" image="data:image/gif;base64,invalid" :icon="Bot" />
          </StateRow>
        </StateGrid>
      </Specimen>
    </DocSection>

    <DocSection title="接口">
      <table class="doc-table">
        <thead>
          <tr><th>属性 / 事件 / 插槽</th><th>取值</th><th>说明</th></tr>
        </thead>
        <tbody>
          <tr><td><code>shape</code></td><td><code>square · circle</code></td><td>外观形状；默认 <code>square</code></td></tr>
          <tr><td><code>size</code></td><td><code>xs · sm · md · lg · normal · large · xlarge</code></td><td>尺寸档位；不传则跟随容器密度上下文</td></tr>
          <tr><td><code>image</code></td><td><code>string</code></td><td>头像图片地址；加载失败时自动回退至 <code>label</code> 或 <code>icon</code></td></tr>
          <tr><td><code>label</code></td><td><code>string</code></td><td>首字母或短字符缩略文本</td></tr>
          <tr><td><code>icon</code></td><td><code>Component</code></td><td>Lucide 图标组件（尺寸跟随容器密度）</td></tr>
          <tr><td><code>ariaLabel</code></td><td><code>string</code></td><td>无障碍名称，同时用于图片 <code>alt</code></td></tr>
          <tr><td><code>@error</code> / <code>@click</code></td><td><code>Event</code></td><td>图片加载失败事件与点击事件</td></tr>
          <tr><td><code>#default</code> / <code>#icon</code></td><td>—</td><td>自定义头像主体或图标插槽</td></tr>
        </tbody>
      </table>
    </DocSection>
  </DocPage>
</template>
