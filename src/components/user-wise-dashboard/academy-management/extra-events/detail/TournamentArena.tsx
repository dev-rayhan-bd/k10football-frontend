"use client";

import React, { useMemo, useState } from "react";
import {
  IconActivity,
  IconCheck,
  IconCrown,
  IconLoader2,
  IconSearch,
  IconTrophy,
} from "@tabler/icons-react";
import { toast } from "sonner";
import {
  getExtraEventApiError,
  unwrapList,
  useGetEventArenaQuery,
  useGetEventFixturesQuery,
  useRecordEventMatchResultMutation,
  useSimulateEventStageMutation,
} from "@/redux/features/extraEvent/extraEventApi";
import type {
  IAcademyEventDetail,
  IEventBracket,
  IEventFixture,
  IEventStandings,
  TournamentStageStep,
} from "@/types/extraEvent.type";
import {
  buildTeamLookup,
  normalizeBracket,
  normalizeMatches,
  normalizeStandings,
  type TournamentMatch,
} from "@/components/tournament/tournament.utils";
import { cn } from "@/lib/utils";
import { ClubBadgeAvatar } from "./RegisteredClubsSection";

interface TournamentArenaProps {
  event: IAcademyEventDetail;
  readOnly: boolean;
  /** Optional portal arena override for Parents & Spectators public view */
  portalArena?: {
    standings?: IEventStandings;
    fixtures?: IEventFixture[];
    bracket?: IEventBracket;
  } | null;
}

