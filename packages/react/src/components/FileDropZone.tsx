import {
  forwardRef,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
  type HTMLAttributes,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
} from "react";
import { mergeDescribedBy, useFormFieldContext } from "./form-field-context";

export type FileDropZoneSurface = "solid" | "inlay";

export interface FileDropZoneProps extends Omit<HTMLAttributes<HTMLDivElement>, "onDrop"> {
  accept?: string;
  multiple?: boolean;
  surface?: FileDropZoneSurface;
  bare?: boolean;
  plain?: boolean;
  disabled?: boolean;
  ariaLabel?: string;
  onFiles?: (files: File[]) => void;
  onFilesChange?: (files: File[]) => void;
  onDrop?: (event: DragEvent<HTMLDivElement>) => void;
  children?: ReactNode;
}

export const FileDropZone = forwardRef<HTMLDivElement, FileDropZoneProps>(function MwFileDropZone(
  props,
  ref,
) {
  const {
    accept,
    multiple = false,
    surface = "solid",
    bare = false,
    plain = false,
    disabled,
    ariaLabel,
    onFiles,
    onFilesChange,
    className,
    children,
    "aria-label": nativeAriaLabel,
    "aria-describedby": nativeAriaDescribedby,
    onClick,
    onKeyDown,
    onDragEnter: userOnDragEnter,
    onDragOver: userOnDragOver,
    onDragLeave: userOnDragLeave,
    onDrop: userOnDrop,
    ...restAttrs
  } = props;

  const fieldContext = useFormFieldContext();
  const resolvedDisabled = Boolean(disabled ?? fieldContext.disabled);
  const resolvedDescribedBy = mergeDescribedBy(nativeAriaDescribedby, fieldContext.describedBy);

  const [isOver, setIsOver] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  // dragenter/leave 进出子元素会成对触发，按嵌套深度计数才不会闪烁。
  const depthRef = useRef(0);

  const framed = !bare && !plain;

  function emitFiles(files: File[]) {
    if (files.length === 0) return;
    onFiles?.(files);
    onFilesChange?.(files);
  }

  function isFileDrag(event: DragEvent<HTMLDivElement>): boolean {
    return !resolvedDisabled && Array.from(event.dataTransfer?.types ?? []).includes("Files");
  }

  function handleDragEnter(event: DragEvent<HTMLDivElement>) {
    userOnDragEnter?.(event);
    if (!isFileDrag(event)) return;
    event.preventDefault();
    event.stopPropagation();
    depthRef.current += 1;
    setIsOver(true);
  }

  function handleDragOver(event: DragEvent<HTMLDivElement>) {
    userOnDragOver?.(event);
    if (!isFileDrag(event)) return;
    event.preventDefault();
    event.stopPropagation();
  }

  function handleDragLeave(event: DragEvent<HTMLDivElement>) {
    userOnDragLeave?.(event);
    if (depthRef.current === 0) return;
    event.stopPropagation();
    depthRef.current = Math.max(0, depthRef.current - 1);
    if (depthRef.current === 0) {
      setIsOver(false);
    }
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    userOnDrop?.(event);
    event.preventDefault();
    event.stopPropagation();
    depthRef.current = 0;
    setIsOver(false);
    if (resolvedDisabled) return;
    const files = Array.from(event.dataTransfer?.files ?? []);
    emitFiles(files);
  }

  function pick() {
    if (!resolvedDisabled) {
      inputRef.current?.click();
    }
  }

  function handleClick(event: MouseEvent<HTMLDivElement>) {
    onClick?.(event);
    pick();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    onKeyDown?.(event);
    if (event.key === "Enter" || event.key === " " || event.key === "Spacebar") {
      event.preventDefault();
      pick();
    }
  }

  function handlePicked(event: ChangeEvent<HTMLInputElement>) {
    if (resolvedDisabled) return;
    const files = Array.from(event.currentTarget.files ?? []);
    event.currentTarget.value = "";
    emitFiles(files);
  }

  const rootClass = [
    "mw-filedrop",
    bare ? "mw-filedrop--bare" : framed ? "mw-filedrop--framed" : "mw-filedrop--plain",
    framed ? `mw-filedrop--${surface}` : undefined,
    isOver ? "mw-filedrop--over" : undefined,
    resolvedDisabled ? "mw-filedrop--disabled" : undefined,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      {...restAttrs}
      ref={ref}
      className={rootClass}
      role="button"
      tabIndex={resolvedDisabled ? -1 : 0}
      aria-disabled={resolvedDisabled}
      aria-label={ariaLabel ?? nativeAriaLabel}
      aria-describedby={resolvedDescribedBy}
      data-disabled={resolvedDisabled ? "" : undefined}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      onDragOver={handleDragOver}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {children}
      <input
        ref={inputRef}
        type="file"
        className="mw-filedrop__input"
        accept={accept}
        multiple={multiple}
        disabled={resolvedDisabled}
        onClick={(e) => e.stopPropagation()}
        onChange={handlePicked}
      />
    </div>
  );
});

FileDropZone.displayName = "MwFileDropZone";

export default FileDropZone;
