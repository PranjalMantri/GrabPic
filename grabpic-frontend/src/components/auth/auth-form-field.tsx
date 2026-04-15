import type { ChangeEventHandler, ReactNode } from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type AuthFormFieldProps = {
  id: string;
  label: string;
  type?: string;
  value: string;
  onChange: ChangeEventHandler<HTMLInputElement>;
  placeholder?: string;
  autoComplete?: string;
  error?: string;
  hint?: string;
  rightSlot?: ReactNode;
  className?: string;
  disabled?: boolean;
};

export function AuthFormField({
  id,
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  autoComplete,
  error,
  hint,
  rightSlot,
  className,
  disabled = false,
}: AuthFormFieldProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between gap-3">
        <Label htmlFor={id}>{label}</Label>
        {rightSlot}
      </div>

      <Input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={autoComplete}
        disabled={disabled}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
      />

      {error ? (
        <p id={`${id}-error`} className="text-sm font-medium text-[#dc2626]">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="text-sm text-(--color-text-tertiary)">{hint}</p>
      ) : null}
    </div>
  );
}