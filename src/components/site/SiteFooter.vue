<script setup lang="ts">
// 站点壳页脚：write landing 与 rewrite 营销站共用。纯布局壳——品牌、社交号、
// 链接行、合规行（版权/备案）。社交号默认是 MangoWrite 官方三号（圆形图标
// 按钮，hover/聚焦展开各自二维码），第三方宿主经 socials prop 整组覆盖。
// 链接行（隐私政策 / 用户协议 / 联系我们 / 关于我们等）是各站点单独的，经默认 slot
// 注入、样式统一；合规行（版权/备案）默认带 MangoWrite 运营事实，第三方宿主
// 经 #legal slot 覆盖（#brand slot 同理换标）。
import { computed } from "vue";
import AppLogo from "../AppLogo.vue";
import { socialIcons } from "./social-icons";

const props = withDefaults(
  defineProps<{
    homeHref?: string;
    locale?: "zh-CN" | "en";
    /** 品牌链接的无障碍名。两个产品站品牌名不同，别写死。 */
    brandLabel?: string;
    /** 整组覆盖默认官方号：icon 为 SVG path（currentColor 单色），qr 为二维码
     *  图片 URL，label 直接使用（不进本组件的 locale 词表）。 */
    socials?: ReadonlyArray<{ key: string; label: string; icon: string; qr: string }>;
  }>(),
  {
    homeHref: "/",
    locale: "zh-CN",
    brandLabel: "MangoWrite",
    socials: undefined,
  },
);

// 默认三个官方号：key 仅供 stable key；二维码图片由各 app 的 public/logo/ 提供。
// 图标用 Simple Icons 路径（单色，currentColor = 品牌色，不写平台色值）。
const DEFAULT_SOCIALS = [
  { key: "wechat", icon: socialIcons.wechat, qr: "/logo/qrcode_wx.jpg" },
  { key: "xiaohongshu", icon: socialIcons.xiaohongshu, qr: "/logo/qrcode_rednote.jpg" },
  { key: "douyin", icon: socialIcons.douyin, qr: "/logo/qrcode_dy.jpg" },
  // { key: "weibo", icon: socialIcons.weibo },
] as const;

// 社媒标签与版权行随站点语言切换；备案行与 AI 服务公示是中国监管文本，固定中文。
const COPY = {
  "zh-CN": {
    socialAria: "官方账号",
    social: { wechat: "微信服务号", xiaohongshu: "小红书官方号", douyin: "抖音号" }
  },
  en: {
    socialAria: "Official accounts",
    social: { wechat: "WeChat service account", xiaohongshu: "Xiaohongshu official account", douyin: "Douyin account" }
  }
} as const;

const copy = computed(() => COPY[props.locale]);

const socialItems = computed(() =>
  props.socials
    ? props.socials.map((item) => ({ ...item }))
    : DEFAULT_SOCIALS.map((item) => ({ ...item, label: copy.value.social[item.key] })),
);

// 合规行是通用的（两站一致）：版权年份取当前年，备案信息烤死，避免两站各写一份。
const year = new Date().getFullYear();
// 中文档带中文品牌词：页脚出现在每一个公开页，是全站命中「芒果写作」的稳定锚点。
const copyright = computed(() =>
  props.locale === "en"
    ? `© ${year} MangoWrite. All rights reserved.`
    : `© ${year} 芒果写作 MangoWrite 版权所有`
);
</script>

<template>
  <footer class="mw-site-footer">
    <div class="mw-site-footer__inner">
      <div class="mw-site-footer__top">
        <a :href="homeHref" class="mw-site-footer__brand" :aria-label="brandLabel">
          <slot name="brand"><AppLogo /></slot>
        </a>

        <div class="mw-site-footer__social" :aria-label="copy.socialAria">
          <div v-for="item in socialItems" :key="item.key" class="mw-site-footer__social-item">
            <button
              type="button"
              class="mw-site-footer__social-btn"
              :aria-label="item.label"
              :aria-expanded="false"
            >
              <svg class="mw-site-footer__social-icon" viewBox="0 0 24 24" aria-hidden="true">
                <path :d="item.icon" />
              </svg>
            </button>
            <div class="mw-site-footer__qr mw-frost" role="tooltip">
              <img :src="item.qr" :alt="item.label" loading="lazy" />
              <span>{{ item.label }}</span>
            </div>
          </div>
        </div>
      </div>

      <nav v-if="$slots.default" class="mw-site-footer__links" aria-label="Footer links">
        <slot />
      </nav>
      <div class="mw-site-footer__legal">
        <slot name="legal">
          <span>{{ copyright }}</span>
          <a href="https://beian.miit.gov.cn/" target="_blank" rel="noopener noreferrer">鄂ICP备2026028024号-1</a>
          <!-- 生成式 AI 服务公示（网信办 2024-04 公告：注明模型名称及算法备案号），两站同源 -->
          <span>网信算备330110507206401230035号</span>
          <a
            href="http://www.beian.gov.cn/portal/registerSystemInfo?recordcode=42018502009045"
            target="_blank"
            rel="noopener noreferrer"
            class="mw-site-footer__beian"
          >
            <img src="https://www.beian.gov.cn/img/ghs.png" alt="公安备案" class="mw-site-footer__beian-icon" />
            鄂公网安备42018502009045号
          </a>
        </slot>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.mw-site-footer {
  padding: var(--space-6) var(--space-6) var(--space-8);
  border-top: var(--border-width) solid var(--border-subtle);
  background: var(--bg-surface);
}

