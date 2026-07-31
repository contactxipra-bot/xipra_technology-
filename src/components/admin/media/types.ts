export type PublicBucket = "products" | "portfolio" | "technology" | "hero" | "logos" | "assets";

export const MEDIA_BUCKETS: { id: PublicBucket; label: string }[] = [
  { id: "products", label: "Products" },
  { id: "portfolio", label: "Portfolio" },
  { id: "technology", label: "Technology" },
  { id: "hero", label: "Hero" },
  { id: "logos", label: "Logos" },
  { id: "assets", label: "Assets" },
];

export type MediaObject = {
  bucket: PublicBucket;
  name: string;
  url: string;
  size: number;
  mimeType: string;
  createdAt: string | null;
  isImage: boolean;
  isPdf: boolean;
};
