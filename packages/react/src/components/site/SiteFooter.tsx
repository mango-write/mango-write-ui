import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import AppLogo from "../AppLogo";
import { socialIcons } from "./social-icons";

export interface SiteSocialItem {
  key: string;
  label: string;
  icon: string;
  qr: string;
}

export type SiteFooterLocale = "zh-CN" | "en" | "en-US";

export interface SiteFooterProps extends HTMLAttributes<HTMLElement> {
  homeHref?: string;
  locale?: SiteFooterLocale;
  brandLabel?: string;
  socials?: ReadonlyArray<SiteSocialItem>;
  brand?: ReactNode;
  legal?: ReactNode;
  children?: ReactNode;
}

const DEFAULT_SOCIALS = [
  { key: "wechat", icon: socialIcons.wechat, qr: "/logo/qrcode_wx.jpg" },
  { key: "xiaohongshu", icon: socialIcons.xiaohongshu, qr: "/logo/qrcode_rednote.jpg" },
  { key: "douyin", icon: socialIcons.douyin, qr: "/logo/qrcode_dy.jpg" },
] as const;

const COPY = {
  "zh-CN": {
    socialAria: "官方账号",
    social: {
      wechat: "微信服务号",
      xiaohongshu: "小红书官方号",
      douyin: "抖音号",
    },
  },
  en: {
    socialAria: "Official accounts",
    social: {
      wechat: "WeChat service account",
      xiaohongshu: "Xiaohongshu official account",
      douyin: "Douyin account",
    },
  },
} as const;

const CURRENT_YEAR = new Date().getFullYear();

export const SiteFooter = forwardRef<HTMLElement, SiteFooterProps>(
  function MwSiteFooter(
    {
      homeHref = "/",
      locale = "zh-CN",
      brandLabel = "MangoWrite",
      socials,
      brand,
      legal,
      className,
      children,
      ...rest
    },
    ref,
  ) {
    const normalizedLocale = locale === "en" || locale === "en-US" ? "en" : "zh-CN";
    const copy = COPY[normalizedLocale];

    const socialItems: SiteSocialItem[] = socials
      ? socials.map((item) => ({ ...item }))
      : DEFAULT_SOCIALS.map((item) => ({
          ...item,
          label: copy.social[item.key],
        }));

    const copyright =
      normalizedLocale === "en"
        ? `© ${CURRENT_YEAR} MangoWrite. All rights reserved.`
        : `© ${CURRENT_YEAR} 芒果写作 MangoWrite 版权所有`;

    const classes = ["mw-site-footer", className].filter(Boolean).join(" ");
    const hasLinks = children !== undefined && children !== null && children !== false;

    return (
      <footer ref={ref} {...rest} className={classes}>
        <div className="mw-site-footer__inner">
          <div className="mw-site-footer__top">
            <a href={homeHref} className="mw-site-footer__brand" aria-label={brandLabel}>
              {brand !== undefined ? brand : <AppLogo />}
            </a>

            <div className="mw-site-footer__social" aria-label={copy.socialAria}>
              {socialItems.map((item) => (
                <div key={item.key} className="mw-site-footer__social-item">
                  <button
                    type="button"
                    className="mw-site-footer__social-btn"
                    aria-label={item.label}
                    aria-expanded={false}
                  >
                    <svg
                      className="mw-site-footer__social-icon"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path d={item.icon} />
                    </svg>
                  </button>
                  <div className="mw-site-footer__qr mw-frost" role="tooltip">
                    <img src={item.qr} alt={item.label} loading="lazy" />
                    <span>{item.label}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {hasLinks ? (
            <nav className="mw-site-footer__links" aria-label="Footer links">
              {children}
            </nav>
          ) : null}

          <div className="mw-site-footer__legal">
            {legal !== undefined ? (
              legal
            ) : (
              <>
                <span>{copyright}</span>
                <a
                  href="https://beian.miit.gov.cn/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  鄂ICP备2026028024号-1
                </a>
                <span>网信算备330110507206401230035号</span>
                <a
                  href="http://www.beian.gov.cn/portal/registerSystemInfo?recordcode=42018502009045"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mw-site-footer__beian"
                >
                  <img
                    src="https://www.beian.gov.cn/img/ghs.png"
                    alt="公安备案"
                    className="mw-site-footer__beian-icon"
                  />
                  鄂公网安备42018502009045号
                </a>
              </>
            )}
          </div>
        </div>
      </footer>
    );
  },
);

SiteFooter.displayName = "MwSiteFooter";

export default SiteFooter;
