"use client";

import { useState } from "react";
import Image from "next/image";
import { Upload, X, LoaderCircle, FolderOpen } from "lucide-react";
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

export default function ImageUploadField({
  label,
  value,
  onChange,
  subdir,
}: {
  label: string;
  value: string | null | undefined;
  onChange: (path: string) => void;
  subdir: UploadSubdir;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("subdir", subdir);
      const saved = await apiUpload<{ filePath: string }>("/api/admin/upload", formData);
      onChange(saved.filePath);
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-foreground mb-1.5">{label}</label>
      <div className="flex items-center gap-3">
        <div className="relative w-20 h-20 rounded-lg border border-border bg-muted/30 overflow-hidden shrink-0">
          {isValidImageSrc(value) ? (
            <Image src={value} alt="" fill sizes="80px" className="object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              <Upload className="w-5 h-5" />
            </div>
          )}
        </div>
        <div className="flex-1 space-y-1.5">
          <div className="flex flex-wrap gap-2">
            <label className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground cursor-pointer hover:bg-muted transition-colors">
              {uploading ? (
                <LoaderCircle className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Upload className="w-3.5 h-3.5" />
              )}
              {uploading ? "Uploading..." : value ? "Replace image" : "Upload image"}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                disabled={uploading}
                onChange={handleFile}
              />
            </label>
            <button
              type="button"
              onClick={() => setPickerOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted transition-colors"
            >
              <FolderOpen className="w-3.5 h-3.5" /> Browse Library
            </button>
          </div>
          {value && (
            <button
              type="button"
              onClick={() => onChange("")}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive"
            >
              <X className="w-3 h-3" /> Remove
            </button>
          )}
          {error && <p className="text-xs text-destructive">{error}</p>}
        </div>
      </div>

      <MediaPickerModal
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={onChange}
        defaultBucket={SUBDIR_TO_BUCKET[subdir]}
      />
    </div>
  );
}
