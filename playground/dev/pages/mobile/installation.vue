<script setup lang="ts">
import { computed } from "vue";
import CodeBlock from "../../kit/CodeBlock.vue";
import DocSection from "../../kit/DocSection.vue";
import MpDocPage from "../../kit/MpDocPage.vue";
import { mobileApi } from "../../mobile-demos/api";
import { t } from "../../i18n";

const installCmd = `pnpm add @mango-write/ui-mp @mango-write/ui-core`;

const styleCode = computed(() =>
  t({
    zh: `// H5 / uni-app 入口 (main.ts)
import "@mango-write/ui-mp/styles.css";

// 微信小程序原生 / WXSS 入口 (App.vue)
@import "@mango-write/ui-mp/styles.wxss";`,
    en: `// H5 / uni-app entry (main.ts)
import "@mango-write/ui-mp/styles.css";

// WeChat Mini Program / WXSS entry (App.vue)
@import "@mango-write/ui-mp/styles.wxss";`,
  }),
);

const providerCode = computed(() =>
  t({
    zh: `<MpThemeProvider theme="light">
  <MpPageHeader title="科研日志" />
  <MpTabBar v-model="active" :items="items" />
</MpThemeProvider>`,
    en: `<MpThemeProvider theme="light">
  <MpPageHeader title="Research log" />
  <MpTabBar v-model="active" :items="items" />
</MpThemeProvider>`,
  }),
);
</script>

<template>
  <MpDocPage
    slug="installation"
    :code="providerCode"
    :api="mobileApi.installation"
    :guidelines="[
      { kind: 'do', zh: '<strong>统一语义底座</strong>：主题、语义色和矢量图标由 MpThemeProvider 与 MpIcon 统一提供，业务页不复制颜色或字符图标。', en: '<strong>Shared semantic foundation</strong>: MpThemeProvider and MpIcon provide themes, semantic tokens, and vector icons.' },
      { kind: 'do', zh: '<strong>多形态容器感知</strong>：MpThemeProvider 自动识别常规直板屏（compact）、16:10 阔折叠（wide-short）与书本折叠展开态（expanded）。', en: '<strong>Form-factor awareness</strong>: MpThemeProvider automatically adapts across compact, wide-short (16:10), and expanded foldables.' },
      { kind: 'dont', zh: '不在小程序内自建顶部导航栏或绘制伪胶囊；一级页交由微信原生导航栏承载，沉浸式二级页只放左上角 MpBackButton。', en: 'Never build custom top navbars or fake WeChat capsules; rely on the native bar and use MpBackButton on custom-nav secondary pages.' },
    ]"
  >
    <template #sections>
      <DocSection
        :title="{ zh: '1. 安装包', en: '1. Install packages' }"
        :desc="{ zh: '安装移动端组件包与跨端语义令牌底座。', en: 'Install the mobile component package and shared semantic token core.' }"
      >
        <CodeBlock :code="installCmd" />
      </DocSection>
      <DocSection
        :title="{ zh: '2. 引入样式表', en: '2. Import stylesheets' }"
        :desc="{ zh: 'H5 使用标准 CSS，微信小程序使用编译后的 WXSS（自动完成 :root 到 page/.mw-mp-root 作用域映射）。', en: 'Use standard CSS on H5 and compiled WXSS on WeChat Mini Program.' }"
      >
        <CodeBlock :code="styleCode" />
      </DocSection>
      <DocSection
        :title="{ zh: '3. 挂载 MpThemeProvider', en: '3. Mount MpThemeProvider' }"
        :desc="{ zh: '在页面根节点包裹 MpThemeProvider，自动注入纸与霜主题变量、安全区偏移与折叠屏视口响应类名。', en: 'Wrap pages in MpThemeProvider to inject Paper & Frost tokens, safe-area offsets, and foldable viewport classes.' }"
      >
        <CodeBlock :code="providerCode" />
      </DocSection>
    </template>
  </MpDocPage>
</template>
