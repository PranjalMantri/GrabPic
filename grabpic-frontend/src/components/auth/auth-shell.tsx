import type { ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { Camera, Sparkles, ShieldCheck, Users } from "lucide-react";

type AuthShellProps = {
  badge: string;
  title: string;
  description: string;
  footerText: string;
  footerLink: {
    label: string;
    href: string;
  };
  children: ReactNode;
};

const highlights = [
  {
    title: "Private event galleries",
    description: "Keep every album tied to the right event and the right audience.",
    icon: ShieldCheck,
  },
  {
    title: "AI photo discovery",
    description: "Let face matching find the moments worth keeping in seconds.",
    icon: Sparkles,
  },
  {
    title: "Built for teams",
    description: "Curators, photographers, and guests can all move faster together.",
    icon: Users,
  },
];

export function AuthShell({ badge, title, description, footerText, footerLink, children }: AuthShellProps) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[radial-gradient(ellipse_at_top_left,#ebeafc_0%,#f4f5f7_38%,#eef0fd_100%)] px-4 py-8 text-(--color-text-primary) sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(91,79,232,0.14),transparent_28%),radial-gradient(circle_at_80%_10%,rgba(91,79,232,0.09),transparent_24%),linear-gradient(180deg,rgba(255,255,255,0.55),rgba(255,255,255,0))]" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.35] bg-[radial-gradient(rgba(143,151,176,0.28)_1px,transparent_1px)] bg-size-[18px_18px]" />

      <div className="relative mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-6xl flex-col">
        <header className="flex items-center justify-center py-3 sm:justify-start">
          <Link href="/" className="flex items-center gap-3 text-[15px] font-bold tracking-[-0.02em]">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[linear-gradient(135deg,#6b5fef_0%,#5b4fe8_100%)] text-white shadow-(--shadow-primary)">
              <Camera size={22} strokeWidth={2.2} />
            </span>
            <span className="flex flex-col leading-none">
              <span className="text-[18px] font-bold text-(--color-text-primary)">GrabPic</span>
              <span className="text-[11px] font-medium tracking-[0.12em] text-(--color-text-tertiary) uppercase">
                Curating event memories with AI
              </span>
            </span>
          </Link>
        </header>

        <section className="grid flex-1 items-center gap-10 py-6 lg:grid-cols-[0.95fr_1.05fr] lg:py-10">
          <div className="mx-auto w-full max-w-xl space-y-8 text-center lg:text-left">
            <div className="space-y-4">
              <Badge className="w-fit border border-white/70 bg-white/80 px-3 py-1.5 text-[11px] tracking-[0.12em] text-(--color-primary) shadow-[0_10px_30px_rgba(91,79,232,0.08)] backdrop-blur-xl">
                {badge}
              </Badge>
              <div className="space-y-4">
                <h1 className="text-4xl font-extrabold tracking-[-0.04em] text-(--color-text-primary) sm:text-5xl lg:text-6xl">
                  {title}
                </h1>
                <p className="mx-auto max-w-lg text-base leading-7 text-(--color-text-secondary) lg:mx-0 lg:text-lg">
                  {description}
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
              {highlights.map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.title}
                    className="rounded-[18px] border border-white/70 bg-white/80 p-4 text-left shadow-[0_18px_50px_rgba(20,23,35,0.08)] backdrop-blur-xl"
                  >
                    <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-(--color-primary-subtle) text-(--color-primary)">
                      <Icon size={18} strokeWidth={2.25} />
                    </div>
                    <h2 className="text-sm font-semibold text-(--color-text-primary)">{item.title}</h2>
                    <p className="mt-1 text-sm leading-6 text-(--color-text-secondary)">
                      {item.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mx-auto w-full max-w-130">
            <Card className="overflow-hidden border-white/70 bg-[rgba(255,255,255,0.9)] shadow-[0_30px_90px_rgba(20,23,35,0.12)] backdrop-blur-2xl">
              <CardContent className="p-6 sm:p-8">{children}</CardContent>
            </Card>

            <p className="mt-6 text-center text-sm text-(--color-text-secondary)">
              {footerText}{" "}
              <a href={footerLink.href} className="font-semibold text-(--color-primary) hover:underline">
                {footerLink.label}
              </a>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}