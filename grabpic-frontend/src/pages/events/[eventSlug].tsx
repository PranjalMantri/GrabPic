import Head from "next/head";
import JSZip from "jszip";
import Link from "next/link";
import { useRouter } from "next/router";
import { type ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import {
  ChevronDown,
  FileDown,
  FolderDown,
  LoaderCircle,
  Share2,
  Sparkles,
  Upload,
  UploadCloud,
} from "lucide-react";

import { AuthenticatedNavbar } from "@/components/home";
import { Button } from "@/components/ui/button";

type EventMedia = {
  id: string;
  src: string;
  alt: string;
  filename: string;
  mine: boolean;
};

type EventDetail = {
  title: string;
  venue: string;
  date: string;
  media: EventMedia[];
};

const eventDataBySlug: Record<string, EventDetail> = {
  "global-tech-summit-2024": {
    title: "Global Tech Summit 2024",
    venue: "Modern Art Museum",
    date: "June 15, 2024",
    media: [
      {
        id: "m1",
        src: "/events/media-1.svg",
        alt: "Event crowd under stage lighting",
        filename: "global-tech-summit-1.svg",
        mine: false,
      },
      {
        id: "m2",
        src: "/events/media-2.svg",
        alt: "Networking session visual",
        filename: "global-tech-summit-2.svg",
        mine: true,
      },
      {
        id: "m3",
        src: "/events/media-3.svg",
        alt: "Speaker on keynote stage",
        filename: "global-tech-summit-3.svg",
        mine: false,
      },
      {
        id: "m4",
        src: "/events/media-4.svg",
        alt: "Product demo laptop",
        filename: "global-tech-summit-4.svg",
        mine: true,
      },
      {
        id: "m5",
        src: "/events/media-5.svg",
        alt: "Attendee working session",
        filename: "global-tech-summit-5.svg",
        mine: false,
      },
      {
        id: "m6",
        src: "/events/media-6.svg",
        alt: "Aftermovie clip thumbnail",
        filename: "global-tech-summit-6.svg",
        mine: true,
      },
    ],
  },
  "miller-wedding": {
    title: "Miller Wedding",
    venue: "Rosewood Estate",
    date: "November 02, 2024",
    media: [
      {
        id: "w1",
        src: "/events/media-3.svg",
        alt: "Wedding stage moment",
        filename: "miller-wedding-1.svg",
        mine: true,
      },
      {
        id: "w2",
        src: "/events/media-1.svg",
        alt: "Crowd celebration",
        filename: "miller-wedding-2.svg",
        mine: false,
      },
      {
        id: "w3",
        src: "/events/media-4.svg",
        alt: "Reception detail",
        filename: "miller-wedding-3.svg",
        mine: true,
      },
    ],
  },
};

const acceptedMimeTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "video/mp4",
]);

const acceptedExtensions = [".jpg", ".jpeg", ".png", ".webp", ".mp4"];

function triggerDownload(url: string, fileName: string) {
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.rel = "noopener";
  document.body.appendChild(link);
  link.click();
  link.remove();
}

