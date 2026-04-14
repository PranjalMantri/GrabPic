import Head from "next/head";
import { useRouter } from "next/router";
import { useState } from "react";

import { Crown, LogOut, Settings as SettingsIcon, UserRound } from "lucide-react";

import { AuthenticatedNavbar } from "@/components/home";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { clearMockSession } from "@/lib/auth";

type FormValues = {
  firstName: string;
  lastName: string;
  email: string;
  bio: string;
};

const initialValues: FormValues = {
  firstName: "Alexander",
  lastName: "Rivers",
  email: "alex.rivers@designhaus.com",
  bio: "Event photographer and tech enthusiast. Capturing moments through the lens and AI curation.",
};

export default function SettingsPage() {
  const router = useRouter();
  const [savedValues, setSavedValues] = useState<FormValues>(initialValues);
  const [formValues, setFormValues] = useState<FormValues>(initialValues);

  const isDirty =
    formValues.firstName !== savedValues.firstName ||
    formValues.lastName !== savedValues.lastName ||
    formValues.email !== savedValues.email ||
    formValues.bio !== savedValues.bio;

  function handleLogout() {
    clearMockSession();
    void router.push("/login");
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!isDirty) {
      return;
    }

    setSavedValues(formValues);
  }

  function handleReset(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormValues(savedValues);
  }

  function updateField(field: keyof FormValues, value: string) {
    setFormValues((current) => ({ ...current, [field]: value }));
  }

  function handleUpdateFace() {
    void router.push("/settings/update-face");
  }

  return (
    <>
      <Head>
        <title>GrabPic | Settings</title>
        <meta
          name="description"
          content="Update your account profile, photo privacy, and face scan settings in GrabPic."
        />
      </Head>

      <div className="min-h-screen bg-(--color-bg-base)">
        <AuthenticatedNavbar activeTab="Settings" />

        <main className="mx-auto w-full max-w-6xl px-5 py-8">
          <section className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-(--color-primary)">
                Settings
              </p>
              <h1 className="mt-2 text-[42px] font-bold tracking-[-0.03em] text-(--color-text-primary)">
                Account Profile
              </h1>
              <p className="mt-2 max-w-2xl text-[15px] leading-7 text-(--color-text-secondary)">
                Manage your identity, face profile, and privacy settings across every event gallery.
              </p>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-2 rounded-[10px] border border-[#f5c7c2] bg-white px-4 py-2 text-sm font-semibold text-[#b42318] transition hover:bg-[#fef3f2]"
            >
              <LogOut size={16} />
              Logout
            </button>
          </section>

          <section className="mt-8 grid gap-6 lg:grid-cols-[1.45fr_0.8fr]">
            <form className="space-y-6" onReset={handleReset} onSubmit={handleSubmit}>
              <Card className="border-none shadow-[0_18px_50px_rgba(15,15,26,0.06)]">
                <CardContent className="space-y-6 p-7">
                  <div>
                    <h2 className="text-2xl font-bold tracking-[-0.02em] text-(--color-text-primary)">
                      Personal Information
                    </h2>
                    <p className="mt-1 text-sm text-(--color-text-secondary)">
                      Keep your profile details accurate so AI can match you across event albums.
                    </p>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="space-y-2">
                      <span className="text-[12px] font-semibold uppercase tracking-[0.08em] text-(--color-text-tertiary)">
                        First Name
                      </span>
                      <Input
                        value={formValues.firstName}
                        onChange={(event) => updateField("firstName", event.target.value)}
                      />
                    </label>
                    <label className="space-y-2">
                      <span className="text-[12px] font-semibold uppercase tracking-[0.08em] text-(--color-text-tertiary)">
                        Last Name
                      </span>
                      <Input
                        value={formValues.lastName}
                        onChange={(event) => updateField("lastName", event.target.value)}
                      />
                    </label>
                  </div>

                  <label className="block space-y-2">
                    <span className="text-[12px] font-semibold uppercase tracking-[0.08em] text-(--color-text-tertiary)">
                      Email Address
                    </span>
                    <Input
                      type="email"
                      value={formValues.email}
                      onChange={(event) => updateField("email", event.target.value)}
                    />
                  </label>

                  <label className="block space-y-2">
                    <span className="text-[12px] font-semibold uppercase tracking-[0.08em] text-(--color-text-tertiary)">
                      Bio
                    </span>
                    <textarea
                      value={formValues.bio}
                      onChange={(event) => updateField("bio", event.target.value)}
                      rows={4}
                      className="w-full resize-none rounded-[10px] border border-transparent bg-[#f4f5f7] px-4 py-3 text-[15px] text-(--color-text-primary) outline-none transition-[border-color,background,box-shadow] duration-200 placeholder:text-(--color-text-tertiary) focus:border-(--color-primary) focus:bg-white focus:ring-2 focus:ring-(--color-primary)/10"
                    />
                  </label>
                </CardContent>
              </Card>

              <div className="flex flex-col gap-3 border-t border-(--color-border) pt-6 sm:flex-row sm:justify-end">
                <Button type="reset" variant="secondary">
                  Cancel
                </Button>
                <Button type="submit" disabled={!isDirty}>
                  Save Changes
                </Button>
              </div>
            </form>

            <div className="space-y-6">
              <Card className="border-none shadow-[0_18px_50px_rgba(15,15,26,0.06)]">
                <CardContent className="flex flex-col items-center px-7 py-8 text-center">
                  <div className="relative">
                    <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-[linear-gradient(135deg,#0f172a_0%,#1f2937_100%)] text-white shadow-[0_18px_40px_rgba(15,15,26,0.25)]">
                      <UserRound size={58} strokeWidth={1.8} />
                    </div>
                    <span className="absolute -bottom-1 -right-1 flex h-9 w-9 items-center justify-center rounded-full border-4 border-white bg-(--color-primary) text-white shadow-(--shadow-primary)">
                      <SettingsIcon size={16} />
                    </span>
                  </div>

                  <h2 className="mt-5 text-2xl font-bold tracking-[-0.02em] text-(--color-text-primary)">
                    AI ID Scan
                  </h2>
                  <p className="mt-2 max-w-[24ch] text-sm leading-6 text-(--color-text-secondary)">
                    This face profile helps find you automatically in large event galleries.
                  </p>

                  <Button className="mt-5 w-full" type="button" onClick={handleUpdateFace}>
                    Update Face
                  </Button>

                  <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-(--color-text-tertiary)">
                    Last updated Oct 12, 2023
                  </p>
                </CardContent>
              </Card>

              <Card className="border-none bg-[#fff7e6] shadow-none">
                <CardContent className="space-y-2 p-5">
                  <div className="flex items-center gap-2 text-[#b45309]">
                    <Crown size={16} />
                    <p className="text-[13px] font-bold">Pro Tip</p>
                  </div>
                  <p className="text-sm leading-6 text-[#7c4a16]">
                    High-quality facial scans improve matching accuracy and speed during live events.
                  </p>
                </CardContent>
              </Card>
            </div>
          </section>
        </main>
      </div>
    </>
  );
}
