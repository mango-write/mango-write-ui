import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import SiteFooter from "./SiteFooter";

describe("SiteFooter", () => {
  it("默认渲染 MangoWrite 官方三号与各自二维码路径及合规信息", () => {
    const { container } = render(
      <SiteFooter>
        <a href="/privacy">隐私政策</a>
      </SiteFooter>,
    );

    const buttons = Array.from(
      container.querySelectorAll<HTMLButtonElement>(".mw-site-footer__social-btn"),
    );
    expect(buttons.map((b) => b.getAttribute("aria-label"))).toEqual([
      "微信服务号",
      "小红书官方号",
      "抖音号",
    ]);

    const qrs = Array.from(
      container.querySelectorAll<HTMLImageElement>(".mw-site-footer__qr img"),
    );
    expect(qrs.map((img) => img.getAttribute("src"))).toEqual([
      "/logo/qrcode_wx.jpg",
      "/logo/qrcode_rednote.jpg",
      "/logo/qrcode_dy.jpg",
    ]);

    expect(container.querySelector(".mw-site-footer__links a")?.textContent).toBe(
      "隐私政策",
    );
    expect(container.querySelector(".mw-site-footer__legal")?.textContent).toContain(
      "芒果写作 MangoWrite",
    );
  });

  it("socials、locale=en、brand 与 legal 覆盖后不再出现默认文案", () => {
    const { container } = render(
      <SiteFooter
        locale="en"
        brand={<span className="custom-brand">Partner</span>}
        legal={<span className="custom-legal">© Partner Inc.</span>}
        socials={[
          {
            key: "github",
            label: "GitHub",
            icon: "M12 2v20h",
            qr: "/brand/github-qr.png",
          },
        ]}
      />,
    );

    const buttons = Array.from(
      container.querySelectorAll<HTMLButtonElement>(".mw-site-footer__social-btn"),
    );
    expect(buttons.map((b) => b.getAttribute("aria-label"))).toEqual(["GitHub"]);
    expect(
      container.querySelector(".mw-site-footer__qr img")?.getAttribute("src"),
    ).toBe("/brand/github-qr.png");
    expect(container.querySelector(".custom-brand")?.textContent).toBe("Partner");
    expect(container.querySelector(".mw-site-footer__legal")?.textContent).toBe(
      "© Partner Inc.",
    );
  });
});
