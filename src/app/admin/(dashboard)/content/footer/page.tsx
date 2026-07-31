"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { ArrowLeft, Plus, Trash2, Save, ExternalLink } from "lucide-react";
import { apiGet, apiSend, ApiRequestError } from "@/lib/admin-api";
import { TextInput, TextArea } from "@/components/admin/FormField";
import { AlertBanner } from "@/components/admin/PageHeader";
import { Button } from "@/components/ui/button";
import type { FooterContent } from "@/lib/content/types";

export default function FooterContentEditor() {
  const [content, setContent] = useState<FooterContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    apiGet<FooterContent>("/api/admin/content/footer")
      .then(({ data }) => setContent(data))
      .catch((err) => setError(err instanceof ApiRequestError ? err.message : "Failed to load"))
      .finally(() => setLoading(false));
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!content) return;
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      await apiSend("/api/admin/content/footer", "PUT", content);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="text-sm text-muted-foreground">Loading content...</p>;
  if (!content) return <AlertBanner type="error" message={error || "Failed to load content"} />;

  function updateColumnTitle(colIdx: number, title: string) {
    if (!content) return;
    const columns = [...content.columns];
    columns[colIdx] = { ...columns[colIdx], title };
    setContent({ ...content, columns });
  }

  function updateLink(colIdx: number, linkIdx: number, field: "name" | "href", value: string) {
    if (!content) return;
    const columns = [...content.columns];
    const links = [...columns[colIdx].links];
    links[linkIdx] = { ...links[linkIdx], [field]: value };
    columns[colIdx] = { ...columns[colIdx], links };
    setContent({ ...content, columns });
  }

  function addLink(colIdx: number) {
    if (!content) return;
    const columns = [...content.columns];
    columns[colIdx] = { ...columns[colIdx], links: [...columns[colIdx].links, { name: "", href: "#" }] };
    setContent({ ...content, columns });
  }

  function removeLink(colIdx: number, linkIdx: number) {
    if (!content) return;
    const columns = [...content.columns];
    columns[colIdx] = { ...columns[colIdx], links: columns[colIdx].links.filter((_, i) => i !== linkIdx) };
    setContent({ ...content, columns });
  }

  function addColumn() {
    if (!content) return;
    setContent({ ...content, columns: [...content.columns, { title: "New Column", links: [] }] });
  }

  function removeColumn(colIdx: number) {
    if (!content) return;
    setContent({ ...content, columns: content.columns.filter((_, i) => i !== colIdx) });
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
        <div>
          <Link href="/admin/content" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-1">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Pages
          </Link>
          <h1 className="text-2xl font-bold text-foreground">Footer Content</h1>
        </div>
        <Link href="/" target="_blank" className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors">
          <ExternalLink className="w-4 h-4" /> View site
        </Link>
      </div>

      {success && <AlertBanner type="success" message="Footer content saved" />}
      {error && <AlertBanner type="error" message={error} />}
      <p className="text-sm text-muted-foreground mb-4 -mt-2">
        Phone numbers, emails, addresses, and social links live under{" "}
        <Link href="/admin/settings" className="text-primary hover:underline">Site Settings</Link> so they stay
        consistent everywhere they appear.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
        <section className="glass-panel rounded-2xl p-5">
          <h2 className="text-sm font-semibold text-foreground mb-4">Brand</h2>
          <TextArea
            label="Tagline"
            value={content.description}
            onChange={(e) => setContent({ ...content, description: e.target.value })}
            hint="Short paragraph shown under the logo."
          />
          <TextInput
            label="Copyright Text"
            value={content.copyrightText}
            onChange={(e) => setContent({ ...content, copyrightText: e.target.value })}
            hint="Use {year} and {company} as placeholders."
          />
          <TextInput
            label="Newsletter Text"
            value={content.newsletterText}
            onChange={(e) => setContent({ ...content, newsletterText: e.target.value })}
            hint="Reserved for a future newsletter signup — not yet displayed."
          />
        </section>

        <section className="glass-panel rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-foreground">Footer Columns</h2>
            <button type="button" onClick={addColumn} className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline">
              <Plus className="w-3.5 h-3.5" /> Add column
            </button>
          </div>
          <div className="space-y-5">
            {content.columns.map((col, colIdx) => (
              <div key={colIdx} className="rounded-lg border border-border p-3">
                <div className="flex items-center gap-2 mb-3">
                  <input
                    value={col.title}
                    onChange={(e) => updateColumnTitle(colIdx, e.target.value)}
                    className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm font-semibold text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                  <button type="button" onClick={() => removeColumn(colIdx)} className="rounded-lg p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-2">
                  {col.links.map((link, linkIdx) => (
                    <div key={linkIdx} className="flex items-center gap-2">
                      <input
                        value={link.name}
                        onChange={(e) => updateLink(colIdx, linkIdx, "name", e.target.value)}
                        placeholder="Link text"
                        className="flex-1 rounded-lg border border-border bg-background px-3 py-1.5 text-xs text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                      />
                      <input
                        value={link.href}
                        onChange={(e) => updateLink(colIdx, linkIdx, "href", e.target.value)}
                        placeholder="/path or #"
                        className="w-32 rounded-lg border border-border bg-background px-3 py-1.5 text-xs text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                      />
                      <button type="button" onClick={() => removeLink(colIdx, linkIdx)} className="text-muted-foreground hover:text-destructive shrink-0">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => addLink(colIdx)}
                  className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
                >
                  <Plus className="w-3.5 h-3.5" /> Add link
                </button>
              </div>
            ))}
          </div>
        </section>

        <div className="flex justify-end">
          <Button type="submit" disabled={saving}>
            <Save className="w-4 h-4" />
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  );
}
