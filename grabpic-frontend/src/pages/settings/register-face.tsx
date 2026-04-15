import Head from "next/head";
import { type ChangeEvent, useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import { Camera, CircleAlert, Flashlight, LoaderCircle, Upload, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { apiClient } from "@/lib/api-client";
import { getSafeNextPath } from "@/lib/navigation";

export default function UpdateFacePage() {
  const router = useRouter();
  const nextPath = getSafeNextPath(router.query.next, "/");
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewUrlRef = useRef<string | null>(null);
  const selectedFileRef = useRef<File | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [galleryPreviewUrl, setGalleryPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const isUpdateMode = router.query.mode === "update";

  function handleClose() {
    if (!isUpdateMode) {
      return;
    }
    void router.push("/settings");
  }

  function handleUploadClick() {
    fileInputRef.current?.click();
  }

  function clearGalleryPreview() {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }

    selectedFileRef.current = null;
    setGalleryPreviewUrl(null);
  }

  function setPreviewFile(nextFile: File) {
    clearGalleryPreview();
    selectedFileRef.current = nextFile;

    const nextPreviewUrl = URL.createObjectURL(nextFile);
    previewUrlRef.current = nextPreviewUrl;
    setGalleryPreviewUrl(nextPreviewUrl);
  }

  function stopCamera() {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setIsCameraReady(false);
  }

  async function startCamera() {
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError("Camera access is not supported in this browser.");
      return;
    }

    try {
      setCameraError(null);
      setUploadStatus(null);

      if (!streamRef.current) {
        streamRef.current = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user" },
          audio: false,
        });
      }

      if (videoRef.current) {
        videoRef.current.srcObject = streamRef.current;
        await videoRef.current.play();
      }

      setIsCameraReady(true);
    } catch {
      setCameraError("Unable to access your camera. Check permissions and try again.");
      setIsCameraReady(false);
    }
  }

  function handleCameraClick() {
    if (isCameraReady) {
      stopCamera();
      return;
    }

    void startCamera();
  }

  function handleCaptureClick() {
    if (!isCameraReady || !videoRef.current) {
      setCameraError("Open the camera first, then take the photo.");
      return;
    }

    const video = videoRef.current;

    if (video.videoWidth === 0 || video.videoHeight === 0) {
      setCameraError("Camera is still loading. Try again in a moment.");
      return;
    }

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context = canvas.getContext("2d");

    if (!context) {
      setCameraError("Unable to capture the current photo.");
      return;
    }

    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((blob) => {
      if (!blob) {
        setCameraError("Unable to capture the current photo.");
        return;
      }

      const nextFile = new File([blob], `face-capture-${Date.now()}.jpg`, {
        type: "image/jpeg",
      });

      setPreviewFile(nextFile);
      stopCamera();
    }, "image/jpeg", 0.92);
  }

  async function handleProceedUpload() {
    const selectedFile = selectedFileRef.current;

    if (!selectedFile) {
      setCameraError("Choose or capture a face photo first.");
      return;
    }

    const payload = new FormData();
    payload.append("image", selectedFile);

    try {
      setIsUploading(true);
      setCameraError(null);
      setUploadStatus("Uploading your face photo...");

      const [, response] = await apiClient.postFormData("/user/register-face", payload);

      if (response.status !== 200) {
        throw new Error(response.error || `Request failed with status ${response.status}`);
      }

      setUploadStatus("Face photo uploaded successfully.");
      clearGalleryPreview();
      await router.push(isUpdateMode ? "/settings" : nextPath);
    } catch (error) {
      setUploadStatus(null);
      setCameraError(error instanceof Error ? error.message : "Failed to upload the photo.");
    } finally {
      setIsUploading(false);
    }
  }

  useEffect(() => {
    return () => {
      stopCamera();
      clearGalleryPreview();
    };
  }, []);

  function handleUploadChange(event: ChangeEvent<HTMLInputElement>) {
    const selectedFile = event.target.files?.[0];

    if (!selectedFile) {
      return;
    }

    stopCamera();
    setUploadStatus(null);
    setCameraError(null);
    setPreviewFile(selectedFile);
    event.target.value = "";
  }

  return (
    <>
      <Head>
        <title>GrabPic | Face Registration</title>
        <meta
          name="description"
          content="Register or update your face profile to improve AI photo matching for your events."
        />
      </Head>

      <main className="min-h-screen bg-[#eef0f5] px-4 py-6 sm:px-6 sm:py-8">
        <div className="mx-auto max-w-245">
          <div className="mb-6 flex items-center justify-between">
            <p className="text-[26px] font-bold tracking-[-0.02em] text-[#111118]">GrabPic</p>
            {isUpdateMode ? (
              <button
                type="button"
                aria-label="Close face registration"
                onClick={handleClose}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full text-[#3f4454] transition hover:bg-black/5"
              >
                <X size={18} />
              </button>
            ) : <span className="h-9 w-9" aria-hidden="true" />}
          </div>

          <section className="mx-auto w-full max-w-120 text-center">
            <h1 className="text-[34px] font-bold tracking-[-0.03em] text-[#14161f] sm:text-[38px]">
              Face Registration
            </h1>
            <p className="mx-auto mt-3 max-w-[44ch] text-[14px] leading-6 text-[#545867]">
              We use facial recognition to curate your photos from events instantly.
            </p>

            <div className="mt-8 rounded-[34px] border border-white/40 bg-[radial-gradient(circle_at_50%_20%,#6f685f_0%,#3e3a35_42%,#2c2928_100%)] p-6 shadow-[0_28px_70px_rgba(13,14,19,0.28)]">
              <div className="mx-auto flex w-fit items-center gap-2 rounded-full border border-white/15 bg-white/12 px-4 py-2 text-[12px] font-medium text-white/95 backdrop-blur-sm">
                <CircleAlert size={14} />
                Align your face within the circle
              </div>

              <div className="relative mt-4 overflow-hidden rounded-[28px] p-4">
                <div className="pointer-events-none absolute inset-0 rounded-[28px] bg-[radial-gradient(circle_at_50%_18%,rgba(246,235,211,0.12),transparent_52%)]" />

                <div className="relative mx-auto mt-3 h-63.75 w-63.75 overflow-hidden rounded-full border border-[#e8dfcf]/35 bg-[radial-gradient(circle_at_50%_26%,#d8d2c6_0%,#cbbba2_50%,#8f745b_88%)] shadow-[inset_0_-28px_36px_rgba(0,0,0,0.28)] sm:h-71.25 sm:w-71.25">
                  {galleryPreviewUrl ? (
                    <img src={galleryPreviewUrl} alt="Selected face preview" className="h-full w-full object-cover" />
                  ) : null}

                  <video
                    ref={videoRef}
                    className={`h-full w-full object-cover transition-opacity duration-300 ${
                      isCameraReady ? "opacity-100" : "opacity-0"
                    }`}
                    muted
                    playsInline
                    autoPlay
                  />
                  <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_26%,rgba(255,255,255,0.18),transparent_38%),linear-gradient(to_bottom,rgba(0,0,0,0.06),rgba(0,0,0,0.14))]" />
                </div>

                <span className="absolute left-[8%] top-1/2 h-px w-4 -translate-y-1/2 bg-white/70" />
                <span className="absolute right-[8%] top-1/2 h-px w-4 -translate-y-1/2 bg-white/70" />
                <span className="absolute left-1/2 top-[11%] h-4 w-px -translate-x-1/2 bg-white/70" />
                <span className="absolute left-1/2 bottom-[11%] h-4 w-px -translate-x-1/2 bg-white/70" />

                <div className="relative mt-4 flex items-center justify-center gap-8 pb-1">
                  <button
                    type="button"
                    aria-label="Switch camera"
                    onClick={handleCameraClick}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/20 text-white transition hover:bg-white/30"
                  >
                    <Camera size={18} />
                  </button>

                  <button
                    type="button"
                    aria-label="Capture"
                    onClick={handleCaptureClick}
                    className="inline-flex h-16 w-16 items-center justify-center rounded-full border-4 border-white/45 bg-white/95 shadow-[0_10px_24px_rgba(0,0,0,0.38)]"
                  >
                    <span className="h-11 w-11 rounded-full border border-[#d4d6dd]" />
                  </button>

                  <button
                    type="button"
                    aria-label="Toggle flash"
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/20 text-white transition hover:bg-white/30"
                  >
                    <Flashlight size={18} />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleCameraClick}
                  className="mt-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-[12px] font-semibold text-white/90 backdrop-blur-sm transition hover:bg-white/20"
                >
                  <Camera size={14} />
                  {isCameraReady ? "Stop Camera" : "Open Camera"}
                </button>

                {cameraError ? (
                  <p className="mt-3 text-[12px] font-medium text-[#ffd8d8]">{cameraError}</p>
                ) : (
                  <p className="mt-3 text-[12px] text-white/70">
                    {galleryPreviewUrl
                      ? "Preview loaded from gallery. Proceed to upload when ready."
                      : isCameraReady
                      ? "Camera is active. Position your face inside the circle."
                      : "Tap Open Camera to request webcam access."}
                  </p>
                )}

                {uploadStatus ? <p className="mt-2 text-[12px] font-medium text-white/85">{uploadStatus}</p> : null}
              </div>
            </div>

            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleUploadChange} />

            <Button
              type="button"
              variant="secondary"
              className="mt-6 h-12 w-full rounded-xl border-0 bg-[#e1e4ea] text-[15px] text-[#1e2230] hover:bg-[#d7dce5]"
              onClick={handleUploadClick}
            >
              <Upload size={16} />
              Upload from Gallery
            </Button>

            {galleryPreviewUrl ? (
              <Button
                type="button"
                className="mt-3 h-12 w-full rounded-xl"
                onClick={handleProceedUpload}
                disabled={isUploading}
              >
                {isUploading ? <LoaderCircle size={16} className="animate-spin" /> : null}
                {isUploading ? "Uploading..." : "Proceed and Upload Photo"}
              </Button>
            ) : null}

            <p className="mt-8 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#3c4150]">
              Secure &amp; Private
            </p>
            <p className="mx-auto mt-3 max-w-[38ch] text-[12px] leading-5 text-[#626776]">
              Your face data is encrypted and used only for matching photos from events you attend.
            </p>
          </section>
        </div>
      </main>
    </>
  );
}
