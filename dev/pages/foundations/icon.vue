<script setup lang="ts">
import * as LucideIcons from "lucide-vue-next";
import {
  AlertTriangle,
  BookOpen,
  Check,
  CheckCircle2,
  Copy,
  Download,
  Info,
  Plus,
  Search,
  Settings2,
  Sparkles,
  XCircle,
} from "lucide-vue-next";
import { computed, ref, type Component } from "vue";
import {
  Button,
  IconField,
  InputIcon,
  InputText,
  SelectButton,
  Tag,
  useNotify,
} from "../../../src";
import DocPage from "../../kit/DocPage.vue";
import DocSection from "../../kit/DocSection.vue";
import Specimen from "../../kit/Specimen.vue";

type IconSizeKey = "xs" | "sm" | "md" | "lg" | "xl" | "2xl";

const sizeSpecs: Array<{
  key: IconSizeKey;
  px: string;
  usage: string;
}> = [
  { key: "xs", px: "12px", usage: "徽标内、复选指示器、紧凑标签辅助图标" },
  { key: "sm", px: "14px", usage: "xs / sm 控件（--control-icon）、caption 辅助行" },
  { key: "md", px: "16px", usage: "默认：md 控件（--control-icon）、菜单项、正文同行" },
  { key: "lg", px: "18px", usage: "lg 控件（--control-icon）、二级工具栏" },
  { key: "xl", px: "20px", usage: "导航主项、卡片头部、对话框标题旁" },
  { key: "2xl", px: "24px", usage: "空态主图标（AsyncSlot）、大头像" },
];

const controlSizes = ["xs", "sm", "md", "lg"] as const;

const semanticSamples = [
  { label: "--text-primary", colorVar: "var(--text-primary)", icon: BookOpen },
  { label: "--text-secondary", colorVar: "var(--text-secondary)", icon: Settings2 },
  { label: "--text-tertiary", colorVar: "var(--text-tertiary)", icon: Search },
  { label: "--text-accent", colorVar: "var(--text-accent)", icon: Sparkles },
  { label: "--info", colorVar: "var(--info)", icon: Info },
  { label: "--success", colorVar: "var(--success)", icon: CheckCircle2 },
  { label: "--warning", colorVar: "var(--warning)", icon: AlertTriangle },
  { label: "--danger", colorVar: "var(--danger)", icon: XCircle },
];

interface CatalogEntry {
  name: string;
  kebab: string;
  letter: string;
  component: Component;
}

function toKebabCase(str: string): string {
  return str
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1-$2")
    .toLowerCase();
}

const rawModule = LucideIcons as Record<string, unknown>;
const allKeys = new Set(Object.keys(rawModule));
const EXCLUDED_KEYS = new Set(["Icon", "createLucideIcon", "icons", "default"]);

const catalogEntries: CatalogEntry[] = Object.entries(rawModule)
  .filter(([key, val]) => {
    if (EXCLUDED_KEYS.has(key)) return false;
    if (!/^[A-Z]/.test(key)) return false;
    if (key.startsWith("Lucide")) return false;
    if (key.endsWith("Icon") && allKeys.has(key.slice(0, -4))) return false;
    return typeof val === "object" || typeof val === "function";
  })
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([name, component]) => ({
    name,
    kebab: toKebabCase(name),
    letter: name[0]?.toUpperCase() ?? "#",
    component: component as Component,
  }));

const searchQuery = ref("");
const activeSize = ref<IconSizeKey>("xl");
const showAll = ref(false);
const copiedName = ref<string | null>(null);
const notify = useNotify();

const INITIAL_CAP = 400;

const sizeOptions: Array<{ label: string; value: IconSizeKey }> = [
  { label: "xs (12px)", value: "xs" },
  { label: "sm (14px)", value: "sm" },
  { label: "md (16px)", value: "md" },
  { label: "lg (18px)", value: "lg" },
  { label: "xl (20px)", value: "xl" },
  { label: "2xl (24px)", value: "2xl" },
];

