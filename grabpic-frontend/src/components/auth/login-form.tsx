import { useState } from "react";

import { Button } from "@/components/ui/button";
import { AuthFormField } from "./auth-form-field";
import { AuthShell } from "./auth-shell";
import { type LoginFormErrors, type LoginFormValues, validateLogin } from "./validation";
import { ArrowRight, Lock, Mail } from "lucide-react";

const initialValues: LoginFormValues = {
  email: "",
  password: "",
};

export function LoginForm() {
  const [values, setValues] = useState<LoginFormValues>(initialValues);
  const [errors, setErrors] = useState<LoginFormErrors>({});
  const [submitted, setSubmitted] = useState(false);

  function updateField(field: keyof LoginFormValues, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
    if (errors[field]) {
      setErrors((current) => ({ ...current, [field]: undefined }));
    }
    if (submitted) {
      setSubmitted(false);
    }
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors = validateLogin(values);
    setErrors(nextErrors);
    setSubmitted(Object.keys(nextErrors).length === 0);
  }

  return (
    <AuthShell
      badge="Secure sign in"
      title="Welcome back"
      description="Sign in to your curator dashboard and pick up where your last event left off."
      footerText="Don't have an account?"
      footerLink={{ label: "Create one now", href: "/register" }}
    >
      <div className="space-y-7">
        <div className="space-y-2">
          <p className="text-sm font-medium uppercase tracking-[0.12em] text-[var(--color-text-tertiary)]">
            Sign in
          </p>
          <h2 className="text-2xl font-bold tracking-[-0.03em] text-[var(--color-text-primary)]">
            Access your event workspace
          </h2>
          <p className="text-sm leading-6 text-[var(--color-text-secondary)]">
            Use your registered email and password to continue.
          </p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit} noValidate>
          <AuthFormField
            id="email"
            label="Email address"
            type="email"
            value={values.email}
            onChange={(event) => updateField("email", event.target.value)}
            placeholder="alex@example.com"
            autoComplete="email"
            error={errors.email}
            rightSlot={<Mail size={14} className="text-[var(--color-text-tertiary)]" />}
          />

          <AuthFormField
            id="password"
            label="Password"
            type="password"
            value={values.password}
            onChange={(event) => updateField("password", event.target.value)}
            placeholder="Your password"
            autoComplete="current-password"
            error={errors.password}
            hint="Use the password you created during registration."
            rightSlot={<Lock size={14} className="text-[var(--color-text-tertiary)]" />}
          />

          {submitted ? (
            <div className="rounded-[14px] border border-[#bbf7d0] bg-[#f0fdf4] px-4 py-3 text-sm font-medium text-[#166534]">
              Validation passed. Connect this form to the auth endpoint when you are ready.
            </div>
          ) : null}

          <Button className="h-12 w-full rounded-[12px] text-[15px]" type="submit">
            Sign in
            <ArrowRight size={16} />
          </Button>
        </form>
      </div>
    </AuthShell>
  );
}