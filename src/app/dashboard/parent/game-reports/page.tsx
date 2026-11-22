/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  IconCreditCard,
  IconClock,
  IconCircleCheck,
  IconLock,
  IconLoader2,
  IconAlertCircle,
  IconRefresh,
  IconArrowRight,
  IconReportAnalytics,
} from "@tabler/icons-react";
import { useParentDashboard } from "@/providers/ParentDashboardProvider";
import { useParentSubscriptionAccess } from "@/hooks/useParentSubscriptionAccess";
import {
  useGetParentReportsQuery,
  useCreateParentReportMutation,
  useRequestParentReportReviewMutation,
} from "@/redux/features/parent/parentApi";
import { IParentMatchReport, IParentReportEvent } from "@/types/parent.type";
import { cn } from "@/lib/utils";

const formatDisplayDate = (value?: string) => {
  if (!value) return "N/A";
  try {
    const d = new Date(value);
    if (isNaN(d.getTime())) return value;
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return value;
  }
};

const normalizeReportStatus = (report: IParentMatchReport) => {
  const raw = String(
    report.evaluationStatus || report.status || "Pending"
  ).toUpperCase();
  if (raw === "VERIFIED" || raw === "COMPLETED" || raw === "EVALUATED") {
    return "Verified";
  }
  if (raw === "PAID" || raw === "REVIEW_REQUESTED" || raw === "IN_PROGRESS") {
    return "Paid";
  }
  return "Pending";
};

