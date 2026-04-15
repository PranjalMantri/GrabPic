import { Camera, CalendarDays, Play } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { AuthenticatedNavbar } from "@/components/home/authenticated-navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { apiClient } from "@/lib/api-client";
import { EventItem, ProfileResponse, getApiErrorMessage } from "@/lib/api-types";

type EventCardData = {
  id: string;
  title: string;
  date: string;
  photos: string;
  badge: string;
  background: string;
  coverImage?: string;
};

const cardBackgrounds = [
  "linear-gradient(140deg, #0f2f5a 0%, #1f5f97 45%, #3d89c7 100%)",
  "linear-gradient(120deg, #2f1c0f 0%, #8f5a2d 52%, #cfab73 100%)",
  "linear-gradient(120deg, #18382f 0%, #256255 55%, #5ac29d 100%)",
];

function formatEventDate(rawDate?: string): string {
  if (!rawDate) {
    return "Date not set";
  }

  const parsed = new Date(rawDate);
  if (Number.isNaN(parsed.valueOf())) {
    return "Date not set";
  }

  return parsed.toLocaleDateString(undefined, {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
}

function mapEventToCard(event: EventItem, index: number): EventCardData {
  const mediaCount = Array.isArray(event.media) ? event.media.length : 0;

  return {
    id: event._id,
    title: event.name,
    date: formatEventDate(event.date),
    photos: mediaCount.toLocaleString(),
    badge: index === 0 ? "Recent" : "",
    background: cardBackgrounds[index % cardBackgrounds.length],
    coverImage: event.coverImage,
  };
}

function EventCard({ id, title, date, photos, badge, background, coverImage }: EventCardData) {
  return (
    <Link
      href={`/events/${id}`}
      className="group block rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--color-primary)"
    >
      <article className="space-y-3">
        <div
          className="relative aspect-16/10 overflow-hidden rounded-2xl border border-[#d8dcec] p-4 text-white shadow-[0_14px_30px_-20px_rgba(12,16,26,0.9)] transition-transform duration-200 group-hover:scale-[1.01]"
          style={coverImage ? { backgroundImage: `url(${coverImage})`, backgroundSize: 'cover', backgroundPosition: 'center' } : { background }}
        >
          {badge ? (
            <span className="inline-flex rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#26314f]">
              {badge}
            </span>
          ) : null}
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
    </Link>
  );
}

export function AuthenticatedHomePage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [profile, setProfile] = useState<{ name: string }>({ name: "User" });

  useEffect(() => {
    let isMounted = true;

    const loadProfile = async () => {
      const [data, response] = await apiClient.get<ProfileResponse>("/user/profile");
      if (!isMounted || response.status !== 200 || !data?.user) {
        return;
      }

      setProfile({
        name: data.user.name,
      });
    };

    void loadProfile();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadEvents = async () => {
      setIsLoading(true);
      setErrorMessage(null);

      const [data, response] = await apiClient.get<EventItem[]>("/events");

      if (!isMounted) {
        return;
      }

      if (response.status !== 200 || !data) {
        setErrorMessage(getApiErrorMessage(response.error, "Failed to load events."));
        setEvents([]);
        setIsLoading(false);
        return;
      }

      setEvents(data);
      setIsLoading(false);
    };

    void loadEvents();

    return () => {
      isMounted = false;
    };
  }, []);

  const eventCards = useMemo(() => events.map(mapEventToCard), [events]);

  return (
    <div className="min-h-screen bg-(--color-bg-base)">
      <AuthenticatedNavbar activeTab="Events" />

      <main className="mx-auto w-full max-w-6xl space-y-8 px-5 py-8">
        <section className="flex flex-col items-start justify-between gap-5 text-left lg:flex-row lg:items-end">
          <div className="space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-(--color-primary)">
              Dashboard
            </p>
            <h1 className="text-[42px] font-bold leading-tight tracking-[-0.03em] text-(--color-text-primary)">
              Welcome back, {profile.name}.
            </h1>
            <p className="max-w-2xl text-[15px] leading-7 text-(--color-text-secondary)">
              Track active events, review curated highlights, and jump into your latest AI-assisted galleries.
            </p>
          </div>

          <Link
            href="/events/create"
            className="inline-flex h-11 items-center gap-2 rounded-[10px] bg-(--color-primary) px-5 text-sm font-semibold text-white shadow-(--shadow-primary) transition hover:bg-(--color-primary-dark)"
          >
            <Camera size={16} color="white" />
            <span className="text-white">Create Event</span>
          </Link>
        </section>

        <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {isLoading
            ? Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={`event-skeleton-${index}`}
                  className="h-55 animate-pulse rounded-2xl border border-(--color-border) bg-white"
                />
              ))
            : null}

          {!isLoading && errorMessage ? (
            <Card className="border-none bg-[#fff4f2] shadow-none md:col-span-2 xl:col-span-3">
              <CardContent className="flex flex-col gap-3 p-5">
                <p className="text-sm font-semibold text-[#b42318]">{errorMessage}</p>
                <Button
                  type="button"
                  size="sm"
                  onClick={() => {
                    window.location.reload();
                  }}
                >
                  Retry
                </Button>
              </CardContent>
            </Card>
          ) : null}

          {!isLoading && !errorMessage && eventCards.length === 0 ? (
            <Card className="border-none bg-(--color-primary-subtle) shadow-none md:col-span-2 xl:col-span-3">
              <CardContent className="space-y-3 p-6">
                <p className="text-sm font-semibold text-(--color-text-primary)">No events yet.</p>
                <p className="text-sm text-(--color-text-secondary)">
                  Create your first event to start uploading and curating photos.
                </p>
                <Link href="/events/create" className="inline-flex">
                  <Button type="button" size="sm">
                    Create Event
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : null}

          {!isLoading && !errorMessage
            ? eventCards.map((event) => <EventCard key={event.id} {...event} />)
            : null}
        </section>

        <Card className="border-none bg-(--color-primary-subtle) shadow-none">
          <CardContent className="grid gap-6 p-7 lg:grid-cols-[1.5fr_1fr] lg:items-center">
            <div className="space-y-3">
              <span className="inline-flex rounded-full bg-[#feecc8] px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-[#b45309]">
                New Feature
              </span>
              <h2 className="text-3xl font-bold tracking-[-0.02em] text-(--color-text-primary)">
                Magic Face Recognition
              </h2>
              <p className="max-w-[56ch] text-[15px] leading-7 text-(--color-text-secondary)">
                Guests can find their photos instantly by uploading one selfie. Your album is automatically filtered and ready to share in seconds.
              </p>
              <div className="flex items-center gap-3 pt-1">
                <Button 
                  type="button" 
                  size="sm"
                  onClick={() => window.open("https://youtu.be/MtFhxAAMtyc", "_blank")}
                >
                  Learn More
                </Button>
              </div>
            </div>

            <div className="relative h-55 w-full overflow-hidden rounded-2xl">
              <Image
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDZY4thA_xv_AkvSAP9osk8num1bz2v8eFJcBAIvexRMEIH3FlPLirDaGI3y-IVt4gfmvKRj0_YwDfR5DNwv-ziHmeCPJlqmTYwL_NpIR-ikz41rT2MEE0OFA-mepDBE8oYdDHw4cQaM80iXu4O1hKEsXAiv77J0YsGNTCPcWULHB3bz6FQzSjJDQc-Xj3VHH4lNUZml5lCidScGXMdBIuOb1aMCl6-B8NeL5VBvQbTq-yq-RcH6ikeUNB5nkPku-tngvVMeoyLKWI"
                alt="Face recognition"
                fill
                sizes="(min-width: 1024px) 33vw, 100vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-black/20" />
              <button
                type="button"
                aria-label="Play Magic Face Recognition demo"
                onClick={() => window.open("https://youtu.be/MtFhxAAMtyc", "_blank")}
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
