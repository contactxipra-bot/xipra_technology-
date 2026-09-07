"use client";

import { useState } from "react";
import { 
  Trophy, 
  Rocket, 
  Flame, 
  Code2, 
  Palette, 
  Laptop, 
  ArrowRight, 
  Users, 
  Award, 
  ShieldCheck, 
  ChevronRight,
  Zap
} from "lucide-react";
import SectionHeader from "@/components/ui/SectionHeader";
import GlassCard from "@/components/ui/GlassCard";

const TRACKS = [
  {
    id: "graphics",
    icon: Palette,
    title: "Graphics & UI/UX Design",
    teamSize: "1 Member (Solo)",
    desc: "Showcase your artistic and design genius through Video Editing, Poster Design, or Interactive UI/UX Figma prototypes.",
    prizes: [
      { place: "1st Place", amount: "₹5,000", badge: "🥇 Winner" },
      { place: "2nd Place", amount: "₹3,000", badge: "🥈 Runner Up" },
      { place: "3rd Place", amount: "₹2,000", badge: "🥉 2nd Runner Up" },
    ],
    skills: ["Figma", "Adobe Premiere Pro", "After Effects", "Photoshop", "Illustrator", "Canva"],
    color: "from-purple-500/20 to-pink-500/10",
    border: "border-purple-500/30",
    badgeColor: "text-purple-400 bg-purple-500/10 border-purple-500/20"
  },
  {
    id: "frontend",
    icon: Code2,
    title: "Frontend Wizardry",
    teamSize: "Up to 2 Members",
    desc: "Craft high-performance, responsive, interactive, and visually stunning web interfaces with cutting-edge UI frameworks.",
    prizes: [
      { place: "1st Place", amount: "₹15,000", badge: "🥇 Winner" },
      { place: "2nd Place", amount: "₹10,000", badge: "🥈 Runner Up" },
      { place: "3rd Place", amount: "₹5,000", badge: "🥉 2nd Runner Up" },
    ],
    skills: ["React.js", "Next.js", "Vue.js", "Tailwind CSS", "JavaScript / TypeScript", "Animations"],
    color: "from-blue-500/20 to-cyan-500/10",
    border: "border-blue-500/30",
    badgeColor: "text-blue-400 bg-blue-500/10 border-blue-500/20"
  },
  {
    id: "fullstack",
    icon: Laptop,
    title: "Fullstack Innovation",
    teamSize: "Up to 4 Members",
    desc: "Architect, build, and deploy complete end-to-end applications with resilient backend architectures, APIs, and databases.",
    prizes: [
      { place: "1st Place", amount: "₹30,000", badge: "🥇 Winner" },
      { place: "2nd Place", amount: "₹20,000", badge: "🥈 Runner Up" },
      { place: "3rd Place", amount: "₹10,000", badge: "🥉 2nd Runner Up" },
    ],
    skills: ["Node.js / Express", ".NET Core", "Python / Django", "PHP Laravel", "PostgreSQL / MongoDB", "Cloud Deployments"],
    color: "from-emerald-500/20 to-teal-500/10",
    border: "border-emerald-500/30",
    badgeColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
  }
];

const PERKS = [
  { icon: Trophy, title: "₹1,00,000+ Prize Pool", desc: "Generous cash prizes and awards for top teams across all three tracks." },
  { icon: Award, title: "Verifiable Certificate", desc: "Authentic, cryptographically verifiable certificates for all valid submissions." },
  { icon: Rocket, title: "Mentorship & Guidance", desc: "Direct feedback and masterclasses from industry experts and architects." },
  { icon: Users, title: "Internship & Job Opportunities", desc: "Top performers get direct interview calls and placement priority at Xipra Tech." },
  { icon: Zap, title: "100% Virtual / Online", desc: "Participate from anywhere across Gujarat and India without travel hassles." },
  { icon: ShieldCheck, title: "Fair & Transparent Judging", desc: "Evaluated by independent tech leads based on innovation, code quality, and execution." }
];

