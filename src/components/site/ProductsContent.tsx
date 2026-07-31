"use client";

import { useState } from "react";
import { 
  ArrowRight, Box, CheckCircle, ExternalLink, 
  BarChart3, Users, Users2, Package, CreditCard, ShoppingCart,
  ShieldCheck, Maximize, Settings, Headset
} from "lucide-react";
import SectionHeader from "@/components/ui/SectionHeader";
import Badge from "@/components/ui/Badge";
import InquiryModal from "./InquiryModal";
import ProductPreviewModal from "./ProductPreviewModal";
import type { PublicProduct } from "@/lib/services/public-catalog.service";

const COLOR_MAP: Record<string, { bg: string; text: string; lightBg: string; buttonBg: string; buttonHover: string; border: string }> = {
  blue: { bg: "bg-blue-500", text: "text-blue-500", lightBg: "bg-blue-500/10", buttonBg: "bg-blue-600", buttonHover: "hover:bg-blue-700", border: "border-blue-200 dark:border-blue-900" },
  green: { bg: "bg-green-500", text: "text-green-500", lightBg: "bg-green-500/10", buttonBg: "bg-green-600", buttonHover: "hover:bg-green-700", border: "border-green-200 dark:border-green-900" },
  purple: { bg: "bg-purple-500", text: "text-purple-500", lightBg: "bg-purple-500/10", buttonBg: "bg-purple-600", buttonHover: "hover:bg-purple-700", border: "border-purple-200 dark:border-purple-900" },
  orange: { bg: "bg-orange-500", text: "text-orange-500", lightBg: "bg-orange-500/10", buttonBg: "bg-orange-600", buttonHover: "hover:bg-orange-700", border: "border-orange-200 dark:border-orange-900" },
  sky: { bg: "bg-sky-500", text: "text-sky-500", lightBg: "bg-sky-500/10", buttonBg: "bg-sky-600", buttonHover: "hover:bg-sky-700", border: "border-sky-200 dark:border-sky-900" },
  pink: { bg: "bg-pink-500", text: "text-pink-500", lightBg: "bg-pink-500/10", buttonBg: "bg-pink-600", buttonHover: "hover:bg-pink-700", border: "border-pink-200 dark:border-pink-900" },
};

const CATEGORY_COLORS: Record<string, string> = {
  "ERP SOLUTION": "blue",
  "HR MANAGEMENT": "green",
  "CRM SOLUTION": "purple",
  "INVENTORY MANAGEMENT": "orange",
  "FINANCE SOLUTION": "sky",
  "E-COMMERCE": "pink"
};
import type { LucideIcon } from "lucide-react";

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  "ERP SOLUTION": BarChart3,
  "HR MANAGEMENT": Users2,
  "CRM SOLUTION": Users,
  "INVENTORY MANAGEMENT": Package,
  "FINANCE SOLUTION": CreditCard,
  "E-COMMERCE": ShoppingCart
};

export default function ProductsContent({ products }: { products: PublicProduct[] }) {
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [previewProduct, setPreviewProduct] = useState<PublicProduct | null>(null);

  return (
    <div className="min-h-screen pt-32 pb-20 bg-background relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-1/4 left-0 w-[600px] h-[600px] bg-primary/5 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 right-0 w-[600px] h-[600px] bg-blue-500/5 blur-[150px] rounded-full pointer-events-none" />

      <section className="container mx-auto px-6 relative z-10 mb-20 text-center">
        <Badge icon={Box} text="Our Products" className="mb-6" />
        <SectionHeader
          title="Enterprise"
          highlight="Software Products"
          subtitle="Powerful, customizable, and scalable software solutions designed to streamline operations, improve productivity, and drive business growth."
        />
      </section>

      <section className="container mx-auto px-6 relative z-10 mb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product, idx) => {
            const categoryColorKey = product.category ? CATEGORY_COLORS[product.category] || "blue" : "blue";
            const styles = COLOR_MAP[categoryColorKey];
            const Icon = product.category ? CATEGORY_ICONS[product.category] || Box : Box;

            return (
              <div
                key={product.id}
                id={product.slug}
                data-reveal
                style={{ "--reveal-from": "translateY(40px)", "--reveal-delay": `${(idx % 3) * 0.1}s` } as React.CSSProperties}
                className="glass-panel p-8 rounded-3xl overflow-hidden hover:-translate-y-1 transition-all duration-300 shadow-sm hover:shadow-xl border border-foreground/5 bg-background/50 flex flex-col h-full"
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className={`w-16 h-16 rounded-2xl ${styles.bg} text-white flex items-center justify-center shrink-0 shadow-sm`}>
                    <Icon className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-foreground leading-tight">{product.title}</h3>
                    {product.category && (
                      <div className={`inline-block mt-2 px-3 py-1 rounded-full text-[10px] font-bold tracking-wider ${styles.lightBg} ${styles.text}`}>
                        {product.category}
                      </div>
                    )}
                  </div>
                </div>

                <p className="text-foreground/70 text-sm leading-relaxed mb-8 flex-1">
                  {product.description}
                </p>

                <div className="grid grid-cols-2 gap-y-4 gap-x-2 mb-8">
                  {product.features.map((feature, fIdx) => (
                    <div key={fIdx} className="flex items-start gap-2">
                      <CheckCircle className={`w-4 h-4 shrink-0 mt-0.5 ${styles.text}`} />
                      <span className="text-xs font-semibold text-foreground/80 leading-tight">{feature}</span>
                    </div>
                  ))}
                </div>

              <div className="flex items-center justify-between mt-auto pt-6 border-t border-foreground/5">
                  <button 
                    onClick={() => setSelectedProduct(product.title)}
                    className={`px-5 py-2.5 rounded-lg text-white text-sm font-bold flex items-center gap-2 transition-colors ${styles.buttonBg} ${styles.buttonHover}`}
                  >
                    Learn More <ArrowRight className="w-4 h-4" />
                  </button>
                  {(product.demoUrl || product.image || (product.images && product.images.length > 0)) && (
                    <button 
                      onClick={() => setPreviewProduct(product)}
                      className={`text-xs font-bold flex items-center gap-1.5 transition-colors ${styles.text} hover:opacity-80`}
                    >
                      View Demo <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Bottom Features Banner */}
      <section className="container mx-auto px-6 relative z-10">
        <div className="glass-panel p-8 rounded-[2rem] border border-foreground/10 bg-background/50 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            
            <div className="flex gap-4 items-start">
              <div className="w-12 h-12 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-foreground mb-1">Secure & Reliable</h4>
                <p className="text-xs text-foreground/60 leading-relaxed">Enterprise-grade security and 99.9% uptime reliability.</p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="w-12 h-12 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
                <Maximize className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-foreground mb-1">Scalable Architecture</h4>
                <p className="text-xs text-foreground/60 leading-relaxed">Built to scale with your business effortlessly.</p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="w-12 h-12 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
                <Settings className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-foreground mb-1">Highly Customizable</h4>
                <p className="text-xs text-foreground/60 leading-relaxed">Tailored solutions to fit your unique business needs.</p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="w-12 h-12 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
                <Headset className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-foreground mb-1">24/7 Support</h4>
                <p className="text-xs text-foreground/60 leading-relaxed">Dedicated support whenever you need us.</p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Contact Form Modal */}
      <InquiryModal 
        isOpen={!!selectedProduct} 
        onClose={() => setSelectedProduct(null)} 
        productName={selectedProduct || ""} 
      />

      {/* Product Preview Modal */}
      <ProductPreviewModal 
        product={previewProduct} 
        onClose={() => setPreviewProduct(null)} 
      />
    </div>
  );
}
