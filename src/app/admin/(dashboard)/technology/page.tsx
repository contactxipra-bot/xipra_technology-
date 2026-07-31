"use client";

import { useEffect, useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { apiGet, apiSend, ApiRequestError } from "@/lib/admin-api";
import DataTable, { type Column } from "@/components/admin/DataTable";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import { AlertBanner, ListToolbar } from "@/components/admin/PageHeader";
import { cn } from "@/lib/utils";
import CategoryFormModal from "@/components/admin/technology/CategoryFormModal";
import TechnologyFormModal from "@/components/admin/technology/TechnologyFormModal";
import type { TechnologyCategory, Technology } from "@/components/admin/technology/types";

type Tab = "categories" | "technologies";

export default function TechnologyPage() {
  const [tab, setTab] = useState<Tab>("categories");

  const [categories, setCategories] = useState<TechnologyCategory[]>([]);
  const [technologies, setTechnologies] = useState<Technology[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const [categoryFormOpen, setCategoryFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<TechnologyCategory | null>(null);
  const [deleteCategoryTarget, setDeleteCategoryTarget] = useState<TechnologyCategory | null>(null);

  const [technologyFormOpen, setTechnologyFormOpen] = useState(false);
  const [editingTechnology, setEditingTechnology] = useState<Technology | null>(null);
  const [deleteTechnologyTarget, setDeleteTechnologyTarget] = useState<Technology | null>(null);

  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  async function loadAll() {
    setLoading(true);
    setError(null);
    try {
      const [{ data: cats }, { data: techs }] = await Promise.all([
        apiGet<TechnologyCategory[]>("/api/admin/technology-categories"),
        apiGet<Technology[]>("/api/admin/technologies"),
      ]);
      setCategories(cats);
      setTechnologies(techs);
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
  }, []);

  const filteredCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );
  const filteredTechnologies = technologies.filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.category.name.toLowerCase().includes(search.toLowerCase())
  );

  async function handleDeleteCategory() {
    if (!deleteCategoryTarget) return;
    setBusy(true);
    setActionError(null);
    try {
      await apiSend(`/api/admin/technology-categories/${deleteCategoryTarget.id}`, "DELETE");
      setDeleteCategoryTarget(null);
      loadAll();
    } catch (err) {
      setActionError(err instanceof ApiRequestError ? err.message : "Failed to delete category");
    } finally {
      setBusy(false);
    }
  }

  async function handleDeleteTechnology() {
    if (!deleteTechnologyTarget) return;
    setBusy(true);
    setActionError(null);
    try {
      await apiSend(`/api/admin/technologies/${deleteTechnologyTarget.id}`, "DELETE");
      setDeleteTechnologyTarget(null);
      loadAll();
    } catch (err) {
      setActionError(err instanceof ApiRequestError ? err.message : "Failed to delete technology");
    } finally {
      setBusy(false);
    }
  }

  const categoryColumns: Column<TechnologyCategory>[] = [
    { header: "Name", accessor: (row) => <span className="font-medium">{row.name}</span> },
    { header: "Icon", accessor: (row) => row.icon || "—" },
    { header: "Technologies", accessor: (row) => row.technologies.length },
    { header: "Order", accessor: (row) => row.order },
    {
      header: "",
      className: "text-right",
      accessor: (row) => (
        <div className="flex justify-end gap-1">
          <button
            onClick={() => {
              setEditingCategory(row);
              setCategoryFormOpen(true);
            }}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            onClick={() => setDeleteCategoryTarget(row)}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  const technologyColumns: Column<Technology>[] = [
    { header: "Name", accessor: (row) => <span className="font-medium">{row.name}</span> },
    { header: "Category", accessor: (row) => row.category.name },
    { header: "Icon", accessor: (row) => row.icon || "—" },
    { header: "Order", accessor: (row) => row.order },
    {
      header: "",
      className: "text-right",
      accessor: (row) => (
        <div className="flex justify-end gap-1">
          <button
            onClick={() => {
              setEditingTechnology(row);
              setTechnologyFormOpen(true);
            }}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            onClick={() => setDeleteTechnologyTarget(row)}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
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
        <h1 className="text-2xl font-bold text-foreground">Technology</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage technology categories and the individual technologies within them.
        </p>
      </div>

      {(error || actionError) && (
        <AlertBanner type="error" message={actionError || error || ""} />
      )}

      <div className="inline-flex rounded-lg border border-border p-1 mb-4 bg-muted/30">
        {(["categories", "technologies"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "px-4 py-1.5 rounded-md text-sm font-medium capitalize transition-colors",
              tab === t ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "categories" ? (
        <>
          <ListToolbar
            search={search}
            onSearchChange={setSearch}
            placeholder="Search categories..."
            addLabel="Add Category"
            onAdd={() => {
              setEditingCategory(null);
              setCategoryFormOpen(true);
            }}
          />
          <DataTable
            columns={categoryColumns}
            data={filteredCategories}
            loading={loading}
            keyExtractor={(row) => row.id}
            emptyMessage="No categories yet."
          />
        </>
      ) : (
        <>
          <ListToolbar
            search={search}
            onSearchChange={setSearch}
            placeholder="Search technologies..."
            addLabel="Add Technology"
            onAdd={() => {
              setEditingTechnology(null);
              setTechnologyFormOpen(true);
            }}
          />
          <DataTable
            columns={technologyColumns}
            data={filteredTechnologies}
            loading={loading}
            keyExtractor={(row) => row.id}
            emptyMessage="No technologies yet."
          />
        </>
      )}

      <CategoryFormModal
        open={categoryFormOpen}
        onClose={() => setCategoryFormOpen(false)}
        category={editingCategory}
        onSaved={loadAll}
      />
      <TechnologyFormModal
        open={technologyFormOpen}
        onClose={() => setTechnologyFormOpen(false)}
        technology={editingTechnology}
        categories={categories}
        onSaved={loadAll}
      />

      <ConfirmDialog
        open={!!deleteCategoryTarget}
        title="Delete Category"
        description={`Are you sure you want to delete "${deleteCategoryTarget?.name}"? Technologies in this category will also be removed.`}
        loading={busy}
        onConfirm={handleDeleteCategory}
        onClose={() => setDeleteCategoryTarget(null)}
      />
      <ConfirmDialog
        open={!!deleteTechnologyTarget}
        title="Delete Technology"
        description={`Are you sure you want to delete "${deleteTechnologyTarget?.name}"?`}
        loading={busy}
        onConfirm={handleDeleteTechnology}
        onClose={() => setDeleteTechnologyTarget(null)}
      />
    </div>
  );
}
