import { Bell, CalendarDays, Camera, Play, UserCircle2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type EventCardData = {
  title: string;
  date: string;
  photos: string;
  badge: string;
  background: string;
};

const featuredEvents: EventCardData[] = [
  {
    title: "Global Tech Summit 2024",
    date: "Oct 24, 2024",
    photos: "1,248",
    badge: "",
    background:
      "linear-gradient(140deg, #0f2f5a 0%, #1f5f97 45%, #3d89c7 100%)",
  },
  {
    title: "Miller Wedding",
    date: "Nov 02, 2024",
    photos: "842",
    badge: "Featured",
    background:
      "linear-gradient(120deg, #2f1c0f 0%, #8f5a2d 52%, #cfab73 100%)",
  },
];

function EventCard({ title, date, photos, badge, background }: EventCardData) {
  return (
    <article className="space-y-3">
      <div
        className="relative aspect-16/10 overflow-hidden rounded-2xl border border-[#d8dcec] p-4 text-white shadow-[0_14px_30px_-20px_rgba(12,16,26,0.9)]"
        style={{ background }}
      >
        {badge && <span className="inline-flex rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#26314f]">
          {badge}
        </span>}
      </div>
      <div className="space-y-1">
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="line-clamp-1 text-[26px] font-semibold leading-tight tracking-[-0.02em] text-(--color-text-primary)">
            {title}
          </h3>
          <p className="text-sm font-bold text-(--color-text-primary)">{photos}</p>
        </div>
        <div className="flex items-center justify-between text-[13px] text-(--color-text-secondary)">
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays size={14} />
            {date}
          </span>
          <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-(--color-text-tertiary)">
            Photos
          </span>
        </div>
      </div>
    </article>
  );
}

export function AuthenticatedHomePage() {
  return (
    <div className="min-h-screen bg-[var(--color-bg-base)]">
      <header className="sticky top-0 z-20 border-b border-[var(--color-border)] bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex h-16 w-full max-w-[1240px] items-center justify-between px-5">
          <div className="flex items-center gap-8">
            <Link className="flex items-center gap-3" href="/">
              <span className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-[linear-gradient(135deg,#6b5fef_0%,#5b4fe8_100%)] text-white shadow-[var(--shadow-primary)]">
                <Camera size={18} strokeWidth={2.1} />
              </span>
              <span className="text-lg font-bold tracking-[-0.02em] text-[var(--color-text-primary)]">GrabPic</span>
            </Link>

            <nav className="flex items-center gap-2 text-sm font-medium text-[var(--color-text-secondary)]">
              <a
                href="#"
                className="rounded-[10px] bg-[var(--color-primary-subtle)] px-3 py-2 text-[var(--color-primary)]"
              >
                Events
              </a>
              <a href="#" className="rounded-[10px] px-3 py-2 hover:bg-[#eef1f8]">
                Gallery
              </a>
              <a href="#" className="rounded-[10px] px-3 py-2 hover:bg-[#eef1f8]">
                Settings
              </a>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label="Open notifications"
              className="icon-btn border border-transparent text-[var(--color-text-secondary)] hover:border-[var(--color-border)]"
            >
              <Bell size={18} />
            </button>
            <button
              type="button"
              aria-label="Open profile"
              className="icon-btn border border-transparent text-[var(--color-text-secondary)] hover:border-[var(--color-border)]"
            >
              <UserCircle2 size={18} />
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1240px] space-y-8 px-5 py-8">
        <section className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-[42px] font-bold leading-tight tracking-[-0.03em] text-[var(--color-text-primary)]">
              Welcome back, Alex.
            </h1>
          </div>
        </section>

        <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {featuredEvents.map((event) => (
            <EventCard key={event.title} {...event} />
          ))}
        </section>

        <Card className="border-none bg-[var(--color-primary-subtle)] shadow-none">
          <CardContent className="grid gap-6 p-7 lg:grid-cols-[1.5fr_1fr] lg:items-center">
            <div className="space-y-3">
              <span className="inline-flex rounded-full bg-[#feecc8] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-[#b45309]">
                New Feature
              </span>
              <h2 className="text-3xl font-bold tracking-[-0.02em] text-[var(--color-text-primary)]">
                Magic Face Recognition
              </h2>
              <p className="max-w-[56ch] text-[15px] leading-7 text-[var(--color-text-secondary)]">
                Guests can find their photos instantly by uploading one selfie. Your album is automatically filtered and ready to share in seconds.
              </p>
              <div className="flex items-center gap-3 pt-1">
                <Button type="button" size="sm">Learn More</Button>
              </div>
            </div>
            
            <div className="relative h-55 w-full overflow-hidden rounded-2xl">
                <Image
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDZY4thA_xv_AkvSAP9osk8num1bz2v8eFJcBAIvexRMEIH3FlPLirDaGI3y-IVt4gfmvKRj0_YwDfR5DNwv-ziHmeCPJlqmTYwL_NpIR-ikz41rT2MEE0OFA-mepDBE8oYdDHw4cQaM80iXu4O1hKEsXAiv77J0YsGNTCPcWULHB3bz6FQzSjJDQc-Xj3VHH4lNUZml5lCidScGXMdBIuOb1aMCl6-B8NeL5VBvQbTq-yq-RcH6ikeUNB5nkPku-tngvVMeoyLKWI" // use a GOOD local asset
                    alt="Face recognition"
                    fill
                    className="object-cover"
                />
                <div className="absolute inset-0 bg-black/20" />
                <button
                  type="button"
                  aria-label="Play Magic Face Recognition demo"
                  className="absolute left-1/2 top-1/2 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/40 bg-white/20 text-white backdrop-blur-sm transition hover:scale-105 hover:bg-white/30"
                >
                  <Play size={20} fill="currentColor" className="ml-0.5" />
                </button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
