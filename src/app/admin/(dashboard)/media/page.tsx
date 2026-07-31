"use client";

import { useCallback, useEffect, useState } from "react";
import { Upload, LoaderCircle, HardDrive } from "lucide-react";
import { cn } from "@/lib/utils";
import { apiGet, apiUpload, ApiRequestError, type ApiMeta } from "@/lib/admin-api";
import { formatBytes } from "@/lib/format";
import { AlertBanner } from "@/components/admin/PageHeader";
import Pagination from "@/components/admin/Pagination";
import MediaGrid from "@/components/admin/media/MediaGrid";
import MediaDetailsModal from "@/components/admin/media/MediaDetailsModal";
import { MEDIA_BUCKETS, type MediaObject, type PublicBucket } from "@/components/admin/media/types";

type BucketUsage = { bucket: string; count: number; totalBytes: number };

export default function MediaLibraryPage() {
  const [bucket, setBucket] = useState<PublicBucket>("assets");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<MediaObject[]>([]);
  const [meta, setMeta] = useState<ApiMeta>({ total: 0, page: 1, limit: 24, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [selected, setSelected] = useState<MediaObject | null>(null);
  const [usage, setUsage] = useState<{ buckets: BucketUsage[]; grandTotalBytes: number; grandTotalCount: number } | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  const refresh = useCallback(() => setReloadToken((n) => n + 1), []);

  useEffect(() => {
    setLoading(true);
    setError(null);
    const params = new URLSearchParams({ bucket, page: String(page), limit: "24" });
    if (search) params.set("search", search);
    apiGet<MediaObject[]>(`/api/admin/media?${params.toString()}`)
      .then(({ data, meta }) => {
        setItems(data);
        setMeta(meta ?? { total: 0, page: 1, limit: 24, totalPages: 1 });
      })
      .catch((err) => setError(err instanceof ApiRequestError ? err.message : "Failed to load media"))
      .finally(() => setLoading(false));
  }, [bucket, search, page, reloadToken]);

  useEffect(() => {
    apiGet<{ buckets: BucketUsage[]; grandTotalBytes: number; grandTotalCount: number }>("/api/admin/media/usage")
      .then(({ data }) => setUsage(data))
      .catch(() => setUsage(null));
  }, [reloadToken]);

  useEffect(() => {
    setPage(1);
  }, [bucket, search]);

  async function uploadFile(file: File) {
    setUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("bucket", bucket);
      await apiUpload("/api/admin/media", formData);
      refresh();
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) uploadFile(file);
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Media Library</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Every image and PDF uploaded across the site, in one place. Uploads here are immediately available
          everywhere via &quot;Browse Library&quot;, and files uploaded from other admin pages show up here too.
        </p>
      </div>

      {error && <AlertBanner type="error" message={error} />}

      {/* Storage Usage */}
      {usage && (
        <div className="glass-panel rounded-2xl p-5 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <HardDrive className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-semibold text-foreground">Storage Usage</h2>
            <span className="text-xs text-muted-foreground ml-auto">
              {usage.grandTotalCount} files &middot; {formatBytes(usage.grandTotalBytes)} total
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {usage.buckets.map((b) => (
              <div key={b.bucket} className="rounded-lg border border-border p-3">
                <p className="text-xs text-muted-foreground capitalize">{b.bucket}</p>
                <p className="text-sm font-semibold text-foreground">{formatBytes(b.totalBytes)}</p>
                <p className="text-[10px] text-muted-foreground">{b.count} files</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bucket Tabs */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        {MEDIA_BUCKETS.map((b) => (
          <button
            key={b.id}
            type="button"
            onClick={() => setBucket(b.id)}
            className={cn(
              "px-4 py-1.5 rounded-full text-sm font-medium transition-colors",
              bucket === b.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"
            )}
          >
            {b.label}
          </button>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search files by name..."
          className="w-full sm:max-w-xs rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
        <label className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer shrink-0">
          {uploading ? <LoaderCircle className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
          {uploading ? "Uploading..." : "Upload"}
          <input
            type="file"
            accept={bucket === "assets" ? "image/*,application/pdf" : "image/*"}
            className="hidden"
            disabled={uploading}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) uploadFile(file);
              e.target.value = "";
            }}
          />
        </label>
      </div>

      {/* Drag & Drop Zone + Grid */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={cn(
          "rounded-2xl border-2 border-dashed p-4 transition-colors",
          dragOver ? "border-primary bg-primary/5" : "border-transparent"
        )}
      >
        {dragOver && (
          <p className="text-center text-sm text-primary font-medium mb-3">Drop file to upload to &quot;{bucket}&quot;</p>
        )}
        <MediaGrid items={items} loading={loading} onSelect={setSelected} />
      </div>

      <Pagination meta={meta} onPageChange={setPage} />

      <MediaDetailsModal
        item={selected}
        onClose={() => setSelected(null)}
        onDeleted={() => {
          setSelected(null);
          refresh();
        }}
        onReplaced={() => {
          setSelected(null);
          refresh();
        }}
      />
    </div>
  );
}
