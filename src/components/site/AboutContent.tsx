import { Building2, Target, Eye, CheckCircle2, Trophy, Users, Globe2, Briefcase, type LucideIcon } from "lucide-react";
import SectionHeader from "@/components/ui/SectionHeader";
import GlassCard from "@/components/ui/GlassCard";
import CtaBanner from "@/components/ui/CtaBanner";
import Badge from "@/components/ui/Badge";
import Image from "next/image";
import type { AboutContent as AboutContentType } from "@/lib/content/types";

// Achievement icons are fixed by position (content only edits the text).
const ACHIEVEMENT_ICONS: LucideIcon[] = [Trophy, Users, Globe2, Briefcase];

export default function AboutContent({ content }: { content: AboutContentType }) {
  const { hero, intro, mission, vision, journey, achievements, whyChooseUs } = content;

  return (
    <div className="min-h-screen pt-32 pb-0 bg-background relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/5 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute top-1/2 left-0 w-[600px] h-[600px] bg-blue-500/5 blur-[120px] rounded-full pointer-events-none" />

      {/* Hero Banner */}
      <section className="container mx-auto px-6 mb-32 relative z-10 text-center">
        <Badge icon={Building2} text={hero.badge} className="mb-6" />
        <h1 className="hero-rise text-5xl md:text-7xl font-bold text-foreground mb-6 leading-tight">
          {hero.titlePrefix} <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400">{hero.titleHighlight}</span>
        </h1>
        <p
          style={{ animationDelay: "0.1s" }}
          className="hero-rise text-xl text-foreground/60 max-w-3xl mx-auto leading-relaxed"
        >
          {hero.description}
        </p>
      </section>

      {/* Company Introduction */}
      <section className="container mx-auto px-6 mb-32 relative z-10">
        <div className="flex flex-col lg:flex-row gap-16 items-center">
          <div
            data-reveal
            style={{ "--reveal-from": "translateX(-40px)" } as React.CSSProperties}
            className="lg:w-1/2 relative"
          >
            <div className="aspect-[4/3] rounded-3xl overflow-hidden glass border border-foreground/10 relative group">
              <div className="absolute inset-0 bg-primary/20 mix-blend-overlay group-hover:bg-transparent transition-colors duration-700 z-10" />
              <Image
                src={intro.imageUrl}
                alt="Modern Office"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </div>
            {/* Floating stat box */}
            <div className="absolute -bottom-8 -right-8 glass-panel p-6 rounded-2xl border border-foreground/10 shadow-2xl z-20 hidden md:block animate-bounce-slow">
              <div className="text-4xl font-bold text-primary mb-1">{intro.yearsBadgeValue}</div>
              <div className="text-sm font-medium text-foreground/60 uppercase tracking-wider">{intro.yearsBadgeLabel}</div>
            </div>
          </div>

          <div
            data-reveal
            style={{ "--reveal-from": "translateX(40px)" } as React.CSSProperties}
            className="lg:w-1/2"
          >
            <SectionHeader
              title={intro.headingTitle}
              highlight={intro.headingHighlight}
              align="left"
              subtitle={intro.subtitle}
            />
            <div className="space-y-6 text-foreground/70 leading-relaxed text-lg">
              {intro.paragraphs.map((paragraph, idx) => (
                <p key={idx}>{paragraph}</p>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="container mx-auto px-6 mb-32 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
          <GlassCard className="p-8 md:p-10 h-full flex flex-col">
            <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center mb-8 border border-primary/30 shrink-0">
              <Target className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-3xl font-bold text-foreground mb-4">Our Mission</h3>
            <p className="text-foreground/60 text-lg leading-relaxed flex-1">{mission}</p>
          </GlassCard>

          <GlassCard className="p-8 md:p-10 h-full flex flex-col">
            <div className="w-16 h-16 rounded-2xl bg-blue-500/20 flex items-center justify-center mb-8 border border-blue-500/30 shrink-0">
              <Eye className="w-8 h-8 text-blue-400" />
            </div>
            <h3 className="text-3xl font-bold text-foreground mb-4">Our Vision</h3>
            <p className="text-foreground/60 text-lg leading-relaxed flex-1">{vision}</p>
          </GlassCard>
        </div>
      </section>

      {/* Our Journey Timeline */}
      <section className="py-32 relative bg-foreground/5 border-y border-foreground/5">
        <div className="container mx-auto px-6 relative z-10">
          <SectionHeader
            title="Our"
            highlight="Journey"
            subtitle="A decade of continuous innovation, growth, and pushing boundaries."
          />

          <div className="max-w-4xl mx-auto relative mt-20">
            {/* Timeline Line */}
            <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-primary via-blue-500 to-transparent hidden md:block opacity-30" />

            {journey.map((item, idx) => (
              <div key={`${item.year}-${idx}`} className={`relative flex flex-col md:flex-row items-center mb-16 ${idx % 2 === 0 ? 'md:flex-row-reverse' : ''}`}>
                <div className="md:w-1/2" />

                {/* Center Node */}
                <div className="absolute left-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-background border-4 border-primary flex items-center justify-center z-10 hidden md:flex shadow-[0_0_20px_rgba(var(--primary),0.5)]">
                  <div className="w-3 h-3 rounded-full bg-foreground" />
                </div>

                <div
                  data-reveal
                  style={{ "--reveal-from": `translateX(${idx % 2 === 0 ? 50 : -50}px)` } as React.CSSProperties}
                  className={`md:w-1/2 flex ${idx % 2 === 0 ? 'md:justify-start md:pl-16' : 'md:justify-end md:pr-16'} w-full mt-8 md:mt-0`}
                >
                  <GlassCard hoverEffect={false} className="w-full text-left p-8">
                    <div className="text-primary font-bold text-xl mb-2">{item.year}</div>
                    <h3 className="text-2xl font-bold text-foreground mb-3">{item.title}</h3>
                    <p className="text-foreground/60">{item.desc}</p>
                  </GlassCard>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Achievements */}
      <section className="container mx-auto px-6 py-32 relative z-10">
        <SectionHeader
          title="Company"
          highlight="Achievements"
          subtitle="Numbers and recognition that speak to our commitment to excellence."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {achievements.map((item, idx) => {
            const Icon = ACHIEVEMENT_ICONS[idx % ACHIEVEMENT_ICONS.length];
            return (
              <div
                key={`${item.title}-${idx}`}
                data-reveal="y30"
                style={{ "--reveal-delay": `${idx * 0.1}s` } as React.CSSProperties}
                className="glass-panel p-8 rounded-3xl text-center group hover:bg-foreground/5 transition-colors"
              >
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform group-hover:bg-primary/20">
                  <Icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">{item.title}</h3>
                <p className="text-foreground/60 text-sm">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Why Choose Us List */}
      <section className="container mx-auto px-6 mb-32 relative z-10">
        <div className="glass-panel p-8 md:p-16 rounded-[40px] border border-foreground/10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 blur-[100px] rounded-full pointer-events-none" />

          <div className="max-w-3xl">
            <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-10">
              Why <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400">Choose Us?</span>
            </h2>

            <div className="space-y-6">
              {whyChooseUs.map((reason, idx) => (
                <div
                  key={idx}
                  data-reveal
                  style={{ "--reveal-from": "translateX(-20px)", "--reveal-delay": `${idx * 0.1}s` } as React.CSSProperties}
                  className="flex items-center gap-4"
                >
                  <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-5 h-5 text-green-400" />
                  </div>
                  <span className="text-foreground/80 text-lg">{reason}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <CtaBanner
        title="Start Your Digital Transformation"
        subtitle="Join hundreds of successful enterprises that trust Xipra Technology."
        buttonText="Get in Touch"
        buttonHref="/contact"
      />
    </div>
  );
}
