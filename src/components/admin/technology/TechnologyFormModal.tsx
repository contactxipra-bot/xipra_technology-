"use client";

import { useEffect, useState, type FormEvent } from "react";
import Modal from "@/components/admin/Modal";
import { TextInput, TextArea, Select } from "@/components/admin/FormField";
import { Button } from "@/components/ui/button";
import { apiSend, ApiRequestError } from "@/lib/admin-api";
import type { Technology, TechnologyCategory } from "./types";

type FormState = {
  name: string;
  icon: string;
  description: string;
  categoryId: string;
  order: number;
};

const emptyForm = (defaultCategoryId: string): FormState => ({
  name: "",
  icon: "",
  description: "",
  categoryId: defaultCategoryId,
  order: 0,
});

export default function TechnologyFormModal({
  open,
  onClose,
  technology,
  categories,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  technology: Technology | null;
  categories: TechnologyCategory[];
  onSaved: () => void;
}) {
  const [form, setForm] = useState<FormState>(emptyForm(categories[0]?.id ?? ""));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setForm(
      technology
        ? {
            name: technology.name,
            icon: technology.icon ?? "",
            description: technology.description ?? "",
            categoryId: technology.categoryId,
            order: technology.order,
          }
        : emptyForm(categories[0]?.id ?? "")
    );
    setError(null);
  }, [technology, categories, open]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!form.categoryId) {
      setError("Create a technology category first.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const payload = {
        name: form.name,
        icon: form.icon || null,
        description: form.description || null,
        categoryId: form.categoryId,
        order: Number(form.order) || 0,
      };
      if (technology) {
        await apiSend(`/api/admin/technologies/${technology.id}`, "PUT", payload);
      } else {
        await apiSend("/api/admin/technologies", "POST", payload);
      }
      onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Failed to save technology");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={technology ? "Edit Technology" : "Add Technology"}
      maxWidth="max-w-lg"
    >
      {error && (
        <div className="mb-4 rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-2.5 text-sm text-destructive">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
          <TextInput
            label="Name"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="e.g. React, Node.js"
          />
          <Select
            label="Category"
            required
            value={form.categoryId}
            onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
          >
            <option value="" disabled>
              Select category
            </option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
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
        </div>
        <TextArea
          label="Description"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          hint="Plain text for now — ready to be swapped for a rich text editor later."
        />
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? "Saving..." : technology ? "Save Changes" : "Create Technology"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
