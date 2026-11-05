import { h } from "vue";
import { Button, ImageLightbox } from "../../../src";
import { sfc } from "../codegen";
import type { UsageEntry, UsageValues } from "../types";

// 内联 SVG 当示例图,不依赖网络资源
const demoImage =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="420"><rect width="640" height="420" fill="#e8e4dc"/><circle cx="200" cy="180" r="90" fill="#7c6cf6" opacity="0.55"/><rect x="300" y="120" width="240" height="160" rx="12" fill="#2f3a4a" opacity="0.8"/><text x="32" y="392" font-family="sans-serif" font-size="18" fill="#5b564e">图 1 · 消融实验对比</text></svg>`,
  );

export const usage: UsageEntry = {
  slug: "image-lightbox",
  component: ImageLightbox,
  tag: "ImageLightbox",
  flatPreview: true,
  controls: [
    { prop: "open", label: "打开", kind: "boolean", default: false, vmodel: true },
    { prop: "alt", label: "替代文本", kind: "text", default: "消融实验对比图" },
    { prop: "caption", label: "图注", kind: "text", default: "图 1 · 消融实验对比（放大查看细节）" },
  ],
  render: (v: UsageValues) => [
    h(Button, {
      size: "sm",
      severity: "secondary",
      label: "打开灯箱",
      onClick: () => {
        v.open = true;
      },
    }),
    h(ImageLightbox, {
      visible: Boolean(v.open),
      "onUpdate:visible": (x: unknown) => {
        v.open = Boolean(x);
      },
      src: demoImage,
      alt: v.alt as string | undefined,
      caption: v.caption as string | undefined,
    }),
  ],
  code: (v: UsageValues) => {
    const attrs = [
      'v-model:visible="open"',
      'src="/figures/ablation.svg"',
      v.alt ? `alt="${v.alt}"` : "",
      v.caption ? `caption="${v.caption}"` : "",
    ].filter(Boolean);
    return sfc({
      ui: ["Button", "ImageLightbox"],
      vue: ["ref"],
      setup: ["const open = ref(false);"],
      template: `<Button size="sm" severity="secondary" label="查看大图" @click="open = true" />\n<ImageLightbox\n    ${attrs.join("\n    ")}\n  />`,
    });
  },
};
