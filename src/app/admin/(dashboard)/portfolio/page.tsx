"use client";

import { useState } from "react";
import Image from "next/image";
import { Pencil, Trash2, ImageOff, Star } from "lucide-react";
import { useAdminList } from "@/hooks/useAdminList";
import { apiSend, ApiRequestError } from "@/lib/admin-api";
import DataTable, { type Column } from "@/components/admin/DataTable";
import Pagination from "@/components/admin/Pagination";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import { AlertBanner, ListToolbar } from "@/components/admin/PageHeader";
import PortfolioFormModal, {
  type PortfolioProject,
} from "@/components/admin/portfolio/PortfolioFormModal";
import { isValidImageSrc } from "@/lib/image-src";

export default function PortfolioPage() {
  const { items, meta, search, setSearch, setPage, loading, error, refresh } =
    useAdminList<PortfolioProject>("/api/admin/portfolio");

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<PortfolioProject | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<PortfolioProject | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(project: PortfolioProject) {
    setEditing(project);
    setFormOpen(true);
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    setActionError(null);
    try {
      await apiSend(`/api/admin/portfolio/${deleteTarget.id}`, "DELETE");
      setDeleteTarget(null);
      refresh();
    } catch (err) {
      setActionError(err instanceof ApiRequestError ? err.message : "Failed to delete");
    } finally {
      setDeleting(false);
    }
  }

  const columns: Column<PortfolioProject>[] = [
    {
      header: "",
      accessor: (row) => (
        <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-muted/40 border border-border">
          {isValidImageSrc(row.image) ? (
            <Image src={row.image} alt="" fill sizes="40px" className="object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              <ImageOff className="w-4 h-4" />
            </div>
          )}
        </div>
      ),
    },
    {
      header: "Title",
      accessor: (row) => (
        <span className="font-medium inline-flex items-center gap-1.5">
          {row.title}
          {row.isFeatured && <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />}
        </span>
      ),
    },
    { header: "Category", accessor: (row) => row.category },
    { header: "Client", accessor: (row) => row.client || "—" },
    {
      header: "Technologies",
      accessor: (row) => (
        <span className="text-xs text-muted-foreground">
          {row.technologies.length ? row.technologies.map((t) => t.name).join(", ") : "—"}
        </span>
      ),
    },
    {
      header: "",
      className: "text-right",
      accessor: (row) => (
        <div className="flex justify-end gap-1">
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
        <h1 className="text-2xl font-bold text-foreground">Portfolio</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage the projects showcased in the portfolio.
        </p>
      </div>

      {(error || actionError) && (
        <AlertBanner type="error" message={actionError || error || ""} />
      )}

      <ListToolbar
        search={search}
        onSearchChange={setSearch}
        placeholder="Search by title, category, or client..."
        addLabel="Add Project"
        onAdd={openCreate}
      />

      <DataTable
        columns={columns}
        data={items}
        loading={loading}
        keyExtractor={(row) => row.id}
        emptyMessage="No portfolio projects yet."
      />
      <Pagination meta={meta} onPageChange={setPage} />

      <PortfolioFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        project={editing}
        onSaved={refresh}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Project"
        description={`Are you sure you want to delete "${deleteTarget?.title}"? This action cannot be undone.`}
        loading={deleting}
        onConfirm={handleDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
}
