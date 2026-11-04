import { onBeforeUnmount, onMounted, ref, type Ref } from "vue";

/** 读取元素所在主题作用域下的 token 计算值；全局主题切换时自动重读。 */
export function useTokenValues(el: Ref<HTMLElement | null>, names: () => string[]) {
  const values = ref<Record<string, string>>({});
  let observer: MutationObserver | null = null;

  function read() {
    if (!el.value) return;
    const style = getComputedStyle(el.value);
    const next: Record<string, string> = {};
    for (const name of names()) next[name] = style.getPropertyValue(name).trim();
    values.value = next;
  }

  onMounted(() => {
    requestAnimationFrame(read);
    observer = new MutationObserver(() => requestAnimationFrame(read));
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  });
  onBeforeUnmount(() => observer?.disconnect());

  return { values, read };
}

/** 把计算后的颜色串解析成 0–1 的 RGBA（支持 rgb()/rgba()/color(srgb …)）。 */
export function parseColor(input: string): [number, number, number, number] | null {
  const rgb = input.match(/rgba?\(([^)]+)\)/);
  if (rgb) {
    const parts = rgb[1]!.split(/[\s,/]+/).filter(Boolean).map(Number);
    return [parts[0]! / 255, parts[1]! / 255, parts[2]! / 255, parts[3] ?? 1];
  }
  const srgb = input.match(/color\(srgb\s+([^)]+)\)/);
  if (srgb) {
    const parts = srgb[1]!.split(/[\s/]+/).filter(Boolean).map(Number);
    return [parts[0]!, parts[1]!, parts[2]!, parts[3] ?? 1];
  }
  return null;
}

function luminance([r, g, b]: [number, number, number, number]) {
  const lin = (c: number) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

export function contrastRatio(fg: string, bg: string): number | null {
  const a = parseColor(fg);
  const b = parseColor(bg);
  if (!a || !b) return null;
  const blended: [number, number, number, number] = [
    a[0] * a[3] + b[0] * (1 - a[3]),
    a[1] * a[3] + b[1] * (1 - a[3]),
    a[2] * a[3] + b[2] * (1 - a[3]),
    1,
  ];
  const l1 = luminance(blended);
  const l2 = luminance(b);
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}
