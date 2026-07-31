"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ExternalLink, Layers, ArrowRight, FolderKanban, Users, Clock, Rocket } from "lucide-react";
import clsx from "clsx";
import Image from "next/image";
import Link from "next/link";
import SectionHeader from "@/components/ui/SectionHeader";
import Badge from "@/components/ui/Badge";
import EmptyState from "@/components/ui/EmptyState";
import type { PublicPortfolioProject } from "@/lib/services/public-catalog.service";

export default function PortfolioContent({ projects }: { projects: PublicPortfolioProject[] }) {
  const categories = useMemo(() => {
    const unique = Array.from(new Set(projects.map((p) => p.category))).sort();
    return ["All Projects", ...unique];
  }, [projects]);

  const [activeCategory, setActiveCategory] = useState("All Projects");

  const filteredProjects = projects.filter(
    (project) => activeCategory === "All Projects" || project.category === activeCategory
  );

  return (
    <div className="min-h-screen pt-32 pb-20 bg-background relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/5 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-500/5 blur-[120px] rounded-full pointer-events-none" />

      <section className="container mx-auto px-6 relative z-10 mb-16 text-center">
        <Badge icon={Layers} text="Our Work" className="mb-6" />
        <SectionHeader
          title="Premium"
          highlight="Portfolio"
          subtitle="A showcase of our finest work across Web, Mobile, Software, and ERP solutions delivering real impact and measurable results."
        />

        {/* Filters */}
        {categories.length > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-wrap justify-center gap-3 mt-12 bg-background/40 backdrop-blur-md p-2 rounded-full border border-foreground/5 inline-flex mx-auto"
          >
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={clsx(
                  "px-6 py-2.5 rounded-full text-sm font-bold tracking-wide transition-all duration-300",
                  activeCategory === category
                    ? "bg-primary text-white shadow-md"
                    : "text-foreground/70 hover:bg-foreground/5 hover:text-foreground"
                )}
              >
                {category}
              </button>
            ))}
          </motion.div>
        )}
      </section>

      <section className="container mx-auto px-6 relative z-10 mb-20">
        {projects.length === 0 ? (
          <EmptyState
            icon={Layers}
            title="Our Portfolio Is Being Curated"
            description="We're preparing case studies from our finest work to feature here. Reach out to see examples of recent projects across Web, Mobile, and Software."
            actionLabel="Get in Touch"
            actionHref="/contact"
          />
        ) : (
          <motion.div layout className="grid grid-cols-1 xl:grid-cols-2 gap-8 max-w-7xl mx-auto">
            <AnimatePresence mode="popLayout">
              {filteredProjects.map((project) => (
                <motion.div
                  key={project.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4 }}
                  className="glass-panel rounded-3xl overflow-hidden bg-background/60 border border-foreground/10 shadow-sm hover:shadow-xl transition-shadow flex flex-col"
                >
                  <div className="p-6 flex flex-col sm:flex-row gap-6 flex-1">
                    {/* Image Block */}
                    <div className="w-full sm:w-5/12 shrink-0">
                      <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-foreground/10 bg-muted/20">
                        {project.image ? (
                          <Image
                            src={project.image}
                            alt={project.title}
                            fill
                            sizes="(max-width: 768px) 100vw, 33vw"
                            className="object-cover hover:scale-105 transition-transform duration-700"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-foreground/20">
                            <Layers className="w-10 h-10" />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Content Block */}
                    <div className="w-full sm:w-7/12 flex flex-col">
                      <div className="flex justify-between items-start mb-4 gap-4">
                        <h3 className="text-xl font-bold text-foreground leading-tight">{project.title}</h3>
                        <div className="px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider whitespace-nowrap shrink-0">
                          {project.category}
                        </div>
                      </div>

                      <p className="text-foreground/70 text-sm leading-relaxed mb-6 flex-1 line-clamp-4">
                        {project.description}
                      </p>

                      {/* Tech Stack Pills */}
                      {project.technologies.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-auto">
                          {project.technologies.map((tech) => (
                            <span 
                              key={tech} 
                              className="px-3 py-1 rounded-full bg-primary/5 text-primary text-[10px] font-bold tracking-wide"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Footer */}
                  <div className="border-t border-foreground/5 px-6 py-4 flex items-center justify-between bg-foreground/[0.02]">
                    <Link 
                      href={`/portfolio/${project.slug}`} 
                      className="text-primary font-bold text-sm flex items-center gap-1.5 hover:gap-2 transition-all"
                    >
                      View Case Study <ArrowRight className="w-4 h-4" />
                    </Link>
                    
                    {project.projectUrl ? (
                      <a 
                        href={project.projectUrl} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="text-foreground/60 font-medium text-sm flex items-center gap-1.5 hover:text-foreground transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" /> Live Preview
                      </a>
                    ) : (
                      <span className="text-foreground/30 font-medium text-sm flex items-center gap-1.5 cursor-not-allowed" title="Preview not available">
                        <ExternalLink className="w-4 h-4" /> Live Preview
                      </span>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </section>

      {/* Stats Banner */}
      <section className="container mx-auto px-6 relative z-10 max-w-7xl">
        <div className="glass-panel p-8 rounded-[2rem] border border-foreground/10 bg-background/50 shadow-sm">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-foreground/5">
            
            <div className="flex flex-col items-center justify-center text-center px-4">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center mb-4">
                <FolderKanban className="w-6 h-6" />
              </div>
              <h4 className="text-3xl font-bold text-foreground mb-1">50+</h4>
              <p className="text-sm text-foreground/60 font-medium">Projects Completed</p>
            </div>

            <div className="flex flex-col items-center justify-center text-center px-4">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center mb-4">
                <Users className="w-6 h-6" />
              </div>
              <h4 className="text-3xl font-bold text-foreground mb-1">30+</h4>
              <p className="text-sm text-foreground/60 font-medium">Happy Clients</p>
            </div>

            <div className="flex flex-col items-center justify-center text-center px-4">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center mb-4">
                <Clock className="w-6 h-6" />
              </div>
              <h4 className="text-3xl font-bold text-foreground mb-1">5+</h4>
              <p className="text-sm text-foreground/60 font-medium">Years of Experience</p>
            </div>

            <div className="flex flex-col items-center justify-center text-center px-4">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center mb-4">
                <Rocket className="w-6 h-6" />
              </div>
              <h4 className="text-3xl font-bold text-foreground mb-1">100%</h4>
              <p className="text-sm text-foreground/60 font-medium">Client Satisfaction</p>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}
