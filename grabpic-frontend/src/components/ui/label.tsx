import * as React from "react";

import { cn } from "@/lib/utils";

const Label = React.forwardRef<HTMLLabelElement, React.LabelHTMLAttributes<HTMLLabelElement>>(
  ({ className, ...props }, ref) => {
    return (
      <label
        ref={ref}
        className={cn(
          "mb-2 block text-[12px] font-semibold uppercase tracking-[0.08em] text-[var(--color-text-tertiary)]",
          className,
        )}
        {...props}
      />
    );
  },
);

Label.displayName = "Label";

export { Label };