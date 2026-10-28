// 品牌覆盖与 Aura 底座分离，使轻量预设可以按需引入组件 token。

/**
 * Shared severity ramp for Message / InlineMessage — a light tinted banner:
 * borderless, no shadow, severity-coloured 14px text. Aura's Message "border"
 * is actually an OUTLINE, which reserves no layout space and visibly clips at
 * container edges; we drop it outright — tint + icon + text colour carry the
 * meaning (icon keeps status from being colour-only, per design guide).
 */
const feedbackTint = (
  name: "success" | "info" | "warning" | "danger",
  color: string
) => ({
  background: `var(--color-${name}-surface)`,
  borderColor: "transparent",
  color,
  shadow: "none"
});

const feedbackSeverities = {
  success: feedbackTint("success", "var(--color-success-600)"),
  // info feedback is a QUIET reminder: warm-gray surface + primary text; the
  // severity icon is the only accent, tinted brand-orange in primevue-theme.css
  // (info blue is reserved for links/actions, too loud for a frequent banner).
  info: {
    background: "var(--color-bg-soft)",
    borderColor: "transparent",
    color: "var(--color-text-primary)",
    shadow: "none"
  },
  warn: feedbackTint("warning", "var(--color-warning-600)"),
  error: feedbackTint("danger", "var(--color-danger-700)"),
  secondary: {
    background: "var(--color-surface-muted)",
    borderColor: "transparent",
    color: "var(--color-text-secondary)",
    shadow: "none"
  },
  contrast: {
    background: "var(--color-text-primary)",
    borderColor: "transparent",
    color: "var(--color-surface-base)",
    shadow: "none"
  }
};

const feedbackCloseButton = (color: string, hoverBackground: string) => ({
  hoverBackground,
  focusRing: { color, shadow: "none" }
});

/**
 * Toast severity ramp — the accent reaches the icon and the close-button focus
 * ring, never the text. Aura's severity colours are tuned for Message's tinted
 * face; on the bare glass overlay 14px warn-600 measures 3.48:1, under AA.
 * background/border/shadow are written transparent/none because the panel face
 * is claimed by `primevue-theme.css` at 0,2,0 specificity (runtime-injected
 * preset loses) — this file only declares that it does not reach that layer.
 */
const toastSeverity = (accent: string, hoverBackground: string) => ({
  background: "transparent",
  borderColor: "transparent",
  shadow: "none",
  color: "var(--color-text-primary)",
  detailColor: "var(--color-text-secondary)",
  closeButton: feedbackCloseButton(accent, hoverBackground)
});

/**
 * Mango preset — the authoritative source of PrimeVue's `--p-*` tokens.
 *
 * PrimeVue (styled mode) injects these at runtime AFTER our stylesheet, so for
 * any token Aura emits, the preset wins over `:root` overrides. We therefore
 * carry the Mango identity HERE, pointing tokens at the canonical CSS variables
 * in `./var.css` (DRY: one source of truth). String values
 * are emitted verbatim, so `var(--color-…)` references resolve at runtime.
 *
 * Net effect: every PrimeVue component inherits the warm-neutral surfaces,
 * brand-orange primary, Mango radii and focus ring with zero per-component CSS.
 */
/**
 * 深色分支默认镜像浅色分支（issue #110 · P1）。
 *
 * 为什么可以直接镜像：`colorScheme` 分支里的值**全部是 `var(--color-*)` /
 * `var(--shadow-*)` 这类 token 引用**（例外见下面手写的 `dark`）。token 本身
 * 已经在 `var.css` 的 `:root[data-theme="dark"]` 块里换过了，所以「深色下该长
 * 什么样」这件事在 CSS 变量层已经答完，预设这一层只需要**把同一份引用也挂到
 * dark 选择器上**。**唯一不能镜像的是 ramp 重排**：把一组 slot 重新映射到另一
 * 组 token 的值（如 semantic.surface）依赖 Aura 对应 scheme 的遍历方向，dark
 * 分支必须按 dark 的方向手写（见下面 `colorScheme.dark.surface`）。
 *
 * 不镜像会怎样：PrimeVue 为 light / dark 生成两套规则，缺 `dark` 时深色下落回
 * **Aura 自带的冷灰 slate 值**——暖橙主题会在深色下整片变冷，而且是静默发生的。
 *
 * 规则：
 * - 只补 `dark` 缺席的地方，**显式写了 `dark` 的一律不动**（深色确实需要不同值的
 *   场合仍然可以手写，例如遮罩要更黑）。
 * - 显式 `dark` 与镜像来的浅色分支做**浅合并**：写了哪个键覆盖哪个键，没写的继续
 *   走浅色引用，避免手写 dark 时漏抄一堆 token。
 * - 递归全树，**新增第 6 个 colorScheme 块时自动生效**，不需要记得来这里补。
 */
