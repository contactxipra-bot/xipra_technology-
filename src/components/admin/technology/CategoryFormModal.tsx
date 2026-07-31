"use client";

import { useEffect, useState, type FormEvent } from "react";
import Modal from "@/components/admin/Modal";
import { TextInput } from "@/components/admin/FormField";
import { Button } from "@/components/ui/button";
import { apiSend, ApiRequestError } from "@/lib/admin-api";
import type { TechnologyCategory } from "./types";

type FormState = { name: string; icon: string; order: number };
const EMPTY_FORM: FormState = { name: "", icon: "", order: 0 };

export default function CategoryFormModal({
  open,
  onClose,
  category,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  category: TechnologyCategory | null;
  onSaved: () => void;
}) {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setForm(
      category
        ? { name: category.name, icon: category.icon ?? "", order: category.order }
        : EMPTY_FORM
    );
    setError(null);
  }, [category, open]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const payload = {
        name: form.name,
        icon: form.icon || null,
        order: Number(form.order) || 0,
      };
      if (category) {
        await apiSend(`/api/admin/technology-categories/${category.id}`, "PUT", payload);
      } else {
        await apiSend("/api/admin/technology-categories", "POST", payload);
      }
      onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Failed to save category");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={category ? "Edit Category" : "Add Category"}
      maxWidth="max-w-sm"
    >
      {error && (
        <div className="mb-4 rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-2.5 text-sm text-destructive">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <TextInput
          label="Name"
          required
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="e.g. Frontend, Backend, DevOps"
        />
        <TextInput
          label="Icon"
          value={form.icon}
          onChange={(e) => setForm({ ...form, icon: e.target.value })}
          hint="Optional icon name or emoji"
        />
        <TextInput
          label="Display Order"
          type="number"
          value={form.order}
          onChange={(e) => setForm({ ...form, order: Number(e.target.value) })}
        />
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? "Saving..." : category ? "Save Changes" : "Create Category"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
