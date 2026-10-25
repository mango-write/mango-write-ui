// mw-area / mw-async 区域级过渡的时长单一来源。完成信号一律走 Transition 的
// 显式 :duration——Vue 直接 setTimeout(resolve, duration)，不依赖 transitionend
// 投递。禁止再用 @enter/@leave JS 钩子接管完成信号：显式回调会让 Vue 整体跳过
// 原生 whenTransitionEnds（含 timeout+1 兜底），协调权落到自造计时器/epoch 重挂
// 上——嵌套过渡 hooks 串扰与「旧区已走、新区停在占位注释」的永久空白即由此而来
// （e78ccc36、e04380f2 两轮事故）。
// 180 与 packages/shared/src/var.css 的 --motion-duration-base 同源；CSS 变量进
// 不了 JS props，改 token 时两处同步。
export const MOTION_AREA_DURATION_MS = 180;

export function areaDurationMs(): number {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : MOTION_AREA_DURATION_MS;
}
