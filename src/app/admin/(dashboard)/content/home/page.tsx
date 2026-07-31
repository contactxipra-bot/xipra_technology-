"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { ArrowLeft, Plus, Trash2, Save, ExternalLink } from "lucide-react";
import { apiGet, apiSend, ApiRequestError } from "@/lib/admin-api";
import { TextInput, TextArea } from "@/components/admin/FormField";
import ImageUploadField from "@/components/admin/ImageUploadField";
import MultiImageUploadField from "@/components/admin/MultiImageUploadField";
import { AlertBanner } from "@/components/admin/PageHeader";
import { Button } from "@/components/ui/button";
import type { HomeContent } from "@/lib/content/types";

function CardListEditor({
  items,
  onChange,
  addLabel = "Add card",
}: {
  items: { title: string; desc: string }[];
  onChange: (items: { title: string; desc: string }[]) => void;
  addLabel?: string;
}) {
  return (
    <div>
      <div className="flex justify-end mb-2">
        <button
          type="button"
          onClick={() => onChange([...items, { title: "", desc: "" }])}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
        >
          <Plus className="w-3.5 h-3.5" /> {addLabel}
        </button>
      </div>
      <div className="space-y-3">
        {items.map((item, idx) => (
          <div key={idx} className="rounded-lg border border-border p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-muted-foreground">Card {idx + 1}</span>
              <button
                type="button"
                onClick={() => onChange(items.filter((_, i) => i !== idx))}
                className="text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <TextInput
              label="Title"
              value={item.title}
              onChange={(e) => {
                const next = [...items];
                next[idx] = { ...next[idx], title: e.target.value };
                onChange(next);
              }}
            />
            <TextArea
              label="Description"
              value={item.desc}
              onChange={(e) => {
                const next = [...items];
                next[idx] = { ...next[idx], desc: e.target.value };
                onChange(next);
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function StringListEditor({
  values,
  onChange,
  addLabel = "Add item",
}: {
  values: string[];
  onChange: (values: string[]) => void;
  addLabel?: string;
}) {
  return (
    <div>
      <div className="space-y-2 mb-2">
        {values.map((v, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <input
              value={v}
              onChange={(e) => {
                const next = [...values];
                next[idx] = e.target.value;
                onChange(next);
              }}
              className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
            <button
              type="button"
              onClick={() => onChange(values.filter((_, i) => i !== idx))}
              className="rounded-lg p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={() => onChange([...values, ""])}
        className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
      >
        <Plus className="w-3.5 h-3.5" /> {addLabel}
      </button>
    </div>
  );
}

export default function HomeContentEditor() {
  const [content, setContent] = useState<HomeContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    apiGet<HomeContent>("/api/admin/content/home")
      .then(({ data }) => setContent(data))
      .catch((err) => setError(err instanceof ApiRequestError ? err.message : "Failed to load"))
      .finally(() => setLoading(false));
  }, []);

  function patchHero(patch: Partial<HomeContent["hero"]>) {
    setContent((c) => (c ? { ...c, hero: { ...c.hero, ...patch } } : c));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!content) return;
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      await apiSend("/api/admin/content/home", "PUT", content);
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

  const patch = <K extends keyof HomeContent>(key: K, value: HomeContent[K]) =>
    setContent({ ...content, [key]: value });

  return (
    <div>
      <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
        <div>
          <Link href="/admin/content" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-1">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Pages
          </Link>
          <h1 className="text-2xl font-bold text-foreground">Home Page Content</h1>
        </div>
        <Link href="/" target="_blank" className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors">
          <ExternalLink className="w-4 h-4" /> View page
        </Link>
      </div>

      {success && <AlertBanner type="success" message="Home page content saved" />}
      {error && <AlertBanner type="error" message={error} />}

      <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
        {/* Hero */}
        <section className="glass-panel rounded-2xl p-5">
          <h2 className="text-sm font-semibold text-foreground mb-4">Hero Section</h2>
          <div className="mb-4">
            <MultiImageUploadField
              label="Background Slider Images (Microsoft Layout)"
              values={content.hero.backgroundImages || []}
              onChange={(images) => patchHero({ backgroundImages: images })}
              subdir="content"
            />
          </div>
          <TextInput label="Badge Text" value={content.hero.badge} onChange={(e) => patchHero({ badge: e.target.value })} />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-4">
            <TextInput label="Title (before)" value={content.hero.titlePrefix} onChange={(e) => patchHero({ titlePrefix: e.target.value })} />
            <TextInput label="Title (highlighted)" value={content.hero.titleHighlight} onChange={(e) => patchHero({ titleHighlight: e.target.value })} />
            <TextInput label="Title (after)" value={content.hero.titleSuffix} onChange={(e) => patchHero({ titleSuffix: e.target.value })} />
          </div>
          <TextArea label="Description" value={content.hero.description} onChange={(e) => patchHero({ description: e.target.value })} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
            <TextInput label="Primary Button Label" value={content.hero.primaryCta.label} onChange={(e) => patchHero({ primaryCta: { ...content.hero.primaryCta, label: e.target.value } })} />
            <TextInput label="Primary Button Link" value={content.hero.primaryCta.href} onChange={(e) => patchHero({ primaryCta: { ...content.hero.primaryCta, href: e.target.value } })} />
            <TextInput label="Secondary Button Label" value={content.hero.secondaryCta.label} onChange={(e) => patchHero({ secondaryCta: { ...content.hero.secondaryCta, label: e.target.value } })} />
            <TextInput label="Secondary Button Link" value={content.hero.secondaryCta.href} onChange={(e) => patchHero({ secondaryCta: { ...content.hero.secondaryCta, href: e.target.value } })} />
          </div>
        </section>

        {/* Statistics */}
        <section className="glass-panel rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-foreground">Statistics</h2>
            <button
              type="button"
              onClick={() => patch("stats", [...content.stats, { value: 0, label: "" }])}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
            >
              <Plus className="w-3.5 h-3.5" /> Add stat
            </button>
          </div>
          <div className="space-y-3">
            {content.stats.map((stat, idx) => (
              <div key={idx} className="flex items-end gap-3">
                <div className="w-28">
                  <TextInput
                    label="Value"
                    type="number"
                    value={stat.value}
                    onChange={(e) => {
                      const stats = [...content.stats];
                      stats[idx] = { ...stats[idx], value: Number(e.target.value) };
                      patch("stats", stats);
                    }}
                  />
                </div>
                <div className="flex-1">
                  <TextInput
                    label="Label"
                    value={stat.label}
                    onChange={(e) => {
                      const stats = [...content.stats];
                      stats[idx] = { ...stats[idx], label: e.target.value };
                      patch("stats", stats);
                    }}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => patch("stats", content.stats.filter((_, i) => i !== idx))}
                  className="mb-4 rounded-lg p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Services */}
        <section className="glass-panel rounded-2xl p-5">
          <h2 className="text-sm font-semibold text-foreground mb-4">Services Section</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
            <TextInput label="Heading (before)" value={content.services.heading} onChange={(e) => patch("services", { ...content.services, heading: e.target.value })} />
            <TextInput label="Heading (highlighted)" value={content.services.headingHighlight} onChange={(e) => patch("services", { ...content.services, headingHighlight: e.target.value })} />
          </div>
          <TextArea label="Subtitle" value={content.services.subtitle} onChange={(e) => patch("services", { ...content.services, subtitle: e.target.value })} />
          <label className="block text-sm font-medium text-foreground mb-1.5">Service Cards</label>
          <CardListEditor items={content.services.items} onChange={(items) => patch("services", { ...content.services, items })} addLabel="Add service" />
        </section>

        {/* Why Choose Us */}
        <section className="glass-panel rounded-2xl p-5">
          <h2 className="text-sm font-semibold text-foreground mb-4">Why Choose Us Section</h2>
          <TextInput label="Eyebrow" value={content.whyChooseUs.eyebrow} onChange={(e) => patch("whyChooseUs", { ...content.whyChooseUs, eyebrow: e.target.value })} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
            <TextInput label="Heading (before)" value={content.whyChooseUs.heading} onChange={(e) => patch("whyChooseUs", { ...content.whyChooseUs, heading: e.target.value })} />
            <TextInput label="Heading (highlighted)" value={content.whyChooseUs.headingHighlight} onChange={(e) => patch("whyChooseUs", { ...content.whyChooseUs, headingHighlight: e.target.value })} />
          </div>
          <TextArea label="Description" value={content.whyChooseUs.description} onChange={(e) => patch("whyChooseUs", { ...content.whyChooseUs, description: e.target.value })} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
            <TextInput label="Button Label" value={content.whyChooseUs.buttonLabel} onChange={(e) => patch("whyChooseUs", { ...content.whyChooseUs, buttonLabel: e.target.value })} />
            <TextInput label="Button Link" value={content.whyChooseUs.buttonHref} onChange={(e) => patch("whyChooseUs", { ...content.whyChooseUs, buttonHref: e.target.value })} />
          </div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Feature Cards</label>
          <CardListEditor items={content.whyChooseUs.items} onChange={(items) => patch("whyChooseUs", { ...content.whyChooseUs, items })} addLabel="Add feature" />
        </section>

        {/* Technology Preview */}
        <section className="glass-panel rounded-2xl p-5">
          <h2 className="text-sm font-semibold text-foreground mb-4">Technology Preview Section</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
            <TextInput label="Heading (before)" value={content.technologyPreview.heading} onChange={(e) => patch("technologyPreview", { ...content.technologyPreview, heading: e.target.value })} />
            <TextInput label="Heading (highlighted)" value={content.technologyPreview.headingHighlight} onChange={(e) => patch("technologyPreview", { ...content.technologyPreview, headingHighlight: e.target.value })} />
          </div>
          <TextArea label="Subtitle" value={content.technologyPreview.subtitle} onChange={(e) => patch("technologyPreview", { ...content.technologyPreview, subtitle: e.target.value })} />
          <p className="text-xs text-muted-foreground">
            The technologies shown here are pulled live from the Technology page — manage them there.
          </p>
        </section>

        {/* Products Preview */}
        <section className="glass-panel rounded-2xl p-5">
          <h2 className="text-sm font-semibold text-foreground mb-4">Products Preview Section</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
            <TextInput label="Heading (before)" value={content.productsPreview.heading} onChange={(e) => patch("productsPreview", { ...content.productsPreview, heading: e.target.value })} />
            <TextInput label="Heading (highlighted)" value={content.productsPreview.headingHighlight} onChange={(e) => patch("productsPreview", { ...content.productsPreview, headingHighlight: e.target.value })} />
          </div>
          <TextArea label="Subtitle" value={content.productsPreview.subtitle} onChange={(e) => patch("productsPreview", { ...content.productsPreview, subtitle: e.target.value })} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
            <TextInput label="Button Label" value={content.productsPreview.buttonLabel} onChange={(e) => patch("productsPreview", { ...content.productsPreview, buttonLabel: e.target.value })} />
            <TextInput label="Button Link" value={content.productsPreview.buttonHref} onChange={(e) => patch("productsPreview", { ...content.productsPreview, buttonHref: e.target.value })} />
          </div>
          <p className="text-xs text-muted-foreground">
            The products shown here are pulled live from the Products page — manage them there.
          </p>
        </section>

        {/* Portfolio Preview */}
        <section className="glass-panel rounded-2xl p-5">
          <h2 className="text-sm font-semibold text-foreground mb-4">Portfolio Preview Section</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
            <TextInput label="Heading (before)" value={content.portfolioPreview.heading} onChange={(e) => patch("portfolioPreview", { ...content.portfolioPreview, heading: e.target.value })} />
            <TextInput label="Heading (highlighted)" value={content.portfolioPreview.headingHighlight} onChange={(e) => patch("portfolioPreview", { ...content.portfolioPreview, headingHighlight: e.target.value })} />
          </div>
          <TextArea label="Subtitle" value={content.portfolioPreview.subtitle} onChange={(e) => patch("portfolioPreview", { ...content.portfolioPreview, subtitle: e.target.value })} />
          <TextInput label="Button Label" value={content.portfolioPreview.buttonLabel} onChange={(e) => patch("portfolioPreview", { ...content.portfolioPreview, buttonLabel: e.target.value })} />
          <p className="text-xs text-muted-foreground">
            The projects shown here are pulled live from the Portfolio page — manage them there.
          </p>
        </section>

        {/* Internship Preview */}
        <section className="glass-panel rounded-2xl p-5">
          <h2 className="text-sm font-semibold text-foreground mb-4">Internship Preview Section</h2>
          <ImageUploadField
            label="Image"
            value={content.internshipPreview.image}
            onChange={(path) => patch("internshipPreview", { ...content.internshipPreview, image: path })}
            subdir="content"
          />
          <TextInput label="Badge" value={content.internshipPreview.badge} onChange={(e) => patch("internshipPreview", { ...content.internshipPreview, badge: e.target.value })} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
            <TextInput label="Heading (before)" value={content.internshipPreview.heading} onChange={(e) => patch("internshipPreview", { ...content.internshipPreview, heading: e.target.value })} />
            <TextInput label="Heading (highlighted)" value={content.internshipPreview.headingHighlight} onChange={(e) => patch("internshipPreview", { ...content.internshipPreview, headingHighlight: e.target.value })} />
          </div>
          <TextArea label="Description" value={content.internshipPreview.description} onChange={(e) => patch("internshipPreview", { ...content.internshipPreview, description: e.target.value })} />
          <label className="block text-sm font-medium text-foreground mb-1.5">Highlight Chips</label>
          <StringListEditor
            values={content.internshipPreview.highlights}
            onChange={(highlights) => patch("internshipPreview", { ...content.internshipPreview, highlights })}
            addLabel="Add highlight"
          />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-4 mt-4">
            <TextInput label="Button Label" value={content.internshipPreview.buttonLabel} onChange={(e) => patch("internshipPreview", { ...content.internshipPreview, buttonLabel: e.target.value })} />
            <TextInput label="Stat Value" value={content.internshipPreview.statValue} onChange={(e) => patch("internshipPreview", { ...content.internshipPreview, statValue: e.target.value })} />
            <TextInput label="Stat Label" value={content.internshipPreview.statLabel} onChange={(e) => patch("internshipPreview", { ...content.internshipPreview, statLabel: e.target.value })} />
          </div>
        </section>

        {/* CTA */}
        <section className="glass-panel rounded-2xl p-5">
          <h2 className="text-sm font-semibold text-foreground mb-4">Closing CTA Section</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
            <TextInput label="Heading (before)" value={content.cta.heading} onChange={(e) => patch("cta", { ...content.cta, heading: e.target.value })} />
            <TextInput label="Heading (highlighted)" value={content.cta.headingHighlight} onChange={(e) => patch("cta", { ...content.cta, headingHighlight: e.target.value })} hint='Rendered as: "{before} {highlighted} Your Business?"' />
          </div>
          <TextArea label="Description" value={content.cta.description} onChange={(e) => patch("cta", { ...content.cta, description: e.target.value })} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
            <TextInput label="Primary Button Label" value={content.cta.primaryLabel} onChange={(e) => patch("cta", { ...content.cta, primaryLabel: e.target.value })} />
            <TextInput label="Primary Button Link" value={content.cta.primaryHref} onChange={(e) => patch("cta", { ...content.cta, primaryHref: e.target.value })} />
            <TextInput label="Secondary Button Label" value={content.cta.secondaryLabel} onChange={(e) => patch("cta", { ...content.cta, secondaryLabel: e.target.value })} />
            <TextInput label="Secondary Button Link" value={content.cta.secondaryHref} onChange={(e) => patch("cta", { ...content.cta, secondaryHref: e.target.value })} />
            <TextInput label="Tertiary Button Label" value={content.cta.tertiaryLabel} onChange={(e) => patch("cta", { ...content.cta, tertiaryLabel: e.target.value })} />
            <TextInput label="Tertiary Button Link" value={content.cta.tertiaryHref} onChange={(e) => patch("cta", { ...content.cta, tertiaryHref: e.target.value })} />
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
