"use client";

import React, { useCallback, useState } from "react";
import GameReportPdfDownloader from "./GameReportPdfDownloader";
import Link from "next/link";
import {
  IconFileText,
  IconStar,
  IconCircleCheck,
  IconCircleX,
  IconClock,
  IconEye,
  IconDownload,
  IconReportAnalytics,
  IconLoader2,
  IconUser,
  IconUserCheck,
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
  IconLock,
} from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { useGetMySubscriptionQuery } from "@/redux/features/subscription/subscriptionApi";
import { toast } from "sonner";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  useGetMyGameReportsQuery,
  useGetMyGameReportByIdQuery,
} from "@/redux/features/player/playerApi";
import { IGameReportDetail, IGameReportItem } from "@/types/player.type";
import { WarningToast } from "@/helpers/ValidationHelper";

const NA = "N/A";

/** First non-empty value, or "N/A". */
const pickText = (...vals: unknown[]): string => {
  for (const v of vals) {
    if (v !== undefined && v !== null && String(v).trim() !== "") return String(v).trim();
  }
  return NA;
};

const formatDate = (raw?: string | null): string => {
  if (!raw) return NA;
  const d = new Date(raw);
  if (isNaN(d.getTime())) return raw;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

const yesNo = (v: unknown): string => (v === true ? "Yes" : v === false ? "No" : NA);

/** Ratings may be stored on a 10 or 100 scale — display on a 10 scale. */
const toTenScale = (raw: unknown): number | null => {
  const n = Number(raw);
  if (raw === undefined || raw === null || isNaN(n)) return null;
  return n > 10 ? n / 10 : n;
};

/**
 * Who evaluated the report, from `evaluatedBy` (→ `reportCompletionType` → `evaluator.type`).
 * Any coach variant (COACH, EXTERNAL_COACH, …) counts as a coach evaluation.
 */
const evaluatorTypeView = (...raws: Array<string | null | undefined>) => {
  const raw = raws.map((v) => String(v ?? "").trim()).find(Boolean) || "";
  const value = raw.toUpperCase();
  return {
    isCoach: value.includes("COACH") || value.includes("SCOUT"),
    label: value ? value.replace(/_/g, " ") : NA,
  };
};

/** A report can be downloaded once it has been submitted (evaluation completed). */
const canDownloadReport = (r: IGameReportItem) => {
  const v = String(r.evaluationStatus ?? "").trim().toUpperCase();
  return v ? v === "COMPLETED" : true;
};

type StatusTone = "success" | "warning" | "danger" | "muted";

/** Payment status straight from `paymentStatus` (PAID / UNPAID / FREE). */
const paymentStatusView = (raw?: string | null): { label: string; tone: StatusTone } => {
  const v = String(raw ?? "").trim().toUpperCase();
  if (!v) return { label: "N/A", tone: "muted" };
  if (v === "PAID" || v === "FREE") return { label: v, tone: "success" };
  if (v === "FAILED" || v === "REFUNDED") return { label: v, tone: "danger" };
  return { label: v, tone: "warning" };
};

/** Submission status straight from `evaluationStatus` (COMPLETED / PENDING / UNREQUESTED…). */
const submissionStatusView = (raw?: string | null): { label: string; tone: StatusTone } => {
  const v = String(raw ?? "").trim().toUpperCase();
  if (!v) return { label: "N/A", tone: "muted" };
  if (v === "COMPLETED") return { label: "SUBMITTED", tone: "success" };
  if (v === "REJECTED" || v === "DECLINED" || v === "EXPIRED") return { label: v, tone: "danger" };
  if (v === "UNREQUESTED") return { label: "NOT SUBMITTED", tone: "muted" };
  return { label: v, tone: "warning" };
};

const STATUS_TONE_CLASS: Record<StatusTone, string> = {
  success: "text-green-500",
  warning: "text-orange-500",
  danger: "text-red-500",
  muted: "text-gray-400",
};

const StatusIndicator = ({ label, tone, compact }: { label: string; tone: StatusTone; compact?: boolean }) => {
  const Icon = tone === "success" ? IconCircleCheck : tone === "danger" ? IconCircleX : IconClock;
  return (
    <div
      className={cn(
        "flex items-center",
        compact ? "w-fit gap-1.5 rounded-md bg-white/5 px-2.5 py-1" : "gap-2",
        STATUS_TONE_CLASS[tone]
      )}
    >
      <Icon size={compact ? 14 : 16} className="shrink-0" />
      <span className={cn("font-bold uppercase tracking-wider", compact ? "text-[10px]" : "text-xs")}>{label}</span>
    </div>
  );
};

/**
 * Maps the GET /players/me/game-reports/:reportId response (`data`) to what the
 * detail drawer shows. Uses only fields the API returns; stats and the
 * shot / assist coordinates are intentionally not displayed here.
 */
const buildDetailView = (r: IGameReportDetail | IGameReportItem | null) => {
  if (!r) return null;
  const ev = r.evaluator || {};
  const metrics = r.performanceMetrics;
  const hasScore = typeof r.homeScore === "number" && typeof r.awayScore === "number";
  const evaluator = evaluatorTypeView(r.evaluatedBy, r.reportCompletionType, ev.type);
  const evaluatedBy = evaluator.label;
  const categoryRatings = (r as IGameReportDetail).categoryRatings;

  return {
    id: String(r._id || ""),
    title: pickText(r.title, r.report),
    subtitle: pickText(r.subtitle),
    rating: toTenScale(r.scoutRating ?? r.rating),
    position: pickText(r.position).toUpperCase(),
    isCoach: evaluator.isCoach,
    evaluatedBy,
    isVerified: r.isProfessionallyVerified === true,
    status: pickText(r.status).toUpperCase(),
    reportPdfUrl: r.reportPdfUrl || null,
    scoutAnalysis: pickText(r.scoutAnalysis),
    matchFields: [
      { label: "Position", value: pickText(r.position).toUpperCase() },
      { label: "Date", value: formatDate(r.date || r.approvalDate || null) },
      { label: "League", value: pickText(r.league).toUpperCase() },
      { label: "Score", value: hasScore ? `${r.homeScore} - ${r.awayScore}` : pickText(r.score) },
      { label: "Home Score", value: pickText(r.homeScore) },
      { label: "Away Score", value: pickText(r.awayScore) },
    ],
    evaluationFields: [
      { label: "Evaluated By", value: evaluatedBy },
      { label: "Completion Type", value: pickText(r.reportCompletionType).toUpperCase() },
      { label: "Evaluator Name", value: pickText(r.evaluatorName, ev.name) },
      { label: "Evaluator Role", value: pickText(r.evaluatorRole, ev.role).toUpperCase() },
      { label: "Evaluator Email", value: pickText(r.evaluatorEmail, ev.email) },
      { label: "Club / Organisation", value: pickText(ev.clubOrOrg) },
      { label: "Author Name", value: pickText(r.authorName) },
      { label: "Author Role", value: pickText(r.authorRole).toUpperCase() },
      { label: "Professionally Verified", value: yesNo(r.isProfessionallyVerified ?? ev.isProfessionallyVerified) },
      { label: "External Coach", value: yesNo(r.isExternalCoach ?? ev.isExternal) },
      { label: "Via Access Link", value: yesNo(r.evaluatedViaAccessLink ?? ev.evaluatedViaAccessLink) },
    ],
    metrics: [
      { label: "Goals", value: metrics?.goals },
      { label: "Assists", value: metrics?.assists },
      { label: "Passes", value: metrics?.passes },
    ].map((m) => ({ ...m, value: typeof m.value === "number" ? String(m.value) : NA })),
    categoryRatings: categoryRatings
      ? Object.entries(categoryRatings)
          .filter(([, v]) => typeof v === "number")
          .map(([label, v]) => ({ label, value: toTenScale(v) ?? 0 }))
      : [],
    paymentFields: [
      { label: "Status", value: pickText(r.status).toUpperCase() },
      { label: "Payment Status", value: pickText(r.paymentStatus).toUpperCase() },
    ],
    reportCode: pickText(r.reportId, r._id ? `#${String(r._id).slice(-6).toUpperCase()}` : ""),
  };
};

const GameReports = () => {
  const router = useRouter();
  const { data: subscriptionResponse } = useGetMySubscriptionQuery();
  const hasActiveSubscription = Boolean(subscriptionResponse?.data?.hasActiveSubscription);

  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);
  const [statusFilter, setStatusFilter] = useState<"All" | "Paid" | "Pending">("All");

  const { data: response, isLoading, isFetching } = useGetMyGameReportsQuery({
    page,
    limit,
    status: statusFilter !== "All" ? statusFilter : undefined,
  });
  const [selectedReport, setSelectedReport] = useState<IGameReportItem | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  // Full report from GET /players/me/game-reports/:reportId
  const {
    data: singleReportRes,
    isLoading: isDetailLoading,
    isFetching: isDetailFetching,
    isError: isDetailError,
    refetch: refetchDetail,
  } = useGetMyGameReportByIdQuery(selectedReport?._id || "", {
    skip: !selectedReport?._id || !isOpen,
  });
  const apiDetail: IGameReportDetail | null = singleReportRes?.data ?? null;
  // Until the detail request resolves, show what the list row already has.
  const detailReport: IGameReportDetail | IGameReportItem | null = apiDetail || selectedReport;
  const detail = buildDetailView(detailReport);

  const reports: IGameReportItem[] = response?.data?.reports || [];
  const meta = response?.data?.meta || response?.data?.pagination;
  const summary = response?.data?.summary;

  const totalReports = meta?.total ?? summary?.totalReports ?? reports.length;
  const totalPages = meta?.totalPages ?? Math.max(1, Math.ceil(totalReports / limit));
  const currentPage = meta?.page ?? page;

  const avgRating = summary?.averageRating !== undefined
    ? Number(summary.averageRating).toFixed(1)
    : "0.0";
  const completed = summary?.completed ?? reports.filter((r) => r.status?.toUpperCase() === "PAID").length;
  const pending = summary?.pending ?? reports.filter((r) => r.status?.toUpperCase() === "PENDING").length;

  const stats = [
    { label: "Total Reports", value: totalReports.toString(), icon: IconFileText },
    { label: "Average Rating", value: avgRating, icon: IconStar },
    { label: "Completed", value: completed.toString(), icon: IconCircleCheck },
    { label: "Pending", value: pending.toString(), icon: IconClock },
  ];

  const filteredReports = reports.filter((item) => {
    if (statusFilter === "All") return true;
    return item.status?.toUpperCase() === statusFilter.toUpperCase();
  });

  const startItem = totalReports === 0 ? 0 : (currentPage - 1) * limit + 1;
  const endItem = Math.min(currentPage * limit, totalReports);

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push("...");
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (currentPage < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  };

  const handleView = (report: IGameReportItem) => {
    setSelectedReport(report);
    setIsOpen(true);
  };

  // Downloads the Player Analysis Profile PDF (same design as the report page),
  // generated from the saved report — not the backend-generated PDF file.
  const [downloadingReportId, setDownloadingReportId] = useState<string | null>(null);
  const finishDownload = useCallback(() => setDownloadingReportId(null), []);

  const handleDownload = (e: React.MouseEvent, report: IGameReportItem) => {
    e.stopPropagation();
    if (!canDownloadReport(report)) {
      WarningToast("This report hasn't been submitted yet.");
      return;
    }
    if (downloadingReportId) {
      WarningToast("A report is already downloading. Please wait.");
      return;
    }
    setDownloadingReportId(report._id);
  };

  return (
    <div className="flex flex-col gap-10 pb-16">
      {downloadingReportId && (
        <GameReportPdfDownloader key={downloadingReportId} reportId={downloadingReportId} onDone={finishDownload} />
      )}
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-2 sm:px-0">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-normal text-white uppercase tracking-tighter font-heading">
            Game Reports
          </h1>
          <p className="text-gray-400 text-sm sm:text-base md:text-lg font-light tracking-tight">
            Professional Performance Analysis
          </p>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => {
              router.push("/dashboard/player/game-reports/create");
            }}
            className="px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-white hover:bg-white/10 transition-all flex items-center gap-2 uppercase tracking-wider cursor-pointer"
          >
            <IconReportAnalytics size={18} stroke={1.5} />
            Create New Report
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="p-4 sm:p-8 rounded-[30px] sm:rounded-[40px] border border-white/5 bg-[#0D0D0D]/40 backdrop-blur-xl">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, idx) => (
              <div
                key={idx}
                className="p-4 sm:p-8 rounded-[20px] sm:rounded-3xl border border-white/5 bg-[#0A0A0A]/60 animate-pulse"
              >
                <div className="flex flex-col gap-4 sm:gap-6">
                  <Skeleton className="size-10 rounded-xl bg-white/10 shrink-0" />
                  <div className="flex flex-col gap-2">
                    <Skeleton className="h-8 sm:h-10 w-24 bg-white/15 rounded-md" />
                    <Skeleton className="h-3 w-28 bg-white/5 rounded" />
                  </div>
                </div>
              </div>
            ))
          ) : (
            stats.map((stat, idx) => (
              <div
                key={idx}
                className="p-4 sm:p-8 rounded-[20px] sm:rounded-3xl border border-white/5 bg-[#0A0A0A]/60 group hover:border-white/10 transition-all duration-500"
              >
                <div className="flex flex-col gap-4 sm:gap-6">
                  <div className="size-10 rounded-xl bg-white/5 flex items-center justify-center text-white/40 group-hover:bg-white/10 group-hover:text-white transition-all duration-500">
                    <stat.icon size={20} stroke={1.5} />
                  </div>
                  <div className="flex flex-col gap-1">
                    <div className="text-3xl sm:text-4xl font-bold text-white tracking-tighter font-orbitron">
                      {stat.value}
                    </div>
                    <div className="text-[9px] sm:text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em]">
                      {stat.label}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Filter Section */}
      <div className="flex items-center gap-4 px-2">
        {(["All", "Paid", "Pending"] as const).map((status) => (
          <button
            key={status}
            onClick={() => {
              setStatusFilter(status);
              setPage(1);
            }}
            className={cn(
              "px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all duration-300 border cursor-pointer",
              statusFilter === status
                ? "bg-red-600 border-red-600 text-white shadow-lg shadow-red-600/20"
                : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:border-white/20"
            )}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Table Section */}
      <div className="p-4 sm:p-10 rounded-[30px] sm:rounded-[40px] border border-white/5 bg-[#0D0D0D]/40 backdrop-blur-xl w-full">
        {isLoading || isFetching ? (
          <>
            {/* Desktop Skeleton Table */}
            <div className="hidden lg:block overflow-x-auto w-full">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="border-b border-white/10 text-[11px] font-bold text-gray-500 uppercase tracking-[0.2em]">
                    <th className="pb-6 pl-4">Report</th>
                    <th className="pb-6">Rating</th>
                    <th className="pb-6">Amount</th>
                    <th className="pb-6">Approval Date</th>
                    <th className="pb-6">Evaluated By</th>
                    <th className="pb-6">Payment</th>
                    <th className="pb-6">Submission</th>
                    <th className="pb-6 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="text-sm font-medium">
                  {Array.from({ length: limit }).map((_, idx) => (
                    <tr key={idx} className="border-b border-white/5 animate-pulse">
                      <td className="py-6 pl-4">
                        <div className="flex items-center gap-4">
                          <Skeleton className="size-8 rounded-lg bg-white/10 shrink-0" />
                          <div className="flex flex-col gap-1.5">
                            <Skeleton className="h-4 w-44 bg-white/15 rounded" />
                            <Skeleton className="h-2.5 w-24 bg-white/5 rounded" />
                          </div>
                        </div>
                      </td>
                      <td className="py-6">
                        <Skeleton className="h-4 w-10 bg-red-600/20 rounded" />
                      </td>
                      <td className="py-6">
                        <Skeleton className="h-4 w-16 bg-white/10 rounded" />
                      </td>
                      <td className="py-6">
                        <Skeleton className="h-4 w-24 bg-white/10 rounded" />
                      </td>
                      <td className="py-6">
                        <div className="flex flex-col gap-1">
                          <Skeleton className="h-5 w-16 rounded-full bg-white/10" />
                          <Skeleton className="h-2.5 w-20 bg-white/5 rounded" />
                        </div>
                      </td>
                      {[0, 1].map((col) => (
                        <td key={col} className="py-6">
                          <div className="flex items-center gap-2">
                            <Skeleton className="size-4 rounded-full bg-white/10 shrink-0" />
                            <Skeleton className="h-3 w-14 bg-white/10 rounded" />
                          </div>
                        </td>
                      ))}
                      <td className="py-6">
                        <div className="flex items-center justify-center gap-4">
                          <Skeleton className="size-5 rounded bg-white/10" />
                          <Skeleton className="size-5 rounded bg-white/10" />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Skeleton Cards */}
            <div className="flex flex-col gap-4 lg:hidden">
              {Array.from({ length: 4 }).map((_, idx) => (
                <div
                  key={idx}
                  className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col gap-4 animate-pulse"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <Skeleton className="size-10 rounded-xl bg-white/10 shrink-0" />
                      <div className="flex flex-col gap-1.5">
                        <Skeleton className="h-4 w-36 bg-white/15 rounded" />
                        <Skeleton className="h-3 w-20 bg-white/5 rounded" />
                      </div>
                    </div>
                    <Skeleton className="h-6 w-16 rounded-full bg-white/10" />
                  </div>
                  <div className="grid grid-cols-3 gap-2 pt-3 border-t border-white/5">
                    <div className="flex flex-col gap-1.5">
                      <Skeleton className="h-3 w-12 bg-white/5 rounded" />
                      <Skeleton className="h-4 w-16 bg-white/10 rounded" />
                    </div>
                    <div className="flex flex-col gap-1.5 items-center">
                      <Skeleton className="h-3 w-14 bg-white/5 rounded" />
                      <Skeleton className="h-4 w-14 rounded-full bg-white/10" />
                    </div>
                    <div className="flex flex-col gap-1.5 items-end">
                      <Skeleton className="h-3 w-12 bg-white/5 rounded" />
                      <Skeleton className="h-4 w-16 bg-white/10 rounded" />
                    </div>
                  </div>
                  <div className="flex items-center gap-3 pt-2">
                    <Skeleton className="h-9 flex-1 rounded-lg bg-white/10" />
                    <Skeleton className="h-9 flex-1 rounded-lg bg-white/10" />
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : filteredReports.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3 text-center">
            <div className="size-14 rounded-2xl bg-white/5 flex items-center justify-center text-gray-500">
              <IconFileText size={28} stroke={1.5} />
            </div>
            <h3 className="text-white font-bold text-lg">No reports found</h3>
            <p className="text-gray-500 text-sm max-w-sm">
              {statusFilter === "All"
                ? "You haven't submitted or received any game reports yet."
                : `No reports found with status "${statusFilter}".`}
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden lg:block overflow-x-auto w-full">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="border-b border-white/10 text-[11px] font-bold text-gray-500 uppercase tracking-[0.2em]">
                    <th className="pb-6 pl-4">Report</th>
                    <th className="pb-6">Rating</th>
                    <th className="pb-6">Amount</th>
                    <th className="pb-6">Approval Date</th>
                    <th className="pb-6">Evaluated By</th>
                    <th className="pb-6">Payment</th>
                    <th className="pb-6">Submission</th>
                    <th className="pb-6 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="text-sm font-medium">
                  {filteredReports.map((item) => {
                    const ratingValue = item.scoutRating ?? item.rating ?? 0;
                    const reportTitle = item.report || (item.awayTeam ? `vs ${item.awayTeam}` : item.title);
                    const amountText = item.amount || (item.amountNumber !== undefined ? `$ ${item.amountNumber.toFixed(2)}` : NA);
                    const dateText = item.approvalDate || item.date || "N/A";
                    const { label: evaluatedBy, isCoach: isCoachEvaluated } = evaluatorTypeView(
                      item.evaluatedBy,
                      item.reportCompletionType,
                      item.evaluator?.type
                    );
                    

                    return (
                      <tr
                        key={item._id}
                        className="group hover:bg-white/5 transition-colors border-b border-white/5"
                      >
                        <td className="py-6 pl-4">
                          <div className="flex items-center gap-4">
                            <div className="size-8 rounded-lg bg-red-600/10 flex items-center justify-center text-red-500 shrink-0">
                              <IconFileText size={18} stroke={1.5} />
                            </div>
                            <span className="text-white font-bold truncate max-w-md">
                              {reportTitle}
                            </span>
                          </div>
                        </td>
                        <td className="py-6">
                          <span className="text-red-600 font-bold">
                            {ratingValue.toFixed(1)}
                          </span>
                        </td>
                        <td className="py-6 text-gray-300">
                          {amountText}
                        </td>
                        <td className="py-6 text-gray-400">
                          {dateText}
                        </td>
                        <td className="py-6">
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-1.5">
                              {isCoachEvaluated ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#00FF62]/10 text-[#00FF62] border border-[#00FF62]/20 font-orbitron">
                                  <IconUserCheck size={12} stroke={2} />
                                  {evaluatedBy}
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/5 text-gray-300 border border-white/10 font-orbitron">
                                  <IconUser size={12} stroke={1.8} />
                                  {evaluatedBy}
                                </span>
                              )}
                            </div>
                            {item.evaluatorName && (
                              <span className="text-[11px] text-gray-400 font-medium truncate max-w-[130px]">
                                {item.evaluatorName}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-6">
                          <StatusIndicator {...paymentStatusView(item.paymentStatus)} />
                        </td>
                        <td className="py-6">
                          <StatusIndicator {...submissionStatusView(item.evaluationStatus)} />
                        </td>
                        <td className="py-6">
                          <div className="flex items-center justify-center gap-4">
                            <button
                              onClick={() => handleView(item)}
                              title="View Details"
                              className="text-red-600 hover:text-red-400 transition-colors cursor-pointer"
                            >
                              <IconEye size={18} stroke={1.5} />
                            </button>
                            <button
                              onClick={(e) => handleDownload(e, item)}
                              disabled={downloadingReportId === item._id}
                              title={canDownloadReport(item) ? "Download PDF" : "Not submitted yet"}
                              className={cn(
                                "transition-colors cursor-pointer",
                                canDownloadReport(item)
                                  ? "text-white hover:text-gray-300"
                                  : "text-white/40 hover:text-white/60"
                              )}
                            >
                              {downloadingReportId === item._id ? (
                                <IconLoader2 size={18} stroke={1.5} className="animate-spin" />
                              ) : (
                                <IconDownload size={18} stroke={1.5} />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="flex flex-col gap-4 lg:hidden">
              {filteredReports.map((item) => {
                const ratingValue = item.scoutRating ?? item.rating ?? 0;
                const reportTitle = item.report || (item.awayTeam ? `vs ${item.awayTeam}` : item.title);
                const amountText = item.amount || (item.amountNumber !== undefined ? `$ ${item.amountNumber.toFixed(2)}` : NA);
                const dateText = item.approvalDate || item.date || "N/A";
                const { label: evaluatedBy, isCoach: isCoachEvaluated } = evaluatorTypeView(
                      item.evaluatedBy,
                      item.reportCompletionType,
                      item.evaluator?.type
                    );
                

                return (
                  <div
                    key={item._id}
                    className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 hover:bg-white/[0.06] hover:border-white/20 transition-all duration-300 backdrop-blur-md shadow-lg shadow-black/50 flex flex-col gap-4 group relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="relative z-10 flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="size-10 shrink-0 rounded-xl bg-red-600/10 flex items-center justify-center text-red-500">
                          <IconFileText size={20} stroke={1.5} />
                        </div>
                        <div className="truncate">
                          <span className="text-white font-bold block text-sm sm:text-base leading-tight mb-1 truncate">
                            {reportTitle}
                          </span>
                          <span className="text-gray-400 text-xs block">{dateText}</span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-[9px] text-gray-500 font-bold uppercase tracking-wider mb-0.5">Rating</div>
                        <span className="text-red-600 font-bold text-lg leading-tight block">
                          {ratingValue.toFixed(1)}
                        </span>
                      </div>
                    </div>

                    <div className="relative z-10 grid grid-cols-2 gap-x-2 gap-y-3 pt-3 border-t border-white/10">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wider">Amount</span>
                        <span className="text-gray-300 text-sm font-bold">{amountText}</span>
                      </div>
                      <div className="flex flex-col gap-0.5 items-center text-center">
                        <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wider">Evaluated By</span>
                        <span
                          className={cn(
                            "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider font-orbitron mt-0.5",
                            isCoachEvaluated
                              ? "bg-[#00FF62]/10 text-[#00FF62] border border-[#00FF62]/20 font-black"
                              : "bg-white/5 text-gray-300 border border-white/10"
                          )}
                        >
                          {isCoachEvaluated ? <IconUserCheck size={11} stroke={2} /> : <IconUser size={11} stroke={1.8} />}
                          {evaluatedBy}
                        </span>
                        {item.evaluatorName && (
                          <span className="text-[10px] text-gray-400 truncate max-w-[90px] block mt-0.5">
                            {item.evaluatorName}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wider">Payment</span>
                        <StatusIndicator compact {...paymentStatusView(item.paymentStatus)} />
                      </div>
                      <div className="flex flex-col gap-1 items-end">
                        <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wider">Submission</span>
                        <StatusIndicator compact {...submissionStatusView(item.evaluationStatus)} />
                      </div>
                    </div>

                    <div className="relative z-10 flex items-center justify-end gap-2 pt-1">
                      <button
                        onClick={() => handleView(item)}
                        className="flex-1 sm:flex-none flex justify-center items-center gap-2 px-4 py-2.5 rounded-lg bg-red-600/10 text-red-500 hover:bg-red-600/20 text-xs font-bold uppercase transition-colors cursor-pointer min-w-0"
                      >
                        <IconEye size={16} />
                        View
                      </button>
                      <button
                        onClick={(e) => handleDownload(e, item)}
                        className="flex-1 sm:flex-none flex justify-center items-center gap-2 px-4 py-2.5 rounded-lg bg-white/5 text-white hover:bg-white/10 text-xs font-bold uppercase transition-colors cursor-pointer min-w-0"
                      >
                        {downloadingReportId === item._id ? (
                          <IconLoader2 size={16} className="animate-spin" />
                        ) : (
                          <IconDownload size={16} />
                        )}
                        Save
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination Controls */}
            {totalPages > 0 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 mt-6 border-t border-white/10 w-full">
                <div className="flex items-center gap-4 text-xs text-gray-400">
                  <span>
                    Showing <span className="text-white font-bold font-orbitron">{startItem}</span> to{" "}
                    <span className="text-white font-bold font-orbitron">{endItem}</span> of{" "}
                    <span className="text-white font-bold font-orbitron">{totalReports}</span> reports
                  </span>
                  {isFetching && (
                    <span className="flex items-center gap-1.5 text-red-500 font-medium">
                      <IconLoader2 size={14} className="animate-spin" />
                      <span className="text-[11px]">Updating...</span>
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5 sm:gap-2">
                  {/* First Page Button */}
                  <button
                    onClick={() => setPage(1)}
                    disabled={currentPage <= 1 || isFetching}
                    title="First Page"
                    className="size-8 sm:size-9 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center justify-center cursor-pointer"
                  >
                    <IconChevronsLeft size={16} />
                  </button>

                  {/* Previous Page Button */}
                  <button
                    onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                    disabled={currentPage <= 1 || isFetching}
                    title="Previous Page"
                    className="size-8 sm:size-9 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center justify-center cursor-pointer"
                  >
                    <IconChevronLeft size={16} />
                  </button>

                  {/* Page Numbers */}
                  <div className="flex items-center gap-1">
                    {getPageNumbers().map((p, idx) =>
                      p === "..." ? (
                        <span key={`ellipsis-${idx}`} className="px-1.5 text-xs text-gray-500 select-none font-orbitron">
                          ...
                        </span>
                      ) : (
                        <button
                          key={`page-${p}`}
                          onClick={() => setPage(Number(p))}
                          disabled={isFetching}
                          className={cn(
                            "size-8 sm:size-9 rounded-xl text-xs font-black font-orbitron transition-all flex items-center justify-center cursor-pointer",
                            currentPage === p
                              ? "bg-red-600 text-white shadow-lg shadow-red-600/30"
                              : "bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10"
                          )}
                        >
                          {p}
                        </button>
                      )
                    )}
                  </div>

                  {/* Next Page Button */}
                  <button
                    onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                    disabled={currentPage >= totalPages || isFetching}
                    title="Next Page"
                    className="size-8 sm:size-9 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center justify-center cursor-pointer"
                  >
                    <IconChevronRight size={16} />
                  </button>

                  {/* Last Page Button */}
                  <button
                    onClick={() => setPage(totalPages)}
                    disabled={currentPage >= totalPages || isFetching}
                    title="Last Page"
                    className="size-8 sm:size-9 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center justify-center cursor-pointer"
                  >
                    <IconChevronsRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Report Detail Drawer — all data from GET /players/me/game-reports/:reportId */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent className="bg-black border-white/10 p-5 text-white sm:max-w-xl overflow-y-auto">
          {(isDetailLoading || isDetailFetching) && !apiDetail ? (
            <div className="flex flex-col gap-5 pt-6">
              <div className="flex items-center gap-2 text-xs text-gray-400 font-orbitron">
                <IconLoader2 size={16} className="animate-spin text-red-500" />
                <span>Loading game report details...</span>
              </div>
              <Skeleton className="h-8 w-3/4 bg-white/10 rounded-lg" />
              <Skeleton className="h-4 w-1/2 bg-white/5 rounded" />
              <Skeleton className="h-28 w-full bg-white/5 rounded-2xl" />
              <Skeleton className="h-36 w-full bg-white/5 rounded-2xl" />
            </div>
          ) : isDetailError && !apiDetail ? (
            <div className="flex flex-col items-center justify-center gap-4 pt-20 text-center">
              <SheetTitle className="text-lg font-bold text-white">Could not load this report</SheetTitle>
              <SheetDescription className="text-sm text-gray-400">
                Something went wrong while fetching the game report.
              </SheetDescription>
              <button
                onClick={() => refetchDetail()}
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold uppercase tracking-wider cursor-pointer"
              >
                Try Again
              </button>
            </div>
          ) : detail ? (
            <>
              <SheetHeader className="mb-6 p-0">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge className="bg-red-600 text-white font-black italic uppercase tracking-tighter">
                      Game Report
                    </Badge>
                    {detail.isCoach ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#00FF62]/10 text-[#00FF62] border border-[#00FF62]/20 font-orbitron">
                        <IconUserCheck size={12} stroke={2} />
                        {detail.evaluatedBy}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/5 text-gray-300 border border-white/10 font-orbitron">
                        <IconUser size={12} stroke={1.8} />
                        {detail.evaluatedBy}
                      </span>
                    )}
                    <span
                      className={cn(
                        "inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border font-orbitron",
                        detail.isVerified
                          ? "bg-[#00FF62]/10 text-[#00FF62] border-[#00FF62]/20"
                          : "bg-orange-500/10 text-orange-400 border-orange-500/20"
                      )}
                    >
                      {detail.isVerified ? "Verified" : "Unverified"}
                    </span>
                  </div>
                  <div className="shrink-0 text-right">
                    <div className="text-4xl font-black text-[#00FF62] italic leading-none">
                      {detail.rating !== null ? detail.rating.toFixed(1) : "—"}
                      <span className="text-base text-gray-400 not-italic font-normal">/10</span>
                    </div>
                    <div className="mt-1 text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                      Scout Rating
                    </div>
                  </div>
                </div>
                <SheetTitle className="mt-4 text-left text-2xl sm:text-3xl font-black text-white uppercase italic tracking-tighter break-words">
                  {detail.title}
                </SheetTitle>
                {detail.subtitle !== NA && (
                  <SheetDescription className="text-left text-gray-500 italic break-words">
                    {detail.subtitle}
                  </SheetDescription>
                )}
              </SheetHeader>

              <div className="flex flex-col gap-6">
                {/* Match Details */}
                <section className="p-5 rounded-2xl border border-white/10 bg-[#0D0D0D] flex flex-col gap-4">
                  <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest font-orbitron">
                    Match Details
                  </h3>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                    {detail.matchFields.map((field) => (
                      <div key={field.label} className="flex min-w-0 flex-col gap-1">
                        <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{field.label}</span>
                        <span className="text-sm font-bold text-white break-words">{field.value}</span>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Performance Metrics */}
                <section className="p-5 rounded-2xl border border-white/10 bg-[#0D0D0D] flex flex-col gap-4">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest font-orbitron">
                      Performance Metrics
                    </h3>
                    <IconReportAnalytics size={18} className="shrink-0 text-[#00FF62]" />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {detail.metrics.map((m) => (
                      <div
                        key={m.label}
                        className="flex min-w-0 flex-col items-center gap-1 rounded-xl border border-white/5 bg-white/5 p-3 text-center"
                      >
                        <span className="text-2xl font-black text-white italic font-orbitron tabular-nums">{m.value}</span>
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{m.label}</span>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Category Ratings (10-scale) */}
                {detail.categoryRatings.length > 0 && (
                  <section className="p-5 rounded-2xl border border-white/10 bg-[#0D0D0D] flex flex-col gap-4">
                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest font-orbitron">
                      Category Ratings (10 Scale)
                    </h3>
                    <div className="flex flex-col gap-3">
                      {detail.categoryRatings.map(({ label, value }) => (
                        <div key={label} className="flex flex-col gap-1">
                          <div className="flex justify-between gap-2 text-xs">
                            <span className="min-w-0 break-words text-gray-300 capitalize">{label}</span>
                            <span className="shrink-0 font-bold text-white font-orbitron">
                              {Number.isInteger(value) ? `${value}/10` : `${value.toFixed(1)}/10`}
                            </span>
                          </div>
                          <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                            <div
                              className="h-full bg-red-600 rounded-full"
                              style={{ width: `${Math.min(100, Math.max(0, value * 10))}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* Evaluation */}
                <section className="p-5 rounded-2xl border border-white/10 bg-[#0D0D0D] flex flex-col gap-4">
                  <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest font-orbitron">
                    Evaluation
                  </h3>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                    {detail.evaluationFields.map((field) => (
                      <div key={field.label} className="flex min-w-0 flex-col gap-1">
                        <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{field.label}</span>
                        <span className="text-sm font-bold text-white break-words">{field.value}</span>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Scout Analysis */}
                <section className="flex flex-col gap-2">
                  <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Scout Analysis</span>
                  <p className="text-sm text-gray-300 leading-relaxed italic break-words">
                    {detail.scoutAnalysis !== NA ? detail.scoutAnalysis : "No scout analysis provided."}
                  </p>
                </section>

                {/* Payment */}
                <section className="p-5 rounded-2xl border border-white/10 bg-[#0D0D0D] flex flex-col gap-4">
                  <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest font-orbitron">
                    Payment
                  </h3>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                    {detail.paymentFields.map((field) => (
                      <div key={field.label} className="flex min-w-0 flex-col gap-1">
                        <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{field.label}</span>
                        <span
                          className={cn(
                            "text-sm font-bold break-words",
                            field.value === "PAID" ? "text-green-500" : field.value === NA ? "text-white" : "text-orange-500"
                          )}
                        >
                          {field.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Actions */}
                <div className="flex">
                  <button
                    onClick={() => {
                      const params = new URLSearchParams({
                        step: "preview",
                        reportId: detail.id,
                        viewOnly: "true",
                      });
                      if (detail.position !== NA) params.set("position", detail.position);
                      router.push(`/dashboard/player/game-reports/create?${params.toString()}`);
                    }}
                    className="flex-1 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <IconEye size={16} />
                    View Full Report
                  </button>
                </div>

                {/* Footer */}
                <div className="pt-5 border-t border-white/5 text-[10px] font-bold text-gray-500 uppercase tracking-widest break-all">
                  Report ID: {detail.reportCode}
                </div>
              </div>
            </>
          ) : null}
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default GameReports;
