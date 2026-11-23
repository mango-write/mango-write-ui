import {
  forwardRef, useCallback, useImperativeHandle, useMemo, useRef, useState,
  type ForwardedRef, type HTMLAttributes, type ReactNode, type RefAttributes,
} from "react";
import { defaultRangeExtractor, useVirtualizer } from "@tanstack/react-virtual";
import type { VirtualListHandle, VirtualListKey, VirtualListProps } from "./virtual-list-defs";

export interface VirtualListReactProps<T> extends VirtualListProps<T>, Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  children: (item: T, index: number) => ReactNode;
  empty?: ReactNode;
  footer?: ReactNode;
}

function VirtualListInner<T>({
  items, itemKey, estimateSize, overscan = 5, pinnedKeys, children, empty, footer, className,
  onFocus, onBlur, ...attrs
}: VirtualListReactProps<T>, ref: ForwardedRef<VirtualListHandle>) {
  const viewport = useRef<HTMLDivElement>(null);
  const [focusedKey, setFocusedKey] = useState<VirtualListKey>();
  const keys = useMemo(() => items.map(itemKey), [items, itemKey]);
  const indexes = useMemo(() => new Map(keys.map((key, index) => [key, index])), [keys]);
  const getItemKey = useCallback((index: number) => keys[index]!, [keys]);
  const estimateRowSize = useCallback(
    (index: number) => typeof estimateSize === "number" ? estimateSize : estimateSize(items[index]!, index),
    [items, estimateSize],
  );
  const rangeExtractor = useMemo(() => {
    const retained = [...(pinnedKeys ?? []), focusedKey]
      .flatMap((key) => key === undefined ? [] : (indexes.get(key) ?? []));
    return (range: Parameters<typeof defaultRangeExtractor>[0]) =>
      [...new Set([...defaultRangeExtractor(range), ...retained])].sort((a, b) => a - b);
  }, [pinnedKeys, focusedKey, indexes]);

  const virtualizer = useVirtualizer<HTMLDivElement, HTMLDivElement>({
    count: items.length,
    getScrollElement: () => viewport.current,
    getItemKey,
    estimateSize: estimateRowSize,
    overscan,
    rangeExtractor,
  });

  useImperativeHandle(ref, () => ({
    scrollToKey(key, align = "start") {
      const index = indexes.get(key);
      if (!viewport.current || index === undefined) return false;
      virtualizer.scrollToIndex(index, { align, behavior: "instant" });
      return true;
    },
    scrollToStart() {
      virtualizer.scrollToOffset(0, { behavior: "instant" });
    },
  }), [indexes, virtualizer]);

  function trackFocus(target: EventTarget | null) {
    const row = target instanceof Element && target.closest<HTMLElement>(".mw-virtual-list__row");
    setFocusedKey(row && row.closest(".mw-virtual-list") === viewport.current
      ? keys[Number(row.dataset.index)]
      : undefined);
  }

  return (
    <div ref={viewport} role="group" tabIndex={0} {...attrs}
      className={["mw-virtual-list", "mw-scroll", className].filter(Boolean).join(" ")}
      onFocus={(event) => { trackFocus(event.target); onFocus?.(event); }}
      onBlur={(event) => { trackFocus(event.relatedTarget); onBlur?.(event); }}
    >
      <div className="mw-virtual-list__content">
        {items.length > 0 ? (
          <div className="mw-virtual-list__items" role="list" style={{ height: virtualizer.getTotalSize() }}>
            {virtualizer.getVirtualItems().map((row) => (
              <div key={row.key} ref={virtualizer.measureElement} data-index={row.index}
                className="mw-virtual-list__row" role="listitem" aria-posinset={row.index + 1}
                aria-setsize={items.length} style={{ transform: `translateY(${row.start}px)` }}
              >
                {children(items[row.index]!, row.index)}
              </div>
            ))}
          </div>
        ) : empty}
        {footer}
      </div>
    </div>
  );
}

type VirtualListComponent = <T>(props: VirtualListReactProps<T> & RefAttributes<VirtualListHandle>) => ReactNode;
const VirtualList = forwardRef(VirtualListInner);
VirtualList.displayName = "MwVirtualList";
export default VirtualList as VirtualListComponent;
