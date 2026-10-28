/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useMemo, useState, useEffect } from "react";
import Image from "next/image";
import { toast } from "sonner";
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
  IconChevronLeft,
  IconChevronRight,
  IconLoader2,
} from "@tabler/icons-react";

import { useAppSelector } from "@/hooks/reduxHooks";
import { MatchStats } from "@/lib/constants/reports";
import { useGetAcademyGameReportsQuery } from "@/redux/features/academy/academyApi";
import { IAcademyScoutingReportItem } from "@/types/academy.type";

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
      className={`size-10 md:size-12 rounded-xl flex items-center justify-center ${bgColor} bg-opacity-20 border border-white/20 shrink-0`}
    >
      {Icon && (
        <Icon
          className={`size-5 md:size-6 ${textColor}`}
          stroke={2}
        />
      )}
    </div>

    <div className="flex flex-col gap-0.5 truncate">
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
  matchTitle,
  performanceRatio,
  positionTierBadge,
  onClick,
  onPdfClick,
}: GameReportCardProps) => {
  const displayRating = normalizeRating(rating);
  const titleDisplay = matchTitle || (team2 ? `${team1} vs ${team2}` : team1 || "Match Report");

  return (
    <div
      onClick={onClick}
      className="bg-[#111111] border border-white/20 rounded-3xl p-5 sm:p-6 flex flex-col gap-5 sm:gap-6 group hover:border-white/40 transition-all cursor-pointer relative"
    >
      <div className="flex justify-between items-center gap-2">
        <span className="bg-white/5 border border-white/20 rounded-full px-3 py-1 sm:px-4 text-[9px] sm:text-[10px] font-bold text-white/60 whitespace-nowrap">
          {tag}
        </span>

        <span className="text-white/40 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider truncate text-right">
          {titleDisplay}
        </span>
      </div>

      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2 text-white/40 text-[10px] font-bold">
          <IconClock size={12} />
          {date}
        </div>

        <h3 className="text-white text-xl font-black font-orbitron group-hover:text-[#E31B23] transition-colors truncate">
          {playerName}
        </h3>

        <p className="text-white/40 text-[10px] font-bold flex items-center gap-1 truncate">
          <IconUsers size={12} className="shrink-0" />
          Scout: {coach}
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-end">
          <p className="text-white/40 text-[10px] font-bold uppercase">
            Overall Performance:
          </p>

          <p className="text-white/60 text-[10px] font-bold">
            {performanceRatio || `(${displayRating.toFixed(0)}% / 100%)`}
          </p>
        </div>

        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-sky-500 to-sky-400"
            style={{
              width: `${Math.min(100, Math.max(0, displayRating))}%`,
            }}
          />
        </div>
      </div>

      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-3 xl:gap-0 mt-2 xl:mt-0">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="flex items-center gap-1 sm:gap-1.5 text-emerald-400 text-[10px] font-bold">
            <div className="size-2 sm:size-2.5 rounded-full border-2 border-emerald-400 flex items-center justify-center p-px">
              <div className="size-full bg-emerald-400 rounded-full" />
            </div>
            {goals} G
          </div>

          <div className="flex items-center gap-1 sm:gap-1.5 text-yellow-400 text-[10px] font-bold">
            <div className="size-2 sm:size-2.5 rounded-full border-2 border-yellow-400 flex items-center justify-center p-px">
              <div className="size-full bg-yellow-400 rounded-full" />
            </div>
            {assists} A
          </div>

          <div className="flex items-center gap-1 sm:gap-1.5 text-sky-400 text-[10px] font-bold">
            <div className="size-2 sm:size-2.5 rounded-full border-2 border-sky-400 flex items-center justify-center p-px">
              <div className="size-full bg-sky-400 rounded-full" />
            </div>
            {passes} P
          </div>
        </div>

        <div className="flex items-center justify-between w-full xl:w-auto gap-3">
          <span className="text-white/40 text-[9px] sm:text-[10px] font-bold uppercase truncate">
            {positionTierBadge || `${pos} · ${tier}`}
          </span>

          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              toast.info("Deletion is managed on the coach dashboard.");
            }}
            className="text-red-500/40 hover:text-red-500 transition-colors cursor-pointer"
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

  // Search & Pagination state
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const limit = 9;

  const [selectedCard, setSelectedCard] = useState<ReportView | null>(null);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // RTK Query: fetch academy game reports
  const {
    data: apiResponse,
    isLoading,
    isFetching,
    refetch,
  } = useGetAcademyGameReportsQuery({
    searchTerm: debouncedSearch.trim() || undefined,
    page,
    limit,
  });

  const dashboardData = apiResponse?.data;
  const metrics = dashboardData?.metrics;
  const scoutingReports: IAcademyScoutingReportItem[] = useMemo(
    () => dashboardData?.scoutingReports || [],
    [dashboardData?.scoutingReports]
  );
  const apiTopScorers = dashboardData?.topScorers || [];
  const apiTopPerformers = dashboardData?.topPerformers || [];
  const meta = dashboardData?.meta;

  /* ------------------------------------------------------------------------ */
  /* Map fallback local reports                                               */
  /* ------------------------------------------------------------------------ */

  const fallbackMappedReports = useMemo<ReportView[]>(() => {
    return reports.map((report) => {
      const reportAny = report as ReportView;

      const player = reportAny.playerId
        ? players.find((playerItem) => playerItem.id === reportAny.playerId)
        : undefined;

      const playerName = player?.fullName || reportAny.playerName || "Marcus Silva";
      const playerPosition = player?.position || reportAny.playerPosition || "Defensive Midfielder";
      const tag = player ? getPlayerTag(player) : "U-15";
      const tier = player?.validationStatus === "verified" ? "TIER 1" : "TIER 2";

      let formattedDate = reportAny.date || "Unknown Date";
      if (reportAny.date) {
        const date = new Date(reportAny.date);
        if (!Number.isNaN(date.getTime())) {
          formattedDate = date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          });
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

  const fallbackFilteredReports = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();
    if (!search) return fallbackMappedReports;

    return fallbackMappedReports.filter((report) => {
      return (
        safeString(report.playerName).toLowerCase().includes(search) ||
        safeString(report.playerPosition).toLowerCase().includes(search) ||
        safeString(report.scoutName).toLowerCase().includes(search) ||
        safeString(report.team1).toLowerCase().includes(search) ||
        safeString(report.team2).toLowerCase().includes(search)
      );
    });
  }, [fallbackMappedReports, searchTerm]);

  /* ------------------------------------------------------------------------ */
  /* Map API reports                                                          */
  /* ------------------------------------------------------------------------ */

  const apiMappedReports: ReportView[] = useMemo(() => {
    return scoutingReports.map((report) => {
      const rawRatingNum = parseFloat(String(report.overallPerformance).replace("%", "")) || 0;
      const parts = report.matchTitle ? report.matchTitle.split(" VS ") : [];

      return {
        id: report._id,
        playerId: report.playerId,
        playerName: report.playerName,
        playerAvatar: report.playerAvatar,
        playerPosition: report.position,
        tag: report.ageGroup,
        tier: report.tier,
        positionTierBadge: report.positionTierBadge,
        date: report.date,
        dateFormatted: report.date,
        scoutName: report.scoutName || "Pending Analysis",
        matchTitle: report.matchTitle,
        team1: parts[0]?.trim() || report.matchTitle,
        team2: parts[1]?.trim() || "",
        rating: rawRatingNum,
        overallPerformance: report.overallPerformance,
        performanceRatio: report.performanceRatio,
        goals: report.goals,
        assists: report.assists,
        passes: report.passes,
        status: report.status,
      };
    });
  }, [scoutingReports]);

  const isUsingApi = Boolean(apiResponse?.success !== undefined);
  const reportsToRender = isUsingApi ? apiMappedReports : fallbackFilteredReports;

  /* ------------------------------------------------------------------------ */
  /* Summary stats                                                            */
  /* ------------------------------------------------------------------------ */

  const totalReportsCount = fallbackMappedReports.length;
  const fallbackAvgRatingVal =
    totalReportsCount > 0
      ? (
          fallbackMappedReports.reduce((sum, report) => sum + normalizeRating(report.rating), 0) /
          totalReportsCount
        ).toFixed(1)
      : "0.0";
  const fallbackTotalGoals = fallbackMappedReports.reduce(
    (sum, report) => sum + Number(report.goals ?? 0),
    0
  );
  const fallbackTotalAssists = fallbackMappedReports.reduce(
    (sum, report) => sum + Number(report.assists ?? 0),
    0
  );

  const displayAvgRating = metrics?.avgMatchRating || `${fallbackAvgRatingVal}%`;
  const displayTotalGoals = metrics?.totalGoals ?? fallbackTotalGoals;
  const displayTotalAssists = metrics?.totalAssists ?? fallbackTotalAssists;
  const displayTotalReports = metrics?.totalReports ?? totalReportsCount;

  /* ------------------------------------------------------------------------ */
  /* Sidebar Data                                                             */
  /* ------------------------------------------------------------------------ */

  const fallbackTopPerformers = [...fallbackMappedReports]
    .sort((a, b) => normalizeRating(b.rating) - normalizeRating(a.rating))
    .slice(0, 5);

  const goalMap: Record<string, { name: string; goals: number; pos: string; team: string }> = {};
  fallbackMappedReports.forEach((report) => {
    const name = safeString(report.playerName);
    if (!name) return;
    if (!goalMap[name]) {
      goalMap[name] = {
        name,
        goals: 0,
        pos: report.playerPosition || "Unknown Position",
        team: report.tag || "U-15",
      };
    }
    goalMap[name].goals += Number(report.goals ?? 0);
  });
  const fallbackTopScorers = Object.values(goalMap)
    .sort((a, b) => b.goals - a.goals)
    .slice(0, 4);

  return (
    <div className="flex flex-col gap-6 md:gap-8 pb-10 w-full max-w-full overflow-x-hidden">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl md:text-5xl font-black text-white font-orbitron uppercase tracking-tight">
            Game Reports
          </h1>

          <p className="text-white/60 font-medium mt-2 text-sm md:text-lg">
            Professional player match performance analysis and scout records
          </p>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        <SummaryCard
          label="Avg. Match Rating"
          value={displayAvgRating}
          icon={IconStar}
          bgColor="bg-sky-500"
          textColor="text-sky-500"
        />

        <SummaryCard
          label="Total Goals"
          value={displayTotalGoals}
          icon={IconTrendingUp}
          bgColor="bg-emerald-500"
          textColor="text-emerald-500"
        />

        <SummaryCard
          label="Total Assists"
          value={displayTotalAssists}
          icon={IconFileText}
          bgColor="bg-blue-500"
          textColor="text-blue-500"
        />

        <SummaryCard
          label="Total Reports"
          value={displayTotalReports}
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
                onChange={(event) => setSearchTerm(event.target.value)}
              />

              {isFetching && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  <IconLoader2 size={16} className="text-white/40 animate-spin" />
                </div>
              )}
            </div>
          </div>

          {/* Reports Grid */}
          <div className="flex flex-col gap-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <h2 className="text-xl md:text-2xl font-black text-white font-orbitron uppercase tracking-tight">
                  Scouting Reports
                </h2>
                {meta?.total !== undefined && (
                  <span className="text-xs font-bold text-white/40 bg-white/5 border border-white/10 px-2.5 py-0.5 rounded-full">
                    {meta.total}
                  </span>
                )}
              </div>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div
                    key={i}
                    className="bg-[#111111] border border-white/10 rounded-3xl p-6 flex flex-col gap-5 shimmer"
                  >
                    <div className="w-16 h-5 bg-white/10 rounded-full" />
                    <div className="flex flex-col gap-2">
                      <div className="w-24 h-3 bg-white/5 rounded-sm" />
                      <div className="w-40 h-6 bg-white/10 rounded-sm" />
                      <div className="w-32 h-3 bg-white/5 rounded-sm" />
                    </div>
                    <div className="w-full h-2 bg-white/5 rounded-full" />
                    <div className="flex justify-between items-center pt-2">
                      <div className="w-20 h-4 bg-white/10 rounded-sm" />
                      <div className="w-16 h-4 bg-white/5 rounded-sm" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
                {reportsToRender.map((report, index) => (
                  <GameReportCard
                    key={report.id ? `${report.id}-${index}` : `report-${index}`}
                    tag={report.tag || "U-15"}
                    playerName={report.playerName || "Unknown Player"}
                    date={report.dateFormatted || report.date || "Unknown Date"}
                    coach={report.scoutName || "Unknown Scout"}
                    rating={Number(report.rating ?? 0)}
                    goals={Number(report.goals ?? 0)}
                    assists={Number(report.assists ?? 0)}
                    passes={Number(report.passes ?? 0)}
                    pos={report.playerPosition || "Unknown Position"}
                    tier={report.tier || "TIER 1"}
                    team1={report.team1 || "Team 1"}
                    team2={report.team2 || ""}
                    matchTitle={report.matchTitle}
                    performanceRatio={report.performanceRatio}
                    positionTierBadge={report.positionTierBadge}
                    status={report.status}
                    onClick={() => setSelectedCard(report)}
                    onPdfClick={() => setSelectedCard(report)}
                  />
                ))}
              </div>
            )}

            {!isLoading && reportsToRender.length === 0 && (
              <div className="col-span-full text-center py-16 border border-white/5 rounded-3xl bg-[#111111]/50 text-white/40 font-medium">
                No match reports found matching search query.
              </div>
            )}

            {/* Pagination */}
            {meta?.totalPages !== undefined && meta.totalPages > 1 && (
              <div className="flex justify-between items-center pt-4 border-t border-white/10 text-white/60 text-xs font-bold">
                <p>
                  Page {meta.page} of {meta.totalPages} ({meta.total} Total)
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={page <= 1 || isFetching}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="p-2 bg-[#111111] border border-white/10 rounded-lg hover:border-white/30 disabled:opacity-40 transition-colors cursor-pointer"
                  >
                    <IconChevronLeft size={16} />
                  </button>
                  <button
                    type="button"
                    disabled={page >= meta.totalPages || isFetching}
                    onClick={() => setPage((p) => p + 1)}
                    className="p-2 bg-[#111111] border border-white/10 rounded-lg hover:border-white/30 disabled:opacity-40 transition-colors cursor-pointer"
                  >
                    <IconChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-full xl:w-85 flex flex-col gap-8 shrink-0 min-w-0">
          {/* Top Scorers */}
          <div className="bg-[#111111] border border-white/20 rounded-3xl md:rounded-4xl p-6 md:p-8 flex flex-col gap-5 md:gap-6">
            <div className="flex items-center gap-3">
              <div className="size-8 md:size-10 rounded-xl bg-sky-600 flex items-center justify-center shadow-[0_0_20px_rgba(14,165,233,0.2)] shrink-0">
                <IconTrendingUp className="text-white size-4 md:size-5" />
              </div>

              <h2 className="text-xl md:text-2xl font-black text-white font-orbitron uppercase tracking-tight">
                Top Scorers
              </h2>
            </div>

            <div className="flex flex-col gap-4">
              {isUsingApi && apiTopScorers.length > 0 ? (
                apiTopScorers.map((player, index) => (
                  <div
                    key={player._id || `${player.name}-${index}`}
                    className="flex justify-between items-center"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {player.avatar ? (
                        <div className="relative size-8 rounded-lg overflow-hidden border border-white/10 shrink-0">
                          <Image
                            src={player.avatar}
                            alt={player.name}
                            fill
                            className="object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                            }}
                          />
                        </div>
                      ) : (
                        <IconFileText size={16} className="text-sky-400 shrink-0" />
                      )}

                      <div className="truncate">
                        <p className="text-white text-sm font-black truncate">
                          {player.name}
                        </p>

                        <p className="text-white/60 text-[10px] font-bold uppercase tracking-wider truncate">
                          {player.ageGroup} · {player.position}
                        </p>
                      </div>
                    </div>

                    <span className="px-3 py-1 rounded-full text-[10px] font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 shrink-0">
                      {player.goals} Goals
                    </span>
                  </div>
                ))
              ) : (
                fallbackTopScorers.map((player, index) => (
                  <div
                    key={`${player.name}-${index}`}
                    className="flex justify-between items-center"
                  >
                    <div className="flex items-center gap-3 truncate">
                      <IconFileText size={16} className="text-sky-400 shrink-0" />

                      <div className="truncate">
                        <p className="text-white text-sm font-black truncate">
                          {player.name}
                        </p>

                        <p className="text-white/60 text-[10px] font-bold uppercase tracking-wider truncate">
                          {player.team} · {player.pos}
                        </p>
                      </div>
                    </div>

                    <span className="px-3 py-1 rounded-full text-[10px] font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 shrink-0">
                      {player.goals} Goals
                    </span>
                  </div>
                ))
              )}

              {((isUsingApi && apiTopScorers.length === 0) ||
                (!isUsingApi && fallbackTopScorers.length === 0)) && (
                <p className="text-white/40 text-xs text-center py-4">
                  No goals recorded yet.
                </p>
              )}
            </div>
          </div>

          {/* Top Performers */}
          <div className="bg-[#111111] border border-white/20 rounded-3xl md:rounded-4xl p-6 md:p-8 flex flex-col gap-5 md:gap-6">
            <div className="flex items-center gap-3">
              <div className="size-8 md:size-10 rounded-xl bg-sky-500/10 flex items-center justify-center shrink-0">
                <IconStar className="text-sky-500 size-4 md:size-5" />
              </div>

              <h2 className="text-xl md:text-2xl font-black text-white font-orbitron uppercase tracking-tight">
                Top Performers
              </h2>
            </div>

            <div className="flex flex-col gap-6">
              {isUsingApi && apiTopPerformers.length > 0 ? (
                apiTopPerformers.map((performer, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center"
                  >
                    <div className="flex items-center gap-3 truncate">
                      <span className="text-sky-500 text-[10px] font-black font-orbitron shrink-0">
                        {performer.rank || `#${index + 1}`}
                      </span>

                      <div className="truncate">
                        <p className="text-white text-sm font-bold truncate">
                          {performer.name}
                        </p>

                        <p className="text-white/40 text-[10px] font-bold uppercase truncate">
                          {performer.position}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 text-white text-[10px] font-black font-orbitron shrink-0">
                      <IconStar
                        size={14}
                        className="text-sky-500 fill-sky-500/20"
                      />
                      {performer.rating}
                    </div>
                  </div>
                ))
              ) : (
                fallbackTopPerformers.map((report, index) => {
                  const displayRating = normalizeRating(report.rating);

                  return (
                    <div
                      key={report.id ? `${report.id}-${index}` : `performer-${index}`}
                      className="flex justify-between items-center"
                    >
                      <div className="flex items-center gap-3 truncate">
                        <span className="text-sky-500 text-[10px] font-black font-orbitron shrink-0">
                          #{index + 1}
                        </span>

                        <div className="truncate">
                          <p className="text-white text-sm font-bold truncate">
                            {report.playerName}
                          </p>

                          <p className="text-white/40 text-[10px] font-bold uppercase truncate">
                            {report.tag} · {report.playerPosition}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 text-white text-[10px] font-black font-orbitron shrink-0">
                        <IconStar
                          size={14}
                          className="text-sky-500 fill-sky-500/20"
                        />
                        {displayRating.toFixed(0)}%
                      </div>
                    </div>
                  );
                })
              )}

              {((isUsingApi && apiTopPerformers.length === 0) ||
                (!isUsingApi && fallbackTopPerformers.length === 0)) && (
                <p className="text-white/40 text-xs text-center py-4">
                  No reports recorded yet.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Game Report Modal */}
      <GameReportPdfModal
        selectedCard={selectedCard}
        players={players}
        onClose={() => setSelectedCard(null)}
      />
    </div>
  );
};

export default GameReports;
