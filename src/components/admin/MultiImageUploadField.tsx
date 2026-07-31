"use client";

import { memo, useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import {
  Upload,
  X,
  LoaderCircle,
  FolderOpen,
  ImageOff,
  ChevronLeft,
  ChevronRight,
  GripVertical,
} from "lucide-react";
import { apiUpload, ApiRequestError } from "@/lib/admin-api";
import MediaPickerModal from "@/components/admin/media/MediaPickerModal";
import type { PublicBucket } from "@/components/admin/media/types";
import { isValidImageSrc } from "@/lib/image-src";

type UploadSubdir = "products" | "portfolio" | "settings" | "content";

const SUBDIR_TO_BUCKET: Record<UploadSubdir, PublicBucket> = {
  products: "products",
  portfolio: "portfolio",
  settings: "logos",
  content: "assets",
};

const SWIPE_THRESHOLD_PX = 40;
const FADE_DURATION_S = 0.2; // 200ms, within the requested 150-250ms range

type ThumbnailProps = {
  src: string;
  index: number;
  isActive: boolean;
  isCover: boolean;
  isDragging: boolean;
  isDropTarget: boolean;
  onSelect: (index: number) => void;
  onDelete: (index: number) => void;
  onDragStart: (index: number) => void;
  onDragEnter: (index: number) => void;
  onDragEnd: () => void;
};

const Thumbnail = memo(function Thumbnail({
  src,
  index,
  isActive,
  isCover,
  isDragging,
  isDropTarget,
  onSelect,
  onDelete,
  onDragStart,
  onDragEnter,
  onDragEnd,
}: ThumbnailProps) {
  return (
    <div
      draggable
      onDragStart={() => onDragStart(index)}
      onDragEnter={() => onDragEnter(index)}
      onDragOver={(e) => e.preventDefault()}
      onDragEnd={onDragEnd}
      onClick={() => onSelect(index)}
      role="button"
      tabIndex={0}
      aria-label={`Show image ${index + 1}`}
      aria-current={isActive}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect(index);
        }
      }}
      className={`group relative aspect-square rounded-lg overflow-hidden border cursor-pointer transition-all ${
        isActive
          ? "ring-2 ring-primary ring-offset-2 ring-offset-background border-transparent"
          : "border-border hover:border-primary/50"
      } ${isDragging ? "opacity-40" : ""} ${isDropTarget ? "outline outline-2 outline-primary/60" : ""}`}
    >
      {isValidImageSrc(src) ? (
        <Image src={src} alt="" fill sizes="120px" loading="lazy" className="object-cover pointer-events-none" />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-muted-foreground bg-muted/30">
          <ImageOff className="w-4 h-4" />
        </div>
      )}

      {isCover && (
        <span className="absolute top-1 left-1 rounded-full bg-primary/90 text-primary-foreground text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5">
          Cover
        </span>
      )}

      <div className="absolute inset-x-0 top-0 flex items-center justify-center pt-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
        <GripVertical className="w-3.5 h-3.5 text-white drop-shadow" />
      </div>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onDelete(index);
        }}
        aria-label={`Delete image ${index + 1}`}
        className="absolute inset-0 flex items-center justify-center bg-background/70 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <X className="w-4 h-4 text-destructive" />
      </button>
    </div>
  );
});

