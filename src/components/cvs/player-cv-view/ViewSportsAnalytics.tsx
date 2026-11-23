/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from "react";
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
      return "bg-gray-500 text-white";
  }
};

export const ViewSportsAnalytics = () => {
  const { playerData, cvData } = usePlayerCvView();

  const summary = cvData?.matchSummary || playerData?.matchSummary || {};
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
      passes: Number(m.passes ?? 0),
      passAccuracy: accuracyNum,
      minutesPlayed: minutesNum,
      yellowCards: Number(m.yellowCards ?? 0),
      redCards: Number(m.redCards ?? 0),
      league: m.gameType || m.leagueType || m.league || "Competitive Match",
      stadium: m.location || m.stadium || "Pitch",
      scoutName: m.coachReview?.coachName || m.authorName || "Scout Analyst",
    };
  });

  const wins = summary.wins !== undefined ? Number(summary.wins) : matches.filter((m) => m.result === "W").length;
  const draws = summary.draws !== undefined ? Number(summary.draws) : matches.filter((m) => m.result === "D").length;
  const losses = summary.losses !== undefined ? Number(summary.losses) : matches.filter((m) => m.result === "L").length;
  const totalMatches = summary.totalMatches !== undefined ? Number(summary.totalMatches) : matches.length;

  const rawRating = summary.avgMatchRating ?? summary.averageRating ?? summary.avgRating;
  const parsedRating =
    rawRating !== undefined && rawRating !== null
      ? parseFloat(String(rawRating).replace(/[^0-9.]/g, ""))
      : NaN;
  const avgRating = !isNaN(parsedRating)
    ? parsedRating.toFixed(1)
    : matches.length > 0
      ? (matches.reduce((sum, m) => sum + m.rating, 0) / matches.length).toFixed(1)
      : "0.0";

  const formGuideBadges: ("W" | "D" | "L")[] =
    Array.isArray(summary.formGuide) && summary.formGuide.length > 0
      ? summary.formGuide.map((f: string) => f.toUpperCase() as "W" | "D" | "L")
      : matches.map((m) => m.result);

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
            {formGuideBadges.length > 0 ? (
              <div className="flex justify-center gap-1.5 mt-1 flex-wrap">
                {formGuideBadges.map((res, i) => (
                  <span
                    key={i}
                    className={cn(
                      "size-6 rounded-full text-xs font-black flex items-center justify-center",
                      getResultColor(res)
                    )}
                  >
                    {res}
                  </span>
                ))}
              </div>
            ) : (
              <span className="text-xs text-gray-500 italic mt-1 block">No records</span>
            )}
          </div>
        </div>

        {/* Matches Grid */}
        {matches.length > 0 ? (
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
        ) : (
          <div className="border border-white/10 bg-black/40 p-8 sm:p-12 text-center rounded-2xl flex flex-col items-center justify-center gap-2">
            <CalendarIcon className="size-8 text-gray-500 mb-1" />
            <span className="text-base font-bold text-white uppercase tracking-wider">No Game Reports Logged Yet</span>
            <p className="text-xs text-gray-400 max-w-sm">
              This player has not logged any verified competitive matches in the database yet.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
