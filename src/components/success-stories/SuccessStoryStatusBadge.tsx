import { cn } from "@/lib/utils";
import type { ISuccessStoryItem } from "@/types/academy.type";

const VARIANT_CLASSES: Record<string, string> = {
  green: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  yellow: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  red: "bg-destructive/15 text-destructive border-destructive/30",
};

const STATUS_TO_VARIANT: Record<string, string> = {
  APPROVED: "green",
  PENDING: "yellow",
  REJECTED: "red",
};

/** Colour comes from the backend's statusBadge.variant (falls back to the status). */
export const SuccessStoryStatusBadge = ({
  story,
  className,
}: {
  story: Pick<ISuccessStoryItem, "status" | "statusBadge">;
  className?: string;
}) => {
  const status = String(story.status || "").toUpperCase();
  const variant = story.statusBadge?.variant || STATUS_TO_VARIANT[status] || "yellow";
  const label = story.statusBadge?.label || status;
  if (!label) return null;

  return (
    <span
      className={cn(
        "inline-flex rounded-full border px-2.5 py-1 text-[9px] font-black uppercase tracking-wider backdrop-blur-xs",
        VARIANT_CLASSES[variant] || VARIANT_CLASSES.yellow,
        className
      )}
    >
      {label}
    </span>
  );
};