type Node = Record<string, unknown>;

function mirrorLightToDark<T>(node: T): T {
  if (!node || typeof node !== "object" || Array.isArray(node)) return node;
  const obj = node as Node;
  for (const key of Object.keys(obj)) {
    const value = obj[key];
    if (key === "colorScheme" && value && typeof value === "object") {
      const scheme = value as Node;
      const light = scheme.light as Node | undefined;
      if (light && typeof light === "object") {
        const explicitDark = (scheme.dark as Node | undefined) ?? {};
        scheme.dark = { ...light, ...explicitDark };
      }
    }
    obj[key] = mirrorLightToDark(value);
  }
  return node;
}

// 覆盖项独立成 mangoOverrides：MangoPreset（全量 Aura）与
// MangoPresetLite（theme-lite.ts，rewrite 站用）共享同一份品牌覆盖。
export const mangoOverrides = mirrorLightToDark({
  primitive: {
    // Radius ramp drives every component: form fields/buttons/content use `md`,
    // option lists/menus use `sm`, modals use `xl`.
    borderRadius: {
      none: "0",
      xs: "4px",
      sm: "6px",
      md: "8px",
      lg: "10px",
      xl: "16px"
    }
  },
  semantic: {
    transitionDuration: "0.18s",
    disabledOpacity: "0.6",
    // Overlay option rows (Select, MultiSelect, Listbox, AutoComplete, …) all
    // read `{list.option.padding}`. Aura's 0.5/0.75rem renders ~37px rows that
    // tower over the trimmed fields; pull them down to sit with the controls.
    list: {
      option: {
        padding: "0.375rem 0.625rem"
      }
    },
    // Menu / ContextMenu / TieredMenu rows read `{navigation.item.*}`, not
    // `{list.option.*}` — trim them to the same box or the app ships two
    // option-row heights. (Also feeds Breadcrumb / Menubar / TabMenu / Steps;
    // none of those use row padding in this repo.)
    navigation: {
      item: {
        padding: "0.375rem 0.625rem"
      },
      // A submenu label is a group heading, not a row: one step lighter in
      // weight and muted, so it stops competing with the items under it.
      submenuLabel: {
        padding: "0.375rem 0.625rem",
        fontWeight: "500",
        color: "var(--color-text-tertiary)"
      }
    },
    // PrimeVue applies `.pi { font-size: var(--p-icon-size) }` to every icon.
    // `1em` makes each icon match its surrounding text instead of a fixed 16px
    // (design ch0.4: icons scale with text). For a deliberately large/decorative
    // icon, size its WRAPPER (e.g. `<span class="tw:text-3xl"><i class="pi"/>`),
    // not the icon itself — `1em` resolves against the parent's font-size.
    iconSize: "1em",
    focusRing: {
      width: "3px",
      style: "solid",
      color: "rgb(var(--color-brand-500-rgb) / 0.45)",
      offset: "1px",
      shadow: "none"
    },
    // PrimeVue 的 --p-primary-* 调色阶。**必须走 token 而不是字面 hex**：这一段在
    // colorScheme 之外，只会被发一次，写死 hex 就等于深色下继续用浅色品牌橙
    // （issue #110 · P1 发现的既有缺陷）。token 定义在 packages/shared/src/var.css。
    primary: {
      50: "var(--color-brand-50)",
      100: "var(--color-brand-100)",
      200: "var(--color-brand-200)",
      300: "var(--color-brand-300)",
      400: "var(--color-brand-400)",
      500: "var(--color-brand-500)",
      600: "var(--color-brand-600)",
      700: "var(--color-brand-700)",
      800: "var(--color-brand-800)",
      900: "var(--color-brand-900)",
      950: "var(--color-brand-950)"
    },
    formField: {
      // Mango runs a 14px UI base, but Aura sizes form fields against a 16px
      // root — so its defaults render ~one step too tall. We pull the whole
      // size ramp (md/sm/lg) down a notch here; this drives Input, Select,
      // Textarea, DatePicker AND Button (button references `{form.field.*}`),
      // so all single-line fields and buttons shrink together. The md *font*
      // is the only piece NOT a token (PrimeVue hardcodes `1rem`) — it's
      // corrected in `primevue-theme.css`.
      paddingX: "0.625rem",
      paddingY: "0.375rem",
      sm: {
        // Target 24px: 12px font × 1.25 lh + 2 × 0.292em×12px + 2px border ≈ 24px.
        // paddingY in em so it scales with the sm font rather than root.
        fontSize: "0.75rem",
        paddingX: "0.5rem",
        paddingY: "0.292em"
      },
      lg: {
        fontSize: "1rem",
        paddingX: "0.75rem",
        paddingY: "0.5rem"
      },
      // Soft brand glow on focus (design 2.3), instead of Aura's border-only.
      focusRing: {
        width: "3px",
        style: "solid",
        color: "rgb(var(--color-brand-500-rgb) / 0.18)",
        offset: "0",
        shadow: "none"
      }
    },
    colorScheme: {
      light: {
        // Warm-tinted neutral ramp — the heart of the Mango look. Maps Aura's
        // surface scale (used for borders, muted text, fills, hovers) onto our
        // warm oklch tokens so nothing renders cool slate-gray.
        surface: {
          0: "var(--color-surface-base)",
          50: "var(--color-bg-soft)",
          100: "var(--color-surface-muted)",
          200: "var(--color-border-subtle)",
          300: "var(--color-border-strong)",
          400: "var(--color-text-quaternary)",
          500: "var(--color-text-tertiary)",
          600: "var(--color-text-secondary)",
          700: "var(--color-text-primary)",
          800: "var(--color-text-primary)",
          900: "var(--color-text-primary)",
          950: "var(--color-text-primary)"
        },
        // filled 面上的前景（checkbox 勾、radiobutton 点、primary badge、
        // progressbar 读数、日历选中日）统一走 --color-text-on-brand，
        // 深浅两套都使用满足正文 AA 的深墨。
        primary: {
          contrastColor: "var(--color-text-on-brand)"
        },
        formField: {
          // Inputs use the subtle border (design §4.3), not the stronger one.
          borderColor: "var(--color-border-subtle)",
          hoverBorderColor: "var(--color-border-strong)",
          shadow: "var(--shadow-xs)"
        },
        mask: {
          // 遮罩配方收进 --material-mask（var.css，浅深两套各一条）；它上面那层
          // 轻模糊在 primevue-theme.css（Aura 没有对应 token）。深色分支因此
          // 不再需要手写——token 自己会换。
          background: "var(--material-mask)"
        },
        // 菜单族的键盘焦点态与父项激活态（Menu / ContextMenu / TieredMenu 都读
        // 这两个键）。Aura 给的是不透明 surface 底，画在玻璃浮层上是一块实心补丁。
        // 也不能用 --material-inlay：浅色下它是 42% **白**叠层，压在本就近白的玻璃
        // 面板上实测差 0.4/255，等于没有反馈。行态一律 --material-hover——var.css
        // 那条注释已经写明它随 mode 翻转（浅=暖深、深=白），inlay 只当内嵌块。
        navigation: {
          item: {
            focusBackground: "var(--material-hover)",
            activeBackground: "var(--material-hover)",
            focusColor: "var(--color-text-primary)",
            activeColor: "var(--color-text-primary)",
            // Aura 给行图标 surface.400（深色 .500），经 surface 映射两套主题都
            // 落 quaternary，比 ObjectMenuHost lucide 图标（styles.css 直写 tertiary）
            // 浅一档——同一菜单两族图标深浅不一，这里钉平；浅深共值，dark 侧镜像。
            icon: {
              color: "var(--color-text-tertiary)",
              focusColor: "var(--color-text-tertiary)",
              activeColor: "var(--color-text-tertiary)"
            }
          }
        }
      },
      // 需要手写 dark 的**一处**（其余键由 mirrorLightToDark 从 light 分支镜像过来）：
      // - surface ramp：Aura 的 dark 分支按「0=最亮（深底上的文字/对比底）→
      //   950=最暗（输入框底）」的反方向遍历 ramp（form.field.color=surface.0、
      //   overlay.select.background=surface.900、form.field.background=surface.950…）。
      //   light 分支那套映射（700–950 → text-primary）是按 Aura **light** 的遍历
      //   方向设计的，镜像过去后深色下输入框文字、Select/Menu 面板、tooltip、
      //   chip、ToggleSwitch 旋钮全拿到近白色——这块必须按 dark 的遍历方向重排。
      // 遮罩原本也在这里手写，现已收进 --material-mask（token 自带浅深两套）。
      dark: {
        surface: {
          0: "var(--color-text-primary)", // 深底上的正文（form.field.color 等）
          50: "var(--color-text-secondary)",
          100: "var(--color-text-secondary)", // contrast hover 底 / active 文字
          200: "var(--color-text-secondary)", // secondary hover 文字
          300: "var(--color-text-secondary)", // secondary 系文字
          400: "var(--color-text-tertiary)", // 占位符 / muted 文字 / 图标
          500: "var(--color-text-quaternary)", // 字段 hover 边 / 图标
          600: "var(--color-border-strong)", // 字段边框 / ToggleSwitch 轨道
          700: "var(--color-border-subtle)", // 面板边框 / disabled 字段底
          800: "var(--color-border-strong)", // 菜单项 hover / 选项 focus 底 / secondary 按钮底
          900: "var(--color-surface-overlay)", // 下拉 / Popover / Modal 面板底（elevation-3）
          950: "var(--color-bg)" // 输入框底 / 对比底上的文字 / SelectButton 段底
        }
      }
    }
  },
  // Per-component size trims. The form-field ramp above already shrinks every
  // single-line field + Button; these cover the controls that carry their OWN
  // width/height instead of `{form.field.*}`. We keep the lg ≈ old-md so the
  // three sizes still read as a clear ramp, just one notch tighter overall.
  components: {
    button: {
      root: {
        // Square icon-only buttons track field heights (md ≈ 32px, sm ≈ 24px).
        iconOnlyWidth: "2rem",
        sm: { iconOnlyWidth: "1.5rem" },
        lg: { iconOnlyWidth: "2.375rem" }
      },
      colorScheme: {
        light: {
          root: {
            primary: {
              background: "var(--color-brand-500)",
              hoverBackground: "var(--color-brand-400)",
              activeBackground: "var(--color-brand-600)",
              borderColor: "var(--color-brand-500)",
              hoverBorderColor: "var(--color-brand-400)",
              activeBorderColor: "var(--color-brand-600)",
              color: "var(--color-text-on-brand)",
              hoverColor: "var(--color-text-on-brand)",
              activeColor: "var(--color-text-on-brand)"
            },
            secondary: {
              background: "var(--color-surface-muted)",
              hoverBackground: "var(--color-bg-soft)",
              activeBackground: "var(--color-border-subtle)",
              borderColor: "var(--color-border-subtle)",
              hoverBorderColor: "var(--color-border-strong)",
              activeBorderColor: "var(--color-border-strong)",
              color: "var(--color-text-secondary)",
              hoverColor: "var(--color-text-primary)",
              activeColor: "var(--color-text-primary)"
            },
            success: {
              background: "var(--color-success-500)",
              hoverBackground: "var(--color-success-600)",
              activeBackground: "var(--color-success-600)",
              borderColor: "var(--color-success-500)",
              hoverBorderColor: "var(--color-success-600)",
              activeBorderColor: "var(--color-success-600)",
              color: "var(--color-text-on-brand)",
              hoverColor: "var(--color-text-on-brand)",
              activeColor: "var(--color-text-on-brand)"
            },
            info: {
              background: "var(--color-info-500)",
              hoverBackground: "var(--color-info-500)",
              activeBackground: "var(--color-info-500)",
              borderColor: "var(--color-info-500)",
              hoverBorderColor: "var(--color-info-500)",
              activeBorderColor: "var(--color-info-500)",
              color: "var(--color-text-on-brand)",
              hoverColor: "var(--color-text-on-brand)",
              activeColor: "var(--color-text-on-brand)"
            },
            warn: {
              background: "var(--color-warning-500)",
              hoverBackground: "var(--color-warning-500)",
              activeBackground: "var(--color-warning-500)",
              borderColor: "var(--color-warning-500)",
              hoverBorderColor: "var(--color-warning-500)",
              activeBorderColor: "var(--color-warning-500)",
              color: "var(--color-text-on-brand)",
              hoverColor: "var(--color-text-on-brand)",
              activeColor: "var(--color-text-on-brand)"
            },
            danger: {
              background: "var(--color-danger-500)",
              hoverBackground: "var(--color-danger-700)",
              activeBackground: "var(--color-danger-700)",
              borderColor: "var(--color-danger-500)",
              hoverBorderColor: "var(--color-danger-700)",
              activeBorderColor: "var(--color-danger-700)",
              color: "var(--color-text-on-brand)",
              hoverColor: "var(--color-text-on-brand)",
              activeColor: "var(--color-text-on-brand)"
            },
            contrast: {
              background: "var(--color-text-primary)",
              hoverBackground: "var(--color-text-secondary)",
              activeBackground: "var(--color-text-primary)",
              borderColor: "var(--color-text-primary)",
              hoverBorderColor: "var(--color-text-secondary)",
              activeBorderColor: "var(--color-text-primary)",
              color: "var(--color-surface-base)",
              hoverColor: "var(--color-surface-base)",
              activeColor: "var(--color-surface-base)"
            }
          },
          outlined: {
            primary: {
              hoverBackground: "var(--color-brand-50)",
              activeBackground: "var(--color-brand-100)",
              borderColor: "var(--color-brand-200)",
              color: "var(--color-brand-600)"
            },
            secondary: {
              hoverBackground: "var(--color-bg-soft)",
              activeBackground: "var(--color-surface-muted)",
              borderColor: "var(--color-border-subtle)",
              color: "var(--color-text-secondary)"
            },
            success: {
              hoverBackground: "var(--color-success-surface)",
              activeBackground: "var(--color-success-surface)",
              borderColor: "var(--color-success-border)",
              color: "var(--color-success-600)"
            },
            info: {
              hoverBackground: "var(--color-info-surface)",
              activeBackground: "var(--color-info-surface)",
              borderColor: "var(--color-info-border)",
              color: "var(--color-info-500)"
            },
            warn: {
              hoverBackground: "var(--color-warning-surface)",
              activeBackground: "var(--color-warning-surface)",
              borderColor: "var(--color-warning-border)",
              color: "var(--color-warning-600)"
            },
            danger: {
              hoverBackground: "var(--color-danger-surface)",
              activeBackground: "var(--color-danger-surface)",
              borderColor: "var(--color-danger-border)",
              color: "var(--color-danger-700)"
            },
            contrast: {
              hoverBackground: "var(--color-bg-soft)",
              activeBackground: "var(--color-surface-muted)",
              borderColor: "var(--color-border-strong)",
              color: "var(--color-text-primary)"
            }
          },
          text: {
            primary: {
              hoverBackground: "var(--color-brand-50)",
              activeBackground: "var(--color-brand-100)",
              color: "var(--color-brand-600)"
            },
            secondary: {
              hoverBackground: "var(--color-bg-soft)",
              activeBackground: "var(--color-surface-muted)",
              color: "var(--color-text-secondary)"
            },
            success: {
              hoverBackground: "var(--color-success-surface)",
              activeBackground: "var(--color-success-surface)",
              color: "var(--color-success-600)"
            },
            info: {
              hoverBackground: "var(--color-info-surface)",
              activeBackground: "var(--color-info-surface)",
              color: "var(--color-info-500)"
            },
            warn: {
              hoverBackground: "var(--color-warning-surface)",
              activeBackground: "var(--color-warning-surface)",
              color: "var(--color-warning-600)"
            },
            danger: {
              hoverBackground: "var(--color-danger-surface)",
              activeBackground: "var(--color-danger-surface)",
              color: "var(--color-danger-700)"
            },
            contrast: {
              hoverBackground: "var(--color-bg-soft)",
              activeBackground: "var(--color-surface-muted)",
              color: "var(--color-text-primary)"
            }
          },
          link: {
            color: "var(--color-brand-600)",
            hoverColor: "var(--color-brand-700)",
            activeColor: "var(--color-brand-600)"
          }
        }
      }
    },
    checkbox: {
      root: {
        width: "1rem",
        height: "1rem",
        // Box shrank 20 → 16px, so the sm (6px) radius read too round; step
        // down to xs (4px) to keep the corner proportional.
        borderRadius: "{border.radius.xs}",
        sm: { width: "0.875rem", height: "0.875rem" },
        lg: { width: "1.25rem", height: "1.25rem" }
      },
      // Aura leaves icon.size unset (checkmark falls back to its intrinsic
      // size); pin it so the tick scales with the smaller box.
      icon: { size: "0.75rem" }
    },
    radiobutton: {
      root: {
        width: "1rem",
        height: "1rem",
        sm: { width: "0.875rem", height: "0.875rem" },
        lg: { width: "1.25rem", height: "1.25rem" }
      },
      icon: { size: "0.5rem" }
    },
    toggleswitch: {
      root: {
        // 34×20 (was 40×24). Tighter gap keeps the knob visually full at the
        // smaller height (knob = height − 2·gap).
        width: "2.125rem",
        height: "1.25rem",
        gap: "0.1875rem"
      }
    },
    select: {
      // Chevron column: 40 → 32px so it squares with the new control height.
      dropdown: { width: "2rem" }
    },
    datepicker: {
      // Trigger column shares the 2rem width of Select / TreeSelect.
      dropdown: { width: "2rem" },
      date: {
        // Aura has no `dayCell` token — the 40px cell is `date` (2rem) plus
        // `date.padding` (0.25rem) on a side. Both must shrink together.
        padding: "0.125rem",
        width: "1.75rem",
        height: "1.75rem",
        // 面板现在是玻璃面：hover 底色必须是半透明的那一档，不透明 surface 会在
        // 材质上抠出一块实心补丁（月/年视图复用同一组 date.hover.* 键）。
        // **不用 --material-inlay**：inline 面板不透玻璃、是白底，浅色下那层 42%
        // 白纱压在白底上等于没画。--material-hover 浅深各自翻向，两种底都成立。
        hoverBackground: "var(--material-hover)",
        hoverColor: "var(--color-text-primary)"
      },
      weekDay: { color: "var(--color-text-tertiary)" },
      // Month / year are option-row affordances now, not content panels.
      selectMonth: {
        borderRadius: "{border.radius.sm}",
        hoverBackground: "var(--material-hover)",
        hoverColor: "var(--color-text-primary)"
      },
      selectYear: {
        borderRadius: "{border.radius.sm}",
        hoverBackground: "var(--material-hover)",
        hoverColor: "var(--color-text-primary)"
      },
      colorScheme: {
        light: {
          // 「今天」是标记不是填充：实心底在玻璃上打断材质，半透明白纱在 inline
          // 的白底上又读不出来。底色清空，改由 primevue-theme.css 画一圈内描边。
          today: { background: "transparent", color: "var(--color-text-primary)" }
        }
      }
    },
    inputnumber: {
      // Stepper buttons: 40 → 32px, matching the select dropdown column so the
      // stacked +/- control squares with the Mango control height. (The
      // stretch guard that keeps the field compact lives in primevue-theme.css
      // — Aura exposes no token for it.)
      button: { width: "2rem" },
      colorScheme: {
        light: {
          button: {
            // Aura's surface.100 hover fill (→ our surface-muted) is
            // invisible on the white field; step the hover down to bg-soft so
            // the stacked +/- affordance reads. Active stays on the Aura
            // mapping (surface.200 → border-subtle). Chrome protection (the
            // buttons never cover the field border/focus ring) is handled by
            // the 2px gutter in primevue-theme.css, not by transparency.
            hoverBackground: "var(--color-bg-soft)",
            activeBackground: "var(--color-border-subtle)"
          }
        }
      }
    },
    fileupload: {
      // root 面只命中 advanced（base 的 root 规则带 .p-fileupload-advanced 选择器），
      // basic 仍是裸按钮。空态拖拽区（虚线 + min-height）在 primevue-theme.css。
      root: {
        background: "var(--color-surface-base)",
        borderColor: "var(--color-border-subtle)",
        color: "var(--color-text-primary)",
        borderRadius: "var(--radius)"
      },
      header: {
        background: "transparent",
        padding: "0.625rem 0.75rem"
      },
      content: {
        highlightBorderColor: "var(--color-brand-500)",
        padding: "0.375rem 0.75rem 0.75rem",
        gap: "0.75rem"
      },
      fileList: { gap: "0" },
      file: {
        padding: "0.5rem 0",
        gap: "0.75rem",
        borderColor: "var(--color-border-subtle)"
      }
    },
    togglebutton: {
      // SelectButton segments: 42 → ~31.5px to sit with the control row. Root
      // keeps its 0.25rem frame; the inner content carries the trim. (md font
      // + line-height are pinned in primevue-theme.css like the other fields.)
      content: {
        padding: "0.125rem 0.625rem",
        sm: { padding: "0.0625rem 0.5rem" },
        lg: { padding: "0.25rem 0.75rem" }
      }
    },
    tag: {
      // Smaller label + tighter box: ~29 → ~22px, 14 → 12px text.
      root: {
        fontSize: "0.75rem",
        padding: "0.125rem 0.5rem"
      }
    },
    chip: {
      root: {
        paddingX: "0.5rem",
        paddingY: "0.1875rem"
      },
      // Leading icon was 16px against a 14px label — match it to the text.
      icon: { size: "0.875rem" },
      removeIcon: { size: "0.75rem" }
    },
    badge: {
      // 24 → 20px, 12 → 11px.
      root: {
        fontSize: "0.6875rem",
        height: "1.25rem",
        minWidth: "1.25rem",
        padding: "0 0.375rem"
      }
    },
    avatar: {
      // 32 → 28px.
      root: {
        width: "1.75rem",
        height: "1.75rem",
        fontSize: "0.875rem"
      },
      icon: { size: "0.875rem" }
    },
    datatable: {
      colorScheme: {
        light: {
          // Aura's stripe is `{surface.50}` — the SAME token the row hover fill
          // uses, so hovering a striped row did nothing; and in dark it landed
          // on the row background, i.e. no stripe at all. One step lighter
          // keeps stripe < hover in both schemes.
          row: { stripedBackground: "var(--color-surface-muted)" }
        }
      }
    },
    dataview: {
      // 壳全透明：行与卡片的长相归消费方（同构列表走分组卡范式，网格直接摆
      // Card 不套娃），header / footer 只给 12px 间距，paginator 顶底 hairline 一并去掉。
      header: {
        background: "transparent",
        borderWidth: "0",
        padding: "0 0 0.75rem"
      },
      content: {
        background: "transparent",
        borderColor: "transparent",
        borderWidth: "0",
        padding: "0"
      },
      footer: {
        background: "transparent",
        borderWidth: "0",
        padding: "0.75rem 0 0"
      },
      paginatorTop: { borderWidth: "0" },
      paginatorBottom: { borderWidth: "0" }
    },
    paginator: {
      // 56 → ~40px: round nav buttons 40 → 32, tighter outer padding.
      root: {
        padding: "0.25rem 0.5rem",
        background: "transparent",
        color: "var(--color-text-secondary)",
        gap: "0.25rem"
      },
      navButton: {
        width: "2rem",
        height: "2rem",
        borderRadius: "6px",
        background: "transparent",
        hoverBackground: "var(--color-brand-100)",
        selectedBackground: "var(--color-brand-200)",
        color: "var(--color-text-secondary)",
        hoverColor: "var(--color-brand-700)",
        selectedColor: "var(--color-brand-700)"
      },
      currentPageReport: {
        color: "var(--color-text-tertiary)"
      },
      jumpToPageInput: {
        maxWidth: "3.5rem"
      }
    },
    message: {
      // ~40 → ~32px: tighter content, smaller leading icon + close affordance.
      // Borderless light design (see feedbackTint above): root borderWidth 0
      // kills the clipping-prone outline; text drops 16px/500 → 14px/400 so a
      // banner stops shouting over the workspace.
      root: { borderWidth: "0" },
      content: { padding: "0.375rem 0.625rem" },
      text: { fontSize: "0.875rem", fontWeight: "400" },
      icon: { size: "1rem" },
      closeButton: { width: "1.5rem", height: "1.5rem" },
      closeIcon: { size: "0.875rem" },
      colorScheme: {
        light: {
          success: {
            ...feedbackSeverities.success,
            closeButton: feedbackCloseButton(
              "var(--color-success-600)",
              "rgb(var(--color-success-500-rgb) / 0.12)"
            )
          },
          info: {
            ...feedbackSeverities.info,
            closeButton: feedbackCloseButton(
              "var(--color-text-primary)",
              "var(--color-border-subtle)"
            )
          },
          warn: {
            ...feedbackSeverities.warn,
            closeButton: feedbackCloseButton(
              "var(--color-warning-600)",
              "rgb(var(--color-warning-500-rgb) / 0.12)"
            )
          },
          error: {
            ...feedbackSeverities.error,
            closeButton: feedbackCloseButton(
              "var(--color-danger-700)",
              "rgb(var(--color-danger-500-rgb) / 0.12)"
            )
          },
          secondary: {
            ...feedbackSeverities.secondary,
            closeButton: feedbackCloseButton(
              "var(--color-text-secondary)",
              "var(--color-border-subtle)"
            )
          },
          contrast: {
            ...feedbackSeverities.contrast,
            closeButton: feedbackCloseButton(
              "var(--color-surface-base)",
              "rgb(255 255 255 / 0.12)"
            )
          }
        }
      }
    },
    inlinemessage: {
      // Same light look as Message; text weight 500 → 400, icon matched to
      // the 14px text it sits beside.
      text: { fontWeight: "400" },
      icon: { size: "0.875rem" },
      colorScheme: {
        light: {
          success: feedbackSeverities.success,
          info: feedbackSeverities.info,
          warn: feedbackSeverities.warn,
          error: feedbackSeverities.error,
          secondary: feedbackSeverities.secondary,
          contrast: feedbackSeverities.contrast
        }
      }
    },
    toast: {
      // Same trim as Message (see above), against Aura's defaults which were
      // one full step louder: 25rem wide, 16px/500 summary over a 14px/500
      // detail, 18px icon, 28px close button, 1px outline.
      root: { width: "20rem", borderWidth: "0" },
      content: { padding: "0.5rem 0.625rem" },
      icon: { size: "1rem" },
      summary: { fontSize: "0.875rem", fontWeight: "500" },
      detail: { fontSize: "0.8125rem", fontWeight: "400" },
      closeButton: {
        width: "1.5rem",
        height: "1.5rem",
        borderRadius: "var(--radius-pill)"
      },
      closeIcon: { size: "0.875rem" },
      colorScheme: {
        light: {
          success: toastSeverity(
            "var(--color-success-600)",
            "rgb(var(--color-success-500-rgb) / 0.12)"
          ),
          // info's accent is brand-orange, not info blue — same convention as
          // Message / InlineMessage (blue is reserved for links).
          info: toastSeverity(
            "var(--color-brand-600)",
            "var(--color-border-subtle)"
          ),
          warn: toastSeverity(
            "var(--color-warning-600)",
            "rgb(var(--color-warning-500-rgb) / 0.12)"
          ),
          error: toastSeverity(
            "var(--color-danger-700)",
            "rgb(var(--color-danger-500-rgb) / 0.12)"
          ),
          // No severity to signal, so no accent either. Aura's own fills
          // (surface.100 / surface.900) are dead here anyway — the face is glass.
          secondary: toastSeverity(
            "var(--color-text-tertiary)",
            "var(--color-border-subtle)"
          ),
          contrast: toastSeverity(
            "var(--color-text-primary)",
            "var(--color-border-subtle)"
          )
        }
      }
    },
    card: {
      // Card title was 20px — too loud beside the 14px body; bring it to a
      // compact 17px heading (weight bump keeps the hierarchy).
      title: { fontSize: "1.0625rem", fontWeight: "600" }
    },
    confirmdialog: {
      // Aura defaults to a 2rem icon that dominates the dialog; shrink to a
      // compact 20px and mute the default color. Semantic tints (danger /
      // warning / info) are applied in primevue-theme.css by icon class.
      icon: { size: "1.25rem", color: "var(--color-text-secondary)" },
      content: { gap: "0.75rem" }
    },
    timeline: {
      // Smaller node to match the compact scale; tighter horizontal content
      // padding. (The horizontal last-event collapse is fixed in CSS.)
      eventMarker: { size: "1rem" },
      horizontal: { eventContent: { padding: "0.625rem 0.5rem" } }
    },
    accordion: {
      header: {
        background: "var(--color-surface-muted)",
        hoverBackground: "var(--color-brand-50)",
        activeBackground: "var(--color-surface-muted)",
        activeHoverBackground: "var(--color-brand-50)",
        color: "var(--color-text-secondary)",
        hoverColor: "var(--color-brand-700)",
        activeColor: "var(--color-text-primary)",
        activeHoverColor: "var(--color-brand-700)",
        padding: "0.75rem 1rem",
        borderColor: "var(--color-border-subtle)"
      },
      content: {
        background: "var(--color-surface-base)",
        borderColor: "var(--color-border-subtle)",
        padding: "1rem"
      }
    },
    breadcrumb: {
      root: {
        background: "transparent",
        padding: "0"
      }
    },
    tree: {
      root: {
        padding: "0.25rem 0",
        background: "transparent"
      },
      node: {
        padding: "0.1875rem 0.375rem",
        borderRadius: "var(--radius-sm)",
        hoverBackground: "var(--color-bg-soft)",
        selectedBackground: "var(--color-brand-50)",
        color: "var(--color-text-primary)",
        hoverColor: "var(--color-text-primary)",
        selectedColor: "var(--color-brand-700)"
      },
      nodeIcon: {
        color: "var(--color-text-tertiary)",
        hoverColor: "var(--color-text-secondary)",
        selectedColor: "var(--color-brand-600)"
      },
      nodeToggleButton: {
        hoverBackground: "var(--color-bg-soft)",
        color: "var(--color-text-tertiary)",
        hoverColor: "var(--color-text-secondary)",
        selectedHoverColor: "var(--color-brand-600)",
        selectedHoverBackground: "var(--color-brand-50)"
      }
    },
    treeselect: {
      dropdown: {
        width: "2rem"
      }
    },
    listbox: {
      root: {
        borderColor: "var(--color-border-subtle)",
        borderRadius: "var(--radius)"
      },
      option: {
        padding: "0.375rem 0.625rem",
        borderRadius: "var(--radius-sm)",
        focusBackground: "var(--color-bg-soft)",
        selectedBackground: "var(--color-brand-50)",
        selectedFocusBackground: "var(--color-brand-100)",
        color: "var(--color-text-primary)",
        selectedColor: "var(--color-brand-700)"
      }
    },
    stepper: {
      stepHeader: {
        padding: "0",
        gap: "0.5rem"
      },
      stepNumber: {
        size: "1.75rem",
        fontSize: "0.875rem",
        background: "var(--color-bg-soft)",
        activeBackground: "var(--color-brand-500)",
        borderColor: "var(--color-border-strong)",
        activeBorderColor: "var(--color-brand-500)",
        color: "var(--color-text-secondary)",
        activeColor: "var(--color-text-on-brand)"
      },
      stepTitle: {
        fontWeight: "600",
        color: "var(--color-text-secondary)",
        activeColor: "var(--color-brand-700)"
      }
    },
    inputgroup: {
      addon: {
        background: "var(--color-bg-soft)",
        borderColor: "var(--color-border-subtle)",
        color: "var(--color-text-secondary)"
      }
    },
    tabs: {
      // Aura 默认 tablist/tabpanel 底是 {content.background}（实底白/黑）——在
      // 玻璃 dialog 里会抠出一块不透明补丁，打断材质；页签内容一律继承所在面。
      tablist: { background: "transparent" },
      tab: {
        activeColor: "var(--color-brand-700)",
        hoverColor: "var(--color-brand-600)"
      },
      tabpanel: { background: "transparent" },
      activeBar: {
        background: "var(--color-brand-500)"
      }
    }
  }
});

