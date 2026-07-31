"use client";

import { useEffect, useState } from "react";
import { Mail, Phone } from "lucide-react";
import Modal from "@/components/admin/Modal";
import { Select } from "@/components/admin/FormField";
import { Button } from "@/components/ui/button";
import { apiSend, ApiRequestError } from "@/lib/admin-api";
import type { ContactMessage } from "./types";

export default function ContactDetailModal({
  open,
  onClose,
  message,
  onUpdated,
}: {
  open: boolean;
  onClose: () => void;
  message: ContactMessage | null;
  onUpdated: () => void;
}) {
  const [status, setStatus] = useState<ContactMessage["status"]>(message?.status ?? "UNREAD");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (message) setStatus(message.status);
  }, [message]);

  if (!message) return null;

  async function handleStatusChange(next: string) {
    setStatus(next as ContactMessage["status"]);
    setSaving(true);
    setError(null);
    try {
      await apiSend(`/api/admin/contacts/${message!.id}`, "PATCH", { status: next });
      onUpdated();
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Failed to update status");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Contact Message" maxWidth="max-w-lg">
      {error && (
        <div className="mb-4 rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-2.5 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="space-y-3 mb-5">
        <div>
          <p className="text-xs text-muted-foreground">From</p>
          <p className="text-sm font-medium text-foreground">{message.name}</p>
        </div>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-1.5 text-sm text-foreground">
            <Mail className="w-3.5 h-3.5 text-muted-foreground" /> {message.email}
          </div>
          {message.phone && (
            <div className="flex items-center gap-1.5 text-sm text-foreground">
              <Phone className="w-3.5 h-3.5 text-muted-foreground" /> {message.phone}
            </div>
          )}
        </div>
        {message.subject && (
          <div>
            <p className="text-xs text-muted-foreground">Subject</p>
            <p className="text-sm text-foreground">{message.subject}</p>
          </div>
        )}
        <div>
          <p className="text-xs text-muted-foreground">Message</p>
          <p className="text-sm text-foreground whitespace-pre-wrap">{message.message}</p>
        </div>
      </div>

      <Select
        label="Status"
        value={status}
        disabled={saving}
        onChange={(e) => handleStatusChange(e.target.value)}
        hint="Mark as replied once you've followed up outside the system."
      >
        <option value="UNREAD">Unread</option>
        <option value="READ">Read</option>
        <option value="REPLIED">Replied</option>
      </Select>

      <div className="flex justify-end">
        <Button type="button" variant="outline" onClick={onClose}>
          Close
        </Button>
      </div>
    </Modal>
  );
}
