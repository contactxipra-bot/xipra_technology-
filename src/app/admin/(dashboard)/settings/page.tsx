"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Save } from "lucide-react";
import { apiGet, apiSend, ApiRequestError } from "@/lib/admin-api";
import { TextInput, TextArea, Select } from "@/components/admin/FormField";
import ImageUploadField from "@/components/admin/ImageUploadField";
import { AlertBanner } from "@/components/admin/PageHeader";
import { Button } from "@/components/ui/button";
import StringListEditor from "@/components/admin/settings/StringListEditor";
import SocialLinksEditor, { type SocialLink } from "@/components/admin/settings/SocialLinksEditor";

type Settings = {
  companyName: string;
  companyDescription: string | null;
  logoUrl: string | null;
  faviconUrl: string | null;
  phones: string[] | null;
  emails: string[] | null;
  addresses: string[] | null;
  businessHours: string | null;
  whatsappNumber: string | null;
  googleMapUrl: string | null;
  socialLinks: SocialLink[] | null;
  copyrightText: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  seoKeywords: string | null;
  ogImageUrl: string | null;
  twitterCard: string | null;
  canonicalUrl: string | null;
};

const EMPTY: Settings = {
  companyName: "",
  companyDescription: "",
  logoUrl: "",
  faviconUrl: "",
  phones: [],
  emails: [],
  addresses: [],
  businessHours: "",
  whatsappNumber: "",
  googleMapUrl: "",
  socialLinks: [],
  copyrightText: "",
  seoTitle: "",
  seoDescription: "",
  seoKeywords: "",
  ogImageUrl: "",
  twitterCard: "summary_large_image",
  canonicalUrl: "",
};

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState<Settings>(EMPTY);

  useEffect(() => {
    apiGet<Settings>("/api/admin/settings")
      .then(({ data }) =>
        setForm({
          companyName: data.companyName,
          companyDescription: data.companyDescription ?? "",
          logoUrl: data.logoUrl ?? "",
          faviconUrl: data.faviconUrl ?? "",
          phones: data.phones ?? [],
          emails: data.emails ?? [],
          addresses: data.addresses ?? [],
          businessHours: data.businessHours ?? "",
          whatsappNumber: data.whatsappNumber ?? "",
          googleMapUrl: data.googleMapUrl ?? "",
          socialLinks: data.socialLinks ?? [],
          copyrightText: data.copyrightText ?? "",
          seoTitle: data.seoTitle ?? "",
          seoDescription: data.seoDescription ?? "",
          seoKeywords: data.seoKeywords ?? "",
          ogImageUrl: data.ogImageUrl ?? "",
          twitterCard: data.twitterCard ?? "summary_large_image",
          canonicalUrl: data.canonicalUrl ?? "",
        })
      )
      .catch((err) =>
        setError(err instanceof ApiRequestError ? err.message : "Failed to load settings")
      )
      .finally(() => setLoading(false));
  }, []);

  const patch = (p: Partial<Settings>) => setForm((f) => ({ ...f, ...p }));

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      await apiSend("/api/admin/settings", "PUT", {
        ...form,
        companyDescription: form.companyDescription || null,
        logoUrl: form.logoUrl || null,
        faviconUrl: form.faviconUrl || null,
        businessHours: form.businessHours || null,
        whatsappNumber: form.whatsappNumber || null,
        googleMapUrl: form.googleMapUrl || null,
        copyrightText: form.copyrightText || null,
        seoTitle: form.seoTitle || null,
        seoDescription: form.seoDescription || null,
        seoKeywords: form.seoKeywords || null,
        ogImageUrl: form.ogImageUrl || null,
        twitterCard: form.twitterCard || null,
        canonicalUrl: form.canonicalUrl || null,
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Failed to save settings");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <p className="text-sm text-muted-foreground">Loading settings...</p>;
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Site Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Company info, contact details, social links, and SEO defaults — used across the whole public site.
        </p>
      </div>

      {success && <AlertBanner type="success" message="Settings saved successfully" />}
      {error && <AlertBanner type="error" message={error} />}

      <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
        <section className="glass-panel rounded-2xl p-5">
          <h2 className="text-sm font-semibold text-foreground mb-4">Company</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
            <ImageUploadField label="Logo" value={form.logoUrl} onChange={(v) => patch({ logoUrl: v })} subdir="settings" />
            <ImageUploadField label="Favicon" value={form.faviconUrl} onChange={(v) => patch({ faviconUrl: v })} subdir="settings" />
          </div>
          <TextInput
            label="Company Name"
            required
            value={form.companyName}
            onChange={(e) => patch({ companyName: e.target.value })}
          />
          <TextArea
            label="Company Description"
            value={form.companyDescription ?? ""}
            onChange={(e) => patch({ companyDescription: e.target.value })}
            hint="Short description used in the footer and as a fallback SEO description."
          />
          <TextInput
            label="Copyright Text"
            value={form.copyrightText ?? ""}
            onChange={(e) => patch({ copyrightText: e.target.value })}
            hint="Use {year} and {company} as placeholders."
          />
        </section>

        <section className="glass-panel rounded-2xl p-5">
          <h2 className="text-sm font-semibold text-foreground mb-4">Contact Information</h2>
          <StringListEditor
            label="Phone Numbers"
            values={form.phones ?? []}
            onChange={(phones) => patch({ phones })}
            placeholder="+91 98765 43210"
            type="tel"
          />
          <StringListEditor
            label="Email Addresses"
            values={form.emails ?? []}
            onChange={(emails) => patch({ emails })}
            placeholder="info@xipratech.com"
            type="email"
          />
          <StringListEditor
            label="Addresses"
            values={form.addresses ?? []}
            onChange={(addresses) => patch({ addresses })}
            placeholder="Office address"
          />
          <TextInput
            label="Business Hours"
            value={form.businessHours ?? ""}
            onChange={(e) => patch({ businessHours: e.target.value })}
            placeholder="Mon - Sat: 9:00 AM - 6:30 PM"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
            <TextInput
              label="WhatsApp Number"
              value={form.whatsappNumber ?? ""}
              onChange={(e) => patch({ whatsappNumber: e.target.value })}
              placeholder="919033387254"
              hint="Digits only, with country code."
            />
            <TextInput
              label="Google Maps Link"
              value={form.googleMapUrl ?? ""}
              onChange={(e) => patch({ googleMapUrl: e.target.value })}
              placeholder="https://maps.google.com/..."
            />
          </div>
        </section>

        <section className="glass-panel rounded-2xl p-5">
          <h2 className="text-sm font-semibold text-foreground mb-4">Social Links</h2>
          <SocialLinksEditor values={form.socialLinks ?? []} onChange={(socialLinks) => patch({ socialLinks })} />
        </section>

        <section className="glass-panel rounded-2xl p-5">
          <h2 className="text-sm font-semibold text-foreground mb-4">SEO &amp; Metadata</h2>
          <TextInput label="Meta Title" value={form.seoTitle ?? ""} onChange={(e) => patch({ seoTitle: e.target.value })} />
          <TextArea
            label="Meta Description"
            value={form.seoDescription ?? ""}
            onChange={(e) => patch({ seoDescription: e.target.value })}
          />
          <TextInput
            label="Keywords"
            value={form.seoKeywords ?? ""}
            onChange={(e) => patch({ seoKeywords: e.target.value })}
            hint="Comma-separated"
          />
          <ImageUploadField
            label="Open Graph Image"
            value={form.ogImageUrl}
            onChange={(v) => patch({ ogImageUrl: v })}
            subdir="settings"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
            <Select
              label="Twitter Card Type"
              value={form.twitterCard ?? "summary_large_image"}
              onChange={(e) => patch({ twitterCard: e.target.value })}
            >
              <option value="summary_large_image">Summary (large image)</option>
              <option value="summary">Summary</option>
            </Select>
            <TextInput
              label="Canonical URL"
              value={form.canonicalUrl ?? ""}
              onChange={(e) => patch({ canonicalUrl: e.target.value })}
              placeholder="https://xipratechnology.com"
            />
          </div>
        </section>

        <div className="flex justify-end">
          <Button type="submit" disabled={saving}>
            <Save className="w-4 h-4" />
            {saving ? "Saving..." : "Save Settings"}
          </Button>
        </div>
      </form>
    </div>
  );
}
