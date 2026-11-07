import { h } from "vue";
import { ConfigRow, ConfigSection, InputNumber, ToggleSwitch, type ConfigRowStatusTone } from "../../../src";
import { sfc } from "../codegen";
import type { UsageEntry, UsageValues } from "../types";

export const usage: UsageEntry = {
  slug: "config-section",
  component: ConfigRow,
  tag: "ConfigRow",
  extraTags: ["ConfigSection"],
  flatPreview: true,
  controls: [
    { prop: "title", label: "分组标题 (ConfigSection)", kind: "text", default: "并发与速率护栏" },
    { prop: "label", label: "配置项标签", kind: "text", default: "免费档日配额上限" },
    { prop: "keyHint", label: "配置键名提示", kind: "text", default: "billing.daily_free_tokens" },
    { prop: "hint", label: "右侧说明文案", kind: "text", default: "每日凌晨自动重置的基础推理额度。" },
    { prop: "status", label: "底部状态行", kind: "text", default: "当前生效值：50,000 tokens / 日" },
    {
      prop: "statusTone",
      label: "状态行色调",
      kind: "enum",
      default: "success",
      options: [
        { label: "默认柔和 (muted)", value: "muted" },
        { label: "成功 (success)", value: "success" },
        { label: "警告 (warning)", value: "warning" },
        { label: "危险 (danger)", value: "danger" },
      ],
    },
  ],
  render: (v: UsageValues) =>
    h(
      ConfigSection,
      {
        title: (v.title as string) || undefined,
        style: "width: 100%;",
      },
      {
        default: () => [
          h(
            ConfigRow,
            {
              label: "开放自助注册",
              keyHint: "auth.signup_enabled",
              hint: "关闭后仅受邀链接可注册新账号。",
            },
            () => h(ToggleSwitch, { modelValue: true }),
          ),
          h(
            ConfigRow,
            {
              label: (v.label as string) ?? "免费档日配额上限",
              keyHint: (v.keyHint as string) || undefined,
              hint: (v.hint as string) || undefined,
              status: (v.status as string) || undefined,
              statusTone: (v.statusTone as ConfigRowStatusTone) ?? "muted",
            },
            () => h(InputNumber, { modelValue: 50000, min: 0, step: 5000 }),
          ),
        ],
      },
    ),
  code: (v: UsageValues) => {
    const rowAttrs = [
      `label="${v.label ?? "免费档日配额上限"}"`,
      v.keyHint ? `key-hint="${v.keyHint}"` : "",
      v.hint ? `hint="${v.hint}"` : "",
      v.status ? `status="${v.status}"` : "",
      v.status && v.statusTone && v.statusTone !== "muted" ? `status-tone="${v.statusTone}"` : "",
    ].filter(Boolean);
    return sfc({
      ui: ["ConfigSection", "ConfigRow", "ToggleSwitch", "InputNumber"],
      vue: ["ref"],
      setup: [
        "const signupEnabled = ref(true);",
        "const dailyTokens = ref(50000);",
      ],
      template: `<ConfigSection title="${v.title ?? "并发与速率护栏"}">
  <ConfigRow label="开放自助注册" key-hint="auth.signup_enabled" hint="关闭后仅受邀链接可注册新账号。">
    <ToggleSwitch v-model="signupEnabled" />
  </ConfigRow>
  <ConfigRow
    ${rowAttrs.join("\n    ")}
  >
    <InputNumber v-model="dailyTokens" :min="0" :step="5000" />
  </ConfigRow>
</ConfigSection>`,
    });
  },
};
