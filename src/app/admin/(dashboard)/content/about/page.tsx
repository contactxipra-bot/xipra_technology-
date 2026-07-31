"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { ArrowLeft, Plus, Trash2, Save, ExternalLink } from "lucide-react";
import { apiGet, apiSend, ApiRequestError } from "@/lib/admin-api";
import { TextInput, TextArea } from "@/components/admin/FormField";
import ImageUploadField from "@/components/admin/ImageUploadField";
import { AlertBanner } from "@/components/admin/PageHeader";
import { Button } from "@/components/ui/button";
import type { AboutContent } from "@/lib/content/types";

export default function AboutContentEditor() {
  const [content, setContent] = useState<AboutContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    apiGet<AboutContent>("/api/admin/content/about")
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
      await apiSend("/api/admin/content/about", "PUT", content);
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

  const patch = (p: Partial<AboutContent>) => setContent({ ...content, ...p });
  const patchHero = (p: Partial<AboutContent["hero"]>) => patch({ hero: { ...content.hero, ...p } });
  const patchIntro = (p: Partial<AboutContent["intro"]>) => patch({ intro: { ...content.intro, ...p } });

  return (
    <div>
      <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
        <div>
          <Link href="/admin/content" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-1">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Pages
          </Link>
          <h1 className="text-2xl font-bold text-foreground">About Page Content</h1>
        </div>
        <Link href="/about" target="_blank" className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors">
          <ExternalLink className="w-4 h-4" /> View page
        </Link>
      </div>

      {success && <AlertBanner type="success" message="About page content saved" />}
      {error && <AlertBanner type="error" message={error} />}

      <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
        {/* Hero */}
        <section className="glass-panel rounded-2xl p-5">
          <h2 className="text-sm font-semibold text-foreground mb-4">Hero</h2>
          <TextInput label="Badge Text" value={content.hero.badge} onChange={(e) => patchHero({ badge: e.target.value })} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
            <TextInput label="Title (before)" value={content.hero.titlePrefix} onChange={(e) => patchHero({ titlePrefix: e.target.value })} />
            <TextInput label="Title (highlighted)" value={content.hero.titleHighlight} onChange={(e) => patchHero({ titleHighlight: e.target.value })} />
          </div>
          <TextArea label="Description" value={content.hero.description} onChange={(e) => patchHero({ description: e.target.value })} />
        </section>

        {/* Introduction */}
        <section className="glass-panel rounded-2xl p-5">
          <h2 className="text-sm font-semibold text-foreground mb-4">Company Introduction</h2>
          <ImageUploadField label="Image" value={content.intro.imageUrl} onChange={(path) => patchIntro({ imageUrl: path })} subdir="content" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
            <TextInput label="Stat Badge Value" value={content.intro.yearsBadgeValue} onChange={(e) => patchIntro({ yearsBadgeValue: e.target.value })} />
            <TextInput label="Stat Badge Label" value={content.intro.yearsBadgeLabel} onChange={(e) => patchIntro({ yearsBadgeLabel: e.target.value })} />
            <TextInput label="Heading (before)" value={content.intro.headingTitle} onChange={(e) => patchIntro({ headingTitle: e.target.value })} />
            <TextInput label="Heading (highlighted)" value={content.intro.headingHighlight} onChange={(e) => patchIntro({ headingHighlight: e.target.value })} />
          </div>
          <TextArea label="Subtitle" value={content.intro.subtitle} onChange={(e) => patchIntro({ subtitle: e.target.value })} />
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-sm font-medium text-foreground">Paragraphs</span>
            <button type="button" onClick={() => patchIntro({ paragraphs: [...content.intro.paragraphs, ""] })} className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline">
              <Plus className="w-3.5 h-3.5" /> Add paragraph
            </button>
          </div>
          {content.intro.paragraphs.map((p, idx) => (
            <div key={idx} className="flex items-start gap-2 mb-2">
              <textarea
                value={p}
                onChange={(e) => {
                  const paragraphs = [...content.intro.paragraphs];
                  paragraphs[idx] = e.target.value;
                  patchIntro({ paragraphs });
                }}
                className="flex-1 min-h-[80px] rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 resize-y"
              />
              <button type="button" onClick={() => patchIntro({ paragraphs: content.intro.paragraphs.filter((_, i) => i !== idx) })} className="rounded-lg p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </section>

        {/* Mission & Vision */}
        <section className="glass-panel rounded-2xl p-5">
          <h2 className="text-sm font-semibold text-foreground mb-4">Mission &amp; Vision</h2>
          <TextArea label="Our Mission" value={content.mission} onChange={(e) => patch({ mission: e.target.value })} />
          <TextArea label="Our Vision" value={content.vision} onChange={(e) => patch({ vision: e.target.value })} />
        </section>

        {/* Journey */}
        <section className="glass-panel rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-foreground">Journey Timeline</h2>
            <button type="button" onClick={() => patch({ journey: [...content.journey, { year: "", title: "", desc: "" }] })} className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline">
              <Plus className="w-3.5 h-3.5" /> Add milestone
            </button>
          </div>
          <div className="space-y-4">
            {content.journey.map((item, idx) => (
              <div key={idx} className="rounded-lg border border-border p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-muted-foreground">Milestone {idx + 1}</span>
                  <button type="button" onClick={() => patch({ journey: content.journey.filter((_, i) => i !== idx) })} className="text-muted-foreground hover:text-destructive">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-x-4">
                  <TextInput label="Year" value={item.year} onChange={(e) => { const journey = [...content.journey]; journey[idx] = { ...journey[idx], year: e.target.value }; patch({ journey }); }} />
                  <div className="sm:col-span-3">
                    <TextInput label="Title" value={item.title} onChange={(e) => { const journey = [...content.journey]; journey[idx] = { ...journey[idx], title: e.target.value }; patch({ journey }); }} />
                  </div>
                </div>
                <TextArea label="Description" value={item.desc} onChange={(e) => { const journey = [...content.journey]; journey[idx] = { ...journey[idx], desc: e.target.value }; patch({ journey }); }} />
              </div>
            ))}
          </div>
        </section>

        {/* Achievements */}
        <section className="glass-panel rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-foreground">Achievements</h2>
            <button type="button" onClick={() => patch({ achievements: [...content.achievements, { title: "", desc: "" }] })} className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline">
              <Plus className="w-3.5 h-3.5" /> Add achievement
            </button>
          </div>
          <div className="space-y-3">
            {content.achievements.map((item, idx) => (
              <div key={idx} className="flex items-end gap-3">
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-x-4">
                  <TextInput label="Title" value={item.title} onChange={(e) => { const achievements = [...content.achievements]; achievements[idx] = { ...achievements[idx], title: e.target.value }; patch({ achievements }); }} />
                  <TextInput label="Description" value={item.desc} onChange={(e) => { const achievements = [...content.achievements]; achievements[idx] = { ...achievements[idx], desc: e.target.value }; patch({ achievements }); }} />
                </div>
                <button type="button" onClick={() => patch({ achievements: content.achievements.filter((_, i) => i !== idx) })} className="mb-4 rounded-lg p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="glass-panel rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-foreground">Why Choose Us</h2>
            <button type="button" onClick={() => patch({ whyChooseUs: [...content.whyChooseUs, ""] })} className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline">
              <Plus className="w-3.5 h-3.5" /> Add point
            </button>
          </div>
          <div className="space-y-2">
            {content.whyChooseUs.map((reason, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <input
                  value={reason}
                  onChange={(e) => { const whyChooseUs = [...content.whyChooseUs]; whyChooseUs[idx] = e.target.value; patch({ whyChooseUs }); }}
                  className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
                <button type="button" onClick={() => patch({ whyChooseUs: content.whyChooseUs.filter((_, i) => i !== idx) })} className="rounded-lg p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors">
                  <Trash2 className="w-4 h-4" />
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
