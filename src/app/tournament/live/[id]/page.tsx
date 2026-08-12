/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  getStoredEvents,
  TOURNAMENT_PRESET_LOGOS,
  CLUB_PRESET_LOGOS
} from "@/components/user-wise-dashboard/academy-management/extraEvents";
import {
  IconTrophy,
  IconShield,
  IconMapPin,
  IconCalendarEvent,
  IconUsers,
  IconEye,
  IconTable,
  IconCrown,
  IconSearch,
  IconBallFootball,
  IconRefresh,
  IconUser,
  IconPhone,
  IconMail,
  IconCopy,
  IconCheck
} from "@tabler/icons-react";
import Image from "next/image";

export default function PublicTournamentLivePage() {
  const params = useParams();
  const eventId = Number(params?.id);

  const [event, setEvent] = useState<any>(null);
  const [teams, setTeams] = useState<any[]>([]);
  const [status, setStatus] = useState<"registration" | "live" | "completed">("registration");
  const [groupA, setGroupA] = useState<string[]>([]);
  const [groupB, setGroupB] = useState<string[]>([]);
  const [groupFixtures, setGroupFixtures] = useState<any[]>([]);
  const [semis, setSemis] = useState<any[]>([]);
  const [finalMatch, setFinalMatch] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"standings" | "fixtures" | "bracket">("standings");
  const [selectedGroup, setSelectedGroup] = useState<"Group A" | "Group B">("Group A");
  const [searchQuery, setSearchQuery] = useState("");
  const [copied, setCopied] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<string>("");

  const loadAllData = () => {
    if (!eventId) return;

    // Load event details
    const list = getStoredEvents();
    const found = list.find((e: any) => e.id === eventId);
    if (found) {
      setEvent(found);
    } else {
      setEvent(null);
      return;
    }

    // Load teams
    const storedTeams = localStorage.getItem(`k10_tournament_teams_${eventId}`);
    if (storedTeams) setTeams(JSON.parse(storedTeams));

    // Load status
    const storedStatus = localStorage.getItem(`k10_tournament_status_${eventId}`);
    if (storedStatus) setStatus(storedStatus as any);

    // Load groups
    const storedGroupA = localStorage.getItem(`k10_tournament_group_a_${eventId}`);
    const storedGroupB = localStorage.getItem(`k10_tournament_group_b_${eventId}`);
    if (storedGroupA) setGroupA(JSON.parse(storedGroupA));
    if (storedGroupB) setGroupB(JSON.parse(storedGroupB));

    // Load fixtures
    const storedFixtures = localStorage.getItem(`k10_tournament_fixtures_${eventId}`);
    const storedSemis = localStorage.getItem(`k10_tournament_semis_${eventId}`);
    const storedFinal = localStorage.getItem(`k10_tournament_final_${eventId}`);
    if (storedFixtures) setGroupFixtures(JSON.parse(storedFixtures));
    if (storedSemis) setSemis(JSON.parse(storedSemis));
    if (storedFinal) setFinalMatch(JSON.parse(storedFinal));

    setLastRefreshed(new Date().toLocaleTimeString());
  };

  useEffect(() => {
    loadAllData();
  }, [eventId]);

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Standings calculator
  const calculateStandings = (grpName: string) => {
    const grpTeams = grpName === "Group A" ? groupA : groupB;
    const stats: { [key: string]: any } = {};

    grpTeams.forEach((tId) => {
      stats[tId] = { id: tId, name: getTeamName(tId), p: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, gd: 0, pts: 0 };
    });

    groupFixtures.filter((f: any) => f.group === grpName).forEach((f: any) => {
      if (f.score1 === null || f.score2 === null) return;
      const s1 = Number(f.score1);
      const s2 = Number(f.score2);

      if (stats[f.team1Id]) {
        stats[f.team1Id].p += 1;
        stats[f.team1Id].gf += s1;
        stats[f.team1Id].ga += s2;
        stats[f.team1Id].gd += (s1 - s2);
        if (s1 > s2) { stats[f.team1Id].w += 1; stats[f.team1Id].pts += 3; }
        else if (s1 === s2) { stats[f.team1Id].d += 1; stats[f.team1Id].pts += 1; }
        else { stats[f.team1Id].l += 1; }
      }
      if (stats[f.team2Id]) {
        stats[f.team2Id].p += 1;
        stats[f.team2Id].gf += s2;
        stats[f.team2Id].ga += s1;
        stats[f.team2Id].gd += (s2 - s1);
        if (s2 > s1) { stats[f.team2Id].w += 1; stats[f.team2Id].pts += 3; }
        else if (s1 === s2) { stats[f.team2Id].d += 1; stats[f.team2Id].pts += 1; }
        else { stats[f.team2Id].l += 1; }
      }
    });

    return Object.values(stats).sort((a: any, b: any) => {
      if (b.pts !== a.pts) return b.pts - a.pts;
      if (b.gd !== a.gd) return b.gd - a.gd;
      return b.gf - a.gf;
    });
  };

  // Helper: render team logo
  const renderTeamLogo = (teamId: string, sizeClass = "w-6 h-6") => {
    const team = teams.find((t) => t.id === teamId);
    if (!team) {
      return <IconShield className={`${sizeClass} text-white/20`} />;
    }
    if (team.customLogo) {
      return <Image width={20} height={20} src={team.customLogo} alt={team.name} className={`${sizeClass} object-contain rounded-full`} />;
    }
    const preset = CLUB_PRESET_LOGOS.find((l) => l.id === team.logoId);
    if (preset) {
      return <div className={sizeClass} dangerouslySetInnerHTML={{ __html: preset.svg }} />;
    }
    return <IconShield className={`${sizeClass} text-white/30`} />;
  };

  const getTeamName = (teamId: string, placeholder = "TBD") => {
    const team = teams.find((t) => t.id === teamId);
    return team ? team.name : placeholder;
  };

  const filteredFixtures = groupFixtures.filter((f) => {
    const t1 = getTeamName(f.team1Id).toLowerCase();
    const t2 = getTeamName(f.team2Id).toLowerCase();
    const q = searchQuery.toLowerCase();
    return t1.includes(q) || t2.includes(q);
  });

  // Loading state
  if (!event) {
    return (
      <div className="min-h-screen bg-[#0A0A0C] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-t-[#E31B23] border-white/10 rounded-full animate-spin mx-auto" />
          <p className="text-white/40 text-sm font-bold uppercase tracking-widest">Loading Tournament...</p>
        </div>
      </div>
    );
  }

  // Pre-tournament (no live data yet)
  const noLiveData = status === "registration" && groupFixtures.length === 0;

  return (
    <div className="min-h-screen bg-[#0A0A0C] text-white">

      {/* K10 Branding Header */}
      <div className="bg-[#0E0E10] border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#E31B23] flex items-center justify-center">
              <IconBallFootball size={18} className="text-white" />
            </div>
            <span className="text-sm font-black uppercase tracking-wider text-white font-orbitron">K10 Football</span>
          </Link>
          <div className="flex items-center gap-3">
            <span className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest font-orbitron flex items-center gap-1.5 border ${status === "live"
                ? "bg-red-500/10 border-red-500/30 text-red-400"
                : status === "completed"
                  ? "bg-[#00FF62]/10 border-[#00FF62]/30 text-[#00FF62]"
                  : "bg-amber-500/10 border-amber-500/30 text-amber-400"
              }`}>
              <span className={`w-2 h-2 rounded-full ${status === "live" ? "bg-red-500 animate-ping" : status === "completed" ? "bg-[#00FF62]" : "bg-amber-400"}`} />
              {status === "live" ? "LIVE" : status === "completed" ? "COMPLETED" : "UPCOMING"}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto py-8 px-4 flex flex-col gap-8">

        {/* Tournament Hero Header */}
        <div className="bg-linear-to-r from-amber-500/10 via-[#161618] to-black rounded-4xl border border-amber-500/30 p-8 md:p-10 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-radial-gradient from-amber-500/10 to-transparent pointer-events-none" />

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
            <div className="flex items-center gap-6">
              {/* Tournament Logo */}
              <div className="w-20 h-20 md:w-24 md:h-24 shrink-0 bg-[#161616] rounded-3xl border border-white/10 p-4 flex items-center justify-center shadow-lg">
                {event.customLogo ? (
                  <Image width={80} height={80} src={event.customLogo} alt="Logo" className="w-full h-full object-contain" />
                ) : (
                  <div dangerouslySetInnerHTML={{
                    __html: TOURNAMENT_PRESET_LOGOS.find(l => l.id === event.logoId)?.svg || TOURNAMENT_PRESET_LOGOS[0].svg
                  }} />
                )}
              </div>

              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 bg-amber-500/20 border border-amber-500/30 px-3.5 py-1.5 rounded-full text-amber-400 text-[10px] font-black uppercase tracking-widest font-orbitron">
                  <IconEye size={14} />
                  Public Live Results
                </div>
                <h1 className="text-2xl md:text-4xl font-black uppercase text-white font-orbitron tracking-tight leading-tight">
                  {event.title}
                </h1>
                <p className="text-sm text-white/60 leading-relaxed max-w-lg">
                  Live scores, group standings, match fixtures, and championship knockout brackets.
                </p>
              </div>
            </div>

            {/* Share & Refresh Buttons */}
            <div className="flex flex-col gap-3 shrink-0 w-full md:w-auto min-w-60">
              <button
                onClick={handleCopyLink}
                className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-black font-black uppercase tracking-wider text-[10px] py-3 px-4 rounded-xl transition-all font-orbitron cursor-pointer shadow-lg shadow-amber-500/20"
              >
                {copied ? (
                  <>
                    <IconCheck size={14} />
                    Link Copied!
                  </>
                ) : (
                  <>
                    <IconCopy size={14} />
                    Share This Page
                  </>
                )}
              </button>
              <button
                onClick={loadAllData}
                className="w-full flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white font-bold uppercase tracking-wider text-[10px] py-2.5 px-4 rounded-xl transition-all border border-white/10 cursor-pointer"
              >
                <IconRefresh size={14} />
                Refresh Results {lastRefreshed && <span className="text-white/30 normal-case">({lastRefreshed})</span>}
              </button>
            </div>
          </div>
        </div>

        {/* Event Info Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-[#111] border border-white/10 rounded-2xl p-5 space-y-1.5">
            <span className="text-[9px] font-black uppercase tracking-widest text-white/40 flex items-center gap-1.5">
              <IconCalendarEvent size={12} /> Date
            </span>
            <p className="text-sm font-bold text-white">{event.date}</p>
          </div>
          <div className="bg-[#111] border border-white/10 rounded-2xl p-5 space-y-1.5">
            <span className="text-[9px] font-black uppercase tracking-widest text-white/40 flex items-center gap-1.5">
              <IconMapPin size={12} /> Venue
            </span>
            <p className="text-sm font-bold text-white truncate">{event.venueName || event.address || "TBA"}</p>
          </div>
          <div className="bg-[#111] border border-white/10 rounded-2xl p-5 space-y-1.5">
            <span className="text-[9px] font-black uppercase tracking-widest text-white/40 flex items-center gap-1.5">
              <IconUsers size={12} /> Teams
            </span>
            <p className="text-sm font-bold text-[#00FF62]">{teams.length} Registered</p>
          </div>
          <div className="bg-[#111] border border-white/10 rounded-2xl p-5 space-y-1.5">
            <span className="text-[9px] font-black uppercase tracking-widest text-white/40 flex items-center gap-1.5">
              <IconUser size={12} /> Organizer
            </span>
            <p className="text-sm font-bold text-white truncate">{event.contactName || "Tournament Admin"}</p>
          </div>
        </div>

        {/* Pre-Tournament Banner */}
        {noLiveData && (
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-3xl p-8 text-center space-y-3">
            <IconTrophy size={40} className="text-amber-400 mx-auto" />
            <h3 className="text-xl font-black uppercase text-white font-orbitron">Tournament Coming Soon</h3>
            <p className="text-sm text-white/50 max-w-md mx-auto">
              Registration is currently open. Live scores, standings, and brackets will appear here once the tournament begins.
            </p>
          </div>
        )}

        {/* Tournament Arena — only show when there is live data */}
        {!noLiveData && (
          <div className="bg-linear-to-b from-[#141417] via-[#0E0E10] to-[#0A0A0C] rounded-4xl border border-white/15 p-6 md:p-10 shadow-2xl flex flex-col gap-8 relative overflow-hidden">
            {/* Background Accent Glow */}
            <div className="absolute top-0 right-1/4 w-96 h-96 bg-radial from-[#00FF62]/5 to-transparent pointer-events-none" />
            <div className="absolute bottom-0 left-10 w-96 h-96 bg-radial from-[#E31B23]/5 to-transparent pointer-events-none" />

            {/* Header Bar */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 border-b border-white/10 pb-6 relative z-10">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#E31B23]/10 border border-[#E31B23]/30 flex items-center justify-center text-[#E31B23] shadow-lg shadow-[#E31B23]/10">
                    <IconTrophy size={22} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-2xl md:text-3xl font-black uppercase text-white font-orbitron tracking-tight leading-none">
                        TOURNAMENT ARENA
                      </h2>
                      <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest font-orbitron flex items-center gap-1.5 border ${status === "live"
                          ? "bg-red-500/10 border-red-500/30 text-red-400 shadow-sm shadow-red-500/20"
                          : status === "completed"
                            ? "bg-[#00FF62]/10 border-[#00FF62]/30 text-[#00FF62]"
                            : "bg-amber-500/10 border-amber-500/30 text-amber-400"
                        }`}>
                        <span className={`w-2 h-2 rounded-full ${status === "live" ? "bg-red-500 animate-ping" : status === "completed" ? "bg-[#00FF62]" : "bg-amber-400"}`} />
                        {status === "live" ? "🔴 LIVE MATCHES IN PROGRESS" : status === "completed" ? "🏆 TOURNAMENT FINISHED" : "📅 UPCOMING"}
                      </span>
                    </div>
                    <p className="text-white/50 font-bold uppercase tracking-widest text-[9px] mt-1">
                      Official Live Standings, Match Schedules and Knockout Brackets
                    </p>
                  </div>
                </div>
              </div>

              {/* Tab Buttons */}
              <div className="flex flex-wrap items-center gap-2 bg-black/70 p-1.5 rounded-2xl border border-white/10 shrink-0">
                <button
                  onClick={() => setActiveTab("standings")}
                  className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 cursor-pointer font-orbitron ${activeTab === "standings"
                      ? "bg-[#E31B23] text-white shadow-lg shadow-[#E31B23]/30 border border-[#E31B23]"
                      : "text-white/40 hover:text-white hover:bg-white/5"
                    }`}
                >
                  <IconTable size={15} />
                  Standings
                </button>
                <button
                  onClick={() => setActiveTab("fixtures")}
                  className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 cursor-pointer font-orbitron ${activeTab === "fixtures"
                      ? "bg-[#E31B23] text-white shadow-lg shadow-[#E31B23]/30 border border-[#E31B23]"
                      : "text-white/40 hover:text-white hover:bg-white/5"
                    }`}
                >
                  <IconCalendarEvent size={15} />
                  Fixtures
                </button>
                <button
                  onClick={() => setActiveTab("bracket")}
                  className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 cursor-pointer font-orbitron ${activeTab === "bracket"
                      ? "bg-[#E31B23] text-white shadow-lg shadow-[#E31B23]/30 border border-[#E31B23]"
                      : "text-white/40 hover:text-white hover:bg-white/5"
                    }`}
                >
                  <IconTrophy size={15} />
                  Bracket
                </button>
              </div>
            </div>

            {/* Search Filter */}
            <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 relative z-10 bg-white/2 p-3 rounded-2xl border border-white/5">
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

            {/* TAB 1: STANDINGS */}
            {activeTab === "standings" && (
              <div className="space-y-6 relative z-10">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex bg-black/50 p-1 rounded-xl border border-white/10">
                    {["Group A", "Group B"].map((grp) => (
                      <button
                        key={grp}
                        onClick={() => setSelectedGroup(grp as any)}
                        className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer font-orbitron ${selectedGroup === grp
                            ? "bg-[#E31B23] text-white shadow-md shadow-[#E31B23]/20"
                            : "text-white/40 hover:text-white"
                          }`}
                      >
                        {grp}
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center gap-2 text-[9px] font-bold text-white/40 uppercase tracking-widest">
                    <span className="w-2.5 h-2.5 rounded-sm bg-[#00FF62]" /> Top 2 teams qualify for Semi-Finals
                  </div>
                </div>

                <div className="overflow-x-auto rounded-3xl border border-white/15 bg-black/60 shadow-2xl backdrop-blur-md">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-white/10 bg-white/5">
                        <th className="p-4 text-[9px] font-black uppercase tracking-wider text-white/40 text-center w-14 font-orbitron">POS</th>
                        <th className="p-4 text-[9px] font-black uppercase tracking-wider text-white/40 font-orbitron">SQUAD / CLUB</th>
                        <th className="p-4 text-[9px] font-black uppercase tracking-wider text-white/40 text-center font-orbitron">P</th>
                        <th className="p-4 text-[9px] font-black uppercase tracking-wider text-white/40 text-center font-orbitron">W</th>
                        <th className="p-4 text-[9px] font-black uppercase tracking-wider text-white/40 text-center font-orbitron">D</th>
                        <th className="p-4 text-[9px] font-black uppercase tracking-wider text-white/40 text-center font-orbitron">L</th>
                        <th className="p-4 text-[9px] font-black uppercase tracking-wider text-white/40 text-center font-orbitron">GF</th>
                        <th className="p-4 text-[9px] font-black uppercase tracking-wider text-white/40 text-center font-orbitron">GA</th>
                        <th className="p-4 text-[9px] font-black uppercase tracking-wider text-white/40 text-center font-orbitron">GD</th>
                        <th className="p-4 text-[9px] font-black uppercase tracking-wider text-[#00FF62] text-center font-orbitron">PTS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {calculateStandings(selectedGroup)
                        .filter((row: any) => row.name.toLowerCase().includes(searchQuery.toLowerCase()))
                        .map((row: any, idx: number) => {
                          const isQualified = idx < 2;
                          return (
                            <tr
                              key={idx}
                              className={`border-b border-white/5 transition-all hover:bg-white/5 ${isQualified ? "bg-[#00FF62]/5 border-l-4 border-l-[#00FF62]" : ""
                                }`}
                            >
                              <td className="p-4 text-center font-black text-xs font-orbitron">
                                <div className="flex items-center justify-center gap-1">
                                  <span className={isQualified ? "text-[#00FF62]" : "text-white/60"}>{idx + 1}</span>
                                  {isQualified && (
                                    <span className="bg-[#00FF62]/20 text-[#00FF62] text-[8px] font-black px-1.5 py-0.2 rounded font-orbitron">Q</span>
                                  )}
                                </div>
                              </td>
                              <td className="p-4">
                                <div className="flex items-center gap-3">
                                  {renderTeamLogo(row.id, "w-7 h-7")}
                                  <span className="text-sm font-bold text-white uppercase tracking-tight">{row.name}</span>
                                </div>
                              </td>
                              <td className="p-4 text-center font-bold text-sm text-white">{row.p}</td>
                              <td className="p-4 text-center text-sm font-bold text-[#00FF62]">{row.w}</td>
                              <td className="p-4 text-center text-sm font-bold text-white/40">{row.d}</td>
                              <td className="p-4 text-center text-sm font-bold text-red-400">{row.l}</td>
                              <td className="p-4 text-center text-sm text-white/60">{row.gf}</td>
                              <td className="p-4 text-center text-sm text-white/60">{row.ga}</td>
                              <td className={`p-4 text-center text-sm font-bold ${row.gd > 0 ? 'text-[#00FF62]' : row.gd < 0 ? 'text-red-400' : 'text-white/60'}`}>
                                {row.gd > 0 ? `+${row.gd}` : row.gd}
                              </td>
                              <td className="p-4 text-center font-black text-base text-[#00FF62] font-orbitron">{row.pts}</td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 2: FIXTURES */}
            {activeTab === "fixtures" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
                {(filteredFixtures.length > 0 ? filteredFixtures : groupFixtures).map((f) => (
                  <div key={f.id} className="bg-black/60 border border-white/10 rounded-3xl p-6 flex flex-col justify-between gap-4 shadow-xl hover:border-white/20 transition-all">
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] font-black uppercase tracking-wider text-white/40 font-orbitron">
                        {f.round} ({f.group})
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest font-orbitron flex items-center gap-1 ${f.status === 'Completed'
                          ? 'bg-[#00FF62]/10 text-[#00FF62] border border-[#00FF62]/30'
                          : 'bg-red-500/10 text-red-400 border border-red-500/30'
                        }`}>
                        {f.status === 'Completed' ? 'FULL TIME' : '🔴 LIVE MATCH'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-3 my-2 bg-white/2 p-4 rounded-2xl border border-white/5">
                      <div className="flex-1 text-center flex flex-col items-center gap-2">
                        {renderTeamLogo(f.team1Id, "w-10 h-10")}
                        <div className="text-xs font-bold text-white uppercase truncate max-w-28">{getTeamName(f.team1Id)}</div>
                      </div>

                      <div className="bg-black border border-white/15 px-5 py-3 rounded-2xl shrink-0 font-black text-lg font-orbitron text-white text-center shadow-inner">
                        {f.status === 'Completed' ? `${f.score1} - ${f.score2}` : f.score1 !== null ? `${f.score1} - ${f.score2}` : 'VS'}
                      </div>

                      <div className="flex-1 text-center flex flex-col items-center gap-2">
                        {renderTeamLogo(f.team2Id, "w-10 h-10")}
                        <div className="text-xs font-bold text-white uppercase truncate max-w-28">{getTeamName(f.team2Id)}</div>
                      </div>
                    </div>

                    <div className="flex justify-between items-center text-[9px] text-white/40 font-bold uppercase tracking-widest pt-2 border-t border-white/5">
                      <span>{f.date}</span>
                      <span className="bg-white/5 border border-white/10 px-2.5 py-0.5 rounded-lg text-[#00FF62] font-orbitron">{f.pitch || "Pitch A"}</span>
                      <span>KO {f.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* TAB 3: BRACKET */}
            {activeTab === "bracket" && (
              <div className="flex flex-col lg:flex-row items-center justify-center gap-10 py-6 relative z-10">
                {/* Semifinals */}
                <div className="flex flex-col gap-6 w-full max-w-sm">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-white/40 text-center font-orbitron flex items-center justify-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#E31B23]" />
                    Semi-Final Knockouts
                  </h4>
                  {semis.map((match) => (
                    <div key={match.id} className="bg-black/60 border border-white/15 rounded-3xl p-5 space-y-4 relative shadow-2xl hover:border-white/25 transition-all">
                      <div className="flex justify-between items-center text-[9px] font-bold text-white/40 uppercase tracking-widest border-b border-white/5 pb-2">
                        <span>Match #{match.id} ({match.round})</span>
                        <span>{match.date}</span>
                      </div>
                      <div className="space-y-3">
                        <div className={`flex justify-between items-center p-2 rounded-xl transition-all ${match.winnerId === match.team1Id ? 'bg-[#00FF62]/10 border border-[#00FF62]/30' : ''}`}>
                          <div className="flex items-center gap-2.5">
                            {renderTeamLogo(match.team1Id, "w-6 h-6")}
                            <span className={`text-xs ${match.winnerId === match.team1Id ? 'font-black text-white' : 'text-white/60'}`}>
                              {getTeamName(match.team1Id, match.team1Placeholder)}
                            </span>
                          </div>
                          <span className="text-xs font-black text-white font-orbitron bg-black/60 px-2.5 py-1 rounded-lg border border-white/10">
                            {match.score1 !== null ? match.score1 : "-"}
                          </span>
                        </div>

                        <div className={`flex justify-between items-center p-2 rounded-xl transition-all ${match.winnerId === match.team2Id ? 'bg-[#00FF62]/10 border border-[#00FF62]/30' : ''}`}>
                          <div className="flex items-center gap-2.5">
                            {renderTeamLogo(match.team2Id, "w-6 h-6")}
                            <span className={`text-xs ${match.winnerId === match.team2Id ? 'font-black text-white' : 'text-white/60'}`}>
                              {getTeamName(match.team2Id, match.team2Placeholder)}
                            </span>
                          </div>
                          <span className="text-xs font-black text-white font-orbitron bg-black/60 px-2.5 py-1 rounded-lg border border-white/10">
                            {match.score2 !== null ? match.score2 : "-"}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="hidden lg:block w-12 h-0.5 bg-linear-to-r from-white/10 via-[#E31B23] to-amber-500 shrink-0" />

                {/* Grand Final */}
                {finalMatch && (
                  <div className="w-full max-w-sm flex flex-col gap-4">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-amber-400 text-center font-orbitron animate-pulse flex items-center justify-center gap-2">
                      <IconCrown size={14} />
                      Championship Grand Final
                    </h4>
                    <div className="bg-linear-to-b from-[#E31B23]/10 via-black to-black border-2 border-amber-500/40 rounded-4xl p-6 space-y-4 relative shadow-2xl">
                      <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest text-amber-400 border-b border-amber-500/20 pb-2">
                        <span>Grand Final Championship</span>
                        <span>{finalMatch.date} - {finalMatch.time}</span>
                      </div>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center p-2 rounded-xl border border-white/5 bg-white/2">
                          <div className="flex items-center gap-2.5">
                            {renderTeamLogo(finalMatch.team1Id, "w-7 h-7")}
                            <span className={`text-sm ${finalMatch.winnerId === finalMatch.team1Id ? 'font-black text-white' : 'text-white/80'}`}>
                              {getTeamName(finalMatch.team1Id, finalMatch.team1Placeholder)}
                            </span>
                          </div>
                          <span className="text-base font-black text-amber-400 font-orbitron">
                            {finalMatch.score1 !== null ? finalMatch.score1 : "TBD"}
                          </span>
                        </div>
                        <div className="flex justify-between items-center p-2 rounded-xl border border-white/5 bg-white/2">
                          <div className="flex items-center gap-2.5">
                            {renderTeamLogo(finalMatch.team2Id, "w-7 h-7")}
                            <span className={`text-sm ${finalMatch.winnerId === finalMatch.team2Id ? 'font-black text-white' : 'text-white/80'}`}>
                              {getTeamName(finalMatch.team2Id, finalMatch.team2Placeholder)}
                            </span>
                          </div>
                          <span className="text-base font-black text-amber-400 font-orbitron">
                            {finalMatch.score2 !== null ? finalMatch.score2 : "TBD"}
                          </span>
                        </div>
                      </div>

                      {finalMatch.winnerId && (
                        <div className="mt-4 pt-4 border-t border-amber-500/30 flex flex-col items-center justify-center gap-1.5 bg-amber-500/10 rounded-2xl p-4">
                          <IconTrophy className="text-amber-400 animate-bounce" size={36} />
                          <p className="text-[9px] font-black text-white/60 uppercase tracking-widest">TOURNAMENT CHAMPION</p>
                          <p className="text-lg font-black text-amber-400 uppercase font-orbitron tracking-tight text-center">
                            {getTeamName(finalMatch.winnerId)}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Contact Info Footer */}
        <div className="bg-[#111] border border-white/10 rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
              <IconBallFootball size={20} className="text-[#E31B23]" />
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-wider text-white/40">Powered by</p>
              <p className="text-sm font-black text-white uppercase font-orbitron">K10 Football Network</p>
            </div>
          </div>
          <div className="flex items-center gap-6 text-xs text-white/50">
            {event.contactPhone && (
              <span className="flex items-center gap-1.5">
                <IconPhone size={14} />
                {event.contactPhone}
              </span>
            )}
            {event.contactEmail && (
              <span className="flex items-center gap-1.5">
                <IconMail size={14} />
                {event.contactEmail}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
