import {
  forwardRef,
  isValidElement,
  type ComponentType,
  type HTMLAttributes,
  type ReactNode,
} from "react";

export type InputIconProp =
  | ComponentType<{ className?: string; size?: number | string }>
  | ReactNode;

export interface InputIconProps extends HTMLAttributes<HTMLSpanElement> {
  icon?: InputIconProp;
}

function renderIcon(icon: InputIconProp | undefined): ReactNode {
  if (icon === undefined || icon === null || typeof icon === "boolean") return null;
  if (isValidElement(icon)) return icon;
  if (typeof icon === "function" || (typeof icon === "object" && "$$typeof" in icon)) {
    const IconComp = icon as ComponentType<{ className?: string }>;
    return <IconComp />;
  }
  return icon;
}

export const InputIcon = forwardRef<HTMLSpanElement, InputIconProps>(function MwInputIcon(
  { className, icon, children, ...restAttrs },
  ref,
) {
  return (
    <span
      {...restAttrs}
      ref={ref}
      className={["mw-input-icon", className].filter(Boolean).join(" ")}
    >
      {children ?? renderIcon(icon)}
    </span>
  );
});

InputIcon.displayName = "MwInputIcon";

export default InputIcon;
