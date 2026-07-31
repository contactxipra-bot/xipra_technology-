"use client";

import { useState } from "react";
import { Eye, Trash2, Download } from "lucide-react";
import { useAdminList } from "@/hooks/useAdminList";
import { apiSend, ApiRequestError } from "@/lib/admin-api";
import DataTable, { type Column } from "@/components/admin/DataTable";
import Pagination from "@/components/admin/Pagination";
import StatusBadge from "@/components/admin/StatusBadge";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import { AlertBanner, ListToolbar } from "@/components/admin/PageHeader";
import { Button } from "@/components/ui/button";
import InternshipDetailModal from "@/components/admin/internships/InternshipDetailModal";
import type { InternshipApplication } from "@/components/admin/internships/types";

export default function InternshipsPage() {
  const { items, meta, search, setSearch, setPage, loading, error, refresh } =
    useAdminList<InternshipApplication>("/api/admin/internships");

  const [viewing, setViewing] = useState<InternshipApplication | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<InternshipApplication | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    setActionError(null);
    try {
      await apiSend(`/api/admin/internships/${deleteTarget.id}`, "DELETE");
      setDeleteTarget(null);
      refresh();
    } catch (err) {
      setActionError(err instanceof ApiRequestError ? err.message : "Failed to delete");
    } finally {
      setDeleting(false);
    }
  }

  const columns: Column<InternshipApplication>[] = [
    { header: "Name", accessor: (row) => <span className="font-medium">{row.fullName}</span> },
    { header: "Email", accessor: (row) => row.email },
    { header: "Domain", accessor: (row) => row.domain },
    { header: "Status", accessor: (row) => <StatusBadge status={row.status} /> },
    {
      header: "Applied",
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
        <h1 className="text-2xl font-bold text-foreground">Internship Applications</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Review and manage internship applications.
        </p>
      </div>

      {(error || actionError) && (
        <AlertBanner type="error" message={actionError || error || ""} />
      )}

      <ListToolbar
        search={search}
        onSearchChange={setSearch}
        placeholder="Search by name, email, or domain..."
        extra={
          // eslint-disable-next-line @next/next/no-html-link-for-pages -- this links to a file-download API route, not a page
          <Button variant="outline" render={<a href="/api/admin/internships/export" />}>
            <Download className="w-4 h-4" /> Export CSV
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={items}
        loading={loading}
        keyExtractor={(row) => row.id}
        emptyMessage="No applications yet."
      />
      <Pagination meta={meta} onPageChange={setPage} />

      <InternshipDetailModal
        open={!!viewing}
        onClose={() => setViewing(null)}
        application={viewing}
        onUpdated={refresh}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Application"
        description={`Are you sure you want to delete the application from "${deleteTarget?.fullName}"? This action cannot be undone.`}
        loading={deleting}
        onConfirm={handleDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
}
