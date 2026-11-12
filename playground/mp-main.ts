import { createApp, defineComponent, h, ref } from "vue";
import "@mango-write/ui-core/tokens.css";
import "@mango-write/ui-mp/styles.css";
import "./mp-standalone.css";
import {
  MpButton,
  MpCell,
  MpCellGroup,
  MpComposer,
  MpFilterBar,
  MpFilterChip,
  MpIcon,
  MpNotice,
  MpPageHeader,
  MpSectionHeader,
  MpTabBar,
  MpThemeProvider,
  provideMpNotify,
  type ThemePreference,
} from "@mango-write/ui-mp";

const MpStandaloneApp = defineComponent({
  name: "MpStandalonePreview",
  setup() {
    const params = new URLSearchParams(window.location.search);
    const theme = ref<ThemePreference>(params.get("theme") === "dark" ? "dark" : "light");
    const tab = ref("journal");
    const collapsed = ref(false);
    const category = ref("全部");
    const message = ref("");
    const submitted = ref("");
    const categories = ["全部", "实验", "阅读"].map((id) => ({ id, label: id }));
    provideMpNotify();

    return () => h("div", { class: "mp-standalone" }, [
      h(MpThemeProvider, { theme: theme.value, class: "mp-standalone__theme" }, () => [
        h("main", { class: "mp-standalone__main" }, [
          h(
            MpPageHeader,
            {
              title: tab.value === "assistant" ? "AI 助手" : "科研日志",
              description: "真实组件组成的移动研究信息流",
            },
            {
              eyebrow: () => h(MpFilterChip, { label: "组件预览空间", selected: true }),
            },
          ),
          h(MpFilterBar, {
            modelValue: category.value,
            items: categories,
            "onUpdate:modelValue": (value: string) => { category.value = value; },
          }),
          h(MpSectionHeader, { title: "最近记录", meta: "2 条" }),
          h(MpCellGroup, { grouped: true }, () => [
            h(MpCell, {
              title: "长文档证据召回实验",
              subtitle: "ColBERTv2 重排提升 Top-5 召回率 6.4%。",
              meta: "实验记录 · 10 分钟前",
              clickable: true,
              arrow: true,
            }),
            h(MpCell, {
              title: "阅读 Attention Is All You Need",
              subtitle: "整理 RoPE 与 GQA 的显存占用对比。",
              meta: "阅读笔记 · 昨天",
              clickable: true,
              arrow: true,
            }),
          ]),
          submitted.value
            ? h(MpNotice, { severity: "success", title: "问题已提交" }, () => submitted.value)
            : null,
        ]),
        h(
          MpTabBar,
          {
            modelValue: tab.value,
            collapsed: collapsed.value,
            contained: true,
            items: [
              { id: "journal", label: "日志", icon: "journal" },
              { id: "library", label: "文库", icon: "library" },
              { id: "assistant", label: "AI 助手", icon: "assistant" },
            ],
            "onUpdate:modelValue": (value: string) => {
              tab.value = value;
              collapsed.value = value === "assistant";
            },
            "onUpdate:collapsed": (value: boolean) => {
              collapsed.value = value;
            },
          },
          {
            action: () =>
              tab.value === "journal"
                ? h(
                    MpButton,
                    { size: "lg", iconOnly: true, ariaLabel: "记录新日志" },
                    () => h(MpIcon, { name: "plus", size: 22 }),
                  )
                : null,
            composer: () =>
              h(MpComposer, {
                modelValue: message.value,
                inline: true,
                placeholder: "围绕当前空间提问…",
                "onUpdate:modelValue": (value: string) => { message.value = value; },
                onSubmit: (value: string) => { submitted.value = value; message.value = ""; },
              }),
          },
        ),
      ]),
    ]);
  },
});

createApp(MpStandaloneApp).mount("#mp-app");
