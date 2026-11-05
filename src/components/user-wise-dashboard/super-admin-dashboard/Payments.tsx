/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState, useMemo } from "react";
import {
  IconCurrencyDollar,
  IconCreditCard,
  IconFileText,
  IconReportAnalytics,
  IconEye,
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
  IconSearch,
  IconReceipt2,
  IconUser,
} from "@tabler/icons-react";
import { RefreshCw } from "lucide-react";
import DashboardTable, { Column } from "@/components/dashboard/DashboardTable";
import TableSkeleton, { StatCardSkeleton } from "@/components/dashboard/TableSkeleton";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useGetAdminPaymentsQuery } from "@/redux/features/admin/adminApi";
import { IAdminPaymentItem } from "@/types/admin.type";
import { cn } from "@/lib/utils";

const SummaryStatCard = ({
  icon: Icon,
  value,
  label,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  value: string | number;
  label: string;
}) => (
  <div className="bg-[#111111] border border-white/20 rounded-2xl sm:rounded-3xl p-4 sm:p-6 flex flex-col gap-3 sm:gap-4 flex-1 min-w-0 overflow-hidden shadow-lg">
    <div className="size-8 sm:size-10 rounded-lg sm:rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/60 shrink-0">
      <Icon size={18} className="sm:size-5" />
    </div>
    <div className="min-w-0">
      <p className="text-white text-xl sm:text-3xl font-black font-orbitron truncate">
        {value}
      </p>
      <p className="text-white/40 text-[9px] sm:text-[11px] font-bold uppercase tracking-wider truncate mt-0.5 sm:mt-1">
        {label}
      </p>
    </div>
  </div>
);

const StatusBadge = ({ status }: { status: string }) => {
  const s = (status || "").toUpperCase();
  const isCompleted = s === "COMPLETED" || s === "PAID" || s === "ACTIVE";
  const isPending = s === "PENDING" || s === "UNPAID";
  const isFailed = s === "FAILED" || s === "REJECTED";

  return (
    <span
      className={cn(
        "px-3 sm:px-4 py-1 rounded-full text-[9px] sm:text-[10px] font-black uppercase border whitespace-nowrap shrink-0",
        isCompleted && "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
        isPending && "bg-amber-500/10 text-amber-400 border-amber-500/20",
        isFailed && "bg-red-500/10 text-red-400 border-red-500/20",
        !isCompleted && !isPending && !isFailed && "bg-white/5 text-white/40 border-white/10"
      )}
    >
      {status || "UNKNOWN"}
    </span>
  );
};

const TYPE_FILTER_OPTIONS = [
  { label: "All Types", value: "ALL" },
  { label: "Subscription", value: "SUBSCRIPTION" },
  { label: "Game Report", value: "GAME_REPORT" },
  { label: "Tournament", value: "TOURNAMENT" },
  { label: "Event", value: "EVENT" },
  { label: "Shop", value: "SHOP" },
];

const STATUS_FILTER_OPTIONS = [
  { label: "All Status", value: "ALL" },
  { label: "Completed", value: "COMPLETED" },
  { label: "Pending", value: "PENDING" },
  { label: "Failed", value: "FAILED" },
  { label: "Refunded", value: "REFUNDED" },
];

