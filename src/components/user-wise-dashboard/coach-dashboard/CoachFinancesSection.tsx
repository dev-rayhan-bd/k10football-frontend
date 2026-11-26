"use client";

import { IconAlertCircle, IconCoins, IconHourglass, IconReportMoney, IconWallet } from "@tabler/icons-react";
import { Skeleton } from "@/components/ui/skeleton";
import { SettingsSection } from "@/components/dashboard/DashboardSettingsElements";
import { PayoutStatusBadge } from "@/components/finance/PayoutStatusBadge";
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
  const amountNumber = tx.amount ?? tx.commission ?? tx.commissionCoach ?? tx.coachAmount;
  return {
    id: str(tx._id, tx.id),
    player: str(tx.playerName, nested(player, "name"), nested(player, "fullName")) || "—",
    type: str(tx.transactionType, tx.type, tx.description) || "Transaction",
    amount:
      str(tx.amountFormatted, tx.commissionFormatted, tx.commissionCoachFormatted, tx.coachAmountFormatted) ||
      (amountNumber !== undefined ? formatAmount(amountNumber) : "—"),
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

/** Coach earnings from GET /coaches/me/finances, including ON_HOLD (unvalidated CV) amounts. */
const CoachFinancesSection = () => {
  const { data, isLoading, isError } = useGetCoachFinancesQuery();
  const summary = data?.data?.summary;
  const transactions = data?.data?.transactions ?? [];
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
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl bg-white/5" />
          ))}
        </div>
      ) : isError ? (
        <div className="flex items-center gap-2 text-sm text-destructive">
          <IconAlertCircle className="size-4" /> Failed to load your finances.
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
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
          </div>

          <div className="flex flex-col gap-3">
            <span className="font-orbitron text-[10px] font-black uppercase tracking-widest text-muted-foreground">
              Transactions
            </span>
            {transactions.length === 0 ? (
              <p className="rounded-xl border border-white/5 bg-white/2 p-4 text-center text-xs text-muted-foreground">
                No transactions yet.
              </p>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-white/10">
                <table className="w-full min-w-150 border-collapse text-left text-xs">
                  <thead>
                    <tr className="border-b border-white/10 bg-white/2">
                      {["Player", "Type", "Amount", "Date", "Payout"].map((heading) => (
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
          </div>
        </div>
      )}
    </SettingsSection>
  );
};

export default CoachFinancesSection;
