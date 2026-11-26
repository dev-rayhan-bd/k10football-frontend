"use client";

import React, { useEffect, useMemo, useState } from "react";
import { IconCheck, IconLoader2, IconTrophy } from "@tabler/icons-react";
import { toast } from "sonner";
import {
  getExtraEventApiError,
  useAllocateEventGroupsMutation,
  useStartEventTournamentMutation,
} from "@/redux/features/extraEvent/extraEventApi";
import type { IAcademyEventDetail, IRegisteredClub, TournamentGroup } from "@/types/extraEvent.type";
import { cn } from "@/lib/utils";
import { ClubBadgeAvatar, ClubRosterDialog } from "./RegisteredClubsSection";

interface GroupStageBuilderProps {
  event: IAcademyEventDetail;
  clubs: IRegisteredClub[];
  isLoadingClubs: boolean;
  maxTeams: number | string;
  onResetTournament: () => void;
  isResetting: boolean;
}

export const GroupStageBuilder: React.FC<GroupStageBuilderProps> = ({
  event,
  clubs,
  isLoadingClubs,
  maxTeams,
  onResetTournament,
  isResetting,
}) => {
  const [groupMap, setGroupMap] = useState<Record<string, TournamentGroup | "">>({});
  const [rosterClub, setRosterClub] = useState<IRegisteredClub | null>(null);

  useEffect(() => {
    const next: Record<string, TournamentGroup | ""> = {};
    clubs.forEach((c) => {
      if (c.group === "GROUP A" || c.group === "GROUP B") {
        next[c._id] = c.group;
      } else {
        next[c._id] = "";
      }
    });
    setGroupMap(next);
  }, [clubs]);

  const [allocateGroups, { isLoading: isSaving }] = useAllocateEventGroupsMutation();
  const [startTournament, { isLoading: isStarting }] = useStartEventTournamentMutation();

  const groupAClubs = useMemo(() => clubs.filter((c) => groupMap[c._id] === "GROUP A"), [clubs, groupMap]);
  const groupBClubs = useMemo(() => clubs.filter((c) => groupMap[c._id] === "GROUP B"), [clubs, groupMap]);

  const isRegistration = !event.tournamentStatus || event.tournamentStatus === "REGISTRATION";
  const canStart = groupAClubs.length >= 2 && groupBClubs.length >= 2;

  const setClubGroup = (clubId: string, target: TournamentGroup) => {
    setGroupMap((prev) => ({
      ...prev,
      [clubId]: prev[clubId] === target ? "" : target,
    }));
  };

  const handleSaveAllocations = async () => {
    const allocations = Object.entries(groupMap)
      .filter(([, group]) => group === "GROUP A" || group === "GROUP B")
      .map(([clubId, group]) => ({ clubId, group: group as TournamentGroup }));

    if (allocations.length === 0) {
      toast.error("Assign at least one club to Group A or Group B");
      return;
    }

    try {
      const res = await allocateGroups({ eventId: event._id, allocations }).unwrap();
      toast.success(res?.message || "Group allocations saved!");
    } catch (err) {
      toast.error(getExtraEventApiError(err, "Failed to save group allocations").message);
    }
  };

  const handleStartTournament = async () => {
    try {
      const res = await startTournament(event._id).unwrap();
      toast.success(res?.message || "Tournament started & fixtures generated!");
    } catch (err) {
      toast.error(getExtraEventApiError(err, "Failed to start tournament").message);
    }
  };

  const statusText = event.isLiveMode
    ? "LIVE GAME"
    : String(event.tournamentStatus || "REGISTRATION").replace(/_/g, " ");

  return (
    <div className="space-y-8">
      {/* Top KPI Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-[#111] border border-white/10 rounded-3xl p-6 space-y-2">
          <span className="text-[10px] font-black uppercase tracking-widest text-white/40">TOURNAMENT STATUS</span>
          <p className="text-2xl font-black uppercase text-white font-orbitron tracking-tight">{statusText}</p>
        </div>
        <div className="bg-[#111] border border-white/10 rounded-3xl p-6 space-y-2">
          <span className="text-[10px] font-black uppercase tracking-widest text-white/40">
            TOTAL REGISTERED TEAMS
          </span>
          <p className="text-2xl font-black text-[#00FF62] font-orbitron tracking-tight">
            {clubs.length} / {maxTeams}
          </p>
        </div>
        <div className="bg-[#111] border border-white/10 rounded-3xl p-6 space-y-2">
          <span className="text-[10px] font-black uppercase tracking-widest text-white/40">CATEGORIES</span>
          <p className="text-2xl font-black text-white font-orbitron tracking-tight truncate">
            {event.ageGroup || "Open"}
          </p>
        </div>
        <div className="bg-[#111] border border-white/10 rounded-3xl p-6 flex flex-col justify-center">
          {isRegistration ? (
            <div className="text-[10px] text-white/60 font-black uppercase text-center border border-white/10 bg-white/5 py-3 px-4 rounded-xl font-orbitron">
              {clubs.length} / {maxTeams} CLUBS ENROLLED
            </div>
          ) : (
            <button
              type="button"
              disabled={isResetting}
              onClick={onResetTournament}
              className="bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 text-[10px] font-black uppercase tracking-widest py-3 px-4 rounded-xl transition-all cursor-pointer font-orbitron disabled:opacity-50"
            >
              {isResetting ? "Resetting..." : "Reset Tournament Flow"}
            </button>
          )}
        </div>
      </div>

      {/* Group Stage Builder (only during registration) */}
      {isRegistration && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Panel: Registered Clubs */}
          <div className="lg:col-span-1 bg-[#111] border border-white/10 rounded-4xl p-6 md:p-8 space-y-5 min-w-0">
            <div className="flex justify-between items-center border-b border-white/5 pb-3">
              <div>
                <h3 className="text-lg font-black uppercase text-white font-orbitron">REGISTERED CLUBS</h3>
                <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest mt-0.5">
                  {clubs.length} clubs enrolled
                </p>
              </div>
              {isLoadingClubs && <IconLoader2 size={16} className="animate-spin text-[#00FF62]" />}
            </div>

            <div className="flex flex-col gap-3 max-h-[45vh] overflow-y-auto pr-1">
              {clubs.length === 0 ? (
                <p className="text-xs text-white/40 text-center py-8 font-bold uppercase">
                  No clubs registered yet
                </p>
              ) : (
                clubs.map((club) => {
                  const assigned = groupMap[club._id];
                  return (
                    <div
                      key={club._id}
                      className="bg-black/40 border border-white/10 p-3.5 rounded-2xl space-y-3"
                    >
                      <div
                        onClick={() => setRosterClub(club)}
                        className="flex items-center gap-3 cursor-pointer group"
                      >
                        <ClubBadgeAvatar club={club} sizeClass="size-10" />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-black text-white group-hover:text-[#E31B23] truncate uppercase">
                            {club.clubName}
                          </p>
                          <p className="text-[10px] text-white/40 truncate">
                            {club.category || club.coachName || "Squad"}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        {(["GROUP A", "GROUP B"] as const).map((grp) => (
                          <button
                            key={grp}
                            type="button"
                            onClick={() => setClubGroup(club._id, grp)}
                            className={cn(
                              "py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider border transition-all cursor-pointer font-orbitron",
                              assigned === grp
                                ? "bg-[#00FF62] text-black border-[#00FF62]"
                                : "bg-white/5 text-white/60 border-white/10 hover:bg-white/10"
                            )}
                          >
                            {grp}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Panel: Group A & Group B Slots */}
          <div className="lg:col-span-2 bg-[#111] border border-white/10 rounded-4xl p-6 md:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-4">
              <div>
                <h3 className="text-lg font-black uppercase text-white font-orbitron">GROUP STAGE BUILDER</h3>
                <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest mt-0.5">
                  Assign registered clubs into Group A and Group B
                </p>
              </div>
              <button
                type="button"
                disabled={isSaving || clubs.length === 0}
                onClick={handleSaveAllocations}
                className="bg-white/10 hover:bg-white/15 border border-white/15 text-white text-[10px] font-black uppercase tracking-widest px-4 py-2.5 rounded-xl cursor-pointer font-orbitron flex items-center gap-2 disabled:opacity-40"
              >
                {isSaving ? <IconLoader2 size={14} className="animate-spin" /> : <IconCheck size={14} />}
                SAVE ALLOCATIONS
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { label: "GROUP A", items: groupAClubs },
                { label: "GROUP B", items: groupBClubs },
              ].map((grp) => (
                <div key={grp.label} className="bg-black/40 border border-white/10 rounded-3xl p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase text-[#00FF62] font-orbitron">{grp.label}</span>
                    <span className="text-[10px] font-bold text-white/40 font-orbitron">
                      {grp.items.length} / 4 Slots
                    </span>
                  </div>
                  <div className="space-y-2 min-h-36">
                    {grp.items.length === 0 ? (
                      <div className="h-36 flex items-center justify-center border border-dashed border-white/10 rounded-2xl text-[10px] font-bold uppercase text-white/30">
                        Select clubs from left panel
                      </div>
                    ) : (
                      grp.items.map((club) => (
                        <div
                          key={club._id}
                          className="flex items-center justify-between gap-2 bg-[#141414] border border-white/10 rounded-xl px-3 py-2"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <ClubBadgeAvatar club={club} sizeClass="size-7" />
                            <span className="text-xs font-bold text-white truncate">{club.clubName}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setClubGroup(club._id, grp.label as TournamentGroup)}
                            className="text-[9px] text-red-400 hover:text-red-300 font-bold uppercase cursor-pointer"
                          >
                            Remove
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                disabled={!canStart || isStarting}
                onClick={handleStartTournament}
                className="bg-[#00FF62] hover:bg-[#00e056] disabled:opacity-40 text-black text-xs font-black uppercase tracking-widest px-6 py-3.5 rounded-2xl cursor-pointer font-orbitron flex items-center gap-2 shadow-lg shadow-[#00FF62]/20"
              >
                {isStarting ? <IconLoader2 size={16} className="animate-spin" /> : <IconTrophy size={16} />}
                START TOURNAMENT &amp; GENERATE FIXTURES
              </button>
            </div>
          </div>
        </div>
      )}

      <ClubRosterDialog eventId={event._id} club={rosterClub} onClose={() => setRosterClub(null)} />
    </div>
  );
};