const filteredEntries = computed(() => {
  const q = searchQuery.value.trim().toLowerCase();
  if (!q) return catalogEntries;
  return catalogEntries.filter(
    (entry) =>
      entry.name.toLowerCase().includes(q) || entry.kebab.includes(q),
  );
});

const displayedEntries = computed(() => {
  if (searchQuery.value.trim() || showAll.value) {
    return filteredEntries.value;
  }
  return filteredEntries.value.slice(0, INITIAL_CAP);
});

const groupedEntries = computed(() => {
  const map = new Map<string, CatalogEntry[]>();
  for (const item of displayedEntries.value) {
    const bucket = map.get(item.letter);
    if (bucket) {
      bucket.push(item);
    } else {
      map.set(item.letter, [item]);
    }
  }
  return Array.from(map.entries()).map(([letter, items]) => ({ letter, items }));
});

const hasMore = computed(
  () =>
    !searchQuery.value.trim() &&
    !showAll.value &&
    filteredEntries.value.length > INITIAL_CAP,
);

let copyResetTimer: ReturnType<typeof setTimeout> | null = null;

async function copyIconImport(entry: CatalogEntry) {
  const snippet = `import { ${entry.name} } from "lucide-vue-next";`;
  try {
    await navigator.clipboard?.writeText(snippet);
  } catch {
    // 忽略无剪贴板权限环境
  }
  copiedName.value = entry.name;
  if (copyResetTimer) clearTimeout(copyResetTimer);
  copyResetTimer = setTimeout(() => {
    copiedName.value = null;
  }, 2000);
  notify.success(`已复制：${snippet}`);
}
</script>