export const TournamentArena: React.FC<TournamentArenaProps> = ({
  event,
  readOnly,
  portalArena,
}) => {
  const [activeTab, setActiveTab] = useState<"standings" | "fixtures" | "bracket">("standings");
  const [selectedGroup, setSelectedGroup] = useState<"groupA" | "groupB">("groupA");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [scoreDrafts, setScoreDrafts] = useState<Record<string, { s1: string; s2: string }>>({});
  const [recordingMatchId, setRecordingMatchId] = useState<string | null>(null);

  const {
    data: arenaRes,
    isLoading: isArenaLoading,
    refetch: refetchArena,
  } = useGetEventArenaQuery(
    { eventId: event._id, tab: activeTab },
    { skip: !event._id || Boolean(portalArena), refetchOnMountOrArgChange: true }
  );

  const { data: fixturesRes, refetch: refetchFixtures } = useGetEventFixturesQuery(event._id, {
    skip: !event._id || Boolean(portalArena),
    refetchOnMountOrArgChange: true,
  });

  const [recordResult, { isLoading: isRecording }] = useRecordEventMatchResultMutation();
  const [simulateStage, { isLoading: isSimulating }] = useSimulateEventStageMutation();

  const arenaData = (portalArena || (arenaRes?.data as Record<string, unknown>) || {}) as {
    standings?: IEventStandings;
    fixtures?: IEventFixture[];
    bracket?: IEventBracket;
  };

  const rawFixtures: IEventFixture[] = useMemo(() => {
    const fromPortal = portalArena?.fixtures;
    if (Array.isArray(fromPortal) && fromPortal.length > 0) return fromPortal;
    const fromApi = unwrapList<IEventFixture>(fixturesRes?.data, ["fixtures", "matches"]);
    if (fromApi.length > 0) return fromApi;
    return unwrapList<IEventFixture>(arenaData.fixtures, ["fixtures", "matches"]);
  }, [portalArena, fixturesRes, arenaData]);

  const normalized = useMemo(() => {
    const standingsRaw = arenaData.standings ?? event.standings;
    const lookup = buildTeamLookup(standingsRaw, rawFixtures);
    const matches = normalizeMatches(rawFixtures, lookup);
    const standings = normalizeStandings(standingsRaw, lookup);
    const bracket = normalizeBracket(arenaData.bracket ?? event.bracket ?? null, lookup, matches);
    return { matches, standings, bracket };
  }, [arenaData, event.standings, event.bracket, rawFixtures]);

  const categories = useMemo(() => {
    const base = (event.ageGroup || "")
      .split(",")
      .map((c) => c.trim())
      .filter(Boolean);
    return ["ALL", ...base];
  }, [event.ageGroup]);

  const q = searchQuery.trim().toLowerCase();

  const filteredStandings = useMemo(() => {
    const rows = normalized.standings[selectedGroup] ?? [];
    return rows.filter((row) => !q || row.team.name.toLowerCase().includes(q));
  }, [normalized.standings, selectedGroup, q]);

  const filteredMatches = useMemo(() => {
    return normalized.matches.filter(
      (m) => !q || m.home.name.toLowerCase().includes(q) || m.away.name.toLowerCase().includes(q)
    );
  }, [normalized.matches, q]);

  const fixtureSections = useMemo(() => {
    const order = (kind: string) => (kind === "group" ? 0 : kind === "semi" ? 1 : kind === "final" ? 2 : 3);
    const map = new Map<string, typeof filteredMatches>();
    const sorted = [...filteredMatches].sort((a, b) => order(a.kind) - order(b.kind));
    for (const m of sorted) {
      const label = m.kind === "semi" ? "Semi-Finals" : m.stageLabel;
      map.set(label, [...(map.get(label) ?? []), m]);
    }
    return [...map.entries()];
  }, [filteredMatches]);

  const handleRecordScore = async (fx: TournamentMatch) => {
    const matchId = fx.key;
    const draft = scoreDrafts[matchId];
    const raw1 = draft ? draft.s1 : fx.homeScore !== null && fx.homeScore !== undefined ? String(fx.homeScore) : "";
    const raw2 = draft ? draft.s2 : fx.awayScore !== null && fx.awayScore !== undefined ? String(fx.awayScore) : "";
    if (raw1.trim() === "" || raw2.trim() === "") {
      toast.error("Please enter both home and away scores");
      return;
    }
    const goal1 = Number(raw1);
    const goal2 = Number(raw2);
    if (Number.isNaN(goal1) || Number.isNaN(goal2) || goal1 < 0 || goal2 < 0) {
      toast.error("Enter valid non-negative scores");
      return;
    }
    const stage =
      fx.kind === "semi" ? "SEMIFINALS" : fx.kind === "final" ? "GRAND_FINAL" : "GROUP_STAGE";
    setRecordingMatchId(matchId);
    try {
      const res = await recordResult({
        eventId: event._id,
        matchId,
        ...(fx.home.id ? { team1Id: fx.home.id } : {}),
        team1: fx.home.name,
        ...(fx.away.id ? { team2Id: fx.away.id } : {}),
        team2: fx.away.name,
        goal1,
        goal2,
        score1: goal1,
        score2: goal2,
        stage,
      }).unwrap();
      toast.success(res?.message || "Match score recorded!");
      await Promise.all([refetchArena(), refetchFixtures()]);
    } catch (err) {
      toast.error(getExtraEventApiError(err, "Failed to record match result").message);
    } finally {
      setRecordingMatchId(null);
    }
  };

  const handleSimulate = async () => {
    const step: TournamentStageStep =
      event.tournamentStatus === "SEMIFINALS"
        ? "SEMIFINALS"
        : event.tournamentStatus === "GRAND_FINAL"
          ? "GRAND_FINAL"
          : "GROUP_STAGE";
    try {
      const res = await simulateStage({ eventId: event._id, step }).unwrap();
      toast.success(res?.message || "Live scores simulated!");
      refetchArena();
      refetchFixtures();
    } catch (err) {
      toast.error(getExtraEventApiError(err, "Failed to simulate stage").message);
    }
  };

  return (
    <div className="bg-[#111111] border border-white/10 rounded-4xl p-6 md:p-8 space-y-6 shadow-2xl">
      {/* Arena Header & Simulate Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-2xl bg-[#00FF62]/10 border border-[#00FF62]/20 flex items-center justify-center text-[#00FF62]">
            <IconTrophy size={20} />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-black uppercase text-white font-orbitron tracking-tight">
              TOURNAMENT ARENA
            </h2>
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">
              Live standings, match fixtures &amp; knockout bracket
            </p>
          </div>
        </div>

        {!readOnly && (event.isLiveMode || event.tournamentStatus !== "REGISTRATION") && (
          <button
            type="button"
            disabled={isSimulating}
            onClick={handleSimulate}
            className="bg-[#00FF62] hover:bg-[#00e056] text-black text-[10px] font-black uppercase tracking-widest px-5 py-3 rounded-xl transition-all cursor-pointer font-orbitron flex items-center gap-2 shadow-lg shadow-[#00FF62]/20 disabled:opacity-50 w-fit"
          >
            {isSimulating ? <IconLoader2 size={14} className="animate-spin" /> : <IconActivity size={14} />}
            SIMULATE LIVE SCORES
          </button>
        )}
      </div>

      {/* Category Filter Pills + Search */}
      <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4">
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategoryFilter(cat)}
              className={cn(
                "px-3.5 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider border transition-all cursor-pointer font-orbitron",
                categoryFilter === cat
                  ? "bg-[#E31B23] text-white border-[#E31B23]"
                  : "bg-white/5 text-white/50 border-white/10 hover:text-white"
              )}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-72">
          <IconSearch size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search team or squad..."
            className="w-full bg-black/50 border border-white/15 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-white/40 focus:outline-none focus:border-white/30"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 bg-black/50 p-1.5 rounded-2xl border border-white/10 w-fit">
        {(
          [
            { key: "standings", label: "STANDINGS" },
            { key: "fixtures", label: "FIXTURES" },
            { key: "bracket", label: "BRACKET" },
          ] as const
        ).map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              "px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer font-orbitron",
              activeTab === tab.key
                ? "bg-[#E31B23] text-white shadow-lg shadow-[#E31B23]/20"
                : "text-white/50 hover:text-white"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* STANDINGS TAB */}
      {activeTab === "standings" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex gap-2">
              {(
                [
                  { key: "groupA", label: "GROUP A" },
                  { key: "groupB", label: "GROUP B" },
                ] as const
              ).map((grp) => (
                <button
                  key={grp.key}
                  type="button"
                  onClick={() => setSelectedGroup(grp.key)}
                  className={cn(
                    "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider border transition-all cursor-pointer font-orbitron",
                    selectedGroup === grp.key
                      ? "bg-[#00FF62] text-black border-[#00FF62]"
                      : "bg-white/5 text-white/60 border-white/10 hover:text-white"
                  )}
                >
                  {grp.label}
                </button>
              ))}
            </div>
            <span className="text-[10px] font-black uppercase tracking-wider text-[#00FF62] bg-[#00FF62]/10 border border-[#00FF62]/20 px-3.5 py-1.5 rounded-xl font-orbitron w-fit">
              TOP 2 TEAMS QUALIFY FOR CHAMPIONSHIP SEMI-FINALS
            </span>
          </div>

          {isArenaLoading ? (
            <div className="py-12 text-center text-xs text-white/40 font-bold uppercase">Loading standings...</div>
          ) : filteredStandings.length === 0 ? (
            <div className="py-14 text-center bg-black/40 border border-white/5 rounded-3xl">
              <p className="text-xs font-black uppercase tracking-widest text-white/50 font-orbitron">
                NO STANDINGS DATA YET
              </p>
              <p className="text-[11px] text-white/30 mt-1">
                Allocate clubs into groups and start the tournament to view live standings.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto border border-white/10 rounded-2xl">
              <table className="w-full min-w-[680px] text-left border-collapse">
                <thead>
                  <tr className="bg-white/5 border-b border-white/10 text-[10px] font-black uppercase tracking-widest text-white/60 font-orbitron">
                    <th className="px-4 py-3.5">POS</th>
                    <th className="px-4 py-3.5">SQUAD / CLUB</th>
                    <th className="px-3 py-3.5 text-center">P</th>
                    <th className="px-3 py-3.5 text-center">W</th>
                    <th className="px-3 py-3.5 text-center">D</th>
                    <th className="px-3 py-3.5 text-center">L</th>
                    <th className="px-3 py-3.5 text-center">GF</th>
                    <th className="px-3 py-3.5 text-center">GA</th>
                    <th className="px-3 py-3.5 text-center">GD</th>
                    <th className="px-4 py-3.5 text-center">PTS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {filteredStandings.map((row, idx) => {
                    const pos = idx + 1;
                    const qualified = row.qualified ?? pos <= 2;
                    return (
                      <tr
                        key={row.key}
                        className={cn(
                          "transition-colors",
                          qualified
                            ? "bg-[#00FF62]/5 border-l-4 border-l-[#00FF62]"
                            : "hover:bg-white/5"
                        )}
                      >
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-1.5 font-black font-orbitron text-xs">
                            <span className={qualified ? "text-[#00FF62]" : "text-white/70"}>{pos}</span>
                            {qualified && (
                              <span className="text-[9px] bg-[#00FF62] text-black px-1.5 py-0.5 rounded font-black">
                                Q
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-3">
                            <ClubBadgeAvatar
                              club={{
                                clubName: row.team.name,
                                logo: row.team.logo,
                                badgePreset: row.team.badgePreset,
                              }}
                              sizeClass="size-8"
                            />
                            <span className="text-xs font-black text-white uppercase">{row.team.name}</span>
                          </div>
                        </td>
                        <td className="px-3 py-3.5 text-center text-xs text-white/80 tabular-nums">{row.played}</td>
                        <td className="px-3 py-3.5 text-center text-xs text-white/80 tabular-nums">{row.won}</td>
                        <td className="px-3 py-3.5 text-center text-xs text-white/80 tabular-nums">{row.drawn}</td>
                        <td className="px-3 py-3.5 text-center text-xs text-white/80 tabular-nums">{row.lost}</td>
                        <td className="px-3 py-3.5 text-center text-xs text-white/80 tabular-nums">{row.goalsFor}</td>
                        <td className="px-3 py-3.5 text-center text-xs text-white/80 tabular-nums">{row.goalsAgainst}</td>
                        <td className="px-3 py-3.5 text-center text-xs text-white/80 tabular-nums">
                          {row.goalDifference > 0 ? `+${row.goalDifference}` : row.goalDifference}
                        </td>
                        <td className="px-4 py-3.5 text-center text-sm font-black font-orbitron text-[#00FF62] tabular-nums">
                          {row.points}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* FIXTURES TAB */}
      {activeTab === "fixtures" && (
        <div className="space-y-6">
          {filteredMatches.length === 0 ? (
            <div className="py-14 text-center bg-black/40 border border-white/5 rounded-3xl">
              <p className="text-xs font-black uppercase tracking-widest text-white/50 font-orbitron">
                NO FIXTURES SCHEDULED YET
              </p>
              <p className="text-[11px] text-white/30 mt-1">
                Start the tournament from Admin view to generate group fixtures.
              </p>
            </div>
          ) : (
            fixtureSections.map(([sectionTitle, sectionMatches]) => {
              const completedCount = sectionMatches.filter((m) => m.isCompleted).length;
              const pendingCount = sectionMatches.length - completedCount;
              return (
                <div key={sectionTitle} className="space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-2">
                    <h3 className="text-xs font-black uppercase tracking-widest text-white font-orbitron">
                      {sectionTitle}
                    </h3>
                    <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-wider font-orbitron">
                      {pendingCount > 0 && (
                        <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30">
                          {pendingCount} Pending
                        </span>
                      )}
                      <span className="px-2.5 py-0.5 rounded-full bg-[#00FF62]/10 text-[#00FF62] border border-[#00FF62]/30">
                        {completedCount} Completed
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {sectionMatches.map((fx) => {
                      const draft = scoreDrafts[fx.key] || {
                        s1: fx.homeScore !== null ? String(fx.homeScore) : "",
                        s2: fx.awayScore !== null ? String(fx.awayScore) : "",
                      };
                      const isTbd = fx.home.isTbd || fx.away.isTbd;
                      const isSavingThis = isRecording && recordingMatchId === fx.key;
                      return (
                        <div
                          key={fx.key}
                          className={cn(
                            "bg-black/40 border rounded-2xl p-4 space-y-3 transition-all",
                            fx.isCompleted
                              ? "border-[#00FF62]/25"
                              : isTbd
                                ? "border-white/10 opacity-70"
                                : "border-amber-500/30"
                          )}
                        >
                          <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-widest">
                            <span className="text-white/50">{fx.stageLabel}</span>
                            <span
                              className={cn(
                                "px-2 py-0.5 rounded border",
                                fx.isCompleted
                                  ? "bg-[#00FF62]/10 text-[#00FF62] border-[#00FF62]/30"
                                  : isTbd
                                    ? "bg-white/5 text-white/40 border-white/10"
                                    : "bg-amber-500/10 text-amber-400 border-amber-500/30"
                              )}
                            >
                              {fx.isCompleted ? "COMPLETED" : isTbd ? "WAITING QUALIFIER" : "SCORE NEEDED"}
                            </span>
                          </div>

                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2 min-w-0 flex-1">
                              <ClubBadgeAvatar
                                club={{
                                  clubName: fx.home.name,
                                  logo: fx.home.logo,
                                  badgePreset: fx.home.badgePreset,
                                }}
                                sizeClass="size-8"
                              />
                              <span className="text-xs font-bold text-white truncate">{fx.home.name}</span>
                            </div>

                            {!readOnly && !isTbd ? (
                              <div className="flex items-center gap-1.5 shrink-0">
                                <input
                                  type="number"
                                  min={0}
                                  placeholder="-"
                                  value={draft.s1}
                                  onChange={(e) =>
                                    setScoreDrafts((prev) => ({
                                      ...prev,
                                      [fx.key]: { ...draft, s1: e.target.value },
                                    }))
                                  }
                                  className="w-11 bg-[#111] border border-white/15 rounded-lg py-1 text-center text-xs font-black text-white"
                                />
                                <span className="text-white/40 font-black">-</span>
                                <input
                                  type="number"
                                  min={0}
                                  placeholder="-"
                                  value={draft.s2}
                                  onChange={(e) =>
                                    setScoreDrafts((prev) => ({
                                      ...prev,
                                      [fx.key]: { ...draft, s2: e.target.value },
                                    }))
                                  }
                                  className="w-11 bg-[#111] border border-white/15 rounded-lg py-1 text-center text-xs font-black text-white"
                                />
                                <button
                                  type="button"
                                  disabled={isSavingThis}
                                  onClick={() => handleRecordScore(fx)}
                                  className={cn(
                                    "px-2.5 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider cursor-pointer disabled:opacity-40 flex items-center gap-1 font-orbitron",
                                    fx.isCompleted
                                      ? "bg-white/10 hover:bg-white/15 text-white"
                                      : "bg-[#00FF62] hover:bg-[#00e056] text-black"
                                  )}
                                >
                                  {isSavingThis ? (
                                    <IconLoader2 size={12} className="animate-spin" />
                                  ) : (
                                    <IconCheck size={12} />
                                  )}
                                  {fx.isCompleted ? "Update" : "Save"}
                                </button>
                              </div>
                            ) : (
                              <span className="text-sm font-black font-orbitron text-[#00FF62] bg-black/60 border border-white/10 px-3 py-1 rounded-xl shrink-0">
                                {fx.homeScore ?? "-"} : {fx.awayScore ?? "-"}
                              </span>
                            )}

                            <div className="flex items-center justify-end gap-2 min-w-0 flex-1">
                              <span className="text-xs font-bold text-white truncate text-right">{fx.away.name}</span>
                              <ClubBadgeAvatar
                                club={{
                                  clubName: fx.away.name,
                                  logo: fx.away.logo,
                                  badgePreset: fx.away.badgePreset,
                                }}
                                sizeClass="size-8"
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* BRACKET TAB */}
      {activeTab === "bracket" && (
        <div className="space-y-6">
          {normalized.bracket.semis.length === 0 && !normalized.bracket.final ? (
            <div className="py-14 text-center bg-black/40 border border-white/5 rounded-3xl">
              <IconTrophy size={32} className="mx-auto text-white/20 mb-2" />
              <p className="text-xs font-black uppercase tracking-widest text-white/50 font-orbitron">
                KNOCKOUT BRACKET NOT GENERATED YET
              </p>
              <p className="text-[11px] text-white/30 mt-1">
                Complete the Group Stage to seed the Semi-Finals and Grand Final.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
              {/* Semi-Finals */}
              <div className="space-y-4">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-white/50 font-orbitron">
                  SEMI-FINALS {!readOnly && "— ENTER SCORES TO ADVANCE TO GRAND FINAL"}
                </h4>
                {normalized.bracket.semis.map((sf) => {
                  const draft = scoreDrafts[sf.key] || {
                    s1: sf.homeScore !== null ? String(sf.homeScore) : "",
                    s2: sf.awayScore !== null ? String(sf.awayScore) : "",
                  };
                  const canEdit = !readOnly && !sf.home.isTbd && !sf.away.isTbd;
                  const isSavingThis = isRecording && recordingMatchId === sf.key;
                  return (
                    <div
                      key={sf.key}
                      className={cn(
                        "bg-black/40 border rounded-2xl p-4 space-y-3",
                        sf.isCompleted ? "border-[#00FF62]/30" : "border-amber-500/30"
                      )}
                    >
                      <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-widest">
                        <span className="text-white/40">Semi-Final</span>
                        <span className={sf.isCompleted ? "text-[#00FF62]" : "text-amber-400"}>
                          {sf.isCompleted ? "COMPLETED" : "SCORE NEEDED"}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-xs gap-3">
                        <span className="font-bold text-white truncate">{sf.home.name}</span>
                        {canEdit ? (
                          <input
                            type="number"
                            min={0}
                            placeholder="-"
                            value={draft.s1}
                            onChange={(e) =>
                              setScoreDrafts((prev) => ({
                                ...prev,
                                [sf.key]: { ...draft, s1: e.target.value },
                              }))
                            }
                            className="w-14 bg-[#111] border border-white/15 rounded-lg py-1 text-center text-xs font-black text-white"
                          />
                        ) : (
                          <span className="font-black font-orbitron text-[#00FF62]">{sf.homeScore ?? "-"}</span>
                        )}
                      </div>
                      <div className="flex justify-between items-center text-xs border-t border-white/5 pt-2 gap-3">
                        <span className="font-bold text-white truncate">{sf.away.name}</span>
                        {canEdit ? (
                          <input
                            type="number"
                            min={0}
                            placeholder="-"
                            value={draft.s2}
                            onChange={(e) =>
                              setScoreDrafts((prev) => ({
                                ...prev,
                                [sf.key]: { ...draft, s2: e.target.value },
                              }))
                            }
                            className="w-14 bg-[#111] border border-white/15 rounded-lg py-1 text-center text-xs font-black text-white"
                          />
                        ) : (
                          <span className="font-black font-orbitron text-[#00FF62]">{sf.awayScore ?? "-"}</span>
                        )}
                      </div>
                      {canEdit && (
                        <button
                          type="button"
                          disabled={isSavingThis}
                          onClick={() => handleRecordScore(sf)}
                          className="w-full py-2 rounded-xl bg-[#00FF62] hover:bg-[#00e056] text-black text-[10px] font-black uppercase tracking-widest font-orbitron cursor-pointer disabled:opacity-40 flex items-center justify-center gap-1.5"
                        >
                          {isSavingThis ? <IconLoader2 size={12} className="animate-spin" /> : <IconCheck size={12} />}
                          {sf.isCompleted ? "Update Semi-Final Score" : "Save Semi-Final Score"}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Grand Final */}
              {normalized.bracket.final && (() => {
                const gf = normalized.bracket.final;
                const draft = scoreDrafts[gf.key] || {
                  s1: gf.homeScore !== null ? String(gf.homeScore) : "",
                  s2: gf.awayScore !== null ? String(gf.awayScore) : "",
                };
                const canEdit = !readOnly && !gf.home.isTbd && !gf.away.isTbd;
                const isSavingThis = isRecording && recordingMatchId === gf.key;
                return (
                  <div className="bg-linear-to-b from-[#E31B23]/10 via-black to-black border-2 border-amber-500/40 rounded-3xl p-6 space-y-4">
                    <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-amber-400 font-orbitron">
                      <span className="flex items-center gap-2">
                        <IconCrown size={14} /> GRAND FINAL
                      </span>
                      <span className={gf.isCompleted ? "text-[#00FF62]" : "text-amber-400"}>
                        {gf.isCompleted ? "COMPLETED" : canEdit ? "SCORE NEEDED" : "WAITING"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm gap-3">
                      <span className="font-bold text-white truncate">{gf.home.name}</span>
                      {canEdit ? (
                        <input
                          type="number"
                          min={0}
                          placeholder="-"
                          value={draft.s1}
                          onChange={(e) =>
                            setScoreDrafts((prev) => ({
                              ...prev,
                              [gf.key]: { ...draft, s1: e.target.value },
                            }))
                          }
                          className="w-14 bg-[#111] border border-white/15 rounded-lg py-1 text-center text-xs font-black text-white"
                        />
                      ) : (
                        <span className="font-black font-orbitron text-amber-400">{gf.homeScore ?? "TBD"}</span>
                      )}
                    </div>
                    <div className="flex justify-between items-center text-sm border-t border-white/10 pt-2.5 gap-3">
                      <span className="font-bold text-white truncate">{gf.away.name}</span>
                      {canEdit ? (
                        <input
                          type="number"
                          min={0}
                          placeholder="-"
                          value={draft.s2}
                          onChange={(e) =>
                            setScoreDrafts((prev) => ({
                              ...prev,
                              [gf.key]: { ...draft, s2: e.target.value },
                            }))
                          }
                          className="w-14 bg-[#111] border border-white/15 rounded-lg py-1 text-center text-xs font-black text-white"
                        />
                      ) : (
                        <span className="font-black font-orbitron text-amber-400">{gf.awayScore ?? "TBD"}</span>
                      )}
                    </div>
                    {canEdit && (
                      <button
                        type="button"
                        disabled={isSavingThis}
                        onClick={() => handleRecordScore(gf)}
                        className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-[10px] font-black uppercase tracking-widest font-orbitron cursor-pointer disabled:opacity-40 flex items-center justify-center gap-1.5"
                      >
                        {isSavingThis ? <IconLoader2 size={12} className="animate-spin" /> : <IconCheck size={12} />}
                        {gf.isCompleted ? "Update Grand Final Score" : "Save Grand Final Score"}
                      </button>
                    )}
                    {normalized.bracket.champion && (
                      <div className="pt-3 border-t border-amber-500/20 text-center">
                        <p className="text-[9px] font-black uppercase tracking-widest text-white/50">Champion</p>
                        <p className="text-base font-black uppercase text-amber-400 font-orbitron">
                          {normalized.bracket.champion.name}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
