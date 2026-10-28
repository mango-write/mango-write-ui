<script setup lang="ts">
import Avatar from "primevue/avatar";
import AvatarGroup from "primevue/avatargroup";
import BlockUI from "primevue/blockui";
import Button from "primevue/button";
import ButtonGroup from "primevue/buttongroup";
import Carousel from "primevue/carousel";
import CascadeSelect from "primevue/cascadeselect";
import Checkbox from "primevue/checkbox";
import CheckboxGroup from "primevue/checkboxgroup";
import ColorPicker from "primevue/colorpicker";
import Column from "primevue/column";
import ContextMenu from "primevue/contextmenu";
import DeferredContent from "primevue/deferredcontent";
import Dock from "primevue/dock";
import Fieldset from "primevue/fieldset";
import Fluid from "primevue/fluid";
import Galleria from "primevue/galleria";
import IftaLabel from "primevue/iftalabel";
import Image from "primevue/image";
import ImageCompare from "primevue/imagecompare";
import Inplace from "primevue/inplace";
import InputMask from "primevue/inputmask";
import InputOtp from "primevue/inputotp";
import InputText from "primevue/inputtext";
import Knob from "primevue/knob";
import MegaMenu from "primevue/megamenu";
import Menubar from "primevue/menubar";
import MeterGroup from "primevue/metergroup";
import OrderList from "primevue/orderlist";
import OrganizationChart from "primevue/organizationchart";
import OverlayBadge from "primevue/overlaybadge";
import Panel from "primevue/panel";
import PanelMenu from "primevue/panelmenu";
import Password from "primevue/password";
import PickList from "primevue/picklist";
import RadioButton from "primevue/radiobutton";
import RadioButtonGroup from "primevue/radiobuttongroup";
import ScrollTop from "primevue/scrolltop";
import SpeedDial from "primevue/speeddial";
import SplitButton from "primevue/splitbutton";
import Terminal from "primevue/terminal";
import TerminalService from "primevue/terminalservice";
import TieredMenu from "primevue/tieredmenu";
import ToggleButton from "primevue/togglebutton";
import Toolbar from "primevue/toolbar";
import TreeTable from "primevue/treetable";
import VirtualScroller from "primevue/virtualscroller";
import { useConfirm } from "primevue/useconfirm";
import { useDialog } from "primevue/usedialog";
import { useToast } from "primevue/usetoast";
import { defineComponent, h, onBeforeUnmount, onMounted, ref } from "vue";
import { ImageLightbox, SiteFooter, SiteHeader } from "../../src";

const confirm = useConfirm();
const dialog = useDialog();
const toast = useToast();

function onTerminalCommand(command: string) {
  TerminalService.emit("response", `已执行：${command}`);
}
onMounted(() => TerminalService.on("command", onTerminalCommand));
onBeforeUnmount(() => TerminalService.off("command", onTerminalCommand));

const password = ref("mango-write");
const maskedValue = ref("10.1000/abc");
const otp = ref("2026");
const cascadeValue = ref();
const cascadeOptions = [
  {
    label: "计算机科学",
    children: [{ label: "人工智能" }, { label: "计算机视觉" }, { label: "自然语言处理" }],
  },
  {
    label: "生命科学",
    children: [{ label: "生物信息学" }, { label: "神经科学" }],
  },
];
const color = ref("e8913a");
const knob = ref(42);
const toggle = ref(false);
const checkedTopics = ref(["Diffusion"]);
const selectedStyle = ref("apa");

