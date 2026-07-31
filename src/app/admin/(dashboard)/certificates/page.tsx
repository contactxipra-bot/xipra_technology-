"use client";

import { useState } from "react";
import { Pencil, Trash2, FileText, Mail } from "lucide-react";
import { useAdminList } from "@/hooks/useAdminList";
import { apiSend, ApiRequestError } from "@/lib/admin-api";
import DataTable, { type Column } from "@/components/admin/DataTable";
import Pagination from "@/components/admin/Pagination";
import StatusBadge from "@/components/admin/StatusBadge";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import { AlertBanner, ListToolbar } from "@/components/admin/PageHeader";
import CertificateFormModal, {
  type Certificate,
} from "@/components/admin/certificates/CertificateFormModal";
import SendEmailModal from "@/components/admin/certificates/SendEmailModal";

export default function CertificatesPage() {
  const { items, meta, search, setSearch, setPage, loading, error, refresh } =
    useAdminList<Certificate>("/api/admin/certificates");

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Certificate | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Certificate | null>(null);
  const [emailTarget, setEmailTarget] = useState<Certificate | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(cert: Certificate) {
    setEditing(cert);
    setFormOpen(true);
  }

  function handleSaved() {
    refresh();
    setSuccessMsg(editing ? "Certificate updated" : "Certificate created");
    setTimeout(() => setSuccessMsg(null), 3000);
  }

  function handleEmailSent() {
    setSuccessMsg("Certificate email sent successfully!");
    setTimeout(() => setSuccessMsg(null), 3000);
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    setActionError(null);
    try {
      await apiSend(`/api/admin/certificates/${deleteTarget.id}`, "DELETE");
      setDeleteTarget(null);
      refresh();
    } catch (err) {
      setActionError(err instanceof ApiRequestError ? err.message : "Failed to delete");
    } finally {
      setDeleting(false);
    }
  }

  const columns: Column<Certificate>[] = [
    {
      header: "Certificate #",
      accessor: (row) => <span className="font-medium">{row.certificateNumber}</span>,
    },
    { header: "Student", accessor: (row) => row.studentName },
    { header: "Course", accessor: (row) => row.course },
    { header: "Duration", accessor: (row) => row.duration },
    {
      header: "Issue Date",
      accessor: (row) => new Date(row.issueDate).toLocaleDateString(),
    },
    { header: "Status", accessor: (row) => <StatusBadge status={row.status} /> },
    {
      header: "Files",
      accessor: (row) => (
        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
          <FileText className="w-3.5 h-3.5" /> {row.files.length}
        </span>
      ),
    },
    {
      header: "",
      className: "text-right",
      accessor: (row) => (
        <div className="flex justify-end gap-1">
          <button
            onClick={() => setEmailTarget(row)}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-blue-500/10 hover:text-blue-500 transition-colors"
            title="Send Email"
          >
            <Mail className="w-4 h-4" />
          </button>
          <button
            onClick={() => openEdit(row)}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            title="Edit"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            onClick={() => setDeleteTarget(row)}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Certificates</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Issue, manage, and search student certificates.
        </p>
      </div>

      {successMsg && <AlertBanner type="success" message={successMsg} />}
      {(error || actionError) && (
        <AlertBanner type="error" message={actionError || error || ""} />
      )}

      <ListToolbar
        search={search}
        onSearchChange={setSearch}
        placeholder="Search by student, certificate #, or course..."
        addLabel="Add Certificate"
        onAdd={openCreate}
      />

      <DataTable
        columns={columns}
        data={items}
        loading={loading}
        keyExtractor={(row) => row.id}
        emptyMessage="No certificates yet."
      />
      <Pagination meta={meta} onPageChange={setPage} />

      <CertificateFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        certificate={editing}
        onSaved={handleSaved}
      />

      <SendEmailModal 
        open={!!emailTarget}
        onClose={() => setEmailTarget(null)}
        certificate={emailTarget}
        onSent={handleEmailSent}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Certificate"
        description={`Are you sure you want to delete certificate "${deleteTarget?.certificateNumber}"? This will also remove its uploaded files. This action cannot be undone.`}
        loading={deleting}
        onConfirm={handleDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
}
