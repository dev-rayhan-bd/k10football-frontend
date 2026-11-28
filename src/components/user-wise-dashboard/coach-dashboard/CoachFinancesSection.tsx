"use client";

import { useState } from "react";
import {
  IconAlertCircle,
  IconCalendarMonth,
  IconChevronLeft,
  IconChevronRight,
  IconCircleCheck,
  IconCoins,
  IconHourglass,
  IconReportMoney,
  IconWallet,
} from "@tabler/icons-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { SettingsSection } from "@/components/dashboard/DashboardSettingsElements";
import {
  PAYOUT_STATUSES,
  PAYOUT_STATUS_LABELS,
  PayoutStatusBadge,
} from "@/components/finance/PayoutStatusBadge";
import { useGetCoachFinancesQuery } from "@/redux/features/coach/coachApi";
import type { ICoachFinanceTransaction } from "@/types/coach.type";

const str = (...values: unknown[]) => {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return "";
};

const nested = (value: unknown, key: string) =>
  value && typeof value === "object" ? (value as Record<string, unknown>)[key] : undefined;

/** Transaction rows are rendered defensively — only payoutStatus is guaranteed by the API contract. */
const describeTransaction = (tx: ICoachFinanceTransaction, formatAmount: (value: unknown) => string) => {
  const player = tx.player ?? tx.playerId;
  const amountNumber =
    tx.coachEarnings ??
    tx.commission ??
    tx.amount ??
    tx.grossCost ??
    tx.coachAmount ??
    tx.commissionCoach ??
    tx.coachCommission ??
    tx.coachShare ??
    tx.earningAmount;
  return {
    id: str(tx._id, tx.id),
    player: str(tx.playerName, nested(player, "name"), nested(player, "fullName")) || "—",
    type: str(tx.transactionType, tx.type, tx.description) || "Transaction",
    amount:
      str(
        tx.coachEarningsFormatted,
        tx.commissionFormatted,
        tx.amountFormatted,
        tx.commissionCoachFormatted,
        tx.coachAmountFormatted,
        tx.grossCostFormatted,
      ) || (amountNumber !== undefined && amountNumber !== null ? formatAmount(amountNumber) : "—"),
    date: str(tx.date, tx.formattedDate, tx.createdAt).split("T")[0] || "—",
  };
};

const SummaryCard = ({
  label,
  value,
  hint,
  icon,
  tone,
}: {
  label: string;
  value: string;
  hint: string;
  icon: React.ReactNode;
  tone: "default" | "amber" | "muted";
}) => (
  <div
    className={
      tone === "amber"
        ? "flex flex-col gap-2 rounded-2xl border border-amber-500/20 bg-linear-to-b from-amber-500/5 to-transparent p-4"
        : tone === "muted"
          ? "flex flex-col gap-2 rounded-2xl border border-dashed border-white/15 bg-white/2 p-4"
          : "flex flex-col gap-2 rounded-2xl border border-white/10 bg-linear-to-b from-white/4 to-white/1 p-4"
    }
  >
    <div className="flex items-center justify-between gap-2">
      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{label}</span>
      <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-white/10 text-foreground">{icon}</div>
    </div>
    <div
      className={
        tone === "amber"
          ? "font-orbitron text-2xl font-black text-amber-400"
          : tone === "muted"
            ? "font-orbitron text-2xl font-black text-white/70"
            : "font-orbitron text-2xl font-black text-foreground"
      }
    >
      {value}
    </div>
    <span className="text-[10px] text-muted-foreground">{hint}</span>
  </div>
);

const PAGE_LIMIT = 10;

