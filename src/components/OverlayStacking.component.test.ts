// 浮层堆叠回归：任一 portal 浮层后开时必须绘制在已开浮层之上（动态层级契约）。
// 背景：静态同层 z + Teleport 锚点顺序曾使全局 ConfirmHost 恒被业务 Dialog 盖住
// （赠送积分确认框事故）；修复后绘制顺序由 overlay-layer.ts 的动态 z 决定。
// happy-dom 不解析 calc() 的 computed z-index，故从 inline style 解析层级序号断言。
import { defineComponent, nextTick, ref } from "vue";
import { afterEach, describe, expect, it } from "vitest";
import { mountUiComponent } from "../test-utils/mount.js";
import { useConfirm } from "../lib/confirm.js";
import ConfirmHost from "./ConfirmHost.vue";
import Dialog from "./Dialog.vue";
import Popover from "./Popover.vue";
import ImageLightbox from "./ImageLightbox.vue";

async function flush() {
  await nextTick();
  await nextTick();
}

/** 从 inline style 解析 calc(var(--z-overlay) + N) 的 N；无动态层返回 -1。 */
function inlineZ(el: Element | null): number {
  const z = (el as HTMLElement | null)?.style?.zIndex ?? "";
  const m = z.match(/^calc\(var\(--z-overlay\)\s*\+\s*(\d+)\)$/);
  return m ? Number(m[1]) : -1;
}

describe("浮层堆叠顺序（overlay-layer 动态层级）", () => {
  afterEach(() => {
    useConfirm().closeAll();
    document.body.innerHTML = "";
  });

  it("confirm 后开时必须取到比已开 Dialog 更高的层级", async () => {
    // 复刻 App 根结构：ConfirmHost 与业务视图同根挂载，ConfirmHost 在前（锚点劣势位）。
    const App = defineComponent({
      components: { ConfirmHost, Dialog },
      setup: () => ({ opVisible: ref(false) }),
      template: `
        <ConfirmHost />
        <Dialog v-model:visible="opVisible" title="赠送积分">
          <button data-op-submit>赠送</button>
        </Dialog>`,
    });
    const wrapper = mountUiComponent(App, { attachTo: document.body });
    await flush();

    // 业务 Dialog 先开（运营 op 弹窗）
    (wrapper.findComponent({ name: "MwDialog" }).vm as { $emit: (e: string, v: boolean) => void })
      .$emit("update:visible", true);
    await flush();
    const opContent = document.querySelector(".mw-dialog");
    expect(opContent, "业务 Dialog 内容应已挂载").not.toBeNull();
    expect(inlineZ(opContent), "Dialog 应持有动态层级").toBeGreaterThan(0);

    // confirm 最后触发（赠送积分的二次确认）
    useConfirm().require({ header: "确认赠送", message: "确认为该用户赠送积分？" });
    await flush();
    const confirmContent = document.querySelector(".mw-confirm");
    expect(confirmContent, "确认框内容应已挂载").not.toBeNull();

    expect(
      inlineZ(confirmContent),
      "确认框动态层级必须高于已开 Dialog，否则被业务弹窗盖住（用户可见症状）",
    ).toBeGreaterThan(inlineZ(opContent));

    wrapper.unmount();
  });

  it("Dialog 内打开 Popover 与 ImageLightbox 时层级须高于 Dialog", async () => {
    const App = defineComponent({
      components: { Dialog, Popover, ImageLightbox },
      setup: () => ({
        opVisible: ref(true),
        popOpen: ref(false),
        lightboxVisible: ref(false),
      }),
      template: `
        <Dialog v-model:visible="opVisible" title="宿主弹窗">
          <Popover v-model:open="popOpen"><template #trigger><button data-open-pop>开</button></template>
            <div data-pop-body>浮层内容</div>
          </Popover>
          <button data-open-lb @click="lightboxVisible = true">灯箱</button>
          <ImageLightbox :visible="lightboxVisible" src="x.png" @update:visible="lightboxVisible = $event" />
        </Dialog>`,
    });
    const wrapper = mountUiComponent(App, { attachTo: document.body });
    await flush();
    const opContent = document.querySelector(".mw-dialog");
    expect(opContent).not.toBeNull();
    const dialogZ = inlineZ(opContent);
    expect(dialogZ).toBeGreaterThan(0);

    // Popover 从 Dialog 内打开
    (wrapper.findComponent({ name: "MwPopover" }).vm as { $emit: (e: string, v: boolean) => void })
      .$emit("update:open", true);
    await flush();
    const popContent = document.querySelector(".mw-popover");
    expect(popContent, "Popover 内容应已挂载").not.toBeNull();
    expect(inlineZ(popContent)).toBeGreaterThan(dialogZ);

    // ImageLightbox 从 Dialog 内打开
    (document.querySelector("[data-open-lb]") as HTMLButtonElement).click();
    await flush();
    const lightbox = document.querySelector(".mw-lightbox");
    expect(lightbox, "灯箱应已挂载").not.toBeNull();
    expect(inlineZ(lightbox)).toBeGreaterThan(dialogZ);

    wrapper.unmount();
  });
});
