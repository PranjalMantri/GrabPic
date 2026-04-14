import Head from "next/head";

import {
  CheckCircle2,
  Image as ImageIcon,
  Sparkles,
} from "lucide-react";

import { AuthenticatedNavbar } from "@/components/home";
import { Card, CardContent } from "@/components/ui/card";

type GallerySummary = {
  title: string;
  photos: number;
  matches: number;
  accent: string;
};

const gallerySummary: GallerySummary = {
  title: "Your Personal Photo Library",
  photos: 18452,
  matches: 421,
  accent: "from-[#102545] via-[#1d4f80] to-[#52a4d8]",
};

const curatedPhotos = [
  { src: "/gallery/media-1.svg", alt: "Spotlight stage", span: "md:col-span-2" },
  { src: "/gallery/media-2.svg", alt: "Speaker portrait" },
  { src: "/gallery/media-3.svg", alt: "Happy attendee" },
  { src: "/gallery/media-4.svg", alt: "Networking floor" },
  { src: "/gallery/media-5.svg", alt: "Formal portrait" },
  { src: "/gallery/media-6.svg", alt: "Audience close-up" },
];

function GalleryCard({ title, photos, matches, accent }: GallerySummary) {
  const curationScore = Math.min(99, 86 + Math.round(matches / 6));

  return (
    <article className="overflow-hidden rounded-[22px] border border-(--color-border) bg-white shadow-(--shadow-card)">
      <div className="grid gap-4 p-5 lg:grid-cols-[1fr_220px]">
        <div>
          <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-(--color-text-tertiary)">
            Curated gallery
          </p>
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {curatedPhotos.map((photo) => (
              <div
                key={photo.src}
                className={`group relative overflow-hidden rounded-[14px] border border-(--color-border-subtle) ${photo.span ?? ""}`}
              >
                <img
                  src={photo.src}
                  alt={photo.alt}
                  className="h-38 w-full object-cover transition duration-300 group-hover:scale-[1.04]"
                />
                <div className="absolute inset-x-0 bottom-0 h-16 bg-[linear-gradient(to_top,rgba(9,11,20,0.56),transparent)]" />
              </div>
            ))}
          </div>
        </div>

        <div className="h-80 w-full shrink-0 space-y-3 overflow-hidden rounded-2xl border border-(--color-border) bg-[#fbfbff] p-4 lg:w-55">
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-[11px] bg-[#fff7ed] text-[#c2410c]">
            <Sparkles size={17} />
          </div>
          <h4 className="text-lg font-semibold tracking-[-0.01em] text-(--color-text-primary)">AI Insights</h4>
          <p className="text-[13px] leading-6 text-(--color-text-secondary)">
            Found {matches} likely appearances with high confidence across keynote and networking sessions.
          </p>
          <ul className="space-y-2 text-[13px] text-(--color-text-secondary)">
            <li className="flex items-start gap-2">
              <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-(--color-primary)" />
              Best Lighting: 12 photos optimized for social sharing.
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-(--color-primary)" />
              Group Shots: 5 networking moments identified.
            </li>
          </ul>
        </div>
      </div>
    </article>
  );
}

export default function GalleryPage() {
  const featuredGallery = gallerySummary;

  return (
    <>
      <Head>
        <title>GrabPic | Gallery</title>
        <meta
          name="description"
          content="Browse your curated photo library and review all your AI-selected matches."
        />
      </Head>

      <div className="min-h-screen bg-(--color-bg-base)">
        <AuthenticatedNavbar activeTab="Gallery" />

        <main className="mx-auto w-full max-w-6xl px-5 py-8">
          <section className="space-y-6 rounded-3xl border border-(--color-border) bg-white p-5 shadow-(--shadow-card) sm:p-7">
            <div className="space-y-2">
              <p className="inline-flex rounded-md bg-[#fff7ed] px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#c2410c]">
                AI recognition active
              </p>
              <h1 className="text-[36px] font-bold leading-[1.1] tracking-[-0.03em] text-(--color-text-primary) sm:text-[44px]">
                Found {featuredGallery.matches.toLocaleString()} matches of you.
              </h1>
              <p className="max-w-2xl text-[15px] leading-7 text-(--color-text-secondary)">
                Curated results from all your uploaded photos.
              </p>
            </div>

            <GalleryCard {...featuredGallery} />
          </section>
        </main>
      </div>
    </>
  );
}
