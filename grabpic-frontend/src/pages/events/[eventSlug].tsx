import Head from "next/head";
import JSZip from "jszip";
import { useRouter } from "next/compat/router";
import { type ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import { FileDown, FolderDown, LoaderCircle, Share2, Sparkles, Upload, UploadCloud } from "lucide-react";

import { AuthenticatedNavbar } from "@/components/home";
import { Button } from "@/components/ui/button";
import { hasAuthSession } from "@/lib/auth";
import { apiClient } from "@/lib/api-client";
import { EventItem, EventMedia, getApiErrorMessage } from "@/lib/api-types";

type TabType = "all" | "mine";

const acceptedMimeTypes = new Set(["image/jpeg", "image/png", "image/webp", "video/mp4"]);
const acceptedExtensions = [".jpg", ".jpeg", ".png", ".webp", ".mp4"];

function clickDownloadLink(url: string, fileName: string) {
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.rel = "noopener";
  document.body.appendChild(link);
  link.click();
  link.remove();
}

async function triggerDownload(url: string, fileName: string) {
  try {
    // Use a blob URL so browsers treat this as a download instead of navigation/preview.
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to fetch file: ${response.status}`);
    }

    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);
    clickDownloadLink(blobUrl, fileName);
    window.setTimeout(() => URL.revokeObjectURL(blobUrl), 1200);
    return;
  } catch {
    // Fallback for hosts that block cross-origin fetch.
    clickDownloadLink(url, fileName);
  }
}

function getEventIdFromQuery(value: string | string[] | undefined): string | null {
  if (typeof value === "string" && value.trim()) {
    return value;
  }

  return null;
}

function isInviteEnabled(value: string | string[] | undefined): boolean {
  if (typeof value !== "string") {
    return false;
  }

  const normalized = value.trim().toLowerCase();
  return normalized === "1" || normalized === "true";
}

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

function getFilenameFromUrl(url: string, fallback: string): string {
  try {
    const pathname = new URL(url).pathname;
    const segments = pathname.split("/").filter(Boolean);
    const candidate = segments.at(-1);
    return candidate || fallback;
  } catch {
    return fallback;
  }
}

function toSafeName(value: string): string {
  return value
    .trim()
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^[-.]+|[-.]+$/g, "");
}

type EventDetailPageProps = {
  eventSlugParam?: string;
};

export default function EventDetailPage({ eventSlugParam }: EventDetailPageProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [event, setEvent] = useState<EventItem | null>(null);
  const [myMedia, setMyMedia] = useState<EventMedia[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [statusText, setStatusText] = useState("Select media, then upload to cloud.");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [rejectedFiles, setRejectedFiles] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isZipping, setIsZipping] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [isLoadingMine, setIsLoadingMine] = useState(false);
  const [activeMediaTab, setActiveMediaTab] = useState<TabType>("all");
  const [loadError, setLoadError] = useState<string | null>(null);
  const [mineError, setMineError] = useState<string | null>(null);
  const [isParticipant, setIsParticipant] = useState(true);
  const [shareFeedback, setShareFeedback] = useState<string | null>(null);
  const [hasAutoJoinAttempted, setHasAutoJoinAttempted] = useState(false);

  const eventId = eventSlugParam ?? getEventIdFromQuery(router?.query.eventSlug);
  const isInviteFlow = isInviteEnabled(router?.query.invite);

  const buildInvitePath = (id: string) => `/events/${id}?invite=1`;

  const redirectToLoginForInvite = (id: string) => {
    const invitePath = buildInvitePath(id);
    const nextPath = router?.asPath && router.asPath.startsWith("/") ? router.asPath : invitePath;

    if (router) {
      void router.push(`/login?next=${encodeURIComponent(nextPath)}`);
      return;
    }

    window.location.assign(`/login?next=${encodeURIComponent(nextPath)}`);
  };

  const allMedia = useMemo(() => {
    if (!event) {
      return [] as EventMedia[];
    }

    return (event.media as EventMedia[]) || [];
  }, [event]);

  const visibleMedia = useMemo(() => {
    if (activeMediaTab === "mine") {
      return myMedia;
    }

    return allMedia;
  }, [activeMediaTab, allMedia, myMedia]);

  const loadEvent = async (id: string) => {
    setIsLoading(true);
    setLoadError(null);

    const [data, response] = await apiClient.get<EventItem>(`/events/${id}`);

    if (response.status === 401) {
      redirectToLoginForInvite(id);
      return;
    }

    if (response.status === 403) {
      setEvent(null);
      setIsParticipant(false);
      setLoadError(getApiErrorMessage(response.error, "Join this event to view details."));
      setIsLoading(false);
      return;
    }

    if (response.status !== 200 || !data) {
      setEvent(null);
      setIsParticipant(false);
      setLoadError(getApiErrorMessage(response.error, "Failed to load event."));
      setIsLoading(false);
      return;
    }

    setEvent(data);
    setIsParticipant(true);
    setIsLoading(false);
  };

  const loadMyPhotos = async (id: string) => {
    setIsLoadingMine(true);
    setMineError(null);

    const [data, response] = await apiClient.get<EventMedia[]>(`/events/${id}/my-photos`);

    if (response.status !== 200 || !data) {
      setMyMedia([]);
      setMineError(getApiErrorMessage(response.error, "Failed to load your matched photos."));
      setIsLoadingMine(false);
      return;
    }

    setMyMedia(data);
    setIsLoadingMine(false);
  };

  useEffect(() => {
    if (!eventId) {
      return;
    }

    if (isInviteFlow && !hasAuthSession()) {
      redirectToLoginForInvite(eventId);
      return;
    }

    void loadEvent(eventId);
  }, [eventId, isInviteFlow]);

  useEffect(() => {
    if (!eventId) {
      return;
    }

    if (!isInviteFlow || hasAutoJoinAttempted || !hasAuthSession() || isParticipant || isJoining) {
      return;
    }

    setHasAutoJoinAttempted(true);
    void handleJoinEvent();
  }, [eventId, isInviteFlow, hasAutoJoinAttempted, isParticipant, isJoining]);

  useEffect(() => {
    if (!eventId || !isParticipant || activeMediaTab !== "mine") {
      return;
    }

    void loadMyPhotos(eventId);
  }, [activeMediaTab, eventId, isParticipant]);

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

    if (nextAccepted.length > 0 && rejected.length > 0) {
      setStatusText("Some files were skipped. You can continue with the supported formats.");
      return;
    }

    if (nextAccepted.length > 0) {
      setStatusText("Media selected and ready to upload.");
      return;
    }

    setStatusText("Unsupported format detected. Allowed types are JPG, JPEG, PNG, WEBP, and MP4.");
  }

  async function startUpload() {
    if (!eventId || selectedFiles.length === 0 || isUploading || !isParticipant) {
      return;
    }

    setIsUploading(true);
    setStatusText("Uploading to cloud...");

    try {
      const payload = new FormData();
      selectedFiles.forEach((file) => {
        payload.append("media", file);
      });

      const [data, response] = await apiClient.postFormData<{ message: string; media: EventMedia[] }>(
        `/events/${eventId}/media`,
        payload,
      );

      if (response.status !== 200 || !data) {
        setStatusText(getApiErrorMessage(response.error, "Upload failed. Please try again."));
        return;
      }

      setStatusText("Upload complete. AI processing is now running.");
      setSelectedFiles([]);
      setRejectedFiles([]);
      await loadEvent(eventId);

      if (activeMediaTab === "mine") {
        await loadMyPhotos(eventId);
      }
    } catch (error) {
      setStatusText(error instanceof Error ? error.message : "Upload failed. Please try again.");
    } finally {
      setIsUploading(false);
    }
  }

  function clearSelection() {
    setSelectedFiles([]);
    setRejectedFiles([]);
    setStatusText("Selection cleared. Choose files to upload.");
  }

  function handleInputChange(eventInput: ChangeEvent<HTMLInputElement>) {
    processFiles(eventInput.target.files);
    eventInput.target.value = "";
  }

  async function handleJoinEvent() {
    if (!eventId || isJoining) {
      return;
    }

    setIsJoining(true);
    const [, response] = await apiClient.post(`/events/${eventId}/join`);

    if (response.status === 401) {
      redirectToLoginForInvite(eventId);
      setIsJoining(false);
      return;
    }

    if (response.status !== 200) {
      setLoadError(getApiErrorMessage(response.error, "Unable to join event right now."));
      setIsJoining(false);
      return;
    }

    await loadEvent(eventId);
    setLoadError(null);
    setStatusText("Joined event. You can now upload and view event media.");
    setIsJoining(false);
  }

  async function handleShareEvent() {
    if (!eventId) {
      return;
    }

    const invitePath = buildInvitePath(eventId);
    const inviteUrl = `${window.location.origin}${invitePath}`;

    try {
      if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
        await navigator.share({
          title: event?.name ? `Join ${event.name} on GrabPic` : "Join my GrabPic event",
          text: "Open this invite, login/register, and you'll be added to the event automatically.",
          url: inviteUrl,
        });
        setShareFeedback("Invite link shared.");
        return;
      }

      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(inviteUrl);
        setShareFeedback("Invite link copied. Anyone opening it will be asked to login/register and then auto-joined.");
        return;
      }

      setShareFeedback(`Copy this invite link: ${inviteUrl}`);
    } catch {
      setShareFeedback(`Copy this invite link: ${inviteUrl}`);
    }
  }

  async function downloadAllMedia() {
    if (isZipping || visibleMedia.length === 0 || !eventId) {
      return;
    }

    setIsZipping(true);

    try {
      const zip = new JSZip();
      const preferredName = event?.name?.trim() || eventId;
      const safeBaseName = toSafeName(preferredName) || eventId;
      const eventFolder = zip.folder(safeBaseName);

      await Promise.all(
        visibleMedia.map(async (item, index) => {
          const response = await fetch(item.url);

          if (!response.ok) {
            throw new Error(`Unable to fetch media ${index + 1}`);
          }

          const blob = await response.blob();
          const extension = item.type === "video" ? "mp4" : "jpg";
          const fallback = `media-${index + 1}.${extension}`;
          eventFolder?.file(getFilenameFromUrl(item.url, fallback), blob);
        }),
      );

      const zipBlob = await zip.generateAsync({
        type: "blob",
        compression: "DEFLATE",
        compressionOptions: { level: 6 },
      });

      const zipUrl = URL.createObjectURL(zipBlob);
      clickDownloadLink(zipUrl, `${safeBaseName}-media.zip`);
      window.setTimeout(() => URL.revokeObjectURL(zipUrl), 1200);
    } finally {
      setIsZipping(false);
    }
  }

  if (!eventId) {
    return (
      <div className="min-h-screen bg-(--color-bg-base)">
        <AuthenticatedNavbar activeTab="Events" />
        <main className="mx-auto w-full max-w-7xl px-4 py-7 sm:px-6 lg:px-8">
          <p className="text-sm text-[#b42318]">Invalid event identifier.</p>
        </main>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-(--color-bg-base)">
        <AuthenticatedNavbar activeTab="Events" />
        <main className="mx-auto flex w-full max-w-7xl justify-center px-4 py-14 sm:px-6 lg:px-8">
          <LoaderCircle className="animate-spin" />
        </main>
      </div>
    );
  }

  if (!isParticipant) {
    return (
      <div className="min-h-screen bg-(--color-bg-base)">
        <AuthenticatedNavbar activeTab="Events" />

        <main className="mx-auto w-full max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold tracking-[-0.02em] text-(--color-text-primary)">Join Event</h1>
          <p className="mt-2 text-sm text-(--color-text-secondary)">{loadError || "You need to join this event first."}</p>
          <div className="mt-5 flex items-center gap-3">
            <Button type="button" onClick={handleJoinEvent} disabled={isJoining}>
              {isJoining ? <LoaderCircle size={16} className="animate-spin" /> : <Sparkles size={16} />}
              {isJoining ? "Joining..." : "Join Event"}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                if (router) {
                  void router.push("/");
                  return;
                }

                window.location.assign("/");
              }}
            >
              Back to Dashboard
            </Button>
          </div>
        </main>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-(--color-bg-base)">
        <AuthenticatedNavbar activeTab="Events" />
        <main className="mx-auto w-full max-w-7xl px-4 py-7 sm:px-6 lg:px-8">
          <p className="text-sm text-[#b42318]">{loadError || "Event not found."}</p>
        </main>
      </div>
    );
  }

  const canUpload = selectedFiles.length > 0 && !isUploading;

  return (
    <>
      <Head>
        <title>GrabPic | {event.name}</title>
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
                {event.name}
              </h1>
              <p className="mt-2 text-sm text-(--color-text-secondary)">
                {formatEventDate(event.date)}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Button type="button" variant="secondary" size="sm" onClick={() => void handleShareEvent()}>
                <Share2 size={16} />
                Share Event
              </Button>
              <Button type="button" size="sm" onClick={startUpload} disabled={!canUpload}>
                {isUploading ? <LoaderCircle size={16} className="animate-spin" /> : <Upload size={16} />}
                {isUploading ? "Uploading..." : "Upload"}
              </Button>
            </div>
          </section>

          {shareFeedback ? <p className="mt-3 text-sm text-(--color-text-secondary)">{shareFeedback}</p> : null}

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
              <h2 className="mt-4 text-2xl font-semibold text-(--color-text-primary)">Drop photos here to curate</h2>
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
              </div>
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

            <Button type="button" variant="secondary" size="sm" onClick={downloadAllMedia} disabled={isZipping}>
              {isZipping ? <LoaderCircle size={16} className="animate-spin" /> : <FolderDown size={16} />}
              {isZipping ? "Preparing ZIP..." : "Download All"}
            </Button>
          </section>

          {activeMediaTab === "mine" && mineError ? (
            <p className="mt-4 text-sm text-[#b42318]">{mineError}</p>
          ) : null}

          {activeMediaTab === "mine" && isLoadingMine ? (
            <div className="mt-6 flex justify-center">
              <LoaderCircle className="animate-spin" />
            </div>
          ) : null}

          {!isLoadingMine ? (
            <section className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {visibleMedia.map((mediaItem, index) => {
                const extension = mediaItem.type === "video" ? "mp4" : "jpg";
                const fallbackName = `media-${index + 1}.${extension}`;
                const filename = getFilenameFromUrl(mediaItem.url, fallbackName);

                return (
                  <article
                    key={mediaItem._id}
                    className="group overflow-hidden rounded-3xl border border-(--color-border) bg-white shadow-(--shadow-card)"
                  >
                    <div className="relative h-64 sm:h-72 lg:h-76">
                      {mediaItem.type === "video" ? (
                        <video src={mediaItem.url} className="h-full w-full object-cover" controls />
                      ) : (
                        <img src={mediaItem.url} alt={filename} className="h-full w-full object-cover" />
                      )}

                      <div className="absolute inset-x-0 bottom-0 translate-y-5 bg-linear-to-t from-black/60 to-transparent p-4 opacity-0 transition duration-200 group-hover:translate-y-0 group-hover:opacity-100">
                        <button
                          type="button"
                          className="inline-flex items-center gap-2 rounded-full bg-white/95 px-3 py-1.5 text-xs font-semibold text-[#172033]"
                          onClick={() => void triggerDownload(mediaItem.url, filename)}
                        >
                          <FileDown size={14} />
                          Download
                        </button>
                      </div>
                    </div>

                    <div className="px-4 py-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.08em] text-(--color-text-tertiary)">
                        {mediaItem.status}
                      </p>
                    </div>
                  </article>
                );
              })}
            </section>
          ) : null}

          {!isLoadingMine && visibleMedia.length === 0 ? (
            <div className="mt-8 rounded-2xl border border-(--color-border) bg-white p-6 text-center">
              <p className="text-sm text-(--color-text-secondary)">
                {activeMediaTab === "mine" ? "No matched photos found yet." : "No media uploaded yet."}
              </p>
            </div>
          ) : null}

        </main>
      </div>
    </>
  );
}
