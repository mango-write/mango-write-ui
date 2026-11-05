// 浮层动态层级：portal 浮层打开时按序取层，后开者恒绘制在上；全部关闭即归零复位。
// 背景：PrimeVue 退场（#231）后浮层 z 全部静态化，同层堆叠退化为 DOM 顺序，而 Vue
// Teleport 的内容恒插在自己的 targetAnchor 之前——先于业务视图挂载的全局宿主
// （ConfirmHost）再后触发也会被业务 Dialog 盖住（赠送积分确认框事故）。
// 归零复位是危险不变量：动态层不得越过固定档（toast 1200 / tooltip·select 1300），
// 依赖「全关即归零」保证长会话不累积；新增 portal 浮层必须走这里，禁止写死 z-index。
import { computed, onBeforeUnmount, ref, watch, type ComputedRef } from "vue";

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

interface OverlayLayer {
  /** 内容层 z-index；关闭后保留末值供退场动画使用，元素卸载即失效。 */
  layerZ: ComputedRef<string | undefined>;
  /** 遮罩层 z-index（比内容层低一级）；无遮罩的浮层不绑定。 */
  scrimZ: ComputedRef<string | undefined>;
}

export function useOverlayLayer(isOpen: () => boolean): OverlayLayer {
  const slot = ref(0);

  watch(
    isOpen,
    (open) => {
      if (open) {
        if (!slot.value) slot.value = acquireOverlaySlot();
      } else if (slot.value) {
        releaseOverlaySlot(slot.value);
        slot.value = 0;
      }
    },
    { immediate: true },
  );

  onBeforeUnmount(() => {
    if (slot.value) releaseOverlaySlot(slot.value);
  });

  const layerZ = computed(() =>
    slot.value ? `calc(var(--z-overlay) + ${slot.value})` : undefined,
  );
  const scrimZ = computed(() =>
    slot.value ? `calc(var(--z-overlay) + ${slot.value - 1})` : undefined,
  );

  return { layerZ, scrimZ };
}
