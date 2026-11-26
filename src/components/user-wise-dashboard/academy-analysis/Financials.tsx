"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import DashboardModal from "@/components/dashboard/DashboardModal";
import {
  IconFileText,
  IconClock,
  IconCircleX,
  IconCoin,
  IconCalendar,
  IconRefresh,
  IconDownload,
  IconSearch,
  IconChevronDown,
  IconEye,
  IconX,
  IconCheck,
  IconCopy,
  IconChevronLeft,
  IconChevronRight,
  IconReceipt,
  IconPercentage,
  IconHourglass,
  IconLock,
} from "@tabler/icons-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useGetFinanceCommitteeQuery } from "@/redux/features/academy/academyApi";
import { IFinanceTransactionItem } from "@/types/academy.type";
import { PAYOUT_STATUSES, PAYOUT_STATUS_LABELS, PayoutStatusBadge } from "@/components/finance/PayoutStatusBadge";

interface StatCardProps {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  value: string | number;
  label: string;
  iconColor: string;
  isLoading?: boolean;
}

const FinancialStatCard = ({
  icon: Icon,
  value,
  label,
  iconColor,
  isLoading,
}: StatCardProps) => (
  <div className="bg-[#111111] border border-white/15 hover:border-white/25 rounded-2xl p-4 sm:p-6 flex flex-col gap-3 sm:gap-4 flex-1 min-w-0 shadow-lg transition-all">
    <div className="size-9 sm:size-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
      <Icon size={20} className={iconColor} />
    </div>
    <div className="min-w-0">
      <p className="text-white text-2xl sm:text-3xl font-black font-orbitron truncate">
        {isLoading ? "..." : value}
      </p>
      <p className="text-white/40 text-[9px] sm:text-[11px] font-bold uppercase tracking-wider line-clamp-2 mt-1">
        {label}
      </p>
    </div>
  </div>
);

