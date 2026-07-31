"use client";

import { useEffect, useState, type FormEvent } from "react";
import Modal from "@/components/admin/Modal";
import { TextInput, TextArea, Checkbox } from "@/components/admin/FormField";
import ImageUploadField from "@/components/admin/ImageUploadField";
import MultiImageUploadField from "@/components/admin/MultiImageUploadField";
import { Button } from "@/components/ui/button";
import { apiGet, apiSend, ApiRequestError } from "@/lib/admin-api";

export type PortfolioTechnology = { id: string; name: string };

export type PortfolioProject = {
  id: string;
  title: string;
  slug: string;
  category: string;
  client: string | null;
  description: string;
  image: string | null;
  images: string[] | null;
  projectUrl: string | null;
  isFeatured: boolean;
  order: number;
  technologies: PortfolioTechnology[];
};

type FormState = {
  title: string;
  category: string;
  client: string;
  description: string;
  image: string;
  images: string[];
  projectUrl: string;
  isFeatured: boolean;
  order: number;
  technologyIds: string[];
};

const EMPTY_FORM: FormState = {
  title: "",
  category: "",
  client: "",
  description: "",
  image: "",
  images: [],
  projectUrl: "",
  isFeatured: false,
  order: 0,
  technologyIds: [],
};

export default function PortfolioFormModal({
  open,
  onClose,
  project,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  project: PortfolioProject | null;
  onSaved: () => void;
}) {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [technologies, setTechnologies] = useState<PortfolioTechnology[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    apiGet<PortfolioTechnology[]>("/api/admin/technologies")
      .then(({ data }) => setTechnologies(data))
      .catch(() => setTechnologies([]));
  }, [open]);

  useEffect(() => {
    if (project) {
      setForm({
        title: project.title,
        category: project.category,
        client: project.client ?? "",
        description: project.description,
        image: project.image ?? "",
        images: project.images ?? [],
        projectUrl: project.projectUrl ?? "",
        isFeatured: project.isFeatured,
        order: project.order,
        technologyIds: project.technologies.map((t) => t.id),
      });
    } else {
      setForm(EMPTY_FORM);
    }
    setError(null);
  }, [project, open]);

  function toggleTechnology(id: string) {
    setForm((prev) => ({
      ...prev,
      technologyIds: prev.technologyIds.includes(id)
        ? prev.technologyIds.filter((t) => t !== id)
        : [...prev.technologyIds, id],
    }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const payload = {
        title: form.title,
        category: form.category,
        client: form.client || null,
        description: form.description,
        image: form.image || null,
        images: form.images,
        projectUrl: form.projectUrl || null,
        isFeatured: form.isFeatured,
        order: Number(form.order) || 0,
        technologyIds: form.technologyIds,
      };
      if (project) {
        await apiSend(`/api/admin/portfolio/${project.id}`, "PUT", payload);
      } else {
        await apiSend("/api/admin/portfolio", "POST", payload);
      }
      onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Failed to save project");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={project ? "Edit Project" : "Add Project"}
      maxWidth="max-w-xl"
    >
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
          subdir="portfolio"
        />
        <MultiImageUploadField
          label="Gallery Images"
          values={form.images}
          onChange={(images) => setForm({ ...form, images })}
          subdir="portfolio"
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
            required
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            placeholder="e.g. Website, Mobile App"
          />
          <TextInput
            label="Client"
            value={form.client}
            onChange={(e) => setForm({ ...form, client: e.target.value })}
          />
          <TextInput
            label="Project URL"
            type="url"
            value={form.projectUrl}
            onChange={(e) => setForm({ ...form, projectUrl: e.target.value })}
            placeholder="https://..."
          />
        </div>

        <TextArea
          label="Description"
          required
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />

        <div className="mb-4">
          <label className="block text-sm font-medium text-foreground mb-1.5">
            Technology Used
          </label>
          {technologies.length === 0 ? (
            <p className="text-xs text-muted-foreground">
              No technologies yet — add some in the Technology section first.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {technologies.map((tech) => {
                const active = form.technologyIds.includes(tech.id);
                return (
                  <button
                    key={tech.id}
                    type="button"
                    onClick={() => toggleTechnology(tech.id)}
                    className={
                      active
                        ? "rounded-full border border-primary bg-primary/10 text-primary px-3 py-1 text-xs font-medium"
                        : "rounded-full border border-border text-muted-foreground px-3 py-1 text-xs font-medium hover:bg-muted transition-colors"
                    }
                  >
                    {tech.name}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 items-start">
          <TextInput
            label="Display Order"
            type="number"
            value={form.order}
            onChange={(e) => setForm({ ...form, order: Number(e.target.value) })}
          />
          <Checkbox
            label="Featured"
            hint="Highlight this project"
            checked={form.isFeatured}
            onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })}
          />
        </div>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? "Saving..." : project ? "Save Changes" : "Create Project"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
