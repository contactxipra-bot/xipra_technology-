"use client";

import { useState } from "react";
import { Send, MapPin, Phone, Mail, Clock, Map, Building, CheckCircle2, AlertCircle } from "lucide-react";
import { FaWhatsapp, FaPhoneAlt, FaEnvelope } from "react-icons/fa";
import SectionHeader from "@/components/ui/SectionHeader";
import GlassCard from "@/components/ui/GlassCard";
import Badge from "@/components/ui/Badge";

type Status = "idle" | "submitting" | "success" | "error";

const EMPTY_FIELD_ERRORS = {
  fullName: "",
  mobile: "",
  email: "",
  subject: "",
  message: "",
};

// Maps the backend Zod field names (publicContactSchema) to this form's field keys.
const FIELD_MAP: Record<string, keyof typeof EMPTY_FIELD_ERRORS> = {
  name: "fullName",
  phone: "mobile",
  email: "email",
  subject: "subject",
  message: "message",
};

export type ContactSettings = {
  phones: string[];
  emails: string[];
  addresses: string[];
  businessHours: string;
  whatsappNumber: string;
  googleMapUrl: string;
};

const DEFAULTS: ContactSettings = {
  phones: ["+91 9033387254", "+91 8866116482"],
  emails: ["xipratechnology@gmail.com", "info@xipratechnology.com", "contact@xipratechnology.com"],
  addresses: [
    "94/B, First Floor, Shraddhapark, Mahavirnagar, Himmatnagar, Gujarat, India",
    "Office No: TF-32, Pratham Square, Sahakari Jin Road, Himmatnagar, Gujarat, India",
  ],
  businessHours: "Mon - Sat: 9:00 AM - 6:30 PM",
  whatsappNumber: "919033387254",
  googleMapUrl: "",
};

const OFFICE_LABELS = ["Head Office", "New Office"];

