"use client";

import { useEffect, useState, type FormEvent } from "react";
import { FileText, Trash2, Upload, Download, Eye, QrCode, RefreshCw } from "lucide-react";
import Modal from "@/components/admin/Modal";
import { TextInput, TextArea, Select } from "@/components/admin/FormField";
import { Button } from "@/components/ui/button";
import { apiSend, apiUpload, ApiRequestError } from "@/lib/admin-api";

export type CertificateFile = {
  id: string;
  fileName: string;
  filePath: string;
  fileType: string;
  fileSize: number;
  uploadedAt: string;
};

export type Certificate = {
  id: string;
  certificateNumber: string;
  studentName: string;
  course: string;
  duration: string;
  issueDate: string;
  status: "ACTIVE" | "REVOKED" | "EXPIRED";
  remarks: string | null;
  qrCodePath: string | null;
  imagePath: string | null;
  imageType: string | null;
  studentPhotoPath?: string | null;
  studentPhotoType?: string | null;
  files: CertificateFile[];
};

type FormState = {
  certificateNumber: string;
  studentName: string;
  course: string;
  duration: string;
  issueDate: string;
  status: "ACTIVE" | "REVOKED" | "EXPIRED";
  remarks: string;
};

const EMPTY_FORM: FormState = {
  certificateNumber: "",
  studentName: "",
  course: "",
  duration: "",
  issueDate: "",
  status: "ACTIVE",
  remarks: "",
};