const ParentGameReports = () => {
  const {
    selectedChildPlayerId,
    selectedChild,
    switchToChildAccount,
    isSwitchingProfile,
  } = useParentDashboard();

  const {
    isSelectedChildUnlocked,
    isLoading: isSubAccessLoading,
  } = useParentSubscriptionAccess(selectedChildPlayerId);

  const activeChildName = selectedChild?.fullName || "Selected Athlete";
  const activeChildUserId = selectedChild?.childUserId || "";

  // Canonical API: GET /api/v1/parents/reports?childPlayerId=<selectedChildPlayerId>
  const {
    data: reportsResponse,
    isLoading: isReportsLoading,
    isFetching: isReportsFetching,
    isError: isReportsError,
    refetch: refetchReports,
  } = useGetParentReportsQuery(
    selectedChildPlayerId
      ? { childPlayerId: selectedChildPlayerId }
      : undefined,
    { skip: !selectedChildPlayerId }
  );

  const [createParentReport, { isLoading: isCreatingReport }] =
    useCreateParentReportMutation();
  const [requestParentReportReview, { isLoading: isRequestingReview }] =
    useRequestParentReportReviewMutation();

  const reports: IParentMatchReport[] = useMemo(() => {
    const raw = reportsResponse?.data;
    if (Array.isArray(raw)) return raw;
    if (raw && Array.isArray(raw.reports)) return raw.reports;
    if (raw && Array.isArray(raw.items)) return raw.items;
    return [];
  }, [reportsResponse]);

  const [newOpponent, setNewOpponent] = useState("");
  const [newDate, setNewDate] = useState("");
  const [eventType, setEventType] = useState<"Goal" | "Assist">("Goal");
  const [activeEvents, setActiveEvents] = useState<IParentReportEvent[]>([]);
  const [requestingReportId, setRequestingReportId] = useState<string | null>(
    null
  );

  // HTTP 402 Payment Required Modal state
  const [paymentRequiredModal, setPaymentRequiredModal] = useState<{
    open: boolean;
    message: string;
  }>({
    open: false,
    message: "",
  });

  const pitchRef = useRef<HTMLDivElement>(null);

  const handleSwitchAndSubscribe = async () => {
    setPaymentRequiredModal({ open: false, message: "" });
    await switchToChildAccount(
      activeChildUserId || undefined,
      "/dashboard/player/my-subscription"
    );
  };

  const handle402Error = (err: any, fallbackMessage: string) => {
    const backendMessage =
      err?.data?.message ||
      err?.error?.data?.message ||
      fallbackMessage;

    toast.error(backendMessage, {
      action: {
        label: "Switch & Subscribe",
        onClick: () => {
          handleSwitchAndSubscribe();
        },
      },
    });

    setPaymentRequiredModal({
      open: true,
      message: backendMessage,
    });
  };

  const handlePitchClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isSelectedChildUnlocked) {
      toast.error(
        `Match Reports are locked for ${activeChildName}. Switch to ${activeChildName}'s Athlete account to subscribe.`
      );
      return;
    }
    if (!pitchRef.current) return;
    const rect = pitchRef.current.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 100);
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 100);

    setActiveEvents((prev) => [...prev, { type: eventType, x, y }]);
    toast.success(`Position marked for ${eventType}! (X: ${x}%, Y: ${y}%)`);
  };

  const clearEvents = () => {
    setActiveEvents([]);
    toast.info("Cleared marked events.");
  };

  const handleCreateReport = async () => {
    if (!isSelectedChildUnlocked) {
      handle402Error(
        null,
        `Active Athlete subscription required for ${activeChildName} to submit match reports.`
      );
      return;
    }
    if (!selectedChildPlayerId) {
      toast.error("Please select a linked child first.");
      return;
    }
    if (!newOpponent.trim()) {
      toast.error("Please enter opponent team name.");
      return;
    }
    if (!newDate) {
      toast.error("Please select match date.");
      return;
    }
    if (activeEvents.length === 0) {
      toast.error("Please mark at least one goal or assist on the pitch.");
      return;
    }

    const goalsCount = activeEvents.filter((ev) => ev.type === "Goal").length;
    const assistsCount = activeEvents.filter(
      (ev) => ev.type === "Assist"
    ).length;

    try {
      await createParentReport({
        childPlayerId: selectedChildPlayerId,
        opponent: newOpponent.trim(),
        opponentTeam: newOpponent.trim(),
        matchDate: newDate,
        date: newDate,
        events: activeEvents,
        goals: goalsCount,
        assists: assistsCount,
      }).unwrap();

      setNewOpponent("");
      setNewDate("");
      setActiveEvents([]);
    } catch (err: any) {
      if (err?.status === 402) {
        handle402Error(
          err,
          `Subscription required for ${activeChildName} before submitting match reports.`
        );
      }
    }
  };

  const handleRequestReview = async (reportId: string) => {
    if (!isSelectedChildUnlocked) {
      handle402Error(
        null,
        `Active Athlete subscription required for ${activeChildName} to request a coach review.`
      );
      return;
    }

    try {
      setRequestingReportId(reportId);
      const res = await requestParentReportReview({
        reportId,
        childPlayerId: selectedChildPlayerId || undefined,
      }).unwrap();

      const checkoutUrl =
        res?.data?.checkoutUrl ||
        res?.data?.checkoutSessionUrl ||
        res?.data?.url;
      if (checkoutUrl && typeof window !== "undefined") {
        window.location.assign(checkoutUrl);
      }
    } catch (err: any) {
      if (err?.status === 402) {
        handle402Error(
          err,
          `Subscription required for ${activeChildName} to request a coach review.`
        );
      }
    } finally {
      setRequestingReportId(null);
    }
  };

  const isLoading = isReportsLoading || isSubAccessLoading;

  return (
    <div className="flex flex-col gap-6 sm:gap-8 pb-8 sm:pb-12 w-full min-w-0 overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 w-full min-w-0">
        <div className="min-w-0">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase text-white font-orbitron tracking-tight leading-none truncate">
            Match <span className="text-primary italic">Reports</span>
          </h1>
          <p className="text-white/60 font-bold uppercase tracking-widest text-[9px] sm:text-[11px] mt-2 line-clamp-2 sm:line-clamp-none">
            Viewing match reports for{" "}
            <span className="text-white">{activeChildName}</span> — plot
            goals/assists on interactive pitch and request coach evaluations
          </p>
        </div>

        {isReportsFetching && !isReportsLoading && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground shrink-0">
            <IconLoader2 className="size-4 animate-spin text-primary" />
            <span>Syncing reports...</span>
          </div>
        )}
      </div>

      {/* Per-Selected-Child Locked Banner */}
      {!isSubAccessLoading && !isSelectedChildUnlocked && (
        <div className="p-4 sm:p-5 rounded-2xl bg-destructive/10 border border-destructive/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3 min-w-0">
            <div className="size-10 rounded-xl bg-destructive/15 border border-destructive/30 flex items-center justify-center text-destructive shrink-0">
              <IconLock className="size-5" />
            </div>
            <div className="flex flex-col gap-1 min-w-0">
              <h3 className="text-sm font-bold text-white uppercase font-orbitron">
                Scouting Reports &amp; Match Reports Locked for {activeChildName}
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Subscriptions are per child. Switch to{" "}
                <strong className="text-white">{activeChildName}</strong>&apos;s
                Athlete account to purchase a subscription and unlock match
                report submissions and coach evaluations for this athlete.
              </p>
            </div>
          </div>

          <Button
            type="button"
            disabled={isSwitchingProfile}
            onClick={handleSwitchAndSubscribe}
            className="bg-primary hover:bg-[#00dd00] text-black font-bold text-xs uppercase tracking-wider font-orbitron shrink-0 flex items-center gap-2 cursor-pointer"
          >
            {isSwitchingProfile ? (
              <IconLoader2 className="size-4 animate-spin" />
            ) : (
              <IconArrowRight className="size-4" />
            )}
            Unlock with Subscription
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-8 w-full min-w-0">
        {/* Plotting & Form (8 cols) */}
        <div
          className={cn(
            "lg:col-span-8 bg-[#0D0D0D]/40 border border-white/5 p-4 sm:p-8 rounded-2xl sm:rounded-3xl shadow-xl flex flex-col gap-4 sm:gap-6 min-w-0 w-full",
            !isSelectedChildUnlocked && "opacity-75"
          )}
        >
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-lg sm:text-xl font-black uppercase text-white font-orbitron truncate">
              Submit Performance Stats
            </h2>
            <Badge
              variant={isSelectedChildUnlocked ? "default" : "destructive"}
              className="text-[10px] font-orbitron uppercase shrink-0"
            >
              {isSelectedChildUnlocked ? activeChildName : "Locked"}
            </Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 w-full min-w-0">
            <div className="flex flex-col gap-1.5 w-full min-w-0">
              <label className="text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1 truncate block">
                Opponent Team
              </label>
              <input
                type="text"
                disabled={!isSelectedChildUnlocked || isCreatingReport}
                placeholder="e.g. Palmeiras U17"
                value={newOpponent}
                onChange={(e) => setNewOpponent(e.target.value)}
                className="w-full px-3 py-2.5 sm:px-4 sm:py-3 rounded-lg sm:rounded-xl border border-white/5 bg-black/40 text-white placeholder:text-gray-600 focus:outline-none focus:border-primary/50 transition-all text-xs sm:text-sm min-w-0 disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            <div className="flex flex-col gap-1.5 w-full min-w-0">
              <label className="text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1 truncate block">
                Match Date
              </label>
              <input
                type="date"
                disabled={!isSelectedChildUnlocked || isCreatingReport}
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                className="w-full px-3 py-2.5 sm:px-4 sm:py-3 rounded-lg sm:rounded-xl border border-white/5 bg-black/40 text-white focus:outline-none focus:border-primary/50 transition-all text-xs sm:text-sm scheme-dark min-w-0 disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
          </div>

          {/* Interactive Pitch */}
          <div className="flex flex-col gap-3 w-full min-w-0">
            <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center gap-3 w-full min-w-0">
              <span className="text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1 truncate">
                Mark Event (Click to plot)
              </span>
              <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  disabled={!isSelectedChildUnlocked}
                  onClick={() => setEventType("Goal")}
                  className={cn(
                    "flex-1 sm:flex-none px-3 py-1.5 sm:py-2 rounded-lg text-[9px] sm:text-[10px] font-bold uppercase transition-all border whitespace-nowrap cursor-pointer disabled:opacity-50",
                    eventType === "Goal"
                      ? "bg-red-600 border-red-600 text-white"
                      : "bg-white/5 border-white/10 text-gray-400"
                  )}
                >
                  Goal Spot
                </button>
                <button
                  type="button"
                  disabled={!isSelectedChildUnlocked}
                  onClick={() => setEventType("Assist")}
                  className={cn(
                    "flex-1 sm:flex-none px-3 py-1.5 sm:py-2 rounded-lg text-[9px] sm:text-[10px] font-bold uppercase transition-all border whitespace-nowrap cursor-pointer disabled:opacity-50",
                    eventType === "Assist"
                      ? "bg-blue-600 border-blue-600 text-white"
                      : "bg-white/5 border-white/10 text-gray-400"
                  )}
                >
                  Assist Spot
                </button>
                <button
                  type="button"
                  disabled={!isSelectedChildUnlocked || activeEvents.length === 0}
                  onClick={clearEvents}
                  className="flex-1 sm:flex-none px-3 py-1.5 sm:py-2 rounded-lg text-[9px] sm:text-[10px] font-bold uppercase bg-white/5 border border-white/10 text-gray-400 hover:text-white whitespace-nowrap cursor-pointer disabled:opacity-50"
                >
                  Clear
                </button>
              </div>
            </div>

            {/* Soccer Pitch Canvas */}
            <div
              ref={pitchRef}
              onClick={handlePitchClick}
              className={cn(
                "relative w-full aspect-2/1 rounded-xl sm:rounded-2xl bg-linear-to-br from-green-900 to-emerald-950 border border-white/10 overflow-hidden flex items-center justify-center select-none shadow-inner",
                isSelectedChildUnlocked ? "cursor-crosshair" : "cursor-not-allowed"
              )}
            >
              {/* Pitch Markings */}
              <div className="absolute inset-2 sm:inset-4 border-2 border-white/20 pointer-events-none" />
              <div className="absolute left-1/2 top-2 bottom-2 sm:top-4 sm:bottom-4 border-l-2 border-white/20 pointer-events-none" />
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 size-12 sm:size-24 border-2 border-white/20 rounded-full pointer-events-none" />
              <div className="absolute left-2 sm:left-4 top-1/4 bottom-1/4 w-8 sm:w-16 border-2 border-l-0 border-white/20 pointer-events-none" />
              <div className="absolute right-2 sm:right-4 top-1/4 bottom-1/4 w-8 sm:w-16 border-2 border-r-0 border-white/20 pointer-events-none" />

              {/* Plotted Event Pins */}
              {activeEvents.map((ev, idx) => (
                <div
                  key={idx}
                  style={{ left: `${ev.x}%`, top: `${ev.y}%` }}
                  className={cn(
                    "absolute -translate-x-1/2 -translate-y-1/2 size-3 sm:size-4 rounded-full flex items-center justify-center text-[6px] sm:text-[8px] font-black text-white shadow-lg pointer-events-none",
                    ev.type === "Goal"
                      ? "bg-red-500 shadow-red-500/50"
                      : "bg-blue-500 shadow-blue-500/50"
                  )}
                >
                  {ev.type[0]}
                </div>
              ))}
            </div>
          </div>

          <Button
            type="button"
            disabled={isCreatingReport || isSwitchingProfile}
            onClick={
              isSelectedChildUnlocked
                ? handleCreateReport
                : handleSwitchAndSubscribe
            }
            className="w-full bg-[#E31B23] hover:bg-[#C2181F] text-white py-4 sm:py-6 rounded-lg sm:rounded-xl font-bold text-[10px] sm:text-xs uppercase tracking-widest shadow-lg shadow-[#E31B23]/20 flex items-center justify-center gap-2 cursor-pointer"
          >
            {isCreatingReport || isSwitchingProfile ? (
              <IconLoader2 className="size-4 animate-spin" />
            ) : !isSelectedChildUnlocked ? (
              <IconLock size={14} />
            ) : null}
            <span>
              {isSelectedChildUnlocked
                ? isCreatingReport
                  ? "Submitting Report..."
                  : "Save Report Details"
                : `Unlock Match Reports for ${activeChildName}`}
            </span>
          </Button>
        </div>

        {/* Existing Reports list (4 cols) */}
        <div className="lg:col-span-4 bg-[#0D0D0D]/40 border border-white/5 p-4 sm:p-8 rounded-2xl sm:rounded-3xl shadow-xl flex flex-col gap-4 sm:gap-6 min-w-0 w-full">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-lg sm:text-xl font-black uppercase text-white font-orbitron truncate">
              Match History
            </h2>
            <Badge
              variant="outline"
              className="border-white/10 text-muted-foreground font-orbitron text-[10px] shrink-0"
            >
              {reports.length}
            </Badge>
          </div>

          {isLoading ? (
            <div className="flex flex-col gap-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="p-4 rounded-2xl bg-black/40 border border-white/5 flex flex-col gap-3"
                >
                  <Skeleton className="h-4 w-36 bg-white/10" />
                  <Skeleton className="h-3 w-24 bg-white/5" />
                  <Skeleton className="h-8 w-full bg-white/10 rounded-xl" />
                </div>
              ))}
            </div>
          ) : isReportsError ? (
            <div className="p-6 rounded-2xl bg-destructive/10 border border-destructive/20 text-center flex flex-col items-center gap-3">
              <IconAlertCircle className="size-7 text-destructive" />
              <p className="text-xs text-destructive font-medium">
                Failed to load match reports for {activeChildName}.
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => refetchReports()}
                className="border-destructive/30 text-destructive hover:bg-destructive/10"
              >
                <IconRefresh className="size-4 mr-1.5" />
                Retry
              </Button>
            </div>
          ) : reports.length === 0 ? (
            <div className="p-8 rounded-2xl border border-dashed border-white/10 text-center flex flex-col items-center justify-center gap-2">
              <div className="size-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-muted-foreground">
                <IconReportAnalytics className="size-6" />
              </div>
              <p className="text-sm font-bold text-white uppercase font-orbitron">
                No Match Reports Yet
              </p>
              <p className="text-xs text-muted-foreground">
                Match reports submitted for {activeChildName} will appear here.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {reports.map((report) => {
                const reportId = report._id || report.id || "";
                const statusLabel = normalizeReportStatus(report);
                const opponentLabel =
                  report.opponent ||
                  report.opponentTeam ||
                  report.awayTeam ||
                  report.title ||
                  "Match Report";
                const ratingVal = Number(
                  report.scoutRating ?? report.rating ?? 0
                );
                const eventsList =
                  report.events || report.plottedEvents || [];
                const amountDisplay =
                  typeof report.amount === "string"
                    ? report.amount
                    : typeof report.amountNumber === "number"
                      ? `$${report.amountNumber.toFixed(2)}`
                      : typeof report.amount === "number"
                        ? `$${report.amount.toFixed(2)}`
                        : "";

                return (
                  <div
                    key={reportId}
                    className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-black/40 border border-white/5 flex flex-col gap-3 hover:border-white/10 transition-all w-full min-w-0"
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div className="min-w-0">
                        <h3 className="text-xs sm:text-sm font-bold text-white truncate">
                          {opponentLabel.toLowerCase().startsWith("vs ")
                            ? opponentLabel
                            : `vs ${opponentLabel}`}
                        </h3>
                        <span className="text-[9px] sm:text-[10px] text-gray-500 font-bold block truncate">
                          {formatDisplayDate(
                            report.matchDate || report.date || report.createdAt
                          )}
                        </span>
                      </div>
                      <Badge
                        className={cn(
                          "text-[8px] sm:text-[9px] font-bold shrink-0",
                          statusLabel === "Verified"
                            ? "bg-green-500/10 border-green-500/30 text-green-400"
                            : statusLabel === "Paid"
                              ? "bg-blue-500/10 border-blue-500/30 text-blue-400"
                              : "bg-yellow-500/10 border-yellow-500/30 text-yellow-400"
                        )}
                      >
                        {statusLabel}
                      </Badge>
                    </div>

                    <div className="flex justify-between items-center text-[10px] sm:text-xs text-gray-400">
                      <span className="truncate">
                        Rating:{" "}
                        <strong className="text-white font-medium">
                          {ratingVal > 0 ? `${ratingVal.toFixed(1)}/10` : "N/A"}
                        </strong>
                      </span>
                      <span className="truncate ml-2">
                        Plotted:{" "}
                        <strong className="text-white font-medium">
                          {eventsList.length}
                        </strong>
                      </span>
                    </div>

                    {statusLabel === "Pending" && (
                      <button
                        type="button"
                        disabled={
                          isRequestingReview && requestingReportId === reportId
                        }
                        onClick={() => handleRequestReview(reportId)}
                        className="w-full py-2 sm:py-2.5 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-lg sm:rounded-xl text-[9px] sm:text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all truncate px-2 cursor-pointer disabled:opacity-50"
                      >
                        {isRequestingReview &&
                        requestingReportId === reportId ? (
                          <IconLoader2 size={14} className="animate-spin shrink-0" />
                        ) : !isSelectedChildUnlocked ? (
                          <IconLock size={14} className="text-destructive shrink-0" />
                        ) : (
                          <IconCreditCard size={14} className="shrink-0" />
                        )}
                        <span className="truncate">
                          Request Review{amountDisplay ? ` (${amountDisplay})` : ""}
                        </span>
                      </button>
                    )}

                    {statusLabel === "Paid" && (
                      <div className="text-[9px] sm:text-[10px] text-gray-500 font-bold uppercase text-center flex items-center justify-center gap-1 truncate px-2">
                        <IconClock size={12} className="shrink-0" />{" "}
                        <span className="truncate">Awaiting Validation</span>
                      </div>
                    )}

                    {statusLabel === "Verified" && (
                      <div className="text-[9px] sm:text-[10px] text-green-400 font-bold uppercase text-center flex items-center justify-center gap-1 truncate px-2">
                        <IconCircleCheck size={12} className="shrink-0" />{" "}
                        <span className="truncate">Coach Evaluated</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* HTTP 402 Payment Required Modal */}
      <Dialog
        open={paymentRequiredModal.open}
        onOpenChange={(open) =>
          setPaymentRequiredModal((prev) => ({ ...prev, open }))
        }
      >
        <DialogContent className="sm:max-w-md bg-[#0D0D0D] border-white/10 text-white">
          <DialogHeader>
            <DialogTitle className="font-orbitron text-lg uppercase tracking-wide flex items-center gap-2">
              <IconLock className="size-5 text-destructive shrink-0" />
              Subscription Required
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground leading-relaxed pt-1">
              {paymentRequiredModal.message ||
                `An active Athlete subscription is required on ${activeChildName}'s account to perform this action.`}
            </DialogDescription>
          </DialogHeader>

          <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 text-xs text-muted-foreground">
            Subscriptions are purchased per child on each child&apos;s Athlete
            account. Switch directly to{" "}
            <strong className="text-white">{activeChildName}</strong>&apos;s
            subscription page to activate their plan.
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                setPaymentRequiredModal({ open: false, message: "" })
              }
              className="border-white/10 hover:bg-white/5"
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={isSwitchingProfile}
              onClick={handleSwitchAndSubscribe}
              className="bg-primary hover:bg-[#00dd00] text-black font-bold font-orbitron text-xs uppercase tracking-wider flex items-center gap-1.5"
            >
              {isSwitchingProfile ? (
                <IconLoader2 className="size-4 animate-spin" />
              ) : (
                <IconArrowRight className="size-4" />
              )}
              Switch &amp; Subscribe ({activeChildName})
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ParentGameReports;
