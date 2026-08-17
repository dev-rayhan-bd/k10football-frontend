/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { getStoredEvents } from "@/components/user-wise-dashboard/academy-management/ExtraEvents";

import PublicTournamentHeader from "@/components/tournament/PublicTournamentHeader";
import PublicTournamentHero from "@/components/tournament/PublicTournamentHero";
import PublicTournamentInfoCards from "@/components/tournament/PublicTournamentInfoCards";
import PublicTournamentArena from "@/components/tournament/PublicTournamentArena";
import PublicTournamentFooter from "@/components/tournament/PublicTournamentFooter";
import { IconTrophy } from "@tabler/icons-react";

const PublicTournamentLivePage = () => {
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

  // Loading state
  if (!event) {
    return (
      <div className="min-h-screen bg-[#0A0A0C] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-t-[#E31B23] border-white/10 rounded-full animate-spin mx-auto" />
          <p className="text-white/40 text-sm font-bold uppercase tracking-widest">
            Loading Tournament...
          </p>
        </div>
      </div>
    );
  }

  const noLiveData = status === "registration" && groupFixtures.length === 0;

  return (
    <div className="min-h-screen bg-[#0A0A0C] text-white">
      {/* Top Header */}
      <PublicTournamentHeader status={status} />

      <div className="max-w-6xl mx-auto py-8 px-4 flex flex-col gap-8">
        {/* Tournament Hero Header */}
        <PublicTournamentHero
          event={event}
          copied={copied}
          onCopyLink={handleCopyLink}
          onRefresh={loadAllData}
          lastRefreshed={lastRefreshed}
        />

        {/* Event Info Cards */}
        <PublicTournamentInfoCards event={event} teamsCount={teams.length} />

        {/* Pre-Tournament Banner */}
        {noLiveData && (
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-3xl p-8 text-center space-y-3">
            <IconTrophy size={40} className="text-amber-400 mx-auto" />
            <h3 className="text-xl font-black uppercase text-white font-orbitron">
              Tournament Coming Soon
            </h3>
            <p className="text-sm text-white/50 max-w-md mx-auto">
              Registration is currently open. Live scores, standings, and brackets will appear here once the tournament begins.
            </p>
          </div>
        )}

        {/* Tournament Arena — only show when there is live data */}
        {!noLiveData && (
          <PublicTournamentArena
            status={status}
            groupA={groupA}
            groupB={groupB}
            groupFixtures={groupFixtures}
            semis={semis}
            finalMatch={finalMatch}
            teams={teams}
          />
        )}

        {/* Contact Info Footer */}
        <PublicTournamentFooter event={event} />
      </div>
    </div>
  );
};

export default PublicTournamentLivePage;
