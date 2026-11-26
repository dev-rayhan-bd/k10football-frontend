import { cn } from "@/lib/utils";

export const PAYOUT_STATUSES = ["PENDING", "PROCESSING", "PAID", "ON_HOLD", "LOCKED_NO_SUBSCRIPTION"] as const;
export type PayoutStatus = (typeof PAYOUT_STATUSES)[number];

const STYLES: Record<string, { label: string; className: string }> = {
  PENDING: { label: "Pending payout", className: "border-amber-500/30 bg-amber-500/10 text-amber-400" },
  PROCESSING: { label: "Processing", className: "border-sky-500/30 bg-sky-500/10 text-sky-400" },
  PAID: { label: "Paid", className: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400" },
  // Player paid, coach hasn't validated yet — not earned / payable.
  ON_HOLD: { label: "Awaiting coach validation", className: "border-white/15 bg-white/5 text-white/60" },
  LOCKED_NO_SUBSCRIPTION: { label: "Locked — no subscription", className: "border-destructive/30 bg-destructive/10 text-destructive" },
};

/** Filter-dropdown labels. */
export const PAYOUT_STATUS_LABELS: Record<PayoutStatus, string> = {
  PENDING: "Pending",
  PROCESSING: "Processing",
  PAID: "Paid",
  ON_HOLD: "On hold",
  LOCKED_NO_SUBSCRIPTION: "Locked (no subscription)",
};

export const PayoutStatusBadge = ({
  status,
  onHoldLabel,
  className,
}: {
  status?: string | null;
  /** Viewer-specific wording for ON_HOLD (e.g. the coach sees "Validate CV to unlock"). */
  onHoldLabel?: string;
  className?: string;
}) => {
  const key = String(status || "").toUpperCase();
  if (!key) return null;
  const style = STYLES[key] ?? { label: key.replace(/_/g, " "), className: "border-white/15 bg-white/5 text-white/60" };
  const label = key === "ON_HOLD" && onHoldLabel ? onHoldLabel : style.label;

  return (
    <span
      className={cn(
        "inline-flex items-center whitespace-nowrap rounded-full border px-2.5 py-1 text-[9px] font-black uppercase tracking-wider",
        style.className,
        className
      )}
    >
      {label}
    </span>
  );
};
