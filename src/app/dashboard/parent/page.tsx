"use client";

import Image from "next/image";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  IconUsers,
  IconCalendar,
  IconCreditCard,
  IconReportAnalytics,
  IconArrowRight,
  IconMessage2,
  IconCheck,
  IconX,
  IconAlertTriangle,
  IconRefresh,
  IconClock,
  IconLock,
  IconLoader2,
} from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  useGetParentOverviewQuery,
  useSubmitSessionRsvpMutation,
} from "@/redux/features/parent/parentApi";
import { useParentDashboard } from "@/providers/ParentDashboardProvider";
import { cn } from "@/lib/utils";

const getTierBadgeStyle = (tier?: string) => {
  const t = (tier || "BRONZE").toUpperCase();
  switch (t) {
    case "GOLD":
      return "bg-yellow-500/10 border-yellow-500/30 text-yellow-400";
    case "SILVER":
      return "bg-slate-300/10 border-slate-300/30 text-slate-300";
    case "BRONZE":
    default:
      return "bg-amber-600/10 border-amber-600/30 text-amber-500";
  }
};

const normalizeRsvpUiStatus = (
  status?: string
): "Pending" | "Attending" | "Declined" => {
  const s = (status || "").toUpperCase();
  if (s === "CONFIRMED" || s === "ATTENDING") return "Attending";
  if (s === "DECLINED") return "Declined";
  return "Pending";
};