export const Financials = () => {
  // Query & Filter States
  const [page, setPage] = useState<number>(1);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");
  const [payoutStatusFilter, setPayoutStatusFilter] = useState<string>("ALL");

  // Modal State
  const [selectedTransaction, setSelectedTransaction] = useState<IFinanceTransactionItem | null>(null);
  const [isCopied, setIsCopied] = useState<boolean>(false);

  // RTK Query Hook
  const {
    data: response,
    isLoading,
    isFetching,
    refetch,
  } = useGetFinanceCommitteeQuery({
    page,
    limit: 10,
    searchTerm: searchTerm.trim() || undefined,
    status: statusFilter === "ALL" ? undefined : statusFilter,
    payoutStatus: payoutStatusFilter === "ALL" ? undefined : payoutStatusFilter,
  });

  const financeData = response?.data;
  const stats = financeData?.stats;
  const transactions: IFinanceTransactionItem[] = financeData?.transactions || [];
  const meta = financeData?.meta || financeData?.pagination;
  const totalPages = meta?.totalPages || 1;
  const totalCount = meta?.total ?? transactions.length;

  // Extract distinct transaction types for filter
  const distinctTypes = useMemo(() => {
    const set = new Set<string>();
    transactions.forEach((t) => {
      const type = t.transactionType || t.type;
      if (type) set.add(type);
    });
    return Array.from(set);
  }, [transactions]);

  // Filtered transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter((item) => {
      const q = searchTerm.toLowerCase().trim();
      const playerName = item.player?.name || "";
      const type = item.transactionType || item.type || "";
      const notes = item.notes || "";

      const matchesSearch =
        !q ||
        playerName.toLowerCase().includes(q) ||
        type.toLowerCase().includes(q) ||
        notes.toLowerCase().includes(q);

      const status = (item.status || "").toUpperCase();
      const matchesStatus =
        statusFilter === "ALL" || status === statusFilter.toUpperCase();

      const itemType = (item.transactionType || item.type || "").toUpperCase();
      const matchesType =
        typeFilter === "ALL" || itemType === typeFilter.toUpperCase();

      const matchesPayout =
        payoutStatusFilter === "ALL" || (item.payoutStatus || "").toUpperCase() === payoutStatusFilter;

      return matchesSearch && matchesStatus && matchesType && matchesPayout;
    });
  }, [transactions, searchTerm, statusFilter, typeFilter, payoutStatusFilter]);

  // Export to CSV function
  const handleExportCSV = () => {
    if (filteredTransactions.length === 0) {
      toast.info("No transaction data available to export");
      return;
    }

    const headers = [
      "Player Name",
      "Position",
      "Transaction Type",
      "Total Cost",
      "Commission Academy",
      "Commission Percentage",
      "Date",
      "Status",
      "Payout Status",
      "Notes",
    ];

    const rows = filteredTransactions.map((t) => [
      `"${t.player?.name || "N/A"}"`,
      `"${t.player?.position || "N/A"}"`,
      `"${t.transactionType || t.type || "N/A"}"`,
      `"${t.costFormatted || `$ ${t.cost}`}"`,
      `"${t.commissionAcademyFormatted || `$ ${t.commissionAcademy}`}"`,
      `"${t.commissionPercentage || "N/A"}"`,
      `"${t.date || (t.transactionDate ? t.transactionDate.split("T")[0] : "N/A")}"`,
      `"${t.status || "N/A"}"`,
      `"${t.payoutStatus || "N/A"}"`,
      `"${(t.notes || "").replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `academy_finance_committee_${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("Finance report exported successfully");
  };

  // Copy transaction notes / reference
  const handleCopyNotes = (text: string) => {
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    toast.success("Payment details copied to clipboard");
    setTimeout(() => setIsCopied(false), 2000);
  };

  // Status Badge Renderer
  const renderStatusBadge = (status?: string) => {
    const s = (status || "").toUpperCase();
    if (s === "COMPLETED" || s === "PAID") {
      return (
        <span className="px-3.5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 inline-flex items-center gap-1.5">
          <span className="size-1.5 rounded-full bg-emerald-400" />
          Completed
        </span>
      );
    }
    if (s === "PENDING") {
      return (
        <span className="px-3.5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-yellow-500/15 text-yellow-400 border border-yellow-500/30 inline-flex items-center gap-1.5">
          <span className="size-1.5 rounded-full bg-yellow-400 animate-pulse" />
          Pending
        </span>
      );
    }
    return (
      <span className="px-3.5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-red-500/15 text-red-400 border border-red-500/30 inline-flex items-center gap-1.5">
        <span className="size-1.5 rounded-full bg-red-400" />
        Rejected
      </span>
    );
  };

  return (
    <div className="flex flex-col gap-6 md:gap-8 pb-10 w-full max-w-full overflow-x-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl md:text-5xl font-black text-white font-orbitron uppercase tracking-tight wrap-break-word">
              Finance Committee
            </h1>
            <span className="size-2.5 rounded-full bg-[#E31B23] animate-pulse" />
          </div>
          <p className="text-white/60 font-medium mt-1 md:mt-2 text-xs md:text-base">
            Track your academy&apos;s revenue and transactions
          </p>
        </div>

        <button
          onClick={() => refetch()}
          title="Refresh finance data"
          className="h-11 px-4 rounded-xl bg-white/5 border border-white/15 text-white/70 hover:text-white hover:bg-white/10 transition-all flex items-center justify-center gap-2 cursor-pointer font-bold shrink-0"
        >
          <IconRefresh size={18} className={isFetching ? "animate-spin text-[#E31B23]" : ""} />
          <span className="text-xs uppercase tracking-wider hidden sm:inline">Refresh</span>
        </button>
      </div>

      {/* Summary Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-7 gap-3 sm:gap-4 md:gap-6">
        <FinancialStatCard
          icon={IconFileText}
          value={stats?.gameReportsCount ?? 0}
          label="Game Reports"
          iconColor="text-white/80"
          isLoading={isLoading}
        />
        <FinancialStatCard
          icon={IconClock}
          value={stats?.pendingCount ?? 0}
          label="Pending"
          iconColor="text-yellow-500"
          isLoading={isLoading}
        />
        <FinancialStatCard
          icon={IconCircleX}
          value={stats?.rejectedCount ?? 0}
          label="Rejected"
          iconColor="text-red-500"
          isLoading={isLoading}
        />
        <FinancialStatCard
          icon={IconCoin}
          value={
            stats?.totalEarningsFormatted ||
            (stats?.currency || "$ ") + (stats?.totalEarnings?.toFixed(2) ?? "0.00")
          }
          label="Total Earnings"
          iconColor="text-emerald-400"
          isLoading={isLoading}
        />
        <FinancialStatCard
          icon={IconCalendar}
          value={
            stats?.thisMonthFormatted ||
            (stats?.currency || "$ ") + (stats?.thisMonth?.toFixed(2) ?? "0.00")
          }
          label="This Month"
          iconColor="text-blue-400"
          isLoading={isLoading}
        />
        <FinancialStatCard
          icon={IconHourglass}
          value={stats?.onHoldPayoutsFormatted || (stats?.currency || "$ ") + (stats?.onHoldPayouts?.toFixed(2) ?? "0.00")}
          label="Awaiting coach validation"
          iconColor="text-white/60"
          isLoading={isLoading}
        />
        <FinancialStatCard
          icon={IconLock}
          value={stats?.lockedPayoutsFormatted || (stats?.currency || "$ ") + (stats?.lockedPayouts?.toFixed(2) ?? "0.00")}
          label="Locked until subscription is active"
          iconColor="text-red-500"
          isLoading={isLoading}
        />
      </div>

      {/* Table Section */}
      <div className="bg-[#111111] border border-white/15 rounded-3xl md:rounded-[40px] p-5 md:p-8 flex flex-col gap-6 shadow-2xl w-full max-w-full">
        {/* Toolbar Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div className="flex items-center gap-3">
            <h2 className="text-lg md:text-xl font-black uppercase text-white font-orbitron wrap-break-word">
              Game report/validation/commission ({totalCount})
            </h2>
            {isFetching && (
              <span className="text-xs text-[#E31B23] font-bold flex items-center gap-1.5 animate-pulse">
                Updating...
              </span>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
            {/* Search Input */}
            <div className="relative min-w-0 flex-1 sm:w-60">
              <IconSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-white/40" />
              <input
                type="text"
                placeholder="Search athlete or type..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(1);
                }}
                className="w-full bg-white/5 border border-white/15 rounded-xl py-2 pl-9 pr-8 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-[#E31B23] transition-all"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
                  title="Clear search"
                >
                  <IconX size={14} />
                </button>
              )}
            </div>

            {/* Type Filter */}
            {distinctTypes.length > 0 && (
              <div className="relative shrink-0">
                <select
                  value={typeFilter}
                  onChange={(e) => {
                    setTypeFilter(e.target.value);
                    setPage(1);
                  }}
                  className="w-full sm:w-auto bg-white/5 border border-white/15 rounded-xl px-3.5 py-2 pr-9 text-xs font-bold text-white uppercase tracking-wider focus:outline-none focus:border-white/30 cursor-pointer appearance-none"
                >
                  <option value="ALL" className="bg-[#111111] text-white">
                    All Types
                  </option>
                  {distinctTypes.map((type) => (
                    <option key={type} value={type} className="bg-[#111111] text-white">
                      {type}
                    </option>
                  ))}
                </select>
                <IconChevronDown
                  size={14}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 pointer-events-none"
                />
              </div>
            )}

            {/* Status Filter */}
            <div className="relative shrink-0">
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                className="w-full sm:w-auto bg-white/5 border border-white/15 rounded-xl px-3.5 py-2 pr-9 text-xs font-bold text-white uppercase tracking-wider focus:outline-none focus:border-white/30 cursor-pointer appearance-none"
              >
                <option value="ALL" className="bg-[#111111] text-white">
                  All Status
                </option>
                <option value="COMPLETED" className="bg-[#111111] text-white">
                  Completed
                </option>
                <option value="PENDING" className="bg-[#111111] text-white">
                  Pending
                </option>
                <option value="REJECTED" className="bg-[#111111] text-white">
                  Rejected
                </option>
              </select>
              <IconChevronDown
                size={14}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 pointer-events-none"
              />
            </div>

            {/* Payout Status Filter */}
            <div className="relative shrink-0">
              <select
                value={payoutStatusFilter}
                onChange={(e) => {
                  setPayoutStatusFilter(e.target.value);
                  setPage(1);
                }}
                aria-label="Filter by payout status"
                className="w-full sm:w-auto bg-white/5 border border-white/15 rounded-xl px-3.5 py-2 pr-9 text-xs font-bold text-white uppercase tracking-wider focus:outline-none focus:border-white/30 cursor-pointer appearance-none"
              >
                <option value="ALL" className="bg-[#111111] text-white">
                  All Payouts
                </option>
                {PAYOUT_STATUSES.map((value) => (
                  <option key={value} value={value} className="bg-[#111111] text-white">
                    {PAYOUT_STATUS_LABELS[value]}
                  </option>
                ))}
              </select>
              <IconChevronDown
                size={14}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 pointer-events-none"
              />
            </div>

            {/* Export CSV Button */}
            <button
              onClick={handleExportCSV}
              className="w-full sm:w-auto justify-center bg-white/5 hover:bg-white/10 border border-white/15 text-white/70 hover:text-white px-5 py-2 rounded-xl flex items-center gap-2 transition-all shadow-md shrink-0 cursor-pointer active:scale-95 font-bold"
            >
              <IconDownload size={16} />
              <span className="text-[11px] font-black uppercase tracking-widest">Export</span>
            </button>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="border border-white/15 rounded-2xl overflow-x-auto w-full custom-scrollbar">
          <table className="w-full min-w-200 text-left border-collapse">
            <thead>
              <tr className="bg-white/2 border-b border-white/15 text-[11px] font-black text-white/80 uppercase tracking-widest">
                <th className="px-6 py-4 sm:py-5 border-r border-white/15">Name</th>
                <th className="px-6 py-4 sm:py-5 border-r border-white/15 text-center">Type</th>
                <th className="px-6 py-4 sm:py-5 border-r border-white/15 text-center">Cost</th>
                <th className="px-6 py-4 sm:py-5 border-r border-white/15 text-center">
                  Commission Academy
                </th>
                <th className="px-6 py-4 sm:py-5 border-r border-white/15 text-center">Date</th>
                <th className="px-6 py-4 sm:py-5 text-center border-r border-white/15">Status</th>
                <th className="px-6 py-4 sm:py-5 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/15">
              {isLoading ? (
                Array.from({ length: 4 }).map((_, idx) => (
                  <tr key={`skel-tr-${idx}`} className="animate-pulse">
                    <td className="px-6 py-5 border-r border-white/10">
                      <div className="flex items-center gap-3">
                        <div className="size-11 rounded-full bg-white/10 shrink-0 shimmer" />
                        <div className="flex flex-col gap-2">
                          <div className="h-4 w-32 bg-white/10 rounded shimmer" />
                          <div className="h-3 w-16 bg-white/5 rounded shimmer" />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 border-r border-white/10 text-center">
                      <div className="h-4 w-24 bg-white/10 rounded mx-auto shimmer" />
                    </td>
                    <td className="px-6 py-5 border-r border-white/10 text-center">
                      <div className="h-4 w-16 bg-white/10 rounded mx-auto shimmer" />
                    </td>
                    <td className="px-6 py-5 border-r border-white/10 text-center">
                      <div className="h-4 w-20 bg-white/10 rounded mx-auto shimmer" />
                    </td>
                    <td className="px-6 py-5 border-r border-white/10 text-center">
                      <div className="h-4 w-20 bg-white/10 rounded mx-auto shimmer" />
                    </td>
                    <td className="px-6 py-5 border-r border-white/10 text-center">
                      <div className="h-6 w-20 bg-white/10 rounded-full mx-auto shimmer" />
                    </td>
                    <td className="px-6 py-5 text-center">
                      <div className="size-8.5 bg-white/10 rounded-xl mx-auto shimmer" />
                    </td>
                  </tr>
                ))
              ) : filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="size-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40">
                        <IconReceipt size={24} />
                      </div>
                      <p className="text-sm font-bold text-white">No transactions found</p>
                      <p className="text-xs text-white/50 max-w-sm">
                        {searchTerm || statusFilter !== "ALL" || typeFilter !== "ALL" || payoutStatusFilter !== "ALL"
                          ? "Try adjusting your filters or search keywords to view transactions."
                          : "No financial transactions logged yet."}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((row, i) => {
                  const playerName = row.player?.name || "Player";
                  const playerAvatar = row.player?.avatar || "/placeholder_img.jpg";
                  const playerPos = row.player?.position;

                  return (
                    <tr
                      key={row._id || row.id || i}
                      className={cn(
                        "hover:bg-white/2 transition-colors group",
                        i !== filteredTransactions.length - 1 && "border-b border-white/15"
                      )}
                    >
                      {/* Name & Player Card */}
                      <td className="px-6 py-5 border-r border-white/15">
                        <div className="flex items-center gap-3">
                          <div className="size-11 rounded-full overflow-hidden border border-white/15 shrink-0 bg-[#1A1A1A] relative">
                            <Image
                              width={44}
                              height={44}
                              src={playerAvatar}
                              alt={playerName}
                              unoptimized
                              className="size-full object-cover group-hover:scale-105 transition-transform"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.srcset = "";
                                target.src = "/placeholder_img.jpg";
                              }}
                            />
                          </div>
                          <div className="flex flex-col min-w-0">
                            <p className="text-white text-sm font-black uppercase truncate">
                              {playerName}
                            </p>
                            {playerPos && (
                              <p className="text-[#00FF62] text-[10px] font-bold uppercase tracking-wider mt-0.5">
                                {playerPos}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Type */}
                      <td className="px-6 py-5 border-r border-white/15 text-center">
                        <span className="text-white/80 text-sm font-medium">
                          {row.transactionType || row.type || "Transaction"}
                        </span>
                      </td>

                      {/* Cost */}
                      <td className="px-6 py-5 border-r border-white/15 text-center">
                        <span className="text-white text-sm font-black font-orbitron">
                          {row.costFormatted || `$ ${row.cost?.toFixed(2)}`}
                        </span>
                      </td>

                      {/* Commission Academy */}
                      <td className="px-6 py-5 border-r border-white/15 text-center">
                        <div className="flex items-center justify-center gap-1.5 flex-wrap">
                          <span className="text-white text-sm font-black font-orbitron text-[#00FF62]">
                            {row.commissionAcademyFormatted || `$ ${row.commissionAcademy?.toFixed(3)}`}
                          </span>
                          {row.commissionPercentage && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#00FF62]/10 text-[#00FF62] border border-[#00FF62]/20">
                              {row.commissionPercentage}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Date */}
                      <td className="px-6 py-5 border-r border-white/15 text-center">
                        <span className="text-white/60 text-xs font-medium whitespace-nowrap">
                          {row.date ||
                            (row.transactionDate ? row.transactionDate.split("T")[0] : "—")}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-5 border-r border-white/15 text-center">
                        <div className="flex flex-col items-center gap-1.5">
                          {renderStatusBadge(row.status)}
                          <PayoutStatusBadge status={row.payoutStatus} />
                        </div>
                      </td>

                      {/* Action */}
                      <td className="px-6 py-5 text-center">
                        <button
                          onClick={() => setSelectedTransaction(row)}
                          className="size-8.5 inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/5 text-white/70 hover:text-white hover:border-white/30 hover:bg-white/10 transition-all cursor-pointer active:scale-95 shadow-sm"
                          title="View Transaction Details"
                        >
                          <IconEye size={17} stroke={2} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-white/10">
            <span className="text-xs font-bold text-white/50 uppercase tracking-wider">
              Showing Page {page} of {totalPages} ({totalCount} total transactions)
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={page <= 1}
                className="px-3.5 py-2 rounded-xl bg-white/5 border border-white/15 text-xs font-bold text-white hover:bg-white/10 transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer"
              >
                <IconChevronLeft size={16} />
                <span>Prev</span>
              </button>
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }).map((_, idx) => {
                  const pNum = idx + 1;
                  return (
                    <button
                      key={`page-btn-${pNum}`}
                      onClick={() => setPage(pNum)}
                      className={cn(
                        "size-8 rounded-xl text-xs font-bold transition-all cursor-pointer",
                        page === pNum
                          ? "bg-[#E31B23] text-white shadow-md shadow-[#E31B23]/30"
                          : "bg-white/5 text-white/70 hover:bg-white/10"
                      )}
                    >
                      {pNum}
                    </button>
                  );
                })}
              </div>
              <button
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                disabled={page >= totalPages}
                className="px-3.5 py-2 rounded-xl bg-white/5 border border-white/15 text-xs font-bold text-white hover:bg-white/10 transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer"
              >
                <span>Next</span>
                <IconChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Transaction Details Modal */}
      <DashboardModal
        isOpen={Boolean(selectedTransaction)}
        onClose={() => setSelectedTransaction(null)}
        title="Transaction Breakdown"
        subtitle={`Transaction ID: ${selectedTransaction?._id || selectedTransaction?.id || ""}`}
        maxWidth="max-w-xl"
        footer={
          <div className="flex justify-end w-full">
            <button
              onClick={() => setSelectedTransaction(null)}
              className="px-6 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-xs font-bold text-white uppercase tracking-wider transition-all cursor-pointer"
            >
              Close
            </button>
          </div>
        }
      >
        {selectedTransaction && (
          <div className="flex flex-col gap-5 py-2">
            {/* Athlete Info */}
            <div className="p-4 rounded-2xl bg-[#161a18] border border-white/15 flex items-center gap-4">
              <div className="size-14 rounded-full overflow-hidden border border-white/20 shrink-0 bg-[#111111] relative">
                <Image
                  src={selectedTransaction.player?.avatar || "/placeholder_img.jpg"}
                  alt={selectedTransaction.player?.name || "Player"}
                  width={56}
                  height={56}
                  unoptimized
                  className="size-full object-cover"
                />
              </div>
              <div className="flex flex-col min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-base font-black text-white uppercase truncate">
                    {selectedTransaction.player?.name || "Athlete"}
                  </h3>
                  <div className="flex flex-col items-end gap-1.5">
                    {renderStatusBadge(selectedTransaction.status)}
                    <PayoutStatusBadge status={selectedTransaction.payoutStatus} />
                  </div>
                </div>
                {selectedTransaction.player?.position && (
                  <span className="font-bold text-[#00FF62] text-xs mt-1">
                    {selectedTransaction.player.position}
                  </span>
                )}
              </div>
            </div>

            {/* Financial Commission Breakdown Card */}
            <div className="p-5 rounded-2xl bg-[#111111] border border-white/15 flex flex-col gap-4">
              <span className="text-[10px] font-bold text-white/50 uppercase tracking-widest">
                Commission Share Breakdown
              </span>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[10px] font-bold text-white/40 uppercase tracking-wider">
                    Total Cost
                  </span>
                  <p className="text-xl sm:text-2xl font-black text-white font-orbitron mt-0.5">
                    {selectedTransaction.costFormatted || `$ ${selectedTransaction.cost?.toFixed(2)}`}
                  </p>
                </div>

                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold text-white/40 uppercase tracking-wider">
                      Academy Share
                    </span>
                    {selectedTransaction.commissionPercentage && (
                      <span className="text-[9px] font-black px-1.5 py-0.2 rounded bg-[#00FF62]/10 text-[#00FF62] border border-[#00FF62]/20">
                        {selectedTransaction.commissionPercentage}
                      </span>
                    )}
                  </div>
                  <p className="text-xl sm:text-2xl font-black text-[#00FF62] font-orbitron mt-0.5">
                    {selectedTransaction.commissionAcademyFormatted ||
                      `$ ${selectedTransaction.commissionAcademy?.toFixed(3)}`}
                  </p>
                </div>
              </div>
            </div>

            {/* Meta Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="p-3.5 rounded-xl bg-white/5 border border-white/10">
                <span className="text-[10px] font-bold uppercase tracking-wider text-white/40">
                  Transaction Type
                </span>
                <p className="text-xs font-bold text-white mt-1">
                  {selectedTransaction.transactionType || selectedTransaction.type || "General"}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-white/5 border border-white/10">
                <span className="text-[10px] font-bold uppercase tracking-wider text-white/40">
                  Transaction Date
                </span>
                <p className="text-xs font-bold text-white mt-1">
                  {selectedTransaction.date ||
                    (selectedTransaction.transactionDate
                      ? selectedTransaction.transactionDate.split("T")[0]
                      : "—")}
                </p>
              </div>
            </div>

            {/* Detailed Notes with Copy Option */}
            {selectedTransaction.notes && (
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-white/40">
                    <IconFileText size={14} />
                    <span>Transaction Reference / Notes</span>
                  </div>
                  <button
                    onClick={() => handleCopyNotes(selectedTransaction.notes!)}
                    className="text-[10px] font-bold text-[#00FF62] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    {isCopied ? <IconCheck size={12} /> : <IconCopy size={12} />}
                    <span>{isCopied ? "Copied" : "Copy"}</span>
                  </button>
                </div>
                <p className="text-xs text-white/90 leading-relaxed font-mono break-all select-all">
                  {selectedTransaction.notes}
                </p>
              </div>
            )}
          </div>
        )}
      </DashboardModal>
    </div>
  );
};

export default Financials;
