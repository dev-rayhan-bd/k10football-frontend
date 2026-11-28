"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { IconArrowLeft, IconEdit, IconLock, IconLockOpen, IconTrash, IconAlertTriangle, IconCopy } from "@tabler/icons-react";
import { toast } from "sonner";
import {
  getExtraEventApiError,
  unwrapList,
  useDeleteAcademyEventMutation,
  useGetAcademyEventDetailQuery,
  useGetEventGroupAllocationQuery,
  useGetEventMetaQuery,
  useGetEventRegisteredClubsQuery,
  useUpdateAcademyEventMutation,
  useUpdateEventRegistrationStatusMutation,
} from "@/redux/features/extraEvent/extraEventApi";
import type { IEventFixture, IEventParticipant, IRegisteredClub } from "@/types/extraEvent.type";
import CreateExtraEventModal from "@/components/user-wise-dashboard/academy-management/extra-events/CreateExtraEventModal";
import { getStandingGroups, isClubEvent, parseBracket, parseFixture, getStatusLabel } from "./extraEventUtils";
import { ActionButton, ConfirmModal } from "./ManageUi";
import EventOverview from "./EventOverview";
import ParticipantsTable from "./ParticipantsTable";
import RegisteredClubsPanel from "./RegisteredClubsPanel";
import GroupAllocationPanel from "./GroupAllocationPanel";
import TournamentControls from "./TournamentControls";
import FixturesPanel from "./FixturesPanel";
import StandingsTables from "./StandingsTables";
import BracketView from "./BracketView";

interface ExtraEventManageViewProps {
  eventId: string;
  /** Coach view: no create/edit/delete/tournament actions. */
  readOnly?: boolean;
  /** List route, used for the back link and after delete. */
  basePath?: string;
}

