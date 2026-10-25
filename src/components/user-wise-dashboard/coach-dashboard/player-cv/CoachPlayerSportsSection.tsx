/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from "react";
import { useCoachPlayerCv } from "./CoachPlayerCvContext";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, MapPinIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const getResultBadge = (result: string) => {
  const r = (result || "W").toUpperCase();
  if (r === "W") {
    return (
      <span className="px-2.5 py-1 rounded-md text-xs font-black bg-green-500/20 text-green-400 border border-green-500/30">
        WIN
      </span>
    );
  }
  if (r === "D") {
    return (
      <span className="px-2.5 py-1 rounded-md text-xs font-black bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
        DRAW
      </span>
    );
  }
  return (
    <span className="px-2.5 py-1 rounded-md text-xs font-black bg-red-500/20 text-red-400 border border-red-500/30">
      LOSS
    </span>
  );
};

export const CoachPlayerSportsSection = () => {
  const { playerData, cvData } = useCoachPlayerCv();

  const summary = cvData?.matchSummary || playerData.matchSummary || {};
  const recentMatches = playerData.recentMatches || [];

  const matches =
    recentMatches.length > 0
      ? recentMatches.map((m: any, idx: number) => ({
          id: m._id || idx + 1,
          date: m.date ? new Date(m.date).toLocaleDateString() : "2026-09-15",
          team1: m.homeTeam || "K10 Academy",
          team2: m.awayTeam || "Dhaka City FC",
          score: m.score || `${m.homeScore ?? 2} - ${m.awayScore ?? 1}`,
          result: m.result || "W",
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
            score: "2-1",
            result: "W",
            rating: 10,
            goals: 0,
            assists: 0,
            passAccuracy: 80,
            minutesPlayed: 76,
            yellowCards: 0,
            redCards: 0,
            league: "Youth Premier League",
            stadium: "London",
            scoutName: "Marcus Silva",
          },
        ];

  const wins = summary.wins ?? 1;
  const draws = summary.draws ?? 0;
  const losses = summary.losses ?? 0;
  const totalMatches = summary.totalMatches ?? matches.length;
  const avgRating = summary.avgMatchRating ?? summary.averageRating ?? 10;

  return (
    <div className="w-full mt-10 sm:mt-20 min-w-0 overflow-hidden">
      <div className="bg-cardBg border border-border/50 rounded-2xl p-6 sm:p-10 w-full min-w-0">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-4xl font-heading font-light text-foreground uppercase tracking-wider mb-2">
            Match Analytics & History
          </h2>
          <p className="text-muted-foreground text-xs sm:text-sm max-w-lg mx-auto">
            Competitive match logs, scout observations, and performance metrics reviewed by coaching staff.
          </p>
        </div>

        {/* Summary Metric Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-8">
          <div className="bg-black/30 border border-white/5 rounded-xl p-4 text-center">
            <span className="text-xs text-gray-400 uppercase font-bold tracking-wider block mb-1">
              Matches
            </span>
            <span className="text-2xl font-black text-white">{totalMatches}</span>
          </div>
          <div className="bg-black/30 border border-white/5 rounded-xl p-4 text-center">
            <span className="text-xs text-green-400 uppercase font-bold tracking-wider block mb-1">
              Wins
            </span>
            <span className="text-2xl font-black text-green-400">{wins}</span>
          </div>
          <div className="bg-black/30 border border-white/5 rounded-xl p-4 text-center">
            <span className="text-xs text-yellow-400 uppercase font-bold tracking-wider block mb-1">
              Draws
            </span>
            <span className="text-2xl font-black text-yellow-400">{draws}</span>
          </div>
          <div className="bg-black/30 border border-white/5 rounded-xl p-4 text-center">
            <span className="text-xs text-red-400 uppercase font-bold tracking-wider block mb-1">
              Losses
            </span>
            <span className="text-2xl font-black text-red-400">{losses}</span>
          </div>
          <div className="bg-black/30 border border-white/5 rounded-xl p-4 text-center col-span-2 sm:col-span-1">
            <span className="text-xs text-primary uppercase font-bold tracking-wider block mb-1">
              Avg Rating
            </span>
            <span className="text-2xl font-black text-primary">{avgRating}/10</span>
          </div>
        </div>

        {/* Match List */}
        <div className="flex flex-col gap-4">
          {matches.map((m) => (
            <div
              key={m.id}
              className="bg-black/25 border border-white/10 rounded-2xl p-4 sm:p-6 hover:bg-white/5 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
            >
              <div className="flex flex-col gap-2 min-w-0">
                <div className="flex items-center gap-3">
                  {getResultBadge(m.result)}
                  <span className="text-lg font-bold text-white tracking-wide">
                    {m.team1} <span className="text-primary font-black px-1.5">{m.score}</span> {m.team2}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-4 text-xs text-gray-400">
                  <span className="flex items-center gap-1">
                    <CalendarIcon className="size-3.5" />
                    {m.date}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPinIcon className="size-3.5" />
                    {m.stadium} ({m.league})
                  </span>
                  <span className="text-primary font-medium">Scouted by: {m.scoutName}</span>
                </div>
              </div>

              <div className="flex items-center gap-6 self-end md:self-center border-t md:border-t-0 pt-3 md:pt-0 border-white/10 w-full md:w-auto justify-between md:justify-end">
                <div className="text-center">
                  <span className="text-[10px] uppercase text-gray-400 font-bold block">Minutes</span>
                  <span className="text-sm font-bold text-white">{m.minutesPlayed}&apos;</span>
                </div>
                <div className="text-center">
                  <span className="text-[10px] uppercase text-gray-400 font-bold block">Goals</span>
                  <span className="text-sm font-bold text-white">{m.goals}</span>
                </div>
                <div className="text-center">
                  <span className="text-[10px] uppercase text-gray-400 font-bold block">Assists</span>
                  <span className="text-sm font-bold text-white">{m.assists}</span>
                </div>
                <div className="text-center">
                  <span className="text-[10px] uppercase text-gray-400 font-bold block">Accuracy</span>
                  <span className="text-sm font-bold text-white">{m.passAccuracy}%</span>
                </div>
                <div className="text-center pl-2 border-l border-white/10">
                  <span className="text-[10px] uppercase text-primary font-bold block">Rating</span>
                  <span className="text-lg font-black text-primary">{m.rating}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
