"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { IconAlertTriangle, IconArrowLeft, IconCheck, IconCopy, IconExternalLink, IconEye, IconLock, IconLockOpen, IconTrash } from "@tabler/icons-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { getUserInfo } from "@/helpers/SessionHelper";
import {
  getExtraEventApiError,
  unwrapList,
  useGetAcademyEventDetailQuery,
  useGetEventBadgePresetsQuery,
  useGetEventPublicPortalQuery,
  useGetEventRegisteredClubsQuery,
  useDeleteAcademyEventMutation,
  useResetEventTournamentMutation,
  useUpdateAcademyEventMutation,
  useUpdateEventRegistrationStatusMutation,
  useVerifyClubRegistrationPaymentMutation,
} from "@/redux/features/extraEvent/extraEventApi";
import type { IBadgePreset, IPublicEvent, IRegisteredClub } from "@/types/extraEvent.type";
import PublicTournamentInfoCards from "@/components/tournament/PublicTournamentInfoCards";
import PublicTournamentDetailsAndClubs from "@/components/tournament/PublicTournamentDetailsAndClubs";
import {
  RoleViewSwitcherBar,
  type ExtraEventPreviewRole,
} from "@/components/user-wise-dashboard/academy-management/extra-events/detail/RoleViewSwitcherBar";
import { TournamentHeroAndSidebar } from "@/components/user-wise-dashboard/academy-management/extra-events/detail/TournamentHeroAndSidebar";
import { RegisteredClubsSection } from "@/components/user-wise-dashboard/academy-management/extra-events/detail/RegisteredClubsSection";
import { ClubRegistrationModal } from "@/components/user-wise-dashboard/academy-management/extra-events/detail/ClubRegistrationModal";
import { GroupStageBuilder } from "@/components/user-wise-dashboard/academy-management/extra-events/detail/GroupStageBuilder";
import { TournamentArena } from "@/components/user-wise-dashboard/academy-management/extra-events/detail/TournamentArena";

const defaultRoleForUser = (): { initial: ExtraEventPreviewRole; canSwitch: boolean } => {
  const user = getUserInfo() as { role?: string } | null;
  const role = String(user?.role || "").toUpperCase();
  if (role === "PARENT" || role === "GUARDIAN") {
    return { initial: "spectator_parent", canSwitch: false };
  }
  if (role === "CLUB") {
    return { initial: "invited_club", canSwitch: false };
  }
  return { initial: "owner_admin", canSwitch: true };
};

