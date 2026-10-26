"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import DashboardModal from "@/components/dashboard/DashboardModal";
import {
  IconCurrencyDollar,
  IconDownload,
  IconArrowUpRight,
  IconClock,
  IconSearch,
  IconChevronDown,
  IconRefresh,
  IconEye,
  IconX,
  IconCheck,
  IconCopy,
  IconChevronLeft,
  IconChevronRight,
  IconCreditCard,
  IconFileText,
  IconReceipt,
} from "@tabler/icons-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useGetFeesPaymentsQuery } from "@/redux/features/academy/academyApi";
import { IFeesPaymentItem } from "@/types/academy.type";

export const FeesPayments = () => {
  // Query & Filter States
  const [page, setPage] = useState<number>(1);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // Detail Modal State
  const [selectedPayment, setSelectedPayment] = useState<IFeesPaymentItem | null>(null);
  const [isCopied, setIsCopied] = useState<boolean>(false);

  // RTK Query Hook
  const {
    data: response,
    isLoading,
    isFetching,
    refetch,
  } = useGetFeesPaymentsQuery({
    page,
    limit: 10,
    searchTerm: searchTerm.trim() || undefined,
    status: statusFilter === "ALL" ? undefined : statusFilter,
  });

  const dashboardData = response?.data;
  const stats = dashboardData?.stats;
  const paymentsList: IFeesPaymentItem[] = dashboardData?.payments || [];
  const meta = dashboardData?.meta || dashboardData?.pagination;
  const totalPages = meta?.totalPages || 1;
  const totalCount = meta?.total ?? paymentsList.length;

  // Client-side search and status filter fallback
  const filteredPayments = useMemo(() => {
    return paymentsList.filter((item) => {
      const q = searchTerm.toLowerCase().trim();
      const playerName = item.player?.name || "";
      const feeType = item.feeType || item.type || "";
      const txId = item.transactionId || "";
      const matchesSearch =
        !q ||
        playerName.toLowerCase().includes(q) ||
        feeType.toLowerCase().includes(q) ||
        txId.toLowerCase().includes(q);

      const status = (item.status || "").toUpperCase();
      const matchesStatus =
        statusFilter === "ALL" || status === statusFilter.toUpperCase();

      return matchesSearch && matchesStatus;
    });
  }, [paymentsList, searchTerm, statusFilter]);

  // Export to CSV function
  const handleExportCSV = () => {
    if (filteredPayments.length === 0) {
      toast.info("No payment data available to export");
      return;
    }

    const headers = [
      "Player Name",
      "Position",
      "Fee Type",
      "Amount",
      "Date",
      "Status",
      "Payment Method",
      "Transaction ID",
      "Notes",
    ];

    const rows = filteredPayments.map((p) => [
      `"${p.player?.name || "N/A"}"`,
      `"${p.player?.position || "N/A"}"`,
      `"${p.feeType || p.type || "N/A"}"`,
      `"${p.amountFormatted || `$${p.amount}`}"`,
      `"${p.date || (p.paymentDate ? p.paymentDate.split("T")[0] : "N/A")}"`,
      `"${p.status || "N/A"}"`,
      `"${p.paymentMethod || "N/A"}"`,
      `"${p.transactionId || "N/A"}"`,
      `"${(p.notes || "").replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `academy_fees_payments_${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("Payments exported successfully");
  };

  // Copy transaction ID to clipboard
  const handleCopyTransaction = (text: string) => {
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    toast.success("Transaction ID copied to clipboard");
    setTimeout(() => setIsCopied(false), 2000);
  };

  // Status Badge Renderer
  const renderStatusBadge = (status?: string) => {
    const s = (status || "").toUpperCase();
    if (s === "PAID") {
      return (
        <span className="px-3.5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-[#4ADE80]/15 text-[#4ADE80] border border-[#4ADE80]/30 inline-flex items-center gap-1.5">
          <span className="size-1.5 rounded-full bg-[#4ADE80]" />
          Paid
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
      <span className="px-3.5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-[#EF4444]/15 text-[#EF4444] border border-[#EF4444]/30 inline-flex items-center gap-1.5">
        <span className="size-1.5 rounded-full bg-[#EF4444]" />
        Unpaid
      </span>
    );
  };

  return (
    <div className="flex flex-col gap-6 md:gap-8 w-full max-w-full overflow-x-hidden pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl md:text-4xl font-black uppercase text-white font-orbitron tracking-tight leading-none wrap-break-word">
              Fees &amp; Payments
            </h1>
            <span className="size-2.5 rounded-full bg-[#E31B23] animate-pulse" />
          </div>
          <p className="text-white/60 font-bold uppercase tracking-widest text-[9px] md:text-[11px] mt-2">
            Track and manage fee payments
          </p>
        </div>

        <button
          onClick={() => refetch()}
          title="Refresh payment records"
          className="h-11 px-4 rounded-xl bg-white/5 border border-white/15 text-white/70 hover:text-white hover:bg-white/10 transition-all flex items-center justify-center gap-2 cursor-pointer font-bold shrink-0"
        >
          <IconRefresh size={18} className={isFetching ? "animate-spin text-[#E31B23]" : ""} />
          <span className="text-xs uppercase tracking-wider hidden sm:inline">Refresh</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Total Collected */}
        <div className="bg-[#111111] rounded-3xl md:rounded-4xl border border-white/15 p-6 md:p-8 flex items-center gap-4 md:gap-6 shadow-xl hover:border-white/25 transition-all">
          <div className="size-12 md:size-14 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 shrink-0">
            <IconCurrencyDollar size={28} className="text-[#E31B23] md:size-8" />
          </div>
          <div className="min-w-0">
            <p className="text-[9px] md:text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1 truncate">
              Total Collected
            </p>
            <p className="text-2xl md:text-3xl font-black text-white font-orbitron truncate">
              {isLoading
                ? "..."
                : stats?.totalCollectedFormatted ||
                  (stats?.currency || "$") + (stats?.totalCollected?.toFixed(2) ?? "0.00")}
            </p>
          </div>
        </div>

        {/* Pending */}
        <div className="bg-[#111111] rounded-3xl md:rounded-4xl border border-white/15 p-6 md:p-8 flex items-center gap-4 md:gap-6 shadow-xl hover:border-white/25 transition-all">
          <div className="size-12 md:size-14 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 shrink-0">
            <IconClock size={28} className="text-[#FBBF24] md:size-8" />
          </div>
          <div className="min-w-0">
            <p className="text-[9px] md:text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1 truncate">
              Pending
            </p>
            <p className="text-2xl md:text-3xl font-black text-white font-orbitron truncate">
              {isLoading
                ? "..."
                : stats?.pendingFormatted ||
                  (stats?.currency || "$") + (stats?.pending?.toFixed(2) ?? "0.00")}
            </p>
          </div>
        </div>

        {/* This Month */}
        <div className="bg-[#111111] rounded-3xl md:rounded-4xl border border-white/15 p-6 md:p-8 flex items-center gap-4 md:gap-6 shadow-xl hover:border-white/25 transition-all sm:col-span-2 lg:col-span-1">
          <div className="size-12 md:size-14 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 shrink-0">
            <IconArrowUpRight size={28} className="text-[#4ADE80] md:size-8" />
          </div>
          <div className="min-w-0">
            <p className="text-[9px] md:text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1 truncate">
              This Month
            </p>
            <p className="text-2xl md:text-3xl font-black text-white font-orbitron truncate">
              {isLoading
                ? "..."
                : stats?.thisMonthFormatted ||
                  (stats?.currency || "$") + (stats?.thisMonth?.toFixed(2) ?? "0.00")}
            </p>
          </div>
        </div>
      </div>

      {/* Recent Payments Section */}
      <div className="bg-[#111111] rounded-3xl md:rounded-4xl border border-white/15 p-5 md:p-8 flex flex-col gap-6 shadow-2xl w-full">
        {/* Toolbar */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div className="flex items-center gap-3">
            <h2 className="text-lg md:text-xl font-black uppercase text-white font-orbitron">
              Recent Payments ({totalCount})
            </h2>
            {isFetching && (
              <span className="text-xs text-[#E31B23] font-bold flex items-center gap-1.5 animate-pulse">
                Updating...
              </span>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
            {/* Search Input */}
            <div className="relative min-w-0 flex-1 sm:w-64">
              <IconSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-white/40" />
              <input
                type="text"
                placeholder="Search player or fee type..."
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

            {/* Status Filter Dropdown */}
            <div className="relative shrink-0">
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                className="w-full sm:w-auto bg-white/5 border border-white/15 rounded-xl px-4 py-2 pr-9 text-xs font-bold text-white uppercase tracking-wider focus:outline-none focus:border-white/30 cursor-pointer appearance-none"
              >
                <option value="ALL" className="bg-[#111111] text-white">
                  All Status
                </option>
                <option value="PAID" className="bg-[#111111] text-white">
                  Paid
                </option>
                <option value="PENDING" className="bg-[#111111] text-white">
                  Pending
                </option>
                <option value="UNPAID" className="bg-[#111111] text-white">
                  Unpaid
                </option>
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

        {/* Payments Table */}
        <div className="rounded-2xl border border-white/15 overflow-x-auto w-full custom-scrollbar">
          <table className="w-full min-w-175 text-left border-collapse">
            <thead>
              <tr className="border-b border-white/15 bg-white/2">
                <th className="py-5 px-6 text-[11px] font-black uppercase tracking-widest text-white/80 border-r border-white/15">
                  Player
                </th>
                <th className="py-5 px-6 text-[11px] font-black uppercase tracking-widest text-white/80 border-r border-white/15 text-center">
                  Type
                </th>
                <th className="py-5 px-6 text-[11px] font-black uppercase tracking-widest text-white/80 border-r border-white/15 text-center">
                  Amount
                </th>
                <th className="py-5 px-6 text-[11px] font-black uppercase tracking-widest text-white/80 border-r border-white/15 text-center">
                  Date
                </th>
                <th className="py-5 px-6 text-[11px] font-black uppercase tracking-widest text-white/80 text-center border-r border-white/15">
                  Status
                </th>
                <th className="py-5 px-6 text-[11px] font-black uppercase tracking-widest text-white/80 text-center">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 4 }).map((_, idx) => (
                  <tr key={`skel-row-${idx}`} className="border-b border-white/10 animate-pulse">
                    <td className="py-5 px-6 border-r border-white/10">
                      <div className="flex items-center gap-3">
                        <div className="size-10 rounded-full bg-white/10 shrink-0 shimmer" />
                        <div className="flex flex-col gap-1.5">
                          <div className="h-4 w-28 bg-white/10 rounded shimmer" />
                          <div className="h-3 w-16 bg-white/5 rounded shimmer" />
                        </div>
                      </div>
                    </td>
                    <td className="py-5 px-6 border-r border-white/10 text-center">
                      <div className="h-4 w-24 bg-white/10 rounded mx-auto shimmer" />
                    </td>
                    <td className="py-5 px-6 border-r border-white/10 text-center">
                      <div className="h-4 w-16 bg-white/10 rounded mx-auto shimmer" />
                    </td>
                    <td className="py-5 px-6 border-r border-white/10 text-center">
                      <div className="h-4 w-20 bg-white/10 rounded mx-auto shimmer" />
                    </td>
                    <td className="py-5 px-6 border-r border-white/10 text-center">
                      <div className="h-6 w-16 bg-white/10 rounded-full mx-auto shimmer" />
                    </td>
                    <td className="py-5 px-6 text-center">
                      <div className="size-8 bg-white/10 rounded-lg mx-auto shimmer" />
                    </td>
                  </tr>
                ))
              ) : filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="size-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40">
                        <IconReceipt size={24} />
                      </div>
                      <p className="text-sm font-bold text-white">No payment records found</p>
                      <p className="text-xs text-white/50 max-w-sm">
                        {searchTerm || statusFilter !== "ALL"
                          ? "Try adjusting your search query or status filter to see payments."
                          : "No fee payments have been logged yet."}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredPayments.map((payment, index) => {
                  const playerName =
                    payment.player?.name || "Player";
                  const playerAvatar =
                    payment.player?.avatar || "/placeholder_img.jpg";
                  const playerPos = payment.player?.position;

                  return (
                    <tr
                      key={payment._id || payment.id || index}
                      className={cn(
                        "hover:bg-white/2 transition-colors group",
                        index !== filteredPayments.length - 1 && "border-b border-white/15"
                      )}
                    >
                      {/* Player */}
                      <td className="py-5 px-6 border-r border-white/15">
                        <div className="flex items-center gap-3">
                          <div className="size-10 rounded-full overflow-hidden border border-white/15 shrink-0 bg-[#1A1A1A] relative">
                            <Image
                              src={playerAvatar}
                              alt={playerName}
                              width={40}
                              height={40}
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
                            <span className="text-sm font-bold text-white truncate">
                              {playerName}
                            </span>
                            <div className="flex items-center gap-1.5 text-[10px] text-white/50">
                              {playerPos && (
                                <span className="font-bold text-[#00FF62] uppercase tracking-wider">
                                  {playerPos}
                                </span>
                              )}
                              {payment.player?.currentClub && (
                                <>
                                  <span>•</span>
                                  <span className="truncate">{payment.player.currentClub}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Type */}
                      <td className="py-5 px-6 border-r border-white/15 text-sm font-medium text-white/70 text-center">
                        {payment.feeType || payment.type || "General Fee"}
                      </td>

                      {/* Amount */}
                      <td className="py-5 px-6 border-r border-white/15 text-sm font-black text-white text-center font-orbitron">
                        {payment.amountFormatted || `$${payment.amount?.toFixed(2)}`}
                      </td>

                      {/* Date */}
                      <td className="py-5 px-6 border-r border-white/15 text-sm font-medium text-white/60 text-center whitespace-nowrap">
                        {payment.date ||
                          (payment.paymentDate ? payment.paymentDate.split("T")[0] : "—")}
                      </td>

                      {/* Status */}
                      <td className="py-5 px-6 border-r border-white/15 text-center">
                        {renderStatusBadge(payment.status)}
                      </td>

                      {/* Action */}
                      <td className="py-5 px-6 text-center">
                        <button
                          onClick={() => setSelectedPayment(payment)}
                          className="size-8.5 inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/5 text-white/70 hover:text-white hover:border-white/30 hover:bg-white/10 transition-all cursor-pointer active:scale-95 shadow-sm"
                          title="View Payment Details"
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

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-white/10">
            <span className="text-xs font-bold text-white/50 uppercase tracking-wider">
              Showing Page {page} of {totalPages} ({totalCount} total records)
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

      {/* Payment Details Modal */}
      <DashboardModal
        isOpen={Boolean(selectedPayment)}
        onClose={() => setSelectedPayment(null)}
        title="Payment Receipt Details"
        subtitle={`Transaction Record #${selectedPayment?._id || selectedPayment?.id || ""}`}
        maxWidth="max-w-xl"
        footer={
          <div className="flex justify-end w-full">
            <button
              onClick={() => setSelectedPayment(null)}
              className="px-6 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-xs font-bold text-white uppercase tracking-wider transition-all cursor-pointer"
            >
              Close
            </button>
          </div>
        }
      >
        {selectedPayment && (
          <div className="flex flex-col gap-5 py-2">
            {/* Player Info Card */}
            <div className="p-4 rounded-2xl bg-[#161a18] border border-white/15 flex items-center gap-4">
              <div className="size-14 rounded-full overflow-hidden border border-white/20 shrink-0 bg-[#111111] relative">
                <Image
                  src={selectedPayment.player?.avatar || "/placeholder_img.jpg"}
                  alt={selectedPayment.player?.name || "Player"}
                  width={56}
                  height={56}
                  unoptimized
                  className="size-full object-cover"
                />
              </div>
              <div className="flex flex-col min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-base font-black text-white uppercase truncate">
                    {selectedPayment.player?.name || "Athlete"}
                  </h3>
                  {renderStatusBadge(selectedPayment.status)}
                </div>
                <div className="flex items-center gap-2 text-xs text-white/60 mt-1 flex-wrap">
                  {selectedPayment.player?.position && (
                    <span className="font-bold text-[#00FF62]">
                      {selectedPayment.player.position}
                    </span>
                  )}
                  {selectedPayment.player?.currentClub && (
                    <>
                      <span>•</span>
                      <span className="truncate">{selectedPayment.player.currentClub}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Amount Banner */}
            <div className="p-5 rounded-2xl bg-[#111111] border border-white/15 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-white/50 uppercase tracking-widest">
                  Amount Paid
                </span>
                <p className="text-2xl sm:text-3xl font-black text-white font-orbitron mt-0.5">
                  {selectedPayment.amountFormatted || `$${selectedPayment.amount?.toFixed(2)}`}
                </p>
              </div>
              <div className="px-3.5 py-1.5 rounded-xl bg-white/5 border border-white/15 text-xs font-bold text-white flex items-center gap-1.5">
                <IconCreditCard size={16} className="text-[#00FF62]" />
                <span className="uppercase">{selectedPayment.paymentMethod || "STRIPE"}</span>
              </div>
            </div>

            {/* Payment Meta Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="p-3.5 rounded-xl bg-white/5 border border-white/10">
                <span className="text-[10px] font-bold uppercase tracking-wider text-white/40">
                  Fee Type
                </span>
                <p className="text-xs font-bold text-white mt-1">
                  {selectedPayment.feeType || selectedPayment.type || "General Fee"}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-white/5 border border-white/10">
                <span className="text-[10px] font-bold uppercase tracking-wider text-white/40">
                  Payment Date
                </span>
                <p className="text-xs font-bold text-white mt-1">
                  {selectedPayment.date ||
                    (selectedPayment.paymentDate
                      ? selectedPayment.paymentDate.split("T")[0]
                      : "—")}
                </p>
              </div>
            </div>

            {/* Transaction ID with Copy Button */}
            {selectedPayment.transactionId && (
              <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-white/40">
                    Transaction ID
                  </span>
                  <button
                    onClick={() => handleCopyTransaction(selectedPayment.transactionId!)}
                    className="text-[10px] font-bold text-[#00FF62] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    {isCopied ? <IconCheck size={12} /> : <IconCopy size={12} />}
                    <span>{isCopied ? "Copied" : "Copy ID"}</span>
                  </button>
                </div>
                <p className="text-xs font-mono text-white/80 break-all select-all">
                  {selectedPayment.transactionId}
                </p>
              </div>
            )}

            {/* Notes */}
            {selectedPayment.notes && (
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex flex-col gap-1.5">
                <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-white/40">
                  <IconFileText size={14} />
                  <span>Notes / Description</span>
                </div>
                <p className="text-xs text-white/90 leading-relaxed">
                  {selectedPayment.notes}
                </p>
              </div>
            )}
          </div>
        )}
      </DashboardModal>
    </div>
  );
};

export default FeesPayments;
