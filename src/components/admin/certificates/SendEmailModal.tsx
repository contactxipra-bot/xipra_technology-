"use client";

import { useState } from "react";
import { Mail, X, Loader2 } from "lucide-react";
import { apiSend, ApiRequestError } from "@/lib/admin-api";
import { type Certificate } from "./CertificateFormModal";

interface SendEmailModalProps {
  open: boolean;
  onClose: () => void;
  certificate: Certificate | null;
  onSent: () => void;
}

export default function SendEmailModal({ open, onClose, certificate, onSent }: SendEmailModalProps) {
  const [email, setEmail] = useState("");
  const [customMessage, setCustomMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open || !certificate) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await apiSend(`/api/admin/certificates/${certificate!.id}/send-email`, "POST", {
        email,
        customMessage,
      });
      onSent();
      onClose();
      setEmail("");
      setCustomMessage("");
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Failed to send email");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
      <div className="bg-card w-full max-w-md rounded-2xl shadow-lg border border-border flex flex-col overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Mail className="w-5 h-5 text-primary" /> Send Certificate
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-muted text-muted-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {error && (
            <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-lg">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1">Student Name</label>
            <input 
              type="text" 
              readOnly 
              value={certificate.studentName} 
              className="w-full px-3 py-2 bg-muted/50 border border-border rounded-lg text-sm outline-none cursor-not-allowed" 
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Recipient Email *</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="student@example.com"
              className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary" 
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Custom Message (Optional)</label>
            <textarea 
              value={customMessage}
              onChange={e => setCustomMessage(e.target.value)}
              placeholder="Leave blank to use the default congratulation message..."
              rows={4}
              className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary resize-none" 
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border mt-6">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-foreground bg-muted hover:bg-muted/80 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 rounded-lg transition-colors flex items-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Send Email
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
