"use client";

import React, { useState } from "react";
import { IconCalendarEvent, IconEdit, IconMapPin, IconScoreboard, IconBallFootball } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { formatDate, stageLabel, type ParsedFixture } from "./extraEventUtils";
import { ActionButton, ClubLogo, EmptyState, Pill, SectionCard } from "./ManageUi";
import FixtureModal from "./FixtureModal";

const statusPill = (s: string) =>
  s === "LIVE"
    ? "bg-[#00FF62]/10 border-[#00FF62]/30 text-[#00FF62]"
    : s === "COMPLETED"
    ? "bg-white/10 border-white/10 text-white/60"
    : "bg-[#FBBF24]/10 border-[#FBBF24]/20 text-[#FBBF24]";

export const FixtureRow = ({
  fixture,
  editable,
  onEdit,
  onRecord,
}: {
  fixture: ParsedFixture;
  editable?: boolean;
  onEdit?: () => void;
  onRecord?: () => void;
}) => {
  const hasScore = fixture.homeScore !== null && fixture.awayScore !== null;
  return (
    <div className="bg-[#151515] border border-white/5 rounded-3xl p-4 flex flex-col lg:flex-row lg:items-center gap-4 min-w-0">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-1 min-w-0 justify-end">
          <span className="text-xs md:text-sm font-black uppercase text-white truncate text-right">{fixture.home}</span>
          <ClubLogo logo={fixture.homeLogo} name={fixture.home} />
        </div>
        <div className="shrink-0 min-w-20 text-center px-3 py-2 rounded-xl bg-black/50 border border-white/10 font-orbitron font-black text-white text-sm md:text-base">
          {hasScore ? `${fixture.homeScore} – ${fixture.awayScore}` : "vs"}
        </div>
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <ClubLogo logo={fixture.awayLogo} name={fixture.away} />
          <span className="text-xs md:text-sm font-black uppercase text-white truncate">{fixture.away}</span>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2 lg:justify-end">
        <Pill className={statusPill(fixture.status)}>{fixture.status}</Pill>
        {fixture.group && <Pill className="bg-white/5 border-white/10 text-white/50">{fixture.group}</Pill>}
        {(fixture.matchDate || fixture.kickoffTime) && (
          <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-white/40">
            <IconCalendarEvent size={12} />
            {[fixture.matchDate && formatDate(fixture.matchDate, false), fixture.kickoffTime].filter(Boolean).join(" · ")}
          </span>
        )}
        {fixture.pitch && (
          <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-white/40">
            <IconMapPin size={12} />
            {fixture.pitch}
          </span>
        )}
        {editable && fixture.id && (
          <>
            <ActionButton className="px-3 py-2" icon={<IconEdit size={14} />} onClick={onEdit}>
              Edit
            </ActionButton>
            {fixture.status !== "COMPLETED" && (
              <ActionButton className="px-3 py-2" variant="success" icon={<IconScoreboard size={14} />} onClick={onRecord}>
                Result
              </ActionButton>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export const FixturesPanel = ({
  eventId,
  fixtures,
  editable,
}: {
  eventId: string;
  fixtures: ParsedFixture[];
  editable: boolean;
}) => {
  const [active, setActive] = useState<{ fixture: ParsedFixture; mode: "edit" | "result" } | null>(null);
  const [stageFilter, setStageFilter] = useState("ALL");

  const stages = Array.from(new Set(fixtures.map((f) => stageLabel(f.stage))));
  const shown = stageFilter === "ALL" ? fixtures : fixtures.filter((f) => stageLabel(f.stage) === stageFilter);
  const completed = fixtures.filter((f) => f.status === "COMPLETED").length;

  return (
    <SectionCard
      title="Fixtures"
      subtitle={`${fixtures.length} matches · ${completed} completed`}
      actions={
        stages.length > 1 ? (
          <div className="flex flex-wrap gap-1.5">
            {["ALL", ...stages].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setStageFilter(s)}
                className={cn(
                  "px-3 py-1.5 rounded-lg border text-[9px] font-black uppercase tracking-widest cursor-pointer transition-all",
                  stageFilter === s ? "bg-[#E31B23] border-[#E31B23] text-white" : "bg-white/5 border-white/10 text-white/50 hover:text-white"
                )}
              >
                {s}
              </button>
            ))}
          </div>
        ) : undefined
      }
    >
      {fixtures.length === 0 ? (
        <EmptyState
          icon={<IconBallFootball size={28} />}
          title="No fixtures yet"
          text="Fixtures are generated when the tournament starts."
        />
      ) : (
        <div className="flex flex-col gap-2.5">
          {shown.map((f, i) => (
            <FixtureRow
              key={f.id || i}
              fixture={f}
              editable={editable}
              onEdit={() => setActive({ fixture: f, mode: "edit" })}
              onRecord={() => setActive({ fixture: f, mode: "result" })}
            />
          ))}
        </div>
      )}
      {active && (
        <FixtureModal
          key={`${active.fixture.id}-${active.mode}`}
          eventId={eventId}
          fixture={active.fixture}
          mode={active.mode}
          onClose={() => setActive(null)}
        />
      )}
    </SectionCard>
  );
};

export default FixturesPanel;
