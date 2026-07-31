"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, CheckCircle, Download, Printer, ShieldCheck, XCircle, User, Calendar, Clock, BookOpen, AlertCircle, QrCode } from "lucide-react";
import Image from "next/image";
import Badge from "@/components/ui/Badge";
import GlassCard from "@/components/ui/GlassCard";

type PublicCertificate = {
  certificateNumber: string;
  studentName: string;
  course: string;
  duration: string;
  issueDate: string;
  status: "ACTIVE" | "REVOKED" | "EXPIRED";
  hasFile: boolean;
  fileUrl: string | null;
  hasImage: boolean;
  imageUrl: string | null;
  hasStudentPhoto: boolean;
  studentPhotoUrl: string | null;
};

type Status = "idle" | "verifying" | "found" | "notfound" | "error";

const STATUS_PILL: Record<PublicCertificate["status"], { label: string; className: string }> = {
  ACTIVE: { label: "Active / Valid", className: "bg-green-500/20 text-green-400 border-green-500/30" },
  REVOKED: { label: "Revoked", className: "bg-red-500/20 text-red-400 border-red-500/30" },
  EXPIRED: { label: "Expired", className: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" },
};

export default function VerifyCertificatePage() {
  const [certId, setCertId] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [cert, setCert] = useState<PublicCertificate | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  const isVerifying = status === "verifying";

  const runVerify = async (rawNumber: string) => {
    const number = rawNumber.trim();
    if (!number) return;

    setStatus("verifying");
    setCert(null);
    setErrorMsg("");

    try {
      const res = await fetch("/api/public/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ certificateNumber: number }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data?.error?.message || "Verification failed. Please try again.");
      }
      if (data.data.found) {
        setCert(data.data.certificate as PublicCertificate);
        setStatus("found");
      } else {
        setStatus("notfound");
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Verification failed. Please try again.");
      setStatus("error");
    }
  };

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    runVerify(certId);
  };

  // Auto-verify when arriving from a scanned QR code: /verify-certificate?number=XXX
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const fromQr = params.get("number") || params.get("cert");
    if (fromQr) {
      setCertId(fromQr);
      runVerify(fromQr);
    }
    // Run once on mount to pick up a scanned QR's ?number= param.
  }, []);

  // Opens the PDF in its own browser tab and lets the browser's native PDF
  // viewer handle printing from there (its toolbar has a print icon, and
  // Ctrl/Cmd+P works normally once it's the focused document).
  //
  // Deliberately NOT reaching into an iframe's contentWindow: Chrome and
  // Edge render PDF content through an internal, sandboxed PDF viewer even
  // when the iframe's src is same-origin, and browsers block script access
  // to that viewer's window/document as if it were cross-origin. That's
  // what previously threw "Blocked a frame with origin ... from accessing a
  // cross-origin frame" — the fix is to never touch contentWindow/
  // contentDocument for PDF content at all, in an iframe or otherwise.
  const handlePrint = () => {
    if (cert?.hasFile && cert.fileUrl) {
      window.open(cert.fileUrl, "_blank", "noopener,noreferrer");
    } else if (cert?.hasImage && cert.imageUrl) {
      const printWindow = window.open("", "_blank");
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head><title>Print Certificate</title></head>
            <body style="margin:0;display:flex;justify-content:center;align-items:center;height:100vh;">
              <img src="${cert.imageUrl}" style="max-width:100%;max-height:100%;" onload="window.print();window.close();" />
            </body>
          </html>
        `);
        printWindow.document.close();
      }
    } else {
      window.print();
    }
  };

  const formattedDate = cert
    ? new Date(cert.issueDate).toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";

  return (
    <div className="min-h-screen pt-32 pb-32 bg-background relative overflow-hidden flex flex-col items-center">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-primary/5 blur-[150px] rounded-full pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10 max-w-4xl w-full">
        <div className="text-center mb-12">
          <Badge icon={ShieldCheck} text="Authenticity Check" className="mb-6" />
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-bold text-foreground mb-6"
          >
            Verify <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400">Certificate</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-foreground/60 text-lg max-w-2xl mx-auto"
          >
            Enter the unique certificate number below to instantly verify the authenticity of a Xipra Technology credential.
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-panel p-2 rounded-full mb-6 shadow-[0_20px_40px_rgba(0,0,0,0.3)] max-w-2xl mx-auto border-primary/20"
        >
          <form onSubmit={handleVerify} className="flex items-center">
            <div className="pl-6 text-foreground/40">
              <Search className="w-5 h-5" />
            </div>
            <input
              type="text"
              value={certId}
              onChange={(e) => setCertId(e.target.value)}
              placeholder="e.g. XIPRA-2026-CERT"
              className="flex-1 bg-transparent border-none text-foreground px-4 py-5 focus:outline-none focus:ring-0 placeholder:text-foreground/30 uppercase text-lg tracking-wider font-medium"
            />
            <button
              type="submit"
              disabled={isVerifying || !certId.trim()}
              className="bg-primary hover:bg-primary/90 text-foreground px-10 py-5 rounded-full font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 m-1"
            >
              {isVerifying ? (
                <>
                  <div className="w-5 h-5 border-2 border-foreground/30 border-t-white rounded-full animate-spin" />
                  Verifying...
                </>
              ) : (
                "Verify Now"
              )}
            </button>
          </form>
        </motion.div>

        {status === "error" && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto mb-10 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm"
          >
            <AlertCircle className="w-4 h-4 shrink-0" />
            {errorMsg}
          </motion.div>
        )}

        <div className={status === "error" ? "" : "mt-10"}>
          <AnimatePresence mode="wait">
            {status === "found" && cert && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="grid grid-cols-1 lg:grid-cols-5 gap-8"
              >
                {/* Result Details */}
                <GlassCard hoverEffect={false} className="lg:col-span-3 border-green-500/30 bg-background/60 p-8 lg:p-10">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/10 blur-[80px]" />

                  <div className="flex items-center gap-4 mb-8 pb-6 border-b border-foreground/10">
                    <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center border border-green-500/30">
                      <CheckCircle className="w-8 h-8 text-green-400" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-foreground">Certificate Verified</h3>
                      <p className="text-green-400 text-sm font-medium tracking-wide uppercase">Authentic Credential</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-8">
                    <div className="col-span-1 sm:col-span-2 flex items-center gap-4 border-b border-foreground/5 pb-4">
                      {cert.hasStudentPhoto && cert.studentPhotoUrl && (
                        <div className="shrink-0">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={cert.studentPhotoUrl}
                            alt={cert.studentName}
                            className="w-20 h-24 object-cover rounded-md border border-foreground/20 shadow-sm"
                          />
                        </div>
                      )}
                      <div>
                        <div className="text-xs text-foreground/40 uppercase tracking-wider mb-1 flex items-center gap-2"><User className="w-3.5 h-3.5"/> Student Name</div>
                        <div className="text-foreground font-bold text-xl">{cert.studentName}</div>
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-foreground/40 uppercase tracking-wider mb-1 flex items-center gap-2"><BookOpen className="w-3.5 h-3.5"/> Course</div>
                      <div className="text-foreground font-bold text-lg">{cert.course}</div>
                    </div>
                    <div>
                      <div className="text-xs text-foreground/40 uppercase tracking-wider mb-1 flex items-center gap-2"><ShieldCheck className="w-3.5 h-3.5"/> Certificate Number</div>
                      <div className="text-foreground font-bold text-lg uppercase tracking-wider">{cert.certificateNumber}</div>
                    </div>
                    <div>
                      <div className="text-xs text-foreground/40 uppercase tracking-wider mb-1 flex items-center gap-2"><Calendar className="w-3.5 h-3.5"/> Issue Date</div>
                      <div className="text-foreground font-bold text-lg">{formattedDate}</div>
                    </div>
                    <div>
                      <div className="text-xs text-foreground/40 uppercase tracking-wider mb-1 flex items-center gap-2"><Clock className="w-3.5 h-3.5"/> Duration</div>
                      <div className="text-foreground font-bold text-lg">{cert.duration}</div>
                    </div>
                    <div>
                      <div className="text-xs text-foreground/40 uppercase tracking-wider mb-1 flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5"/> Status</div>
                      <div className={`inline-flex px-3 py-1 border rounded-full text-xs font-bold uppercase tracking-wider mt-1 ${STATUS_PILL[cert.status].className}`}>
                        {STATUS_PILL[cert.status].label}
                      </div>
                    </div>
                  </div>
                </GlassCard>

                {/* Certificate Preview Card */}
                <div className="lg:col-span-2 flex flex-col gap-4">
                  <GlassCard hoverEffect={false} className="flex-1 flex flex-col items-center justify-center p-8 bg-gradient-to-br from-foreground/10 to-transparent border-foreground/20">
                    <div 
                      className="w-full max-w-sm mx-auto aspect-[1/1.414] bg-foreground/5 border border-foreground/20 rounded-xl mb-6 relative overflow-hidden flex flex-col items-center justify-center cursor-pointer hover:opacity-90 transition-opacity shadow-sm"
                      onClick={() => {
                        const url = cert.fileUrl || cert.imageUrl;
                        if (url) window.open(url, "_blank", "noopener,noreferrer");
                      }}
                    >
                      {cert.hasFile && cert.fileUrl ? (
                        <iframe
                          src={cert.fileUrl}
                          title="Certificate Preview"
                          className="absolute inset-0 w-full h-full pointer-events-none"
                        />
                      ) : cert.hasImage && cert.imageUrl ? (
                        <Image
                          src={cert.imageUrl}
                          alt="Certificate"
                          fill
                          sizes="(max-width: 768px) 100vw, 50vw"
                          className="object-contain"
                        />
                      ) : (
                        // Fallback graphic when no PDF/image is attached to the certificate.
                        <div className="absolute inset-2 border border-foreground/10 p-4 text-center flex flex-col justify-between">
                          <div className="text-primary font-bold tracking-widest text-xs">XIPRA TECHNOLOGY</div>
                          <div>
                            <div className="text-[10px] text-foreground/50 uppercase tracking-widest mb-1">Certificate of Completion</div>
                            <div className="text-lg font-serif text-foreground mb-2">{cert.studentName}</div>
                            <div className="text-[8px] text-foreground/40">For successfully completing the {cert.course}</div>
                          </div>
                          <div className="flex justify-between items-end px-4">
                            <div className="w-8 h-8 rounded-full border border-primary/30 flex items-center justify-center"><ShieldCheck className="w-4 h-4 text-primary/50" /></div>
                            <div className="text-[6px] text-foreground/30 text-right">Date: {formattedDate}<br/>ID: {cert.certificateNumber}</div>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="w-full space-y-3">
                      {(cert.hasFile && cert.fileUrl) || (cert.hasImage && cert.imageUrl) ? (
                        <>
                          <a
                            href={`${cert.fileUrl || cert.imageUrl}?download=1`}
                            className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-primary hover:bg-primary/90 text-foreground font-bold transition-all shadow-lg"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Download className="w-5 h-5" />
                            Download Certificate
                          </a>
                          <a
                            href={`/api/public/certificates/${encodeURIComponent(cert.certificateNumber)}/qr`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-foreground/10 hover:bg-foreground/20 text-foreground font-bold transition-all border border-foreground/10"
                          >
                            <QrCode className="w-5 h-5" />
                            View QR Code
                          </a>
                          <button
                            onClick={handlePrint}
                            className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-foreground/10 hover:bg-foreground/20 text-foreground font-bold transition-all border border-foreground/10"
                          >
                            <Printer className="w-5 h-5" />
                            Print Certificate
                          </button>
                        </>
                      ) : (
                        <div className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-foreground/5 text-foreground/50 font-medium border border-foreground/10 text-sm text-center">
                          <AlertCircle className="w-4 h-4 shrink-0" />
                          Certificate document not available for download
                        </div>
                      )}
                    </div>
                  </GlassCard>
                </div>
              </motion.div>
            )}

            {status === "notfound" && (
              <motion.div
                key="error"
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="glass-panel p-12 rounded-3xl border border-red-500/30 flex flex-col items-center text-center max-w-2xl mx-auto bg-red-500/5"
              >
                <div className="w-24 h-24 rounded-full bg-red-500/20 flex items-center justify-center border border-red-500/30 mb-8 relative">
                  <div className="absolute inset-0 bg-red-500/20 animate-ping rounded-full" />
                  <XCircle className="w-12 h-12 text-red-400 relative z-10" />
                </div>
                <h3 className="text-3xl font-bold text-foreground mb-4">Certificate Not Found</h3>
                <p className="text-foreground/60 text-lg mb-8 max-w-md">
                  We could not find any records matching the certificate number <strong className="text-foreground uppercase">&quot;{certId}&quot;</strong>. Please verify the ID and try again.
                </p>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-foreground/5 border border-foreground/10 text-foreground/50 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  If you believe this is an error, please contact our support team.
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
