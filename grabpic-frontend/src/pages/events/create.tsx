import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { type ChangeEvent, type DragEvent, type FormEvent, useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  Camera,
  CheckCircle2,
  ImagePlus,
  LoaderCircle,
  Sparkles,
  UploadCloud,
} from "lucide-react";

import { AuthenticatedNavbar } from "@/components/home";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type EventFormValues = {
  name: string;
  description: string;
};

type FormErrors = Partial<Record<"name" | "description" | "coverImage", string>>;

const initialValues: EventFormValues = {
  name: "",
  description: "",
};

const tokenKeys = ["grabpic_token", "grabpic-token", "token", "authToken"];
const draftStorageKey = "grabpic-create-event-draft";

function readAccessToken() {
  if (typeof window === "undefined") {
    return null;
  }

  for (const key of tokenKeys) {
    const storedToken = window.localStorage.getItem(key);
    if (storedToken && storedToken.trim().length > 0) {
      return storedToken;
    }

    const match = document.cookie.match(new RegExp(`(?:^|; )${key}=([^;]*)`));
    if (match?.[1]) {
      return decodeURIComponent(match[1]);
    }
  }

  return null;
}

export default function CreateEventPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [values, setValues] = useState<EventFormValues>(initialValues);
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [statusText, setStatusText] = useState("Add the event details and choose a cover image to get started.");

  const nameLength = values.name.trim().length;
  const descriptionLength = values.description.trim().length;

  useEffect(() => {
    if (!coverImageFile) {
      setCoverImagePreview(null);
      return;
    }

    const previewUrl = URL.createObjectURL(coverImageFile);
    setCoverImagePreview(previewUrl);

    return () => {
      URL.revokeObjectURL(previewUrl);
    };
  }, [coverImageFile]);

  function updateField(field: keyof EventFormValues, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  function handleFileSelect(file: File | null) {
    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setErrors((current) => ({ ...current, coverImage: "Please choose a JPG, PNG, or WEBP image." }));
      return;
    }

    setCoverImageFile(file);
    setErrors((current) => ({ ...current, coverImage: undefined }));
    setStatusText("Cover image selected. Finish the details and create the event.");
  }

  function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
    handleFileSelect(event.target.files?.[0] ?? null);
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(false);
    handleFileSelect(event.dataTransfer.files?.[0] ?? null);
  }

  function handleClearImage() {
    setCoverImageFile(null);
    setErrors((current) => ({ ...current, coverImage: undefined }));

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors: FormErrors = {};

    if (!values.name.trim()) {
      nextErrors.name = "Event name is required.";
    }

    if (!values.description.trim()) {
      nextErrors.description = "Add a short description for the event.";
    }

    if (!coverImageFile) {
      nextErrors.coverImage = "Choose a cover image before creating the event.";
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      setStatusText("Please complete the required fields before creating the event.");
      return;
    }

    setIsSubmitting(true);

    const payload = new FormData();
    payload.append("name", values.name.trim());
    payload.append("description", values.description.trim());
    payload.append("coverImage", coverImageFile as File);

    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.trim().replace(/\/$/, "");
    const endpoint = apiBaseUrl ? `${apiBaseUrl}/api/events` : "/api/events";
    const accessToken = readAccessToken();

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
        body: payload,
      });

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      window.localStorage.removeItem(draftStorageKey);
      setValues(initialValues);
      setCoverImageFile(null);
      setErrors({});
      setStatusText("Event created successfully. Upload media next from the event gallery.");
    } catch {
      window.localStorage.setItem(
        draftStorageKey,
        JSON.stringify({
          name: values.name.trim(),
          description: values.description.trim(),
          coverImageName: coverImageFile?.name ?? "",
          savedAt: new Date().toISOString(),
        }),
      );

      setStatusText("Something went wrong while creating the event");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <Head>
        <title>GrabPic | Create Event</title>
        <meta
          name="description"
          content="Create a new event with a name, description, and cover image in GrabPic."
        />
      </Head>

      <div className="min-h-screen bg-(--color-bg-base)">
        <AuthenticatedNavbar activeTab="Events" />

        <main className="mx-auto w-full max-w-6xl px-5 py-8">
          <section className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-2">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-(--color-primary)">
                Events
              </p>
              <h1 className="text-[42px] font-bold tracking-[-0.03em] text-(--color-text-primary)">
                Create Event
              </h1>
              <p className="max-w-2xl text-[15px] leading-7 text-(--color-text-secondary)">
                Set up a new gallery in the same clean, curated style as the rest of GrabPic.
              </p>
            </div>

            <Link
              href="/"
              className="inline-flex h-11 items-center gap-2 rounded-[10px] border border-(--color-border) bg-white px-4 text-sm font-semibold text-(--color-text-primary) transition hover:bg-[#f0f2f8]"
            >
              <ArrowLeft size={16} />
              Back to dashboard
            </Link>
          </section>

          <section className="mt-8 grid gap-6 lg:grid-cols-[1.3fr_0.9fr]">
            <form className="space-y-6" onSubmit={handleSubmit}>
              <Card className="border-none shadow-[0_18px_50px_rgba(15,15,26,0.06)]">
                <CardContent className="space-y-6 p-7">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-2xl font-bold tracking-[-0.02em] text-(--color-text-primary)">
                        Event Details
                      </h2>
                      <p className="mt-1 text-sm text-(--color-text-secondary)">
                        Give the event a clear title and short summary before you add media.
                      </p>
                    </div>

                    <span className="inline-flex items-center gap-1.5 rounded-full bg-(--color-primary-subtle) px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-(--color-primary)">
                      <Sparkles size={11} />
                      Ready to publish
                    </span>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[12px] font-semibold uppercase tracking-[0.08em] text-(--color-text-tertiary)">
                      Event Name
                    </label>
                    <Input
                      value={values.name}
                      onChange={(eventChange) => updateField("name", eventChange.target.value)}
                      placeholder="Global Tech Summit 2026"
                      aria-invalid={Boolean(errors.name)}
                    />
                    {errors.name ? <p className="text-sm text-[#b42318]">{errors.name}</p> : null}
                  </div>

                  <div className="space-y-2">
                    <label className="text-[12px] font-semibold uppercase tracking-[0.08em] text-(--color-text-tertiary)">
                      Description
                    </label>
                    <textarea
                      value={values.description}
                      onChange={(eventChange) => updateField("description", eventChange.target.value)}
                      rows={5}
                      placeholder="Describe the event, venue, and the kind of memories you want to curate."
                      aria-invalid={Boolean(errors.description)}
                      className="w-full resize-none rounded-[10px] border border-transparent bg-[#f4f5f7] px-4 py-3 text-[15px] text-(--color-text-primary) outline-none transition-[border-color,background,box-shadow] duration-200 placeholder:text-(--color-text-tertiary) focus:border-(--color-primary) focus:bg-white focus:ring-2 focus:ring-(--color-primary)/10"
                    />
                    <div className="flex items-center justify-between gap-3 text-[12px] text-(--color-text-tertiary)">
                      <span>{descriptionLength > 0 ? `${descriptionLength} characters` : "Short and clear works best"}</span>
                      {errors.description ? <span className="text-[#b42318]">{errors.description}</span> : null}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-end justify-between gap-3">
                      <div>
                        <label className="text-[12px] font-semibold uppercase tracking-[0.08em] text-(--color-text-tertiary)">
                          Cover Image
                        </label>
                        <p className="mt-1 text-sm text-(--color-text-secondary)">
                          Use a strong banner image with people, stage lighting, or a branded backdrop.
                        </p>
                      </div>

                      {coverImageFile ? (
                        <button
                          type="button"
                          className="text-sm font-semibold text-(--color-primary) underline underline-offset-2"
                          onClick={handleClearImage}
                        >
                          Remove image
                        </button>
                      ) : null}
                    </div>

                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => fileInputRef.current?.click()}
                      onDragOver={(event) => {
                        event.preventDefault();
                        setIsDragging(true);
                      }}
                      onDragLeave={() => setIsDragging(false)}
                      onDrop={handleDrop}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          fileInputRef.current?.click();
                        }
                      }}
                      className={cn(
                        "group flex min-h-55 cursor-pointer flex-col items-center justify-center rounded-[20px] border border-dashed px-6 text-center transition duration-200",
                        isDragging
                          ? "border-(--color-primary) bg-(--color-primary-subtle)"
                          : "border-[#c7c3f7] bg-[#fbfbff] hover:border-(--color-primary) hover:bg-white",
                      )}
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleInputChange}
                      />

                      {coverImagePreview ? (
                        <div className="w-full max-w-105 space-y-4">
                          <div className="overflow-hidden rounded-[18px] border border-(--color-border) bg-white shadow-[0_18px_40px_rgba(15,15,26,0.08)]">
                            <img
                              src={coverImagePreview}
                              alt={coverImageFile?.name ?? "Selected cover"}
                              className="h-56 w-full object-cover"
                            />
                          </div>
                          <div className="flex items-center justify-center gap-2 text-sm text-(--color-text-secondary)">
                            <CheckCircle2 size={16} className="text-(--color-primary)" />
                            {coverImageFile?.name}
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-(--color-primary-subtle) text-(--color-primary)">
                            <UploadCloud size={24} />
                          </div>
                          <div className="space-y-2">
                            <h3 className="text-xl font-semibold tracking-[-0.01em] text-(--color-text-primary)">
                              Drop a cover image here
                            </h3>
                            <p className="mx-auto max-w-md text-sm leading-6 text-(--color-text-secondary)">
                              JPG, PNG, or WEBP. A wide image works best for the event banner and dashboard card.
                            </p>
                          </div>
                          <Button type="button" variant="secondary" size="sm" className="gap-2">
                            <ImagePlus size={16} />
                            Choose file
                          </Button>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between gap-3 text-[12px] text-(--color-text-tertiary)">
                      <span>Recommended ratio: 16:10</span>
                      {errors.coverImage ? <span className="text-[#b42318]">{errors.coverImage}</span> : null}
                    </div>
                  </div>

                  <div className="rounded-2xl bg-[#f8f9fc] px-4 py-3 text-sm text-(--color-text-secondary)">
                    {statusText}
                  </div>
                </CardContent>
              </Card>

              <div className="flex flex-col gap-3 border-t border-(--color-border) pt-6 sm:flex-row sm:justify-end">
                <Button type="button" variant="secondary" onClick={() => router.back()}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting} className="min-w-40">
                  {isSubmitting ? <LoaderCircle size={16} className="animate-spin" /> : null}
                  {isSubmitting ? "Creating..." : "Create Event"}
                </Button>
              </div>
            </form>

            <div className="space-y-6">
              <Card className="border-none shadow-[0_18px_50px_rgba(15,15,26,0.06)]">
                <CardContent className="space-y-5 p-7">
                  <div className="space-y-2">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-(--color-primary)">
                      Live Preview
                    </p>
                    <h2 className="text-2xl font-bold tracking-[-0.02em] text-(--color-text-primary)">
                      How it will appear
                    </h2>
                  </div>

                  <div className="overflow-hidden rounded-[22px] border border-(--color-border) bg-white shadow-[0_12px_30px_rgba(15,15,26,0.06)]">
                    <div className="aspect-16/10 bg-[linear-gradient(135deg,#102545_0%,#4a3fd6_48%,#9fa7ff_100%)]">
                      {coverImagePreview ? (
                        <img src={coverImagePreview} alt="Event cover preview" className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full flex-col items-center justify-center px-6 text-center text-white">
                          <Camera size={30} strokeWidth={1.8} />
                          <p className="mt-3 text-lg font-semibold">Cover image preview</p>
                          <p className="mt-1 max-w-xs text-sm leading-6 text-white/80">
                            The image you choose will anchor the event card and set the tone for the gallery.
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="space-y-4 p-5">
                      <div className="space-y-1">
                        <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-(--color-text-tertiary)">
                          Event name
                        </p>
                        <h3 className="text-2xl font-semibold tracking-[-0.02em] text-(--color-text-primary)">
                          {values.name.trim() || "Your new event"}
                        </h3>
                      </div>

                      <p className="text-sm leading-6 text-(--color-text-secondary)">
                        {values.description.trim() || "Add a short description to help guests and curators understand the event."}
                      </p>

                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="rounded-[14px] bg-(--color-primary-subtle) p-4">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-(--color-primary)">
                            Name length
                          </p>
                          <p className="mt-2 text-lg font-bold text-(--color-text-primary)">
                            {nameLength > 0 ? nameLength : "0"} chars
                          </p>
                        </div>
                        <div className="rounded-[14px] bg-[#f8f9fc] p-4">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-(--color-text-tertiary)">
                            Cover status
                          </p>
                          <p className="mt-2 text-lg font-bold text-(--color-text-primary)">
                            {coverImageFile ? "Selected" : "Missing"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>
        </main>
      </div>
    </>
  );
}