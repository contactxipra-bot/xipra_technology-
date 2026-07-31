"use client";

import { useEffect, useState } from "react";
import { Upload, LoaderCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import Modal from "@/components/admin/Modal";
import { apiGet, apiUpload, ApiRequestError } from "@/lib/admin-api";
import MediaGrid from "./MediaGrid";
import { MEDIA_BUCKETS, type MediaObject, type PublicBucket } from "./types";

export default function MediaPickerModal({
  open,
  onClose,
  onSelect,
  defaultBucket = "assets",
}: {
  open: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
  defaultBucket?: PublicBucket;
}) {
  const [bucket, setBucket] = useState<PublicBucket>(defaultBucket);
  const [search, setSearch] = useState("");
  const [items, setItems] = useState<MediaObject[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    const params = new URLSearchParams({ bucket, limit: "60" });
    if (search) params.set("search", search);
    apiGet<MediaObject[]>(`/api/admin/media?${params.toString()}`)
      .then(({ data }) => setItems(data))
      .catch((err) => setError(err instanceof ApiRequestError ? err.message : "Failed to load media"))
      .finally(() => setLoading(false));
  }, [open, bucket, search]);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("bucket", bucket);
      const saved = await apiUpload<MediaObject>("/api/admin/media", formData);
      onSelect(saved.url);
      onClose();
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Media Library" maxWidth="max-w-3xl">
      {error && (
        <div className="mb-3 rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2 text-xs text-destructive">
          {error}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2 mb-4">
        {MEDIA_BUCKETS.map((b) => (
          <button
            key={b.id}
            type="button"
            onClick={() => setBucket(b.id)}
            className={cn(
              "px-3 py-1.5 rounded-full text-xs font-medium transition-colors",
              bucket === b.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"
            )}
          >
            {b.label}
          </button>
        ))}
        <div className="flex-1" />
        <label className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground cursor-pointer hover:bg-muted transition-colors">
          {uploading ? <LoaderCircle className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
          {uploading ? "Uploading..." : "Upload new"}
          <input type="file" accept="image/*" className="hidden" disabled={uploading} onChange={handleUpload} />
        </label>
      </div>

      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search files..."
        className="w-full mb-4 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
      />

      <div className="max-h-[50vh] overflow-y-auto">
        <MediaGrid items={items} loading={loading} selectMode onSelect={(item) => { onSelect(item.url); onClose(); }} />
      </div>
    </Modal>
  );
}
