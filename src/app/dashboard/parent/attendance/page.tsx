"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  IconCalendar,
  IconClock,
  IconMapPin,
  IconCheck,
  IconX,
  IconUser,
  IconPercentage,
  IconUsers,
  IconLoader2,
  IconNotes,
  IconAlertCircle,
  IconRefresh,
} from "@tabler/icons-react";
import {
  useGetParentTrainingSessionsQuery,
  useSubmitSessionRsvpMutation,
  useGetMyChildrenQuery,
} from "@/redux/features/parent/parentApi";
import { IParentTrainingSessionItem } from "@/types/parent.type";
import { cn } from "@/lib/utils";

const formatDate = (dateStr?: string) => {
  if (!dateStr) return "TBD";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
};

const ParentAttendance = () => {
  const [selectedChildId, setSelectedChildId] = useState<string | undefined>(undefined);

  // Modal State for RSVP
  const [rsvpModal, setRsvpModal] = useState<{
    isOpen: boolean;
    session: IParentTrainingSessionItem | null;
    status: "CONFIRMED" | "DECLINED";
    notes: string;
  }>({
    isOpen: false,
    session: null,
    status: "CONFIRMED",
    notes: "",
  });

  // Query linked children
  const { data: childrenResponse } = useGetMyChildrenQuery();
  const linkedChildren = childrenResponse?.data || [];

  // Query training sessions from API
  const {
    data: sessionsResponse,
    isLoading,
    isError,
    refetch,
  } = useGetParentTrainingSessionsQuery(
    selectedChildId ? { childPlayerId: selectedChildId } : undefined
  );

  const [submitRsvp, { isLoading: isSubmittingRsvp }] = useSubmitSessionRsvpMutation();

  const sessionsData = sessionsResponse?.data;
  const stats = sessionsData?.stats;

  const upcomingSessions = useMemo(() => {
    if (sessionsData?.upcomingSessions && sessionsData.upcomingSessions.length > 0) {
      return sessionsData.upcomingSessions;
    }
    if (sessionsData?.sessions && sessionsData.sessions.length > 0 && (!sessionsData.pastSessions || sessionsData.pastSessions.length === 0)) {
      const now = new Date();
      return sessionsData.sessions.filter((s) => new Date(s.sessionDate) >= now);
    }
    return sessionsData?.upcomingSessions || [];
  }, [sessionsData]);

  const pastSessions = useMemo(() => {
    if (sessionsData?.pastSessions && sessionsData.pastSessions.length > 0) {
      return sessionsData.pastSessions;
    }
    if (sessionsData?.sessions && sessionsData.sessions.length > 0 && (!sessionsData.upcomingSessions || sessionsData.upcomingSessions.length === 0)) {
      const now = new Date();
      return sessionsData.sessions.filter((s) => new Date(s.sessionDate) < now);
    }
    return sessionsData?.pastSessions || [];
  }, [sessionsData]);

  const handleOpenRsvpModal = (session: IParentTrainingSessionItem, status: "CONFIRMED" | "DECLINED") => {
    setRsvpModal({
      isOpen: true,
      session,
      status,
      notes: status === "CONFIRMED" ? "Will attend session on time" : "Cannot attend session",
    });
  };

  const handleCloseRsvpModal = () => {
    setRsvpModal((prev) => ({ ...prev, isOpen: false, session: null }));
  };

  const handleSubmitRsvp = async () => {
    if (!rsvpModal.session) return;
    const session = rsvpModal.session;
    const sessionId = session.sessionId || session._id;
    const childPlayerId =
      session.child?.playerId ||
      selectedChildId ||
      linkedChildren[0]?.childPlayerId;

    if (!sessionId) {
      toast.error("Session ID is missing");
      return;
    }
    if (!childPlayerId) {
      toast.error("Child Player ID is required to RSVP");
      return;
    }

    try {
      await submitRsvp({
        sessionId,
        childPlayerId,
        rsvpStatus: rsvpModal.status,
        notes: rsvpModal.notes.trim() || undefined,
      }).unwrap();

      handleCloseRsvpModal();
    } catch {
      // Handled via onQueryStarted toast
    }
  };

  const getRsvpBadgeVariant = (status?: string) => {
    const s = (status || "PENDING").toUpperCase();
    if (s === "CONFIRMED" || s === "ATTENDING") {
      return {
        label: "Confirmed",
        className: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400",
      };
    }
    if (s === "DECLINED") {
      return {
        label: "Declined",
        variant: "destructive" as const,
        className: "bg-destructive/10 border-destructive/30 text-destructive",
      };
    }
    return {
      label: "Pending RSVP",
      variant: "secondary" as const,
      className: "bg-amber-500/10 border-amber-500/30 text-amber-400",
    };
  };

  const getAttendanceBadgeVariant = (status?: string) => {
    const s = (status || "UNMARKED").toUpperCase();
    if (s === "PRESENT") {
      return {
        label: "Present",
        className: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400",
      };
    }
    if (s === "ABSENT") {
      return {
        label: "Absent",
        variant: "destructive" as const,
        className: "bg-destructive/10 border-destructive/30 text-destructive",
      };
    }
    return {
      label: "Unmarked",
      variant: "secondary" as const,
      className: "bg-muted text-muted-foreground border-white/10",
    };
  };

  return (
    <div className="flex flex-col gap-8 pb-24 md:pb-12 min-w-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl md:text-5xl font-black uppercase text-white font-orbitron tracking-tight leading-none">
            Training <span className="text-primary italic">Attendance</span>
          </h1>
          <p className="text-muted-foreground font-bold uppercase tracking-widest text-[9px] md:text-[11px] mt-2 leading-relaxed">
            Monitor your child&apos;s training schedule and confirm RSVPs
          </p>
        </div>

        {/* Child Selector if multiple children */}
        {linkedChildren.length > 1 && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground font-orbitron uppercase">Athlete:</span>
            <select
              value={selectedChildId || ""}
              onChange={(e) => setSelectedChildId(e.target.value || undefined)}
              className="bg-card border border-white/10 hover:border-white/20 text-white rounded-xl px-4 py-2 text-xs font-bold font-orbitron cursor-pointer focus:outline-none focus:border-primary/50 transition-all"
            >
              <option value="">All Athletes</option>
              {linkedChildren.map((child) => (
                <option key={child.childPlayerId} value={child.childPlayerId}>
                  {child.fullName} ({child.position || "Player"})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Stats Board */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="bg-[#0D0D0D]/40 border border-white/5 p-5 md:p-6 rounded-2xl flex items-center gap-4 md:gap-5"
            >
              <Skeleton className="size-10 md:size-12 rounded-xl" />
              <div className="flex flex-col gap-2 flex-1">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-6 w-16" />
              </div>
            </div>
          ))
        ) : (
          <>
            <div className="bg-[#0D0D0D]/40 border border-white/5 p-5 md:p-6 rounded-2xl flex items-center gap-4 md:gap-5 hover:border-white/10 transition-all">
              <div className="size-10 md:size-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0">
                <IconPercentage className="size-5 md:size-6" />
              </div>
              <div className="min-w-0">
                <span className="text-[9px] md:text-[10px] text-muted-foreground font-bold uppercase tracking-[0.2em] block truncate font-orbitron">
                  Attendance Rate
                </span>
                <p className="text-xl md:text-2xl font-black text-white font-orbitron mt-0.5 truncate">
                  {stats?.attendanceRateFormatted || `${stats?.attendanceRate ?? 0}%`}
                </p>
              </div>
            </div>

            <div className="bg-[#0D0D0D]/40 border border-white/5 p-5 md:p-6 rounded-2xl flex items-center gap-4 md:gap-5 hover:border-white/10 transition-all">
              <div className="size-10 md:size-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 shrink-0">
                <IconCalendar className="size-5 md:size-6" />
              </div>
              <div className="min-w-0">
                <span className="text-[9px] md:text-[10px] text-muted-foreground font-bold uppercase tracking-[0.2em] block truncate font-orbitron">
                  Total Sessions
                </span>
                <p className="text-xl md:text-2xl font-black text-white font-orbitron mt-0.5 truncate">
                  {stats?.totalSessions ?? 0} Sessions
                </p>
              </div>
            </div>

            <div className="bg-[#0D0D0D]/40 border border-white/5 p-5 md:p-6 rounded-2xl flex items-center gap-4 md:gap-5 hover:border-white/10 transition-all">
              <div className="size-10 md:size-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0">
                <IconCheck className="size-5 md:size-6" />
              </div>
              <div className="min-w-0">
                <span className="text-[9px] md:text-[10px] text-muted-foreground font-bold uppercase tracking-[0.2em] block truncate font-orbitron">
                  Present
                </span>
                <p className="text-xl md:text-2xl font-black text-emerald-400 font-orbitron mt-0.5 truncate">
                  {stats?.present ?? 0}
                </p>
              </div>
            </div>

            <div className="bg-[#0D0D0D]/40 border border-white/5 p-5 md:p-6 rounded-2xl flex items-center gap-4 md:gap-5 hover:border-white/10 transition-all">
              <div className="size-10 md:size-12 rounded-xl bg-destructive/10 flex items-center justify-center text-destructive shrink-0">
                <IconX className="size-5 md:size-6" />
              </div>
              <div className="min-w-0">
                <span className="text-[9px] md:text-[10px] text-muted-foreground font-bold uppercase tracking-[0.2em] block truncate font-orbitron">
                  Absent
                </span>
                <p className="text-xl md:text-2xl font-black text-destructive font-orbitron mt-0.5 truncate">
                  {stats?.absent ?? 0}
                </p>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Error Retry banner */}
      {isError && (
        <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <IconAlertCircle className="size-5 text-destructive shrink-0" />
            <p className="text-xs text-destructive font-medium">
              Failed to load training sessions. Please try refreshing.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="border-destructive/30 text-destructive hover:bg-destructive/10"
          >
            <IconRefresh className="size-4" />
            Retry
          </Button>
        </div>
      )}

      {/* Sessions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Upcoming Sessions Column */}
        <div className="bg-[#0D0D0D]/40 border border-white/5 p-6 md:p-8 rounded-3xl shadow-xl flex flex-col gap-6">
          <div className="flex justify-between items-center">
            <h2 className="text-lg md:text-xl font-black uppercase text-white font-orbitron tracking-wide">
              Upcoming Sessions
            </h2>
            <Badge variant="outline" className="border-white/10 text-muted-foreground font-orbitron text-[10px]">
              {upcomingSessions.length} {upcomingSessions.length === 1 ? "Session" : "Sessions"}
            </Badge>
          </div>

          {isLoading ? (
            <div className="flex flex-col gap-4">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="p-5 rounded-2xl bg-white/5 border border-white/10 flex flex-col gap-4">
                  <div className="flex justify-between items-start">
                    <Skeleton className="h-5 w-40" />
                    <Skeleton className="h-5 w-20" />
                  </div>
                  <Skeleton className="h-4 w-60" />
                  <div className="flex gap-2 pt-2 border-t border-white/5 justify-end">
                    <Skeleton className="h-8 w-24" />
                    <Skeleton className="h-8 w-24" />
                  </div>
                </div>
              ))}
            </div>
          ) : upcomingSessions.length > 0 ? (
            <div className="flex flex-col gap-4">
              {upcomingSessions.map((sess) => {
                const sessionId = sess.sessionId || sess._id;
                const rsvpBadge = getRsvpBadgeVariant(sess.rsvpStatus || sess.rsvp?.status);
                const timeString = sess.timeRange || (sess.startTime && sess.endTime ? `${sess.startTime} - ${sess.endTime}` : sess.startTime || "TBD");
                const locationString = sess.trainingLocation || sess.location || "Academy Grounds";
                const coachString = sess.coach?.name || sess.coachName || "Head Coach";

                return (
                  <div
                    key={sessionId}
                    className="p-5 rounded-2xl bg-white/5 border border-white/10 flex flex-col gap-4 hover:border-white/20 transition-all"
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div className="min-w-0">
                        <h3 className="text-sm font-bold text-white truncate font-orbitron">
                          {sess.sessionName || sess.sessionTitle || "Training Session"}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          {sess.sessionType && (
                            <span className="text-[10px] text-primary font-bold uppercase tracking-wider truncate block">
                              {sess.sessionType}
                            </span>
                          )}
                          {sess.team?.teamName && (
                            <span className="text-[10px] text-muted-foreground truncate">
                              • {sess.team.teamName} {sess.team.ageGroup ? `(${sess.team.ageGroup})` : ""}
                            </span>
                          )}
                        </div>
                      </div>
                      <Badge className={cn("text-[9px] font-bold shrink-0 border", rsvpBadge.className)}>
                        {rsvpBadge.label}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <IconCalendar size={14} className="shrink-0 text-primary" />
                        <span className="truncate">{formatDate(sess.sessionDate)}</span>
                      </span>
                      <span className="flex items-center gap-1.5">
                        <IconClock size={14} className="shrink-0 text-primary" />
                        <span className="truncate">{timeString}</span>
                      </span>
                      <span className="flex items-center gap-1.5">
                        <IconMapPin size={14} className="shrink-0 text-primary" />
                        <span className="truncate">{locationString}</span>
                      </span>
                      <span className="flex items-center gap-1.5">
                        <IconUser size={14} className="shrink-0 text-primary" />
                        <span className="truncate">Coach: {coachString}</span>
                      </span>
                    </div>

                    {/* Child info if available */}
                    {sess.child?.fullName && (
                      <div className="flex items-center gap-2 pt-2 border-t border-white/5 text-[11px] text-muted-foreground">
                        <div className="relative size-5 rounded-full overflow-hidden bg-white/10 shrink-0">
                          {sess.child.avatar ? (
                            <Image
                              src={sess.child.avatar}
                              alt={sess.child.fullName}
                              fill
                              sizes="20px"
                              className="object-cover"
                            />
                          ) : (
                            <IconUser size={12} className="m-auto text-muted-foreground" />
                          )}
                        </div>
                        <span className="text-white font-medium truncate">{sess.child.fullName}</span>
                        {sess.child.position && (
                          <span className="text-[10px] text-muted-foreground">({sess.child.position})</span>
                        )}
                      </div>
                    )}

                    {/* Notes if previously entered */}
                    {sess.rsvp?.notes && (
                      <div className="p-2.5 rounded-lg bg-black/30 border border-white/5 text-[11px] text-muted-foreground flex items-start gap-2">
                        <IconNotes size={14} className="shrink-0 mt-0.5 text-primary" />
                        <p className="italic leading-snug line-clamp-2">&ldquo;{sess.rsvp.notes}&rdquo;</p>
                      </div>
                    )}

                    {/* RSVP Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-2 pt-3 border-t border-white/5 sm:justify-end">
                      <Button
                        size="sm"
                        variant={sess.rsvpStatus === "CONFIRMED" ? "default" : "outline"}
                        onClick={() => handleOpenRsvpModal(sess, "CONFIRMED")}
                        className={cn(
                          "text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 w-full sm:w-auto h-9",
                          sess.rsvpStatus === "CONFIRMED"
                            ? "bg-emerald-600 hover:bg-emerald-700 text-white border-transparent"
                            : "border-white/10 hover:border-emerald-500/50 hover:text-emerald-400"
                        )}
                      >
                        <IconCheck size={14} /> Confirm Attendance
                      </Button>
                      <Button
                        size="sm"
                        variant={sess.rsvpStatus === "DECLINED" ? "destructive" : "outline"}
                        onClick={() => handleOpenRsvpModal(sess, "DECLINED")}
                        className={cn(
                          "text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 w-full sm:w-auto h-9",
                          sess.rsvpStatus === "DECLINED"
                            ? "bg-destructive text-white border-transparent"
                            : "border-white/10 hover:border-destructive/50 hover:text-destructive"
                        )}
                      >
                        <IconX size={14} /> Decline
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-8 text-center border border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center gap-2">
              <div className="size-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-muted-foreground">
                <IconCalendar size={24} />
              </div>
              <p className="text-sm font-bold text-white uppercase font-orbitron tracking-wider">
                No Upcoming Sessions
              </p>
              <p className="text-xs text-muted-foreground max-w-sm">
                There are currently no upcoming training sessions scheduled. Check back soon for updates.
              </p>
            </div>
          )}
        </div>

        {/* Past Sessions Column */}
        <div className="bg-[#0D0D0D]/40 border border-white/5 p-6 md:p-8 rounded-3xl shadow-xl flex flex-col gap-6">
          <div className="flex justify-between items-center">
            <h2 className="text-lg md:text-xl font-black uppercase text-white font-orbitron tracking-wide">
              Past Sessions
            </h2>
            <Badge variant="outline" className="border-white/10 text-muted-foreground font-orbitron text-[10px]">
              {pastSessions.length} {pastSessions.length === 1 ? "Session" : "Sessions"}
            </Badge>
          </div>

          {isLoading ? (
            <div className="flex flex-col gap-4">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="p-5 rounded-2xl bg-white/5 border border-white/10 flex flex-col gap-3">
                  <div className="flex justify-between items-start">
                    <Skeleton className="h-5 w-40" />
                    <Skeleton className="h-5 w-20" />
                  </div>
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-4 w-32" />
                </div>
              ))}
            </div>
          ) : pastSessions.length > 0 ? (
            <div className="flex flex-col gap-4">
              {pastSessions.map((sess) => {
                const sessionId = sess.sessionId || sess._id;
                const attendanceBadge = getAttendanceBadgeVariant(
                  sess.attendanceStatus || sess.actualAttendance?.status
                );
                const rsvpBadge = getRsvpBadgeVariant(sess.rsvpStatus || sess.rsvp?.status);
                const timeString = sess.timeRange || (sess.startTime && sess.endTime ? `${sess.startTime} - ${sess.endTime}` : sess.startTime || "TBD");
                const locationString = sess.trainingLocation || sess.location || "Academy Grounds";
                const coachString = sess.coach?.name || sess.coachName || "Head Coach";

                return (
                  <div
                    key={sessionId}
                    className="p-5 rounded-2xl bg-white/5 border border-white/10 flex flex-col gap-3 hover:border-white/20 transition-all"
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div className="min-w-0">
                        <h3 className="text-sm font-bold text-white truncate font-orbitron">
                          {sess.sessionName || sess.sessionTitle || "Training Session"}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] text-muted-foreground font-bold">
                            {formatDate(sess.sessionDate)}
                          </span>
                          {sess.team?.teamName && (
                            <span className="text-[10px] text-muted-foreground truncate">
                              • {sess.team.teamName}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge className={cn("text-[9px] font-bold border", attendanceBadge.className)}>
                          {attendanceBadge.label}
                        </Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <IconClock size={14} className="shrink-0 text-primary" />
                        <span className="truncate">{timeString}</span>
                      </span>
                      <span className="flex items-center gap-1.5">
                        <IconMapPin size={14} className="shrink-0 text-primary" />
                        <span className="truncate">{locationString}</span>
                      </span>
                      <span className="flex items-center gap-1.5 sm:col-span-2">
                        <IconUser size={14} className="shrink-0 text-primary" />
                        <span className="truncate">Coach: {coachString}</span>
                      </span>
                    </div>

                    {/* Child info if available */}
                    {sess.child?.fullName && (
                      <div className="flex items-center gap-2 pt-2 border-t border-white/5 text-[11px] text-muted-foreground">
                        <div className="relative size-5 rounded-full overflow-hidden bg-white/10 shrink-0">
                          {sess.child.avatar ? (
                            <Image
                              src={sess.child.avatar}
                              alt={sess.child.fullName}
                              fill
                              sizes="20px"
                              className="object-cover"
                            />
                          ) : (
                            <IconUser size={12} className="m-auto text-muted-foreground" />
                          )}
                        </div>
                        <span className="text-white font-medium truncate">{sess.child.fullName}</span>
                        {sess.child.position && (
                          <span className="text-[10px] text-muted-foreground">({sess.child.position})</span>
                        )}
                      </div>
                    )}

                    {/* Notes if previously entered */}
                    {sess.rsvp?.notes && (
                      <div className="p-2.5 rounded-lg bg-black/30 border border-white/5 text-[11px] text-muted-foreground flex items-start gap-2">
                        <IconNotes size={14} className="shrink-0 mt-0.5 text-primary" />
                        <p className="italic leading-snug line-clamp-2">&ldquo;{sess.rsvp.notes}&rdquo;</p>
                      </div>
                    )}

                    {/* RSVP Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-2 pt-3 border-t border-white/5 sm:justify-end items-stretch sm:items-center">
                      <div className="text-[10px] text-muted-foreground font-orbitron uppercase mr-auto mb-1 sm:mb-0">
                        Parent RSVP: <span className="text-white font-bold">{rsvpBadge.label}</span>
                      </div>
                      <Button
                        size="sm"
                        variant={sess.rsvpStatus === "CONFIRMED" ? "default" : "outline"}
                        onClick={() => handleOpenRsvpModal(sess, "CONFIRMED")}
                        className={cn(
                          "text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 w-full sm:w-auto h-8",
                          sess.rsvpStatus === "CONFIRMED"
                            ? "bg-emerald-600 hover:bg-emerald-700 text-white border-transparent"
                            : "border-white/10 hover:border-emerald-500/50 hover:text-emerald-400"
                        )}
                      >
                        <IconCheck size={14} /> Confirm Attendance
                      </Button>
                      <Button
                        size="sm"
                        variant={sess.rsvpStatus === "DECLINED" ? "destructive" : "outline"}
                        onClick={() => handleOpenRsvpModal(sess, "DECLINED")}
                        className={cn(
                          "text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 w-full sm:w-auto h-8",
                          sess.rsvpStatus === "DECLINED"
                            ? "bg-destructive text-white border-transparent"
                            : "border-white/10 hover:border-destructive/50 hover:text-destructive"
                        )}
                      >
                        <IconX size={14} /> Decline
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-8 text-center border border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center gap-2">
              <div className="size-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-muted-foreground">
                <IconClock size={24} />
              </div>
              <p className="text-sm font-bold text-white uppercase font-orbitron tracking-wider">
                No Past Sessions
              </p>
              <p className="text-xs text-muted-foreground max-w-sm">
                Completed training sessions and attendance records will be displayed here.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* RSVP Submission Dialog */}
      <Dialog open={rsvpModal.isOpen} onOpenChange={(open) => !open && handleCloseRsvpModal()}>
        <DialogContent className="sm:max-w-md bg-[#0D0D0D] border-white/10 text-white">
          <DialogHeader>
            <DialogTitle className="font-orbitron text-xl uppercase tracking-wide">
              {rsvpModal.status === "CONFIRMED" ? "Confirm Attendance" : "Decline Attendance"}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Please review the session details and submit your RSVP.
            </DialogDescription>
          </DialogHeader>

          {rsvpModal.session && (
            <div className="flex flex-col gap-4 py-2">
              {/* Session Summary Card */}
              <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 flex flex-col gap-1.5 text-xs">
                <h4 className="font-bold text-white font-orbitron text-sm">
                  {rsvpModal.session.sessionName || rsvpModal.session.sessionTitle}
                </h4>
                <div className="flex items-center gap-2 text-muted-foreground text-[11px]">
                  <IconCalendar size={13} className="text-primary shrink-0" />
                  <span>{formatDate(rsvpModal.session.sessionDate)}</span>
                  <span>•</span>
                  <span>{rsvpModal.session.timeRange || rsvpModal.session.startTime}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground text-[11px]">
                  <IconMapPin size={13} className="text-primary shrink-0" />
                  <span>{rsvpModal.session.trainingLocation || rsvpModal.session.location || "Academy Field"}</span>
                </div>
                {rsvpModal.session.child?.fullName && (
                  <div className="flex items-center gap-2 text-muted-foreground text-[11px] pt-1 border-t border-white/5">
                    <IconUsers size={13} className="text-primary shrink-0" />
                    <span>Athlete: {rsvpModal.session.child.fullName}</span>
                  </div>
                )}
              </div>

              {/* Status Selector */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-muted-foreground uppercase font-orbitron">
                  Your Response
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    type="button"
                    variant={rsvpModal.status === "CONFIRMED" ? "default" : "outline"}
                    onClick={() =>
                      setRsvpModal((prev) => ({
                        ...prev,
                        status: "CONFIRMED",
                        notes: prev.notes || "Will attend session on time",
                      }))
                    }
                    className={cn(
                      "font-bold uppercase text-xs h-10 tracking-wider flex items-center justify-center gap-1.5",
                      rsvpModal.status === "CONFIRMED"
                        ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                        : "border-white/10 hover:border-white/20"
                    )}
                  >
                    <IconCheck size={16} /> Attending
                  </Button>
                  <Button
                    type="button"
                    variant={rsvpModal.status === "DECLINED" ? "destructive" : "outline"}
                    onClick={() =>
                      setRsvpModal((prev) => ({
                        ...prev,
                        status: "DECLINED",
                        notes: prev.notes || "Cannot attend session",
                      }))
                    }
                    className={cn(
                      "font-bold uppercase text-xs h-10 tracking-wider flex items-center justify-center gap-1.5",
                      rsvpModal.status === "DECLINED"
                        ? "bg-destructive text-white"
                        : "border-white/10 hover:border-white/20"
                    )}
                  >
                    <IconX size={16} /> Declining
                  </Button>
                </div>
              </div>

              {/* Notes Input */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-muted-foreground uppercase font-orbitron">
                  Notes / Reason (Optional)
                </label>
                <Textarea
                  value={rsvpModal.notes}
                  onChange={(e) =>
                    setRsvpModal((prev) => ({ ...prev, notes: e.target.value }))
                  }
                  placeholder={
                    rsvpModal.status === "CONFIRMED"
                      ? "e.g. Will arrive 10 minutes early"
                      : "e.g. Cannot attend due to mild fever / doctor appointment"
                  }
                  className="bg-card border-white/10 text-white text-xs min-h-[80px] focus-visible:ring-primary/50 resize-none"
                />
              </div>
            </div>
          )}

          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleCloseRsvpModal}
              disabled={isSubmittingRsvp}
              className="border-white/10 hover:bg-white/5"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSubmitRsvp}
              disabled={isSubmittingRsvp}
              className={cn(
                "font-orbitron font-bold uppercase tracking-wider text-xs",
                rsvpModal.status === "CONFIRMED"
                  ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                  : "bg-destructive hover:bg-destructive/90 text-white"
              )}
            >
              {isSubmittingRsvp ? (
                <>
                  <IconLoader2 className="size-4 animate-spin mr-1.5" />
                  Submitting...
                </>
              ) : (
                "Submit RSVP"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ParentAttendance;
