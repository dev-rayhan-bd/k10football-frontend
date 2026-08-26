/* eslint-disable @typescript-eslint/no-unused-vars */

"use client";
import { toast } from "sonner";

import { useMemo, useState } from "react";

import { Input } from "@/components/ui/input";

import GameReportPdfModal from "./GameReportPdfModal";

import {
  IconSearch,
  IconClock,
  IconUsers,
  IconTrash,
  IconStar,
  IconTrendingUp,
  IconFileText,
} from "@tabler/icons-react";

import { useAppSelector } from "@/lib/hooks/reduxHooks";
import { MatchStats } from "@/lib/constants/reports";

import { ReportView, SummaryCardProps, GameReportCardProps, Player } from "./GameReportTypes";
import { getPlayerTag, normalizeRating, safeString } from "./GameReportHelpers";

/* -------------------------------------------------------------------------- */
/* Summary Card                                                               */
/* -------------------------------------------------------------------------- */

const SummaryCard = ({
  label,
  value,
  icon: Icon,
  bgColor,
  textColor,
}: SummaryCardProps) => (
  <div className="bg-[#0A0A0A] border border-white/20 rounded-[20px] p-4 md:p-5 flex items-center gap-3 md:gap-4 flex-1 min-w-0">
    <div
      className={`w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center ${bgColor} bg-opacity-20 border border-white/20 shrink-0`}
    >
      {Icon && (
        <Icon
          className={`w-5 h-5 md:w-6 md:h-6 ${textColor}`}
          stroke={2}
        />
      )}
    </div>

    <div className="space-y-0.5 truncate">
      <p className="text-white/40 text-[10px] md:text-[11px] font-medium leading-none truncate">
        {label}
      </p>

      <p className="text-white text-xl md:text-2xl font-bold font-orbitron truncate">
        {value}
      </p>
    </div>
  </div>
);

/* -------------------------------------------------------------------------- */
/* Game Report Card                                                           */
/* -------------------------------------------------------------------------- */

const GameReportCard = ({
  tag,
  playerName,
  date,
  coach,
  rating,
  goals,
  assists,
  passes,
  pos,
  tier,
  team1,
  team2,
  onClick,
}: GameReportCardProps) => {
  const displayRating = normalizeRating(rating);

  return (
    <div
      onClick={onClick}
      className="bg-[#111111] border border-white/20 rounded-3xl p-5 sm:p-6 flex flex-col gap-5 sm:gap-6 group hover:border-white/40 transition-all cursor-pointer"
    >
      <div className="flex justify-between items-center gap-2">
        <span className="bg-white/5 border border-white/20 rounded-full px-3 py-1 sm:px-4 text-[9px] sm:text-[10px] font-bold text-white/60 whitespace-nowrap">
          {tag}
        </span>

        <span className="text-white/40 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider truncate text-right">
          {team1} vs {team2}
        </span>
      </div>

      <div className="space-y-1">
        <div className="flex items-center gap-2 text-white/40 text-[10px] font-bold">
          <IconClock size={12} />
          {date}
        </div>

        <h3 className="text-white text-xl font-black font-orbitron group-hover:text-[#E31B23] transition-colors">
          {playerName}
        </h3>

        <p className="text-white/40 text-[10px] font-bold flex items-center gap-1">
          <IconUsers size={12} />
          Scout: {coach}
        </p>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-end">
          <p className="text-white/40 text-[10px] font-bold uppercase">
            Overall Performance:
          </p>

          <p className="text-white/60 text-[10px] font-bold">
            ({displayRating.toFixed(0)}% / 100%)
          </p>
        </div>

        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
          <div
            className="h-full bg-linear-to-r from-sky-500 to-sky-400"
            style={{
              width: `${Math.min(100, Math.max(0, displayRating))}%`,
            }}
          />
        </div>
      </div>

      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-3 xl:gap-0 mt-2 xl:mt-0">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="flex items-center gap-1 sm:gap-1.5 text-emerald-400 text-[10px] font-bold">
            <div className="w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full border-2 border-emerald-400 flex items-center justify-center p-px">
              <div className="w-full h-full bg-emerald-400 rounded-full" />
            </div>
            {goals} G
          </div>

          <div className="flex items-center gap-1 sm:gap-1.5 text-yellow-400 text-[10px] font-bold">
            <div className="w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full border-2 border-yellow-400 flex items-center justify-center p-px">
              <div className="w-full h-full bg-yellow-400 rounded-full" />
            </div>
            {assists} A
          </div>

          <div className="flex items-center gap-1 sm:gap-1.5 text-sky-400 text-[10px] font-bold">
            <div className="w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full border-2 border-sky-400 flex items-center justify-center p-px">
              <div className="w-full h-full bg-sky-400 rounded-full" />
            </div>
            {passes} P
          </div>
        </div>

        <div className="flex items-center justify-between w-full xl:w-auto gap-3">
          <span className="text-white/40 text-[9px] sm:text-[10px] font-bold uppercase truncate">
            {pos} · {tier}
          </span>

          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              toast.info(
                "Deletion is managed on the coach dashboard.",
              );
            }}
            className="text-red-500/40 hover:text-red-500 transition-colors cursor-pointer animate-none"
          >
            <IconTrash size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* Main Component                                                             */
