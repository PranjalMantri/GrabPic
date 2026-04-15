import { useMemo, useState } from "react";
import { useRouter } from "next/router";

import { Button } from "@/components/ui/button";
import { setAccessToken, setRefreshToken } from "@/lib/auth";
import { apiClient } from "@/lib/api-client";
import { getSafeNextPath } from "@/lib/navigation";
import { AuthFormField } from "./auth-form-field";
import { AuthShell } from "./auth-shell";
import { type LoginFormErrors, type LoginFormValues, validateLogin } from "./validation";
import { ArrowRight, Lock, Mail } from "lucide-react";

const initialValues: LoginFormValues = {
  email: "",
  password: "",
};

export function LoginForm() {
  const router = useRouter();
  const nextPath = getSafeNextPath(router.query.next, "/");
  const registerHref = useMemo(() => {
    const encodedNext = encodeURIComponent(nextPath);
    return `/register?next=${encodedNext}`;
  }, [nextPath]);
  const [values, setValues] = useState<LoginFormValues>(initialValues);
  const [errors, setErrors] = useState<LoginFormErrors>({});
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string>("");

  function updateField(field: keyof LoginFormValues, value: string) {
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

    const nextErrors = validateLogin(values);
    setErrors(nextErrors);
    const isValid = Object.keys(nextErrors).length === 0;
    setSubmitted(isValid);

    if (!isValid) {
      return;
    }

    setIsLoading(true);
    setApiError("");

    try {
      const [data, response] = await apiClient.post("/auth/login", {
        email: values.email,
        password: values.password,
      }, { skipAuth: true });

      if (response.status !== 200 || !data) {
        setApiError(response.error || "Login failed. Please try again.");
        setIsLoading(false);
        return;
      }

      // Store tokens
      setAccessToken(data.accessToken);
      setRefreshToken(data.refreshToken);

      // Check if face is registered
      if (data.user && !data.user.face_registered) {
        // Redirect to force face registration
        const encodedNext = encodeURIComponent(nextPath);
        void router.push(`/settings/register-face?next=${encodedNext}`);
      } else {
        void router.push(nextPath);
      }
    } catch (error) {
      console.error("[LoginForm] Submission error:", error);
      setApiError("An unexpected error occurred. Please try again.");
      setIsLoading(false);
    }
  }

  return (
    <AuthShell
      badge="Secure sign in"
      title="Welcome back"
      description="Sign in to your curator dashboard and pick up where your last event left off."
      footerText="Don't have an account?"
      footerLink={{ label: "Create one now", href: registerHref }}
    >
      <div className="space-y-7">
        <div className="space-y-2">
          <p className="text-sm font-medium uppercase tracking-[0.12em] text-(--color-text-tertiary)">
            Sign in
          </p>
          <h2 className="text-2xl font-bold tracking-[-0.03em] text-(--color-text-primary)">
            Access your event workspace
          </h2>
          <p className="text-sm leading-6 text-(--color-text-secondary)">
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
            rightSlot={<Mail size={14} className="text-(--color-text-tertiary)" />}
            disabled={isLoading}
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
            rightSlot={<Lock size={14} className="text-(--color-text-tertiary)" />}
            disabled={isLoading}
          />

          {apiError && (
            <div className="rounded-[14px] border border-[#fecaca] bg-[#fef2f2] px-4 py-3 text-sm font-medium text-[#991b1b]">
              {apiError}
            </div>
          )}

          <Button className="h-12 w-full rounded-xl text-[15px]" type="submit" disabled={isLoading}>
            {isLoading ? "Signing in..." : "Sign in"}
            {!isLoading && <ArrowRight size={16} />}
          </Button>
        </form>
      </div>
    </AuthShell>
  );
}