.mw-site-footer__inner {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  max-width: var(--site-chrome);
  margin: 0 auto;
  color: var(--text-secondary);
}

.mw-site-footer__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
}

.mw-site-footer__brand {
  display: inline-flex;
  align-items: center;
  width: fit-content;
  text-decoration: none;
}

.mw-site-footer__social {
  display: flex;
  align-items: center;
  gap: var(--space-2-5);
}

.mw-site-footer__social-item {
  position: relative;
}

.mw-site-footer__social-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: var(--size-lg-h);
  height: var(--size-lg-h);
  border: var(--border-width) solid var(--border-subtle);
  border-radius: var(--radius-full);
  background: var(--control-bg);
  color: var(--text-accent);
  cursor: pointer;
  transition:
    border-color var(--duration-fast) var(--ease-standard),
    background-color var(--duration-fast) var(--ease-standard),
    transform var(--duration-fast) var(--ease-standard);
}

.mw-site-footer__social-icon {
  width: var(--icon-lg);
  height: var(--icon-lg);
  fill: currentColor;
}

.mw-site-footer__social-btn:hover,
.mw-site-footer__social-item:focus-within .mw-site-footer__social-btn {
  border-color: var(--accent-border);
  background: var(--accent-subtle);
  transform: translateY(-1px);
}

/* 二维码卡是浮层：霜面；进入 = 淡入 + 位移 + 缩放，退出只淡出。 */
.mw-site-footer__qr {
  position: absolute;
  right: 0;
  bottom: calc(100% + var(--space-2-5));
  z-index: var(--z-dropdown);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-1-5);
  width: 148px;
  padding: var(--space-2);
  border-radius: var(--radius-float);
  opacity: 0;
  pointer-events: none;
  transform: translateY(var(--motion-enter-offset)) scale(var(--motion-enter-scale));
  transform-origin: bottom right;
  transition: opacity var(--duration-fast) var(--ease-exit);
}

.mw-site-footer__social-item:hover .mw-site-footer__qr,
.mw-site-footer__social-item:focus-within .mw-site-footer__qr {
  opacity: 1;
  pointer-events: auto;
  transform: none;
  transition:
    opacity var(--duration-base) var(--ease-enter),
    transform var(--duration-base) var(--ease-enter);
}

.mw-site-footer__qr img {
  width: 128px;
  height: 128px;
  border-radius: var(--radius-xs);
  object-fit: cover;
}

.mw-site-footer__qr span {
  color: var(--text-primary);
  font-size: var(--type-caption-size);
  font-weight: var(--weight-semibold);
  line-height: var(--type-caption-line);
}

.mw-site-footer__links {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3);
  font-size: var(--type-caption-size);
}

.mw-site-footer__links :slotted(a) {
  color: var(--text-secondary);
  text-decoration: none;
}

.mw-site-footer__links :slotted(a:hover) {
  color: var(--text-primary);
}

.mw-site-footer__legal {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-2-5);
  color: var(--text-tertiary);
  font-size: var(--type-micro-size);
  line-height: var(--type-micro-line);
}

.mw-site-footer__legal a,
.mw-site-footer__legal :slotted(a) {
  color: inherit;
  text-decoration: none;
}

.mw-site-footer__legal a:hover,
.mw-site-footer__legal :slotted(a:hover) {
  color: var(--text-primary);
}

.mw-site-footer__beian {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1-5);
}

.mw-site-footer__beian-icon {
  width: var(--icon-md);
  height: var(--icon-md);
}

@media (max-width: 560px) {
  .mw-site-footer__top {
    flex-direction: column;
    align-items: flex-start;
  }
}

@media (prefers-reduced-motion: reduce) {
  .mw-site-footer__social-btn,
  .mw-site-footer__qr,
  .mw-site-footer__social-item:hover .mw-site-footer__qr,
  .mw-site-footer__social-item:focus-within .mw-site-footer__qr {
    transition: opacity var(--duration-fast) var(--ease-standard);
  }

  .mw-site-footer__qr {
    transform: none;
  }
}
</style>
