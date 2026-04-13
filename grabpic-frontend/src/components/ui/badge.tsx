import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium tracking-normal",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-[var(--color-primary-subtle)] text-[var(--color-primary)]",
        dark: "border-transparent bg-[var(--color-text-primary)] text-white",
        outline: "border-[var(--color-border)] bg-white text-[var(--color-text-secondary)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