export const ExtraEventManageView = ({
  eventId,
  readOnly = false,
  basePath = "/dashboard/academy/management/extra-events",
}: ExtraEventManageViewProps) => {
  const router = useRouter();
  const { data, isLoading, error } = useGetAcademyEventDetailQuery(eventId, { skip: !eventId });
  const event = data?.data;
  const isClub = isClubEvent(event);

  const { data: metaRes } = useGetEventMetaQuery(undefined, { skip: readOnly });
  const { data: clubsRes } = useGetEventRegisteredClubsQuery(eventId, { skip: !isClub });
  const { data: allocationRes, isLoading: isAllocationLoading } = useGetEventGroupAllocationQuery(eventId, { skip: !isClub });

  const [updateEvent] = useUpdateAcademyEventMutation();
  const [updateRegistrationStatus, { isLoading: isTogglingStatus }] = useUpdateEventRegistrationStatusMutation();
  const [deleteEvent, { isLoading: isDeleting }] = useDeleteAcademyEventMutation();
  const [showEdit, setShowEdit] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteConflict, setDeleteConflict] = useState<string | null>(null);

  const clubs = useMemo(() => {
    const fromEndpoint = unwrapList<IRegisteredClub>(clubsRes?.data, ["clubs", "registeredClubs"]);
    return fromEndpoint.length ? fromEndpoint : unwrapList<IRegisteredClub>(event?.registeredClubs, ["clubs"]);
  }, [clubsRes, event?.registeredClubs]);
  const fixtures = useMemo(
    () => unwrapList<IEventFixture>(event?.fixtures, ["fixtures", "matches"]).map(parseFixture),
    [event?.fixtures]
  );
  const standings = useMemo(() => getStandingGroups(event?.standings), [event?.standings]);
  const bracket = useMemo(() => parseBracket(event?.bracket, fixtures), [event?.bracket, fixtures]);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 pb-10">
        <div className="h-6 w-40 rounded bg-white/5 shimmer" />
        <div className="h-72 rounded-4xl bg-white/5 shimmer" />
        <div className="h-48 rounded-4xl bg-white/5 shimmer" />
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="flex flex-col gap-6 pb-10">
        <Link href={basePath} className="flex items-center gap-2 text-white/60 hover:text-white text-xs font-black uppercase tracking-widest w-fit font-orbitron">
          <IconArrowLeft size={16} /> Back to Events
        </Link>
        <div className="bg-[#111111] border border-white/10 rounded-4xl p-12 text-center flex flex-col gap-2">
          <h2 className="text-lg font-black uppercase text-white font-orbitron">Event not available</h2>
          <p className="text-sm text-white/50">{getExtraEventApiError(error, "This event could not be found.").message}</p>
        </div>
      </div>
    );
  }

  const eventStatus = String(event.status || "OPEN").toUpperCase();
  const isClosed = eventStatus === "CLOSED";
  const isEventCompleted = eventStatus === "COMPLETED";
  const tournamentStatus = String(event.tournamentStatus || "REGISTRATION").toUpperCase();
  const paidClubs = clubs.filter((c) => String(c.paymentStatus).toUpperCase() === "PAID").length;
  const participants = unwrapList<IEventParticipant>(event.participants, ["participants"]);
  const showKnockout =
    bracket.semis.length > 0 || !!bracket.final || ["SEMIFINALS", "GRAND_FINAL", "COMPLETED"].includes(tournamentStatus);

  const handleToggleStatus = async () => {
    if (isEventCompleted) return;
    const next = isClosed ? "OPEN" : "CLOSED";
    try {
      const res = await updateRegistrationStatus({ eventId, status: next }).unwrap();
      toast.success(res?.message || (next === "OPEN" ? "Registration is now open" : "Registration closed"));
    } catch (err) {
      const { status: httpStatus, message } = getExtraEventApiError(err, "Failed to update registration status");
      if (httpStatus === 409) toast.error("Cannot re-open: tournament is completed.");
      else toast.error(message);
    }
  };

  const handleDelete = async () => {
    try {
      const res = await deleteEvent(eventId).unwrap();
      toast.success(res?.message || "Event deleted");
      setConfirmDelete(false);
      router.push(basePath);
    } catch (err) {
      const { status, message } = getExtraEventApiError(err, "Failed to delete event");
      if (status === 409) setDeleteConflict(message);
      else toast.error(message);
    }
  };

  const copyPublicLink = () => {
    navigator.clipboard
      .writeText(`${window.location.origin}/events/${eventId}`)
      .then(() => toast.success("Public event link copied"))
      .catch(() => toast.error("Could not copy the link"));
  };

  return (
    <div className="flex flex-col gap-6 md:gap-8 w-full max-w-full overflow-x-hidden pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <Link href={basePath} className="flex items-center gap-2 text-white/60 hover:text-white transition-all text-xs font-black uppercase tracking-widest w-fit font-orbitron">
          <IconArrowLeft size={16} /> Back to Events
        </Link>
        <div className="flex flex-wrap gap-2">
          <ActionButton icon={<IconCopy size={14} />} onClick={copyPublicLink}>
            Copy Public Link
          </ActionButton>
          {!readOnly && (
            <>
              <ActionButton icon={<IconEdit size={14} />} onClick={() => setShowEdit(true)}>
                Edit
              </ActionButton>
              <ActionButton
                icon={isClosed ? <IconLockOpen size={14} /> : <IconLock size={14} />}
                loading={isTogglingStatus}
                disabled={isEventCompleted}
                title={isEventCompleted ? "Tournament completed — cannot change registration status" : undefined}
                onClick={handleToggleStatus}
              >
                {isClosed ? "Open Registration" : "Close Registration"}
              </ActionButton>
              <ActionButton
                variant="danger"
                icon={<IconTrash size={14} />}
                onClick={() => {
                  setDeleteConflict(null);
                  setConfirmDelete(true);
                }}
              >
                Delete
              </ActionButton>
            </>
          )}
        </div>
      </div>

      <EventOverview event={event} />

      {isClub ? (
        <>
          <TournamentControls
            eventId={eventId}
            tournamentStatus={tournamentStatus}
            isLiveMode={event.isLiveMode}
            simulationStep={event.simulationStep}
            paidClubs={paidClubs}
            readOnly={readOnly}
          />
          <RegisteredClubsPanel
            eventId={eventId}
            clubs={clubs}
            readOnly={readOnly}
            canAddClub={tournamentStatus === "REGISTRATION" && !isClosed}
            defaultCategory={event.ageGroup}
          />
          <GroupAllocationPanel
            eventId={eventId}
            clubs={clubs}
            allocation={allocationRes?.data}
            editable={!readOnly && tournamentStatus === "REGISTRATION"}
            isLoading={isAllocationLoading}
          />
          {(tournamentStatus !== "REGISTRATION" || fixtures.length > 0) && (
            <>
              <FixturesPanel eventId={eventId} fixtures={fixtures} editable={!readOnly && tournamentStatus !== "COMPLETED"} />
              <StandingsTables groups={standings} />
              {showKnockout && <BracketView bracket={bracket} />}
            </>
          )}
        </>
      ) : (
        <ParticipantsTable participants={participants} currency={event.currency} />
      )}

      {!readOnly && showEdit && (
        <CreateExtraEventModal isOpen onClose={() => setShowEdit(false)} meta={metaRes?.data} event={event} />
      )}

      <ConfirmModal
        isOpen={confirmDelete}
        onClose={() => {
          setConfirmDelete(false);
          setDeleteConflict(null);
        }}
        title="Delete Event"
        message={`Delete "${event.eventName}"? This cannot be undone.`}
        confirmLabel="Delete"
        confirmVariant="danger"
        loading={isDeleting}
        onConfirm={handleDelete}
        extra={
          deleteConflict ? (
            <div className="flex flex-col gap-3 p-4 rounded-2xl border border-[#FBBF24]/30 bg-[#FBBF24]/5">
              <p className="flex items-start gap-2 text-xs font-bold text-[#FBBF24]">
                <IconAlertTriangle size={16} className="shrink-0 mt-0.5" />
                {deleteConflict}
              </p>
              {!isClosed && !isEventCompleted && (
                <ActionButton icon={<IconLock size={14} />} loading={isTogglingStatus} onClick={handleToggleStatus} className="w-fit">
                  Close the event instead
                </ActionButton>
              )}
            </div>
          ) : undefined
        }
      />
    </div>
  );
};

export default ExtraEventManageView;
