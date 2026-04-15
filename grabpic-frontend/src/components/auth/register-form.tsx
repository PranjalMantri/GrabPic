import { useMemo, useState } from "react";
import { useRouter } from "next/router";

import { Button } from "@/components/ui/button";
import { setAccessToken, setRefreshToken } from "@/lib/auth";
import { apiClient } from "@/lib/api-client";
import { getSafeNextPath } from "@/lib/navigation";
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
  const nextPath = getSafeNextPath(router.query.next, "/");
  const loginHref = useMemo(() => {
    const encodedNext = encodeURIComponent(nextPath);
    return `/login?next=${encodedNext}`;
  }, [nextPath]);
  const [values, setValues] = useState<RegisterFormValues>(initialValues);
  const [errors, setErrors] = useState<RegisterFormErrors>({});
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string>("");

  function updateField(field: keyof RegisterFormValues, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
    if (errors[field]) {
      setErrors((current) => ({ ...current, [field]: undefined }));
    }
    if (submitted) {
      setSubmitted(false);
    }
    if (apiError) {
      setApiError("");
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors = validateRegister(values);
    setErrors(nextErrors);
    const isValid = Object.keys(nextErrors).length === 0;
    setSubmitted(isValid);

    if (!isValid) {
      return;
    }

    setIsLoading(true);
    setApiError("");

    try {
      const [data, response] = await apiClient.post("/auth/register", {
        name: values.name,
        email: values.email,
        password: values.password,
      }, { skipAuth: true });

      if (response.status !== 201 || !data) {
        setApiError(response.error || "Registration failed. Please try again.");
        setIsLoading(false);
        return;
      }

      // Store tokens
      setAccessToken(data.accessToken);
      setRefreshToken(data.refreshToken);

      if (data.user?.face_registered) {
        void router.push(nextPath);
      } else {
        const encodedNext = encodeURIComponent(nextPath);
        void router.push(`/settings/register-face?next=${encodedNext}`);
      }
    } catch (error) {
      console.error("[RegisterForm] Submission error:", error);
      setApiError("An unexpected error occurred. Please try again.");
      setIsLoading(false);
    }
  }

  return (
    <AuthShell
      badge="Create your account"
      title="Start curating moments"
      description="Set up your GrabPic account and get ready to organize event memories with AI-backed search."
      footerText="Already have an account?"
      footerLink={{ label: "Sign in instead", href: loginHref }}
    >
      <div className="space-y-7">
        <div className="space-y-2">
          <p className="text-sm font-medium uppercase tracking-[0.12em] text-(--color-text-tertiary)">
            Register
          </p>
          <h2 className="text-2xl font-bold tracking-[-0.03em] text-(--color-text-primary)">
            Build your curator profile
          </h2>
          <p className="text-sm leading-6 text-(--color-text-secondary)">
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
            rightSlot={<User size={14} className="text-(--color-text-tertiary)" />}
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
            rightSlot={<Mail size={14} className="text-(--color-text-tertiary)" />}
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
            rightSlot={<Lock size={14} className="text-(--color-text-tertiary)" />}
          />

          <Button className="h-12 w-full rounded-xl text-[15px]" type="submit">
            {isLoading ? "Creating account..." : "Create account"}
            {!isLoading && <ArrowRight size={16} />}
          </Button>

        </form>
      </div>
    </AuthShell>
  );
}