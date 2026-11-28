"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  IconAlertTriangle,
  IconBuildingCommunity,
  IconCash,
  IconChevronDown,
  IconClockPause,
  IconHourglass,
  IconUser,
} from "@tabler/icons-react";
import { RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { StatCardSkeleton } from "@/components/dashboard/TableSkeleton";
import { PayoutStatusBadge } from "@/components/finance/PayoutStatusBadge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  useGetAdminPayoutsQuery,
  useRecordPayoutMutation,
  useRecordAllPayoutsMutation,
} from "@/redux/features/payout/payoutApi";
import {
  IPayoutRecipient,
  IPayoutTransaction,
  PayoutFilterStatus,
  PayoutRecipientFilter,
} from "@/types/payout.type";

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

const DASH = "—";

const RECIPIENT_TABS: { label: string; value: PayoutRecipientFilter }[] = [
  { label: "All", value: "ALL" },
  { label: "Coaches", value: "COACH" },
  { label: "Academies", value: "ACADEMY" },
];

const STATUS_OPTIONS: { label: string; value: "ALL" | PayoutFilterStatus }[] = [
  { label: "All Status", value: "ALL" },
  { label: "Pending", value: "PENDING" },
  { label: "Paid", value: "PAID" },
  { label: "On hold", value: "ON_HOLD" },
];

const makeMoneyFormatter = (currency?: string) => {
  let fmt: Intl.NumberFormat;
  try {
    fmt = new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: (currency || "USD").toUpperCase(),
    });
  } catch {
    fmt = new Intl.NumberFormat(undefined, { style: "currency", currency: "USD" });
  }
  return (val: number | null | undefined) =>
    val === null || val === undefined || Number.isNaN(Number(val))
      ? DASH
      : fmt.format(Number(val));
};

const formatDate = (val?: string | null) => {
  if (!val) return DASH;
  const d = new Date(val);
  if (Number.isNaN(d.getTime())) return val;
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
};

