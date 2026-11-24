/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import Image from "next/image";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { CalendarIcon, MapPinIcon } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { IconDownload } from "@tabler/icons-react";
import { usePlayer } from "@/hooks/usePlayer";
import GameReportPdfDownloader from "@/components/user-wise-dashboard/player-dashboard/GameReportPdfDownloader";

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

const getResultText = (result: "W" | "D" | "L") => result;

const SportsAnalycies = ({ editable = false }: { editable?: boolean }) => {
  const { cvData, playerData } = usePlayer();

  // Canonical DB data: recentMatches from player CV. Strictly NO fallback to hardcoded mock/fake matches.
  const rawMatches: any[] =
    Array.isArray(cvData?.recentMatches) && cvData.recentMatches.length > 0
      ? cvData.recentMatches
      : Array.isArray((playerData as any)?.recentMatches) && (playerData as any).recentMatches.length > 0
        ? (playerData as any).recentMatches
        : [];

  const cvMatches = rawMatches.map((m: any, idx: number) => {
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
      reportId: typeof m._id === "string" ? m._id : "",
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
      isVerified: Boolean(m.isVerified || m.isProfessionallyVerified),
      reportPdfUrl: m.reportPdfUrl || null,
      characteristics: m.playerInfo?.characteristics || m.characteristics || ["Agile", "Fast", "Playmaker"],
    };
  });

  const matches = cvMatches.slice(0, 4);

  const [showArchive, setShowArchive] = useState(false);
  const [downloadingReportId, setDownloadingReportId] = useState<number | string | null>(null);

  const summary = cvData?.matchSummary || (playerData as any)?.matchSummary;

  const wins =
    summary?.wins !== undefined
      ? Number(summary.wins)
      : cvMatches.filter((m) => m.result === "W").length;
  const draws =
    summary?.draws !== undefined
      ? Number(summary.draws)
      : cvMatches.filter((m) => m.result === "D").length;
  const losses =
    summary?.losses !== undefined
      ? Number(summary.losses)
      : cvMatches.filter((m) => m.result === "L").length;
  const totalGoals =
    summary?.totalGoals !== undefined
      ? Number(summary.totalGoals)
      : cvMatches.reduce((sum, m) => sum + m.goals, 0);
  const totalAssists =
    summary?.totalAssists !== undefined
      ? Number(summary.totalAssists)
      : cvMatches.reduce((sum, m) => sum + m.assists, 0);

  const rawRating = summary?.avgMatchRating ?? summary?.averageRating ?? summary?.avgRating;
  const parsedRating =
    rawRating !== undefined && rawRating !== null
      ? parseFloat(String(rawRating).replace(/[^0-9.]/g, ""))
      : NaN;
  const avgRating = !isNaN(parsedRating)
    ? parsedRating.toFixed(1)
    : cvMatches.length > 0
      ? (cvMatches.reduce((sum, m) => sum + m.rating, 0) / cvMatches.length).toFixed(1)
      : "0.0";

  const rawPass =
    summary?.avgPassAccuracyNum ??
    summary?.avgPassAccuracy ??
    summary?.averagePassAccuracy ??
    summary?.passAccuracy;
  const parsedPass =
    rawPass !== undefined && rawPass !== null
      ? parseFloat(String(rawPass).replace(/[^0-9.]/g, ""))
      : NaN;
  const avgPassAccuracy = !isNaN(parsedPass)
    ? Math.round(parsedPass)
    : cvMatches.length > 0
      ? Math.round(cvMatches.reduce((sum, m) => sum + m.passAccuracy, 0) / cvMatches.length)
      : 0;

  const rawTackles = summary?.avgTackles ?? summary?.averageTackles;
  const parsedTackles =
    rawTackles !== undefined && rawTackles !== null
      ? parseFloat(String(rawTackles).replace(/[^0-9.]/g, ""))
      : NaN;
  const avgTackles = !isNaN(parsedTackles)
    ? parsedTackles.toFixed(1)
    : cvMatches.length > 0
      ? (cvMatches.reduce((sum: number, m: any) => sum + (m.tackles || 0), 0) / cvMatches.length).toFixed(1)
      : "0.0";

  const formGuideBadges: ("W" | "D" | "L")[] =
    Array.isArray(summary?.formGuide) && summary.formGuide.length > 0
      ? summary.formGuide.map((f: string) => f.toUpperCase() as "W" | "D" | "L")
      : cvMatches.map((m) => m.result);

  // Downloads the same "Player Analysis Profile" design as the Game Reports page,
  // built from the saved report (GET /players/me/game-reports/:id).
  const handleDownloadPDF = (match: any) => {
    if (downloadingReportId !== null) return;
    if (!match?.reportId) {
      toast.error("This report is not available for download.");
      return;
    }
    setDownloadingReportId(match.id);
  };

  const downloadingMatch = cvMatches.find((m: any) => m.id === downloadingReportId);

  return (
    <div className="container w-full min-w-0 overflow-hidden">
      {downloadingMatch?.reportId && (
        <GameReportPdfDownloader
          reportId={downloadingMatch.reportId}
          onDone={() => setDownloadingReportId(null)}
        />
      )}
      <h1 className="mb-6 sm:mb-8 text-center text-2xl sm:text-3xl font-bold text-white font-heading">
        GAME SUMMARY (LAST 4 MATCHES)
      </h1>

      <div className="space-y-4 sm:space-y-6 w-full min-w-0">
        {/* Overall stats cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5 w-full min-w-0">
          <Card className="border-0 bg-gradient-to-br from-[#1B4D2E] to-[#0F3B1F] p-4 sm:p-8 text-white rounded-lg w-full min-w-0">
            <div className="mb-4 sm:mb-6 text-lg sm:text-xl font-bold text-[#00FF62] uppercase tracking-wide truncate">
              Overall Performance
            </div>
            <div className="mb-4 sm:mb-6 w-full min-w-0">
              <div className="text-sm sm:text-base text-gray-300 font-medium truncate">Average Rating</div>
              <div className="text-4xl sm:text-6xl font-black text-[#00FF62]">{avgRating}</div>
            </div>
            <div className="grid grid-cols-2 gap-4 sm:gap-6 w-full min-w-0">
              <div className="w-full min-w-0">
                <div className="text-sm sm:text-base text-gray-300 font-medium truncate">Total Goals</div>
                <div className="text-3xl sm:text-4xl font-black text-white">{totalGoals}</div>
              </div>
              <div className="w-full min-w-0">
                <div className="text-sm sm:text-base text-gray-300 font-medium truncate">Total Assists</div>
                <div className="text-3xl sm:text-4xl font-black text-white">{totalAssists}</div>
              </div>
            </div>
          </Card>

          <Card className="border border-border bg-black p-4 sm:p-8 text-white rounded-lg w-full min-w-0">
            <div className="mb-4 sm:mb-6 text-lg sm:text-xl font-bold text-gray-300 uppercase tracking-wide truncate">
              Form Guide
            </div>
            {formGuideBadges.length > 0 ? (
              <div className="mb-4 sm:mb-6 flex flex-wrap gap-2 sm:gap-3 w-full min-w-0">
                {formGuideBadges.map((res, idx) => (
                  <Badge
                    key={idx}
                    className={`h-10 w-10 sm:h-12 sm:w-12 flex items-center justify-center p-0 rounded-full font-black text-base sm:text-lg ${getResultColor(
                      res
                    )} shadow-lg`}
                  >
                    {getResultText(res)}
                  </Badge>
                ))}
              </div>
            ) : (
              <div className="mb-4 sm:mb-6 py-2 text-sm text-gray-500 italic">
                No matches recorded yet
              </div>
            )}
            <div className="space-y-2 sm:space-y-3 text-base sm:text-lg w-full min-w-0">
              <div className="flex justify-between w-full min-w-0">
                <span className="text-gray-300">Wins</span>
                <span className="font-bold text-white">{wins}</span>
              </div>
              <div className="flex justify-between w-full min-w-0">
                <span className="text-gray-300">Draws</span>
                <span className="font-bold text-white">{draws}</span>
              </div>
              <div className="flex justify-between w-full min-w-0">
                <span className="text-gray-300">Losses</span>
                <span className="font-bold text-white">{losses}</span>
              </div>
            </div>
          </Card>

          <Card className="border border-border bg-black p-4 sm:p-8 text-white rounded-lg w-full min-w-0">
            <div className="mb-4 sm:mb-6 text-lg sm:text-xl font-bold text-gray-300 uppercase tracking-wide truncate">
              Key Stats
            </div>
            <div className="space-y-4 sm:space-y-5 w-full min-w-0">
              <div className="w-full min-w-0">
                <div className="mb-1 sm:mb-2 flex justify-between text-xs sm:text-base w-full min-w-0 gap-2">
                  <span className="text-gray-300 font-medium truncate">Average Pass Accuracy</span>
                  <span className="text-[#00FF62] font-bold shrink-0">{avgPassAccuracy}%</span>
                </div>
                <div className="h-2 sm:h-3 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#00FF62] transition-all duration-300"
                    style={{ width: `${Math.min(100, Math.max(0, avgPassAccuracy))}%` }}
                  />
                </div>
              </div>
              <div className="w-full min-w-0">
                <div className="mb-1 sm:mb-2 flex justify-between text-xs sm:text-base w-full min-w-0 gap-2">
                  <span className="text-gray-300 font-medium truncate">Average Tackles</span>
                  <span className="text-[#00FF62] font-bold shrink-0">{avgTackles}</span>
                </div>
                <div className="h-2 sm:h-3 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#00FF62] transition-all duration-300"
                    style={{
                      width: `${Math.min(100, Math.max(0, (Number(avgTackles) / 10) * 100))}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Detailed Game Reports */}
        {matches.length > 0 ? (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-8 w-full min-w-0">
            {matches.map((match: any, idx: number) => (
              <Card
                key={match.id || idx}
                className="border border-border bg-black p-4 sm:p-8 text-white rounded-xl hover:border-primary/30 transition-all shadow-xl flex flex-col justify-between w-full min-w-0"
              >
                <div className="w-full min-w-0">
                  {/* Header Row */}
                  <div className="mb-6 flex flex-wrap items-start sm:items-center justify-between gap-4">
                    <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                      <div className="flex items-center gap-1 sm:gap-2 text-sm sm:text-lg text-gray-400">
                        <CalendarIcon className="h-4 w-4 sm:h-6 sm:w-6 text-primary" />
                        <span className="font-medium whitespace-nowrap">{match.date}</span>
                      </div>
                      <Badge className="bg-gray-800 text-white hover:bg-gray-700 text-xs sm:text-base py-1 px-2 sm:py-1.5 sm:px-4 rounded-md font-bold uppercase tracking-wider text-center max-w-[120px] sm:max-w-none truncate block">
                        {match.league}
                      </Badge>
                    </div>
                    <div className="text-right flex flex-col items-end gap-1 shrink-0">
                      <Badge className="bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[8px] sm:text-[10px] uppercase font-black tracking-widest py-0.5 px-1 sm:px-2">
                        {match.isVerified ? "VERIFIED" : "SELF-LOGGED"}
                      </Badge>
                      <div className="text-2xl sm:text-3xl font-black text-[#00FF62]">
                        {Number(match.rating).toFixed(1)}
                      </div>
                      <div className="text-[10px] sm:text-xs uppercase tracking-widest text-gray-500 font-black">
                        Rating
                      </div>
                    </div>
                  </div>

                  {/* Teams and Score */}
                  <div className="mb-6 sm:mb-8 flex items-center justify-between gap-2 sm:gap-4">
                    <div className="flex-1 text-center min-w-0">
                      <div className="text-sm sm:text-xl font-black uppercase tracking-tight text-white mb-1 truncate">
                        {match.team1}
                      </div>
                      <div className="h-1 w-8 sm:w-12 bg-primary/30 mx-auto rounded-full"></div>
                    </div>
                    <div className="shrink-0 bg-[#111111] border border-white/5 p-2 sm:p-4 px-4 sm:px-8 rounded-xl shadow-inner">
                      <div className="text-2xl sm:text-4xl font-black text-white tracking-tighter">
                        {match.score}
                      </div>
                    </div>
                    <div className="flex-1 text-center min-w-0">
                      <div className="text-sm sm:text-xl font-black uppercase tracking-tight text-white mb-1 truncate">
                        {match.team2}
                      </div>
                      <Badge className={cn(getResultColor(match.result), "font-black text-[10px] sm:text-sm uppercase px-2 sm:px-3")}>
                        {getResultText(match.result)}
                      </Badge>
                    </div>
                  </div>

                  {/* Stadium */}
                  <div className="flex items-center gap-2 sm:gap-3 text-sm sm:text-lg text-gray-400 mb-4 sm:mb-6 bg-white/5 p-2 sm:p-3 rounded-lg truncate">
                    <MapPinIcon className="h-4 w-4 sm:h-6 sm:w-6 text-primary shrink-0" />
                    <span className="font-medium truncate">{match.stadium}</span>
                  </div>

                  {/* Stats Grid */}
                  <div className="mb-4 sm:mb-6 grid grid-cols-4 gap-2 sm:gap-4 border-t border-b border-border/50 py-4 sm:py-6 mt-4">
                    <div className="text-center">
                      <div className="text-xl sm:text-3xl font-black text-white mb-1">{match.goals}</div>
                      <div className="text-[8px] sm:text-[10px] text-gray-500 uppercase font-black tracking-widest truncate">
                        Goals
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl sm:text-3xl font-black text-white mb-1">{match.assists}</div>
                      <div className="text-[8px] sm:text-[10px] text-gray-500 uppercase font-black tracking-widest truncate">
                        Assists
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl sm:text-3xl font-black text-white mb-1">{match.passes}</div>
                      <div className="text-[8px] sm:text-[10px] text-gray-500 uppercase font-black tracking-widest truncate">
                        Passes
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl sm:text-3xl font-black text-white mb-1">{match.minutesPlayed}</div>
                      <div className="text-[8px] sm:text-[10px] text-gray-500 uppercase font-black tracking-widest truncate">
                        Minutes
                      </div>
                    </div>
                  </div>
                </div>

                {/* Cards and Accuracy + Download Button */}
                <div className="space-y-4 border-t border-white/5 pt-4">
                  <div className="flex items-center justify-between px-2 gap-4">
                    <div className="flex items-center gap-3 sm:gap-6">
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        <div className="h-6 w-4 sm:h-8 sm:w-5 bg-[#FFCC00] rounded-sm shadow-md" />
                        <span className="text-base sm:text-xl font-black text-white">{match.yellowCards}</span>
                      </div>
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        <div className="h-6 w-4 sm:h-8 sm:w-5 bg-[#DC143C] rounded-sm shadow-md" />
                        <span className="text-base sm:text-xl font-black text-white">{match.redCards}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl sm:text-2xl font-black text-white">
                        {match.passAccuracy}%
                      </div>
                      <div className="text-[8px] sm:text-[10px] uppercase tracking-widest text-gray-500 font-black">
                        Accuracy
                      </div>
                    </div>
                  </div>

                  <button
                    disabled={downloadingReportId !== null}
                    onClick={() => handleDownloadPDF(match)}
                    className="w-full flex items-center justify-center gap-2 bg-[#E31B23] hover:bg-[#C2181F] text-white text-[11px] font-black uppercase tracking-wider py-3.5 rounded-xl cursor-pointer transition-all disabled:opacity-50 font-orbitron"
                  >
                    <IconDownload size={15} />
                    {downloadingReportId === match.id ? "Downloading..." : "Download Report PDF"}
                  </button>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="border border-white/10 bg-black/60 p-8 sm:p-14 text-center rounded-2xl flex flex-col items-center justify-center gap-3 w-full">
            <div className="size-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 mb-2">
              <CalendarIcon className="size-7 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-white uppercase tracking-wider font-heading">
              No Game Reports Logged Yet
            </h3>
            <p className="text-sm text-gray-400 max-w-md">
              This player has not logged any match reports in the database yet. Verified reports and performance analytics will appear here as matches are recorded.
            </p>
          </div>
        )}

        {/* View All / Archive Button (Only when more than 4 real DB matches exist) */}
        {cvMatches.length > 4 && (
          <div className="flex justify-center mt-10">
            <button
              onClick={() => setShowArchive(true)}
              className="bg-white/5 border border-white/10 hover:bg-white/10 text-white text-xs font-black uppercase tracking-widest px-8 py-4.5 rounded-2xl cursor-pointer transition-all font-orbitron"
            >
              View All Game Reports ({cvMatches.length})
            </button>
          </div>
        )}

        {/* Archive Dialog */}
        <Dialog open={showArchive} onOpenChange={setShowArchive}>
          <DialogContent className="max-w-4xl bg-[#0e0e0e] border-white/10 text-white rounded-4xl overflow-hidden max-h-[85vh] flex flex-col p-8">
            <DialogHeader className="mb-4">
              <DialogTitle className="text-3xl font-black uppercase text-white font-orbitron tracking-tight leading-none">
                Game Reports Archive
              </DialogTitle>
              <p className="text-white/40 font-bold uppercase tracking-widest text-[10px] mt-1">
                A complete log of all verified, paid game performance reports
              </p>
            </DialogHeader>

            <div className="flex-1 overflow-y-auto space-y-4 pr-2">
              {cvMatches.map((match: any) => (
                <div
                  key={match.id}
                  className="bg-black/40 border border-white/5 rounded-2xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 hover:border-white/15 transition-all"
                >
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-white/40 font-medium">{match.date}</span>
                      <Badge className="bg-white/5 text-white/60 hover:bg-white/10 text-[9px] uppercase tracking-wider font-bold">
                        {match.league}
                      </Badge>
                    </div>
                    <div className="text-lg font-black uppercase tracking-tight text-white font-orbitron">
                      {match.team1} <span className="text-[#E31B23] italic">vs</span> {match.team2}
                    </div>
                    <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-white/50">
                      <div>Score: <strong className="text-white">{match.score}</strong></div>
                      <div>Venue: <strong className="text-white">{match.stadium}</strong></div>
                      <div>Goals: <strong className="text-white">{match.goals}</strong></div>
                      <div>Assists: <strong className="text-white">{match.assists}</strong></div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 shrink-0 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 border-white/5 pt-4 md:pt-0">
                    <div className="text-center">
                      <div className="text-2xl font-black text-[#00FF62] font-orbitron">
                        {Number(match.rating).toFixed(1)}
                      </div>
                      <div className="text-[9px] uppercase tracking-widest text-gray-500 font-bold">Rating</div>
                    </div>

                    <button
                      disabled={downloadingReportId !== null}
                      onClick={() => handleDownloadPDF(match)}
                      className="flex items-center gap-2 bg-[#E31B23] hover:bg-[#C2181F] text-white text-[10px] font-black uppercase tracking-widest px-5 py-3 rounded-xl cursor-pointer transition-all disabled:opacity-50 font-orbitron"
                    >
                      <IconDownload size={14} />
                      {downloadingReportId === match.id ? "Wait..." : "Download PDF"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default SportsAnalycies;
