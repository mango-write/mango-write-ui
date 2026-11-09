// 浮层动态层级槽位分配器（纯状态机，零框架依赖）：
// portal 浮层打开时按序取层，后开者恒绘制在上；全部关闭即归零复位。
// 归零复位是危险不变量：动态层不得越过固定档（toast 1200 / tooltip·select 1300），
// 依赖「全关即归零」保证长会话不累积；新增 portal 浮层必须走这里，禁止写死 z-index。

const active = new Set<number>();
let top = 0;

export function acquireOverlaySlot(): number {
  top = active.size ? top + 1 : 1;
  active.add(top);
  return top;
}

export function releaseOverlaySlot(slot: number): void {
  active.delete(slot);
  if (!active.size) top = 0;
}

export function formatOverlayLayerZ(slot: number): string | undefined {
  return slot > 0 ? `calc(var(--z-overlay) + ${slot})` : undefined;
}

export function formatOverlayScrimZ(slot: number): string | undefined {
  return slot > 0 ? `calc(var(--z-overlay) + ${slot - 1})` : undefined;
}
