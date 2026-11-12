import { forwardRef, type HTMLAttributes } from "react";

export interface IconFieldProps extends HTMLAttributes<HTMLDivElement> {}

export const IconField = forwardRef<HTMLDivElement, IconFieldProps>(function MwIconField(
  { className, children, ...restAttrs },
  ref,
) {
  return (
    <div
      {...restAttrs}
      ref={ref}
      className={["mw-icon-field", className].filter(Boolean).join(" ")}
    >
      {children}
    </div>
  );
});

IconField.displayName = "MwIconField";

export default IconField;