const formatCurrency = (val: number | undefined | null) => {
  const num = Number(val || 0);
  return `$ ${num.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const getPageNumbers = (current: number, total: number) => {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  const pages: (number | string)[] = [];
  if (current <= 4) {
    for (let i = 1; i <= 5; i++) pages.push(i);
    pages.push("...");
    pages.push(total);
  } else if (current >= total - 3) {
    pages.push(1);
    pages.push("...");
    for (let i = total - 4; i <= total; i++) pages.push(i);
  } else {
    pages.push(1);
    pages.push("...");
    pages.push(current - 1);
    pages.push(current);
    pages.push(current + 1);
    pages.push("...");
    pages.push(total);
  }
  return pages;
};

const SuperAdminPayments = () => {
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(20);
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedPayment, setSelectedPayment] = useState<IAdminPaymentItem | null>(null);

  const {
    data: paymentsRes,
    isLoading,
    isError,
    refetch,
  } = useGetAdminPaymentsQuery({
    page,
    limit,
    category: categoryFilter !== "ALL" ? categoryFilter : undefined,
    status: statusFilter !== "ALL" ? statusFilter : undefined,
    search: searchQuery.trim() || undefined,
  });

  const payments = useMemo(() => paymentsRes?.data || [], [paymentsRes]);
  const meta = paymentsRes?.meta;
  const summary = meta?.summary;
  const totalPages = meta?.totalPages || 1;
  const total = meta?.total ?? payments.length;

  const handleCategoryChange = (val: string) => {
    setCategoryFilter(val);
    setPage(1);
  };

  const handleStatusChange = (val: string) => {
    setStatusFilter(val);
    setPage(1);
  };

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setPage(1);
  };

  // Client-side fallback filter
  const filteredPayments = useMemo(() => {
    return payments.filter((item) => {
      if (categoryFilter !== "ALL") {
        const cat = (item.category || item.type || "").toUpperCase();
        if (!cat.includes(categoryFilter.toUpperCase())) return false;
      }
      if (statusFilter !== "ALL") {
        const st = (item.status || "").toUpperCase();
        if (statusFilter === "COMPLETED" && !(st === "COMPLETED" || st === "PAID" || st === "ACTIVE")) {
          return false;
        }
        if (statusFilter === "PENDING" && !(st === "PENDING" || st === "UNPAID")) {
          return false;
        }
        if (statusFilter === "FAILED" && !(st === "FAILED" || st === "REJECTED")) {
          return false;
        }
        if (statusFilter === "REFUNDED" && !(st === "REFUNDED" || st === "CANCELLED")) {
          return false;
        }
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesId = item.paymentId?.toLowerCase().includes(q);
        const matchesUser = item.userOrEntity?.toLowerCase().includes(q);
        const matchesType = item.type?.toLowerCase().includes(q);
        const matchesNotes = item.notes?.toLowerCase().includes(q);
        if (!matchesId && !matchesUser && !matchesType && !matchesNotes) {
          return false;
        }
      }
      return true;
    });
  }, [payments, categoryFilter, statusFilter, searchQuery]);

  const columns: Column<IAdminPaymentItem>[] = [
    {
      header: "Payment ID",
      key: "paymentId",
      align: "center",
      cellClassName: "text-white/80 text-xs sm:text-sm font-black font-orbitron whitespace-nowrap",
      render: (row) => <span>{row.paymentId || "—"}</span>,
    },
    {
      header: "Type",
      key: "type",
      align: "center",
      render: (row) => (
        <div className="flex flex-col items-center">
          <span className="text-white text-xs sm:text-sm font-bold tracking-tight">
            {row.type || row.category || "—"}
          </span>
          {row.subType && (
            <span className="text-[10px] text-white/40 uppercase font-medium max-w-44 truncate">
              {row.subType}
            </span>
          )}
        </div>
      ),
    },
    {
      header: "User/Entity",
      key: "userOrEntity",
      render: (row) => {
        const avatar = row.entity?.avatar;
        const name = row.userOrEntity || row.entity?.name || "Unnamed";
        const role = row.entity?.role;
        const initial = name.charAt(0).toUpperCase();

        return (
          <div className="flex items-center gap-3">
            <div className="size-8 sm:size-9 rounded-full bg-white/10 overflow-hidden border border-white/20 shrink-0 flex items-center justify-center">
              {avatar ? (
                <img
                  src={avatar}
                  alt={name}
                  className="size-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "/placeholder_img.jpg";
                  }}
                />
              ) : (
                <span className="text-white/60 font-black text-xs">{initial}</span>
              )}
            </div>
            <div className="min-w-0">
              <p className="text-white text-xs sm:text-sm font-bold truncate max-w-40 sm:max-w-56">
                {name}
              </p>
              {role && (
                <p className="text-red-500 text-[10px] font-bold uppercase tracking-wider truncate">
                  {role}
                </p>
              )}
            </div>
          </div>
        );
      },
    },
    {
      header: "Amount",
      key: "amount",
      align: "center",
      cellClassName: "text-emerald-400 text-xs sm:text-sm font-black font-orbitron whitespace-nowrap",
      render: (row) => (
        <span>
          $ {Number(row.amount || 0).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </span>
      ),
    },
    {
      header: "Spend",
      key: "spend",
      align: "center",
      cellClassName: "text-red-400 text-xs sm:text-sm font-black font-orbitron whitespace-nowrap",
      render: (row) => (
        <span>
          $ {Number(row.spend || 0).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </span>
      ),
    },
    {
      header: "Date",
      key: "date",
      align: "center",
      cellClassName: "text-white/60 text-xs sm:text-sm font-medium whitespace-nowrap",
      render: (row) => (
        <span>{row.date || (row.createdAt ? row.createdAt.split("T")[0] : "—")}</span>
      ),
    },
    {
      header: "Status",
      key: "status",
      align: "center",
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      header: "Actions",
      key: "actions",
      align: "center",
      render: (row) => (
        <div className="flex items-center justify-center">
          <button
            type="button"
            onClick={() => setSelectedPayment(row)}
            className="size-9 inline-flex items-center justify-center rounded-xl border border-white/20 bg-white/5 text-white/70 hover:text-white hover:border-white/40 hover:bg-white/10 transition-all hover:scale-105 cursor-pointer"
            title="View Payment Details"
          >
            <IconEye size={18} stroke={2} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6 sm:gap-8 p-4 sm:p-6 lg:p-8 pb-10 w-full min-w-0 overflow-hidden text-white">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shrink-0 w-full min-w-0">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl sm:text-5xl font-black text-white font-orbitron tracking-tight truncate">
              Payments
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-white/5 border border-white/10 text-white/60">
              {total} Total
            </span>
          </div>
          <p className="text-white/60 font-medium mt-1 sm:mt-2 text-sm sm:text-lg truncate">
            Platform revenue
          </p>
        </div>

        <button
          type="button"
          onClick={() => refetch()}
          className="size-9 rounded-xl border border-white/10 bg-black/40 flex items-center justify-center text-white/60 hover:text-white transition-colors cursor-pointer shrink-0 self-start sm:self-auto"
          title="Refresh Payments"
        >
          <RefreshCw className={cn("size-3.5", isLoading && "animate-spin")} />
        </button>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 w-full min-w-0">
        {isLoading ? (
          <>
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </>
        ) : (
          <>
            <SummaryStatCard
              icon={IconCurrencyDollar}
              value={formatCurrency(summary?.totalRevenue)}
              label="Total Revenue"
            />
            <SummaryStatCard
              icon={IconCreditCard}
              value={formatCurrency(summary?.subscription)}
              label="Subscription"
            />
            <SummaryStatCard
              icon={IconFileText}
              value={formatCurrency(summary?.gameReports)}
              label="Game Reports"
            />
            <SummaryStatCard
              icon={IconReportAnalytics}
              value={formatCurrency(summary?.totalSpend)}
              label="Total Spend"
            />
          </>
        )}
      </div>

      {/* Main Container */}
      <div className="bg-[#111111] border border-white/20 rounded-3xl sm:rounded-[40px] p-4 sm:p-6 md:p-10 flex flex-col gap-5 sm:gap-8 min-w-0 overflow-hidden w-full">
        {/* Filters */}
        <div className="flex flex-wrap sm:flex-nowrap sm:justify-between items-center gap-3 w-full">
          {/* Search Box */}
          <div className="relative flex-1 min-w-48 max-w-xs">
            <IconSearch
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none"
            />
            <input
              type="text"
              placeholder="Search ID, user, notes..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              className="w-full bg-black/40 border border-white/20 h-9 sm:h-10 rounded-xl pl-9 pr-3 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-white/40 transition-colors"
            />
          </div>

          <div className="flex flex-wrap sm:flex-nowrap gap-2 sm:gap-3 shrink-0">
            {/* Category / Type Filter */}
            <div className="relative shrink-0">
              <select
                value={categoryFilter}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="appearance-none bg-black/40 border border-white/20 h-9 sm:h-10 rounded-xl text-white/60 text-[9px] sm:text-[10px] font-black uppercase tracking-wider px-3 sm:px-4 pr-8 sm:pr-10 focus:outline-none focus:border-white/40 transition-colors cursor-pointer"
              >
                {TYPE_FILTER_OPTIONS.map((opt) => (
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

            {/* Status Filter */}
            <div className="relative shrink-0">
              <select
                value={statusFilter}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="appearance-none bg-black/40 border border-white/20 h-9 sm:h-10 rounded-xl text-white/60 text-[9px] sm:text-[10px] font-black uppercase tracking-wider px-3 sm:px-4 pr-8 sm:pr-10 focus:outline-none focus:border-white/40 transition-colors cursor-pointer"
              >
                {STATUS_FILTER_OPTIONS.map((opt) => (
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
        </div>

        {/* Table Content */}
        <div className="w-full overflow-x-auto no-scrollbar">
          {isLoading ? (
            <TableSkeleton
              rowCount={limit || 10}
              headers={[
                "PAYMENT ID",
                "TYPE",
                "USER/ENTITY",
                "AMOUNT",
                "SPEND",
                "DATE",
                "STATUS",
                "ACTIONS",
              ]}
              hasAvatar={true}
              actionButtonsCount={1}
            />
          ) : isError ? (
            <div className="py-12 flex flex-col items-center justify-center gap-3 text-center">
              <p className="text-destructive text-sm font-semibold">
                Failed to load payments data.
              </p>
              <Button
                onClick={() => refetch()}
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10 text-xs rounded-xl"
              >
                <RefreshCw className="size-3.5 mr-1.5" /> Try Again
              </Button>
            </div>
          ) : filteredPayments.length === 0 ? (
            <div className="py-16 flex flex-col items-center justify-center gap-2 text-center">
              <p className="text-white/60 text-sm font-bold">No payments found.</p>
              <p className="text-white/30 text-xs">
                No payment transactions match the selected filter.
              </p>
            </div>
          ) : (
            <DashboardTable columns={columns} data={filteredPayments} />
          )}
        </div>

        {/* Pagination */}
        {!isLoading && totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-white/10 text-xs text-white/60">
            {/* Page info & Limit selector */}
            <div className="flex items-center gap-3">
              <span>
                Showing {(page - 1) * limit + 1}–{Math.min(page * limit, total)} of {total}
              </span>
              <div className="flex items-center gap-1.5">
                <span className="text-white/40">Per page:</span>
                <select
                  value={limit}
                  onChange={(e) => handleLimitChange(Number(e.target.value))}
                  className="bg-black/40 border border-white/20 rounded-lg px-2 py-1 text-white text-xs focus:outline-none focus:border-white/40 cursor-pointer"
                >
                  <option value={10} className="bg-[#111111]">10</option>
                  <option value={20} className="bg-[#111111]">20</option>
                  <option value={50} className="bg-[#111111]">50</option>
                  <option value={100} className="bg-[#111111]">100</option>
                </select>
              </div>
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="h-8 px-2.5 bg-black/40 border-white/20 text-white disabled:opacity-30 disabled:pointer-events-none hover:bg-white/10 rounded-lg"
              >
                <IconChevronLeft size={14} className="mr-1" /> Prev
              </Button>

              <div className="flex items-center gap-1">
                {getPageNumbers(page, totalPages).map((p, idx) =>
                  p === "..." ? (
                    <span key={`dots-${idx}`} className="px-2 text-white/30 font-bold">
                      ...
                    </span>
                  ) : (
                    <button
                      key={`page-${p}`}
                      type="button"
                      onClick={() => setPage(Number(p))}
                      className={cn(
                        "size-8 rounded-lg text-xs font-bold transition-all cursor-pointer",
                        page === p
                          ? "bg-primary text-white font-black shadow-md shadow-primary/30"
                          : "text-white/60 hover:text-white hover:bg-white/5 border border-white/10"
                      )}
                    >
                      {p}
                    </button>
                  )
                )}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="h-8 px-2.5 bg-black/40 border-white/20 text-white disabled:opacity-30 disabled:pointer-events-none hover:bg-white/10 rounded-lg"
              >
                Next <IconChevronRight size={14} className="ml-1" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Payment Details Dialog */}
      <Dialog open={!!selectedPayment} onOpenChange={(open) => !open && setSelectedPayment(null)}>
        <DialogContent className="max-w-lg bg-[#111111] border border-white/20 text-white p-6 sm:p-8 rounded-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/60 shrink-0">
                  <IconReceipt2 size={20} />
                </div>
                <div>
                  <DialogTitle className="text-lg font-black font-orbitron tracking-tight text-white">
                    {selectedPayment?.paymentId || "Payment Details"}
                  </DialogTitle>
                  <p className="text-[10px] text-white/40 uppercase font-bold tracking-wider mt-0.5">
                    Transaction Record
                  </p>
                </div>
              </div>
              {selectedPayment && <StatusBadge status={selectedPayment.status} />}
            </div>
          </DialogHeader>

          {selectedPayment && (
            <div className="flex flex-col gap-5 pt-2">
              {/* Entity Profile Box */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-3">
                <div className="size-12 rounded-full bg-white/10 overflow-hidden border border-white/20 shrink-0 flex items-center justify-center">
                  {selectedPayment.entity?.avatar ? (
                    <img
                      src={selectedPayment.entity.avatar}
                      alt={selectedPayment.userOrEntity}
                      className="size-full object-cover"
                    />
                  ) : (
                    <IconUser className="size-6 text-white/40" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-white text-sm font-black uppercase truncate">
                    {selectedPayment.userOrEntity || selectedPayment.entity?.name || "Unnamed"}
                  </p>
                  {selectedPayment.entity?.email && (
                    <p className="text-white/40 text-xs lowercase truncate">
                      {selectedPayment.entity.email}
                    </p>
                  )}
                  {selectedPayment.entity?.role && (
                    <span className="inline-block mt-1 text-[9px] font-black uppercase tracking-wider text-red-400">
                      Role: {selectedPayment.entity.role}
                    </span>
                  )}
                </div>
              </div>

              {/* Financial Summary Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-2xl bg-emerald-500/5 border border-emerald-500/20">
                  <p className="text-[10px] uppercase font-bold text-white/40">Amount</p>
                  <p className="text-xl font-black font-orbitron text-emerald-400 mt-1">
                    $ {Number(selectedPayment.amount || 0).toFixed(2)}
                  </p>
                </div>
                <div className="p-3.5 rounded-2xl bg-red-500/5 border border-red-500/20">
                  <p className="text-[10px] uppercase font-bold text-white/40">Spend</p>
                  <p className="text-xl font-black font-orbitron text-red-400 mt-1">
                    $ {Number(selectedPayment.spend || 0).toFixed(2)}
                  </p>
                </div>
              </div>

              {/* Admin Net Earnings & Commission */}
              {(selectedPayment.adminEarnings !== undefined ||
                selectedPayment.commissionPaid !== undefined) && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                    <p className="text-[9px] uppercase font-bold text-white/40">
                      Net Admin Earnings
                    </p>
                    <p className="text-sm font-black font-orbitron text-white mt-0.5">
                      $ {Number(selectedPayment.adminEarnings ?? 0).toFixed(2)}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                    <p className="text-[9px] uppercase font-bold text-white/40">Commission Paid</p>
                    <p className="text-sm font-black font-orbitron text-white mt-0.5">
                      $ {Number(selectedPayment.commissionPaid ?? 0).toFixed(2)}
                      {selectedPayment.commissionRecipient && (
                        <span className="text-[10px] font-normal text-white/40 block truncate">
                          To: {selectedPayment.commissionRecipient}
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              )}

              {/* Details List */}
              <div className="flex flex-col gap-2.5 text-xs">
                <div className="flex items-center justify-between py-2 border-b border-white/5">
                  <span className="text-white/40">Type & Subtype:</span>
                  <span className="text-white font-bold text-right">
                    {selectedPayment.type}
                    {selectedPayment.subType ? ` (${selectedPayment.subType})` : ""}
                  </span>
                </div>

                <div className="flex items-center justify-between py-2 border-b border-white/5">
                  <span className="text-white/40">Payment Method:</span>
                  <span className="text-white font-bold">
                    {selectedPayment.paymentMethod || "STRIPE"}
                  </span>
                </div>

                {selectedPayment.transactionId && (
                  <div className="flex items-center justify-between py-2 border-b border-white/5">
                    <span className="text-white/40">Transaction ID:</span>
                    <span className="text-white font-mono text-[11px] truncate max-w-56 text-right">
                      {selectedPayment.transactionId}
                    </span>
                  </div>
                )}

                {selectedPayment.sourceModel && (
                  <div className="flex items-center justify-between py-2 border-b border-white/5">
                    <span className="text-white/40">Source Model:</span>
                    <span className="text-white/80 font-mono text-[11px]">
                      {selectedPayment.sourceModel}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between py-2 border-b border-white/5">
                  <span className="text-white/40">Date:</span>
                  <span className="text-white font-medium">
                    {selectedPayment.date || selectedPayment.createdAt?.split("T")[0] || "—"}
                  </span>
                </div>

                {selectedPayment.notes && (
                  <div className="flex flex-col gap-1 py-2">
                    <span className="text-white/40">Notes / Description:</span>
                    <p className="text-white/80 bg-white/5 border border-white/10 rounded-xl p-3 text-xs leading-relaxed">
                      {selectedPayment.notes}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SuperAdminPayments;
