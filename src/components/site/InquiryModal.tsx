"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Loader2, CheckCircle } from "lucide-react";

interface InquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  productName: string;
}

export default function InquiryModal({ isOpen, onClose, productName }: InquiryModalProps) {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");

    const formData = new FormData(e.currentTarget);
    const payload = {
      name: formData.get("name"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      subject: `Inquiry for ${productName}`,
      message: formData.get("message"),
      company: formData.get("company"), // honeypot
    };

    try {
      const res = await fetch("/api/public/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        let errorText = data.error?.message || "Something went wrong.";
        // If there are validation details, append them so the user knows what exactly failed
        if (data.error?.details && Array.isArray(data.error.details)) {
          const detailMessages = data.error.details.map((d: { message: string }) => d.message).join(", ");
          if (detailMessages) {
            errorText = detailMessages;
          }
        }
        throw new Error(errorText);
      }

      setStatus("success");
      setTimeout(() => {
        onClose();
        setStatus("idle");
      }, 3000);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg("An unexpected error occurred.");
      }
      setStatus("error");
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[100]"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg z-[101] px-4"
          >
            <div className="glass-panel p-8 rounded-3xl border border-foreground/10 shadow-2xl relative">
              <button
                onClick={onClose}
                className="absolute top-6 right-6 w-8 h-8 rounded-full bg-foreground/5 flex items-center justify-center hover:bg-foreground/10 text-foreground/60 hover:text-foreground transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              <h2 className="text-2xl font-bold text-foreground mb-2">Learn more about {productName}</h2>
              <p className="text-foreground/60 text-sm mb-6">
                Fill out the form below and our team will get back to you with more information and a personalized demo.
              </p>

              {status === "success" ? (
                <div className="py-12 flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mb-4">
                    <CheckCircle className="w-8 h-8 text-green-500" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-2">Inquiry Sent!</h3>
                  <p className="text-foreground/60 text-sm">We&apos;ve received your request and will contact you shortly.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Honeypot field - hidden from users */}
                  <input type="text" name="company" tabIndex={-1} className="hidden" aria-hidden="true" />

                  <div>
                    <label className="block text-sm font-medium text-foreground/80 mb-1">Full Name</label>
                    <input
                      type="text"
                      name="name"
                      required
                      minLength={2}
                      className="w-full bg-foreground/5 border border-foreground/10 rounded-xl px-4 py-3 text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-primary transition-colors"
                      placeholder="John Doe"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground/80 mb-1">Email</label>
                      <input
                        type="email"
                        name="email"
                        required
                        className="w-full bg-foreground/5 border border-foreground/10 rounded-xl px-4 py-3 text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-primary transition-colors"
                        placeholder="john@company.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground/80 mb-1">Phone (Optional)</label>
                      <input
                        type="tel"
                        name="phone"
                        minLength={7}
                        maxLength={20}
                        className="w-full bg-foreground/5 border border-foreground/10 rounded-xl px-4 py-3 text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-primary transition-colors"
                        placeholder="+1 (555) 000-0000"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground/80 mb-1">Message</label>
                    <textarea
                      name="message"
                      required
                      minLength={10}
                      rows={4}
                      className="w-full bg-foreground/5 border border-foreground/10 rounded-xl px-4 py-3 text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-primary transition-colors resize-none"
                      placeholder={`I'm interested in learning more about ${productName}...`}
                    />
                  </div>

                  {status === "error" && (
                    <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
                      {errorMsg}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={status === "loading"}
                    className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-bold flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {status === "loading" ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" /> Sending...
                      </>
                    ) : (
                      <>
                        Send Inquiry <Send className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