/* -------------------------------------------------------------------------- */

const GameReports = () => {
  const players = useAppSelector(
    (state) => state.player.players,
  ) as Player[];

  const reports = useAppSelector(
    (state) => state.reports.reports,
  ) as MatchStats[];

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCard, setSelectedCard] =
    useState<ReportView | null>(null);

  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  /* ------------------------------------------------------------------------ */
  /* Map reports                                                              */
  /* ------------------------------------------------------------------------ */

  const mappedReports = useMemo<ReportView[]>(() => {
    return reports.map((report) => {
      const reportAny = report as ReportView;

      const player = reportAny.playerId
        ? players.find(
          (playerItem) => playerItem.id === reportAny.playerId,
        )
        : undefined;

      const playerName =
        player?.fullName ||
        reportAny.playerName ||
        "Marcus Silva";

      const playerPosition =
        player?.position ||
        reportAny.playerPosition ||
        "Defensive Midfielder";

      const tag = player
        ? getPlayerTag(player)
        : "U-15";

      const tier =
        player?.validationStatus === "verified"
          ? "TIER 1"
          : "TIER 2";

      let formattedDate =
        reportAny.date || "Unknown Date";

      if (reportAny.date) {
        const date = new Date(reportAny.date);

        if (!Number.isNaN(date.getTime())) {
          formattedDate = date.toLocaleDateString(
            "en-US",
            {
              month: "short",
              day: "numeric",
              year: "numeric",
            },
          );
        }
      }

      return {
        ...reportAny,
        playerName,
        playerPosition,
        tag,
        tier,
        dateFormatted: formattedDate,
        scoutName: reportAny.scoutName || "Unknown Scout",
        team1: reportAny.team1 || "Team 1",
        team2: reportAny.team2 || "Team 2",
        rating: Number(reportAny.rating ?? 0),
        goals: Number(reportAny.goals ?? 0),
        assists: Number(reportAny.assists ?? 0),
        passes: Number(reportAny.passes ?? 0),
      };
    });
  }, [players, reports]);

  /* ------------------------------------------------------------------------ */
  /* Search                                                                   */
  /* ------------------------------------------------------------------------ */

  const filteredReports = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    if (!search) {
      return mappedReports;
    }

    return mappedReports.filter((report) => {
      return (
        safeString(report.playerName)
          .toLowerCase()
          .includes(search) ||
        safeString(report.playerPosition)
          .toLowerCase()
          .includes(search) ||
        safeString(report.scoutName)
          .toLowerCase()
          .includes(search) ||
        safeString(report.team1)
          .toLowerCase()
          .includes(search) ||
        safeString(report.team2)
          .toLowerCase()
          .includes(search)
      );
    });
  }, [mappedReports, searchTerm]);

  /* ------------------------------------------------------------------------ */
  /* Summary stats                                                            */
  /* ------------------------------------------------------------------------ */

  const totalReportsCount = mappedReports.length;

  const avgRatingVal =
    totalReportsCount > 0
      ? (
        mappedReports.reduce(
          (sum, report) =>
            sum + normalizeRating(report.rating),
          0,
        ) / totalReportsCount
      ).toFixed(1)
      : "0.0";

  const totalGoalsVal = mappedReports.reduce(
    (sum, report) =>
      sum + Number(report.goals ?? 0),
    0,
  );

  const totalAssistsVal = mappedReports.reduce(
    (sum, report) =>
      sum + Number(report.assists ?? 0),
    0,
  );

  /* ------------------------------------------------------------------------ */
  /* Player image                                                             */
  /* ------------------------------------------------------------------------ */

  const matchingPlayer = selectedCard
    ? players.find(
      (player) =>
        player.id === selectedCard.playerId,
    )
    : null;

  const playerImgSrc = selectedCard
    ? typeof matchingPlayer?.playerImage ===
      "string"
      ? matchingPlayer.playerImage
      : matchingPlayer?.playerImage?.src ||
      "/ronaldo.png"
    : "/ronaldo.png";

  /* ------------------------------------------------------------------------ */
  /* Sidebar                                                                  */
  /* ------------------------------------------------------------------------ */

  const topPerformers = [...mappedReports]
    .sort(
      (a, b) =>
        normalizeRating(b.rating) -
        normalizeRating(a.rating),
    )
    .slice(0, 5);

  const goalMap: Record<
    string,
    {
      name: string;
      goals: number;
      pos: string;
      team: string;
    }
  > = {};

  mappedReports.forEach((report) => {
    const name = safeString(report.playerName);

    if (!name) {
      return;
    }

    if (!goalMap[name]) {
      goalMap[name] = {
        name,
        goals: 0,
        pos:
          report.playerPosition ||
          "Unknown Position",
        team: report.tag || "U-15",
      };
    }

    goalMap[name].goals += Number(
      report.goals ?? 0,
    );
  });

  const topScorers = Object.values(goalMap)
    .sort((a, b) => b.goals - a.goals)
    .slice(0, 4);

  /* ------------------------------------------------------------------------ */
  /* Render                                                                   */
  /* ------------------------------------------------------------------------ */

  return (
    <div className="flex flex-col gap-6 md:gap-8 pb-10 w-full max-w-full overflow-x-hidden">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl md:text-5xl font-black text-white font-orbitron uppercase tracking-tight">
            Game Reports
          </h1>

          <p className="text-white/60 font-medium mt-2 text-sm md:text-lg">
            Professional player match performance
            analysis and scout records
          </p>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        <SummaryCard
          label="Avg. Match Rating"
          value={`${avgRatingVal}%`}
          icon={IconStar}
          bgColor="bg-sky-500"
          textColor="text-sky-500"
        />

        <SummaryCard
          label="Total Goals"
          value={totalGoalsVal}
          icon={IconTrendingUp}
          bgColor="bg-emerald-500"
          textColor="text-emerald-500"
        />

        <SummaryCard
          label="Total Assists"
          value={totalAssistsVal}
          icon={IconFileText}
          bgColor="bg-blue-500"
          textColor="text-blue-500"
        />

        <SummaryCard
          label="Total Reports"
          value={totalReportsCount}
          icon={IconUsers}
          bgColor="bg-yellow-500"
          textColor="text-yellow-500"
        />
      </div>

      {/* Main / Sidebar */}
      <div className="flex flex-col xl:flex-row gap-6 xl:gap-8">
        {/* Main Content */}
        <div className="flex-1 flex flex-col gap-6 xl:gap-8 min-w-0">
          {/* Search */}
          <div className="flex gap-4">
            <div className="relative flex-1 min-w-0">
              <IconSearch
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40"
              />

              <Input
                placeholder="Search reports by player name, scout, team, or position..."
                className="bg-[#111111] border-white/10 h-12 rounded-xl pl-12 text-white/60 font-medium"
                value={searchTerm}
                onChange={(event) =>
                  setSearchTerm(event.target.value)
                }
              />
            </div>
          </div>

          {/* Reports */}
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl md:text-2xl font-black text-white font-orbitron uppercase tracking-tight">
                Scouting Reports
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
              {filteredReports.map(
                (report, index) => (
                  <GameReportCard
                    key={
                      report.id
                        ? `${report.id}-${index}`
                        : `report-${index}`
                    }
                    tag={report.tag || "U-15"}
                    playerName={
                      report.playerName ||
                      "Unknown Player"
                    }
                    date={
                      report.dateFormatted ||
                      report.date ||
                      "Unknown Date"
                    }
                    coach={
                      report.scoutName ||
                      "Unknown Scout"
                    }
                    rating={Number(
                      report.rating ?? 0,
                    )}
                    goals={Number(
                      report.goals ?? 0,
                    )}
                    assists={Number(
                      report.assists ?? 0,
                    )}
                    passes={Number(
                      report.passes ?? 0,
                    )}
                    pos={
                      report.playerPosition ||
                      "Unknown Position"
                    }
                    tier={
                      report.tier || "TIER 2"
                    }
                    team1={
                      report.team1 || "Team 1"
                    }
                    team2={
                      report.team2 || "Team 2"
                    }
                    onClick={() =>
                      setSelectedCard(report)
                    }
                  />
                ),
              )}

              {filteredReports.length === 0 && (
                <div className="col-span-full text-center py-16 border border-white/5 rounded-3xl bg-[#111111]/50 text-white/40 font-medium">
                  No match reports found matching
                  search query.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-full xl:w-85 flex flex-col gap-8 shrink-0 min-w-0">
          {/* Top Scorers */}
          <div className="bg-[#111111] border border-white/20 rounded-3xl md:rounded-4xl p-6 md:p-8 flex flex-col gap-5 md:gap-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-sky-600 flex items-center justify-center shadow-[0_0_20px_rgba(14,165,233,0.2)] shrink-0">
                <IconTrendingUp className="text-white w-4 h-4 md:w-5 md:h-5" />
              </div>

              <h2 className="text-xl md:text-2xl font-black text-white font-orbitron uppercase tracking-tight">
                Top Scorers
              </h2>
            </div>

            <div className="space-y-4">
              {topScorers.map(
                (player, index) => (
                  <div
                    key={`${player.name}-${index}`}
                    className="flex justify-between items-center"
                  >
                    <div className="flex items-center gap-3">
                      <IconFileText
                        size={16}
                        className="text-sky-400"
                      />

                      <div>
                        <p className="text-white text-sm font-black">
                          {player.name}
                        </p>

                        <p className="text-white/60 text-[10px] font-bold uppercase tracking-wider">
                          {player.team} ·{" "}
                          {player.pos}
                        </p>
                      </div>
                    </div>

                    <span className="px-3 py-1 rounded-full text-[10px] font-black text-emerald-400 bg-emerald-100 bg-opacity-20">
                      {player.goals} Goals
                    </span>
                  </div>
                ),
              )}

              {topScorers.length === 0 && (
                <p className="text-white/40 text-xs text-center py-4">
                  No goals recorded yet.
                </p>
              )}
            </div>
          </div>

          {/* Top Performers */}
          <div className="bg-[#111111] border border-white/20 rounded-3xl md:rounded-4xl p-6 md:p-8 flex flex-col gap-5 md:gap-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-sky-500/10 flex items-center justify-center shrink-0">
                <IconStar className="text-sky-500 w-4 h-4 md:w-5 md:h-5" />
              </div>

              <h2 className="text-xl md:text-2xl font-black text-white font-orbitron uppercase tracking-tight">
                Top Performers
              </h2>
            </div>

            <div className="space-y-6">
              {topPerformers.map(
                (report, index) => {
                  const displayRating =
                    normalizeRating(
                      report.rating,
                    );

                  return (
                    <div
                      key={
                        report.id
                          ? `${report.id}-${index}`
                          : `performer-${index}`
                      }
                      className="flex justify-between items-center"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-sky-500 text-[10px] font-black font-orbitron">
                          #{index + 1}
                        </span>

                        <div>
                          <p className="text-white text-sm font-bold">
                            {report.playerName}
                          </p>

                          <p className="text-white/40 text-[10px] font-bold uppercase">
                            {report.tag} ·{" "}
                            {report.playerPosition}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 text-white text-[10px] font-black font-orbitron">
                        <IconStar
                          size={14}
                          className="text-sky-500 fill-sky-500/20"
                        />

                        {displayRating.toFixed(0)}%
                      </div>
                    </div>
                  );
                },
              )}

              {topPerformers.length === 0 && (
                <p className="text-white/40 text-xs text-center py-4">
                  No reports recorded yet.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Game Report Modal                                                  */}
      {/* ------------------------------------------------------------------ */}

      <GameReportPdfModal
        selectedCard={selectedCard}
        players={players}
        onClose={() => setSelectedCard(null)}
      />
    </div>
  );
};

export default GameReports;

