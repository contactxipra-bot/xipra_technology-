import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ExternalLink, User, Tag, Layers } from "lucide-react";
import {
  getPublicPortfolioProject,
  getPublicPortfolioProjects,
} from "@/lib/services/public-catalog.service";
import CtaBanner from "@/components/ui/CtaBanner";
import { isValidImageSrc } from "@/lib/image-src";

// ISR: prerender every known project at build; new/edited projects regenerate
// instantly via portfolio tag revalidation (see @/lib/cache). Unknown slugs are
// rendered on demand and then cached (dynamicParams defaults to true).
export const revalidate = 3600;

export async function generateStaticParams() {
  const projects = await getPublicPortfolioProjects();
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = await getPublicPortfolioProject(slug);
  if (!project) return { title: "Project Not Found" };
  return {
    title: `${project.title} - Case Study | Xipra Technology`,
    description: project.description.slice(0, 150) + "...",
  };
}

export default async function PortfolioProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = await getPublicPortfolioProject(slug);

  if (!project) {
    notFound();
  }

  return (
    <div className="min-h-screen pt-32 pb-20 bg-background relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/5 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-500/5 blur-[120px] rounded-full pointer-events-none" />

      <article className="container mx-auto px-6 relative z-10 max-w-5xl">
        {/* Back Link */}
        <Link 
          href="/portfolio" 
          className="inline-flex items-center gap-2 text-foreground/60 hover:text-primary transition-colors font-medium mb-8"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Portfolio
        </Link>

        {/* Header Section */}
        <header className="mb-12">
          <div className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider mb-6">
            {project.category}
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-foreground leading-tight mb-6">
            {project.title}
          </h1>
          <p className="text-xl text-foreground/70 leading-relaxed max-w-3xl">
            {project.description}
          </p>
        </header>

        {/* Project Meta Info */}
        <div className="flex flex-wrap items-center gap-8 py-8 border-y border-foreground/10 mb-12">
          {project.client && (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-foreground/5 flex items-center justify-center text-foreground/60">
                <User className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-foreground/50 font-bold uppercase tracking-wider">Client</p>
                <p className="font-medium text-foreground">{project.client}</p>
              </div>
            </div>
          )}
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-foreground/5 flex items-center justify-center text-foreground/60">
              <Tag className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-foreground/50 font-bold uppercase tracking-wider">Category</p>
              <p className="font-medium text-foreground">{project.category}</p>
            </div>
          </div>

          {project.projectUrl && (
            <div className="flex items-center gap-3 ml-auto">
              <a 
                href={project.projectUrl}
                target="_blank"
                rel="noreferrer"
                className="px-6 py-3 rounded-full bg-primary text-white font-bold text-sm flex items-center gap-2 hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
              >
                Live Preview <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          )}
        </div>

        {/* Featured Image */}
        {isValidImageSrc(project.image) && (
          <div className="relative aspect-video rounded-[2rem] overflow-hidden mb-16 shadow-2xl border border-foreground/10">
            <Image 
              src={project.image} 
              alt={project.title}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 1024px) 100vw, 1024px"
            />
          </div>
        )}

        {/* Details Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-20">
          <div className="lg:col-span-2 prose prose-lg prose-invert max-w-none text-foreground/80">
            {/* For now we just use the description since there's no rich text body field in schema. */}
            <h2 className="text-2xl font-bold text-foreground mb-4">About the Project</h2>
            <p className="leading-relaxed whitespace-pre-wrap">
              {project.description}
            </p>
            
            {/* If there were additional images, display them here */}
            {(() => {
              const validGalleryImages = (project.images ?? []).filter(isValidImageSrc);
              return validGalleryImages.length > 0 ? (
                <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {validGalleryImages.map((img, idx) => (
                    <div key={idx} className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-foreground/10">
                      <Image src={img} alt={`${project.title} screenshot ${idx + 1}`} fill className="object-cover" />
                    </div>
                  ))}
                </div>
              ) : null;
            })()}
          </div>

          <aside className="space-y-8">
            <div className="glass-panel p-6 rounded-3xl border border-foreground/10 bg-background/50">
              <div className="flex items-center gap-3 mb-4">
                <Layers className="w-5 h-5 text-primary" />
                <h3 className="font-bold text-foreground">Technologies Used</h3>
              </div>
              {project.technologies.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {project.technologies.map(tech => (
                    <span 
                      key={tech} 
                      className="px-3 py-1.5 rounded-lg bg-foreground/5 text-foreground/80 text-xs font-bold"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-foreground/50">No technologies listed.</p>
              )}
            </div>
          </aside>
        </div>

      </article>

      <CtaBanner
        title="Ready to Start Your Project?"
        subtitle="Let's build something amazing together."
        buttonText="Get in Touch"
        buttonHref="/contact"
      />
    </div>
  );
}
