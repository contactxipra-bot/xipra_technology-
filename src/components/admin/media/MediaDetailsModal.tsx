"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Copy, Check, Trash2, Upload, FileText, LoaderCircle } from "lucide-react";
import Modal from "@/components/admin/Modal";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { apiGet, apiSend, apiUpload, ApiRequestError } from "@/lib/admin-api";
import { formatBytes } from "@/lib/format";
import type { MediaObject } from "./types";

type Usage = { type: string; label: string };

export default function MediaDetailsModal({
  item,
  onClose,
  onDeleted,
  onReplaced,
}: {
  item: MediaObject | null;
  onClose: () => void;
  onDeleted: () => void;
  onReplaced: (updated: MediaObject) => void;
}) {
  const [copied, setCopied] = useState(false);
  const [usage, setUsage] = useState<Usage[] | null>(null);
  const [usageLoading, setUsageLoading] = useState(false);
  const [replacing, setReplacing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!item) {
      setUsage(null);
      return;
    }
    setUsageLoading(true);
    apiGet<Usage[]>(`/api/admin/media/find-usage?url=${encodeURIComponent(item.url)}`)
      .then(({ data }) => setUsage(data))
      .catch(() => setUsage([]))
      .finally(() => setUsageLoading(false));
  }, [item]);

  if (!item) return null;

  async function copyUrl() {
    await navigator.clipboard.writeText(item!.url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleReplace(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setReplacing(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("bucket", item!.bucket);
      formData.append("replace", item!.name);
      const updated = await apiUpload<MediaObject>("/api/admin/media", formData);
      onReplaced(updated);
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Replace failed");
    } finally {
      setReplacing(false);
      e.target.value = "";
    }
  }

  async function handleDelete() {
    setDeleting(true);
    setError(null);
    try {
      await apiSend("/api/admin/media", "DELETE", { bucket: item!.bucket, name: item!.name });
      setConfirmOpen(false);
      onDeleted();
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Delete failed (SUPER_ADMIN only)");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <Modal open={Boolean(item)} onClose={onClose} title="File Details" maxWidth="max-w-lg">
        {error && (
          <div className="mb-3 rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2 text-xs text-destructive">
            {error}
          </div>
        )}

        <div className="relative w-full aspect-video rounded-xl border border-border bg-muted/30 overflow-hidden mb-4 flex items-center justify-center">
          {item.isImage ? (
            <Image src={item.url} alt={item.name} fill sizes="512px" className="object-contain" />
          ) : (
            <div className="flex flex-col items-center gap-2 text-muted-foreground">
              <FileText className="w-10 h-10" />
              <span className="text-xs">{item.name}</span>
            </div>
          )}
        </div>

        <dl className="grid grid-cols-2 gap-3 text-sm mb-4">
          <div>
            <dt className="text-xs text-muted-foreground">Bucket</dt>
            <dd className="text-foreground capitalize">{item.bucket}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Type</dt>
            <dd className="text-foreground">{item.mimeType}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Size</dt>
            <dd className="text-foreground">{formatBytes(item.size)}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Uploaded</dt>
            <dd className="text-foreground">{item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "—"}</dd>
          </div>
        </dl>

        <div className="mb-4">
          <label className="block text-xs text-muted-foreground mb-1">Public URL</label>
          <div className="flex items-center gap-2">
            <input readOnly value={item.url} className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground truncate" />
            <button type="button" onClick={copyUrl} className="rounded-lg border border-border p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
              {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="mb-5">
          <label className="block text-xs text-muted-foreground mb-1.5">Used In</label>
          {usageLoading ? (
            <p className="text-xs text-muted-foreground">Checking...</p>
          ) : usage && usage.length > 0 ? (
            <ul className="space-y-1">
              {usage.map((u, idx) => (
                <li key={idx} className="text-xs text-foreground flex items-center gap-2">
                  <span className="rounded-full bg-primary/10 text-primary px-2 py-0.5 text-[10px] font-medium">{u.type}</span>
                  {u.label}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-muted-foreground">Not currently used anywhere.</p>
          )}
        </div>

        <div className="flex flex-wrap justify-end gap-2">
          <label className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm font-medium text-foreground cursor-pointer hover:bg-muted transition-colors">
            {replacing ? <LoaderCircle className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            {replacing ? "Replacing..." : "Replace"}
            <input type="file" accept={item.isPdf ? "application/pdf" : "image/*"} className="hidden" disabled={replacing} onChange={handleReplace} />
          </label>
          <Button type="button" variant="destructive" onClick={() => setConfirmOpen(true)}>
            <Trash2 className="w-4 h-4" /> Delete
          </Button>
        </div>
      </Modal>

      <ConfirmDialog
        open={confirmOpen}
        title="Delete File"
        description={`Are you sure you want to permanently delete "${item.name}"? This requires SUPER_ADMIN and cannot be undone.`}
        loading={deleting}
        onConfirm={handleDelete}
        onClose={() => setConfirmOpen(false)}
      />
    </>
  );
}
