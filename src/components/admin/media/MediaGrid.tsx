"use client";

import Image from "next/image";
import { FileText } from "lucide-react";
import { formatBytes } from "@/lib/format";
import type { MediaObject } from "./types";

export default function MediaGrid({
  items,
  loading,
  onSelect,
  selectMode = false,
}: {
  items: MediaObject[];
  loading?: boolean;
  onSelect: (item: MediaObject) => void;
  selectMode?: boolean;
}) {
  if (loading) {
    return <p className="text-sm text-muted-foreground py-10 text-center">Loading media...</p>;
  }

  if (items.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-10 text-center rounded-xl border border-dashed border-border">
        No files here yet.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
      {items.map((item) => (
        <button
          key={item.name}
          type="button"
          onClick={() => onSelect(item)}
          className="group text-left rounded-xl border border-border bg-muted/20 overflow-hidden hover:border-primary/50 transition-colors"
        >
          <div className="relative aspect-square bg-muted/40">
            {item.isImage ? (
              <Image src={item.url} alt={item.name} fill sizes="180px" className="object-cover" />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center gap-1 text-muted-foreground">
                <FileText className="w-8 h-8" />
                <span className="text-[10px] uppercase font-medium">PDF</span>
              </div>
            )}
            {selectMode && (
              <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/10 transition-colors flex items-center justify-center">
                <span className="opacity-0 group-hover:opacity-100 text-xs font-semibold text-primary-foreground bg-primary px-2 py-1 rounded-full transition-opacity">
                  Select
                </span>
              </div>
            )}
          </div>
          <div className="p-2">
            <p className="text-xs text-foreground truncate" title={item.name}>{item.name}</p>
            <p className="text-[10px] text-muted-foreground">{formatBytes(item.size)}</p>
          </div>
        </button>
      ))}
    </div>
  );
}
