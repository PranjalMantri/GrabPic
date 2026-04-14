import { cn } from "@/lib/utils";

type SeparatorProps = {
  className?: string;
  label?: string;
};

export function Separator({ className, label }: SeparatorProps) {
  if (label) {
    return (
      <div className={cn("flex items-center gap-4", className)}>
        <span className="h-px flex-1 bg-[var(--color-border-subtle)]" />
        <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--color-text-tertiary)]">
          {label}
        </span>
        <span className="h-px flex-1 bg-[var(--color-border-subtle)]" />
      </div>
    );
  }

  return <div className={cn("h-px w-full bg-[var(--color-border-subtle)]", className)} />;
}