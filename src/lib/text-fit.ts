// 触发器宽度与「当前选中项」解耦的共用量宽器：canvas 量候选文本，零常驻 DOM。
// 无 canvas 环境（jsdom/SSR）返回 0，组件据此降级为不锁定宽度。
// 不缓存 context：量宽只在 options / 字体就绪时发生，缓存反而会把首个失败
// 的 getContext（无 canvas 环境或 mock 之前）固化成永久 0。
export function measureMaxTextWidth(el: HTMLElement | null, texts: readonly string[]): number {
  if (!el || typeof document === "undefined" || texts.length === 0) return 0;
  const ctx = document.createElement("canvas").getContext("2d");
  if (!ctx) return 0;
  const cs = getComputedStyle(el);
  ctx.font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
  ctx.letterSpacing = cs.letterSpacing === "normal" ? "0px" : cs.letterSpacing;
  let max = 0;
  for (const text of texts) {
    max = Math.max(max, ctx.measureText(text).width);
  }
  // +2px 吸收字形微差：即便选中恰好是最宽候选，锁定宽也要压住实际 max-content。
  return Math.ceil(max) + 2;
}
