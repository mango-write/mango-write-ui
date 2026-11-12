import { forwardRef, type HTMLAttributes } from "react";

export interface InputGroupProps extends HTMLAttributes<HTMLDivElement> {}

export const InputGroup = forwardRef<HTMLDivElement, InputGroupProps>(function MwInputGroup(
  { className, children, ...restAttrs },
  ref,
) {
  return (
    <div
      {...restAttrs}
      ref={ref}
      className={["mw-input-group", className].filter(Boolean).join(" ")}
    >
      {children}
    </div>
  );
});

InputGroup.displayName = "MwInputGroup";

export default InputGroup;
