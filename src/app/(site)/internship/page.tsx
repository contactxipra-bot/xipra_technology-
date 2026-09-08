"use client";

import { useState } from "react";
import { GraduationCap, Briefcase, Award, MonitorPlay, Users, BookOpen, Send, CheckCircle2, AlertCircle } from "lucide-react";
import SectionHeader from "@/components/ui/SectionHeader";
import Badge from "@/components/ui/Badge";
import GlassCard from "@/components/ui/GlassCard";

const benefits = [
  { icon: MonitorPlay, title: "Live Projects", desc: "Work on real enterprise applications currently in production." },
  { icon: Briefcase, title: "Industrial Training", desc: "Learn industry-standard workflows, agile methodologies, and best practices." },
  { icon: Award, title: "Verifiable Certificate", desc: "Earn a certificate upon successful completion of the internship program." },
  { icon: Users, title: "Placement Assistance", desc: "Get dedicated support and recommendations for top tech companies." },
  { icon: BookOpen, title: "Interview Preparation", desc: "Mock interviews, resume building, and technical assessments." },
  { icon: GraduationCap, title: "Learning Environment", desc: "Mentorship from senior architects in a fast-paced tech hub." },
];

const COURSE_LABELS: Record<string, string> = {
  dotnet: ".NET Technology",
  php: "PHP & MySQL",
  react: "React & Next.js",
  mobile: "Android / iOS Development",
  design: "UI/UX & Web Design",
};

const GENDER_LABELS: Record<string, string> = {
  male: "Male",
  female: "Female",
  other: "Other",
};

type Status = "idle" | "submitting" | "success" | "error";