const FAQS = [
  {
    q: "Who is eligible to participate?",
    a: "College students, diploma students, freshers, and aspiring developers across Gujarat and India are eligible to register."
  },
  {
    q: "Is the hackathon online or offline?",
    a: "The entire Gujarat Virtual Hackathon is 100% online/virtual! You can participate and submit projects from your home or college."
  },
  {
    q: "Can I participate individually or in a team?",
    a: "Yes! Graphics Track allows solo participation (1 member). Frontend allows up to 2 members. Fullstack allows up to 4 members."
  },
  {
    q: "How will projects be evaluated?",
    a: "Submissions are reviewed for originality, technical complexity, UI/UX polish, functionality, code structure, and adherence to the problem statement."
  },
  {
    q: "Will all participants receive certificates?",
    a: "Yes! Every participant who submits a complete, functional project will receive an authenticated Verifiable Certificate of Participation."
  }
];

export default function HackathonPage() {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  return (
    <div className="pt-28 pb-20 overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[500px] pointer-events-none opacity-20 -z-10">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary rounded-full blur-[140px]" />
        <div className="absolute top-20 right-1/4 w-96 h-96 bg-amber-500 rounded-full blur-[140px]" />
      </div>

      <div className="container mx-auto px-6 max-w-6xl">
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-500/10 to-primary/10 border border-primary/20 text-xs font-semibold mb-6">
            <Flame className="w-4 h-4 text-rose-500 animate-pulse" />
            <span className="bg-gradient-to-r from-amber-400 to-primary bg-clip-text text-transparent font-bold">
              GUJARAT VIRTUAL HACKATHON 2026
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary/20 text-primary uppercase tracking-wide">
              Coming Soon
            </span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-foreground leading-tight mb-6">
            Innovate, Code & Win Big with{" "}
            <span className="bg-gradient-to-r from-primary via-blue-400 to-amber-400 bg-clip-text text-transparent">
              Gujarat Virtual Hackathon
            </span>
          </h1>

          <p className="text-lg text-foreground/70 leading-relaxed mb-8">
            Presented by <strong>Xipra Technology</strong> & <strong>Wiregen AI</strong>. Join Gujarat&apos;s most anticipated virtual hackathon, showcase your engineering and design prowess, and win from a ₹1,00,000+ prize pool!
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="https://hackathon.xipra.in/"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-primary via-blue-600 to-primary text-white font-bold text-sm shadow-xl shadow-primary/25 hover:shadow-primary/40 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2.5 group"
            >
              <Rocket className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
              Visit Official Hackathon Portal
              <ArrowRight className="w-4 h-4" />
            </a>

            <a
              href="https://wa.me/919033387254?text=Hello%20Xipra%20Technology!%20I%20am%20interested%20in%20joining%20the%20Gujarat%20Virtual%20Hackathon%202026.%20Please%20notify%20me%20when%20registration%20opens!"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-card border border-border text-foreground font-semibold text-sm hover:bg-muted transition-colors flex items-center justify-center gap-2"
            >
              Pre-Register via WhatsApp
            </a>
          </div>
        </div>

        {/* Highlight Stats Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-20">
          <div className="p-6 rounded-2xl bg-card/60 backdrop-blur-md border border-border text-center">
            <p className="text-3xl font-black bg-gradient-to-r from-amber-400 to-rose-400 bg-clip-text text-transparent">
              ₹1,00,000+
            </p>
            <p className="text-xs text-muted-foreground mt-1 font-medium">Total Prize Pool</p>
          </div>
          <div className="p-6 rounded-2xl bg-card/60 backdrop-blur-md border border-border text-center">
            <p className="text-3xl font-black text-primary">3</p>
            <p className="text-xs text-muted-foreground mt-1 font-medium">Competition Tracks</p>
          </div>
          <div className="p-6 rounded-2xl bg-card/60 backdrop-blur-md border border-border text-center">
            <p className="text-3xl font-black text-emerald-400">100%</p>
            <p className="text-xs text-muted-foreground mt-1 font-medium">Virtual / Online</p>
          </div>
          <div className="p-6 rounded-2xl bg-card/60 backdrop-blur-md border border-border text-center">
            <p className="text-3xl font-black text-blue-400">Verified</p>
            <p className="text-xs text-muted-foreground mt-1 font-medium">Digital Certificates</p>
          </div>
        </div>

        {/* Tracks Section */}
        <div className="mb-20">
          <SectionHeader
            title="Choose Your"
            highlight="Battlefield"
            subtitle="Compete in specialized tracks tailored for designers, frontend developers, and full-stack architects."
          />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-12">
            {TRACKS.map((track) => {
              const Icon = track.icon;
              return (
                <div
                  key={track.id}
                  className={`rounded-3xl bg-gradient-to-b ${track.color} to-card/60 p-6 sm:p-8 border ${track.border} flex flex-col justify-between backdrop-blur-sm relative overflow-hidden group hover:border-primary transition-all duration-300`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-4">
                      <div className="w-12 h-12 rounded-2xl bg-background/80 border border-border flex items-center justify-center text-primary shadow-sm">
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${track.badgeColor}`}>
                        {track.teamSize}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-foreground mb-2">{track.title}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed mb-6">{track.desc}</p>

                    {/* Prize Tiers */}
                    <div className="space-y-2 mb-6 bg-card/50 p-4 rounded-2xl border border-border/60">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-2">Track Prizes:</p>
                      {track.prizes.map((p, i) => (
                        <div key={i} className="flex items-center justify-between text-xs">
                          <span className="font-medium text-foreground/80">{p.place}</span>
                          <span className="font-bold text-amber-400">{p.amount}</span>
                        </div>
                      ))}
                    </div>

                    {/* Recommended Tech */}
                    <div>
                      <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Key Skills:</p>
                      <div className="flex flex-wrap gap-1.5">
                        {track.skills.map((skill, i) => (
                          <span key={i} className="text-[10px] px-2 py-0.5 rounded-md bg-foreground/5 text-foreground/80 border border-border">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 pt-4 border-t border-border/40">
                    <a
                      href="https://hackathon.xipra.in/register"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2.5 px-4 rounded-xl bg-primary/10 hover:bg-primary text-primary hover:text-white font-semibold text-xs text-center transition-all flex items-center justify-center gap-1.5"
                    >
                      Register for this Track
                      <ChevronRight className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Perks & Benefits */}
        <div className="mb-20">
          <SectionHeader
            title="Everything You Need to"
            highlight="Propel Your Career"
            subtitle="More than just prizes: gain exposure, industry feedback, and official credentials."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
            {PERKS.map((perk, i) => {
              const Icon = perk.icon;
              return (
                <GlassCard key={i} className="p-6 rounded-2xl hover:border-primary/50 transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-4">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h4 className="text-base font-bold text-foreground mb-1.5">{perk.title}</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">{perk.desc}</p>
                </GlassCard>
              );
            })}
          </div>
        </div>

        {/* FAQs */}
        <div className="max-w-3xl mx-auto mb-20">
          <SectionHeader
            title="Frequently Asked"
            highlight="Questions"
            subtitle="Everything you need to know about the upcoming Gujarat Virtual Hackathon."
          />

          <div className="mt-10 space-y-4">
            {FAQS.map((faq, i) => (
              <div 
                key={i} 
                className="rounded-2xl bg-card border border-border overflow-hidden transition-colors"
              >
                <button
                  onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                  className="w-full p-5 text-left font-semibold text-sm text-foreground flex items-center justify-between gap-4"
                >
                  <span>{faq.q}</span>
                  <ChevronRight className={`w-4 h-4 text-primary shrink-0 transition-transform duration-200 ${activeFaq === i ? "rotate-90" : ""}`} />
                </button>
                {activeFaq === i && (
                  <div className="px-5 pb-5 pt-1 text-xs text-muted-foreground leading-relaxed border-t border-border/40">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* CTA Banner */}
        <div className="rounded-3xl bg-gradient-to-r from-primary via-blue-700 to-indigo-800 p-8 sm:p-12 text-center text-white relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
          <h3 className="text-2xl sm:text-4xl font-extrabold mb-4">Ready to Build the Future?</h3>
          <p className="text-sm text-white/80 max-w-xl mx-auto mb-8">
            Stay tuned for official registration dates and announcements. Pre-register today to get priority notifications and slot confirmations!
          </p>
          <a
            href="https://wa.me/919033387254?text=Hello%20Xipra%20Technology!%20Please%20keep%20me%20updated%20on%20Gujarat%20Virtual%20Hackathon%20announcements."
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-white text-primary font-bold text-sm shadow-xl hover:bg-white/90 hover:scale-105 active:scale-95 transition-all"
          >
            Get Live WhatsApp Updates 🚀
          </a>
        </div>
      </div>
    </div>
  );
}
