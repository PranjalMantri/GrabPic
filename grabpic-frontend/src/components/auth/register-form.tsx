import { useState } from "react";
import { useRouter } from "next/router";

import { Button } from "@/components/ui/button";
import { createMockSession } from "@/lib/auth";
import { AuthFormField } from "./auth-form-field";
import { AuthShell } from "./auth-shell";
import { type RegisterFormErrors, type RegisterFormValues, validateRegister } from "./validation";
import { ArrowRight, User, Mail, Lock } from "lucide-react";

const initialValues: RegisterFormValues = {
  name: "",
  email: "",
  password: "",
};

export function RegisterForm() {
  const router = useRouter();
  const [values, setValues] = useState<RegisterFormValues>(initialValues);
  const [errors, setErrors] = useState<RegisterFormErrors>({});
  const [submitted, setSubmitted] = useState(false);

  function updateField(field: keyof RegisterFormValues, value: string) {
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

    const nextErrors = validateRegister(values);
    setErrors(nextErrors);
    const isValid = Object.keys(nextErrors).length === 0;
    setSubmitted(isValid);

    if (isValid) {
      createMockSession();
      void router.push("/");
    }
  }

  return (
    <AuthShell
      badge="Create your account"
      title="Start curating moments"
      description="Set up your GrabPic account and get ready to organize event memories with AI-backed search."
      footerText="Already have an account?"
      footerLink={{ label: "Sign in instead", href: "/login" }}
    >
      <div className="space-y-7">
        <div className="space-y-2">
          <p className="text-sm font-medium uppercase tracking-[0.12em] text-[var(--color-text-tertiary)]">
            Register
          </p>
          <h2 className="text-2xl font-bold tracking-[-0.03em] text-[var(--color-text-primary)]">
            Build your curator profile
          </h2>
          <p className="text-sm leading-6 text-[var(--color-text-secondary)]">
            Create an account with your name, email, and a secure password.
          </p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit} noValidate>
          <AuthFormField
            id="name"
            label="Full name"
            value={values.name}
            onChange={(event) => updateField("name", event.target.value)}
            placeholder="Alex Morgan"
            autoComplete="name"
            error={errors.name}
            rightSlot={<User size={14} className="text-[var(--color-text-tertiary)]" />}
          />

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
            placeholder="Create a strong password"
            autoComplete="new-password"
            error={errors.password}
            hint="Use at least 8 characters with uppercase, lowercase, and a number."
            rightSlot={<Lock size={14} className="text-[var(--color-text-tertiary)]" />}
          />

          {submitted ? (
            <div className="rounded-[14px] border border-[#bbf7d0] bg-[#f0fdf4] px-4 py-3 text-sm font-medium text-[#166534]">
              Validation passed. Wire this form to your registration endpoint next.
            </div>
          ) : null}

          <Button className="h-12 w-full rounded-[12px] text-[15px]" type="submit">
            Create account
            <ArrowRight size={16} />
          </Button>

        </form>
      </div>
    </AuthShell>
  );
}