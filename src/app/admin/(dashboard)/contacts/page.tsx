"use client";

import { useState } from "react";
import { Eye, Trash2 } from "lucide-react";
import { useAdminList } from "@/hooks/useAdminList";
import { apiSend, ApiRequestError } from "@/lib/admin-api";
import DataTable, { type Column } from "@/components/admin/DataTable";
import Pagination from "@/components/admin/Pagination";
import StatusBadge from "@/components/admin/StatusBadge";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import { AlertBanner, ListToolbar } from "@/components/admin/PageHeader";
import ContactDetailModal from "@/components/admin/contacts/ContactDetailModal";
import type { ContactMessage } from "@/components/admin/contacts/types";

export default function ContactsPage() {
  const { items, meta, search, setSearch, setPage, loading, error, refresh } =
    useAdminList<ContactMessage>("/api/admin/contacts");

  const [viewing, setViewing] = useState<ContactMessage | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ContactMessage | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    setActionError(null);
    try {
      await apiSend(`/api/admin/contacts/${deleteTarget.id}`, "DELETE");
      setDeleteTarget(null);
      refresh();
    } catch (err) {
      setActionError(err instanceof ApiRequestError ? err.message : "Failed to delete");
    } finally {
      setDeleting(false);
    }
  }

  const columns: Column<ContactMessage>[] = [
    { header: "Name", accessor: (row) => <span className="font-medium">{row.name}</span> },
    { header: "Email", accessor: (row) => row.email },
    { header: "Subject", accessor: (row) => row.subject || "—" },
    { header: "Status", accessor: (row) => <StatusBadge status={row.status} /> },
    {
      header: "Received",
      accessor: (row) => new Date(row.createdAt).toLocaleDateString(),
    },
    {
      header: "",
      className: "text-right",
      accessor: (row) => (
        <div className="flex justify-end gap-1">
          <button
            onClick={() => setViewing(row)}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            title="View"
          >
            <Eye className="w-4 h-4" />
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
        <h1 className="text-2xl font-bold text-foreground">Contact Messages</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Messages submitted through the website contact form.
        </p>
      </div>

      {(error || actionError) && (
        <AlertBanner type="error" message={actionError || error || ""} />
      )}

      <ListToolbar
        search={search}
        onSearchChange={setSearch}
        placeholder="Search by name, email, or subject..."
      />

      <DataTable
        columns={columns}
        data={items}
        loading={loading}
        keyExtractor={(row) => row.id}
        emptyMessage="No messages yet."
      />
      <Pagination meta={meta} onPageChange={setPage} />

      <ContactDetailModal
        open={!!viewing}
        onClose={() => setViewing(null)}
        message={viewing}
        onUpdated={refresh}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Message"
        description={`Are you sure you want to delete the message from "${deleteTarget?.name}"? This action cannot be undone.`}
        loading={deleting}
        onConfirm={handleDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
}