const ParentDashboardOverview = () => {
  const router = useRouter();
  const {
    selectedChildPlayerId,
    selectedChild,
    switchToChildAccount,
    isSwitchingProfile,
  } = useParentDashboard();

  // Query: GET {{baseUrl}}/parents/overview?childPlayerId=<selectedChildPlayerId>
  const {
    data: overviewResponse,
    currentData: currentOverviewResponse,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useGetParentOverviewQuery(
    selectedChildPlayerId
      ? { childPlayerId: selectedChildPlayerId }
      : undefined
  );

  const overviewData = currentOverviewResponse?.data ?? overviewResponse?.data;
  const scopedOverviewData = currentOverviewResponse?.data;
  const stats = overviewData?.stats;
  const youthProfile = overviewData?.youthProfile;
  const trainingRsvp = overviewData?.trainingRsvp || [];
  const recentActivity = overviewData?.recentActivity || [];
  const overviewChildren = overviewData?.children || [];

  // Per-selected-child gating rule (strictly scoped to the currently selected child;
  // uses currentData so switching from Child A -> Child B never flashes Child A's unlock state)
  const isSelectedChildUnlocked = Boolean(
    scopedOverviewData?.youthProfile?.hasActiveSubscription ??
      scopedOverviewData?.subscriptionSummary?.activeChildHasSubscription ??
      selectedChild?.hasActiveSubscription
  );

  const activeChildName =
    youthProfile?.fullName || selectedChild?.fullName || "Selected Athlete";
  const activeChildUserId =
    youthProfile?.childUserId || selectedChild?.childUserId || "";
  const activePlanTitle =
    youthProfile?.currentSubscription?.planTitle ||
    selectedChild?.currentSubscription?.planTitle;

  const [rsvpStatus, setRsvpStatus] = useState<
    "Pending" | "Attending" | "Declined"
  >("Pending");

  useEffect(() => {
    const first = trainingRsvp[0];
    setRsvpStatus(normalizeRsvpUiStatus(first?.rsvpStatus || first?.status));
  }, [selectedChildPlayerId, trainingRsvp]);

  const [submitRsvp, { isLoading: isSubmittingRsvp }] =
    useSubmitSessionRsvpMutation();

  const handleUnlockSelectedChild = async () => {
    await switchToChildAccount(
      activeChildUserId || undefined,
      "/dashboard/player/my-subscription"
    );
  };

  const handleRsvp = async (status: "Attending" | "Declined") => {
    setRsvpStatus(status);
    const targetSession = trainingRsvp[0];
    const sessionId = (targetSession?._id || targetSession?.id) as
      | string
      | undefined;
    const childPlayerId = (selectedChildPlayerId ||
      youthProfile?.childPlayerId ||
      youthProfile?._id ||
      youthProfile?.id ||
      overviewChildren[0]?.childPlayerId ||
      overviewChildren[0]?.id) as string | undefined;

    if (sessionId && childPlayerId) {
      try {
        await submitRsvp({
          sessionId,
          childPlayerId,
          rsvpStatus: status === "Attending" ? "CONFIRMED" : "DECLINED",
          notes:
            status === "Attending"
              ? "Will attend session on time"
              : "Cannot attend session",
        }).unwrap();
      } catch {
        // Error toast handled by RTK mutation onQueryStarted
      }
    } else {
      toast.success(
        `RSVP updated: ${activeChildName} is marked as ${status.toLowerCase()}`
      );
    }
  };

  return (
    <div className="flex flex-col gap-8 pb-24 md:pb-12 min-w-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase text-white font-orbitron tracking-tight leading-none">
            Guardian <span className="text-[#00FF62] italic">Overview</span>
          </h1>
          <p className="text-white/60 font-bold uppercase tracking-widest text-[9px] md:text-[11px] mt-2 leading-relaxed">
            Monitor {activeChildName}&apos;s football development and manage academy services
          </p>
        </div>

        {isFetching && !isLoading && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <IconLoader2 className="size-4 animate-spin text-primary" />
            <span>Updating child data...</span>
          </div>
        )}
      </div>

      {/* Loading Skeleton */}
      {isLoading ? (
        <div className="flex flex-col gap-8 animate-pulse">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="bg-[#0D0D0D]/60 border border-white/10 p-5 md:p-6 rounded-2xl flex items-center gap-4"
              >
                <div className="size-12 rounded-xl bg-white/10 shrink-0" />
                <div className="flex flex-col gap-2 w-full">
                  <div className="h-3 w-20 rounded bg-white/5" />
                  <div className="h-6 w-28 rounded bg-white/10" />
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 flex flex-col gap-6">
              <div className="h-56 rounded-3xl bg-[#0D0D0D]/60 border border-white/10" />
              <div className="h-64 rounded-3xl bg-[#0D0D0D]/60 border border-white/10" />
            </div>
            <div className="flex flex-col gap-6">
              <div className="h-60 rounded-3xl bg-[#0D0D0D]/60 border border-white/10" />
              <div className="h-52 rounded-3xl bg-[#0D0D0D]/60 border border-white/10" />
            </div>
          </div>
        </div>
      ) : isError ? (
        <div className="py-16 text-center flex flex-col items-center justify-center gap-3 border border-white/10 rounded-2xl bg-white/2">
          <IconAlertTriangle className="size-8 text-destructive" />
          <p className="text-sm font-bold text-destructive">
            Failed to load parent overview dashboard
          </p>
          <Button
            type="button"
            onClick={() => refetch()}
            variant="outline"
            className="mt-2 bg-white/5 border-white/10 text-white hover:bg-white/10 rounded-xl"
          >
            <IconRefresh size={14} className="mr-2" />
            Retry
          </Button>
        </div>
      ) : (
        <>
          {/* Stats Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Children Card */}
            <div className="bg-[#0D0D0D]/60 border border-white/10 p-5 md:p-6 rounded-2xl flex items-center gap-4 md:gap-5 hover:border-white/20 transition-all">
              <div className="size-10 md:size-12 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 shrink-0">
                <IconUsers className="size-5 md:size-6" />
              </div>
              <div className="min-w-0">
                <span className="text-[9px] md:text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em] truncate block font-orbitron">
                  Children
                </span>
                <p className="text-xl md:text-2xl font-black text-white font-orbitron mt-0.5 truncate">
                  {stats?.children?.formatted || "1 Player"}
                </p>
              </div>
            </div>

            {/* Next Training Card */}
            <div className="bg-[#0D0D0D]/60 border border-white/10 p-5 md:p-6 rounded-2xl flex items-center gap-4 md:gap-5 hover:border-white/20 transition-all">
              <div className="size-10 md:size-12 rounded-xl bg-green-500/10 flex items-center justify-center text-green-400 shrink-0">
                <IconCalendar className="size-5 md:size-6" />
              </div>
              <div className="min-w-0">
                <span className="text-[9px] md:text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em] truncate block font-orbitron">
                  Next Session
                </span>
                <p className="text-sm font-bold text-white mt-1 truncate">
                  {stats?.nextSession?.formatted || "None"}
                </p>
              </div>
            </div>

            {/* Pending Fees Card */}
            <div className="bg-[#0D0D0D]/60 border border-white/10 p-5 md:p-6 rounded-2xl flex items-center gap-4 md:gap-5 hover:border-white/20 transition-all">
              <div className="size-10 md:size-12 rounded-xl bg-yellow-500/10 flex items-center justify-center text-yellow-400 shrink-0">
                <IconCreditCard className="size-5 md:size-6" />
              </div>
              <div className="min-w-0">
                <span className="text-[9px] md:text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em] truncate block font-orbitron">
                  Pending Fees
                </span>
                <p className="text-xl md:text-2xl font-black text-white font-orbitron mt-0.5 truncate">
                  {stats?.pendingFees?.formatted || "$0.00"}
                </p>
              </div>
            </div>

            {/* Match Reports Card */}
            <div className="bg-[#0D0D0D]/60 border border-white/10 p-5 md:p-6 rounded-2xl flex items-center gap-4 md:gap-5 hover:border-white/20 transition-all">
              <div className="size-10 md:size-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 shrink-0">
                <IconReportAnalytics className="size-5 md:size-6" />
              </div>
              <div className="min-w-0">
                <span className="text-[9px] md:text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em] truncate block font-orbitron">
                  Active Reports
                </span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <p className="text-xl md:text-2xl font-black text-white font-orbitron truncate">
                    {stats?.activeReports?.formatted || "0 Pending"}
                  </p>
                  {!isSelectedChildUnlocked && (
                    <span className="text-[9px] font-bold text-destructive bg-destructive/10 px-1.5 py-0.5 rounded border border-destructive/20 font-orbitron">
                      LOCKED
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Child Profile Preview & Activity */}
            <div className="lg:col-span-2 flex flex-col gap-6 min-w-0">
              {/* Youth Profile Card */}
              <div className="bg-[#0D0D0D]/60 border border-white/10 p-6 md:p-8 rounded-3xl shadow-xl flex flex-col gap-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
                  <h2 className="text-lg sm:text-xl font-black uppercase text-white font-orbitron tracking-wide">
                    Youth Profile
                  </h2>
                  <Link href="/dashboard/parent/profiles" className="shrink-0">
                    <span className="text-[10px] sm:text-xs font-bold text-[#00FF62] flex items-center gap-1 hover:underline cursor-pointer uppercase tracking-wider whitespace-nowrap">
                      Manage Profile <IconArrowRight size={14} className="shrink-0" />
                    </span>
                  </Link>
                </div>

                {/* Per-Selected-Child Subscription Access Banner (only shown when NOT subscribed) */}
                {!isSelectedChildUnlocked && (
                  <div className="p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2 text-destructive font-medium min-w-0">
                      <IconLock size={16} className="shrink-0" />
                      <span>
                        Scouting Reports &amp; Match Reports Locked for{" "}
                        <strong>{activeChildName}</strong>
                      </span>
                    </div>
                    <button
                      type="button"
                      disabled={isSwitchingProfile}
                      onClick={handleUnlockSelectedChild}
                      className="text-[10px] font-bold text-white underline uppercase tracking-wider font-orbitron hover:text-primary transition-colors cursor-pointer shrink-0 flex items-center gap-1.5 disabled:opacity-60"
                    >
                      {isSwitchingProfile && (
                        <IconLoader2 className="size-3.5 animate-spin" />
                      )}
                      Unlock with Subscription
                    </button>
                  </div>
                )}

                {/* Profile Info Row */}
                <div className="flex flex-col sm:flex-row items-center gap-6 p-6 rounded-2xl bg-black/40 border border-white/5">
                  <div className="relative size-20 sm:size-24 rounded-full overflow-hidden border-2 border-[#00FF62]/30 bg-black/60 shrink-0 flex items-center justify-center">
                    <Image
                      src={
                        youthProfile?.profileImage ||
                        selectedChild?.profileImage ||
                        "/placeholder_img.jpg"
                      }
                      alt={activeChildName}
                      fill
                      sizes="96px"
                      unoptimized
                      className="object-contain p-1"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src =
                          "/placeholder_img.jpg";
                      }}
                    />
                  </div>

                  <div className="flex-1 text-center sm:text-left flex flex-col gap-1.5 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <h3 className="text-lg font-bold text-white font-orbitron truncate">
                        {activeChildName}
                      </h3>
                      <Badge
                        className={cn(
                          "w-fit mx-auto sm:mx-0 font-bold border px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-wider",
                          getTierBadgeStyle(
                            youthProfile?.tier || selectedChild?.cvTier
                          )
                        )}
                      >
                        {youthProfile?.tierBadge ||
                          `${youthProfile?.tier || selectedChild?.cvTier || "BRONZE"} Profile`}
                      </Badge>
                    </div>

                    <p className="text-xs text-gray-400 font-light truncate">
                      {youthProfile?.formattedSubtitle || (
                        <>
                          Position:{" "}
                          <span className="text-white font-medium">
                            {youthProfile?.position ||
                              selectedChild?.position ||
                              "Forward"}
                          </span>{" "}
                          | Academy:{" "}
                          <span className="text-white font-medium">
                            {youthProfile?.academyName ||
                              selectedChild?.academy ||
                              "Academy"}
                          </span>
                        </>
                      )}
                    </p>

                    <p className="text-xs text-gray-400 font-light truncate">
                      {youthProfile?.headCoachFormatted || (
                        <>
                          Head Coach:{" "}
                          <span className="text-white font-medium">
                            {youthProfile?.headCoachName ||
                              selectedChild?.coachName ||
                              "Unassigned"}
                          </span>
                        </>
                      )}
                    </p>
                  </div>

                  {/* Rating Circle */}
                  <div className="size-20 rounded-full border-4 border-[#00FF62]/30 flex flex-col items-center justify-center bg-black/50 shrink-0">
                    <span className="text-2xl font-black text-white font-orbitron leading-none">
                      {youthProfile?.rating ?? selectedChild?.overallRating ?? 50}
                    </span>
                    <span className="text-[8px] text-gray-500 font-bold uppercase tracking-widest mt-1">
                      Rating
                    </span>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-[#0D0D0D]/60 border border-white/10 p-6 md:p-8 rounded-3xl shadow-xl flex flex-col gap-6">
                <h2 className="text-xl font-black uppercase text-white font-orbitron tracking-wide">
                  Recent Activity
                </h2>

                {recentActivity.length > 0 ? (
                  <div className="flex flex-col gap-4">
                    {recentActivity.map((act) => {
                      return (
                        <div
                          key={act.id || act._id || act.title}
                          className="flex gap-4 p-4 rounded-xl bg-black/20 border border-white/5"
                        >
                          <div
                            className={cn(
                              "size-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0",
                              act.iconColor || "text-blue-400"
                            )}
                          >
                            <IconMessage2 size={18} />
                          </div>
                          <div className="flex-1 flex flex-col gap-1 min-w-0">
                            <div className="flex justify-between items-start gap-4">
                              <h4 className="text-sm font-bold text-white leading-none truncate">
                                {act.title}
                              </h4>
                              <span className="text-[10px] text-gray-500 font-bold shrink-0">
                                {act.time ||
                                  (act.createdAt
                                    ? new Date(act.createdAt).toLocaleDateString()
                                    : "")}
                              </span>
                            </div>
                            <p className="text-xs text-gray-400 font-light leading-relaxed">
                              {act.description}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-8 text-center border border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center gap-2">
                    <div className="size-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/30">
                      <IconClock size={24} />
                    </div>
                    <p className="text-sm font-bold text-white uppercase font-orbitron tracking-wider">
                      No Recent Activity
                    </p>
                    <p className="text-xs text-white/40 max-w-sm">
                      Evaluation summaries, fee payments, and match reports will appear here as they occur.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar Cards (RSVP, Quick Access) */}
            <div className="flex flex-col gap-6">
              {/* Training RSVP Widget */}
              <div className="bg-[#0D0D0D]/60 border border-white/10 p-6 md:p-8 rounded-3xl shadow-xl flex flex-col gap-6">
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <h2 className="text-lg font-black uppercase text-white font-orbitron tracking-wide">
                      Training RSVP
                    </h2>
                    <p className="text-xs text-gray-400 mt-1 font-light">
                      Confirm {activeChildName}&apos;s attendance for the upcoming session.
                    </p>
                  </div>
                  <Link href="/dashboard/parent/attendance" className="shrink-0">
                    <span className="text-[10px] font-bold text-[#00FF62] flex items-center gap-1 hover:underline cursor-pointer uppercase tracking-wider">
                      View All <IconArrowRight size={12} />
                    </span>
                  </Link>
                </div>

                {trainingRsvp.length > 0 ? (
                  <div className="flex flex-col gap-4">
                    {trainingRsvp.map((session, idx) => (
                      <div
                        key={session.id || session._id || idx}
                        className="p-4 rounded-xl bg-black/40 border border-white/5 flex flex-col gap-3"
                      >
                        <div className="flex items-center gap-3">
                          <IconCalendar
                            size={18}
                            className="text-[#00FF62] shrink-0"
                          />
                          <div className="min-w-0">
                            <h4 className="text-xs font-bold text-white truncate">
                              {session.title ||
                                session.sessionName ||
                                "Training Session"}
                            </h4>
                            <p className="text-[10px] text-gray-400 font-light mt-0.5 truncate">
                              {session.date ||
                                session.time ||
                                session.location ||
                                "Upcoming Session"}
                            </p>
                          </div>
                        </div>

                        <div className="flex justify-between items-center pt-2 border-t border-white/5">
                          <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                            RSVP Status
                          </span>
                          <Badge
                            className={cn(
                              "text-[9px] font-bold border",
                              normalizeRsvpUiStatus(
                                session.rsvpStatus || session.status
                              ) === "Attending"
                                ? "bg-green-500/10 border-green-500/30 text-green-400"
                                : normalizeRsvpUiStatus(
                                      session.rsvpStatus || session.status
                                    ) === "Declined"
                                  ? "bg-red-500/10 border-red-500/30 text-red-400"
                                  : "bg-yellow-500/10 border-yellow-500/30 text-yellow-400"
                            )}
                          >
                            {session.rsvpStatus || session.status || "Pending"}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-black/40 border border-white/5 flex flex-col gap-3">
                    <div className="flex items-center gap-3">
                      <IconCalendar
                        size={18}
                        className="text-[#00FF62] shrink-0"
                      />
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-white">
                          Upcoming Training Session
                        </h4>
                        <p className="text-[10px] text-gray-400 font-light mt-0.5">
                          {stats?.nextSession?.formatted !== "None"
                            ? stats?.nextSession?.formatted
                            : "No upcoming training scheduled"}
                        </p>
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-2 border-t border-white/5">
                      <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                        RSVP Status
                      </span>
                      <Badge
                        className={cn(
                          "text-[9px] font-bold border",
                          rsvpStatus === "Attending"
                            ? "bg-green-500/10 border-green-500/30 text-green-400"
                            : rsvpStatus === "Declined"
                              ? "bg-red-500/10 border-red-500/30 text-red-400"
                              : "bg-yellow-500/10 border-yellow-500/30 text-yellow-400"
                        )}
                      >
                        {rsvpStatus}
                      </Badge>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    disabled={isSubmittingRsvp}
                    onClick={() => handleRsvp("Attending")}
                    className={cn(
                      "py-3.5 rounded-xl border flex items-center justify-center gap-2 font-bold text-xs uppercase tracking-wider transition-all cursor-pointer disabled:opacity-50",
                      rsvpStatus === "Attending"
                        ? "bg-green-600 border-green-600 text-white shadow-lg shadow-green-600/10"
                        : "bg-white/5 border-white/10 text-gray-300 hover:bg-white/10"
                    )}
                  >
                    <IconCheck size={16} /> Yes
                  </button>
                  <button
                    type="button"
                    disabled={isSubmittingRsvp}
                    onClick={() => handleRsvp("Declined")}
                    className={cn(
                      "py-3.5 rounded-xl border flex items-center justify-center gap-2 font-bold text-xs uppercase tracking-wider transition-all cursor-pointer disabled:opacity-50",
                      rsvpStatus === "Declined"
                        ? "bg-red-600 border-red-600 text-white shadow-lg shadow-red-600/10"
                        : "bg-white/5 border-white/10 text-gray-300 hover:bg-white/10"
                    )}
                  >
                    <IconX size={16} /> No
                  </button>
                </div>
              </div>

              {/* Quick Access Links */}
              <div className="bg-[#0D0D0D]/60 border border-white/10 p-6 md:p-8 rounded-3xl shadow-xl flex flex-col gap-4">
                <h2 className="text-lg font-black uppercase text-white font-orbitron tracking-wide">
                  Quick Access
                </h2>
                <div className="flex flex-col gap-2">
                  <Link href="/dashboard/parent/fees">
                    <button
                      type="button"
                      className="w-full py-3.5 px-4 rounded-xl bg-white/5 border border-white/5 text-xs font-bold text-white hover:bg-white/10 hover:border-white/10 transition-all flex items-center justify-between uppercase tracking-wider cursor-pointer"
                    >
                      <span>Pay Academy Fee</span>
                      <IconArrowRight size={14} />
                    </button>
                  </Link>

                  <button
                    type="button"
                    disabled={isSwitchingProfile}
                    onClick={() => {
                      if (!isSelectedChildUnlocked) {
                        toast.error(
                          `Match Reports are locked for ${activeChildName}. Switch to ${activeChildName}'s Athlete account to subscribe.`
                        );
                        handleUnlockSelectedChild();
                        return;
                      }
                      router.push("/dashboard/parent/game-reports");
                    }}
                    className={cn(
                      "w-full py-3.5 px-4 rounded-xl border text-xs font-bold transition-all flex items-center justify-between uppercase tracking-wider cursor-pointer disabled:opacity-50",
                      isSelectedChildUnlocked
                        ? "bg-white/5 border-white/5 text-white hover:bg-white/10 hover:border-white/10"
                        : "bg-destructive/5 border-destructive/20 text-white/70 hover:bg-destructive/10"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      {!isSelectedChildUnlocked && (
                        <IconLock size={14} className="text-destructive" />
                      )}
                      <span>Submit Match Stats</span>
                    </div>
                    {isSwitchingProfile ? (
                      <IconLoader2 size={14} className="animate-spin" />
                    ) : (
                      <IconArrowRight size={14} />
                    )}
                  </button>

                  <Link href="/dashboard/parent/shop">
                    <button
                      type="button"
                      className="w-full py-3.5 px-4 rounded-xl bg-white/5 border border-white/5 text-xs font-bold text-white hover:bg-white/10 hover:border-white/10 transition-all flex items-center justify-between uppercase tracking-wider cursor-pointer"
                    >
                      <span>Shop Uniform / Kit</span>
                      <IconArrowRight size={14} />
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

    </div>
  );
};

export default ParentDashboardOverview;
