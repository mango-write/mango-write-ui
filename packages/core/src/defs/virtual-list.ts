export type VirtualListKey = string | number;
export type VirtualListAlignment = "start" | "center" | "end" | "auto";

export interface VirtualListProps<T> {
  items: readonly T[];
  /** Stable, unique identity across reordering and pagination. */
  itemKey: (item: T) => VirtualListKey;
  /** Positive height in pixels until the row is measured. */
  estimateSize: number | ((item: T, index: number) => number);
  overscan?: number;
  /** Keep these rows mounted outside the scroll window during an interaction. */
  pinnedKeys?: readonly VirtualListKey[];
}

export interface VirtualListHandle {
  /** Jump immediately. Returns false if the key is absent or the list is unmounted. */
  scrollToKey: (key: VirtualListKey, align?: VirtualListAlignment) => boolean;
  scrollToStart: () => void;
}
