"use client";

import { useState } from "react";
import Image from "next/image";
import { Pencil, Trash2, ImageOff } from "lucide-react";
import { useAdminList } from "@/hooks/useAdminList";
import { apiSend, ApiRequestError } from "@/lib/admin-api";
import { isValidImageSrc } from "@/lib/image-src";
import DataTable, { type Column } from "@/components/admin/DataTable";
import Pagination from "@/components/admin/Pagination";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import { AlertBanner, ListToolbar } from "@/components/admin/PageHeader";
import ProductFormModal, { type Product } from "@/components/admin/products/ProductFormModal";

export default function ProductsPage() {
  const { items, meta, search, setSearch, setPage, loading, error, refresh } =
    useAdminList<Product>("/api/admin/products");

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(product: Product) {
    setEditing(product);
    setFormOpen(true);
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    setActionError(null);
    try {
      await apiSend(`/api/admin/products/${deleteTarget.id}`, "DELETE");
      setDeleteTarget(null);
      refresh();
    } catch (err) {
      setActionError(err instanceof ApiRequestError ? err.message : "Failed to delete");
    } finally {
      setDeleting(false);
    }
  }

  const columns: Column<Product>[] = [
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
    { header: "Title", accessor: (row) => <span className="font-medium">{row.title}</span> },
    { header: "Category", accessor: (row) => row.category || "—" },
    {
      header: "Status",
      accessor: (row) => (
        <span
          className={
            row.isActive
              ? "inline-flex items-center rounded-full border border-green-500/20 bg-green-500/10 px-2.5 py-0.5 text-xs font-medium text-green-500"
              : "inline-flex items-center rounded-full border border-border bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground"
          }
        >
          {row.isActive ? "Active" : "Hidden"}
        </span>
      ),
    },
    { header: "Order", accessor: (row) => row.order },
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
        <h1 className="text-2xl font-bold text-foreground">Products</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage the products showcased on the public site.
        </p>
      </div>

      {(error || actionError) && (
        <AlertBanner type="error" message={actionError || error || ""} />
      )}

      <ListToolbar
        search={search}
        onSearchChange={setSearch}
        placeholder="Search by title or category..."
        addLabel="Add Product"
        onAdd={openCreate}
      />

      <DataTable
        columns={columns}
        data={items}
        loading={loading}
        keyExtractor={(row) => row.id}
        emptyMessage="No products yet."
      />
      <Pagination meta={meta} onPageChange={setPage} />

      <ProductFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        product={editing}
        onSaved={refresh}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Product"
        description={`Are you sure you want to delete "${deleteTarget?.title}"? This action cannot be undone.`}
        loading={deleting}
        onConfirm={handleDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
}
