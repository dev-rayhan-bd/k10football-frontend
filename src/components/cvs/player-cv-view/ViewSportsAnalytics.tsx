/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
import Image from "next/image";
import { usePlayerCvView } from "./PlayerCvViewContext";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { CalendarIcon, MapPinIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const getResultColor = (result: "W" | "D" | "L") => {
  switch (result) {
    case "W":
      return "bg-[#00FF62] text-black";
    case "D":
      return "bg-gray-500 text-white";
    case "L":
      return "bg-red-600 text-white";
    default:
      return "bg-green-500 text-black";
  }
};

export const ViewSportsAnalytics = () => {
  const { playerData, cvData } = usePlayerCvView();

  const summary = cvData?.matchSummary || playerData.matchSummary || {};
  const recentMatches = playerData.recentMatches || [];

  const matches = recentMatches.length > 0
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
          score: "2-1",
          result: "W" as const,
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
            Verified competitive match logs, scout observations, and performance metrics.
          </p>
        </div>

        {/* Summary Metric Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="bg-black/30 border border-white/5 rounded-xl p-4 text-center">
            <span className="text-xs text-gray-400 uppercase font-bold tracking-wider block mb-1">
              Matches Played
            </span>
            <span className="text-2xl font-black text-white">{totalMatches}</span>
          </div>
          <div className="bg-black/30 border border-white/5 rounded-xl p-4 text-center">
            <span className="text-xs text-gray-400 uppercase font-bold tracking-wider block mb-1">
              Win / Draw / Loss
            </span>
            <span className="text-2xl font-black text-white">
              <span className="text-green-500">{wins}</span> /{" "}
              <span className="text-yellow-500">{draws}</span> /{" "}
              <span className="text-red-500">{losses}</span>
            </span>
          </div>
          <div className="bg-black/30 border border-white/5 rounded-xl p-4 text-center">
            <span className="text-xs text-gray-400 uppercase font-bold tracking-wider block mb-1">
              Average Match Rating
            </span>
            <span className="text-2xl font-black text-yellow-500">{avgRating}/10</span>
          </div>
          <div className="bg-black/30 border border-white/5 rounded-xl p-4 text-center">
            <span className="text-xs text-gray-400 uppercase font-bold tracking-wider block mb-1">
              Form Guide
            </span>
            <div className="flex justify-center gap-1.5 mt-1">
              <span className="size-6 rounded-full bg-green-500 text-black text-xs font-black flex items-center justify-center">
                W
              </span>
            </div>
          </div>
        </div>

        {/* Matches Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {matches.map((m) => (
            <Card
              key={m.id}
              className="bg-black/40 border-white/10 p-5 rounded-2xl flex flex-col justify-between hover:border-primary/40 transition-all"
            >
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <CalendarIcon size={14} />
                    <span>{m.date}</span>
                    <span>•</span>
                    <span className="text-primary font-semibold">{m.league}</span>
                  </div>
                  <Badge className={cn("font-black px-2.5 py-0.5", getResultColor(m.result))}>
                    {m.result}
                  </Badge>
                </div>

                <div className="flex items-center justify-between my-2">
                  <div className="flex-1 text-left min-w-0 pr-2">
                    <span className="text-base font-bold text-white block truncate">{m.team1}</span>
                  </div>
                  <div className="bg-white/5 border border-white/10 px-4 py-1.5 rounded-xl text-center shrink-0 mx-2">
                    <span className="text-xl font-black text-primary font-orbitron">{m.score}</span>
                  </div>
                  <div className="flex-1 text-right min-w-0 pl-2">
                    <span className="text-base font-bold text-white block truncate">{m.team2}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-4 text-xs text-gray-400 pt-3 border-t border-white/5">
                  <div className="flex items-center gap-1.5">
                    <MapPinIcon size={13} />
                    <span>{m.stadium}</span>
                  </div>
                  <div>
                    <span>Minutes: <strong className="text-white">{m.minutesPlayed}&apos;</strong></span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/10">
                <span className="text-xs text-gray-400">Match Rating</span>
                <span className="text-lg font-black text-yellow-400 font-orbitron">
                  {m.rating} <span className="text-xs text-gray-400 font-normal">/ 10</span>
                </span>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