function toDateInputValue(iso: string) {
  return iso ? iso.slice(0, 10) : "";
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function CertificateFormModal({
  open,
  onClose,
  certificate,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  certificate: Certificate | null;
  onSaved: () => void;
}) {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [files, setFiles] = useState<CertificateFile[]>([]);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [qrPath, setQrPath] = useState<string | null>(null);
  const [hasImage, setHasImage] = useState(false);
  const [imageVersion, setImageVersion] = useState(0);
  const [regenerating, setRegenerating] = useState(false);
  const [imageBusy, setImageBusy] = useState(false);
  const [hasStudentPhoto, setHasStudentPhoto] = useState(false);
  const [studentPhotoVersion, setStudentPhotoVersion] = useState(0);
  const [studentPhotoBusy, setStudentPhotoBusy] = useState(false);

  useEffect(() => {
    if (certificate) {
      setForm({
        certificateNumber: certificate.certificateNumber,
        studentName: certificate.studentName,
        course: certificate.course,
        duration: certificate.duration,
        issueDate: toDateInputValue(certificate.issueDate),
        status: certificate.status,
        remarks: certificate.remarks ?? "",
      });
      setFiles(certificate.files);
      setQrPath(certificate.qrCodePath);
      setHasImage(Boolean(certificate.imagePath));
      setHasStudentPhoto(Boolean(certificate.studentPhotoPath));
    } else {
      setForm(EMPTY_FORM);
      setFiles([]);
      setQrPath(null);
      setHasImage(false);
      setHasStudentPhoto(false);
    }
    setImageVersion((v) => v + 1);
    setStudentPhotoVersion((v) => v + 1);
    setError(null);
  }, [certificate, open]);

  async function handleRegenerateQr() {
    if (!certificate) return;
    setRegenerating(true);
    setError(null);
    try {
      const updated = await apiSend<Certificate>(
        `/api/admin/certificates/${certificate.id}/qrcode`,
        "POST"
      );
      setQrPath(updated.qrCodePath);
      onSaved();
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Failed to regenerate QR code");
    } finally {
      setRegenerating(false);
    }
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !certificate) return;
    setImageBusy(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      await apiUpload(`/api/admin/certificates/${certificate.id}/image`, formData);
      setHasImage(true);
      setImageVersion((v) => v + 1);
      onSaved();
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Failed to upload image");
    } finally {
      setImageBusy(false);
      e.target.value = "";
    }
  }

  async function handleImageDelete() {
    if (!certificate) return;
    setImageBusy(true);
    setError(null);
    try {
      await apiSend(`/api/admin/certificates/${certificate.id}/image`, "DELETE");
      setHasImage(false);
      onSaved();
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Failed to remove image");
    } finally {
      setImageBusy(false);
    }
  }

  async function handleStudentPhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !certificate) return;
    setStudentPhotoBusy(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      await apiUpload(`/api/admin/certificates/${certificate.id}/student-photo`, formData);
      setHasStudentPhoto(true);
      setStudentPhotoVersion((v) => v + 1);
      onSaved();
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Failed to upload student photo");
    } finally {
      setStudentPhotoBusy(false);
      e.target.value = "";
    }
  }

  async function handleStudentPhotoDelete() {
    if (!certificate) return;
    setStudentPhotoBusy(true);
    setError(null);
    try {
      await apiSend(`/api/admin/certificates/${certificate.id}/student-photo`, "DELETE");
      setHasStudentPhoto(false);
      onSaved();
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Failed to remove student photo");
    } finally {
      setStudentPhotoBusy(false);
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      if (certificate) {
        await apiSend(`/api/admin/certificates/${certificate.id}`, "PUT", form);
      } else {
        await apiSend("/api/admin/certificates", "POST", form);
      }
      onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Failed to save certificate");
    } finally {
      setSaving(false);
    }
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !certificate) return;
    setUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const saved = await apiUpload<CertificateFile>(
        `/api/admin/certificates/${certificate.id}/files`,
        formData
      );
      setFiles((prev) => [saved, ...prev]);
      onSaved();
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Failed to upload file");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  async function handleFileDelete(fileId: string) {
    if (!certificate) return;
    try {
      await apiSend(`/api/admin/certificates/${certificate.id}/files/${fileId}`, "DELETE");
      setFiles((prev) => prev.filter((f) => f.id !== fileId));
      onSaved();
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Failed to delete file");
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={certificate ? "Edit Certificate" : "Add Certificate"}
      maxWidth="max-w-2xl"
    >
      {error && (
        <div className="mb-4 rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-2.5 text-sm text-destructive">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
          <TextInput
            label="Certificate Number"
            required
            value={form.certificateNumber}
            onChange={(e) => setForm({ ...form, certificateNumber: e.target.value })}
            placeholder="XIPRA-2026-001"
          />
          <TextInput
            label="Student Name"
            required
            value={form.studentName}
            onChange={(e) => setForm({ ...form, studentName: e.target.value })}
          />
          <TextInput
            label="Course"
            required
            value={form.course}
            onChange={(e) => setForm({ ...form, course: e.target.value })}
          />
          <TextInput
            label="Duration"
            required
            value={form.duration}
            onChange={(e) => setForm({ ...form, duration: e.target.value })}
            placeholder="e.g. 3 months"
          />
          <TextInput
            label="Issue Date"
            required
            type="date"
            value={form.issueDate}
            onChange={(e) => setForm({ ...form, issueDate: e.target.value })}
          />
          <Select
            label="Status"
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value as FormState["status"] })}
          >
            <option value="ACTIVE">Active</option>
            <option value="REVOKED">Revoked</option>
            <option value="EXPIRED">Expired</option>
          </Select>
        </div>
        <TextArea
          label="Remarks"
          value={form.remarks}
          onChange={(e) => setForm({ ...form, remarks: e.target.value })}
          placeholder="Optional internal notes"
        />

        <div className="mb-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-foreground">Certificate Files (PDF)</span>
            {certificate && (
              <label className="inline-flex items-center gap-1.5 text-xs font-medium text-primary cursor-pointer hover:underline">
                <Upload className="w-3.5 h-3.5" />
                {uploading ? "Uploading..." : "Upload PDF"}
                <input
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  disabled={uploading}
                  onChange={handleFileUpload}
                />
              </label>
            )}
          </div>

          {!certificate ? (
            <p className="text-xs text-muted-foreground rounded-lg border border-dashed border-border px-3 py-3">
              Save the certificate first, then upload its PDF file.
            </p>
          ) : files.length === 0 ? (
            <p className="text-xs text-muted-foreground rounded-lg border border-dashed border-border px-3 py-3">
              No files uploaded yet.
            </p>
          ) : (
            <ul className="space-y-2">
              {files.map((file) => (
                <li
                  key={file.id}
                  className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm"
                >
                  <FileText className="w-4 h-4 text-muted-foreground shrink-0" />
                  <span className="truncate flex-1 text-foreground">{file.fileName}</span>
                  <span className="text-xs text-muted-foreground shrink-0">
                    {formatBytes(file.fileSize)}
                  </span>
                  <a
                    href={`/api/admin/certificates/${certificate?.id}/files/${file.id}/download`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-muted-foreground hover:text-primary shrink-0"
                    title="Preview"
                  >
                    <Eye className="w-4 h-4" />
                  </a>
                  <a
                    href={`/api/admin/certificates/${certificate?.id}/files/${file.id}/download?download=1`}
                    className="text-muted-foreground hover:text-primary shrink-0"
                    title="Download"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                  <button
                    type="button"
                    onClick={() => handleFileDelete(file.id)}
                    className="text-muted-foreground hover:text-destructive shrink-0"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Optional Student Photo */}
        {certificate && (
          <div className="mb-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-foreground">Student Passport Photo (optional)</span>
              {!hasStudentPhoto && (
                <label className="inline-flex items-center gap-1.5 text-xs font-medium text-primary cursor-pointer hover:underline">
                  <Upload className="w-3.5 h-3.5" />
                  {studentPhotoBusy ? "Uploading..." : "Upload Photo"}
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    disabled={studentPhotoBusy}
                    onChange={handleStudentPhotoUpload}
                  />
                </label>
              )}
            </div>
            {hasStudentPhoto ? (
              <div className="flex items-center gap-3 rounded-lg border border-border p-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`/api/admin/certificates/${certificate.id}/student-photo?v=${studentPhotoVersion}`}
                  alt="Student Passport"
                  className="h-20 w-auto rounded border border-border object-contain"
                />
                <button
                  type="button"
                  onClick={handleStudentPhotoDelete}
                  disabled={studentPhotoBusy}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-destructive hover:underline"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Remove photo
                </button>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground rounded-lg border border-dashed border-border px-3 py-3">
                JPG, PNG, or WEBP. Shown on the public verification page next to the student&apos;s name.
              </p>
            )}
          </div>
        )}

        {/* Optional Certificate Image */}
        {certificate && (
          <div className="mb-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-foreground">Certificate Image (optional)</span>
              {!hasImage && (
                <label className="inline-flex items-center gap-1.5 text-xs font-medium text-primary cursor-pointer hover:underline">
                  <Upload className="w-3.5 h-3.5" />
                  {imageBusy ? "Uploading..." : "Upload Image"}
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    disabled={imageBusy}
                    onChange={handleImageUpload}
                  />
                </label>
              )}
            </div>
            {hasImage ? (
              <div className="flex items-center gap-3 rounded-lg border border-border p-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`/api/admin/certificates/${certificate.id}/image?v=${imageVersion}`}
                  alt="Certificate"
                  className="h-20 w-auto rounded border border-border object-contain"
                />
                <button
                  type="button"
                  onClick={handleImageDelete}
                  disabled={imageBusy}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-destructive hover:underline"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Remove image
                </button>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground rounded-lg border border-dashed border-border px-3 py-3">
                JPG, PNG, or WEBP. Shown on the public verification page.
              </p>
            )}
          </div>
        )}

        {/* QR Code */}
        {certificate && (
          <div className="mb-5">
            <span className="text-sm font-medium text-foreground block mb-2">Verification QR Code</span>
            <div className="flex items-center gap-4 rounded-lg border border-border p-3">
              {qrPath ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={qrPath} alt="Certificate QR code" className="h-24 w-24 rounded bg-white p-1" />
              ) : (
                <div className="h-24 w-24 rounded bg-muted flex items-center justify-center text-muted-foreground">
                  <QrCode className="w-8 h-8" />
                </div>
              )}
              <div className="flex flex-col gap-2">
                <p className="text-xs text-muted-foreground max-w-xs">
                  Scanning this opens the verification page with this certificate&apos;s number pre-filled.
                </p>
                <div className="flex gap-2">
                  {qrPath && (
                    <a
                      href={`${qrPath}?download=1`}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium text-foreground hover:bg-muted transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" /> Download
                    </a>
                  )}
                  <button
                    type="button"
                    onClick={handleRegenerateQr}
                    disabled={regenerating}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium text-foreground hover:bg-muted transition-colors disabled:opacity-60"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${regenerating ? "animate-spin" : ""}`} />
                    {regenerating ? "Regenerating..." : "Regenerate"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? "Saving..." : certificate ? "Save Changes" : "Create Certificate"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
