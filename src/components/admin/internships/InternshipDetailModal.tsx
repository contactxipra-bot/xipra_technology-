"use client";

import { useState } from "react";
import { Mail, Phone, GraduationCap, FileDown } from "lucide-react";
import Modal from "@/components/admin/Modal";
import { Select } from "@/components/admin/FormField";
import { Button } from "@/components/ui/button";
import { apiSend, ApiRequestError } from "@/lib/admin-api";
import type { InternshipApplication } from "./types";

export default function InternshipDetailModal({
  open,
  onClose,
  application,
  onUpdated,
}: {
  open: boolean;
  onClose: () => void;
  application: InternshipApplication | null;
  onUpdated: () => void;
}) {
  const [status, setStatus] = useState(application?.status ?? "PENDING");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!application) return null;

  async function handleStatusChange(next: string) {
    setStatus(next as InternshipApplication["status"]);
    setSaving(true);
    setError(null);
    try {
      await apiSend(`/api/admin/internships/${application!.id}`, "PATCH", { status: next });
      onUpdated();
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Failed to update status");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Internship Application" maxWidth="max-w-lg">
      {error && (
        <div className="mb-4 rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-2.5 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="space-y-3 mb-5">
        <div>
          <p className="text-xs text-muted-foreground">Applicant</p>
          <p className="text-sm font-medium text-foreground">{application.fullName}</p>
        </div>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-1.5 text-sm text-foreground">
            <Mail className="w-3.5 h-3.5 text-muted-foreground" /> {application.email}
          </div>
          <div className="flex items-center gap-1.5 text-sm text-foreground">
            <Phone className="w-3.5 h-3.5 text-muted-foreground" /> {application.phone}
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-sm text-foreground">
          <GraduationCap className="w-3.5 h-3.5 text-muted-foreground" /> {application.domain}
          {application.duration ? ` · ${application.duration}` : ""}
        </div>
        {(application.education || application.gender) && (
          <div className="flex flex-wrap gap-4">
            {application.education && (
              <div>
                <p className="text-xs text-muted-foreground">Education</p>
                <p className="text-sm text-foreground">{application.education}</p>
              </div>
            )}
            {application.gender && (
              <div>
                <p className="text-xs text-muted-foreground">Gender</p>
                <p className="text-sm text-foreground capitalize">{application.gender}</p>
              </div>
            )}
          </div>
        )}
        {application.address && (
          <div>
            <p className="text-xs text-muted-foreground">Address</p>
            <p className="text-sm text-foreground whitespace-pre-wrap">{application.address}</p>
          </div>
        )}
        {application.collegeName && (
          <div>
            <p className="text-xs text-muted-foreground">College</p>
            <p className="text-sm text-foreground">{application.collegeName}</p>
          </div>
        )}
        {application.message && (
          <div>
            <p className="text-xs text-muted-foreground">Message</p>
            <p className="text-sm text-foreground whitespace-pre-wrap">{application.message}</p>
          </div>
        )}
        {application.resumeUrl && (
          <a
            href={application.resumeUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
          >
            <FileDown className="w-4 h-4" /> View resume
          </a>
        )}
      </div>

      <Select
        label="Status"
        value={status}
        disabled={saving}
        onChange={(e) => handleStatusChange(e.target.value)}
      >
        <option value="PENDING">Pending</option>
        <option value="REVIEWED">Reviewed</option>
        <option value="ACCEPTED">Accepted</option>
        <option value="REJECTED">Rejected</option>
      </Select>

      <div className="flex justify-end">
        <Button type="button" variant="outline" onClick={onClose}>
          Close
        </Button>
      </div>
    </Modal>
  );
}