const actionItems = [
  { label: "保存副本", icon: "pi pi-copy", command: () => notify("已保存副本") },
  { label: "导出", icon: "pi pi-upload", command: () => notify("已开始导出") },
];
const speedDialItems = [
  { label: "新建", icon: "pi pi-plus", command: () => notify("新建") },
  { label: "上传", icon: "pi pi-upload", command: () => notify("上传") },
  { label: "分享", icon: "pi pi-share-alt", command: () => notify("分享") },
];
const menuItems = [
  {
    label: "文献",
    icon: "pi pi-book",
    items: [
      { label: "导入文献", icon: "pi pi-file-import" },
      { label: "最近阅读", icon: "pi pi-history" },
    ],
  },
  {
    label: "写作",
    icon: "pi pi-pencil",
    items: [{ label: "新建草稿", icon: "pi pi-plus" }],
  },
  { label: "设置", icon: "pi pi-cog" },
];
const megaMenuItems = [
  {
    label: "文献",
    icon: "pi pi-book",
    items: [[{ label: "管理", items: [{ label: "导入文献" }, { label: "最近阅读" }] }]],
  },
  {
    label: "写作",
    icon: "pi pi-pencil",
    items: [[{ label: "草稿", items: [{ label: "新建草稿" }, { label: "版本记录" }] }]],
  },
];
const contextMenu = ref<InstanceType<typeof ContextMenu> | null>(null);
const dockItems = [
  { label: "文库", icon: "pi pi-book", command: () => notify("文库") },
  { label: "检索", icon: "pi pi-search", command: () => notify("检索") },
  { label: "写作", icon: "pi pi-pencil", command: () => notify("写作") },
];

const orderItems = ref(["Diffusion", "RLHF", "Scaling Law", "Multimodal"]);
const pickList = ref([
  ["Diffusion", "RLHF"],
  ["Scaling Law", "Multimodal"],
]);
const organization = {
  key: "root",
  label: "生成模型",
  children: [
    { key: "diffusion", label: "扩散模型" },
    {
      key: "transformer",
      label: "Transformer",
      children: [{ key: "dpo", label: "偏好优化" }],
    },
  ],
};
const treeNodes = [
  {
    key: "library",
    data: { name: "我的文献", kind: "文件夹", count: 18 },
    children: [
      { key: "dpo", data: { name: "DPO.pdf", kind: "论文", count: 1 } },
      { key: "rlhf", data: { name: "RLHF.pdf", kind: "论文", count: 1 } },
    ],
  },
];
const virtualItems = Array.from({ length: 1000 }, (_, index) => `虚拟列表项 ${index + 1}`);
const deferredLoaded = ref(false);

const blocked = ref(false);
const meterValues = [
  { label: "已用空间", value: 62, color: "var(--color-brand-500)" },
  { label: "媒体缓存", value: 18, color: "var(--color-info-500)" },
  { label: "剩余", value: 20, color: "var(--color-surface-300)" },
];

function svgImage(label: string, background: string, foreground: string) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="720" height="420" viewBox="0 0 720 420"><rect width="720" height="420" rx="24" fill="${background}"/><circle cx="590" cy="90" r="110" fill="${foreground}" opacity=".18"/><text x="48" y="220" font-family="system-ui,sans-serif" font-size="42" font-weight="600" fill="${foreground}">${label}</text></svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}
const imageBefore = svgImage("Research figure", "#f7ede2", "#8b4f2f");
const imageAfter = svgImage("MangoWrite UI", "#e8913a", "#241d18");
const galleryImages = [
  { src: imageBefore, alt: "研究示意图" },
  { src: imageAfter, alt: "主题示意图" },
];
const carouselItems = [
  { title: "Direct Preference Optimization", meta: "NeurIPS 2023" },
  { title: "Scaling Rectified Flow Transformers", meta: "ICML 2024" },
  { title: "Diffusion Models Beat GANs", meta: "NeurIPS 2021" },
];
const lightboxOpen = ref(false);
const siteNavItems = [
  { label: "组件", href: "#chapter-ui-package", active: true },
  { label: "设计基建", href: "#chapter-foundations" },
];

const DynamicContent = defineComponent({
  setup() {
    return () => h("p", { class: "tw:m-0 tw:text-sm tw:text-muted" }, "由 DialogService 动态挂载的内容，关闭后自动销毁。");
  },
});

