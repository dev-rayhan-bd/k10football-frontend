"use client";

import { useMemo, useState } from "react";
import {
  IconTrophy,
  IconTable,
  IconCalendarEvent,
  IconEye,
  IconSearch,
  IconCrown,
  IconTournament,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import type { IBadgePreset } from "@/types/extraEvent.type";
import TournamentTeamBadge from "./TournamentTeamBadge";
import { StatusPill } from "./PublicTournamentHeader";
import type {
  TournamentBracket,
  TournamentMatch,
  TournamentStandingRow,
  TournamentTeam,
} from "./tournament.utils";

type ArenaTab = "standings" | "fixtures" | "bracket";

interface PublicTournamentArenaProps {
  tournamentStatus?: string;
  isLive?: boolean;
  standings: { groupA: TournamentStandingRow[]; groupB: TournamentStandingRow[] };
  matches: TournamentMatch[];
  bracket: TournamentBracket;
  presets: IBadgePreset[];
}

const TABS: { key: ArenaTab; label: string; icon: typeof IconTable }[] = [
  { key: "standings", label: "Standings", icon: IconTable },
  { key: "fixtures", label: "Fixtures & Results", icon: IconCalendarEvent },
  { key: "bracket", label: "Bracket", icon: IconTrophy },
];

const STANDING_COLS = ["P", "W", "D", "L", "GF", "GA", "GD"] as const;

const EmptyState = ({ title, text }: { title: string; text: string }) => (
  <div className="rounded-3xl border border-dashed border-white/15 bg-black/40 p-10 text-center flex flex-col items-center gap-2">
    <IconTournament size={32} className="text-white/20" />
    <p className="text-sm font-black uppercase text-white/70 font-orbitron">{title}</p>
    <p className="text-xs text-white/40 max-w-sm">{text}</p>
  </div>
);

const sectionOrder = (m: TournamentMatch) =>
  m.kind === "group" ? 0 : m.kind === "semi" ? 1 : m.kind === "final" ? 2 : 3;

const matchesQuery = (m: TournamentMatch, q: string) =>
  !q || m.home.name.toLowerCase().includes(q) || m.away.name.toLowerCase().includes(q);

const PublicTournamentArena = ({
  tournamentStatus,
  isLive,
  standings,
  matches,
  bracket,
  presets,
}: PublicTournamentArenaProps) => {
  const [activeTab, setActiveTab] = useState<ArenaTab>("standings");
  const [selectedGroup, setSelectedGroup] = useState<"groupA" | "groupB">("groupA");
  const [searchQuery, setSearchQuery] = useState("");
  const q = searchQuery.trim().toLowerCase();

  const fixtureSections = useMemo(() => {
    const sorted = matches
      .filter((m) => matchesQuery(m, q))
      .map((m, i) => ({ m, i }))
      .sort((a, b) => sectionOrder(a.m) - sectionOrder(b.m) || a.i - b.i)
      .map(({ m }) => m);
    const sections = new Map<string, TournamentMatch[]>();
    for (const m of sorted) {
      const label = m.kind === "semi" ? "Semi-finals" : m.stageLabel;
      sections.set(label, [...(sections.get(label) ?? []), m]);
    }
    // Group A before Group B, etc.
    return [...sections.entries()].sort(([a, am], [b, bm]) =>
      sectionOrder(am[0]) - sectionOrder(bm[0]) || (am[0].kind === "group" ? a.localeCompare(b) : 0)
    );
  }, [matches, q]);

  const rows = standings[selectedGroup].filter((r) => !q || r.team.name.toLowerCase().includes(q));
  const hasBracket = bracket.semis.length > 0 || !!bracket.final;
  const isCompleted = (tournamentStatus || "").toUpperCase() === "COMPLETED";

  const badge = (team: TournamentTeam, size: string) => (
    <TournamentTeamBadge team={team} presets={presets} className={size} />
  );

  const fixtureSide = (f: TournamentMatch, side: "home" | "away") => {
    const team = f[side];
    return (
      <div className="flex-1 min-w-0 text-center flex flex-col items-center gap-2">
        {badge(team, "size-10")}
        <div
          className={cn(
            "text-xs uppercase truncate max-w-full",
            f.winner === side ? "font-black text-white" : "font-bold text-white/80",
            team.isTbd && "text-white/40"
          )}
        >
          {team.name}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-linear-to-b from-[#141417] via-[#0E0E10] to-[#0A0A0C] rounded-4xl border border-white/15 p-6 md:p-10 shadow-2xl flex flex-col gap-8 relative overflow-hidden">
      <div className="absolute top-0 right-1/4 size-96 bg-radial from-[#00FF62]/5 to-transparent pointer-events-none" />
      <div className="absolute bottom-0 left-10 size-96 bg-radial from-[#E31B23]/5 to-transparent pointer-events-none" />

      {/* Header Bar */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 border-b border-white/10 pb-6 relative">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-2xl bg-[#E31B23]/10 border border-[#E31B23]/30 flex items-center justify-center text-[#E31B23] shadow-lg shadow-[#E31B23]/10">
            <IconTrophy size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-2xl md:text-3xl font-black uppercase text-white font-orbitron tracking-tight leading-none">
                Tournament Arena
              </h2>
              <StatusPill tournamentStatus={tournamentStatus} isLive={isLive} />
            </div>
            <p className="text-white/50 font-bold uppercase tracking-widest text-[9px] mt-1">
              Official Live Standings, Match Schedules and Knockout Brackets
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 bg-black/70 p-1.5 rounded-2xl border border-white/10 shrink-0">
          {TABS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              type="button"
              onClick={() => setActiveTab(key)}
              className={cn(
                "px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 cursor-pointer font-orbitron",
                activeTab === key
                  ? "bg-[#E31B23] text-white shadow-lg shadow-[#E31B23]/30 border border-[#E31B23]"
                  : "text-white/40 hover:text-white hover:bg-white/5"
              )}
            >
              <Icon size={15} />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Search Filter */}
      {activeTab !== "bracket" && (
        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 relative bg-white/2 p-3 rounded-2xl border border-white/5">
          <div className="flex items-center gap-2 text-[9px] font-black text-white/40 uppercase tracking-widest">
            <IconEye size={14} className="text-amber-400" />
            <span>Public View — Read Only</span>
          </div>
          <div className="relative shrink-0 w-full sm:w-64">
            <IconSearch size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search team..."
              className="w-full bg-black/60 border border-white/10 rounded-xl py-2 pl-9 pr-3 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-[#E31B23] transition-all"
            />
          </div>
        </div>
      )}

      {/* TAB 1: STANDINGS */}
      {activeTab === "standings" && (
        <div className="flex flex-col gap-6 relative">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex bg-black/50 p-1 rounded-xl border border-white/10">
              {(["groupA", "groupB"] as const).map((grp) => (
                <button
                  key={grp}
                  type="button"
                  onClick={() => setSelectedGroup(grp)}
                  className={cn(
                    "px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer font-orbitron",
                    selectedGroup === grp
                      ? "bg-[#E31B23] text-white shadow-md shadow-[#E31B23]/20"
                      : "text-white/40 hover:text-white"
                  )}
                >
                  {grp === "groupA" ? "Group A" : "Group B"}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 text-[9px] font-bold text-white/40 uppercase tracking-widest">
              <span className="size-2.5 rounded-sm bg-[#00FF62]" /> Top 2 teams qualify for Semi-Finals
            </div>
          </div>

          {standings[selectedGroup].length === 0 ? (
            <EmptyState title="No standings yet" text="Group tables appear once teams are allocated to groups." />
          ) : (
            <div className="overflow-x-auto rounded-3xl border border-white/15 bg-black/60 shadow-2xl backdrop-blur-md">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10 bg-white/5">
                    <th className="p-4 text-[9px] font-black uppercase tracking-wider text-white/40 text-center w-14 font-orbitron">
                      POS
                    </th>
                    <th className="p-4 text-[9px] font-black uppercase tracking-wider text-white/40 font-orbitron">
                      SQUAD / CLUB
                    </th>
                    {STANDING_COLS.map((c) => (
                      <th
                        key={c}
                        className="p-4 text-[9px] font-black uppercase tracking-wider text-white/40 text-center font-orbitron"
                      >
                        {c}
                      </th>
                    ))}
                    <th className="p-4 text-[9px] font-black uppercase tracking-wider text-[#00FF62] text-center font-orbitron">
                      PTS
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => {
                    const position = standings[selectedGroup].indexOf(row) + 1;
                    const isQualified = row.qualified ?? position <= 2;
                    return (
                      <tr
                        key={row.key}
                        className={cn(
                          "border-b border-white/5 transition-all hover:bg-white/5",
                          isQualified && "bg-[#00FF62]/5 border-l-4 border-l-[#00FF62]"
                        )}
                      >
                        <td className="p-4 text-center font-black text-xs font-orbitron">
                          <div className="flex items-center justify-center gap-1">
                            <span className={isQualified ? "text-[#00FF62]" : "text-white/60"}>{position}</span>
                            {isQualified && (
                              <span className="bg-[#00FF62]/20 text-[#00FF62] text-[8px] font-black px-1.5 rounded font-orbitron">
                                Q
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-3 min-w-40">
                            {badge(row.team, "size-7")}
                            <span className="text-sm font-bold text-white uppercase tracking-tight truncate">
                              {row.team.name}
                            </span>
                          </div>
                        </td>
                        <td className="p-4 text-center font-bold text-sm text-white">{row.played}</td>
                        <td className="p-4 text-center text-sm font-bold text-[#00FF62]">{row.won}</td>
                        <td className="p-4 text-center text-sm font-bold text-white/40">{row.drawn}</td>
                        <td className="p-4 text-center text-sm font-bold text-red-400">{row.lost}</td>
                        <td className="p-4 text-center text-sm text-white/60">{row.goalsFor}</td>
                        <td className="p-4 text-center text-sm text-white/60">{row.goalsAgainst}</td>
                        <td
                          className={cn(
                            "p-4 text-center text-sm font-bold",
                            row.goalDifference > 0
                              ? "text-[#00FF62]"
                              : row.goalDifference < 0
                                ? "text-red-400"
                                : "text-white/60"
                          )}
                        >
                          {row.goalDifference > 0 ? `+${row.goalDifference}` : row.goalDifference}
                        </td>
                        <td className="p-4 text-center font-black text-base text-[#00FF62] font-orbitron">
                          {row.points}
                        </td>
                      </tr>
                    );
                  })}
                  {rows.length === 0 && (
                    <tr>
                      <td colSpan={10} className="p-6 text-center text-xs text-white/40">
                        No team matches &quot;{searchQuery}&quot;.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: FIXTURES & RESULTS */}
      {activeTab === "fixtures" && (
        <div className="flex flex-col gap-8 relative">
          {matches.length === 0 ? (
            <EmptyState title="No fixtures yet" text="Fixtures are published when the group stage starts." />
          ) : fixtureSections.length === 0 ? (
            <EmptyState title="No matches found" text={`No fixture involves a team matching "${searchQuery}".`} />
          ) : (
            fixtureSections.map(([label, list]) => (
              <div key={label} className="flex flex-col gap-4">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-white/50 font-orbitron flex items-center gap-2">
                  <span className={cn("size-2 rounded-full", list[0].kind === "group" ? "bg-[#00FF62]" : "bg-[#E31B23]")} />
                  {label}
                  <span className="text-white/25">({list.length})</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {list.map((f) => {
                    const hasScore = f.homeScore !== null && f.awayScore !== null;
                    return (
                      <div
                        key={f.key}
                        className={cn(
                          "bg-black/60 border rounded-3xl p-6 flex flex-col justify-between gap-4 shadow-xl transition-all",
                          f.isLive ? "border-red-500/40" : "border-white/10 hover:border-white/20"
                        )}
                      >
                        <div className="flex justify-between items-center gap-2">
                          <span className="text-[9px] font-black uppercase tracking-wider text-white/40 font-orbitron truncate">
                            {f.stageLabel}
                          </span>
                          <span
                            className={cn(
                              "px-2.5 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest font-orbitron flex items-center gap-1 border shrink-0",
                              f.isLive && "bg-red-500/10 text-red-400 border-red-500/30",
                              f.isCompleted && "bg-[#00FF62]/10 text-[#00FF62] border-[#00FF62]/30",
                              !f.isLive && !f.isCompleted && "bg-white/5 text-white/50 border-white/10"
                            )}
                          >
                            {f.isLive && <span className="size-1.5 rounded-full bg-red-500 animate-pulse" />}
                            {f.isLive ? "LIVE" : f.isCompleted ? "FULL TIME" : "SCHEDULED"}
                          </span>
                        </div>

                        <div className="flex items-center justify-between gap-3 bg-white/2 p-4 rounded-2xl border border-white/5">
                          {fixtureSide(f, "home")}
                          <div className="bg-black border border-white/15 px-5 py-3 rounded-2xl shrink-0 font-black text-lg font-orbitron text-white text-center shadow-inner">
                            {hasScore ? `${f.homeScore} - ${f.awayScore}` : f.kickoff || "VS"}
                          </div>
                          {fixtureSide(f, "away")}
                        </div>

                        <div className="flex justify-between items-center gap-2 text-[9px] text-white/40 font-bold uppercase tracking-widest pt-2 border-t border-white/5">
                          <span>{f.date || "Date TBA"}</span>
                          {f.pitch && (
                            <span className="bg-white/5 border border-white/10 px-2.5 py-0.5 rounded-lg text-[#00FF62] font-orbitron truncate">
                              {f.pitch}
                            </span>
                          )}
                          <span>{f.kickoff ? `KO ${f.kickoff}` : "KO TBA"}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 3: BRACKET */}
      {activeTab === "bracket" && (
        <div className="relative">
          {!hasBracket ? (
            <EmptyState
              title="Bracket appears after the group stage"
              text="The top two teams from each group advance to the semi-finals, then the grand final."
            />
          ) : (
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-start gap-10 py-2 overflow-x-auto">
              {/* Semi-finals */}
              <div className="flex flex-col gap-6 w-full lg:max-w-sm">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-white/40 text-center font-orbitron flex items-center justify-center gap-2">
                  <span className="size-2 rounded-full bg-[#E31B23]" />
                  Semi-Final Knockouts
                </h4>
                {bracket.semis.length === 0 && (
                  <p className="text-xs text-white/40 text-center">Semi-final pairings to be confirmed.</p>
                )}
                {bracket.semis.map((match, idx) => (
                  <div
                    key={match.key}
                    className="bg-black/60 border border-white/15 rounded-3xl p-5 flex flex-col gap-4 shadow-2xl hover:border-white/25 transition-all"
                  >
                    <div className="flex justify-between items-center gap-2 text-[9px] font-bold text-white/40 uppercase tracking-widest border-b border-white/5 pb-2">
                      <span>Semi-final {idx + 1}</span>
                      <span className="flex items-center gap-2">
                        {match.isLive && <span className="text-red-400">LIVE</span>}
                        {[match.date, match.kickoff].filter(Boolean).join(" · ")}
                      </span>
                    </div>
                    <div className="flex flex-col gap-3">
                      {(["home", "away"] as const).map((side) => {
                        const score = side === "home" ? match.homeScore : match.awayScore;
                        return (
                          <div
                            key={side}
                            className={cn(
                              "flex justify-between items-center gap-2 p-2 rounded-xl transition-all",
                              match.winner === side && "bg-[#00FF62]/10 border border-[#00FF62]/30"
                            )}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              {badge(match[side], "size-6")}
                              <span
                                className={cn(
                                  "text-xs truncate",
                                  match.winner === side ? "font-black text-white" : "text-white/60"
                                )}
                              >
                                {match[side].name}
                              </span>
                            </div>
                            <span className="text-xs font-black text-white font-orbitron bg-black/60 px-2.5 py-1 rounded-lg border border-white/10">
                              {score ?? "-"}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              <div className="hidden lg:block w-12 h-0.5 bg-linear-to-r from-white/10 via-[#E31B23] to-amber-500 shrink-0" />

              {/* Grand Final */}
              <div className="w-full lg:max-w-sm flex flex-col gap-4">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-amber-400 text-center font-orbitron flex items-center justify-center gap-2">
                  <IconCrown size={14} />
                  Championship Grand Final
                </h4>
                {bracket.final ? (
                  <div className="bg-linear-to-b from-[#E31B23]/10 via-black to-black border-2 border-amber-500/40 rounded-4xl p-6 flex flex-col gap-4 shadow-2xl">
                    <div className="flex justify-between items-center gap-2 text-[9px] font-black uppercase tracking-widest text-amber-400 border-b border-amber-500/20 pb-2">
                      <span>{bracket.final.isLive ? "LIVE — Grand Final" : "Grand Final"}</span>
                      <span>{[bracket.final.date, bracket.final.kickoff].filter(Boolean).join(" · ")}</span>
                    </div>
                    <div className="flex flex-col gap-3">
                      {(["home", "away"] as const).map((side) => {
                        const final = bracket.final as TournamentMatch;
                        const score = side === "home" ? final.homeScore : final.awayScore;
                        return (
                          <div
                            key={side}
                            className="flex justify-between items-center gap-2 p-2 rounded-xl border border-white/5 bg-white/2"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              {badge(final[side], "size-7")}
                              <span
                                className={cn(
                                  "text-sm truncate",
                                  final.winner === side ? "font-black text-white" : "text-white/80"
                                )}
                              >
                                {final[side].name}
                              </span>
                            </div>
                            <span className="text-base font-black text-amber-400 font-orbitron">{score ?? "TBD"}</span>
                          </div>
                        );
                      })}
                    </div>

                    {bracket.champion && (isCompleted || bracket.final.isCompleted) && (
                      <div className="mt-2 pt-4 border-t border-amber-500/30 flex flex-col items-center justify-center gap-1.5 bg-amber-500/10 rounded-2xl p-4">
                        <IconTrophy className="text-amber-400 animate-bounce" size={36} />
                        <p className="text-[9px] font-black text-white/60 uppercase tracking-widest">
                          Tournament Champion
                        </p>
                        <div className="flex items-center gap-2">
                          {badge(bracket.champion, "size-7")}
                          <p className="text-lg font-black text-amber-400 uppercase font-orbitron tracking-tight text-center">
                            {bracket.champion.name}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="rounded-4xl border-2 border-dashed border-amber-500/20 p-8 text-center text-xs text-white/40">
                    Finalists are decided by the semi-finals.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PublicTournamentArena;
