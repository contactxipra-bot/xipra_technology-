import { Search, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AlertBanner({
  type,
  message,
}: {
  type: "error" | "success";
  message: string;
}) {
  return (
    <div
      className={
        type === "error"
          ? "mb-4 rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-2.5 text-sm text-destructive"
          : "mb-4 rounded-lg border border-green-500/20 bg-green-500/10 px-4 py-2.5 text-sm text-green-500"
      }
    >
      {message}
    </div>
  );
}

export function ListToolbar({
  search,
  onSearchChange,
  placeholder = "Search...",
  addLabel,
  onAdd,
  extra,
}: {
  search: string;
  onSearchChange: (value: string) => void;
  placeholder?: string;
  addLabel?: string;
  onAdd?: () => void;
  extra?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
      <div className="relative w-full sm:max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-lg border border-border bg-background pl-9 pr-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {extra}
        {onAdd && (
          <Button type="button" onClick={onAdd}>
            <Plus className="w-4 h-4" />
            {addLabel || "Add New"}
          </Button>
        )}
      </div>
    </div>
  );
}
