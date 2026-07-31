"use client";

import { AlertTriangle } from "lucide-react";
import Modal from "./Modal";
import { Button } from "@/components/ui/button";

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  loading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
};

export default function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Delete",
  loading,
  onConfirm,
  onClose,
}: ConfirmDialogProps) {
  return (
    <Modal open={open} onClose={onClose} title={title} maxWidth="max-w-sm">
      <div className="flex gap-3 mb-6">
        <div className="shrink-0 w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
          <AlertTriangle className="w-5 h-5 text-destructive" />
        </div>
        <p className="text-sm text-muted-foreground pt-2">{description}</p>
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button type="button" variant="destructive" onClick={onConfirm} disabled={loading}>
          {loading ? "Please wait..." : confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}