export default function EventDetailPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadTimerRef = useRef<number | null>(null);

  const [isDragOver, setIsDragOver] = useState(false);
  const [statusText, setStatusText] = useState("Select media, then upload to cloud.");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [rejectedFiles, setRejectedFiles] = useState<string[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [isUploaded, setIsUploaded] = useState(false);
  const [isZipping, setIsZipping] = useState(false);
  const [activeMediaTab, setActiveMediaTab] = useState<"all" | "mine">("all");

  const eventSlug =
    typeof router.query.eventSlug === "string" ? router.query.eventSlug : "global-tech-summit-2024";

  const event = useMemo(
    () => eventDataBySlug[eventSlug] ?? eventDataBySlug["global-tech-summit-2024"],
    [eventSlug],
  );

  const visibleMedia = useMemo(() => {
    if (activeMediaTab === "mine") {
      return event.media.filter((item) => item.mine);
    }

    return event.media;
  }, [activeMediaTab, event.media]);

  useEffect(() => {
    return () => {
      if (uploadTimerRef.current !== null) {
        window.clearInterval(uploadTimerRef.current);
      }
    };
  }, []);

  function processFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) {
      return;
    }

    const nextAccepted: File[] = [];
    const rejected: string[] = [];

    for (const file of Array.from(fileList)) {
      const lowerName = file.name.toLowerCase();
      const hasAcceptedExtension = acceptedExtensions.some((ext) => lowerName.endsWith(ext));
      const hasAcceptedMime = acceptedMimeTypes.has(file.type);

      if (hasAcceptedMime || hasAcceptedExtension) {
        nextAccepted.push(file);
      } else {
        rejected.push(file.name);
      }
    }

    setSelectedFiles((current) => {
      const dedupe = new Map(current.map((file) => [`${file.name}-${file.size}-${file.lastModified}`, file]));

      nextAccepted.forEach((file) => {
        dedupe.set(`${file.name}-${file.size}-${file.lastModified}`, file);
      });

      return Array.from(dedupe.values());
    });

    setRejectedFiles((current) => [...current, ...rejected]);
    setUploadProgress(0);
    setIsUploaded(false);

    if (nextAccepted.length > 0 && rejected.length > 0) {
      setStatusText("Some files were skipped. You can continue with the supported formats.");
      return;
    }

    if (nextAccepted.length > 0) {
      setStatusText("Media selected and ready to upload.");
      return;
    }

    setStatusText(
      "Unsupported format detected. Allowed types are JPG, JPEG, PNG, WEBP, and MP4.",
    );
  }

  function startUpload() {
    if (selectedFiles.length === 0 || isUploading) {
      return;
    }

    if (uploadTimerRef.current !== null) {
      window.clearInterval(uploadTimerRef.current);
    }

    setIsUploading(true);
    setIsUploaded(false);
    setUploadProgress(0);
    setStatusText("Uploading to cloud...");

    uploadTimerRef.current = window.setInterval(() => {
      setUploadProgress((current) => {
        const increment = Math.floor(Math.random() * 12) + 6;
        const nextValue = Math.min(current + increment, 100);

        if (nextValue >= 100) {
          if (uploadTimerRef.current !== null) {
            window.clearInterval(uploadTimerRef.current);
            uploadTimerRef.current = null;
          }

          setIsUploading(false);
          setIsUploaded(true);
          setStatusText("Upload complete. AI processing is now running.");
        }

        return nextValue;
      });
    }, 420);
  }

  function clearSelection() {
    setSelectedFiles([]);
    setRejectedFiles([]);
    setUploadProgress(0);
    setIsUploaded(false);
    setStatusText("Selection cleared. Choose files to upload.");
  }

  function handleInputChange(eventInput: ChangeEvent<HTMLInputElement>) {
    processFiles(eventInput.target.files);
    eventInput.target.value = "";
  }

  async function downloadAllMedia() {
    if (isZipping) {
      return;
    }

    setIsZipping(true);

    try {
      const zip = new JSZip();
      const eventFolder = zip.folder(eventSlug);

      await Promise.all(
        event.media.map(async (item) => {
          const response = await fetch(item.src);

          if (!response.ok) {
            throw new Error(`Unable to fetch ${item.filename}`);
          }

          const blob = await response.blob();
          eventFolder?.file(item.filename, blob);
        }),
      );

      const zipBlob = await zip.generateAsync({
        type: "blob",
        compression: "DEFLATE",
        compressionOptions: { level: 6 },
      });

      const zipUrl = URL.createObjectURL(zipBlob);
      triggerDownload(zipUrl, `${eventSlug}-media.zip`);
      window.setTimeout(() => URL.revokeObjectURL(zipUrl), 1200);
    } finally {
      setIsZipping(false);
    }
  }

  const canUpload = selectedFiles.length > 0 && !isUploading;

  return (
    <>
      <Head>
        <title>GrabPic | {event.title}</title>
      </Head>

      <div className="min-h-screen bg-(--color-bg-base)">
        <AuthenticatedNavbar activeTab="Events" />

        <main className="mx-auto w-full max-w-7xl px-4 py-7 sm:px-6 lg:px-8">
          <section className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-(--color-primary)">
                Live Event
              </p>
              <h1 className="mt-1 text-3xl font-bold tracking-[-0.02em] text-(--color-text-primary) sm:text-5xl">
                {event.title}
              </h1>
              <p className="mt-2 text-sm text-(--color-text-secondary)">
                {event.venue} • {event.date}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Button type="button" variant="secondary" size="sm">
                <Share2 size={16} />
                Share Event
              </Button>
              <Button type="button" size="sm" onClick={startUpload} disabled={!canUpload}>
                {isUploading ? <LoaderCircle size={16} className="animate-spin" /> : <Upload size={16} />}
                {isUploading ? "Uploading..." : "Upload"}
              </Button>
            </div>
          </section>

          <section className="mt-7 rounded-3xl border border-dashed border-(--color-border) bg-white p-8 shadow-(--shadow-card)">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              accept=".jpg,.jpeg,.png,.webp,.mp4,image/jpeg,image/png,image/webp,video/mp4"
              onChange={handleInputChange}
            />

            <div
              role="button"
              tabIndex={0}
              className={
                isDragOver
                  ? "rounded-2xl border-2 border-dashed border-(--color-primary) bg-(--color-primary-subtle) p-10 text-center"
                  : "rounded-2xl border-2 border-dashed border-(--color-border) bg-[#fafbfe] p-10 text-center"
              }
              onClick={() => fileInputRef.current?.click()}
              onKeyDown={(eventKey) => {
                if (eventKey.key === "Enter" || eventKey.key === " ") {
                  eventKey.preventDefault();
                  fileInputRef.current?.click();
                }
              }}
              onDragOver={(eventDrag) => {
                eventDrag.preventDefault();
                setIsDragOver(true);
              }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={(eventDrop) => {
                eventDrop.preventDefault();
                setIsDragOver(false);
                processFiles(eventDrop.dataTransfer.files);
              }}
            >
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-(--color-primary-subtle) text-(--color-primary)">
                <UploadCloud size={22} />
              </div>
              <h2 className="mt-4 text-2xl font-semibold text-(--color-text-primary)">
                Drop photos here to curate
              </h2>
              <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-(--color-text-secondary)">
                High resolution JPG, JPEG, PNG, WEBP, or MP4 files. AI will automatically tag and group your media.
              </p>
              <button
                type="button"
                className="mt-4 text-sm font-semibold text-(--color-primary) underline underline-offset-2"
                onClick={(eventClick) => {
                  eventClick.stopPropagation();
                  fileInputRef.current?.click();
                }}
              >
                Select media from device
              </button>
            </div>

            <div className="mt-4 rounded-2xl border border-(--color-border) bg-[#f8f9fc] p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm text-(--color-text-secondary)">{statusText}</p>
                {selectedFiles.length > 0 ? (
                  <button
                    type="button"
                    className="text-xs font-semibold text-(--color-primary) underline underline-offset-2"
                    onClick={clearSelection}
                  >
                    Clear selection
                  </button>
                ) : null}
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                <span className="rounded-full bg-white px-3 py-1 font-semibold text-(--color-text-primary)">
                  {selectedFiles.length} selected
                </span>
                {rejectedFiles.length > 0 ? (
                  <span className="rounded-full bg-[#fff1f0] px-3 py-1 font-semibold text-[#b42318]">
                    {rejectedFiles.length} skipped
                  </span>
                ) : null}
                {isUploaded ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#ecfdf3] px-3 py-1 font-semibold text-[#067647]">
                    <Sparkles size={12} />
                    Uploaded
                  </span>
                ) : null}
              </div>

              {isUploading || uploadProgress > 0 ? (
                <div className="mt-4">
                  <div className="h-2 w-full overflow-hidden rounded-full bg-[#d8dded]">
                    <div
                      className="h-full rounded-full bg-[linear-gradient(90deg,#6b5fef_0%,#4ecdc4_100%)] transition-all duration-500"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <p className="mt-2 text-xs font-medium text-(--color-text-secondary)">
                    {isUploading ? "Uploading media to cloud" : "Upload complete"} • {uploadProgress}%
                  </p>
                </div>
              ) : null}
            </div>
          </section>

          <section className="mt-7 flex flex-wrap items-center justify-between gap-4">
            <div className="rounded-full bg-[#eceff7] p-1">
              <button
                type="button"
                className={
                  activeMediaTab === "all"
                    ? "rounded-full bg-white px-4 py-2 text-sm font-semibold text-(--color-primary) shadow-sm"
                    : "rounded-full px-4 py-2 text-sm font-medium text-(--color-text-secondary)"
                }
                onClick={() => setActiveMediaTab("all")}
              >
                All Photos
              </button>
              <button
                type="button"
                className={
                  activeMediaTab === "mine"
                    ? "rounded-full bg-white px-4 py-2 text-sm font-semibold text-(--color-primary) shadow-sm"
                    : "rounded-full px-4 py-2 text-sm font-medium text-(--color-text-secondary)"
                }
                onClick={() => setActiveMediaTab("mine")}
              >
                My Photos
              </button>
            </div>

            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={downloadAllMedia}
              disabled={isZipping}
            >
              {isZipping ? <LoaderCircle size={16} className="animate-spin" /> : <FolderDown size={16} />}
              {isZipping ? "Preparing ZIP..." : "Download All"}
            </Button>
          </section>

          <section className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {visibleMedia.map((mediaItem) => (
              <article
                key={mediaItem.id}
                className="group overflow-hidden rounded-3xl border border-(--color-border) bg-white shadow-(--shadow-card)"
              >
                <div className="relative aspect-4/5">
                  <img src={mediaItem.src} alt={mediaItem.alt} className="h-full w-full object-cover" />

                  <div className="absolute inset-x-0 bottom-0 translate-y-5 bg-linear-to-t from-black/60 to-transparent p-4 opacity-0 transition duration-200 group-hover:translate-y-0 group-hover:opacity-100">
                    <button
                      type="button"
                      className="inline-flex items-center gap-2 rounded-full bg-white/95 px-3 py-1.5 text-xs font-semibold text-[#172033]"
                      onClick={() => triggerDownload(mediaItem.src, mediaItem.filename)}
                    >
                      <FileDown size={14} />
                      Download
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </section>

          <div className="mt-10 flex justify-center">
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-full border border-(--color-border) bg-white px-5 py-2.5 text-sm font-medium text-(--color-text-secondary)"
            >
              <ChevronDown size={16} />
              Show more moments
            </button>
          </div>
        </main>
      </div>
    </>
  );
}
