<script setup lang="ts">
import { ref } from "vue";
import {
  Avatar,
  Badge,
  Button,
  Checkbox,
  ConfirmHost,
  Dialog,
  FormField,
  InputText,
  Message,
  Popover,
  ProgressBar,
  Select,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Tag,
  Textarea,
  ToastHost,
  ToggleSwitch,
  useConfirm,
  useNotify,
} from "../../src";

const notify = useNotify();
const confirm = useConfirm();

const textVal = ref("Mango 静态原语");
const textInvalid = ref("invalid@");
const areaVal = ref("第一行：支持中文输入法组合态（IME）与自动增高。\n第二行：与 FormField 无障碍属性联动。");

const checkBinary = ref(true);
const checkIndeterminate = ref(false);
const checkGroup = ref<string[]>(["reka"]);
const switchOn = ref(true);
const switchOff = ref(false);

const selectVal = ref< string | number | boolean | null >(0);
const selectOptions = [
  { label: "零值选项 (0)", value: 0 },
  { label: "布尔假选项 (false)", value: false },
  { label: "空串选项 (\"\")", value: "" },
  { label: "标准选项 (mango)", value: "mango" },
  { label: "禁用选项", value: "disabled", disabled: true },
];

const activeTab = ref<string | number>("controls");
const dialogOpen = ref(false);
const popoverOpen = ref(false);
const imperativePopover = ref<InstanceType<typeof Popover> | null>(null);
const lastConfirmResult = ref<string>("尚未触发");

async function askNormalConfirm() {
  const ok = await confirm.ask({
    title: "发布版本确认",
    message: "确认将当前草稿发布为正式版本吗？",
    acceptLabel: "确认发布",
    rejectLabel: "取消",
  });
  lastConfirmResult.value = ok ? "已确认 (true)" : "已取消 (false)";
}

async function askDangerConfirm() {
  const ok = await confirm.ask({
    title: "永久删除项目",
    message: "此操作不可撤销，默认焦点落在「取消」按钮上以防误触。",
    danger: true,
    acceptLabel: "永久删除",
    rejectLabel: "取消",
  });
  lastConfirmResult.value = ok ? "已执行删除 (true)" : "已安全取消 (false)";
}
</script>

