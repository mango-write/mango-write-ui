import { forwardRef, type HTMLAttributes } from "react";

export interface InputGroupAddonProps extends HTMLAttributes<HTMLDivElement> {}

export const InputGroupAddon = forwardRef<HTMLDivElement, InputGroupAddonProps>(
  function MwInputGroupAddon({ className, children, ...restAttrs }, ref) {
    return (
      <div
        {...restAttrs}
        ref={ref}
        className={["mw-input-group-addon", className].filter(Boolean).join(" ")}
      >
        {children}
      </div>
    );
  },
);

InputGroupAddon.displayName = "MwInputGroupAddon";

export default InputGroupAddon;
