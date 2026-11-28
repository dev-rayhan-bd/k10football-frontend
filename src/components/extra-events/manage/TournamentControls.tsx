"use client";

import React, { useState } from "react";
import Link from "next/link";
import { IconActivity, IconCheck, IconExternalLink, IconPlayerPlay, IconRefresh, IconInfoCircle } from "@tabler/icons-react";
import { toast } from "sonner";
import {
  getExtraEventApiError,
  useResetEventTournamentMutation,
  useSimulateEventStageMutation,
  useStartEventTournamentMutation,
} from "@/redux/features/extraEvent/extraEventApi";
import type { TournamentStageStep } from "@/types/extraEvent.type";
import { cn } from "@/lib/utils";
import { TOURNAMENT_STAGES, humanize } from "./extraEventUtils";
import { ActionButton, ConfirmModal, SectionCard } from "./ManageUi";

const MIN_PAID_CLUBS = 4;

const STAGE_ACTION: Partial<Record<string, { step: TournamentStageStep; label: string }>> = {
  GROUP_STAGE: { step: "GROUP_STAGE", label: "Run Group Stage" },
  SEMIFINALS: { step: "SEMIFINALS", label: "Run Semifinals" },
  GRAND_FINAL: { step: "GRAND_FINAL", label: "Run Grand Final" },
};

type Pending = { kind: "start" } | { kind: "stage"; step: TournamentStageStep; label: string } | { kind: "reset" } | null;

export const TournamentControls = ({
  eventId,
  tournamentStatus,
  isLiveMode,
  simulationStep,
  paidClubs,
  readOnly,
}: {
  eventId: string;
  tournamentStatus: string;
  isLiveMode?: boolean;
  simulationStep?: string | null;
  paidClubs: number;
  readOnly?: boolean;
}) => {
  const [startTournament, { isLoading: isStarting }] = useStartEventTournamentMutation();
  const [simulateStage, { isLoading: isSimulating }] = useSimulateEventStageMutation();
  const [resetTournament, { isLoading: isResetting }] = useResetEventTournamentMutation();
  const [pending, setPending] = useState<Pending>(null);

  const status = (tournamentStatus || "REGISTRATION").toUpperCase();
  const currentIndex = Math.max(0, TOURNAMENT_STAGES.indexOf(status as (typeof TOURNAMENT_STAGES)[number]));
  const stageAction = STAGE_ACTION[status];
  const canStart = paidClubs >= MIN_PAID_CLUBS;

  const run = async () => {
    if (!pending) return;
    try {
      const res =
        pending.kind === "start"
          ? await startTournament(eventId).unwrap()
          : pending.kind === "stage"
          ? await simulateStage({ eventId, step: pending.step }).unwrap()
          : await resetTournament(eventId).unwrap();
      toast.success(
        res?.message ||
          (pending.kind === "start" ? "Tournament started" : pending.kind === "stage" ? "Stage completed" : "Tournament reset")
      );
      setPending(null);
    } catch (err) {
      toast.error(getExtraEventApiError(err, "Action failed").message);
    }
  };

  return (
    <SectionCard
      title="Tournament Control"
      subtitle={
        <span className="flex items-center gap-2">
          {isLiveMode && <IconActivity size={12} className="text-[#00FF62] animate-pulse" />}
          Stage: {humanize(status)}
          {simulationStep ? ` · Last step: ${humanize(simulationStep)}` : ""}
        </span>
      }
      actions={
        <Link
          href={`/tournament/live/${eventId}`}
          target="_blank"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-[10px] md:text-[11px] font-black uppercase tracking-widest text-white/80 hover:text-white transition-all"
        >
          <IconExternalLink size={14} /> Public Live View
        </Link>
      }
    >
      {/* Stage stepper */}
      <div className="grid grid-cols-5 gap-1.5 md:gap-3">
        {TOURNAMENT_STAGES.map((s, i) => (
          <div key={s} className="flex flex-col gap-2 min-w-0">
            <div className={cn("h-1.5 rounded-full", i < currentIndex ? "bg-[#00FF62]" : i === currentIndex ? "bg-[#E31B23]" : "bg-white/10")} />
            <span
              className={cn(
                "text-[8px] md:text-[10px] font-black uppercase tracking-widest truncate flex items-center gap-1",
                i === currentIndex ? "text-white" : "text-white/30"
              )}
            >
              {i < currentIndex && <IconCheck size={10} className="text-[#00FF62] shrink-0" />}
              {humanize(s)}
            </span>
          </div>
        ))}
      </div>

      {!readOnly && (
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap gap-2">
            {status === "REGISTRATION" && (
              <ActionButton
                variant="success"
                icon={<IconPlayerPlay size={16} />}
                disabled={!canStart}
                loading={isStarting}
                onClick={() => setPending({ kind: "start" })}
              >
                Start Tournament
              </ActionButton>
            )}
            {stageAction && (
              <ActionButton
                variant="primary"
                icon={<IconPlayerPlay size={16} />}
                loading={isSimulating}
                onClick={() => setPending({ kind: "stage", ...stageAction })}
              >
                {stageAction.label}
              </ActionButton>
            )}
            {status !== "REGISTRATION" && (
              <ActionButton variant="danger" icon={<IconRefresh size={16} />} loading={isResetting} onClick={() => setPending({ kind: "reset" })}>
                Reset to Registration
              </ActionButton>
            )}
          </div>
          {status === "REGISTRATION" && !canStart && (
            <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[#FBBF24]">
              <IconInfoCircle size={14} className="shrink-0" />
              At least {MIN_PAID_CLUBS} paid clubs are required to start ({paidClubs} paid so far).
            </p>
          )}
          {status === "REGISTRATION" && canStart && (
            <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-white/30">
              <IconInfoCircle size={14} className="shrink-0" />
              Tournament can only start on or after the event date. To start early, edit the event date first.
            </p>
          )}
          {status === "COMPLETED" && (
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#00FF62]">Tournament completed.</p>
          )}
        </div>
      )}

      <ConfirmModal
        isOpen={!!pending}
        onClose={() => setPending(null)}
        title={
          pending?.kind === "start" ? "Start Tournament" : pending?.kind === "stage" ? pending.label : "Reset Tournament"
        }
        message={
          pending?.kind === "start"
            ? "Registration will be locked for the tournament and group fixtures will be generated from the current group allocation."
            : pending?.kind === "stage"
            ? "This completes the current stage on the server using the recorded results and advances the tournament. Record any results you want to keep before continuing."
            : "This wipes fixtures, standings and the bracket and returns the tournament to the registration stage. Registered clubs are kept."
        }
        confirmLabel={pending?.kind === "reset" ? "Reset" : "Continue"}
        confirmVariant={pending?.kind === "reset" ? "danger" : "primary"}
        loading={isStarting || isSimulating || isResetting}
        onConfirm={run}
      />
    </SectionCard>
  );
};

export default TournamentControls;
