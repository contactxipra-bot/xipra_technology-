import { cn } from "@/lib/utils";

const STYLES: Record<string, string> = {
  ACTIVE: "bg-green-500/10 text-green-500 border-green-500/20",
  REVOKED: "bg-destructive/10 text-destructive border-destructive/20",
  EXPIRED: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  PENDING: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  REVIEWED: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  ACCEPTED: "bg-green-500/10 text-green-500 border-green-500/20",
  REJECTED: "bg-destructive/10 text-destructive border-destructive/20",
  UNREAD: "bg-primary/10 text-primary border-primary/20",
  READ: "bg-muted text-muted-foreground border-border",
  REPLIED: "bg-green-500/10 text-green-500 border-green-500/20",
};

export default function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize whitespace-nowrap",
        STYLES[status] || "bg-muted text-muted-foreground border-border"
      )}
    >
      {status.toLowerCase()}
    </span>
  );
}