<template>
  <DocPage
    lead="全站统一使用 lucide-vue-next 矢量组件：24×24 视口、统一 --icon-stroke (1.75) 描边、圆端圆角连接、跟随 currentColor。图标尺寸来自六档 --icon-* 或控件密度上下文 --control-icon，不跟随字号。"
  >
    <DocSection
      title="笔触与尺寸阶梯"
      desc="六档图标尺寸 token（--icon-xs 至 --icon-2xl），全局由 base.css 统一注入 stroke-width: var(--icon-stroke) (1.75)，无需逐处手写 strokeWidth。"
    >
      <table class="doc-table">
        <thead>
          <tr>
            <th>Token</th>
            <th>像素值</th>
            <th>预览</th>
            <th>典型场景</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="spec in sizeSpecs" :key="spec.key">
            <td><code>--icon-{{ spec.key }}</code></td>
            <td><code>{{ spec.px }}</code></td>
            <td>
              <div class="doc-row">
                <BookOpen
                  class="mw-icon"
                  :style="{ '--mw-icon-size': `var(--icon-${spec.key})` }"
                />
                <Sparkles
                  class="mw-icon"
                  :style="{ '--mw-icon-size': `var(--icon-${spec.key})` }"
                />
                <Settings2
                  class="mw-icon"
                  :style="{ '--mw-icon-size': `var(--icon-${spec.key})` }"
                />
              </div>
            </td>
            <td class="doc-note">{{ spec.usage }}</td>
          </tr>
        </tbody>
      </table>
    </DocSection>

    <DocSection
      title="与控件密度配对 (--control-icon)"
      desc="按钮、输入框、菜单项内的图标跟随所属尺寸档的 --control-icon（xs/sm 为 14px，md 为 16px，lg 为 18px）；纯图标按钮恒为正方形。"
    >
      <Specimen themes="single">
        <Button
          v-for="s in controlSizes"
          :key="s"
          :size="s"
          severity="secondary"
          :icon="Settings2"
          :aria-label="`${s} 设置`"
        />
        <Button
          v-for="s in controlSizes"
          :key="`label-${s}`"
          :size="s"
          severity="secondary"
          :icon="Download"
          :label="`${s} 导出`"
        />
        <Button
          v-for="s in controlSizes"
          :key="`primary-${s}`"
          :size="s"
          severity="primary"
          :icon="Plus"
          :label="`${s} 新建`"
        />
      </Specimen>
    </DocSection>

    <DocSection
      title="语义色彩继承 (currentColor)"
      desc="Lucide SVG 的 stroke 恒为 currentColor，直接继承父容器的文字或状态语义 token，明暗两套主题自动适配。"
    >
      <Specimen themes="both">
        <div
          v-for="item in semanticSamples"
          :key="item.label"
          class="icon-semantic-chip"
          :style="{ color: item.colorVar }"
        >
          <component
            :is="item.icon"
            class="mw-icon"
            :style="{ '--mw-icon-size': 'var(--icon-lg)' }"
          />
          <code>{{ item.label }}</code>
        </div>
      </Specimen>
    </DocSection>

    <DocSection title="规则">
      <ul class="doc-rules">
        <li data-kind="do">
          组件图标属性统一传 Vue 组件（如 <code>:icon="Plus"</code>），行内直接使用
          <code>&lt;Search class="mw-icon" /&gt;</code>。
        </li>
        <li data-kind="do">
          图标跟随 <span class="doc-code">currentColor</span>；装饰性图标用
          <span class="doc-code">--text-tertiary</span>，可交互图标跟随控件文字色。
        </li>
        <li data-kind="do">
          icon-only 控件必须提供可访问名称（<code>aria-label</code>）并配 <code>v-tooltip</code>。
        </li>
        <li data-kind="dont">
          禁止使用字体图标类名或字符串图标名（由 <code>check-tokens.mjs</code> 门禁拦截）。
        </li>
        <li data-kind="dont">
          同一区块不混用实心填充与线性描边；不用 emoji 代替功能图标；不在业务代码中手写裸 SVG。
        </li>
      </ul>
    </DocSection>

    <DocSection
      title="Lucide 图标目录 (Lucide Catalog)"
      :desc="`共收录 ${catalogEntries.length} 个去重后的 Lucide 图标组件。支持按 PascalCase 或 kebab-case 实时检索，点击任意卡片即可复制 import 语句。`"
    >
      <div class="icon-catalog-toolbar">
        <IconField class="icon-catalog-search">
          <InputIcon>
            <Search />
          </InputIcon>
          <InputText
            v-model="searchQuery"
            placeholder="搜索图标名称（如 Search、book-open、arrow-up）…"
            aria-label="搜索 Lucide 图标"
          />
        </IconField>

        <SelectButton
          v-model="activeSize"
          :options="sizeOptions"
          option-label="label"
          option-value="value"
          size="sm"
          aria-label="预览图标尺寸"
        />

        <Tag
          severity="secondary"
          :value="`匹配 ${filteredEntries.length} / ${catalogEntries.length}`"
        />
      </div>

      <div v-if="copiedName" class="icon-catalog-banner" role="status">
        <Check class="mw-icon" />
        <span>
          已复制 <code>import { {{ copiedName }} } from "lucide-vue-next";</code>
        </span>
      </div>

      <div v-if="groupedEntries.length" class="icon-catalog-groups">
        <section
          v-for="group in groupedEntries"
          :key="group.letter"
          class="icon-catalog-group"
        >
          <header class="icon-catalog-group__header">
            <span class="icon-catalog-group__letter">{{ group.letter }}</span>
            <span class="doc-note">{{ group.items.length }}</span>
          </header>

          <div class="icon-catalog-grid">
            <button
              v-for="entry in group.items"
              :key="entry.name"
              type="button"
              class="icon-catalog-card"
              :class="{ 'icon-catalog-card--copied': copiedName === entry.name }"
              :title="`点击复制 import { ${entry.name} } from 'lucide-vue-next'`"
              @click="copyIconImport(entry)"
            >
              <span class="icon-catalog-card__preview">
                <component
                  :is="entry.component"
                  class="mw-icon"
                  :style="{ '--mw-icon-size': `var(--icon-${activeSize})` }"
                />
              </span>
              <span class="icon-catalog-card__name">{{ entry.name }}</span>
              <span class="icon-catalog-card__kebab">{{ entry.kebab }}</span>
              <Copy class="icon-catalog-card__copy" aria-hidden="true" />
            </button>
          </div>
        </section>
      </div>

      <div v-else class="icon-catalog-empty">
        <p class="doc-note">未找到匹配「{{ searchQuery }}」的图标。</p>
        <Button
          size="sm"
          severity="secondary"
          variant="outlined"
          label="清空搜索"
          @click="searchQuery = ''"
        />
      </div>

      <div v-if="hasMore" class="icon-catalog-more">
        <Button
          severity="secondary"
          variant="outlined"
          :label="`显示全部 ${filteredEntries.length} 个图标（当前仅展示前 ${INITIAL_CAP} 个）`"
          @click="showAll = true"
        />
      </div>
    </DocSection>
  </DocPage>
