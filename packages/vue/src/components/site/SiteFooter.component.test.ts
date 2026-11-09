// SiteFooter 社交号配置面回归：默认三官方号（MangoWrite 运营事实）原样渲染，
// socials prop 整组覆盖后不再出现默认二维码与文案——第三方宿主不展示不属于
// 自己的运营信息。
import { mountUiComponent } from "../../test-utils/mount.js";
import { afterEach, describe, expect, it } from "vitest";

import SiteFooter from "./SiteFooter.vue";

function socialButtons(): HTMLButtonElement[] {
  return Array.from(document.querySelectorAll(".mw-site-footer__social-btn"));
}

function qrImages(): HTMLImageElement[] {
  return Array.from(document.querySelectorAll(".mw-site-footer__qr img"));
}

// attachTo 进真实 document，用例间必须卸载，否则 querySelector 捞到上一份。
let mounted: { unmount(): void } | null = null;
afterEach(() => {
  mounted?.unmount();
  mounted = null;
});

describe("SiteFooter socials", () => {
  it("默认渲染 MangoWrite 官方三号与各自二维码路径", () => {
    mounted = mountUiComponent(SiteFooter, { attachTo: document.body });
    expect(socialButtons().map((b) => b.getAttribute("aria-label"))).toEqual([
      "微信服务号",
      "小红书官方号",
      "抖音号",
    ]);
    expect(qrImages().map((img) => img.getAttribute("src"))).toEqual([
      "/logo/qrcode_wx.jpg",
      "/logo/qrcode_rednote.jpg",
      "/logo/qrcode_dy.jpg",
    ]);
  });

  it("socials prop 整组覆盖：宿主自己的账号与二维码，默认文案不再出现", () => {
    mounted = mountUiComponent(SiteFooter, {
      attachTo: document.body,
      props: {
        socials: [
          { key: "github", label: "GitHub", icon: "M12 2v20h", qr: "/brand/github-qr.png" },
        ],
      },
    });
    expect(socialButtons().map((b) => b.getAttribute("aria-label"))).toEqual(["GitHub"]);
    expect(qrImages().map((img) => img.getAttribute("src"))).toEqual(["/brand/github-qr.png"]);
  });
});