/** Coach earnings from GET /coaches/me/finances, including ON_HOLD (unvalidated CV) amounts. */
const CoachFinancesSection = () => {
  const [page, setPage] = useState(1);
  const [payoutStatusFilter, setPayoutStatusFilter] = useState("ALL");

  const { data, isLoading, isFetching, isError } = useGetCoachFinancesQuery({
    page,
    limit: PAGE_LIMIT,
    payoutStatus: payoutStatusFilter === "ALL" ? undefined : payoutStatusFilter,
  });
  const summary = data?.data?.summary;
  const transactions = data?.data?.transactions ?? [];
  const meta = data?.data?.meta;
  const totalPages = meta?.totalPages ?? 1;
  const totalCount = meta?.total ?? transactions.length;
  const currency = String(summary?.currency || "USD").toUpperCase();

  const formatAmount = (value: unknown) => {
    const amount = Number(value ?? 0);
    try {
      return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(Number.isFinite(amount) ? amount : 0);
    } catch {
      return `${currency} ${Number.isFinite(amount) ? amount : 0}`;
    }
  };

  return (
    <SettingsSection title="My Finances" icon={<IconReportMoney size={20} />}>
      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl bg-white/5" />
          ))}
        </div>
      ) : isError ? (
        <div className="flex items-center gap-2 text-sm text-destructive">
          <IconAlertCircle className="size-4" /> Failed to load your finances.
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <SummaryCard
              label="Total Earnings"
              value={summary?.totalEarningsFormatted || formatAmount(summary?.totalEarnings)}
              hint="Earned from validated work"
              icon={<IconCoins className="size-4" />}
              tone="default"
            />
            <SummaryCard
              label="Pending Payouts"
              value={summary?.pendingPayoutsFormatted || formatAmount(summary?.pendingPayouts)}
              hint="Earned, waiting to be paid out"
              icon={<IconWallet className="size-4" />}
              tone="amber"
            />
            <SummaryCard
              label="Awaiting your validation"
              value={summary?.onHoldPayoutsFormatted || formatAmount(summary?.onHoldPayouts)}
              hint="Paid by players — validate their CVs to unlock. Not included in the totals."
              icon={<IconHourglass className="size-4" />}
              tone="muted"
            />
            <SummaryCard
              label="Completed Payouts"
              value={summary?.completedPayoutsFormatted || formatAmount(summary?.completedPayouts)}
              hint="Already paid out to you"
              icon={<IconCircleCheck className="size-4" />}
              tone="default"
            />
            <SummaryCard
              label="This Month"
              value={summary?.thisMonthEarningsFormatted || formatAmount(summary?.thisMonthEarnings)}
              hint="Earned this month"
              icon={<IconCalendarMonth className="size-4" />}
              tone="default"
            />
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="font-orbitron text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                Transactions ({totalCount})
              </span>
              <select
                aria-label="Filter by payout status"
                value={payoutStatusFilter}
                onChange={(e) => {
                  setPayoutStatusFilter(e.target.value);
                  setPage(1);
                }}
                className="rounded-lg border border-white/15 bg-[#111111] px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-white focus:outline-none cursor-pointer"
              >
                <option value="ALL">All Payouts</option>
                {PAYOUT_STATUSES.map((value) => (
                  <option key={value} value={value}>
                    {PAYOUT_STATUS_LABELS[value]}
                  </option>
                ))}
              </select>
            </div>
            {transactions.length === 0 ? (
              <p className="rounded-xl border border-white/5 bg-white/2 p-4 text-center text-xs text-muted-foreground">
                No transactions yet.
              </p>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-white/10">
                <table className="w-full min-w-150 border-collapse text-left text-xs">
                  <thead>
                    <tr className="border-b border-white/10 bg-white/2">
                      {["Player", "Type", "Commission", "Rate", "Date", "Payout"].map((heading) => (
                        <th key={heading} className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                          {heading}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((tx, index) => {
                      const row = describeTransaction(tx, formatAmount);
                      return (
                        <tr key={row.id || index} className="border-b border-white/5 last:border-0">
                          <td className="px-4 py-3 font-bold text-foreground">{row.player}</td>
                          <td className="px-4 py-3 text-muted-foreground">{row.type}</td>
                          <td className="px-4 py-3 font-orbitron font-black text-foreground">{row.amount}</td>
                          <td className="px-4 py-3 text-muted-foreground">
                            {str(tx.commissionPercentage, tx.commissionRate) || "—"}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">{row.date}</td>
                          <td className="px-4 py-3">
                            <PayoutStatusBadge status={tx.payoutStatus} onHoldLabel="Validate CV to unlock" />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-2 text-xs font-bold text-muted-foreground">
                <p>
                  Page {meta?.page ?? page} of {totalPages} ({totalCount} total)
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon-sm"
                    aria-label="Previous page"
                    disabled={page <= 1 || isFetching}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    <IconChevronLeft size={14} />
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon-sm"
                    aria-label="Next page"
                    disabled={page >= totalPages || isFetching}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    <IconChevronRight size={14} />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </SettingsSection>
  );
};

export default CoachFinancesSection;
