/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
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
  const recentMatches = playerData.recentMatches || [];

  const matches =
    recentMatches.length > 0
      ? recentMatches.map((m: any, idx: number) => ({
          id: m._id || idx + 1,
          date: m.date ? new Date(m.date).toLocaleDateString() : "2026-09-15",
          team1: m.homeTeam || "K10 Academy",
          team2: m.awayTeam || "Dhaka City FC",
          team1Logo: "/teams/default.png",
          team2Logo: "/teams/default.png",
          score: m.score || `${m.homeScore ?? 2} - ${m.awayScore ?? 1}`,
          result: (m.result || "W") as "W" | "D" | "L",
          rating: m.rating || 10,
          goals: m.goals || 0,
          assists: m.assists || 0,
          passAccuracy: m.accuracy ? parseInt(m.accuracy) || 80 : 80,
          minutesPlayed: m.minutes ? parseInt(m.minutes) || 76 : 76,
          yellowCards: m.yellowCards || 0,
          redCards: m.redCards || 0,
          league: m.gameType || "Youth Premier League",
          stadium: m.location || "London",
          scoutName: m.coachReview?.coachName || "Marcus Silva",
        }))
      : [
          {
            id: 1,
            date: "2026-09-15",
            team1: "K10 Academy",
            team2: "Dhaka City FC",
            team1Logo: "/teams/default.png",
            team2Logo: "/teams/default.png",
            score: "2 - 1",
            result: "W" as const,
            rating: 10,
            goals: 0,
            assists: 0,
            passAccuracy: 88,
            minutesPlayed: 90,
            yellowCards: 0,
            redCards: 0,
            league: "Youth Friendly Championship",
            stadium: "National Stadium",
            scoutName: "Marcus Silva",
          },
        ];

  const [selectedMatch, setSelectedMatch] = useState(matches[0]);

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
              {summary.totalMatches ?? matches.length}
            </span>
          </div>
          <div className="bg-black/20 border border-white/5 rounded-xl p-4 text-center">
            <span className="text-xs text-muted-foreground block mb-1">Total Goals</span>
            <span className="text-2xl font-bold text-primary">
              {summary.totalGoals ?? playerData.seasonStats.goals}
            </span>
          </div>
          <div className="bg-black/20 border border-white/5 rounded-xl p-4 text-center">
            <span className="text-xs text-muted-foreground block mb-1">Total Assists</span>
            <span className="text-2xl font-bold text-foreground">
              {summary.totalAssists ?? playerData.seasonStats.assists}
            </span>
          </div>
          <div className="bg-black/20 border border-white/5 rounded-xl p-4 text-center">
            <span className="text-xs text-muted-foreground block mb-1">Avg Match Rating</span>
            <span className="text-2xl font-bold text-primary">
              {summary.avgMatchRating ? `${summary.avgMatchRating}%` : "88%"}
            </span>
          </div>
        </div>

        {/* Matches list & Detail preview */}
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
      </div>
    </div>
  );
};
