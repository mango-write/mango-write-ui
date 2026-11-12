// 触发器宽度与「当前选中项」解耦的共用量宽器：canvas 量候选文本，零常驻 DOM。
// 无 canvas 环境（jsdom/SSR）返回 0，组件据此降级为不锁定宽度。
export function measureMaxTextWidth(el: HTMLElement | null, texts: readonly string[]): number {
  if (!el || typeof document === "undefined" || texts.length === 0) return 0;
  const ctx = document.createElement("canvas").getContext("2d");
  if (!ctx || typeof ctx.measureText !== "function") return 0;
  const cs = getComputedStyle(el);
  ctx.font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
  ctx.letterSpacing = cs.letterSpacing === "normal" ? "0px" : cs.letterSpacing;
  let max = 0;
  for (const text of texts) {
    max = Math.max(max, ctx.measureText(text).width);
  }
  return Math.ceil(max) + 2;
}