export default function MultiImageUploadField({
  label,
  values,
  onChange,
  subdir,
}: {
  label: string;
  values: string[];
  onChange: (paths: string[]) => void;
  subdir: UploadSubdir;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [activeSrc, setActiveSrc] = useState<string | null>(values[0] ?? null);
  const [isFileDragOver, setIsFileDragOver] = useState(false);
  const [reorderDragIndex, setReorderDragIndex] = useState<number | null>(null);
  const [reorderOverIndex, setReorderOverIndex] = useState<number | null>(null);

  const touchStartX = useRef<number | null>(null);

  // Keep the active image pointing at the same photo through uploads,
  // deletes, and reorders — only fall back to the first image when the
  // one we were viewing is no longer in the list (or the gallery is empty).
  useEffect(() => {
    if (values.length === 0) {
      if (activeSrc !== null) setActiveSrc(null);
      return;
    }
    if (activeSrc === null || !values.includes(activeSrc)) {
      setActiveSrc(values[0]);
    }
  }, [values, activeSrc]);

  const activeIndex = activeSrc ? values.indexOf(activeSrc) : -1;
  const canNavigate = values.length > 1;

  const goPrev = useCallback(() => {
    if (values.length === 0) return;
    const i = activeSrc ? values.indexOf(activeSrc) : 0;
    setActiveSrc(values[(i - 1 + values.length) % values.length]);
  }, [values, activeSrc]);

  const goNext = useCallback(() => {
    if (values.length === 0) return;
    const i = activeSrc ? values.indexOf(activeSrc) : 0;
    setActiveSrc(values[(i + 1) % values.length]);
  }, [values, activeSrc]);

  function handlePreviewKeyDown(e: React.KeyboardEvent) {
    if (!canNavigate) return;
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      goPrev();
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      goNext();
    }
  }

  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0]?.clientX ?? null;
  }
  function handleTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null) return;
    const delta = (e.changedTouches[0]?.clientX ?? touchStartX.current) - touchStartX.current;
    touchStartX.current = null;
    if (!canNavigate) return;
    if (delta > SWIPE_THRESHOLD_PX) goPrev();
    else if (delta < -SWIPE_THRESHOLD_PX) goNext();
  }

  async function uploadOne(file: File): Promise<string> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("subdir", subdir);
    const saved = await apiUpload<{ filePath: string }>("/api/admin/upload", formData);
    return saved.filePath;
  }

  async function uploadFiles(files: File[]) {
    if (files.length === 0) return;
    setUploading(true);
    setError(null);
    try {
      const uploaded: string[] = [];
      for (const file of files) {
        uploaded.push(await uploadOne(file));
      }
      onChange([...values, ...uploaded]);
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files ? Array.from(e.target.files) : [];
    e.target.value = "";
    void uploadFiles(files);
  }

  function handleDropUpload(e: React.DragEvent<HTMLLabelElement>) {
    e.preventDefault();
    setIsFileDragOver(false);
    const files = Array.from(e.dataTransfer.files ?? []).filter((f) => f.type.startsWith("image/"));
    void uploadFiles(files);
  }

  function removeAt(index: number) {
    onChange(values.filter((_, i) => i !== index));
  }

  // Internal drag-to-reorder among thumbnails (separate from OS file drag-drop above).
  function handleReorderDrop() {
    if (reorderDragIndex === null || reorderOverIndex === null || reorderDragIndex === reorderOverIndex) {
      setReorderDragIndex(null);
      setReorderOverIndex(null);
      return;
    }
    const next = [...values];
    const [moved] = next.splice(reorderDragIndex, 1);
    next.splice(reorderOverIndex, 0, moved);
    onChange(next);
    setReorderDragIndex(null);
    setReorderOverIndex(null);
  }

  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-1.5">
        <label className="block text-sm font-medium text-foreground">{label}</label>
        {values.length > 0 && (
          <span className="text-xs font-medium text-muted-foreground tabular-nums">
            {activeIndex + 1}/{values.length}
          </span>
        )}
      </div>

      {values.length === 0 ? (
        <label
          onDragOver={(e) => {
            e.preventDefault();
            setIsFileDragOver(true);
          }}
          onDragLeave={() => setIsFileDragOver(false)}
          onDrop={handleDropUpload}
          className={`flex flex-col items-center justify-center gap-2 aspect-video rounded-xl border-2 border-dashed cursor-pointer transition-colors ${
            isFileDragOver ? "border-primary bg-primary/5" : "border-border hover:bg-muted/50"
          }`}
        >
          {uploading ? (
            <LoaderCircle className="w-6 h-6 animate-spin text-muted-foreground" />
          ) : (
            <Upload className="w-6 h-6 text-muted-foreground" />
          )}
          <span className="text-xs text-muted-foreground">Drag & drop images, or click to browse</span>
          <input type="file" accept="image/*" multiple className="hidden" disabled={uploading} onChange={handleFileInput} />
        </label>
      ) : (
        <div
          tabIndex={0}
          role="group"
          aria-label="Image preview"
          onKeyDown={handlePreviewKeyDown}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          className="relative aspect-video rounded-xl overflow-hidden border border-border bg-muted/30 outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <AnimatePresence mode="wait">
            {activeSrc && isValidImageSrc(activeSrc) ? (
              <motion.div
                key={activeSrc}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: FADE_DURATION_S }}
                className="absolute inset-0"
              >
                <Image src={activeSrc} alt="" fill sizes="(max-width: 640px) 100vw, 480px" className="object-contain" />
              </motion.div>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                <ImageOff className="w-6 h-6" />
              </div>
            )}
          </AnimatePresence>

          {canNavigate && (
            <>
              <button
                type="button"
                onClick={goPrev}
                aria-label="Previous image"
                className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-background/80 backdrop-blur-sm border border-border flex items-center justify-center text-foreground hover:bg-background transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={goNext}
                aria-label="Next image"
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-background/80 backdrop-blur-sm border border-border flex items-center justify-center text-foreground hover:bg-background transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      )}

      {values.length > 0 && (
        <div
          className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 mt-2"
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleReorderDrop}
        >
          {values.map((src, i) => (
            <Thumbnail
              key={src}
              src={src}
              index={i}
              isActive={src === activeSrc}
              isCover={i === 0}
              isDragging={reorderDragIndex === i}
              isDropTarget={reorderOverIndex === i && reorderDragIndex !== i}
              onSelect={(idx) => setActiveSrc(values[idx])}
              onDelete={removeAt}
              onDragStart={setReorderDragIndex}
              onDragEnter={setReorderOverIndex}
              onDragEnd={() => {
                setReorderDragIndex(null);
                setReorderOverIndex(null);
              }}
            />
          ))}

          <label
            onDragOver={(e) => {
              e.preventDefault();
              setIsFileDragOver(true);
            }}
            onDragLeave={() => setIsFileDragOver(false)}
            onDrop={handleDropUpload}
            className={`aspect-square rounded-lg border border-dashed flex items-center justify-center text-muted-foreground cursor-pointer transition-colors ${
              isFileDragOver ? "border-primary bg-primary/5" : "border-border hover:bg-muted"
            }`}
          >
            {uploading ? (
              <LoaderCircle className="w-4 h-4 animate-spin" />
            ) : (
              <Upload className="w-4 h-4" />
            )}
            <input type="file" accept="image/*" multiple className="hidden" disabled={uploading} onChange={handleFileInput} />
          </label>

          <button
            type="button"
            onClick={() => setPickerOpen(true)}
            className="aspect-square rounded-lg border border-dashed border-border flex flex-col items-center justify-center gap-0.5 text-muted-foreground hover:bg-muted transition-colors"
            title="Browse Library"
          >
            <FolderOpen className="w-4 h-4" />
            <span className="text-[9px]">Browse</span>
          </button>
        </div>
      )}

      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}

      <MediaPickerModal
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={(url) => onChange([...values, url])}
        defaultBucket={SUBDIR_TO_BUCKET[subdir]}
      />
    </div>
  );
}