const ExtraEventDetailPage = () => {
  const params = useParams<{ id: string | string[] }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const eventId = (Array.isArray(params?.id) ? params.id[0] : params?.id) ?? "";

  const [{ initial, canSwitch }] = useState(() => defaultRoleForUser());
  const [previewRole, setPreviewRole] = useState<ExtraEventPreviewRole>(initial);
  const [showRegModal, setShowRegModal] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteConflict, setDeleteConflict] = useState<string | null>(null);
  const [copiedInvite, setCopiedInvite] = useState(false);
  const [copiedPublic, setCopiedPublic] = useState(false);
  const verifiedSessionRef = useRef<string | null>(null);

  const {
    data: detailRes,
    isLoading: isDetailLoading,
    refetch: refetchDetail,
  } = useGetAcademyEventDetailQuery(eventId, { skip: !eventId });

  const {
    data: clubsRes,
    isLoading: isClubsLoading,
    refetch: refetchClubs,
  } = useGetEventRegisteredClubsQuery(eventId, { skip: !eventId });

  const { data: publicPortalRes } = useGetEventPublicPortalQuery(eventId, {
    skip: !eventId || previewRole !== "spectator_parent",
  });
  const { data: presetsRes } = useGetEventBadgePresetsQuery(eventId, {
    skip: !eventId || previewRole !== "spectator_parent",
  });

  const [updateEvent, { isLoading: isTogglingLive }] = useUpdateAcademyEventMutation();
  const [resetTournament, { isLoading: isResetting }] = useResetEventTournamentMutation();
  const [updateRegistrationStatus, { isLoading: isTogglingStatus }] = useUpdateEventRegistrationStatusMutation();
  const [deleteEvent, { isLoading: isDeleting }] = useDeleteAcademyEventMutation();
  const [verifyPayment] = useVerifyClubRegistrationPaymentMutation();

  // Verify Stripe registration payment on redirect back with ?session_id=...
  useEffect(() => {
    const sessionId = searchParams?.get("session_id");
    if (!eventId || !sessionId || verifiedSessionRef.current === sessionId) return;
    verifiedSessionRef.current = sessionId;

    verifyPayment({ eventId, sessionId })
      .unwrap()
      .then((res) => {
        toast.success(res?.message || "Club registration payment verified!");
        refetchDetail();
        refetchClubs();
      })
      .catch((err) => {
        toast.error(getExtraEventApiError(err, "Failed to verify registration payment").message);
      });
  }, [eventId, searchParams, verifyPayment, refetchDetail, refetchClubs]);

  const event = detailRes?.data;
  const clubs = useMemo(
    () => unwrapList<IRegisteredClub>(clubsRes?.data, ["clubs", "registeredClubs"]),
    [clubsRes]
  );
  const presets = useMemo(
    () => unwrapList<IBadgePreset>(presetsRes?.data, ["presets", "badges"]),
    [presetsRes]
  );
  const publicPath = `/tournament/live/${eventId}`;
  const publicUrl =
    typeof window !== "undefined" ? `${window.location.origin}${publicPath}` : publicPath;

  const isLiveMode = Boolean(event?.isLiveMode);
  const eventStatus = String(event?.status || "OPEN").toUpperCase();
  const isEventCompleted = eventStatus === "COMPLETED";
  const isRegistrationClosed = eventStatus === "CLOSED";
  const isRegistrationOpen =
    !isRegistrationClosed &&
    (!event?.tournamentStatus || event.tournamentStatus === "REGISTRATION");
  const maxTeams = event?.maxCapacity ?? 8;

  const handleDelete = async () => {
    if (!event) return;
    try {
      const res = await deleteEvent(event._id).unwrap();
      toast.success(res?.message || "Event deleted");
      setConfirmDelete(false);
      router.push("/dashboard/academy/management/extra-events");
    } catch (err) {
      const { status, message } = getExtraEventApiError(err, "Failed to delete event");
      if (status === 409) {
        setDeleteConflict(message);
      } else {
        toast.error(message);
      }
    }
  };

  const handleToggleRegistrationStatus = async () => {
    if (!event || isEventCompleted) return;
    const next = isRegistrationClosed ? "OPEN" : "CLOSED";
    try {
      const res = await updateRegistrationStatus({ eventId: event._id, status: next }).unwrap();
      toast.success(res?.message || (next === "OPEN" ? "Registration is now open" : "Registration closed"));
      refetchDetail();
    } catch (err) {
      const apiErr = getExtraEventApiError(err, "Failed to update registration status");
      if (apiErr.status === 409) toast.error("Cannot re-open: tournament is completed.");
      else toast.error(apiErr.message);
    }
  };

  const handleToggleLiveMode = async () => {
    if (!event) return;
    const nextLive = !isLiveMode;
    const nextStatus =
      nextLive && (!event.tournamentStatus || event.tournamentStatus === "REGISTRATION")
        ? "GROUP_STAGE"
        : event.tournamentStatus || "REGISTRATION";
    try {
      const res = await updateEvent({
        id: event._id,
        body: { isLiveMode: nextLive, tournamentStatus: nextStatus },
      }).unwrap();
      toast.success(res?.message || (nextLive ? "Live mode enabled" : "Live mode disabled"));
      refetchDetail();
    } catch (err) {
      toast.error(getExtraEventApiError(err, "Failed to toggle live mode").message);
    }
  };

  const handleResetTournament = async () => {
    if (!event) return;
    try {
      const res = await resetTournament(event._id).unwrap();
      toast.success(res?.message || "Tournament reset to registration");
      refetchDetail();
      refetchClubs();
    } catch (err) {
      toast.error(getExtraEventApiError(err, "Failed to reset tournament").message);
    }
  };

  const handleCopyInviteLink = async () => {
    if (typeof window === "undefined") return;
    const url = `${window.location.origin}/events/${eventId}`;
    await navigator.clipboard.writeText(url);
    setCopiedInvite(true);
    toast.success("Invitation link copied!");
    setTimeout(() => setCopiedInvite(false), 2000);
  };

  const handleCopyPublicLink = async () => {
    if (typeof window === "undefined") return;
    const url = `${window.location.origin}/tournament/live/${eventId}`;
    await navigator.clipboard.writeText(url);
    setCopiedPublic(true);
    toast.success("Public spectator link copied!");
    setTimeout(() => setCopiedPublic(false), 2000);
  };

  if (isDetailLoading) {
    return (
      <div className="max-w-6xl mx-auto py-8 px-4 flex flex-col gap-6">
        <Skeleton className="h-20 w-full rounded-3xl bg-white/10" />
        <Skeleton className="h-96 w-full rounded-4xl bg-white/5" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="max-w-6xl mx-auto py-16 px-4 text-center space-y-4">
        <p className="text-sm font-black uppercase text-white/60 font-orbitron">Event not found</p>
        <Link
          href="/dashboard/academy/management/extra-events"
          className="inline-flex items-center gap-2 text-xs font-black uppercase text-[#E31B23] font-orbitron"
        >
          <IconArrowLeft size={16} /> Back to Events
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 flex flex-col gap-6">
      <RoleViewSwitcherBar
        previewRole={previewRole}
        onChangeRole={setPreviewRole}
        isLiveMode={isLiveMode}
        isTogglingLive={isTogglingLive}
        onToggleLiveMode={handleToggleLiveMode}
        canSwitchRoles={canSwitch}
      />

      <Link
        href="/dashboard/academy/management/extra-events"
        className="flex items-center gap-2 text-white/60 hover:text-white transition-all text-xs font-black uppercase tracking-widest w-fit font-orbitron"
      >
        <IconArrowLeft size={16} />
        Back to Events
      </Link>

      {/* VIEW 1: INVITED CLUB FLOW */}
      {previewRole === "invited_club" && (
        <div className="space-y-8">
          <TournamentHeroAndSidebar
            event={event}
            registeredCount={clubs.length}
            maxTeams={maxTeams}
            isRegistrationOpen={isRegistrationOpen}
            isLiveMode={isLiveMode}
            onOpenRegisterModal={() => setShowRegModal(true)}
            onCopyInviteLink={handleCopyInviteLink}
            copiedInvite={copiedInvite}
          />
          <RegisteredClubsSection eventId={event._id} clubs={clubs} isLoading={isClubsLoading} />
        </div>
      )}

      {/* VIEW 2: PARENTS & SPECTATORS VIEW (PUBLIC LIVE PORTAL) */}
      {previewRole === "spectator_parent" && (
        <div className="space-y-6">
          <div className="bg-linear-to-r from-amber-500/10 via-[#161618] to-black rounded-4xl border border-amber-500/30 p-8 md:p-10 shadow-2xl">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div className="space-y-2 max-w-xl">
                <div className="inline-flex items-center gap-2 bg-amber-500/20 border border-amber-500/30 px-3.5 py-1.5 rounded-full text-amber-400 text-[10px] font-black uppercase tracking-widest font-orbitron">
                  <IconEye size={14} />
                  PUBLIC FAN &amp; PARENT LIVE PORTAL
                </div>
                <h2 className="text-2xl md:text-4xl font-black uppercase text-white font-orbitron tracking-tight leading-tight">
                  {publicPortalRes?.data?.eventInfo?.eventName || event.eventName}
                </h2>
                <p className="text-sm text-white/60 leading-relaxed">
                  Live scores, group standings, match fixtures, and championship knockout brackets visible for parents, clubs, and supporters.
                </p>
              </div>

              <div className="bg-black/60 border border-white/10 rounded-3xl p-5 space-y-3 shrink-0 w-full md:w-80">
                <span className="text-[9px] font-black uppercase tracking-wider text-white/50 font-orbitron block">
                  Public Spectator Link
                </span>
                <Link
                  href={publicPath}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between gap-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl px-3 py-2 text-[11px] font-mono text-amber-300 truncate transition-colors"
                >
                  <span className="truncate">{publicUrl}</span>
                  <IconExternalLink size={14} className="shrink-0" />
                </Link>
                <button
                  type="button"
                  onClick={handleCopyPublicLink}
                  className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-black font-black uppercase tracking-wider text-[10px] py-3 px-4 rounded-xl transition-all font-orbitron cursor-pointer shadow-lg shadow-amber-500/20"
                >
                  {copiedPublic ? (
                    <>
                      <IconCheck size={14} />
                      PUBLIC LINK COPIED
                    </>
                  ) : (
                    <>
                      <IconCopy size={14} />
                      SHARE PUBLIC RESULT LINK
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          <PublicTournamentInfoCards
            event={(publicPortalRes?.data?.eventInfo || event) as IPublicEvent}
          />

          <PublicTournamentDetailsAndClubs
            event={(publicPortalRes?.data?.eventInfo || event) as IPublicEvent & Record<string, unknown>}
            clubs={clubs}
            presets={presets}
            isLoadingClubs={isClubsLoading}
          />

          <TournamentArena
            event={event}
            readOnly
            portalArena={publicPortalRes?.data?.arena || null}
          />
        </div>
      )}

      {/* VIEW 3: TOURNAMENT OWNER (ADMIN) */}
      {previewRole === "owner_admin" && (
        <div className="space-y-8">
          {/* Admin action bar */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              disabled={isEventCompleted || isTogglingStatus}
              onClick={handleToggleRegistrationStatus}
              title={isEventCompleted ? "Tournament completed — cannot change registration status" : undefined}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed text-[10px] md:text-[11px] font-black uppercase tracking-widest text-white/80 hover:text-white transition-all"
            >
              {isRegistrationClosed ? (
                <>
                  <IconLockOpen size={14} />
                  Open Registration
                </>
              ) : (
                <>
                  <IconLock size={14} />
                  Close Registration
                </>
              )}
            </button>
            <button
              type="button"
              disabled={isDeleting}
              onClick={() => { setDeleteConflict(null); setConfirmDelete(true); }}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#E31B23]/30 bg-[#E31B23]/10 hover:bg-[#E31B23]/20 disabled:opacity-40 disabled:cursor-not-allowed text-[10px] md:text-[11px] font-black uppercase tracking-widest text-[#E31B23] transition-all"
            >
              <IconTrash size={14} />
              Delete Event
            </button>
            {isEventCompleted && (
              <span className="text-[10px] font-bold uppercase tracking-widest text-purple-400">
                Tournament completed
              </span>
            )}
          </div>
          <GroupStageBuilder
            event={event}
            clubs={clubs}
            isLoadingClubs={isClubsLoading}
            maxTeams={maxTeams}
            onResetTournament={handleResetTournament}
            isResetting={isResetting}
          />
          <TournamentArena event={event} readOnly={false} />
        </div>
      )}

      <ClubRegistrationModal
        event={event}
        isOpen={showRegModal}
        onClose={() => setShowRegModal(false)}
        onSuccess={() => {
          refetchDetail();
          refetchClubs();
        }}
      />

      {/* Delete confirm dialog */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#111111] p-8 flex flex-col gap-5 shadow-2xl">
            <h3 className="text-base font-black uppercase tracking-widest text-white font-orbitron">Delete Event</h3>
            <p className="text-sm text-white/60">
              Delete &ldquo;{event.eventName}&rdquo;? This cannot be undone.
            </p>
            {deleteConflict && (
              <div className="flex flex-col gap-3 rounded-2xl border border-[#FBBF24]/30 bg-[#FBBF24]/5 p-4">
                <p className="flex items-start gap-2 text-xs font-bold text-[#FBBF24]">
                  <IconAlertTriangle size={16} className="shrink-0 mt-0.5" />
                  {deleteConflict}
                </p>
                {!isRegistrationClosed && !isEventCompleted && (
                  <button
                    type="button"
                    disabled={isTogglingStatus}
                    onClick={handleToggleRegistrationStatus}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 disabled:opacity-40 text-[10px] font-black uppercase tracking-widest text-white/80 transition-all w-fit"
                  >
                    <IconLock size={14} />
                    Close the event instead
                  </button>
                )}
              </div>
            )}
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => { setConfirmDelete(false); setDeleteConflict(null); }}
                className="px-5 py-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-[11px] font-black uppercase tracking-widest text-white/70 transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleDelete}
                className="px-5 py-2.5 rounded-xl bg-[#E31B23] hover:bg-[#c0151c] disabled:opacity-40 text-[11px] font-black uppercase tracking-widest text-white transition-all"
              >
                {isDeleting ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExtraEventDetailPage;