export default function ContactPageClient({ settings }: { settings?: Partial<ContactSettings> }) {
  const phones = settings?.phones?.length ? settings.phones : DEFAULTS.phones;
  const emails = settings?.emails?.length ? settings.emails : DEFAULTS.emails;
  const addresses = settings?.addresses?.length ? settings.addresses : DEFAULTS.addresses;
  const businessHours = settings?.businessHours || DEFAULTS.businessHours;
  const whatsappNumber = (settings?.whatsappNumber || DEFAULTS.whatsappNumber).replace(/[^\d]/g, "");
  const googleMapUrl = settings?.googleMapUrl || "";
  const primaryPhoneDigits = (phones[0] || "").replace(/[^\d+]/g, "");
  const primaryEmail = emails[0] || DEFAULTS.emails[0];

  const [form, setForm] = useState({
    fullName: "",
    mobile: "",
    email: "",
    subject: "",
    message: "",
    company: "", // honeypot — must stay empty
  });
  const [status, setStatus] = useState<Status>("idle");
  const [feedback, setFeedback] = useState("");
  const [fieldErrors, setFieldErrors] = useState(EMPTY_FIELD_ERRORS);

  const update = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    if (field in EMPTY_FIELD_ERRORS) {
      setFieldErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("submitting");
    setFeedback("");
    setFieldErrors(EMPTY_FIELD_ERRORS);
    try {
      const res = await fetch("/api/public/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.fullName,
          phone: form.mobile,
          email: form.email,
          subject: form.subject,
          message: form.message,
          company: form.company,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        // Zod validation failures arrive as { message: "Validation failed",
        // details: { fieldErrors: { <backend field>: [messages] } } } — the
        // top-level message is a generic label, so surface the specific
        // per-field message instead and map it back to this form's inputs.
        const rawFieldErrors = data?.error?.details?.fieldErrors as Record<string, string[]> | undefined;
        if (rawFieldErrors) {
          const mapped = { ...EMPTY_FIELD_ERRORS };
          let firstMessage = "";
          for (const [backendField, messages] of Object.entries(rawFieldErrors)) {
            const formField = FIELD_MAP[backendField];
            const message = messages?.[0];
            if (formField && message) {
              mapped[formField] = message;
              if (!firstMessage) firstMessage = message;
            }
          }
          setFieldErrors(mapped);
          throw new Error(firstMessage || data?.error?.message || "Please check the highlighted fields.");
        }
        throw new Error(data?.error?.message || "Something went wrong. Please try again.");
      }
      setStatus("success");
      setFeedback(data.message || "Thank you! Your message has been received.");
      setForm({ fullName: "", mobile: "", email: "", subject: "", message: "", company: "" });
    } catch (err) {
      setStatus("error");
      setFeedback(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    }
  }

  return (
    <div className="min-h-screen pt-32 pb-0 bg-background relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/5 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-500/5 blur-[120px] rounded-full pointer-events-none" />

      {/* Hero Section */}
      <section className="container mx-auto px-6 mb-16 relative z-10 text-center">
        <Badge icon={Map} text="Contact Us" className="mb-6" />
        <SectionHeader
          title="Get in"
          highlight="Touch"
          subtitle="Whether you have a question about features, trials, pricing, need a demo, or anything else, our team is ready to answer all your questions."
        />
      </section>

      <section className="container mx-auto px-6 relative z-10 mb-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-7xl mx-auto">

          {/* Left Column: Form */}
          <GlassCard hoverEffect={false} className="p-8 md:p-12">
            <h2 className="text-3xl font-bold text-foreground mb-8">Send a Message</h2>

            <form className="space-y-6" onSubmit={handleSubmit}>
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

              <div className="relative group">
                <input
                  type="text"
                  id="fullName"
                  required
                  value={form.fullName}
                  onChange={update("fullName")}
                  className={`peer w-full bg-background/40 border rounded-xl px-4 pt-6 pb-2 text-foreground placeholder-transparent focus:outline-none focus:ring-1 transition-all shadow-inner ${
                    fieldErrors.fullName
                      ? "border-red-500/50 focus:border-red-500 focus:ring-red-500"
                      : "border-foreground/10 focus:border-primary focus:ring-primary"
                  }`}
                  placeholder="John Doe"
                />
                <label htmlFor="fullName" className="absolute left-4 top-2 text-[10px] font-bold text-foreground/50 uppercase tracking-wider transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:top-4 peer-focus:top-2 peer-focus:text-[10px] peer-focus:text-primary pointer-events-none">Full Name</label>
                {fieldErrors.fullName && <p className="mt-1.5 text-xs text-red-400">{fieldErrors.fullName}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="relative group">
                  <input
                    type="tel"
                    id="mobile"
                    value={form.mobile}
                    onChange={update("mobile")}
                    className={`peer w-full bg-background/40 border rounded-xl px-4 pt-6 pb-2 text-foreground placeholder-transparent focus:outline-none focus:ring-1 transition-all shadow-inner ${
                      fieldErrors.mobile
                        ? "border-red-500/50 focus:border-red-500 focus:ring-red-500"
                        : "border-foreground/10 focus:border-primary focus:ring-primary"
                    }`}
                    placeholder="+1 234 567 8900"
                  />
                  <label htmlFor="mobile" className="absolute left-4 top-2 text-[10px] font-bold text-foreground/50 uppercase tracking-wider transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:top-4 peer-focus:top-2 peer-focus:text-[10px] peer-focus:text-primary pointer-events-none">Mobile Number</label>
                  {fieldErrors.mobile && <p className="mt-1.5 text-xs text-red-400">{fieldErrors.mobile}</p>}
                </div>
                <div className="relative group">
                  <input
                    type="email"
                    id="email"
                    required
                    value={form.email}
                    onChange={update("email")}
                    className={`peer w-full bg-background/40 border rounded-xl px-4 pt-6 pb-2 text-foreground placeholder-transparent focus:outline-none focus:ring-1 transition-all shadow-inner ${
                      fieldErrors.email
                        ? "border-red-500/50 focus:border-red-500 focus:ring-red-500"
                        : "border-foreground/10 focus:border-primary focus:ring-primary"
                    }`}
                    placeholder="john@example.com"
                  />
                  <label htmlFor="email" className="absolute left-4 top-2 text-[10px] font-bold text-foreground/50 uppercase tracking-wider transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:top-4 peer-focus:top-2 peer-focus:text-[10px] peer-focus:text-primary pointer-events-none">Email Address</label>
                  {fieldErrors.email && <p className="mt-1.5 text-xs text-red-400">{fieldErrors.email}</p>}
                </div>
              </div>

              <div className="relative group">
                <input
                  type="text"
                  id="subject"
                  value={form.subject}
                  onChange={update("subject")}
                  className={`peer w-full bg-background/40 border rounded-xl px-4 pt-6 pb-2 text-foreground placeholder-transparent focus:outline-none focus:ring-1 transition-all shadow-inner ${
                    fieldErrors.subject
                      ? "border-red-500/50 focus:border-red-500 focus:ring-red-500"
                      : "border-foreground/10 focus:border-primary focus:ring-primary"
                  }`}
                  placeholder="How can we help you?"
                />
                <label htmlFor="subject" className="absolute left-4 top-2 text-[10px] font-bold text-foreground/50 uppercase tracking-wider transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:top-4 peer-focus:top-2 peer-focus:text-[10px] peer-focus:text-primary pointer-events-none">Subject</label>
                {fieldErrors.subject && <p className="mt-1.5 text-xs text-red-400">{fieldErrors.subject}</p>}
              </div>

              <div className="relative group">
                <textarea
                  id="message"
                  rows={5}
                  required
                  value={form.message}
                  onChange={update("message")}
                  className={`peer w-full bg-background/40 border rounded-xl px-4 pt-6 pb-2 text-foreground placeholder-transparent focus:outline-none focus:ring-1 transition-all shadow-inner resize-none ${
                    fieldErrors.message
                      ? "border-red-500/50 focus:border-red-500 focus:ring-red-500"
                      : "border-foreground/10 focus:border-primary focus:ring-primary"
                  }`}
                  placeholder="Tell us about your project or inquiry..."
                />
                <label htmlFor="message" className="absolute left-4 top-2 text-[10px] font-bold text-foreground/50 uppercase tracking-wider transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:top-4 peer-focus:top-2 peer-focus:text-[10px] peer-focus:text-primary pointer-events-none">Message</label>
                {fieldErrors.message && <p className="mt-1.5 text-xs text-red-400">{fieldErrors.message}</p>}
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
                className="w-full py-4 rounded-xl bg-primary text-foreground font-bold flex items-center justify-center gap-2 hover:bg-primary/90 hover:scale-[1.02] transition-all shadow-[0_0_20px_rgba(var(--primary),0.4)] group mt-4 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {status === "submitting" ? (
                  <>
                    <div className="w-5 h-5 border-2 border-foreground/30 border-t-white rounded-full animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    Send Message
                    <Send className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  </>
                )}
              </button>
            </form>
          </GlassCard>

          {/* Right Column: Company Info */}
          <div className="flex flex-col gap-8">
            <GlassCard hoverEffect={false} className="p-8 border-primary/20 bg-primary/5">
              <h2 className="text-2xl font-bold text-foreground mb-8">Contact Information</h2>

              <div className="space-y-8">
                {/* Mobiles */}
                <div className="flex items-start gap-5">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center shrink-0 border border-primary/30">
                    <Phone className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-foreground/50 mb-1 uppercase tracking-wider">Mobile</div>
                    {phones.map((phone, idx) => (
                      <div key={idx} className="text-foreground text-lg font-medium">{phone}</div>
                    ))}
                  </div>
                </div>

                {/* Emails */}
                <div className="flex items-start gap-5">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center shrink-0 border border-primary/30">
                    <Mail className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-foreground/50 mb-1 uppercase tracking-wider">Emails</div>
                    {emails.map((email, idx) => (
                      <div key={idx} className="text-foreground font-medium">{email}</div>
                    ))}
                  </div>
                </div>

                {/* Offices */}
                {addresses.map((address, idx) => (
                  <div key={idx} className="flex items-start gap-5">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 border ${
                        idx === 0 ? "bg-primary/20 border-primary/30" : "bg-blue-500/20 border-blue-500/30"
                      }`}
                    >
                      {idx === 0 ? (
                        <Building className="w-5 h-5 text-primary" />
                      ) : (
                        <MapPin className="w-5 h-5 text-blue-400" />
                      )}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-foreground/50 mb-1 uppercase tracking-wider">
                        {OFFICE_LABELS[idx] || `Office ${idx + 1}`}
                      </div>
                      <div className="text-foreground/80 leading-relaxed">{address}</div>
                    </div>
                  </div>
                ))}

                {/* Business Hours */}
                <div className="flex items-start gap-5">
                  <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center shrink-0 border border-green-500/30">
                    <Clock className="w-5 h-5 text-green-400" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-foreground/50 mb-1 uppercase tracking-wider">Business Hours</div>
                    <div className="text-foreground font-medium">{businessHours}</div>
                    <div className="text-foreground/60 text-sm">Sunday: Closed</div>
                  </div>
                </div>
              </div>
            </GlassCard>

            {/* Google Map Placeholder & Action Buttons */}
            <div className="flex flex-col gap-4">
              {googleMapUrl ? (
                <a
                  href={googleMapUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="glass-panel p-2 rounded-3xl h-64 relative overflow-hidden group block"
                >
                  <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=2074&auto=format&fit=crop')] bg-cover bg-center opacity-40 group-hover:opacity-60 transition-opacity duration-500" />
                  <div className="absolute inset-0 bg-background/50" />
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="px-6 py-3 rounded-full bg-background/50 backdrop-blur-md border border-foreground/10 text-foreground font-medium flex items-center gap-2 shadow-xl">
                      <MapPin className="w-4 h-4 text-primary" />
                      View on Google Maps
                    </div>
                  </div>
                </a>
              ) : (
                <div className="glass-panel p-2 rounded-3xl h-64 relative overflow-hidden group">
                  <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=2074&auto=format&fit=crop')] bg-cover bg-center opacity-40 group-hover:opacity-60 transition-opacity duration-500" />
                  <div className="absolute inset-0 bg-background/50" />
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="px-6 py-3 rounded-full bg-background/50 backdrop-blur-md border border-foreground/10 text-foreground font-medium flex items-center gap-2 shadow-xl">
                      <MapPin className="w-4 h-4 text-primary" />
                      View on Google Maps
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="grid grid-cols-3 gap-4">
                <a href={`https://wa.me/${whatsappNumber}?text=*Hello%20Xipra%20Technology!*%20%F0%9F%91%8B%0A%0AI%20recently%20visited%20your%20website%20and%20I%20am%20very%20interested%20in%20your%20services.%20%F0%9F%9A%80%0A%0A*I%20would%20like%20to%20know%20more%20about%3A*%0A%F0%9F%8C%90%20Web%20Development%0A%F0%9F%93%B1%20Mobile%20App%20Development%0A%F0%9F%8E%A8%20UI%2FUX%20Design%0A%0APlease%20let%20me%20know%20a%20good%20time%20to%20connect!%20%E2%9C%A8`} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center justify-center gap-2 p-4 glass-panel rounded-2xl hover:bg-green-500/10 hover:border-green-500/50 transition-colors text-foreground/80 hover:text-green-400">
                  <FaWhatsapp className="w-6 h-6" />
                  <span className="text-xs font-bold uppercase">WhatsApp</span>
                </a>
                <a href={`tel:${primaryPhoneDigits}`} className="flex flex-col items-center justify-center gap-2 p-4 glass-panel rounded-2xl hover:bg-primary/10 hover:border-primary/50 transition-colors text-foreground/80 hover:text-primary">
                  <FaPhoneAlt className="w-6 h-6" />
                  <span className="text-xs font-bold uppercase">Call</span>
                </a>
                <a href={`mailto:${primaryEmail}`} className="flex flex-col items-center justify-center gap-2 p-4 glass-panel rounded-2xl hover:bg-blue-500/10 hover:border-blue-500/50 transition-colors text-foreground/80 hover:text-blue-400">
                  <FaEnvelope className="w-6 h-6" />
                  <span className="text-xs font-bold uppercase">Email</span>
                </a>
              </div>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}
