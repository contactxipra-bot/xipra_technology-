"use client";

import { useEffect, useState, type FormEvent } from "react";
import Modal from "@/components/admin/Modal";
import { TextInput, TextArea, Checkbox } from "@/components/admin/FormField";
import ImageUploadField from "@/components/admin/ImageUploadField";
import MultiImageUploadField from "@/components/admin/MultiImageUploadField";
import { Button } from "@/components/ui/button";
import { apiSend, ApiRequestError } from "@/lib/admin-api";

export type Product = {
  id: string;
  title: string;
  slug: string;
  category: string | null;
  description: string;
  image: string | null;
  images: string[] | null;
  demoUrl: string | null;
  features: string[] | null;
  isActive: boolean;
  order: number;
};

type FormState = {
  title: string;
  category: string;
  description: string;
  image: string;
  images: string[];
  demoUrl: string;
  featuresText: string;
  isActive: boolean;
  order: number;
};

const EMPTY_FORM: FormState = {
  title: "",
  category: "",
  description: "",
  image: "",
  images: [],
  demoUrl: "",
  featuresText: "",
  isActive: true,
  order: 0,
};

export default function ProductFormModal({
  open,
  onClose,
  product,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  product: Product | null;
  onSaved: () => void;
}) {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (product) {
      setForm({
        title: product.title,
        category: product.category ?? "",
        description: product.description,
        image: product.image ?? "",
        images: product.images ?? [],
        demoUrl: product.demoUrl ?? "",
        featuresText: (product.features ?? []).join("\n"),
        isActive: product.isActive,
        order: product.order,
      });
    } else {
      setForm(EMPTY_FORM);
    }
    setError(null);
  }, [product, open]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const payload = {
        title: form.title,
        category: form.category || null,
        description: form.description,
        image: form.image || null,
        images: form.images,
        demoUrl: form.demoUrl || null,
        features: form.featuresText
          .split("\n")
          .map((f) => f.trim())
          .filter(Boolean),
        isActive: form.isActive,
        order: Number(form.order) || 0,
      };
      if (product) {
        await apiSend(`/api/admin/products/${product.id}`, "PUT", payload);
      } else {
        await apiSend("/api/admin/products", "POST", payload);
      }
      onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Failed to save product");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={product ? "Edit Product" : "Add Product"} maxWidth="max-w-xl">
      {error && (
        <div className="mb-4 rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-2.5 text-sm text-destructive">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <ImageUploadField
          label="Cover Image"
          value={form.image}
          onChange={(path) => setForm({ ...form, image: path })}
          subdir="products"
        />

        <MultiImageUploadField
          label="Product Gallery (Max 15 Images for Preview)"
          values={form.images}
          onChange={(newImages) => {
            if (newImages.length <= 15) {
              setForm({ ...form, images: newImages });
            } else {
              setError("Maximum 15 images allowed.");
            }
          }}
          subdir="products"
        />

        <TextInput
          label="Demo URL"
          value={form.demoUrl}
          onChange={(e) => setForm({ ...form, demoUrl: e.target.value })}
          placeholder="https://example.com"
          hint="If provided, this URL will be opened in a preview modal when 'View Demo' is clicked."
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
          <TextInput
            label="Title"
            required
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
          <TextInput
            label="Category"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            placeholder="e.g. SaaS, ERP"
          />
        </div>

        <TextArea
          label="Description"
          required
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />

        <TextArea
          label="Features"
          value={form.featuresText}
          onChange={(e) => setForm({ ...form, featuresText: e.target.value })}
          hint="One feature per line"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 items-start">
          <TextInput
            label="Display Order"
            type="number"
            value={form.order}
            onChange={(e) => setForm({ ...form, order: Number(e.target.value) })}
          />
          <Checkbox
            label="Active"
            hint="Visible on the public site"
            checked={form.isActive}
            onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
          />
        </div>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? "Saving..." : product ? "Save Changes" : "Create Product"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
