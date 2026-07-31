import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "../globals.css";
import SmoothScrollProvider from "@/components/ui/SmoothScrollProvider";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import FloatingActions from "@/components/ui/FloatingActions";
import { ThemeProvider } from "@/components/theme-provider";
import { getSiteSettings } from "@/lib/services/settings.service";
import { getFooterContent } from "@/lib/services/content.service";
import type { SocialLink } from "@/components/admin/settings/SocialLinksEditor";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const DEFAULT_TITLE = "Xipra Technology | Premium Software Solutions";
const DEFAULT_DESCRIPTION =
  "Xipra Technology is a leading software development company offering cutting-edge digital solutions.";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const title = settings.seoTitle || DEFAULT_TITLE;
  const description = settings.seoDescription || DEFAULT_DESCRIPTION;
  const keywords = settings.seoKeywords
    ? settings.seoKeywords.split(",").map((k) => k.trim()).filter(Boolean)
    : undefined;

  return {
    metadataBase: new URL(baseUrl),
    title,
    description,
    keywords,
    icons: settings.faviconUrl ? { icon: settings.faviconUrl } : undefined,
    alternates: settings.canonicalUrl ? { canonical: settings.canonicalUrl } : undefined,
    openGraph: {
      title,
      description,
      siteName: settings.companyName,
      images: settings.ogImageUrl ? [{ url: settings.ogImageUrl }] : undefined,
    },
    twitter: {
      card: (settings.twitterCard as "summary" | "summary_large_image") || "summary_large_image",
      title,
      description,
      images: settings.ogImageUrl ? [settings.ogImageUrl] : undefined,
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [settings, footerContent] = await Promise.all([getSiteSettings(), getFooterContent()]);
  const socialLinks = (settings.socialLinks as SocialLink[] | null) ?? [];

  return (
    // The font variable must live on <html>, not <body>: globals.css applies
    // `font-sans` (resolving to var(--font-geist-sans)) to the html element, and
    // a custom property declared on body is invisible to its ancestor. With it
    // on body the declaration was invalid at computed-value time and the whole
    // site silently fell back to the browser default serif.
    <html lang="en" className={geistSans.variable} suppressHydrationWarning>
      <body
        className="antialiased bg-background text-foreground relative"
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {/* Global SVG Noise Overlay */}
          <div
            className="pointer-events-none fixed inset-0 z-50 opacity-[0.03] mix-blend-overlay"
            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
          />

          <SmoothScrollProvider>
            <Navbar companyName={settings.companyName} logoUrl={settings.logoUrl} />
            <main className="min-h-screen relative z-10">
              {children}
            </main>
            <Footer
              content={footerContent}
              companyName={settings.companyName}
              logoUrl={settings.logoUrl}
              socialLinks={socialLinks}
            />
            <FloatingActions />
          </SmoothScrollProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
