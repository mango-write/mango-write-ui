// 目录数据单源:侧栏、路由 meta、站内搜索与 gen-llms 都吃这一份。
// 纯字面量、不碰 import.meta.glob——gen-llms 在 node 里 transpile-import 本文件,
// vite 专属 API 会炸;load 挂载在 registry.ts。lead 是页首一句话简介,
// DocPage 头与 llms-full.txt 共用,改文案在这里改,别回页面里找。
import type { Bi } from "./i18n";

export interface DocEntry {
  slug: string;
  title: Bi;
  lead?: Bi;
}

export interface DocGroup {
  id: string;
  title: Bi;
  base: string;
  entries: DocEntry[];
}

function foundation(slug: string, title: Bi, lead?: Bi): DocEntry {
  return { slug, title, lead };
}

function component(slug: string, title: Bi, lead?: Bi): DocEntry {
  return { slug, title, lead };
}

export const docGroups: DocGroup[] = [
  {
    id: "getting-started",
    title: { zh: "上手", en: "Getting started" },
    base: "/getting-started",
    entries: [foundation("installation", { zh: "安装与上手", en: "Installation" })],
  },
  {
    id: "foundations",
    title: { zh: "基础", en: "Foundations" },
    base: "/foundations",
    entries: [
      foundation(
        "overview",
        { zh: "设计原则", en: "Principles" },
        {
          zh: "内容是纸，浮层是霜，橙色只给动作。研究者长时间面对文字与资料，界面要安静、可预测、层次一眼可辨。",
          en: "Content is paper, overlays are frost, and orange belongs to actions alone. Researchers live in text and sources for hours, so the interface must stay quiet, predictable, and legible at a glance.",
        },
      ),
      foundation(
        "color",
        { zh: "颜色", en: "Color" },
        {
          zh: "颜色只有三类工作：分层（面）、阅读（文字）、指向（强调与状态）。除了实心动作面，组件里的一切颜色都是半透明叠层。",
          en: "Color does only three jobs: layering (surfaces), reading (text), and pointing (accents and states). Except for solid action fills, every color in the components is a translucent overlay.",
        },
      ),
      foundation(
        "typography",
        { zh: "文字", en: "Typography" },
        {
          zh: "字号与行高成对出现，行高落在 4px 网格上。层级靠字重与颜色建立，不靠堆字号。",
          en: "Sizes pair with line heights, and line heights land on the 4px grid. Hierarchy comes from weight and color, not from stacking sizes.",
        },
      ),
      foundation(
        "size",
        { zh: "尺寸与间距", en: "Size & Spacing" },
        {
          zh: "一根尺寸轴派生控件的全部几何；4px 网格组织所有间距。密度由容器决定，不由组件各自决定。",
          en: "One size axis derives all control geometry; a 4px grid organizes all spacing. Density is decided by the container, not by each component.",
        },
      ),
      foundation(
        "radius",
        { zh: "圆角", en: "Radius" },
        {
          zh: "圆角表达「这是一件独立的东西」以及它的大小。越大的容器圆角越大；控件圆角随尺寸档走，不单独指定。",
          en: "Radius says \u201cthis is a distinct thing\u201d and how big it is. Larger containers get larger radii; control radii follow the size tier and are never set ad hoc.",
        },
      ),
      foundation(
        "elevation",
        { zh: "层级与阴影", en: "Elevation" },
        {
          zh: "写「第几层」，不写「要多重的阴影」。浅色靠阴影抬升，深色靠亮度抬升、阴影只负责分离。",
          en: "Specify which layer, not how heavy a shadow. In the light theme shadows lift; in the dark theme brightness lifts and shadows only separate.",
        },
      ),
      foundation(
        "frost",
        { zh: "霜材质", en: "Frost" },
        {
          zh: "霜是唯一的浮层材质：高不透明度的底色保证上层文字可读，模糊只负责暗示「底下还有东西」，配以克制的斜向微光与顶缘内高光，不做夸张折射。",
          en: "Frost is the only overlay material: a high-opacity base keeps text legible, blur merely hints at content beneath, and a restrained sheen with a top inner highlight replaces any exaggerated refraction.",
        },
      ),
      foundation(
        "motion",
        { zh: "动效", en: "Motion" },
        {
          zh: "动效解释因果：东西从哪来、到哪去、现在处于什么状态。它不表演，不抢注意力，只动 transform、opacity 与颜色。",
          en: "Motion explains cause and effect: where things come from, where they go, and what state they are in. It never performs or steals attention, and it animates only transform, opacity, and color.",
        },
      ),
      foundation(
        "icon",
        { zh: "图标", en: "Iconography" },
        {
          zh: "全站统一使用 lucide-vue-next 矢量组件：24×24 视口、统一 --icon-stroke (1.75) 描边、圆端圆角连接、跟随 currentColor。图标尺寸来自六档 --icon-* 或控件密度上下文 --control-icon，不跟随字号。",
          en: "The whole system uses lucide-vue-next vectors: a 24×24 viewport, a uniform --icon-stroke (1.75) stroke, rounded caps and joins, and currentColor. Icon sizes come from the six --icon-* tiers or the control-density context --control-icon, never from font size.",
        },
      ),
      foundation(
        "layout",
        { zh: "布局", en: "Layout" },
        {
          zh: "壳稳定、内容流动。工作台是一张画布上的几座浮岛；内容页把正文收在可读的行宽里；溢出容器的内容在出口方向渐隐收边。",
          en: "A stable shell with flowing content. Workbenches are a few floating islands on one canvas; content pages keep text within a readable measure; overflow fades out toward its exit edge.",
        },
      ),
    ],
  },
  {
    id: "actions",
    title: { zh: "操作", en: "Actions" },
    base: "/components",
    entries: [
      component(
        "button",
        { zh: "按钮", en: "Button" },
        {
          zh: "触发一个动作。按钮的视觉重量表达动作的重要性：一个区块只有一个实心主按钮，其余逐级降权。",
          en: "Triggers an action. A button's visual weight signals how important the action is: one solid primary button per block, the rest step down.",
        },
      ),
      component(
        "select-button",
        { zh: "分段选择", en: "SelectButton" },
        {
          zh: "分段控件：在 2–5 个互斥选项间切换视图或筛选范围。轨道是半透明填充，选中段抬起为控件面并带一层抬起阴影。",
          en: "A segmented control for switching views or filter scopes across 2–5 exclusive options. The track is a translucent fill; the selected segment lifts into a control surface with a raised shadow.",
        },
      ),
      component(
        "menu",
        { zh: "菜单", en: "Menu" },
        {
          zh: "命令菜单：展示分组命令、快捷键提示与分隔线。既可内联常驻为面板导航（popup: false），也可挂 popup 作为霜面下拉菜单（.mw-frost）锚定触发器弹出。",
          en: "A command menu with grouped items, shortcut hints, and separators. It can stay inline as panel navigation (popup: false) or anchor to a trigger as a frost dropdown via popup (.mw-frost).",
        },
      ),
      component(
        "action-menu",
        { zh: "对象菜单", en: "ActionMenu" },
        {
          zh: "对象动作菜单：面向文献卡片、列表行或编辑器块的上下文菜单（.mw-frost）。原生支持二级子菜单展开、右键坐标定位（contextmenu）、禁用原因 Tooltip 与全键盘方向键穿梭。",
          en: "A context menu for reference cards, list rows, or editor blocks (.mw-frost). Supports nested submenus, right-click positioning (contextmenu), disabled-reason tooltips, and full arrow-key navigation.",
        },
      ),
    ],
  },
  {
    id: "inputs",
    title: { zh: "输入", en: "Inputs" },
    base: "/components",
    entries: [
      component(
        "input-text",
        { zh: "文本框", en: "InputText" },
        {
          zh: "输入单行文本：标题、关键词、引用键、检索词。可输入面统一用半透明控件面，聚焦时边框转品牌色并带一圈晕。",
          en: "Single-line input for titles, keywords, cite keys, and search terms. Editable surfaces share one translucent control fill; focus turns the border brand-color with a soft halo.",
        },
      ),
      component(
        "textarea",
        { zh: "多行文本", en: "Textarea" },
        {
          zh: "输入多行文本：摘要、批注、给 AI 的指令。与单行输入框共享同一控件面与焦点晕，单行高度与同档控件对齐。",
          en: "Multi-line input for abstracts, annotations, and AI prompts. Shares the control fill and focus halo with InputText; its single-line height matches the same size tier.",
        },
      ),
      component(
        "input-number",
        { zh: "数字输入", en: "InputNumber" },
        {
          zh: "输入数值：字数上限、参考文献条数、比例、金额。按区间钳制，清空归 null，绝不静默产出 0。",
          en: "Numeric input for limits, reference counts, ratios, and amounts. Values clamp to the range, clearing yields null, and it never silently produces 0.",
        },
      ),
      component(
        "icon-field",
        { zh: "图标输入框", en: "IconField" },
        {
          zh: "在输入框内放一个提示图标：搜索、提及、加载中。图标取 --control-icon、颜色 --text-tertiary，输入框内距自动让位。",
          en: "A hint icon inside an input: search, mentions, loading. The icon takes --control-icon and --text-tertiary, and the input's padding yields automatically.",
        },
      ),
      component(
        "input-group",
        { zh: "输入组", en: "InputGroup" },
        {
          zh: "把输入框与前后缀、按钮拼成一个整体：DOI 前缀、单位、复制链接。各段共享同一控件面与 --control-h，附加段底色为 --fill-subtle。",
          en: "Joins an input with prefixes, suffixes, and buttons: DOI prefixes, units, copy links. All segments share one control surface and --control-h; addon segments sit on --fill-subtle.",
        },
      ),
      component(
        "form-field",
        { zh: "表单字段", en: "FormField" },
        {
          zh: "给控件配上常驻标签、说明与错误：负责 label 关联、aria-describedby 与错误播报，控件只需接住插槽传下来的状态。",
          en: "Pairs a control with a persistent label, hint, and error: it wires label association, aria-describedby, and error announcements, while the control just consumes the slot-passed state.",
        },
      ),
      component(
        "checkbox",
        { zh: "复选框", en: "Checkbox" },
        {
          zh: "复选框：在布尔开关或一组互不排斥的选项中勾选。未选态保持控件面与强边框，选中与半选态切换为品牌实心底与反白勾线。",
          en: "A checkbox for boolean toggles or groups of non-exclusive options. Unchecked keeps the control surface with a strong border; checked and indeterminate switch to a solid brand fill with a reversed check.",
        },
      ),
      component(
        "radio-button",
        { zh: "单选框", en: "RadioButton" },
        {
          zh: "单选按钮：在 2–5 个互斥选项中择一。未选态为圆形控件面与强边框，选中后填充品牌色并弹出中心圆点。",
          en: "A radio button for picking one of 2–5 exclusive options. Unchecked is a round control surface with a strong border; selected fills brand color and pops a center dot.",
        },
      ),
      component(
        "toggle-switch",
        { zh: "开关", en: "ToggleSwitch" },
        {
          zh: "拨动开关：切换即刻生效的二元状态。滑块始终是带抬起阴影的实体圆片，轨道在关闭态用 --fill-strong、开启态用品牌色。",
          en: "A switch for binary states that take effect immediately. The thumb is always a solid disc with a raised shadow; the track uses --fill-strong when off and brand color when on.",
        },
      ),
      component(
        "slider",
        { zh: "滑块", en: "Slider" },
        {
          zh: "滑动条：缺省无级连续拖动，显式传入 step 后按刻度吸附并可开启刻度标记。轨道用 --fill-strong，已填充段与手柄描边用品牌色，手柄本身为抬起实体面。",
          en: "A slider that drags continuously by default; pass step to snap to ticks and opt into tick marks. The track uses --fill-strong, the filled segment and thumb border use brand color, and the thumb is a raised solid surface.",
        },
      ),
      component(
        "color-picker",
        { zh: "取色器", en: "ColorPicker" },
        {
          zh: "选一个颜色：标签色、批注色、图表系列色。触发器是一个与控件同高的方形色块，面板由系统原生取色器提供（跟随系统主题）。",
          en: "Pick a color for tags, annotations, or chart series. The trigger is a square swatch at control height; the panel is the native system color picker (follows the system theme).",
        },
      ),
      component(
        "file-drop-zone",
        { zh: "文件拖放区", en: "FileDropZone" },
        {
          zh: "拖入或点击选择文件：导入 PDF、上传图片、合并文档。两条路径都归一成 File[]；过滤、上传与后续流程归调用方。",
          en: "Drop or click to pick files: import PDFs, upload images, merge documents. Both paths normalize to File[]; filtering, uploading, and everything after belong to the caller.",
        },
      ),
    ],
  },
  {
    id: "selection",
    title: { zh: "选择", en: "Selection" },
    base: "/components",
    entries: [
      component(
        "select",
        { zh: "下拉选择", en: "Select" },
        {
          zh: "下拉单选：从收起的候选列表中择一。触发器遵循控件面规范，展开面板为霜面浮层（mw-frost），选中项右侧带勾号。",
          en: "A dropdown for picking one option from a collapsed list. The trigger follows the control-surface spec, the open panel is a frost overlay (mw-frost), and the selected item gets a trailing check.",
        },
      ),
      component(
        "multi-select",
        { zh: "多选", en: "MultiSelect" },
        {
          zh: "下拉多选：在霜面弹出面板中勾选多个候选项。逗号拼接（comma）超出 maxSelectedLabels 自动收拢计数；可移除标签（chip）单行撑开、绝不竖向换行——宽度足够时控件撑长到恰好容纳，放不下自动折成 +N，悬停查看剩余。",
          en: "A dropdown for selecting multiple options in a frost panel. Comma-joined labels collapse into a count past maxSelectedLabels; removable chips stay on one line and never wrap vertically — the control grows to fit when there is room, otherwise folds into +N with the rest on hover.",
        },
      ),
      component(
        "searchable-select",
        { zh: "可搜索选择", en: "SearchableSelect" },
        {
          zh: "可搜索单选：收起态本身就是输入框，聚焦即可打字过滤，面板不再另起搜索行。输入框宽度通过隐藏镜像按文字真实宽度自适应收缩。",
          en: "A searchable single select whose collapsed state is itself the input: focus and type to filter, with no separate search row in the panel. The input width adapts to the real text width via a hidden mirror.",
        },
      ),
      component(
        "searchable-multi-select",
        { zh: "可搜索多选", en: "SearchableMultiSelect" },
        {
          zh: "可搜索多选：已选项以 chip 排在框内，尾随光标直接打字过滤；借助 ResizeObserver 与隐藏量算行按容器真实可用宽度动态折叠为 +N。",
          en: "A searchable multi select: selected chips sit inline and typing filters right after them; a ResizeObserver plus a hidden measurer folds overflow into +N based on the container's real available width.",
        },
      ),
      component(
        "async-search-select",
        { zh: "远程搜索选择", en: "AsyncSearchSelect" },
        {
          zh: "异步搜索选择：面向远端题录库、机构库或全量用户的防抖检索单选。内置请求竞态丢弃、已选 ID 回显（initialOption）与双行副标题展示。",
          en: "An async search select for debounced lookups against remote bibliographies, institutions, or the full user base. Bakes in stale-response dropping, selected-ID echo (initialOption), and two-line subtitles.",
        },
      ),
      component(
        "user-select",
        { zh: "成员选择", en: "UserSelect" },
        {
          zh: "成员多选：基于 SearchableMultiSelect 与 UserChip 组合封装。已选成员以带头像的紧凑胶囊呈现，下拉面板同时展示头像、姓名与邮箱，支持按姓名或邮箱子串过滤。",
          en: "A member picker built on SearchableMultiSelect and UserChip. Selected members render as compact pills with avatars, the panel lists avatar, name, and email, and filtering matches name or email substrings.",
        },
      ),
      component(
        "listbox",
        { zh: "列表框", en: "Listbox" },
        {
          zh: "列表框：常驻展开的单选或多选列表，支持内置关键词过滤与键盘上下巡航。",
          en: "A listbox: an always-expanded single- or multi-select list with built-in keyword filtering and keyboard navigation.",
        },
      ),
      component(
        "date-picker",
        { zh: "日期选择", en: "DatePicker" },
        {
          zh: "日期与时间选择：支持单日、起止区间、多日点选与时间步进器，同时允许按格式直接键入文本。输入框采用半透明控件面（.mw-control），展开的霜面日历浮层（.mw-frost）内部直接复用 Calendar 日期面板核，保持紧凑固定宽度。",
          en: "Date and time picking: single dates, ranges, multi-select, and time steppers, with direct text entry. The input uses the translucent control surface (.mw-control), and the frost overlay (.mw-frost) reuses Calendar at a compact fixed width.",
        },
      ),
      component(
        "calendar",
        { zh: "日期面板", en: "Calendar" },
        {
          zh: "常驻月历面板：提供年月下拉快选、跨月「回到今天」、单日/区间/多选与按日记录计数热力（手记时间流筛选），同时作为 DatePicker 的内嵌日历核（variant=\"plain\"）。",
          en: "An inline month calendar panel with a frost year-month quick switcher, cross-month “Back to today”, single/range/multiple selection, and per-day activity heat counts (research log filtering), also serving as DatePicker's calendar core (variant=\"plain\").",
        },
      ),
    ],
  },
  {
    id: "display",
    title: { zh: "展示", en: "Display" },
    base: "/components",
    entries: [
      component(
        "badge",
        { zh: "徽标", en: "Badge" },
        {
          zh: "紧凑计数与状态圆点：用于未读数、待处理提案数或轻量状态指示，字偶距固定为等宽数字（tabular-nums）。",
          en: "Compact counts and status dots for unread numbers, pending proposals, or light status hints, locked to tabular-nums.",
        },
      ),
      component(
        "tag",
        { zh: "标签", en: "Tag" },
        {
          zh: "语义标签：用于标记文献类型、审阅状态或属性分类。采用柔和着色底与语义正文色，不抢夺主操作焦点。",
          en: "A semantic tag for reference types, review states, or property categories. Soft tinted fill with semantic text color; never competes with the primary action.",
        },
      ),
      component(
        "chip",
        { zh: "纸片", en: "Chip" },
        {
          zh: "纸片（Chip）：紧凑的胶囊形实体标签，用于展示筛选条件、关键词词条或协作者，支持一键移除。",
          en: "A compact pill-shaped solid chip for filters, keywords, or collaborators, with one-click removal.",
        },
      ),
      component(
        "avatar",
        { zh: "头像", en: "Avatar" },
        {
          zh: "头像（Avatar）：代表用户、团队空间或 AI 助手的视觉标识。支持图像、首字母缩略与图标三种载体，图像加载失败时自动优雅降级。",
          en: "An avatar representing a user, team space, or AI assistant. Supports image, initials, and icon carriers, degrading gracefully when the image fails.",
        },
      ),
      component(
        "user-chip",
        { zh: "成员纸片", en: "UserChip" },
        {
          zh: "用户提及与身份药丸（UserChip）：在正文提及、批注署名、协作者列表中一致地渲染用户身份，默认悬停或聚焦时展开 UserCard 名片。",
          en: "A user mention and identity pill (UserChip): renders identity consistently across inline mentions, annotation signatures, and collaborator lists, expanding into a UserCard on hover or focus by default.",
        },
      ),
      component(
        "user-card",
        { zh: "成员卡片", en: "UserCard" },
        {
          zh: "用户名片（UserCard）：结构化呈现用户的头像、姓名、角色徽标、账号句柄、邮箱与简介，既可嵌入浮层，也可用于账户设置页头部。",
          en: "A user card (UserCard): presents avatar, name, role badge, handle, email, and bio in one structure, embeddable in overlays or account-page headers.",
        },
      ),
      component(
        "message",
        { zh: "提示条", en: "Message" },
        {
          zh: "行内提示条（Message）：嵌入页面或表单流中的持久反馈橫幅，使用语义细边与柔和着色底，根据严重程度自动设置无障碍 role（status / alert）。",
          en: "An inline message: a persistent banner embedded in page or form flow, with hairline semantic borders and soft tinted fills, setting role (status / alert) automatically by severity.",
        },
      ),
      component(
        "progress-bar",
        { zh: "进度条", en: "ProgressBar" },
        {
          zh: "线性进度条（ProgressBar）：表达上传、文献解析或批量导出等耗时任务的完成度。支持精确百分比（determinate）与未知时长脉动（indeterminate）。",
          en: "A linear progress bar for long tasks like uploads, reference parsing, or batch exports. Supports determinate percentages and an indeterminate pulse for unknown durations.",
        },
      ),
      component(
        "progress-spinner",
        { zh: "加载指示", en: "ProgressSpinner" },
        {
          zh: "环形加载指示器（ProgressSpinner）：用于局部容器、异步面板或行内状态的轻量等待指示，圆弧描边默认跟随品牌色或继承文本颜色。",
          en: "A spinner for local containers, async panels, or inline status: a light waiting indicator whose arc follows brand color or inherits text color.",
        },
      ),
      component(
        "skeleton",
        { zh: "骨架屏", en: "Skeleton" },
        {
          zh: "骨架屏（Skeleton）：在数据尚未返回时以近似真实排版的几何色块预先占位，避免内容加载完成瞬间发生剧烈的版面跳动。",
          en: "A skeleton: approximate geometric placeholders shown before data arrives, so the layout doesn't jump violently when content lands.",
        },
      ),
      component(
        "app-logo",
        { zh: "品牌标识", en: "AppLogo" },
        {
          zh: "品牌标志：内联 SVG 渲染的 MangoWrite 标志，支持完整横版（字标 + 图形）与紧凑方形标（markOnly），随主题自动切换色彩。",
          en: "The brand logo: an inline SVG MangoWrite mark with a full horizontal lockup (wordmark + glyph) and a compact square (markOnly), recoloring with the theme automatically.",
        },
      ),
    ],
  },
  {
    id: "overlays",
    title: { zh: "浮层", en: "Overlays" },
    base: "/components",
    entries: [
      component(
        "dialog",
        { zh: "对话框", en: "Dialog" },
        {
          zh: "模态覆盖层：打断当前流以完成聚焦的子任务或表单。采用厚霜材质（.mw-frost--thick）配压暗遮罩（--scrim），头部、正文滚动区与底栏动作分区固定。",
          en: "A modal overlay that interrupts the flow for a focused subtask or form. Thick frost (.mw-frost--thick) over a dimmed scrim (--scrim), with a fixed header, scrollable body, and footer actions.",
        },
      ),
      component(
        "confirm",
        { zh: "确认框", en: "Confirm" },
        {
          zh: "命令式二次确认：通过 useConfirm().ask() 唤起厚霜确认框并返回 Promise<boolean>。破坏性操作自动切换危险视觉并将初始焦点落在「取消」上，防止连按回车误穿。",
          en: "An imperative confirm: useConfirm().ask() opens a thick-frost dialog and resolves a Promise<boolean>. Destructive actions switch to danger visuals and land initial focus on Cancel, so a mashed Enter can't slip through.",
        },
      ),
      component(
        "toast",
        { zh: "轻提示", en: "Toast" },
        {
          zh: "非阻塞轻提示：操作完成或后台状态变更后在视口角落短暂浮现，不打断当前焦点。采用霜材质（.mw-frost），支持四级语义、行内动作按钮、同 ID 原位更新与指针悬停暂停倒计时。",
          en: "A non-blocking toast that briefly appears in a viewport corner after actions or background changes, never stealing focus. Frost material (.mw-frost), four severities, inline actions, in-place updates by ID, and hover-to-pause countdown.",
        },
      ),
      component(
        "popover",
        { zh: "弹出层", en: "Popover" },
        {
          zh: "锚定弹出层：点击触发器后在锚点旁展开霜面浮层（.mw-frost），承载轻量表单、排版微调或分享设置。支持 #trigger 插槽声明式触发与 ref.toggle(event) 命令式共享实例。",
          en: "An anchored popover: opens a frost overlay (.mw-frost) beside the trigger for light forms, typography tweaks, or share settings. Declarative #trigger slot or imperative ref.toggle(event) on a shared instance.",
        },
      ),
      component(
        "hover-card",
        { zh: "悬停卡片", en: "HoverCard" },
        {
          zh: "悬停富卡片：指针悬停或键盘聚焦锚点 150ms 后展开厚霜卡片，用于在不离开阅读流的前提下预览引用文献、成员名片或术语释义。不带箭头，靠紧凑间距表达锚定关系。",
          en: "A hover card that opens thick frost 150ms after pointer hover or keyboard focus, previewing references, member cards, or term definitions without leaving the reading flow. No arrow; anchoring is expressed through tight spacing.",
        },
      ),
      component(
        "tooltip",
        { zh: "文字提示", en: "Tooltip" },
        {
          zh: "文字提示指令：通过 v-tooltip 为纯图标按钮或截断文本附加简短说明。与 HoverCard 共用视口系定位算法与厚霜面板（.mw-hovercard__panel），无箭头、悬停 150ms 出场、按 Esc 或滚出视口自动收起。",
          en: "A tooltip directive via v-tooltip for icon-only buttons and truncated text. Shares HoverCard's viewport-aware positioning and frost panel (.mw-hovercard__panel): no arrow, 150ms hover delay, auto-dismiss on Esc or scroll-out.",
        },
      ),
      component(
        "image-lightbox",
        { zh: "图片灯箱", en: "ImageLightbox" },
        {
          zh: "图片灯箱：全屏检视论文插图、实验谱图或扫描件，支持滚轮与按钮缩放（0.2×–8×）、90° 步进旋转、指针拖拽平移与图注展示。固定暗场舞台（--lightbox-*），不随浅色主题翻转。",
          en: "A lightbox for inspecting figures, spectra, and scans full screen: wheel and button zoom (0.2×–8×), 90° rotation steps, drag to pan, and caption display. A fixed dark stage (--lightbox-*) that never flips with the light theme.",
        },
      ),
    ],
  },
  {
    id: "structure",
    title: { zh: "结构", en: "Structure" },
    base: "/components",
    entries: [
      component(
        "tabs",
        { zh: "标签页", en: "Tabs" },
        {
          zh: "标签页：在同一容器内切换不同内容分区。底栏下划线指示当前激活页签，方向键可在页签间巡航。",
          en: "Tabs for switching content sections within one container. An underline on the bottom bar marks the active tab; arrow keys roam between tabs.",
        },
      ),
      component(
        "accordion",
        { zh: "折叠面板", en: "Accordion" },
        {
          zh: "手风琴折叠面板：将次要或分组信息收纳在可展开节中，保持主视口整洁。",
          en: "An accordion that folds secondary or grouped info into expandable sections, keeping the main viewport clean.",
        },
      ),
      component(
        "data-table",
        { zh: "数据表格", en: "DataTable" },
        {
          zh: "展示同构的结构化记录：文献、成员、用量明细。表格外框是一张分组卡，行用发丝线分隔，数字列等宽对齐。",
          en: "A table for homogeneous structured records: references, members, usage line items. The frame is a grouped card, rows split by hairlines, numeric columns align on tabular figures.",
        },
      ),
      component(
        "paginator",
        { zh: "分页", en: "Paginator" },
        {
          zh: "分页器：在长列表或表格底部切分数据集，提供页码跳转、首尾页直达与每页条数切换。",
          en: "A paginator that splits long lists or tables, with page jumps, first/last shortcuts, and page-size switching.",
        },
      ),
      component(
        "page-header",
        { zh: "页头", en: "PageHeader" },
        {
          zh: "主站页面头：首页一族（文库、草稿、团队、设置）工作岛顶部的统一标题栏，收纳可选图标、一级标题与右侧操作区。",
          en: "The product page header: a unified title bar atop the work islands of library, drafts, teams, and settings, holding an optional icon, the page title, and right-side actions.",
        },
      ),
      component(
        "async-slot",
        { zh: "异步四态", en: "AsyncSlot" },
        {
          zh: "四态异步容器：把「加载骨架 / 空态邀请 / 错误重试 / 真实内容」四态切换与 L3 交叉淡入收敛为一个组件。",
          en: "A four-state async container: loading skeleton, empty-state invitation, error retry, and real content, with L3 cross-fades, in one component.",
        },
      ),
      component(
        "not-found-page",
        { zh: "404 页", en: "NotFoundPage" },
        {
          zh: "404 页面壳：Write 与 Rewrite 双站共用的全屏未找到页面，采用厚霜（.mw-frost--thick）卡片承载品牌、状态码、出错路径与恢复动作。",
          en: "The 404 shell shared by Write and Rewrite: a full-screen not-found page on a thick-frost (.mw-frost--thick) card holding brand, status code, the missed path, and recovery actions.",
        },
      ),
      component(
        "site",
        { zh: "营销站框架", en: "SiteHeader / SiteFooter" },
        {
          zh: "站点顶栏与页脚：Write 与 Rewrite 营销站、法务页共用的顶层导航（SiteHeader）与合规页脚（SiteFooter）。",
          en: "Site header and footer: the top navigation (SiteHeader) and compliance footer (SiteFooter) shared by the Write and Rewrite marketing and legal pages.",
        },
      ),
    ],
  },
];