function notify(summary: string) {
  toast.add({ severity: "success", summary, life: 1600 });
}

function openDynamicDialog() {
  dialog.open(DynamicContent, {
    props: { header: "DynamicDialog", modal: true, style: { width: "26rem" } },
  });
}

function confirmInline(event: MouseEvent) {
  confirm.require({
    target: event.currentTarget as HTMLElement,
    message: "确认归档这篇文献？",
    icon: "pi pi-info-circle",
    acceptLabel: "归档",
    rejectLabel: "取消",
    accept: () => notify("已归档"),
  });
}
</script>

<template>
  <section id="chapter-form-extras" class="uc-chapter">
    <div class="uc-kicker">06 · Form</div>
    <h2 class="uc-h2">更多表单组件</h2>

    <div class="uc-block">
      <div id="form-text-extras" class="uc-title">Password / InputMask / InputOtp</div>
      <div class="uc-stage">
        <label class="uc-field">密码<Password v-model="password" toggle-mask :feedback="false" /></label>
        <label class="uc-field">DOI 格式<InputMask v-model="maskedValue" mask="99.9999/aaa" placeholder="10.1000/abc" /></label>
        <label class="uc-field">验证码<InputOtp v-model="otp" :length="4" /></label>
      </div>
    </div>

    <div class="uc-block">
      <div id="form-choice-extras" class="uc-title">CascadeSelect / ColorPicker / Knob / ToggleButton</div>
      <div class="uc-stage uc-stage--center">
        <CascadeSelect
          v-model="cascadeValue"
          :options="cascadeOptions"
          option-label="label"
          option-group-label="label"
          :option-group-children="['children']"
          placeholder="选择研究方向"
        />
        <label class="uc-inline">品牌色 <ColorPicker v-model="color" /></label>
        <Knob v-model="knob" :size="72" />
        <ToggleButton v-model="toggle" on-label="已启用" off-label="未启用" on-icon="pi pi-check" off-icon="pi pi-times" />
      </div>
    </div>

    <div class="uc-block">
      <div id="form-group-extras" class="uc-title">选择组 / IftaLabel / Fluid</div>
      <div class="uc-stage uc-stage--col">
        <CheckboxGroup v-model="checkedTopics" class="uc-inline">
          <label v-for="topic in ['Diffusion', 'RLHF', 'Multimodal']" :key="topic" class="uc-inline">
            <Checkbox :input-id="`topic-${topic}`" :value="topic" />
            <span>{{ topic }}</span>
          </label>
        </CheckboxGroup>
        <RadioButtonGroup v-model="selectedStyle" class="uc-inline">
          <label class="uc-inline"><RadioButton input-id="style-apa" value="apa" /> APA</label>
          <label class="uc-inline"><RadioButton input-id="style-gbt" value="gbt" /> GB/T</label>
        </RadioButtonGroup>
        <div class="uc-form-row">
          <IftaLabel>
            <InputText id="ifta-title" model-value="MangoWrite" />
            <label for="ifta-title">常驻标签</label>
          </IftaLabel>
          <Fluid><InputText model-value="Fluid 容器内的输入框占满可用宽度" /></Fluid>
        </div>
      </div>
    </div>
  </section>

  <section id="chapter-menu-extras" class="uc-chapter">
    <div class="uc-kicker">07 · Navigation</div>
    <h2 class="uc-h2">按钮与菜单族</h2>

    <div class="uc-block">
      <div id="menu-button-extras" class="uc-title">ButtonGroup / SplitButton / SpeedDial</div>
      <div class="uc-stage uc-stage--center">
        <ButtonGroup>
          <Button label="引用" icon="pi pi-quote" />
          <Button icon="pi pi-star" severity="secondary" aria-label="收藏" />
          <Button icon="pi pi-ellipsis-v" severity="secondary" aria-label="更多" />
        </ButtonGroup>
        <SplitButton label="保存" icon="pi pi-save" :model="actionItems" @click="notify('已保存')" />
        <SpeedDial :model="speedDialItems" direction="right" type="linear" />
      </div>
    </div>

    <div class="uc-block">
      <div id="menu-navigation-extras" class="uc-title">ContextMenu / TieredMenu / Menubar / MegaMenu / PanelMenu / Dock</div>
      <div class="uc-stage uc-stage--col">
        <div class="uc-context" @contextmenu.prevent="contextMenu?.show($event)">
          在此区域右键或长按打开 ContextMenu
        </div>
        <ContextMenu ref="contextMenu" :model="menuItems" />
        <TieredMenu :model="menuItems" class="tw:w-full md:tw:w-64" />
        <Menubar :model="menuItems" />
        <MegaMenu :model="megaMenuItems" />
        <PanelMenu :model="menuItems" class="tw:w-full md:tw:w-80" />
        <div class="uc-dock"><Dock :model="dockItems" position="bottom" /></div>
      </div>
    </div>
  </section>

  <section id="chapter-data-extras" class="uc-chapter">
    <div class="uc-kicker">08 · Data & Panels</div>
    <h2 class="uc-h2">数据重排与面板</h2>

    <div class="uc-block">
      <div id="data-reorder-extras" class="uc-title">OrderList / PickList</div>
      <div class="uc-stage uc-stage--col">
        <OrderList v-model="orderItems" class="tw:w-full" header="拖动排序">
          <template #item="{ item }"><span class="tw:p-2">{{ item }}</span></template>
        </OrderList>
        <PickList v-model="pickList" class="tw:w-full" source-header="候选主题" target-header="已选主题">
          <template #item="{ item }"><span class="tw:p-2">{{ item }}</span></template>
        </PickList>
      </div>
    </div>

    <div class="uc-block">
      <div id="data-tree-extras" class="uc-title">OrganizationChart / TreeTable / VirtualScroller</div>
      <div class="uc-stage uc-stage--col">
        <OrganizationChart :value="organization" class="tw:w-full">
          <template #default="{ node }"><span>{{ node.label }}</span></template>
        </OrganizationChart>
        <TreeTable :value="treeNodes" class="tw:w-full">
          <Column field="name" header="名称" expander />
          <Column field="kind" header="类型" />
          <Column field="count" header="数量" />
        </TreeTable>
        <VirtualScroller :items="virtualItems" :item-size="36" class="uc-virtual">
          <template #item="{ item }"><div class="uc-virtual__row">{{ item }}</div></template>
        </VirtualScroller>
      </div>
    </div>

    <div class="uc-block">
      <div id="data-panel-extras" class="uc-title">Fieldset / Panel / Toolbar / DeferredContent</div>
      <div class="uc-stage uc-stage--col">
        <Fieldset legend="筛选条件" toggleable>按年份、分区和主题缩小文献范围。</Fieldset>
        <Panel header="文献摘要" toggleable>面板支持折叠，并可通过插槽提供图标与操作。</Panel>
        <Toolbar>
          <template #start><strong>文献工具</strong></template>
          <template #center><span class="tw:text-muted">3 条结果</span></template>
          <template #end><Button label="导入" icon="pi pi-plus" /></template>
        </Toolbar>
        <DeferredContent @load="deferredLoaded = true">
          <div class="uc-inline"><i class="pi pi-check-circle" />{{ deferredLoaded ? "延迟内容已加载" : "进入视口后加载" }}</div>
        </DeferredContent>
      </div>
    </div>
  </section>

  <section id="chapter-media-extras" class="uc-chapter">
    <div class="uc-kicker">09 · Feedback & Media</div>
    <h2 class="uc-h2">反馈、媒体与杂项</h2>

    <div class="uc-block">
      <div id="media-feedback-extras" class="uc-title">BlockUI / Inplace / ConfirmPopup / DynamicDialog / ScrollTop</div>
      <div class="uc-stage uc-stage--col">
        <BlockUI :blocked="blocked">
          <div class="uc-panel">可交互内容区域，BlockUI 启用后不能操作。</div>
        </BlockUI>
        <div class="uc-inline">
          <Button :label="blocked ? '解除阻塞' : '阻塞内容'" severity="secondary" @click="blocked = !blocked" />
          <Button label="ConfirmPopup" severity="secondary" @click="confirmInline" />
          <Button label="DynamicDialog" severity="secondary" @click="openDynamicDialog" />
        </div>
        <Inplace closable>
          <template #display><span>点击编辑文献标题</span></template>
          <template #content><InputText model-value="Direct Preference Optimization" autofocus /></template>
        </Inplace>
        <div class="uc-scrolltop">
          <p v-for="n in 10" :key="n" class="tw:m-0 tw:p-2">滚动内容 {{ n }}</p>
          <ScrollTop target="parent" :threshold="40" icon="pi pi-arrow-up" />
        </div>
      </div>
    </div>

    <div class="uc-block">
      <div id="media-image-extras" class="uc-title">Image / ImageCompare / Carousel / Galleria</div>
      <div class="uc-stage uc-stage--col">
        <div class="uc-media-grid">
          <Image :src="imageBefore" alt="可预览的研究示意图" preview width="240" />
          <ImageCompare class="uc-image-compare">
            <template #left><img :src="imageBefore" alt="原始图" /></template>
            <template #right><img :src="imageAfter" alt="处理后图" /></template>
          </ImageCompare>
        </div>
        <Carousel :value="carouselItems" :num-visible="1" :num-scroll="1">
          <template #item="{ data }"><div class="uc-carousel-card"><strong>{{ data.title }}</strong><span>{{ data.meta }}</span></div></template>
        </Carousel>
        <Galleria :value="galleryImages" :num-visible="2" class="tw:w-full">
          <template #item="{ item }"><img :src="item.src" :alt="item.alt" class="uc-gallery-image" /></template>
          <template #thumbnail="{ item }"><img :src="item.src" :alt="item.alt" class="uc-gallery-thumb" /></template>
        </Galleria>
      </div>
    </div>

    <div class="uc-block">
      <div id="media-misc-extras" class="uc-title">AvatarGroup / OverlayBadge / MeterGroup / Terminal</div>
      <div class="uc-stage uc-stage--col">
        <div class="uc-inline">
          <AvatarGroup>
            <Avatar label="LY" shape="circle" />
            <Avatar label="ZS" shape="circle" />
            <Avatar label="+3" shape="circle" />
          </AvatarGroup>
          <OverlayBadge value="3" severity="danger"><Button icon="pi pi-bell" severity="secondary" aria-label="通知" /></OverlayBadge>
        </div>
        <MeterGroup :value="meterValues" class="tw:w-full" />
        <Terminal welcome-message="MangoWrite UI Terminal，输入任意命令查看响应" prompt="mango-ui >" class="tw:w-full" />
      </div>
    </div>
  </section>

  <section id="chapter-ui-package" class="uc-chapter">
    <div class="uc-kicker">10 · MangoWrite UI</div>
    <h2 class="uc-h2">UI 包公开组件</h2>

    <div class="uc-block">
      <div id="package-lightbox" class="uc-title">ImageLightbox · 缩放、旋转、拖动与焦点管理</div>
      <div class="uc-stage">
        <button type="button" class="uc-lightbox-trigger" @click="lightboxOpen = true">
          <img :src="imageBefore" alt="点击打开研究示意图灯箱" />
          <span>打开 ImageLightbox</span>
        </button>
      </div>
      <ImageLightbox v-model:visible="lightboxOpen" :src="imageBefore" alt="研究示意图" caption="MangoWrite UI · ImageLightbox" />
    </div>

    <div class="uc-block">
      <div id="package-site-chrome" class="uc-title">SiteHeader / SiteFooter · 可注入导航、品牌与合规内容</div>
      <div class="uc-stage uc-stage--col uc-site-chrome">
        <SiteHeader :items="siteNavItems" home-href="#chapter-ui-package" :show-theme="false" />
        <div class="uc-site-content">站点正文内容区域</div>
        <SiteFooter :socials="[]" home-href="#chapter-ui-package">
          <a href="#chapter-foundations">设计基建</a>
          <a href="#chapter-form-extras">表单组件</a>
          <template #legal><span>MangoWrite UI component showcase</span></template>
        </SiteFooter>
      </div>
    </div>
  </section>