</template>

<style scoped>
.icon-semantic-chip {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-1-5) var(--space-2-5);
  border-radius: var(--radius-sm);
  border: var(--border-width) solid var(--border-subtle);
  background: var(--fill-subtle);
}

.icon-semantic-chip code {
  font-family: var(--font-mono);
  font-size: var(--type-caption-size);
  color: var(--text-secondary);
}

.icon-catalog-toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-3);
  margin-bottom: var(--space-4);
}

.icon-catalog-search {
  flex: 1 1 260px;
  min-width: 220px;
}

.icon-catalog-banner {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin-bottom: var(--space-4);
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-md);
  border: var(--border-width) solid var(--success-border);
  background: var(--success-subtle);
  color: var(--success-text);
  font-size: var(--type-body-sm-size);
}

.icon-catalog-banner code {
  font-family: var(--font-mono);
  font-size: var(--type-caption-size);
}

.icon-catalog-groups {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.icon-catalog-group__header {
  display: flex;
  align-items: baseline;
  gap: var(--space-2);
  margin-bottom: var(--space-2);
  padding-bottom: var(--space-1);
  border-bottom: var(--border-width) solid var(--border-subtle);
}

.icon-catalog-group__letter {
  font-size: var(--type-title-sm-size);
  font-weight: var(--weight-semibold);
  color: var(--text-primary);
}

.icon-catalog-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(136px, 1fr));
  gap: var(--space-2);
}

.icon-catalog-card {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-1);
  padding: var(--space-3) var(--space-2);
  border: var(--border-width) solid var(--border-subtle);
  border-radius: var(--radius-md);
  background: var(--bg-raised);
  color: var(--text-primary);
  font-family: var(--font-sans);
  text-align: center;
  cursor: pointer;
  transition:
    background-color var(--duration-fast) var(--ease-standard),
    border-color var(--duration-fast) var(--ease-standard),
    color var(--duration-fast) var(--ease-standard);
}

.icon-catalog-card:hover {
  background: var(--fill-subtle);
  border-color: var(--border-strong);
}

.icon-catalog-card:focus-visible {
  outline: var(--focus-width) solid var(--focus-color);
  outline-offset: var(--focus-offset);
}

.icon-catalog-card--copied {
  border-color: var(--accent);
  background: var(--accent-subtle);
}

.icon-catalog-card__preview {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: var(--size-md-h);
  color: var(--text-primary);
}

.icon-catalog-card__name {
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-family: var(--font-mono);
  font-size: var(--type-caption-size);
  font-weight: var(--weight-medium);
  color: var(--text-primary);
}

.icon-catalog-card__kebab {
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-family: var(--font-mono);
  font-size: var(--type-micro-size);
  color: var(--text-tertiary);
}

.icon-catalog-card__copy {
  position: absolute;
  top: var(--space-1-5);
  right: var(--space-1-5);
  width: var(--icon-xs);
  height: var(--icon-xs);
  color: var(--text-tertiary);
  opacity: 0;
  transition: opacity var(--duration-fast) var(--ease-standard);
}

.icon-catalog-card:hover .icon-catalog-card__copy {
  opacity: 1;
}

.icon-catalog-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-10) var(--space-4);
  text-align: center;
}

.icon-catalog-more {
  display: flex;
  justify-content: center;
  margin-top: var(--space-6);
}
</style>
