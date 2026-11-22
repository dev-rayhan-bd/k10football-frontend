/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import React, { useState } from "react";
import {
  FileText,
  Eye,
  Plus,
  CheckCircle,
  Clock,
  Lock,
  Download,
  User,
  UserCheck,
  ShieldCheck,
  Loader2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { usePlayer } from "@/hooks/usePlayer";
import {
  useGetMyGameReportsQuery,
  useGetMyGameReportByIdQuery,
} from "@/redux/features/player/playerApi";
import { useGetMySubscriptionQuery } from "@/redux/features/subscription/subscriptionApi";
import { formatDate, cn } from "@/lib/utils";
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

const formatRatingOn10 = (val: unknown): string => {
  if (typeof val !== "number" || isNaN(val)) return "N/A";
  const normalized = val > 10 ? val / 10 : val;
  return Number.isInteger(normalized) ? `${normalized}/10` : `${normalized.toFixed(1)}/10`;
};

const formatRatingNumber10 = (val: unknown): string => {
  if (typeof val !== "number" || isNaN(val)) return "0.0";
  const normalized = val > 10 ? val / 10 : val;
  return Number.isInteger(normalized) ? String(normalized) : normalized.toFixed(1);
};

const STAT_LABELS: Array<{ key: string; label: string }> = [
  { key: "shotsOnGoal", label: "Shots on Goal" },
  { key: "goalScored", label: "Goals Scored" },
  { key: "assists", label: "Assists" },
  { key: "passAccurate", label: "Accurate Passes" },
  { key: "wrongPass", label: "Wrong Passes" },
  { key: "standTackle", label: "Standing Tackles" },
  { key: "slidingTackle", label: "Sliding Tackles" },
  { key: "interception", label: "Interceptions" },
  { key: "freeKick", label: "Free Kicks" },
  { key: "cornerKick", label: "Corner Kicks" },
  { key: "penaltiesTaken", label: "Penalties Taken" },
  { key: "fault", label: "Fouls" },
  { key: "yellowCard", label: "Yellow Cards" },
  { key: "redCard", label: "Red Cards" },
  { key: "savesAccurate", label: "Saves" },
  { key: "penaltiesSaves", label: "Penalty Saves" },
  { key: "handling", label: "Handling" },
  { key: "reflex", label: "Reflexes" },
  { key: "aerialAbility", label: "Aerial Ability" },
];

const GameReportSection = () => {
  const router = useRouter();
  const { cvData } = usePlayer();
  const { data: subscriptionResponse } = useGetMySubscriptionQuery();
  const { data: gameReportsResponse } = useGetMyGameReportsQuery({ page: 1, limit: 10 });
  const hasActiveSubscription = Boolean(subscriptionResponse?.data?.hasActiveSubscription);

  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [fallbackReport, setFallbackReport] = useState<any>(null);
  const [isOpen, setIsOpen] = useState(false);

  const {
    data: singleReportResponse,
    isLoading: isLoadingDetail,
    isFetching: isFetchingDetail,
  } = useGetMyGameReportByIdQuery(selectedReportId || "", {
    skip: !selectedReportId || !isOpen,
  });

  const apiReports = gameReportsResponse?.data?.reports || [];
  const rawReports =
    apiReports.length > 0
      ? apiReports
      : Array.isArray(cvData?.recentMatches)
        ? cvData.recentMatches
        : [];

  const displayRows = rawReports.map((r: any, idx: number) => {
    const rawRating = r.scoutRating ?? r.rating ?? r.playerRating ?? r.rating10;
    const isCompleted =
      String(r.evaluationStatus || "").toUpperCase() === "COMPLETED" ||
      String(r.status || "").toUpperCase() === "PAID" ||
      String(r.status || "").toUpperCase() === "COMPLETED" ||
      Boolean(r.isVerified);

    return {
      id: String(r._id || r.id || idx),
      hasRealId: Boolean(r._id),
      team2:
        r.title ||
        r.report ||
        (r.awayTeam ? `vs ${r.awayTeam}` : r.homeTeam ? `vs ${r.homeTeam}` : "Match Report"),
      rating: formatRatingOn10(rawRating),
      amount: r.amount || (r.paymentStatus === "FREE" ? "Free" : "-"),
      date: formatDate(r.date || r.matchDate || r.approvalDate),
      status: isCompleted ? "Paid" : "Pending",
      raw: r,
    };
  });

  const handleView = (row: any) => {
    setFallbackReport(row.raw);
    setSelectedReportId(row.hasRealId ? row.id : null);
    setIsOpen(true);
  };

  // Merge full single report details from GET /players/me/game-reports/:reportId with list fallback
  const detail = singleReportResponse?.data || fallbackReport;
  const isDetailLoading = Boolean(selectedReportId) && (isLoadingDetail || isFetchingDetail) && !singleReportResponse?.data;

  const detailRating = detail?.scoutRating ?? detail?.rating ?? detail?.playerRating ?? detail?.rating10 ?? 0;
  const detailScore =
    detail?.score ||
    `${detail?.homeScore ?? 0} - ${detail?.awayScore ?? 0}`;
  const detailEvaluatedBy = String(
    detail?.evaluatedBy || detail?.reportCompletionType || detail?.evaluator?.type || "SELF"
  ).toUpperCase();
  const detailEvaluatorName =
    detail?.evaluatorName || detail?.evaluator?.name || detail?.authorName || "";
  const detailGoals =
    detail?.performanceMetrics?.goals ?? detail?.stats?.goalScored ?? detail?.goals ?? 0;
  const detailAssists =
    detail?.performanceMetrics?.assists ?? detail?.stats?.assists ?? detail?.assists ?? 0;
  const detailPasses =
    detail?.performanceMetrics?.passes ??
    detail?.stats?.passAccurate ??
    detail?.passes ??
    0;

  const passAcc = Number(detail?.stats?.passAccurate ?? 0);
  const wrongPass = Number(detail?.stats?.wrongPass ?? 0);
  const computedPassAccuracy =
    passAcc + wrongPass > 0
      ? Math.round((passAcc / (passAcc + wrongPass)) * 100)
      : typeof detail?.passAccuracy === "number"
        ? Math.round(detail.passAccuracy)
        : null;

  const categoryRatingsEntries = detail?.categoryRatings
    ? Object.entries(detail.categoryRatings).filter(
        ([, val]) => typeof val === "number" && !isNaN(val)
      )
    : [];

  const populatedStats = detail?.stats
    ? STAT_LABELS.filter(
        ({ key }) => typeof detail.stats[key] === "number" && detail.stats[key] > 0
      ).map(({ key, label }) => ({ key, label, value: detail.stats[key] }))
    : [];

  return (
    <div className="py-8 sm:py-12 md:py-16 px-2 sm:px-4">
      <div className="w-full">
        {/* Main Card */}
        <div className="border border-white/10 bg-[#0A0A0A]/60 rounded-3xl p-4 sm:p-6 md:p-8 shadow-xl">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 sm:mb-8">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-white mb-1 uppercase italic font-orbitron">
                Game Reports
              </h1>
              <p className="text-gray-400 text-xs sm:text-sm">
                Professional match performance analysis
              </p>
            </div>
            <button
              onClick={() => {
                if (!hasActiveSubscription) {
                  toast.error(
                    "Active Athlete Membership required to submit game reports or request coach reviews."
                  );
                  router.push("/dashboard/player/my-subscription");
                  return;
                }
                router.push("/dashboard/player/game-reports/create");
              }}
              className="px-4 py-2 border border-white/10 text-white rounded-xl hover:bg-white/5 transition flex items-center gap-2 text-xs uppercase tracking-widest font-orbitron cursor-pointer"
            >
              {!hasActiveSubscription ? (
                <Lock className="size-3.5 text-red-500" />
              ) : (
                <Plus className="size-4 text-red-500" />
              )}
              Request Report
            </button>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            {displayRows.length === 0 ? (
              <div className="text-center py-10 text-gray-500 text-sm italic">
                No game reports or requests found.
              </div>
            ) : (
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-white/10 text-[10px] font-black text-gray-400 uppercase tracking-widest font-orbitron">
                    <th className="px-3 sm:px-4 py-3">Report</th>
                    <th className="px-3 sm:px-4 py-3">Rating</th>
                    <th className="px-3 sm:px-4 py-3">Amount</th>
                    <th className="px-3 sm:px-4 py-3">Date</th>
                    <th className="px-3 sm:px-4 py-3">Status</th>
                    <th className="px-3 sm:px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {displayRows.map((row: any) => (
                    <tr
                      key={row.id}
                      onClick={() => handleView(row)}
                      className="border-b border-white/5 text-xs sm:text-sm hover:bg-white/5 transition-colors cursor-pointer"
                    >
                      <td className="px-3 sm:px-4 py-3.5 font-medium text-white flex items-center gap-2">
                        <FileText className="size-4 text-red-500 shrink-0" />
                        <span className="truncate max-w-37.5 sm:max-w-none">{row.team2}</span>
                      </td>
                      <td className="px-3 sm:px-4 py-3.5 font-bold font-orbitron text-red-500">
                        {row.rating}
                      </td>
                      <td className="px-3 sm:px-4 py-3.5 text-gray-300 font-orbitron">
                        {row.amount}
                      </td>
                      <td className="px-3 sm:px-4 py-3.5 text-gray-400 text-xs">{row.date}</td>
                      <td className="px-3 sm:px-4 py-3.5">
                        {row.status === "Paid" ? (
                          <Badge className="bg-green-500/10 text-green-400 border border-green-500/20 text-[10px] font-orbitron">
                            <CheckCircle className="size-3 mr-1" />
                            Completed
                          </Badge>
                        ) : (
                          <Badge className="bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-orbitron">
                            <Clock className="size-3 mr-1" />
                            Pending
                          </Badge>
                        )}
                      </td>
                      <td className="px-3 sm:px-4 py-3.5 text-right">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleView(row);
                          }}
                          className="p-1.5 rounded-lg border border-white/10 text-gray-300 hover:text-white hover:bg-white/10 transition cursor-pointer"
                          title="View Report Details"
                        >
                          <Eye className="size-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Report Detail Sheet (backed by GET /players/me/game-reports/:reportId) */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-xl bg-[#0F0F12] border-l border-white/10 text-white overflow-y-auto p-6"
        >
          {isDetailLoading ? (
            <div className="flex flex-col gap-6 pt-6">
              <div className="flex items-center gap-2 text-xs text-gray-400 font-orbitron">
                <Loader2 className="size-4 animate-spin text-red-500" />
                <span>Loading game report details...</span>
              </div>
              <Skeleton className="h-8 w-3/4 bg-white/10 rounded-lg" />
              <Skeleton className="h-4 w-1/2 bg-white/5 rounded" />
              <div className="grid grid-cols-3 gap-3">
                <Skeleton className="h-20 bg-white/5 rounded-xl" />
                <Skeleton className="h-20 bg-white/5 rounded-xl" />
                <Skeleton className="h-20 bg-white/5 rounded-xl" />
              </div>
              <Skeleton className="h-32 bg-white/5 rounded-xl" />
            </div>
          ) : detail ? (
            <div className="flex flex-col gap-6">
              <SheetHeader className="border-b border-white/10 pb-4 text-left">
                <div className="flex items-center justify-between gap-2 pr-6">
                  <Badge className="bg-red-600/20 text-red-400 border border-red-500/30 text-[10px] font-orbitron uppercase">
                    {detail.league || "Match Report"}
                  </Badge>
                  <Badge className="bg-green-500/10 text-green-400 border border-green-500/20 text-xs font-orbitron">
                    Score: {detailScore}
                  </Badge>
                </div>
                <SheetTitle className="text-xl font-black text-white font-orbitron uppercase mt-2 text-left">
                  {detail.title ||
                    detail.report ||
                    `${detail.homeTeam || ""} vs ${detail.awayTeam || ""}`}
                </SheetTitle>
                <SheetDescription className="text-gray-400 text-xs mt-1 text-left">
                  {detail.subtitle ||
                    `Evaluated by ${detailEvaluatorName || detailEvaluatedBy} on ${formatDate(detail.date || detail.approvalDate)}`}
                </SheetDescription>
              </SheetHeader>

              {/* Top Summary (10-scale Rating, Goals, Assists, Passes) */}
              <div className="grid grid-cols-4 gap-2.5 bg-white/5 p-4 rounded-xl border border-white/5 text-center">
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    Rating
                  </p>
                  <p className="text-xl sm:text-2xl font-black text-[#00FF62] font-orbitron">
                    {formatRatingNumber10(detailRating)}
                    <span className="text-xs text-gray-400 font-normal">/10</span>
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    Goals
                  </p>
                  <p className="text-xl sm:text-2xl font-black text-white font-orbitron">
                    {detailGoals}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    Assists
                  </p>
                  <p className="text-xl sm:text-2xl font-black text-white font-orbitron">
                    {detailAssists}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    Passes
                  </p>
                  <p className="text-xl sm:text-2xl font-black text-white font-orbitron">
                    {detailPasses}
                  </p>
                </div>
              </div>

              {/* Match Info & Evaluator */}
              <div className="grid grid-cols-2 gap-3 bg-black/40 p-4 rounded-xl border border-white/5 text-xs">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[10px] text-gray-500 uppercase font-bold">Position</span>
                  <span className="text-white font-semibold uppercase">
                    {detail.position || "N/A"}
                  </span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[10px] text-gray-500 uppercase font-bold">Date</span>
                  <span className="text-white font-semibold">
                    {formatDate(detail.date || detail.matchDate || detail.approvalDate)}
                  </span>
                </div>
                <div className="flex flex-col gap-1 col-span-2 pt-2 border-t border-white/5">
                  <span className="text-[10px] text-gray-500 uppercase font-bold">
                    Evaluated By
                  </span>
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase font-orbitron border",
                        detailEvaluatedBy === "COACH"
                          ? "bg-[#00FF62]/10 text-[#00FF62] border-[#00FF62]/30"
                          : "bg-white/5 text-gray-300 border-white/10"
                      )}
                    >
                      {detailEvaluatedBy === "COACH" ? (
                        <UserCheck className="size-3" />
                      ) : (
                        <User className="size-3" />
                      )}
                      {detailEvaluatedBy}
                    </span>
                    {detailEvaluatorName && (
                      <span className="text-gray-200 font-semibold">{detailEvaluatorName}</span>
                    )}
                    {detail.isProfessionallyVerified && (
                      <span className="inline-flex items-center gap-1 text-[10px] text-green-400 font-semibold">
                        <ShieldCheck className="size-3.5" /> Verified
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Pass Accuracy & Minutes (only when present) */}
              {(computedPassAccuracy !== null || detail.minutesPlayed) && (
                <div className="flex flex-col gap-3 bg-black/40 p-4 rounded-xl border border-white/5">
                  <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest font-orbitron">
                    Performance Metrics
                  </h3>
                  {computedPassAccuracy !== null && (
                    <div className="flex flex-col gap-1.5">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-gray-400">Pass Accuracy</span>
                        <span className="font-bold text-green-400 font-orbitron">
                          {computedPassAccuracy}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-800 rounded-full h-1.5">
                        <div
                          className="bg-green-500 h-1.5 rounded-full"
                          style={{ width: `${Math.min(100, computedPassAccuracy)}%` }}
                        />
                      </div>
                    </div>
                  )}
                  {detail.minutesPlayed && (
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-400">Minutes Played</span>
                      <span className="font-bold text-white font-orbitron">
                        {detail.minutesPlayed}&apos;
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Category Ratings (10-scale) */}
              {categoryRatingsEntries.length > 0 && (
                <div className="flex flex-col gap-3 bg-black/40 p-4 rounded-xl border border-white/5">
                  <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest font-orbitron">
                    Category Ratings
                  </h3>
                  <div className="flex flex-col gap-2.5">
                    {categoryRatingsEntries.map(([cat, rawVal]) => {
                      const num = Number(rawVal);
                      const on10 = num > 10 ? num / 10 : num;
                      const pct = Math.min(100, Math.max(0, on10 * 10));
                      return (
                        <div key={cat} className="flex flex-col gap-1">
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-300 capitalize">{cat}</span>
                            <span className="font-bold text-white font-orbitron">
                              {formatRatingOn10(num)}
                            </span>
                          </div>
                          <div className="w-full bg-gray-800 rounded-full h-1.5 overflow-hidden">
                            <div
                              className="bg-red-500 h-full rounded-full"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Detailed Match Stats from GET /players/me/game-reports/:reportId */}
              {populatedStats.length > 0 && (
                <div className="flex flex-col gap-3 bg-black/40 p-4 rounded-xl border border-white/5">
                  <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest font-orbitron">
                    Match Statistics
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {populatedStats.map((st) => (
                      <div
                        key={st.key}
                        className="bg-white/5 border border-white/5 rounded-lg p-2.5 text-center"
                      >
                        <p className="text-base font-black text-white font-orbitron">{st.value}</p>
                        <p className="text-[10px] text-gray-400 uppercase">{st.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Scout / Coach Assessment */}
              {(detail.scoutAnalysis || detail.coachFeedback || detail.coachComments) && (
                <div className="flex flex-col gap-2">
                  <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest font-orbitron">
                    Scout &amp; Coach Assessment
                  </h3>
                  <div className="bg-white/5 border border-white/10 p-4 rounded-xl">
                    <p className="text-xs text-gray-300 leading-relaxed italic">
                      &ldquo;{detail.scoutAnalysis || detail.coachFeedback || detail.coachComments}&rdquo;
                    </p>
                  </div>
                </div>
              )}

              {/* Download PDF if available */}
              {detail.reportPdfUrl && (
                <button
                  type="button"
                  onClick={() =>
                    window.open(detail.reportPdfUrl, "_blank", "noopener,noreferrer")
                  }
                  className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-wider font-orbitron transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Download className="size-4" />
                  Download PDF Report
                </button>
              )}

              {/* Footer */}
              <div className="pt-4 border-t border-white/10 flex items-center justify-between text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                <span>
                  Report ID: {detail.reportId || (detail._id ? `#${String(detail._id).slice(-6).toUpperCase()}` : "N/A")}
                </span>
                <span className={String(detail.status || "").toUpperCase() === "PAID" ? "text-green-400" : "text-amber-400"}>
                  Status: {detail.status || "PENDING"}
                </span>
              </div>
            </div>
          ) : null}
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default GameReportSection;