const formatDateTime = (val?: string | null) => {
  if (!val) return DASH;
  const d = new Date(val);
  if (Number.isNaN(d.getTime())) return val;
  return d.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getPlayerName = (player: IPayoutTransaction["player"]) => {
  if (!player) return DASH;
  if (typeof player === "string") return player || DASH;
  return player.fullName || player.name || DASH;
};

const humanize = (val?: string | null) => (val ? val.replace(/_/g, " ") : DASH);

const recipientKey = (r: Pick<IPayoutRecipient, "recipientType" | "recipientId">) =>
  `${r.recipientType}:${r.recipientId}`;

const getErrorMessage = (err: unknown, fallback: string) => {
  const e = err as { data?: { message?: string }; error?: string; message?: string };
  return e?.data?.message || e?.error || e?.message || fallback;
};

const isPayable = (t: IPayoutTransaction) => String(t.payoutStatus || "").toUpperCase() === "PENDING";

/* ------------------------------------------------------------------ */
/* Sub components                                                      */
/* ------------------------------------------------------------------ */

const SummaryCard = ({
  icon: Icon,
  label,
  value,
  coach,
  academy,
  accentClassName,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  value: string;
  coach: string;
  academy: string;
  accentClassName?: string;
}) => (
  <div className="bg-[#111111] border border-white/20 rounded-2xl sm:rounded-3xl p-4 sm:p-6 flex flex-col gap-3 sm:gap-4 min-w-0 overflow-hidden shadow-lg">
    <div className="size-8 sm:size-10 rounded-lg sm:rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/60 shrink-0">
      <Icon size={18} />
    </div>
    <div className="min-w-0">
      <p className={cn("text-xl sm:text-3xl font-black font-orbitron truncate", accentClassName ?? "text-white")}>
        {value}
      </p>
      <p className="text-white/40 text-[9px] sm:text-[11px] font-bold uppercase tracking-wider truncate mt-0.5 sm:mt-1">
        {label}
      </p>
    </div>
    <div className="grid grid-cols-2 gap-2 pt-3 border-t border-white/10 text-[10px] sm:text-xs">
      <div className="min-w-0">
        <p className="text-white/40 uppercase font-bold tracking-wider text-[9px]">Coaches</p>
        <p className="text-white/80 font-bold font-orbitron truncate">{coach}</p>
      </div>
      <div className="min-w-0">
        <p className="text-white/40 uppercase font-bold tracking-wider text-[9px]">Academies</p>
        <p className="text-white/80 font-bold font-orbitron truncate">{academy}</p>
      </div>
    </div>
  </div>
);

const StripeStatus = ({ recipient }: { recipient: IPayoutRecipient }) => {
  if (recipient.stripePayoutsEnabled) {
    return (
      <span className="inline-flex items-center whitespace-nowrap rounded-full border px-2.5 py-1 text-[9px] font-black uppercase tracking-wider border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
        Payouts enabled
      </span>
    );
  }
  if (recipient.stripeConnected) {
    return (
      <span className="inline-flex items-center whitespace-nowrap rounded-full border px-2.5 py-1 text-[9px] font-black uppercase tracking-wider border-amber-500/30 bg-amber-500/10 text-amber-400">
        Connected · payouts off
      </span>
    );
  }
  return (
    <span className="inline-flex items-center whitespace-nowrap rounded-full border px-2.5 py-1 text-[9px] font-black uppercase tracking-wider border-destructive/30 bg-destructive/10 text-destructive">
      Stripe not connected
    </span>
  );
};

const TypeBadge = ({ type }: { type: IPayoutRecipient["recipientType"] }) => (
  <span className="inline-flex items-center gap-1 whitespace-nowrap rounded-full border border-white/15 bg-white/5 px-2.5 py-1 text-[9px] font-black uppercase tracking-wider text-white/70">
    {type === "ACADEMY" ? <IconBuildingCommunity size={12} /> : <IconUser size={12} />}
    {type === "ACADEMY" ? "Academy" : type === "COACH" ? "Coach" : humanize(type)}
  </span>
);

const Metric = ({
  label,
  value,
  hint,
  className,
}: {
  label: string;
  value: string | number;
  hint?: string;
  className?: string;
}) => (
  <div className="min-w-0 rounded-xl bg-white/5 border border-white/10 p-3">
    <p className="text-[9px] uppercase font-bold tracking-wider text-white/40 truncate">{label}</p>
    <p className={cn("text-sm sm:text-base font-black font-orbitron truncate mt-0.5", className ?? "text-white")}>
      {value}
    </p>
    {hint && <p className="text-[9px] text-white/30 truncate">{hint}</p>}
  </div>
);

const LoadingState = () => (
  <div className="flex flex-col gap-4">
    {Array.from({ length: 4 }).map((_, i) => (
      <div key={i} className="rounded-2xl border border-white/10 bg-white/5 p-4 sm:p-6 flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <Skeleton className="size-10 rounded-full bg-white/10" />
          <div className="flex flex-col gap-2 flex-1">
            <Skeleton className="h-4 w-40 bg-white/10" />
            <Skeleton className="h-3 w-56 bg-white/10" />
          </div>
          <Skeleton className="h-9 w-32 rounded-xl bg-white/10" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {Array.from({ length: 5 }).map((__, j) => (
            <Skeleton key={j} className="h-14 rounded-xl bg-white/10" />
          ))}
        </div>
      </div>
    ))}
  </div>
);

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

const SuperAdminPayouts = () => {
  const searchParams = useSearchParams();
  const flaggedTransactionId = searchParams.get("transactionId") || "";

  const [recipientType, setRecipientType] = useState<PayoutRecipientFilter>("ALL");
  const [statusFilter, setStatusFilter] = useState<"ALL" | PayoutFilterStatus>("ALL");
  // User toggles override the default (derived) expansion.
  const [expandedOverrides, setExpandedOverrides] = useState<Record<string, boolean>>({});

  const [payTarget, setPayTarget] = useState<IPayoutRecipient | null>(null);
  const [payoutReference, setPayoutReference] = useState("");
  const [payoutNotes, setPayoutNotes] = useState("");

  const { data, isLoading, isFetching, isError, error, refetch } = useGetAdminPayoutsQuery({
    recipientType: recipientType !== "ALL" ? recipientType : undefined,
    status: statusFilter !== "ALL" ? statusFilter : undefined,
  });
  const [recordPayout, { isLoading: isPaying }] = useRecordPayoutMutation();
  const [recordAllPayouts, { isLoading: isPayingAll }] = useRecordAllPayoutsMutation();

  const [payAllOpen, setPayAllOpen] = useState(false);
  const [payAllNotes, setPayAllNotes] = useState("");
  const [payAllRecipientType, setPayAllRecipientType] = useState<PayoutRecipientFilter>("ALL");

  const summary = data?.data?.summary;
  const recipients = useMemo(() => data?.data?.recipients ?? [], [data]);
  const money = useMemo(() => makeMoneyFormatter(summary?.currency), [summary?.currency]);

  const flaggedRecipientKey = useMemo(() => {
    if (!flaggedTransactionId) return null;
    const match = recipients.find((r) =>
      (r.transactions ?? []).some((t) => t.transactionId === flaggedTransactionId)
    );
    return match ? recipientKey(match) : null;
  }, [recipients, flaggedTransactionId]);

  const isExpanded = (key: string) => expandedOverrides[key] ?? key === flaggedRecipientKey;

  const toggleExpanded = (key: string) =>
    setExpandedOverrides((prev) => ({ ...prev, [key]: !(prev[key] ?? key === flaggedRecipientKey) }));

  // Scroll the flagged transaction into view once it is rendered (DOM only, no state).
  useEffect(() => {
    if (!flaggedTransactionId || !flaggedRecipientKey) return;
    const el = document.getElementById(`payout-tx-${flaggedTransactionId}`);
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [flaggedTransactionId, flaggedRecipientKey]);

  const openPayDialog = (recipient: IPayoutRecipient) => {
    setPayoutReference("");
    setPayoutNotes("");
    setPayTarget(recipient);
  };

  const handleConfirmPay = async () => {
    if (!payTarget) return;
    const transactionIds = (payTarget.transactions ?? [])
      .filter(isPayable)
      .map((t) => t.transactionId)
      .filter(Boolean);
    const reference = payoutReference.trim();
    const notes = payoutNotes.trim();

    try {
      const res = await recordPayout({
        recipientType: payTarget.recipientType,
        recipientId: payTarget.recipientId,
        ...(transactionIds.length ? { transactionIds } : {}),
        ...(reference ? { payoutReference: reference } : {}),
        ...(notes ? { notes } : {}),
      }).unwrap();
      const result = res?.data;
      const name = result?.recipientName || payTarget.name || "recipient";
      const amount =
        result?.amountPaid !== undefined && result?.amountPaid !== null
          ? money(result.amountPaid)
          : money(payTarget.pendingAmount);
      toast.success(`Paid ${amount} to ${name}`, {
        description: result?.stripeTransferId
          ? `Stripe transfer ${result.stripeTransferId}`
          : res?.message || undefined,
      });
      setPayTarget(null);
    } catch (err) {
      const message = getErrorMessage(err, "Failed to record payout");
      const lower = message.toLowerCase();
      if (lower.includes("stripe connect")) {
        toast.error(message, {
          description: "Ask the recipient to connect their Stripe account before paying out.",
        });
      } else if (lower.includes("no pending payouts")) {
        toast.error(message);
        setPayTarget(null);
        refetch();
      } else {
        toast.error(message);
      }
    }
  };

  const handleConfirmPayAll = async () => {
    const notes = payAllNotes.trim();
    try {
      const res = await recordAllPayouts({
        recipientType: payAllRecipientType,
        ...(notes ? { notes } : {}),
      }).unwrap();
      const s = res?.data?.summary;
      toast.success(
        `Bulk payout complete — ${s?.successCount ?? 0} paid, ${s?.skippedCount ?? 0} skipped, ${s?.failedCount ?? 0} failed`,
        { description: `Total disbursed: ${money(s?.totalDisbursed)}` }
      );
      setPayAllOpen(false);
      setPayAllNotes("");
    } catch (err) {
      toast.error(getErrorMessage(err, "Bulk payout failed"));
    }
  };

  const payDisabledReason = (r: IPayoutRecipient): string | null => {
    if (!(Number(r.pendingAmount) > 0)) return "Nothing payable";
    if (!r.stripePayoutsEnabled) return "Recipient hasn't completed Stripe Connect";
    return null;
  };

  const payTargetPendingCount = (payTarget?.transactions ?? []).filter(isPayable).length;

  return (
    <div className="flex flex-col gap-6 sm:gap-8 p-4 sm:p-6 lg:p-8 pb-10 w-full min-w-0 overflow-hidden text-white">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shrink-0 w-full min-w-0">
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl sm:text-5xl font-black text-white font-orbitron tracking-tight truncate">
              Payouts
            </h1>
            {!isLoading && !isError && (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-white/5 border border-white/10 text-white/60 whitespace-nowrap">
                {recipients.length} Recipients
              </span>
            )}
          </div>
          <p className="text-white/60 font-medium mt-1 sm:mt-2 text-sm sm:text-lg truncate">
            Coach and academy earnings
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
          <Button
            type="button"
            onClick={() => { setPayAllNotes(""); setPayAllRecipientType("ALL"); setPayAllOpen(true); }}
            disabled={isLoading || isError || (summary?.totalPendingOverall ?? 0) === 0}
            className="rounded-xl text-xs font-black h-9 px-4"
          >
            <IconCash size={15} />
            Pay All
          </Button>
          <button
            type="button"
            onClick={() => refetch()}
            className="size-9 rounded-xl border border-white/10 bg-black/40 flex items-center justify-center text-white/60 hover:text-white transition-colors cursor-pointer"
            title="Refresh Payouts"
          >
            <RefreshCw className={cn("size-3.5", isFetching && "animate-spin")} />
          </button>
        </div>
      </div>

      {/* Deep-link banner */}
      {flaggedTransactionId && (
        <div className="flex items-start gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-amber-300">
          <IconAlertTriangle size={18} className="shrink-0 mt-0.5" />
          <div className="min-w-0 text-xs sm:text-sm">
            <p className="font-bold break-all">
              Transaction {flaggedTransactionId} flagged for manual review (CV validation re-assigned
              after a share was paid)
            </p>
            {!isLoading && !isError && !flaggedRecipientKey && (
              <p className="text-amber-300/70 mt-1">
                This transaction isn&apos;t in the current results. Try clearing the filters.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 w-full min-w-0">
        {isLoading ? (
          <>
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </>
        ) : (
          <>
            <SummaryCard
              icon={IconHourglass}
              label="Pending (payable)"
              value={money(summary?.totalPendingOverall)}
              coach={money(summary?.totalCoachPending)}
              academy={money(summary?.totalAcademyPending)}
              accentClassName="text-amber-400"
            />
            <SummaryCard
              icon={IconClockPause}
              label="On hold (CV not validated yet)"
              value={money(summary?.totalOnHoldOverall)}
              coach={money(summary?.totalCoachOnHold)}
              academy={money(summary?.totalAcademyOnHold)}
              accentClassName="text-white/70"
            />
            <SummaryCard
              icon={IconCash}
              label="Paid"
              value={money(summary?.totalPaidOverall)}
              coach={money(summary?.totalCoachPaid)}
              academy={money(summary?.totalAcademyPaid)}
              accentClassName="text-emerald-400"
            />
          </>
        )}
      </div>

      {/* Main container */}
      <div className="bg-[#111111] border border-white/20 rounded-3xl sm:rounded-[40px] p-4 sm:p-6 md:p-10 flex flex-col gap-5 sm:gap-8 min-w-0 overflow-hidden w-full">
        {/* Filters */}
        <div className="flex flex-wrap items-center justify-between gap-3 w-full">
          <div className="flex items-center gap-1 rounded-xl border border-white/20 bg-black/40 p-1">
            {RECIPIENT_TABS.map((tab) => (
              <button
                key={tab.value}
                type="button"
                onClick={() => setRecipientType(tab.value)}
                className={cn(
                  "h-8 px-3 sm:px-4 rounded-lg text-[10px] sm:text-xs font-black uppercase tracking-wider transition-all cursor-pointer",
                  recipientType === tab.value
                    ? "bg-primary text-white shadow-md shadow-primary/30"
                    : "text-white/60 hover:text-white hover:bg-white/5"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="relative shrink-0">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as "ALL" | PayoutFilterStatus)}
              className="appearance-none bg-black/40 border border-white/20 h-9 sm:h-10 rounded-xl text-white/60 text-[9px] sm:text-[10px] font-black uppercase tracking-wider px-3 sm:px-4 pr-8 sm:pr-10 focus:outline-none focus:border-white/40 transition-colors cursor-pointer"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value} className="bg-[#111111] text-white">
                  {opt.label}
                </option>
              ))}
            </select>
            <IconChevronDown
              size={14}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 pointer-events-none"
            />
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <LoadingState />
        ) : isError ? (
          <div className="py-12 flex flex-col items-center justify-center gap-3 text-center">
            <p className="text-destructive text-sm font-semibold">
              {getErrorMessage(error, "Failed to load payouts.")}
            </p>
            <Button
              onClick={() => refetch()}
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10 text-xs rounded-xl"
            >
              <RefreshCw className="size-3.5 mr-1.5" /> Retry
            </Button>
          </div>
        ) : recipients.length === 0 ? (
          <div className="py-16 flex flex-col items-center justify-center gap-2 text-center">
            <p className="text-white/60 text-sm font-bold">No payouts yet</p>
            <p className="text-white/30 text-xs">
              Coach and academy earnings will appear here once transactions come in.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {recipients.map((r) => {
              const key = recipientKey(r);
              const expanded = isExpanded(key);
              const disabledReason = payDisabledReason(r);
              const transactions = r.transactions ?? [];
              const contact = [r.email, r.phone].filter(Boolean).join(" · ");

              return (
                <div
                  key={key}
                  className={cn(
                    "rounded-2xl sm:rounded-3xl border bg-black/30 p-4 sm:p-6 flex flex-col gap-4 min-w-0",
                    key === flaggedRecipientKey ? "border-amber-500/40" : "border-white/10"
                  )}
                >
                  {/* Recipient header */}
                  <div className="flex flex-col lg:flex-row lg:items-center gap-4 min-w-0">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="size-10 rounded-full bg-white/10 border border-white/20 shrink-0 flex items-center justify-center text-white/60 font-black text-sm">
                        {r.name ? r.name.charAt(0).toUpperCase() : <IconUser size={18} />}
                      </div>
                      <div className="min-w-0 flex flex-col gap-1">
                        <div className="flex flex-wrap items-center gap-2 min-w-0">
                          <p className="text-white text-sm sm:text-base font-black truncate">
                            {r.name || DASH}
                          </p>
                          <TypeBadge type={r.recipientType} />
                          <StripeStatus recipient={r} />
                        </div>
                        <p className="text-white/40 text-xs truncate">{contact || DASH}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span title={disabledReason ?? undefined} className="inline-flex">
                        <Button
                          type="button"
                          disabled={!!disabledReason}
                          onClick={() => openPayDialog(r)}
                          className="rounded-xl text-xs font-black"
                        >
                          <IconCash size={16} />
                          Pay {money(r.pendingAmount)}
                        </Button>
                      </span>
                      <button
                        type="button"
                        onClick={() => toggleExpanded(key)}
                        className="size-9 inline-flex items-center justify-center rounded-xl border border-white/20 bg-white/5 text-white/70 hover:text-white hover:border-white/40 hover:bg-white/10 transition-all cursor-pointer"
                        title={expanded ? "Hide transactions" : "Show transactions"}
                        aria-expanded={expanded}
                      >
                        <IconChevronDown
                          size={18}
                          className={cn("transition-transform", expanded && "rotate-180")}
                        />
                      </button>
                    </div>
                  </div>

                  {/* Metrics */}
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-2 sm:gap-3">
                    <Metric label="Total earned" value={money(r.totalEarned)} />
                    <Metric
                      label="Pending (payable)"
                      value={money(r.pendingAmount)}
                      className="text-amber-400"
                    />
                    <Metric
                      label="On hold"
                      value={money(r.onHoldAmount)}
                      hint="Info only, not payable"
                      className="text-white/60"
                    />
                    <Metric
                      label="Paid out"
                      value={money(r.completedPayoutAmount)}
                      className="text-emerald-400"
                    />
                    <Metric
                      label="Transactions"
                      value={r.transactionsCount ?? transactions.length ?? DASH}
                    />
                  </div>

                  {/* Transactions */}
                  {expanded && (
                    <div className="w-full overflow-x-auto no-scrollbar rounded-xl border border-white/10">
                      {transactions.length === 0 ? (
                        <p className="p-4 text-center text-xs text-white/40">No transactions.</p>
                      ) : (
                        <table className="w-full min-w-[900px] text-xs">
                          <thead>
                            <tr className="bg-white/5 text-white/40 text-[9px] uppercase tracking-wider">
                              <th className="px-3 py-2.5 text-left font-black">Type</th>
                              <th className="px-3 py-2.5 text-left font-black">Player</th>
                              <th className="px-3 py-2.5 text-left font-black">Date</th>
                              <th className="px-3 py-2.5 text-right font-black">Gross</th>
                              <th className="px-3 py-2.5 text-right font-black">Commission</th>
                              <th className="px-3 py-2.5 text-center font-black">Status</th>
                              <th className="px-3 py-2.5 text-left font-black">Reference</th>
                              <th className="px-3 py-2.5 text-left font-black">Paid at</th>
                            </tr>
                          </thead>
                          <tbody>
                            {transactions.map((t, idx) => {
                              const flagged = !!flaggedTransactionId && t.transactionId === flaggedTransactionId;
                              return (
                                <tr
                                  key={t.transactionId || idx}
                                  id={t.transactionId ? `payout-tx-${t.transactionId}` : undefined}
                                  className={cn(
                                    "border-t border-white/5",
                                    flagged && "bg-amber-500/10 outline outline-2 -outline-offset-2 outline-amber-500/60"
                                  )}
                                >
                                  <td className="px-3 py-2.5 text-white font-bold whitespace-nowrap">
                                    <div className="flex flex-col">
                                      <span>{humanize(t.transactionType)}</span>
                                      {t.notes && (
                                        <span className="text-[10px] text-white/40 font-normal max-w-48 truncate" title={t.notes}>
                                          {t.notes}
                                        </span>
                                      )}
                                    </div>
                                  </td>
                                  <td className="px-3 py-2.5 text-white/80 whitespace-nowrap">
                                    {getPlayerName(t.player)}
                                  </td>
                                  <td className="px-3 py-2.5 text-white/60 whitespace-nowrap">
                                    {formatDate(t.date)}
                                  </td>
                                  <td className="px-3 py-2.5 text-right text-white font-bold font-orbitron whitespace-nowrap">
                                    {money(t.grossCost)}
                                  </td>
                                  <td className="px-3 py-2.5 text-right text-white/80 font-bold font-orbitron whitespace-nowrap">
                                    {money(t.commission)}
                                  </td>
                                  <td className="px-3 py-2.5 text-center">
                                    {t.payoutStatus ? (
                                      <PayoutStatusBadge status={t.payoutStatus} />
                                    ) : (
                                      <span className="text-white/40">{DASH}</span>
                                    )}
                                  </td>
                                  <td className="px-3 py-2.5 text-white/60 font-mono text-[11px] max-w-40 truncate" title={t.payoutReference || undefined}>
                                    {t.payoutReference || DASH}
                                  </td>
                                  <td className="px-3 py-2.5 text-white/60 whitespace-nowrap">
                                    {formatDateTime(t.paidAt)}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Pay confirm dialog */}
      <Dialog open={!!payTarget} onOpenChange={(open) => !open && !isPaying && setPayTarget(null)}>
        <DialogContent className="max-w-md bg-[#111111] border border-white/20 text-white p-6 sm:p-8 rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-black font-orbitron tracking-tight text-white">
              Confirm payout
            </DialogTitle>
            <DialogDescription className="text-white/60">
              Pay {money(payTarget?.pendingAmount)} to {payTarget?.name || DASH} via Stripe
              {payTargetPendingCount > 0
                ? ` for ${payTargetPendingCount} pending transaction${payTargetPendingCount === 1 ? "" : "s"}.`
                : "."}{" "}
              On-hold and locked earnings are not included.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="payout-reference" className="text-white/70 text-xs">
                Payout reference (optional)
              </Label>
              <Input
                id="payout-reference"
                value={payoutReference}
                onChange={(e) => setPayoutReference(e.target.value)}
                placeholder="e.g. internal batch ID"
                className="bg-black/40 border-white/20 text-white"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="payout-notes" className="text-white/70 text-xs">
                Notes (optional)
              </Label>
              <Textarea
                id="payout-notes"
                value={payoutNotes}
                onChange={(e) => setPayoutNotes(e.target.value)}
                placeholder="Anything worth recording with this payout"
                className="bg-black/40 border-white/20 text-white min-h-20"
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={isPaying}
              onClick={() => setPayTarget(null)}
              className="border-white/20 text-white hover:bg-white/10 rounded-xl"
            >
              Cancel
            </Button>
            <Button type="button" disabled={isPaying} onClick={handleConfirmPay} className="rounded-xl font-black">
              {isPaying ? (
                <RefreshCw className="size-3.5 animate-spin" />
              ) : (
                <IconCash size={16} />
              )}
              {isPaying ? "Paying..." : `Pay ${money(payTarget?.pendingAmount)}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Pay All confirm dialog */}
      {(() => {
        const payAllAmount =
          payAllRecipientType === "COACH"
            ? summary?.totalCoachPending
            : payAllRecipientType === "ACADEMY"
            ? summary?.totalAcademyPending
            : summary?.totalPendingOverall;
        const payAllOnHold =
          payAllRecipientType === "COACH"
            ? summary?.totalCoachOnHold
            : payAllRecipientType === "ACADEMY"
            ? summary?.totalAcademyOnHold
            : summary?.totalOnHoldOverall;

        return (
          <Dialog open={payAllOpen} onOpenChange={(open) => !open && !isPayingAll && setPayAllOpen(false)}>
            <DialogContent className="max-w-md bg-[#111111] border border-white/20 text-white p-6 sm:p-8 rounded-3xl">
              <DialogHeader>
                <DialogTitle className="text-lg font-black font-orbitron tracking-tight text-white">
                  Bulk payout —{" "}
                  {payAllRecipientType === "COACH" ? "coaches" : payAllRecipientType === "ACADEMY" ? "academies" : "all recipients"}
                </DialogTitle>
                <DialogDescription className="text-white/60">
                  Disburse <span className="text-amber-400 font-bold">{money(payAllAmount)}</span> to eligible recipients
                  whose Stripe accounts are ready. Recipients without Stripe set up are skipped automatically.
                </DialogDescription>
              </DialogHeader>

              <div className="flex flex-col gap-2">
                <Label className="text-white/70 text-xs">Pay for</Label>
                <div className="flex items-center gap-1 rounded-xl border border-white/20 bg-black/40 p-1">
                  {RECIPIENT_TABS.map((tab) => (
                    <button
                      key={tab.value}
                      type="button"
                      onClick={() => setPayAllRecipientType(tab.value)}
                      className={cn(
                        "flex-1 h-8 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer",
                        payAllRecipientType === tab.value
                          ? "bg-primary text-white shadow-md shadow-primary/30"
                          : "text-white/60 hover:text-white hover:bg-white/5"
                      )}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="rounded-xl bg-white/5 border border-white/10 p-3">
                  <p className="text-[9px] uppercase font-bold tracking-wider text-white/40">Pending (payable)</p>
                  <p className="text-sm font-black font-orbitron text-amber-400 mt-0.5 truncate">{money(payAllAmount)}</p>
                </div>
                <div className="rounded-xl bg-white/5 border border-white/10 p-3">
                  <p className="text-[9px] uppercase font-bold tracking-wider text-white/40">On hold (skipped)</p>
                  <p className="text-sm font-black font-orbitron text-white/60 mt-0.5 truncate">{money(payAllOnHold)}</p>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="pay-all-notes" className="text-white/70 text-xs">
                  Notes (optional)
                </Label>
                <Textarea
                  id="pay-all-notes"
                  value={payAllNotes}
                  onChange={(e) => setPayAllNotes(e.target.value)}
                  placeholder="e.g. November 2026 bulk payout"
                  className="bg-black/40 border-white/20 text-white min-h-16"
                />
              </div>

              <DialogFooter className="gap-2">
                <Button
                  type="button"
                  variant="outline"
                  disabled={isPayingAll}
                  onClick={() => setPayAllOpen(false)}
                  className="border-white/20 text-white hover:bg-white/10 rounded-xl"
                >
                  Cancel
                </Button>
                <Button type="button" disabled={isPayingAll} onClick={handleConfirmPayAll} className="rounded-xl font-black">
                  {isPayingAll ? <RefreshCw className="size-3.5 animate-spin" /> : <IconCash size={16} />}
                  {isPayingAll ? "Paying all..." : `Pay all ${money(payAllAmount)}`}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        );
      })()}
    </div>
  );
};

export default SuperAdminPayouts;
