"use client";

import Image from "next/image";
import Link from "next/link";
import { FaFacebook, FaTwitter, FaLinkedin, FaInstagram, FaWhatsapp } from "react-icons/fa";
import { FOOTER_DEFAULTS } from "@/lib/content/defaults";
import type { FooterContent } from "@/lib/content/types";
import type { SocialLink } from "@/components/admin/settings/SocialLinksEditor";
import { isValidImageSrc } from "@/lib/image-src";

const SOCIAL_ICONS: { match: string; Icon: typeof FaFacebook }[] = [
  { match: "facebook", Icon: FaFacebook },
  { match: "twitter", Icon: FaTwitter },
  { match: "x", Icon: FaTwitter },
  { match: "linkedin", Icon: FaLinkedin },
  { match: "instagram", Icon: FaInstagram },
  { match: "whatsapp", Icon: FaWhatsapp },
];

function resolveSocialIcon(platform: string) {
  const lower = platform.toLowerCase();
  return SOCIAL_ICONS.find((s) => lower.includes(s.match)) ?? SOCIAL_ICONS[0];
}

export default function Footer({
  content = FOOTER_DEFAULTS,
  companyName = "Xipra Technology",
  logoUrl,
  socialLinks = [],
}: {
  content?: FooterContent;
  companyName?: string;
  logoUrl?: string | null;
  socialLinks?: SocialLink[];
}) {
  const copyright = content.copyrightText
    .replace("{year}", String(new Date().getFullYear()))
    .replace("{company}", companyName);

  const displaySocial = socialLinks.length > 0 ? socialLinks : DEFAULT_SOCIAL;

  return (
    <footer className="bg-background pt-20 pb-10 border-t border-border">
      <div className="container mx-auto px-6">
        
        {/* Links Grid */}
        <div className="flex flex-col xl:flex-row gap-12 mb-16">
          <div className="w-full xl:w-1/4 shrink-0">
            <a 
              href="https://wa.me/919773203680" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="flex items-center gap-3 group mb-4"
            >
              {isValidImageSrc(logoUrl) ? (
                <div className="relative w-8 h-8 rounded-md overflow-hidden shrink-0 border border-border">
                  <Image src={logoUrl} alt={companyName} fill sizes="32px" className="object-cover" />
                </div>
              ) : (
                <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-sm">{companyName.charAt(0)}</span>
                </div>
              )}
              <span className="text-lg font-bold text-foreground tracking-tight">
                {companyName === "Xipra Technology" ? (
                  <>Xipra<span className="text-foreground/50 font-normal">Tech</span></>
                ) : (
                  companyName
                )}
              </span>
            </a>
            <p className="text-foreground/60 text-sm max-w-sm mb-6 leading-relaxed">
              {content.description}
            </p>
            <div className="flex gap-3">
              {displaySocial.map((social, idx) => {
                const { Icon } = resolveSocialIcon(social.platform);
                return (
                  <a
                    key={`${social.platform}-${idx}`}
                    href={social.url}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`${companyName} on ${social.platform}`}
                    className="w-9 h-9 rounded-full bg-foreground/5 flex items-center justify-center text-foreground/70 hover:text-foreground hover:bg-foreground/10 transition-colors"
                  >
                    <Icon className="w-4 h-4" aria-hidden="true" />
                  </a>
                );
              })}
            </div>
          </div>

          <div className="w-full xl:w-3/4 flex flex-wrap gap-8 justify-between">
            {content.columns.map((col) => (
              <div key={col.title} className="min-w-[160px] flex-1">
                <h3 className="text-foreground font-semibold mb-4 text-sm whitespace-nowrap">{col.title}</h3>
                <ul className="space-y-3">
                  {col.links.map((link) => (
                    <li key={link.name}>
                      <Link
                        href={link.href}
                        className="text-foreground/60 hover:text-foreground transition-colors text-sm"
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-foreground/50">
          <div className="flex-1 text-center md:text-left">
            <p>{copyright}</p>
          </div>

          {/* <div className="flex-1 flex justify-center">
            <a 
              href="https://wa.me/919773203680" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="flex items-center gap-1.5 hover:text-foreground transition-colors group cursor-pointer"
            >
              <span>Developed by</span>
              <span className="font-semibold text-foreground/80 group-hover:text-primary transition-colors">Patel Parth</span>
              <span className="mx-2">•</span>
              <div className="flex items-center gap-2">
                <Image src="/wiregen-logo.png" alt="WIREGEN AI Logo" width={32} height={32} className="object-contain group-hover:scale-105 transition-transform" />
                <span className="font-bold tracking-wide text-foreground group-hover:text-primary transition-colors text-sm">WIREGEN AI</span>
              </div>
            </a>
          </div> */}

          <div className="flex-1 flex justify-center md:justify-end flex-wrap items-center gap-6">
            <Link href="/privacy-policy" className="hover:text-foreground transition-colors">Privacy Policy</Link>
            <Link href="/terms-conditions" className="hover:text-foreground transition-colors">Terms & Conditions</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

const DEFAULT_SOCIAL: SocialLink[] = [
  { platform: "Facebook", url: "#" },
  { platform: "Twitter", url: "#" },
  { platform: "LinkedIn", url: "#" },
  { platform: "Instagram", url: "#" },
  { platform: "WhatsApp", url: "#" },
];
