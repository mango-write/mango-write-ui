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
            <div class="mw-site-footer__qr" role="tooltip">
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
  border-top: 1px solid var(--color-border-subtle);
  background: var(--color-surface-base);
  padding: 24px 24px 30px;
}

.mw-site-footer__inner {
  max-width: var(--site-chrome, 1240px);
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
  color: var(--color-text-secondary);
}

.mw-site-footer__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.mw-site-footer__brand {
  display: inline-flex;
  align-items: center;
  text-decoration: none;
  width: fit-content;
}

/* 官方号：圆形图标按钮 + hover/聚焦展开的二维码卡片。默认 MangoWrite 官方
 * 三号，可经 socials prop 整组覆盖。 */
.mw-site-footer__social {
  display: flex;
  align-items: center;
  gap: 10px;
}

.mw-site-footer__social-item {
  position: relative;
}

.mw-site-footer__social-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: 1px solid var(--color-border-subtle);
  border-radius: 50%;
  background: var(--color-surface-overlay);
  color: var(--color-brand-600);
  cursor: pointer;
  transition: border-color 0.15s ease-out, background-color 0.15s ease-out, transform 0.15s ease-out;
}

.mw-site-footer__social-icon {
  width: 18px;
  height: 18px;
  fill: currentColor;
}

.mw-site-footer__social-btn:hover,
.mw-site-footer__social-item:focus-within .mw-site-footer__social-btn {
  border-color: var(--color-brand-500);
  background: rgb(var(--color-brand-500-rgb) / 0.1);
  transform: translateY(-1px);
}

.mw-site-footer__qr {
  position: absolute;
  right: 0;
  bottom: calc(100% + 10px);
  z-index: 20;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  width: 148px;
  padding: 10px;
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-md);
  background: var(--color-surface-overlay);
  box-shadow: var(--shadow-md);
  opacity: 0;
  pointer-events: none;
  transform: translateY(4px);
  transition: opacity 0.16s ease-out, transform 0.16s ease-out;
}

.mw-site-footer__social-item:hover .mw-site-footer__qr,
.mw-site-footer__social-item:focus-within .mw-site-footer__qr {
  opacity: 1;
  pointer-events: auto;
  transform: translateY(0);
}

.mw-site-footer__qr img {
  width: 128px;
  height: 128px;
  border-radius: var(--radius-sm);
  object-fit: cover;
  background: var(--color-surface-base);
}

.mw-site-footer__qr span {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--color-text-primary);
}

.mw-site-footer__links {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  font-size: 0.75rem;
}

.mw-site-footer__links :slotted(a) {
  color: var(--color-text-secondary);
  text-decoration: none;
}

.mw-site-footer__links :slotted(a:hover) {
  color: var(--color-text-primary);
}

.mw-site-footer__legal {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
  font-size: 0.6875rem;
  color: var(--color-text-tertiary);
}

.mw-site-footer__legal a {
  color: inherit;
  text-decoration: none;
}

.mw-site-footer__legal a:hover {
  color: var(--color-text-primary);
}

.mw-site-footer__legal :slotted(a) {
  color: inherit;
  text-decoration: none;
}

.mw-site-footer__legal :slotted(a:hover) {
  color: var(--color-text-primary);
}

.mw-site-footer__beian {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.mw-site-footer__beian-icon {
  width: 16px;
  height: 16px;
}

@media (max-width: 560px) {
  .mw-site-footer__top {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
