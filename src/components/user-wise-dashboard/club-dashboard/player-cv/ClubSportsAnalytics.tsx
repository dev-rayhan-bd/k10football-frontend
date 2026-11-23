/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from "react";
import { useClubPlayerCv } from "./ClubPlayerCvContext";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, MapPinIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const getResultBadgeVariant = (result: "W" | "D" | "L") => {
  switch (result) {
    case "W":
      return "default";
    case "D":
      return "secondary";
    case "L":
      return "destructive";
    default:
      return "default";
  }
};

export const ClubSportsAnalytics = () => {
  const { playerData, cvData } = useClubPlayerCv();

  const summary = cvData?.matchSummary || playerData.matchSummary || {};
  const rawMatches: any[] =
    Array.isArray(cvData?.recentMatches) && cvData.recentMatches.length > 0
      ? cvData.recentMatches
      : Array.isArray(playerData?.recentMatches) && playerData.recentMatches.length > 0
        ? playerData.recentMatches
        : [];

  const matches = rawMatches.map((m: any, idx: number) => {
    const rawRating = m.rating ?? m.playerRating ?? m.rating10 ?? 0;
    const ratingNum = typeof rawRating === "number" ? rawRating : parseFloat(String(rawRating)) || 0;

    const accuracyNum =
      typeof m.accuracy === "string"
        ? parseInt(m.accuracy.replace(/[^0-9]/g, ""), 10) || 0
        : typeof m.passAccuracy === "number"
          ? m.passAccuracy
          : typeof m.accuracy === "number"
            ? m.accuracy
            : 0;

    const minutesNum =
      typeof m.minutes === "string"
        ? parseInt(m.minutes.split(":")[0], 10) || 0
        : typeof m.timePlayedMinutes === "number"
          ? m.timePlayedMinutes
          : typeof m.minutes === "number"
            ? m.minutes
            : 0;

    const formattedDate = m.date
      ? m.date.includes("T")
        ? m.date.split("T")[0]
        : m.date
      : m.matchDate || "Recent";

    return {
      id: m._id || idx + 1,
      date: formattedDate,
      team1: m.homeTeam || "Home Team",
      team2: m.awayTeam || m.opponent || "Away Team",
      score: m.score || `${m.homeScore ?? 0} - ${m.awayScore ?? 0}`,
      result: ((m.result || "W").toUpperCase()) as "W" | "D" | "L",
      rating: ratingNum,
      goals: Number(m.goals ?? 0),
      assists: Number(m.assists ?? 0),
      passAccuracy: accuracyNum,
      minutesPlayed: minutesNum,
      yellowCards: Number(m.yellowCards ?? 0),
      redCards: Number(m.redCards ?? 0),
      league: m.gameType || m.leagueType || m.league || "Competitive Match",
      stadium: m.location || m.stadium || "Pitch",
      scoutName: m.coachReview?.coachName || m.authorName || "Scout Analyst",
    };
  });

  const [selectedMatch, setSelectedMatch] = useState<any>(matches[0] || null);

  useEffect(() => {
    if (matches.length > 0 && (!selectedMatch || !matches.some((m) => m.id === selectedMatch.id))) {
      setSelectedMatch(matches[0]);
    } else if (matches.length === 0) {
      setSelectedMatch(null);
    }
  }, [matches, selectedMatch]);

  const totalMatches = summary.totalMatches !== undefined ? Number(summary.totalMatches) : matches.length;
  const totalGoals = summary.totalGoals !== undefined ? Number(summary.totalGoals) : playerData?.seasonStats?.goals ?? 0;
  const totalAssists = summary.totalAssists !== undefined ? Number(summary.totalAssists) : playerData?.seasonStats?.assists ?? 0;
  const avgMatchRating = summary.avgMatchRating ?? summary.averageRating ?? 0;

  return (
    <div className="w-full mt-10 min-w-0 overflow-hidden">
      <div className="bg-cardBg border border-border/50 rounded-2xl p-6 sm:p-10 w-full min-w-0">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-4xl font-heading font-light text-foreground uppercase tracking-wider mb-2">
            Match Analytics & Scouting Log
          </h2>
          <p className="text-muted-foreground text-xs sm:text-sm max-w-lg mx-auto">
            Match-by-match competitive breakdown recorded during official scouting observation.
          </p>
        </div>

        {/* Top Summary Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="bg-black/20 border border-white/5 rounded-xl p-4 text-center">
            <span className="text-xs text-muted-foreground block mb-1">Total Matches</span>
            <span className="text-2xl font-bold text-foreground">
              {totalMatches}
            </span>
          </div>
          <div className="bg-black/20 border border-white/5 rounded-xl p-4 text-center">
            <span className="text-xs text-muted-foreground block mb-1">Total Goals</span>
            <span className="text-2xl font-bold text-primary">
              {totalGoals}
            </span>
          </div>
          <div className="bg-black/20 border border-white/5 rounded-xl p-4 text-center">
            <span className="text-xs text-muted-foreground block mb-1">Total Assists</span>
            <span className="text-2xl font-bold text-foreground">
              {totalAssists}
            </span>
          </div>
          <div className="bg-black/20 border border-white/5 rounded-xl p-4 text-center">
            <span className="text-xs text-muted-foreground block mb-1">Avg Match Rating</span>
            <span className="text-2xl font-bold text-primary">
              {avgMatchRating ? `${avgMatchRating}/10` : "0.0"}
            </span>
          </div>
        </div>

        {/* Matches list & Detail preview */}
        {matches.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Match selector column */}
            <div className="lg:col-span-5 flex flex-col gap-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
                Recent Matches
              </h4>
              {matches.map((m) => {
                const isSelected = selectedMatch?.id === m.id;
                return (
                  <div
                    key={m.id}
                    onClick={() => setSelectedMatch(m)}
                    className={cn(
                      "p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between",
                      isSelected
                        ? "bg-primary/10 border-primary/40 shadow-lg shadow-primary/5"
                        : "bg-black/20 border-white/5 hover:bg-white/5"
                    )}
                  >
                    <div className="flex flex-col gap-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-foreground truncate">
                          {m.team1} vs {m.team2}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                        <span>{m.date}</span>
                        <span>•</span>
                        <span>{m.league}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-sm font-black text-foreground">{m.score}</span>
                      <Badge variant={getResultBadgeVariant(m.result)} className="size-6 p-0 flex items-center justify-center font-bold">
                        {m.result}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Selected match detail card */}
            {selectedMatch && (
              <div className="lg:col-span-7 bg-black/30 border border-white/10 rounded-2xl p-6 flex flex-col gap-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-white/5">
                  <div>
                    <h3 className="text-lg font-bold text-foreground">
                      {selectedMatch.team1} vs {selectedMatch.team2}
                    </h3>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                      <span className="flex items-center gap-1">
                        <CalendarIcon className="size-3.5" /> {selectedMatch.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPinIcon className="size-3.5" /> {selectedMatch.stadium}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="text-[10px] text-muted-foreground block uppercase font-bold">Scout Rating</span>
                      <span className="text-xl font-black text-primary">{selectedMatch.rating} / 10</span>
                    </div>
                  </div>
                </div>

                {/* Match Stats Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-black/20 p-3 rounded-xl border border-white/5 text-center">
                    <span className="text-[10px] text-muted-foreground block uppercase font-bold mb-1">Minutes</span>
                    <span className="text-lg font-bold text-foreground">{selectedMatch.minutesPlayed}&apos;</span>
                  </div>
                  <div className="bg-black/20 p-3 rounded-xl border border-white/5 text-center">
                    <span className="text-[10px] text-muted-foreground block uppercase font-bold mb-1">Goals</span>
                    <span className="text-lg font-bold text-primary">{selectedMatch.goals}</span>
                  </div>
                  <div className="bg-black/20 p-3 rounded-xl border border-white/5 text-center">
                    <span className="text-[10px] text-muted-foreground block uppercase font-bold mb-1">Assists</span>
                    <span className="text-lg font-bold text-foreground">{selectedMatch.assists}</span>
                  </div>
                  <div className="bg-black/20 p-3 rounded-xl border border-white/5 text-center">
                    <span className="text-[10px] text-muted-foreground block uppercase font-bold mb-1">Pass Accuracy</span>
                    <span className="text-lg font-bold text-primary">{selectedMatch.passAccuracy}%</span>
                  </div>
                </div>

                {selectedMatch.scoutName && (
                  <div className="text-xs text-muted-foreground bg-black/20 p-3 rounded-xl border border-white/5">
                    <span className="font-bold text-foreground">Scout in Attendance: </span>
                    {selectedMatch.scoutName}
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="border border-white/10 bg-black/20 p-8 sm:p-12 text-center rounded-2xl flex flex-col items-center justify-center gap-2">
            <CalendarIcon className="size-8 text-muted-foreground mb-1" />
            <span className="text-base font-bold text-foreground uppercase tracking-wider">No Game Reports Logged Yet</span>
            <p className="text-xs text-muted-foreground max-w-sm">
              This player has not logged any verified competitive matches in the database yet.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