<template>
  <section id="chapter-mango-p2" class="ks-chapter">
    <div class="ks-kicker">P2 · Mango Static Primitives &amp; Global Services</div>
    <h2 class="ks-h2">Mango 基础原语与全局服务状态矩阵（Reka + Static CSS）</h2>

    <!-- 1. Button 状态矩阵 -->
    <div class="ks-block">
      <div id="p2-button-matrix" class="ks-block-title">Button · 语义色 / 变体 / 尺寸 / 状态矩阵</div>
      <div class="ks-stage">
        <Button label="Primary" severity="primary" />
        <Button label="Secondary" severity="secondary" />
        <Button label="Success" severity="success" />
        <Button label="Info" severity="info" />
        <Button label="Warn" severity="warn" />
        <Button label="Danger" severity="danger" />
        <Button label="Contrast" severity="contrast" />
        <Button label="Outlined" variant="outlined" severity="secondary" />
        <Button label="Text" variant="text" severity="secondary" />
        <Button label="Link" variant="link" />
        <Button label="Small" size="sm" severity="secondary" />
        <Button label="Large" size="lg" severity="secondary" />
        <Button label="Loading" :loading="true" />
        <Button label="Disabled" :disabled="true" />
        <Button icon="pi pi-search" aria-label="搜索" severity="secondary" variant="outlined" />
      </div>
    </div>

    <!-- 2. InputText / Textarea / FormField 状态矩阵 -->
    <div class="ks-block">
      <div id="p2-input-matrix" class="ks-block-title">InputText &amp; Textarea · 状态矩阵（Default / Readonly / Disabled / Invalid）</div>
      <div class="ks-stage">
        <FormField input-id="p2-input-default" label="标准输入" hint="支持 IME 组合输入" v-slot="{ inputId, describedBy }">
          <InputText :input-id="inputId" v-model="textVal" :aria-describedby="describedBy" placeholder="请输入" />
        </FormField>
        <FormField input-id="p2-input-readonly" label="只读态 (Readonly)" v-slot="{ inputId }">
          <InputText :input-id="inputId" model-value="只读内容不可改" readonly />
        </FormField>
        <FormField input-id="p2-input-disabled" label="禁用态 (Disabled)" v-slot="{ inputId }">
          <InputText :input-id="inputId" model-value="已禁用输入" disabled />
        </FormField>
        <FormField
          input-id="p2-input-invalid"
          label="错误态 (Invalid)"
          error="邮箱格式不合法"
          required
          v-slot="{ inputId, describedBy, invalid, required }"
        >
          <InputText
            :input-id="inputId"
            v-model="textInvalid"
            :aria-describedby="describedBy"
            :invalid="invalid"
            :required="required"
          />
        </FormField>
      </div>
      <div class="ks-stage">
        <FormField input-id="p2-textarea-auto" label="Textarea (AutoResize)" class="tw:w-full" v-slot="{ inputId }">
          <Textarea :input-id="inputId" v-model="areaVal" auto-resize fluid />
        </FormField>
      </div>
    </div>

    <!-- 3. Checkbox & ToggleSwitch 状态矩阵 -->
    <div class="ks-block">
      <div id="p2-check-switch-matrix" class="ks-block-title">Checkbox &amp; ToggleSwitch · 二值 / 多选组 / 半选 / 禁用 / 错误态</div>
      <div class="ks-stage">
        <label class="tw:inline-flex tw:items-center tw:gap-2">
          <Checkbox v-model="checkBinary" binary input-id="p2-cb-bin" />
          <span>二值选中 ({{ checkBinary }})</span>
        </label>
        <label class="tw:inline-flex tw:items-center tw:gap-2">
          <Checkbox v-model="checkIndeterminate" binary indeterminate input-id="p2-cb-ind" />
          <span>半选态 (Indeterminate)</span>
        </label>
        <label class="tw:inline-flex tw:items-center tw:gap-2">
          <Checkbox v-model="checkGroup" value="reka" input-id="p2-cb-g1" />
          <span>多选组: Reka</span>
        </label>
        <label class="tw:inline-flex tw:items-center tw:gap-2">
          <Checkbox v-model="checkGroup" value="mango" input-id="p2-cb-g2" />
          <span>多选组: Mango</span>
        </label>
        <label class="tw:inline-flex tw:items-center tw:gap-2">
          <Checkbox :model-value="true" binary disabled input-id="p2-cb-dis" />
          <span>禁用勾选</span>
        </label>
        <label class="tw:inline-flex tw:items-center tw:gap-2">
          <Checkbox :model-value="false" binary invalid input-id="p2-cb-inv" />
          <span>校验失败 (Invalid)</span>
        </label>
      </div>
      <div class="ks-stage">
        <label class="tw:inline-flex tw:items-center tw:gap-2">
          <ToggleSwitch v-model="switchOn" input-id="p2-sw-on" />
          <span>开启 ({{ switchOn }})</span>
        </label>
        <label class="tw:inline-flex tw:items-center tw:gap-2">
          <ToggleSwitch v-model="switchOff" input-id="p2-sw-off" />
          <span>关闭 ({{ switchOff }})</span>
        </label>
        <label class="tw:inline-flex tw:items-center tw:gap-2">
          <ToggleSwitch :model-value="true" disabled input-id="p2-sw-dis" />
          <span>禁用态</span>
        </label>
        <label class="tw:inline-flex tw:items-center tw:gap-2">
          <ToggleSwitch :model-value="false" invalid input-id="p2-sw-inv" />
          <span>错误态</span>
        </label>
      </div>
    </div>

    <!-- 4. Select 状态矩阵 -->
    <div class="ks-block">
      <div id="p2-select-matrix" class="ks-block-title">Select · 合法零值/布尔假/空串、可过滤、清空、加载、错误与空态</div>
      <div class="ks-stage">
        <FormField input-id="p2-select-main" label="可搜索 + 可清空 (支持 0/false/'')" v-slot="{ inputId }">
          <Select
            :input-id="inputId"
            v-model="selectVal"
            :options="selectOptions"
            option-label="label"
            option-value="value"
            option-disabled="disabled"
            filter
            show-clear
            placeholder="请选择"
          />
        </FormField>
        <FormField input-id="p2-select-loading" label="加载态 (Loading)" v-slot="{ inputId }">
          <Select :input-id="inputId" :options="selectOptions" option-label="label" option-value="value" loading placeholder="正在加载" />
        </FormField>
        <FormField input-id="p2-select-disabled" label="禁用态 (Disabled)" v-slot="{ inputId }">
          <Select :input-id="inputId" :model-value="0" :options="selectOptions" option-label="label" option-value="value" disabled />
        </FormField>
        <FormField input-id="p2-select-invalid" label="错误态 (Invalid)" error="必选项不能为空" v-slot="{ inputId, invalid }">
          <Select :input-id="inputId" :model-value="null" :options="[]" :invalid="invalid" placeholder="空选项列表" />
        </FormField>
      </div>
    </div>

    <!-- 5. Tag / Badge / Avatar / ProgressBar / Message -->
    <div class="ks-block">
      <div id="p2-display-feedback-matrix" class="ks-block-title">Tag · Badge · Avatar · ProgressBar · Message</div>
      <div class="ks-stage">
        <Tag value="Primary" severity="primary" />
        <Tag value="Secondary" severity="secondary" />
        <Tag value="Success" severity="success" />
        <Tag value="Info" severity="info" />
        <Tag value="Warn" severity="warn" />
        <Tag value="Danger" severity="danger" rounded />
        <Badge :value="8" severity="primary" />
        <Badge value="99+" severity="danger" />
        <Avatar label="MW" shape="circle" />
        <Avatar label="A" shape="square" size="large" />
      </div>
      <div class="ks-stage tw:flex-col tw:items-stretch">
        <ProgressBar :value="68" />
        <ProgressBar mode="indeterminate" :show-value="false" />
      </div>
      <div class="ks-stage tw:flex-col tw:items-stretch">
        <Message severity="info">提示信息：静态样式与设计 Token 已就绪。</Message>
        <Message severity="success" closable>成功反馈：已保存所有配置变更。</Message>
        <Message severity="warn">警告提示：存在待确认的高风险操作。</Message>
        <Message severity="error">错误提示：网络连接超时，请重试。</Message>
      </div>
    </div>

    <!-- 6. Tabs / Dialog / Popover / ToastHost / ConfirmHost -->
    <div class="ks-block">
      <div id="p2-overlay-service-matrix" class="ks-block-title">Tabs · Dialog · Popover · ToastHost · ConfirmHost</div>
      <div class="ks-stage tw:flex-col tw:items-stretch">
        <Tabs v-model="activeTab">
          <TabList>
            <Tab value="controls">浮层与全局服务操作台</Tab>
            <Tab value="details">无障碍与焦点说明</Tab>
            <Tab value="disabled" disabled>禁用页签</Tab>
          </TabList>
          <TabPanels>
            <TabPanel value="controls">
              <div class="tw:flex tw:flex-wrap tw:gap-3 tw:items-center tw:pt-2">
                <Button label="打开受控 Dialog" @click="dialogOpen = true" />
                <Popover v-model:open="popoverOpen">
                  <template #trigger>
                    <Button label="声明式 Popover" variant="outlined" severity="secondary" />
                  </template>
                  <div class="tw:text-sm tw:max-w-xs">
                    <strong>声明式浮层</strong>：支持 Esc 关闭与触发器焦点恢复。
                  </div>
                </Popover>
                <Button
                  label="命令式 Popover.toggle()"
                  variant="outlined"
                  severity="secondary"
                  @click="imperativePopover?.toggle($event)"
                />
                <Button
                  label="触发 Toast (Success)"
                  severity="success"
                  @click="notify.success('保存成功', '草稿已同步至云端')"
                />
                <Button
                  label="触发 Toast (Error)"
                  severity="danger"
                  variant="outlined"
                  @click="notify.error('同步失败', '请检查当前网络连接')"
                />
                <Button label="普通确认 (useConfirm.ask)" severity="secondary" @click="askNormalConfirm" />
                <Button label="危险确认 (聚焦取消)" severity="danger" @click="askDangerConfirm" />
                <span class="tw:text-xs tw:text-muted">最近确认结果：{{ lastConfirmResult }}</span>
              </div>
            </TabPanel>
            <TabPanel value="details">
              <p class="tw:text-sm tw:text-muted tw:m-0 tw:pt-2">
                所有浮层基于 Reka 原语实现：Esc 仅关闭最内层浮层，危险确认默认聚焦「取消」，离场动画结束后触发 afterLeave。
              </p>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </div>
    </div>

    <Dialog
      v-model:open="dialogOpen"
      title="Mango 受控对话框 (Reka Dialog)"
      description="默认 Esc 可关闭、点击遮罩不误关，支持最大化切换与 afterLeave 回调。"
      maximizable
    >
      <p class="tw:text-sm tw:m-0">
        在对话框内部操作下拉框或浮层不会误判为外部点击。
      </p>
      <template #footer>
        <Button label="取消" variant="text" severity="secondary" @click="dialogOpen = false" />
        <Button label="确定" @click="dialogOpen = false" />
      </template>
    </Dialog>

    <Popover ref="imperativePopover">
      <div class="tw:text-sm tw:w-56">
        <div class="tw:font-medium tw:mb-1">命令式锚点浮层</div>
        <p class="tw:text-muted tw:m-0">兼容存量 ref.toggle(event) 调用方式。</p>
      </div>
    </Popover>

    <ToastHost />
    <ConfirmHost />
  </section>
</template>