export default function InternshipPage() {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    mobile: "",
    education: "",
    gender: "",
    course: "",
    address: "",
    company: "", // honeypot
  });
  const [status, setStatus] = useState<Status>("idle");
  const [feedback, setFeedback] = useState("");

  const update = (field: keyof typeof form) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("submitting");
    setFeedback("");
    try {
      const res = await fetch("/api/public/internship", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: form.fullName,
          email: form.email,
          phone: form.mobile,
          course: COURSE_LABELS[form.course] || form.course,
          education: form.education,
          gender: GENDER_LABELS[form.gender] || form.gender,
          address: form.address,
          company: form.company,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data?.error?.message || "Something went wrong. Please try again.");
      }
      setStatus("success");
      setFeedback(data.message || "Thank you! Your application has been submitted.");
      setForm({
        fullName: "",
        email: "",
        mobile: "",
        education: "",
        gender: "",
        course: "",
        address: "",
        company: "",
      });
    } catch (err) {
      setStatus("error");
      setFeedback(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    }
  }

  return (
    <div className="min-h-screen pt-32 pb-0 bg-background relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute top-1/2 left-0 w-[500px] h-[500px] bg-purple-500/5 blur-[120px] rounded-full pointer-events-none" />

      {/* Hero Section */}
      <section className="container mx-auto px-6 mb-24 relative z-10 text-center">
        <Badge icon={GraduationCap} text="Career Launcher" className="mb-6" />
        <h1 className="hero-rise text-5xl md:text-7xl font-bold text-foreground mb-6 leading-tight">
          Premium <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400">Internship Program</span>
        </h1>
        <p
          style={{ animationDelay: "0.1s" }}
          className="hero-rise text-xl text-foreground/60 max-w-3xl mx-auto leading-relaxed"
        >
          Bridge the gap between academic learning and industry demands. Join Xipra Technology for an immersive, hands-on training experience.
        </p>
      </section>

      {/* Overview & Timeline */}
      <section className="container mx-auto px-6 mb-32 relative z-10">
        <div className="flex flex-col lg:flex-row gap-16">
          <div className="lg:w-1/2">
            <SectionHeader
              title="Program"
              highlight="Overview"
              align="left"
              subtitle="Our internship is not about fetching coffee. It's about writing code, designing interfaces, and solving real problems."
            />

            <div className="space-y-6 mt-12">
              {benefits.map((benefit, idx) => (
                <div
                  key={benefit.title}
                  data-reveal
                  style={{ "--reveal-from": "translateX(-20px)", "--reveal-delay": `${idx * 0.1}s` } as React.CSSProperties}
                  className="flex items-start gap-4 p-4 rounded-2xl hover:bg-foreground/5 transition-colors border border-transparent hover:border-foreground/10"
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20">
                    <benefit.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-foreground mb-1">{benefit.title}</h3>
                    <p className="text-foreground/60">{benefit.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:w-1/2">
            <GlassCard hoverEffect={false} className="sticky top-32 p-8 md:p-12 border-primary/20 bg-background/40">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[80px] rounded-full pointer-events-none" />

              <h3 className="text-3xl font-bold text-foreground mb-8">Apply for Internship</h3>

              <form className="space-y-5" onSubmit={handleSubmit}>
                {/* Honeypot field — hidden from humans, catches bots */}
                <input
                  type="text"
                  name="company"
                  value={form.company}
                  onChange={update("company")}
                  tabIndex={-1}
                  autoComplete="off"
                  aria-hidden="true"
                  className="hidden"
                />

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground/50 uppercase tracking-wider">Full Name</label>
                  <input
                    type="text"
                    required
                    value={form.fullName}
                    onChange={update("fullName")}
                    placeholder="John Doe"
                    className="w-full bg-background/40 border border-foreground/10 rounded-xl px-4 py-3.5 text-foreground placeholder:text-foreground/20 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground/50 uppercase tracking-wider">Email Address</label>
                    <input
                      type="email"
                      required
                      value={form.email}
                      onChange={update("email")}
                      placeholder="john@example.com"
                      className="w-full bg-background/40 border border-foreground/10 rounded-xl px-4 py-3.5 text-foreground placeholder:text-foreground/20 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground/50 uppercase tracking-wider">Mobile Number</label>
                    <input
                      type="tel"
                      required
                      value={form.mobile}
                      onChange={update("mobile")}
                      placeholder="+1 234 567 8900"
                      className="w-full bg-background/40 border border-foreground/10 rounded-xl px-4 py-3.5 text-foreground placeholder:text-foreground/20 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground/50 uppercase tracking-wider">Education</label>
                    <input
                      type="text"
                      value={form.education}
                      onChange={update("education")}
                      placeholder="e.g. B.Tech Computer Science"
                      className="w-full bg-background/40 border border-foreground/10 rounded-xl px-4 py-3.5 text-foreground placeholder:text-foreground/20 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground/50 uppercase tracking-wider">Gender</label>
                    <select
                      required
                      value={form.gender}
                      onChange={update("gender")}
                      className="w-full bg-background/40 border border-foreground/10 rounded-xl px-4 py-3.5 text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all appearance-none"
                    >
                      <option value="" disabled>Select Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground/50 uppercase tracking-wider">Apply For Course</label>
                  <select
                    required
                    value={form.course}
                    onChange={update("course")}
                    className="w-full bg-background/40 border border-foreground/10 rounded-xl px-4 py-3.5 text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all appearance-none"
                  >
                    <option value="" disabled>Select Technology</option>
                    
                    	<option value="ARTIFICIAL INTELLIGENCE"> ARTIFICIAL INTELLIGENCE</option>
	<option value="2D-3D GAMING COURSE">2D-3D GAMING COURSE</option>
	<option value="ELECTRONIC PROJECT TRAINING">ELECTRONIC PROJECT TRAINING</option>
	<option value="ANDROID TRAINING">ANDROID TRAINING</option>
	<option value="IOS TRAINING">IOS TRAINING</option>
	<option value="PYTHON TRAINING">PYTHON TRAINING</option>
	<option value="WEB DESIGNING">WEB DESIGNING</option>
	<option value="GRAPHICS DESIGNING">GRAPHICS DESIGNING</option>
	<option value="FILM &amp; VIDEO EDITING">FILM &amp; VIDEO EDITING</option>
	<option value="AUTOCAD MASTER">AUTOCAD MASTER</option>
	<option value="2D-3D ANIMATION">2D-3D ANIMATION</option>
	<option value="VISUAL EFFECTS (VFX)">VISUAL EFFECTS (VFX)</option>
	<option value="AUTODESK MAYA, AUTODESK 3DS MAX">AUTODESK MAYA, AUTODESK 3DS MAX</option>
	<option value="BLENDER, CINEMA 4D, ZBRUSH">BLENDER, CINEMA 4D, ZBRUSH</option>
	<option value="SEO &amp; DIGITAL MARKETING">SEO &amp; DIGITAL MARKETING</option>
	<option value="JAVA TRAINING">JAVA TRAINING</option>
	<option value=".NET TRAINING">.NET TRAINING</option>
	<option value="PHP TRAINING">PHP TRAINING</option>
	<option value="C &amp; C++ Training">C &amp; C++ TRAINING</option>
	<option value="COMBO COURSE (C, C++, JAVA, PYTHON, HTML)">
COMBO COURSE (C, C++, JAVA, PYTHON, HTML)
</option>
	<option value="XAMARIN TRAINING">XAMARIN TRAINING</option>
	<option value="IONIC TRAINING">IONIC TRAINING</option>
	<option value="EMBEDDED SYSTEM &amp; IOT  TRAINING">EMBEDDED SYSTEM &amp; IOT  TRAINING  </option>
	<option value="DJANGO TRAINING">DJANGO TRAINING</option>
	<option value="CORDOVA TRAINING">CORDOVA TRAINING</option>
	<option value="FULLSTACK DEVELOPMENT TRAINING">FULLSTACK DEVELOPMENT TRAINING</option>
	<option value="FRONTEND DEVELOPMENT TRAINING">FRONTEND DEVELOPMENT TRAINING</option>
	<option value="REACT JS TRAINING">REACT JS TRAINING</option>
	<option value="ANGULAR JS TRAINING">ANGULAR JS TRAINING</option>
	<option value="NODE JS TRAINING">NODE JS TRAINING</option>
	<option value="DBMS TRAINING">DBMS TRAINING</option>
	<option value="LIVE PROJECT TRAINING/INTERNSHIP">LIVE PROJECT TRAINING/INTERNSHIP
</option>
	<option value="CYBER SECURITY / ETHICAL HACKING">CYBER SECURITY / ETHICAL HACKING</option>
	<option value="DATA ANALYTICS">DATA ANALYTICS </option>
	<option value="UI / UX DESIGN">UI / UX DESIGN</option>
	<option value="TALLY WITH GST COURSE">TALLY WITH GST COURSE</option>
	<option value="SPOKEN ENGLISH AND PERSONALITY DEVELOPMENT">SPOKEN ENGLISH AND PERSONALITY DEVELOPMENT </option>
                    
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground/50 uppercase tracking-wider">Address</label>
                  <textarea
                    rows={3}
                    value={form.address}
                    onChange={update("address")}
                    placeholder="Your full address..."
                    className="w-full bg-background/40 border border-foreground/10 rounded-xl px-4 py-3.5 text-foreground placeholder:text-foreground/20 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all resize-none"
                  />
                </div>

                {feedback && (
                  <div
                    className={`flex items-start gap-2 rounded-xl px-4 py-3 text-sm ${
                      status === "success"
                        ? "bg-green-500/10 border border-green-500/30 text-green-400"
                        : "bg-red-500/10 border border-red-500/30 text-red-400"
                    }`}
                  >
                    {status === "success" ? (
                      <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                    )}
                    <span>{feedback}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={status === "submitting"}
                  className="w-full py-4 mt-4 rounded-xl bg-primary text-foreground font-bold flex items-center justify-center gap-2 hover:bg-primary/90 hover:scale-[1.02] transition-all shadow-[0_0_20px_rgba(var(--primary),0.4)] group disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {status === "submitting" ? (
                    <>
                      <div className="w-4 h-4 border-2 border-foreground/30 border-t-white rounded-full animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      Register Now
                      <Send className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    </>
                  )}
                </button>
              </form>
            </GlassCard>
          </div>
        </div>
      </section>
    </div>
  );
}
