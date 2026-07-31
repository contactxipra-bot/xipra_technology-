"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutTemplate, Server, Database, Cloud, ShieldCheck, Wrench, Code2, Cpu, Globe, Terminal, Layers, Lock, Box, X
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import SectionHeader from "@/components/ui/SectionHeader";
import Badge from "@/components/ui/Badge";
import type { PublicTechnologyCategory, PublicTechnology } from "@/lib/services/public-catalog.service";

// Map category names to specific icons and colors
const CATEGORY_ICONS: Record<string, { icon: LucideIcon; color: string; bg: string; border: string }> = {
  "Frontend": { icon: LayoutTemplate, color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/20" },
  "Backend": { icon: Server, color: "text-green-500", bg: "bg-green-500/10", border: "border-green-500/20" },
  "Database & Storage": { icon: Database, color: "text-purple-500", bg: "bg-purple-500/10", border: "border-purple-500/20" },
  "Database": { icon: Database, color: "text-purple-500", bg: "bg-purple-500/10", border: "border-purple-500/20" },
  "Cloud & DevOps": { icon: Cloud, color: "text-sky-500", bg: "bg-sky-500/10", border: "border-sky-500/20" },
  "Cloud": { icon: Cloud, color: "text-sky-500", bg: "bg-sky-500/10", border: "border-sky-500/20" },
  "Security": { icon: ShieldCheck, color: "text-orange-500", bg: "bg-orange-500/10", border: "border-orange-500/20" },
  "Tools & Others": { icon: Wrench, color: "text-slate-500", bg: "bg-slate-500/10", border: "border-slate-500/20" },
  "Tools": { icon: Wrench, color: "text-slate-500", bg: "bg-slate-500/10", border: "border-slate-500/20" },
};

const DEFAULT_CATEGORY_ICON = { icon: Box, color: "text-primary", bg: "bg-primary/10", border: "border-primary/20" };

function getTechIcon(name: string) {
  const n = name.toLowerCase();
  if (n.includes('react') || n.includes('next')) return Globe;
  if (n.includes('node') || n.includes('express') || n.includes('nest')) return Terminal;
  if (n.includes('sql') || n.includes('prisma') || n.includes('redis') || n.includes('base')) return Database;
  if (n.includes('aws') || n.includes('docker') || n.includes('vercel')) return Cloud;
  if (n.includes('git')) return Layers;
  if (n.includes('jwt') || n.includes('auth') || n.includes('ssl') || n.includes('bcrypt')) return Lock;
  return Cpu;
}

export default function TechnologyContent({ categories }: { categories: PublicTechnologyCategory[] }) {
  const [selectedTech, setSelectedTech] = useState<PublicTechnology | null>(null);

  return (
    <div className="min-h-screen pt-32 pb-20 bg-background relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/5 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-500/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="flex justify-center mb-6">
          <Badge icon={Box} text="Our Technology" />
        </div>
        
        <SectionHeader
          title="Technology"
          highlight="Stack"
          subtitle="We leverage cutting-edge technologies and robust tools to build scalable, secure, and high-performance digital solutions."
        />

        {/* Top Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-12">
          {categories.map((cat, idx) => {
            const style = CATEGORY_ICONS[cat.name] || DEFAULT_CATEGORY_ICON;
            const Icon = style.icon;
            return (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="glass-panel p-6 rounded-3xl border border-foreground/10 text-center hover:-translate-y-1 transition-transform flex flex-col items-center shadow-lg bg-background/50"
              >
                <div className={`w-14 h-14 rounded-full ${style.bg} ${style.border} border flex items-center justify-center mb-4 shadow-sm`}>
                  <Icon className={`w-6 h-6 ${style.color}`} />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">{cat.name}</h3>
              </motion.div>
            );
          })}
        </div>

        {/* Technology Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
          {categories.map((cat, idx) => {
            const style = CATEGORY_ICONS[cat.name] || DEFAULT_CATEGORY_ICON;
            return (
              <motion.div
                key={`grid-${cat.id}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + idx * 0.1 }}
                className="glass-panel p-8 rounded-3xl border border-foreground/10 shadow-md bg-background/50"
              >
                <h4 className={`text-sm font-bold mb-6 ${style.color} uppercase tracking-wider`}>{cat.name} Technologies</h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {cat.technologies.map((tech) => {
                    const TechIcon = getTechIcon(tech.name);
                    return (
                      <button 
                        key={tech.id} 
                        onClick={() => setSelectedTech(tech)}
                        className="flex flex-col items-center text-center group cursor-pointer p-2 rounded-xl hover:bg-foreground/5 transition-colors"
                      >
                        <div className="w-14 h-14 rounded-full bg-foreground/5 border border-foreground/10 flex items-center justify-center mb-3 group-hover:bg-foreground/10 group-hover:scale-110 transition-all shadow-inner">
                          {/* Future enhancement: use tech.icon if it's an image URL or keep lucide icons */}
                          <TechIcon className="w-6 h-6 text-foreground/70 group-hover:text-primary transition-colors" />
                        </div>
                        <span className="text-xs font-semibold text-foreground/80 group-hover:text-primary transition-colors">{tech.name}</span>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="glass-panel p-8 md:p-6 rounded-[2rem] border border-primary/20 bg-primary/5 flex flex-col md:flex-row items-center gap-6 text-center md:text-left shadow-lg"
        >
          <div className="w-16 h-16 shrink-0 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-inner">
            <Code2 className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-foreground mb-2">Built for Performance. Designed for Scale.</h3>
            <p className="text-foreground/60 text-sm max-w-3xl">Our technology stack is carefully selected to ensure high performance, scalability, security, and a seamless user experience.</p>
          </div>
        </motion.div>
      </div>

      {/* Technology Detail Modal */}
      <AnimatePresence>
        {selectedTech && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[100]"
              onClick={() => setSelectedTech(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md z-[101] px-4"
            >
              <div className="glass-panel p-8 rounded-3xl border border-foreground/10 shadow-2xl relative text-center">
                <button
                  onClick={() => setSelectedTech(null)}
                  className="absolute top-6 right-6 w-8 h-8 rounded-full bg-foreground/5 flex items-center justify-center hover:bg-foreground/10 text-foreground/60 hover:text-foreground transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="w-20 h-20 mx-auto rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mb-6 shadow-inner">
                  {(() => {
                    const ModalIcon = getTechIcon(selectedTech.name);
                    return <ModalIcon className="w-10 h-10 text-primary" />;
                  })()}
                </div>
                <h2 className="text-2xl font-bold text-foreground mb-4">{selectedTech.name}</h2>
                <p className="text-foreground/70 text-sm leading-relaxed mb-8">
                  {selectedTech.description || `We use ${selectedTech.name} to deliver high-quality, scalable solutions tailored to our clients' needs.`}
                </p>
                <button 
                  onClick={() => setSelectedTech(null)}
                  className="w-full py-3 rounded-xl bg-primary/10 text-primary font-bold hover:bg-primary/20 transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