</template>

<style scoped>
.uc-chapter {
  padding-top: 40px;
}

.uc-kicker {
  color: var(--color-brand-600);
  font-family: var(--font-family-mono);
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.uc-h2 {
  margin: 8px 0 20px;
  font-size: 22px;
  letter-spacing: -0.015em;
}

.uc-block {
  margin-bottom: 16px;
  padding: 18px 20px 22px;
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-lg);
  background: var(--color-surface-base);
  box-shadow: var(--shadow-xs);
}

.uc-title {
  margin-bottom: 12px;
  color: var(--color-text-secondary);
  font-size: 12px;
  font-weight: 600;
  scroll-margin-top: 16px;
}

.uc-stage {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  padding: 18px;
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-md);
}

.uc-stage--col {
  flex-direction: column;
}

.uc-stage--center {
  align-items: center;
}

.uc-field {
  min-width: 180px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  color: var(--color-text-secondary);
  font-size: 12px;
}

.uc-inline {
  display: inline-flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
}

.uc-form-row {
  display: grid;
  grid-template-columns: minmax(180px, 1fr) minmax(240px, 2fr);
  gap: 16px;
}

.uc-context,
.uc-panel {
  padding: 24px;
  border: 1px dashed var(--color-border-strong);
  border-radius: var(--radius-md);
  color: var(--color-text-secondary);
  text-align: center;
}

