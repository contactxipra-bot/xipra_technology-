"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";

export type SocialLink = { platform: string; url: string };

export default function SocialLinksEditor({
  values,
  onChange,
}: {
  values: SocialLink[];
  onChange: (values: SocialLink[]) => void;
}) {
  const [platform, setPlatform] = useState("");
  const [url, setUrl] = useState("");

  function add() {
    if (!platform.trim() || !url.trim()) return;
    onChange([...values, { platform: platform.trim(), url: url.trim() }]);
    setPlatform("");
    setUrl("");
  }

  return (
    <div className="mb-2">
      {values.length > 0 && (
        <div className="space-y-1.5 mb-2">
          {values.map((link, i) => (
            <div
              key={i}
              className="flex items-center gap-2 rounded-lg border border-border px-3 py-1.5 text-sm"
            >
              <span className="font-medium text-foreground w-24 shrink-0 truncate capitalize">
                {link.platform}
              </span>
              <span className="flex-1 text-muted-foreground truncate">{link.url}</span>
              <button
                type="button"
                onClick={() => onChange(values.filter((_, idx) => idx !== i))}
                className="text-muted-foreground hover:text-destructive"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
      <div className="flex gap-2">
        <input
          value={platform}
          onChange={(e) => setPlatform(e.target.value)}
          placeholder="Platform (e.g. Instagram)"
          className="w-40 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://..."
          className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
        <button
          type="button"
          onClick={add}
          className="rounded-lg border border-border px-3 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
