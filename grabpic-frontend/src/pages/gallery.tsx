import Head from "next/head";
import { useEffect, useMemo, useState } from "react";

import { CheckCircle2, Sparkles } from "lucide-react";

import { AuthenticatedNavbar } from "@/components/home";
import { Card, CardContent } from "@/components/ui/card";
import { apiClient } from "@/lib/api-client";
import { GalleryResponse, getApiErrorMessage } from "@/lib/api-types";

export default function GalleryPage() {
  const [gallery, setGallery] = useState<GalleryResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadGallery = async () => {
      setIsLoading(true);
      setErrorMessage(null);

      const [data, response] = await apiClient.get<GalleryResponse>("/user/gallery");

      if (!isMounted) {
        return;
      }

      if (response.status !== 200 || !data) {
        setErrorMessage(getApiErrorMessage(response.error, "Failed to load your gallery."));
        setGallery(null);
        setIsLoading(false);
        return;
      }

      setGallery(data);
      setIsLoading(false);
    };

    void loadGallery();

    return () => {
      isMounted = false;
    };
  }, []);

  const media = gallery?.media ?? [];
  const insights = gallery?.insights;
  const bestLightingCount = insights?.bestLighting ?? 0;
  const groupPhotosCount = insights?.groupShots ?? 0;

  const curatedMedia = useMemo(() => media.slice(0, 6), [media]);
  const hasInsightItems = bestLightingCount > 0 || groupPhotosCount > 0;

  return (
    <>
      <Head>
        <title>GrabPic | Gallery</title>
        <meta
          name="description"
          content="Browse your personal photo library and review AI-selected matches across every event."
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
                Found {(insights?.totalPhotos ?? 0).toLocaleString()} photos in your library.
              </h1>
              <p className="max-w-2xl text-[15px] leading-7 text-(--color-text-secondary)">
                Curated results from every event you have attended, with lighting and face-match insights pulled from the database.
              </p>
            </div>

            <Card className="overflow-hidden rounded-[22px] border border-(--color-border) bg-white shadow-(--shadow-card)">
              <CardContent className="grid gap-4 p-5 lg:grid-cols-[1fr_220px]">
                <div>
                  <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-(--color-text-tertiary)">
                    Curated gallery
                  </p>

                  {isLoading ? <p className="mt-5 text-sm text-(--color-text-secondary)">Loading gallery...</p> : null}
                  {errorMessage ? <p className="mt-5 text-sm text-[#b42318]">{errorMessage}</p> : null}

                  {!isLoading && !errorMessage && media.length === 0 ? (
                    <p className="mt-5 text-sm text-(--color-text-secondary)">No gallery items yet. Upload media or wait for processing to complete.</p>
                  ) : null}

                  {!isLoading && !errorMessage && curatedMedia.length > 0 ? (
                    <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {curatedMedia.map((item, index) => (
                        <article
                          key={item._id}
                          className={`group overflow-hidden rounded-3xl border border-(--color-border) bg-white shadow-(--shadow-card) ${
                            index === 0 ? "sm:col-span-2 lg:col-span-1" : ""
                          }`}
                        >
                          <div className="relative h-56 sm:h-64 lg:h-72 overflow-hidden">
                            {item.type === "video" ? (
                              <video src={item.url} className="h-full w-full object-cover" controls />
                            ) : (
                              <img
                                src={item.url}
                                alt={`Gallery item ${index + 1}`}
                                className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.04]"
                              />
                            )}

                            <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/65 via-black/25 to-transparent p-4 text-white">
                              <p className="text-[11px] font-semibold uppercase tracking-widest text-white/80">
                                {item.type === "video" ? "Video" : "Photo"}
                              </p>
                            </div>
                          </div>
                        </article>
                      ))}
                    </div>
                  ) : null}
                </div>

                {hasInsightItems ? (
                  <div className="h-80 w-full shrink-0 space-y-3 overflow-hidden rounded-2xl border border-(--color-border) bg-[#fbfbff] p-4 lg:w-55">
                    <div className="inline-flex h-10 w-10 items-center justify-center rounded-[11px] bg-[#fff7ed] text-[#c2410c]">
                      <Sparkles size={17} />
                    </div>
                    <h4 className="text-lg font-semibold tracking-[-0.01em] text-(--color-text-primary)">AI Insights</h4>
                    <p className="text-[13px] leading-6 text-(--color-text-secondary)">
                      Your whole gallery, summarized from stored detection metrics.
                    </p>
                    <ul className="space-y-2 text-[13px] text-(--color-text-secondary)">
                      {bestLightingCount > 0 ? (
                        <li className="flex items-start gap-2">
                          <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-(--color-primary)" />
                          <span>
                            {/* <span className="font-semibold text-(--color-text-primary)">Best lighting</span> appears in {bestLightingCount.toLocaleString()} photos with optimal studio lighting for social sharing. */}
                            You appear in <span className="font-semibold text-(--color-text-primary)">{bestLightingCount.toLocaleString()}</span> {bestLightingCount === 1 ? "photo" : "photos"} with optimal studio lighting for social sharing.
                          </span>
                        </li>
                      ) : null}
                      {groupPhotosCount > 0 ? (
                        <li className="flex items-start gap-2">
                          <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-(--color-primary)" />
                          <span>
                            {/* <span className="font-semibold text-(--color-text-primary)">Group detected</span> in {groupPhotosCount.toLocaleString()} {groupPhotosCount === 1 ? "photo" : "photos"}. */}
                            <span>Identified in <span className="font-semibold text-(--color-text-primary)">{groupPhotosCount.toLocaleString()}</span> networking group {groupPhotosCount === 1 ? "photo" : "photos"}.</span>
                          </span>
                        </li>
                      ) : null}
                    </ul>
                  </div>
                ) : null}
              </CardContent>
            </Card>
          </section>
        </main>
      </div>
    </>
  );
}