.uc-dock {
  position: relative;
  height: 180px;
  overflow: hidden;
  border-radius: var(--radius-md);
  background: var(--color-bg-soft);
}

.uc-virtual {
  width: 100%;
  height: 180px;
  border: 1px solid var(--color-border-subtle);
}

.uc-virtual__row {
  height: 36px;
  display: flex;
  align-items: center;
  padding: 0 12px;
  border-bottom: 1px solid var(--color-border-subtle);
}

.uc-scrolltop {
  position: relative;
  height: 140px;
  overflow: auto;
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-md);
}

.uc-media-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.uc-image-compare,
.uc-image-compare img {
  width: 100%;
  border-radius: var(--radius-md);
}

.uc-carousel-card {
  min-height: 120px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin: 4px;
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-md);
  background: var(--color-bg-soft);
}

.uc-carousel-card span {
  color: var(--color-text-secondary);
}

.uc-gallery-image {
  width: 100%;
  max-height: 360px;
  display: block;
  object-fit: contain;
}

.uc-gallery-thumb {
  width: 72px;
  display: block;
}

.uc-lightbox-trigger {
  width: 240px;
  padding: 0;
  overflow: hidden;
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-md);
  background: var(--color-surface-base);
  color: var(--color-text-primary);
  cursor: pointer;
}

.uc-lightbox-trigger img {
  width: 100%;
  display: block;
}

.uc-lightbox-trigger span {
  display: block;
  padding: 10px;
}

.uc-site-chrome {
  padding: 0;
  overflow: hidden;
}

.uc-site-chrome :deep(.mw-site-header) {
  position: relative;
  inset: auto;
}

.uc-site-content {
  min-height: 100px;
  display: grid;
  place-items: center;
  color: var(--color-text-secondary);
}

.uc-site-chrome :deep(.mw-site-footer__links a) {
  margin-right: 16px;
}

@media (max-width: 640px) {
  .uc-block {
    padding: 14px;
  }

  .uc-stage {
    padding: 12px;
  }

  .uc-form-row,
  .uc-media-grid {
    grid-template-columns: 1fr;
  }
}
</style>
