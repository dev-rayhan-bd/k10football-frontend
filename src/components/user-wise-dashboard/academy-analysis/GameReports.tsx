/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-function-type */

"use client";

import Image from "next/image";
import { useMemo, useState } from "react";

import { Input } from "@/components/ui/input";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  IconSearch,
  IconClock,
  IconUsers,
  IconTrash,
  IconStar,
  IconTrendingUp,
  IconFileText,
  IconDownload,
  IconX,
  IconCheck,
  IconLoader2,
} from "@tabler/icons-react";

import { toast } from "sonner";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

import logo from "@/assets/sort_logo.png";

import { useAppSelector } from "@/lib/hooks/reduxHooks";
import { MatchStats } from "@/lib/constants/reports";

import RadarChart from "@/components/user-wise-dashboard/coach-dashboard/create-game-report/RadarChart";

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

type ReportStats = {
  shotsOnGoal: number;
  goalScored: number;
  assists: number;
  passAccurate: number;
  wrongPass: number;
  penaltiesTaken: number;
  standTackle: number;
  slidingTackle: number;
  interception: number;
  savesAccurate: number;
  freeKick: number;
  cornerKick: number;
  goalUnsave: number;
  penaltiesSaves: number;
  appearances: number;
  fault: number;
  redCard: number;
  yellowCard: number;
  punching: number;
  handling: number;
  reflex: number;
  aerialAbility: number;
  throwing: number;
  reactions: number;
};

type RadarStat = {
  label: string;
  value: number;
};

type Marker = {
  x: number;
  y: number;
};

type PitchMarker = {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
};

type Player = {
  id?: string | number;
  fullName?: string;
  age?: string | number;
  position?: string;
  validationStatus?: string;
  playerImage?: string | { src?: string };
  dob?: string;
  seasonStats?: {
    matches?: number;
  };
};

type ReportView = MatchStats & {
  id?: string | number;
  playerId?: string | number;
  playerName?: string;
  playerPosition?: string;
  scoutName?: string;
  team1?: string;
  team2?: string;
  date?: string;
  rating?: number;
  goals?: number;
  assists?: number;
  passes?: number;
  passAccuracy?: number;
  score?: string;
  stadium?: string;
  weather?: string;
  temperature?: string | number;
  gameType?: string;
  weight?: string;
  timePlayedMinutes?: number | string;
  height?: string;
  foot?: string;
  characteristics?: string[];
  goalMarkers?: Marker[];
  pitchMarkers?: PitchMarker[];
  tag?: string;
  tier?: string;
  dateFormatted?: string;
};

type SummaryCardProps = {
  label: string;
  value: string | number;
  icon: any;
  bgColor: string;
  textColor: string;
};

type GameReportCardProps = {
  tag: string;
  playerName: string;
  date: string;
  coach: string;
  rating: number;
  goals: number;
  assists: number;
  passes: number;
  pos: string;
  tier: string;
  team1: string;
  team2: string;
  onClick: () => void;
};

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

const getPlayerTag = (player: Player): string => {
  const fullName = player.fullName ?? "";

  if (fullName === "Marcus Silva") return "U-15";
  if (fullName === "Sarah Williams") return "U-16";
  if (fullName === "David Chen") return "U-17";
  if (fullName === "Alex Jonson" || fullName === "Alex Jordan") {
    return "U-17";
  }
  if (fullName === "James Brown") return "U-19";

  const ageNum = parseInt(String(player.age ?? ""), 10);

  if (!Number.isNaN(ageNum)) {
    return `U-${ageNum}`;
  }

  return "U-15";
};

const normalizeRating = (rating: unknown): number => {
  const numericRating = Number(rating ?? 0);

  if (!Number.isFinite(numericRating)) {
    return 0;
  }

  return numericRating <= 10 ? numericRating * 10 : numericRating;
};

const safeString = (value: unknown): string => {
  return String(value ?? "");
};

const getStatsFromReport = (report: ReportView): ReportStats => {
  const isGK =
    safeString(report.playerPosition).toUpperCase() === "GOALKEEPER";

  if (isGK) {
    const passes = Number(report.passes ?? 50);
    const passAccuracy = Number(report.passAccuracy ?? 90);

    return {
      shotsOnGoal: 0,
      goalScored: Number(report.goals ?? 0),
      assists: Number(report.assists ?? 0),
      passAccurate: passes,
      wrongPass:
        Math.round(passes * (1 - passAccuracy / 100)) || 5,
      penaltiesTaken: 0,
      standTackle: 0,
      slidingTackle: 0,
      interception: 0,
      savesAccurate: 10,
      freeKick: 0,
      cornerKick: 0,
      goalUnsave: 1,
      penaltiesSaves: 1,
      appearances: 1,
      fault: 1,
      redCard: Number(report.redCards ?? 0),
      yellowCard: Number(report.yellowCards ?? 0),
      punching: 5,
      handling: 10,
      reflex: 8,
      aerialAbility: 7,
      throwing: 8,
      reactions: 9,
    };
  }

  const passes = Number(report.passes ?? 80);
  const passAccuracy = Number(report.passAccuracy ?? 90);

  return {
    shotsOnGoal: Number(report.goals ?? 0) + 3,
    goalScored: Number(report.goals ?? 0),
    assists: Number(report.assists ?? 0),
    passAccurate: passes,
    wrongPass:
      Math.round(passes * (1 - passAccuracy / 100)) || 8,
    penaltiesTaken: 1,
    standTackle: 6,
    slidingTackle: 4,
    interception: 8,
    savesAccurate: 0,
    freeKick: 3,
    cornerKick: 4,
    goalUnsave: 0,
    penaltiesSaves: 0,
    appearances: 1,
    fault: 2,
    redCard: Number(report.redCards ?? 0),
    yellowCard: Number(report.yellowCards ?? 0),
    punching: 0,
    handling: 0,
    reflex: 0,
    aerialAbility: 5,
    throwing: 0,
    reactions: 8,
  };
};

const mapStat = (value: number, maxValue = 15): number => {
  if (maxValue <= 0) {
    return 50;
  }

  return Math.min(
    99,
    Math.max(50, Math.round(50 + (value / maxValue) * 49)),
  );
};

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
  /* Selected report stats                                                    */
  /* ------------------------------------------------------------------------ */

  const activeStats = selectedCard
    ? getStatsFromReport(selectedCard)
    : null;

  const isGK =
    safeString(selectedCard?.playerPosition).toUpperCase() ===
    "GOALKEEPER";

  const radarStats = useMemo<RadarStat[]>(() => {
    if (!selectedCard || !activeStats) {
      return [];
    }

    const characteristics =
      selectedCard.characteristics ?? [];

    if (isGK) {
      return [
        {
          label: "DIV",
          value: mapStat(
            activeStats.reflex +
            activeStats.savesAccurate,
            25,
          ),
        },
        {
          label: "HAN",
          value: mapStat(
            activeStats.handling +
            activeStats.punching,
            25,
          ),
        },
        {
          label: "KIC",
          value: mapStat(
            activeStats.throwing +
            activeStats.passAccurate,
            25,
          ),
        },
        {
          label: "REF",
          value: mapStat(
            activeStats.reflex +
            activeStats.penaltiesSaves * 5,
            20,
          ),
        },
        {
          label: "SPD",
          value: mapStat(
            activeStats.reactions +
            activeStats.appearances,
            25,
          ),
        },
        {
          label: "POS",
          value: mapStat(
            activeStats.aerialAbility +
            activeStats.savesAccurate,
            25,
          ),
        },
      ];
    }

    return [
      {
        label: "PAC",
        value: mapStat(
          activeStats.reactions +
          (characteristics.includes("FAST") ? 8 : 4),
          20,
        ),
      },
      {
        label: "SHO",
        value: mapStat(
          activeStats.goalScored * 3 +
          activeStats.shotsOnGoal +
          activeStats.penaltiesTaken,
          25,
        ),
      },
      {
        label: "PAS",
        value: mapStat(
          activeStats.assists * 2 +
          activeStats.passAccurate,
          25,
        ),
      },
      {
        label: "DRI",
        value: mapStat(
          activeStats.passAccurate +
          (characteristics.includes("SKILLFUL") ? 8 : 4),
          20,
        ),
      },
      {
        label: "DEF",
        value: mapStat(
          activeStats.standTackle +
          activeStats.slidingTackle +
          activeStats.interception,
          30,
        ),
      },
      {
        label: "PHY",
        value: mapStat(
          activeStats.appearances +
          activeStats.savesAccurate,
          30,
        ),
      },
    ];
  }, [activeStats, isGK, selectedCard]);

  const overallPercent =
    radarStats.length > 0
      ? Math.round(
        radarStats.reduce(
          (sum, stat) => sum + stat.value,
          0,
        ) / radarStats.length,
      )
      : 0;

  /* ------------------------------------------------------------------------ */
  /* PDF generation                                                           */
  /* ------------------------------------------------------------------------ */

  const handleDownloadPDF = async () => {
    if (!selectedCard) {
      toast.error("No report selected.");
      return;
    }

    const page = document.getElementById(
      "report-page-1",
    );

    if (!page) {
      toast.error(
        "Report elements not found in the DOM.",
      );
      return;
    }

    const toastId = toast.loading(
      "Generating PDF report... Please wait.",
    );

    setIsGeneratingPdf(true);

    try {
      const pdf = new jsPDF(
        "p",
        "mm",
        [210, 396.7],
      );

      const canvas = await html2canvas(page, {
        scale: 2,
        useCORS: true,
        allowTaint: false,
        backgroundColor: "#ffffff",
        logging: false,
      });

      const imgData =
        canvas.toDataURL("image/png");

      pdf.addImage(
        imgData,
        "PNG",
        0,
        0,
        210,
        396.7,
      );

      const playerName = safeString(
        selectedCard.playerName,
      ).trim();

      const safeFileName =
        (playerName || "Player")
          .replace(/[^a-zA-Z0-9_-]+/g, "_")
          .replace(/^_+|_+$/g, "");

      pdf.save(
        `Game_Report_${safeFileName || "Player"}.pdf`,
      );

      toast.success(
        "PDF report downloaded successfully!",
        {
          id: toastId,
        },
      );
    } catch (error) {
      console.error(
        "PDF generation failed:",
        error,
      );

      toast.error(
        "Failed to generate PDF.",
        {
          id: toastId,
        },
      );
    } finally {
      setIsGeneratingPdf(false);
    }
  };

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

      <Dialog
        open={Boolean(selectedCard)}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedCard(null);
          }
        }}
      >
        <DialogContent
          showCloseButton={false}
          className="w-screen! h-screen! max-w-none! max-h-none! top-0! left-0! translate-x-0! translate-y-0! rounded-none! border-none! bg-black/98 text-white p-4 sm:p-6 md:p-8 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent"
        >
          {/* Modal Header */}
          <DialogHeader className="flex flex-col md:flex-row justify-between items-center md:items-center gap-4 shrink-0 pb-4 border-b border-white/10 mb-4 md:mb-6">
            <div className="text-center md:text-left">
              <DialogTitle className="text-xl md:text-2xl font-black uppercase text-white font-orbitron tracking-tight">
                Player Game Report
              </DialogTitle>

              <p className="text-[10px] md:text-xs text-white/40 font-bold uppercase tracking-widest mt-1">
                Scouted Match Performance Profile
                {selectedCard?.playerName
                  ? ` for ${selectedCard.playerName}`
                  : ""}
              </p>
            </div>

            <div className="flex flex-wrap gap-3 items-center w-full md:w-auto">
              <button
                type="button"
                onClick={handleDownloadPDF}
                disabled={isGeneratingPdf}
                className="flex items-center justify-center flex-1 md:flex-none gap-2 bg-sky-600 hover:bg-sky-500 border border-transparent text-[10px] font-black uppercase tracking-widest text-white px-4 md:px-6 py-2.5 rounded-xl transition-all shadow-[0_0_15px_rgba(14,165,233,0.2)] cursor-pointer disabled:opacity-50 font-orbitron whitespace-nowrap"
              >
                {isGeneratingPdf ? (
                  <>
                    <IconLoader2
                      className="animate-spin"
                      size={16}
                    />
                    Generating...
                  </>
                ) : (
                  <>
                    <IconDownload size={16} />
                    Download PDF
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() =>
                  setSelectedCard(null)
                }
                className="flex items-center justify-center flex-1 md:flex-none gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-[10px] font-black uppercase tracking-widest text-white px-4 md:px-6 py-2.5 rounded-xl transition-all cursor-pointer font-orbitron whitespace-nowrap"
              >
                <IconX size={16} />
                Close
              </button>
            </div>
          </DialogHeader>

          {/* ---------------------------------------------------------------- */}
          {/* Report Page                                                      */}
          {/* ---------------------------------------------------------------- */}

          {selectedCard && activeStats && (
            <div className="w-full overflow-x-auto custom-scrollbar pb-8">
              <div className="flex flex-col items-center gap-8 py-6 min-w-max mx-auto px-4 md:px-0">
                <div
                  id="report-page-1"
                  className="bg-white text-slate-800 p-10 font-sans relative overflow-hidden select-none flex flex-col"
                  style={{
                    width: "794px",
                    height: "1500px",
                    minWidth: "794px",
                    minHeight: "1500px",
                  }}
                >
                  {/* Watermark */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none z-0">
                    <Image
                      src={logo.src}
                      alt="Logo Watermark"
                      className="w-125 object-contain"
                      width={100}
                      height={100}
                    />
                  </div>

                  {/* ------------------------------------------------------ */}
                  {/* Report Header                                           */}
                  {/* ------------------------------------------------------ */}

                  <div className="relative z-10 flex items-center justify-between border-b-4 border-slate-900 pb-3 mb-4 shrink-0">
                    <div className="flex items-center gap-3">
                      <Image
                        src={logo.src}
                        alt="K10 Logo"
                        className="w-12 h-12 object-contain"
                        width={100}
                        height={100}
                      />

                      <div>
                        <div className="text-xs font-black tracking-widest text-slate-900 font-orbitron">
                          K10 FOOTBALL
                        </div>

                        <div className="text-[8px] text-slate-500 font-bold uppercase tracking-widest font-orbitron">
                          ANALYSIS CV
                        </div>
                      </div>
                    </div>

                    <div className="text-center">
                      <h2 className="text-2xl font-black text-sky-500 font-orbitron uppercase tracking-tighter italic">
                        PLAYER GAME REPORT
                      </h2>

                      <div className="text-[10px] text-slate-900 font-black uppercase tracking-widest mt-1">
                        POSITION :{" "}
                        {selectedCard.playerPosition}{" "}
                        ⚽
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-xs font-black tracking-widest text-slate-900 font-orbitron">
                          K10 FOOTBALL
                        </div>

                        <div className="text-[8px] text-slate-500 font-bold uppercase tracking-widest font-orbitron">
                          ANALYSIS CV
                        </div>
                      </div>

                      <Image
                        src={logo.src}
                        alt="K10 Logo"
                        className="w-12 h-12 object-contain"
                        width={100}
                        height={100}
                      />
                    </div>
                  </div>

                  {/* ------------------------------------------------------ */}
                  {/* Player Details                                          */}
                  {/* ------------------------------------------------------ */}

                  <div className="relative z-10 grid grid-cols-12 gap-4 mb-4 shrink-0">
                    <div className="col-span-8 grid grid-cols-2 gap-x-6 gap-y-2 text-[11px] font-medium text-slate-600">
                      <div>
                        <span className="font-bold text-slate-900 uppercase font-orbitron">
                          PLAYER NAME:
                        </span>

                        <p className="text-slate-700 text-xs font-bold mt-0.5 uppercase">
                          {selectedCard.playerName}
                        </p>
                      </div>

                      <div>
                        <span className="font-bold text-slate-900 uppercase font-orbitron">
                          CLUB NAME:
                        </span>

                        <p className="text-slate-700 text-xs font-bold mt-0.5 uppercase">
                          {selectedCard.team1}
                        </p>
                      </div>

                      <div>
                        <span className="font-bold text-slate-900 uppercase font-orbitron">
                          DOB:
                        </span>

                        <p className="text-slate-700 text-xs font-bold mt-0.5">
                          {matchingPlayer?.dob ||
                            "27-03-2014"}
                        </p>
                      </div>

                      <div>
                        <span className="font-bold text-slate-900 uppercase font-orbitron">
                          MATCHES PLAYED:
                        </span>

                        <p className="text-slate-700 text-xs font-bold mt-0.5">
                          {matchingPlayer?.seasonStats
                            ?.matches || "1"}
                        </p>
                      </div>

                      <div>
                        <span className="font-bold text-slate-900 uppercase font-orbitron">
                          WEIGHT:
                        </span>

                        <p className="text-slate-700 text-xs font-bold mt-0.5">
                          {selectedCard.weight ||
                            "45 KG"}
                        </p>
                      </div>

                      <div>
                        <span className="font-bold text-slate-900 uppercase font-orbitron">
                          MINUTES PLAYED:
                        </span>

                        <p className="text-slate-700 text-xs font-bold mt-0.5">
                          {selectedCard.timePlayedMinutes ||
                            "90"}{" "}
                          MIN
                        </p>
                      </div>

                      <div>
                        <span className="font-bold text-slate-900 uppercase font-orbitron">
                          HEIGHT:
                        </span>

                        <p className="text-slate-700 text-xs font-bold mt-0.5">
                          {selectedCard.height ||
                            "1.20 M"}
                        </p>
                      </div>

                      <div>
                        <span className="font-bold text-slate-900 uppercase font-orbitron">
                          MAN OF THE MATCH:
                        </span>

                        <p className="text-slate-700 text-xs font-bold mt-0.5">
                          1
                        </p>
                      </div>

                      <div>
                        <span className="font-bold text-slate-900 uppercase font-orbitron">
                          FOOT:
                        </span>

                        <p className="text-slate-700 text-xs font-bold mt-0.5 uppercase">
                          {selectedCard.foot ||
                            "RIGHT"}
                        </p>
                      </div>
                    </div>

                    {/* Player Card */}
                    <div className="col-span-4 flex justify-end">
                      <div className="bg-sky-50 border-2 border-sky-200 rounded-xl p-2 w-40 relative shadow-sm">
                        <div className="absolute top-2 left-2 text-sky-600 font-black text-xl italic font-orbitron leading-none">
                          {normalizeRating(
                            selectedCard.rating,
                          ).toFixed(0)}
                        </div>

                        <div className="absolute top-7 left-2 text-slate-400 text-[8px] font-black font-orbitron">
                          {safeString(
                            selectedCard.playerPosition,
                          )
                            .substring(0, 3)
                            .toUpperCase() ||
                            "MID"}
                        </div>

                        <div className="absolute top-2 right-2 flex flex-col items-end gap-1">
                          <Image
                            src="/Brazil.png"
                            alt="Brazil"
                            className="w-4 h-3 object-cover rounded-[2px]"
                            width={16}
                            height={12}
                          />

                          <Image
                            src={logo.src}
                            alt="K10"
                            className="w-4 h-4 object-contain opacity-50"
                            width={16}
                            height={16}
                          />
                        </div>

                        <div className="mt-3 flex justify-center">
                          <Image
                            src={playerImgSrc}
                            alt="Player"
                            className="h-28 object-contain object-bottom drop-shadow-md"
                            width={100}
                            height={100}
                          />
                        </div>

                        <div className="text-center bg-sky-500 text-white text-[9px] font-black uppercase tracking-wider py-1 rounded mt-1 font-orbitron">
                          {safeString(
                            selectedCard.playerName,
                          ).split(" ")[0] ||
                            "PLAYER"}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ------------------------------------------------------ */}
                  {/* Characteristics                                        */}
                  {/* ------------------------------------------------------ */}

                  <div className="relative z-10 mb-4 shrink-0">
                    <div className="bg-sky-500 text-white font-orbitron px-4 py-1 rounded text-[10px] font-black uppercase tracking-wider mb-2 shadow">
                      PLAYER CHARACTERISTIC
                    </div>

                    <div className="flex gap-4 pl-2">
                      {(
                        selectedCard.characteristics ||
                        [
                          "FAST",
                          "SKILLFUL",
                          "FINISHER",
                        ]
                      ).map(
                        (
                          characteristic,
                          index,
                        ) => (
                          <div
                            key={`${characteristic}-${index}`}
                            className="flex items-center gap-1.5 text-[10px] font-bold text-slate-700 uppercase tracking-wide"
                          >
                            <IconCheck
                              size={12}
                              className="text-sky-500"
                            />

                            {characteristic}
                          </div>
                        ),
                      )}
                    </div>
                  </div>

                  {/* ------------------------------------------------------ */}
                  {/* Match Information                                      */}
                  {/* ------------------------------------------------------ */}

                  <div className="relative z-10 mb-4 shrink-0">
                    <div className="bg-sky-500 text-white font-orbitron px-4 py-1 rounded text-[10px] font-black uppercase tracking-wider mb-2 shadow">
                      MATCH INFORMATION
                    </div>

                    <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-[10px] pl-2">
                      <div>
                        <span className="font-bold text-slate-950 font-orbitron">
                          SCOUT NAME:
                        </span>

                        <span className="ml-2 text-slate-700 font-bold uppercase">
                          {selectedCard.scoutName ||
                            "MARIO LOPEZ"}
                        </span>
                      </div>

                      <div>
                        <span className="font-bold text-slate-950 font-orbitron">
                          GAME DATE:
                        </span>

                        <span className="ml-2 text-slate-700 font-bold uppercase">
                          {selectedCard.date ||
                            "N/A"}
                        </span>
                      </div>

                      <div>
                        <span className="font-bold text-slate-950 font-orbitron">
                          MATCH RESULT:
                        </span>

                        <span className="ml-2 text-slate-700 font-bold uppercase">
                          {safeString(
                            selectedCard.playerName,
                          ).split(" ")[0] || "PLAYER"}{" "}
                          {selectedCard.score ||
                            "N/A"}{" "}
                          {selectedCard.team2 ||
                            "N/A"}
                        </span>
                      </div>

                      <div>
                        <span className="font-bold text-slate-950 font-orbitron">
                          GAME LOCATION:
                        </span>

                        <span className="ml-2 text-slate-700 font-bold uppercase">
                          {selectedCard.stadium ||
                            "LONDON"}
                        </span>
                      </div>

                      <div>
                        <span className="font-bold text-slate-950 font-orbitron">
                          WEATHER/TEMPERATURE:
                        </span>

                        <span className="ml-2 text-slate-700 font-bold uppercase">
                          {selectedCard.weather ||
                            "RAINY"}{" "}
                          {selectedCard.temperature ??
                            "19"}
                          C
                        </span>
                      </div>

                      <div>
                        <span className="font-bold text-slate-950 font-orbitron">
                          GAME TYPE:
                        </span>

                        <span className="ml-2 text-slate-700 font-bold uppercase">
                          {selectedCard.gameType ||
                            "CHAMPIONSHIP MATCH"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* ------------------------------------------------------ */}
                  {/* Match Statistics                                       */}
                  {/* ------------------------------------------------------ */}

                  <div className="relative z-10 mb-4 shrink-0">
                    <div className="bg-sky-500 text-white font-orbitron px-4 py-1 rounded text-[10px] font-black uppercase tracking-wider mb-2 shadow">
                      MATCH STATISTICS
                    </div>

                    <div className="grid grid-cols-3 gap-x-8 gap-y-1 text-[10px] pl-2">
                      {[
                        {
                          label: "Shots on Goal:",
                          val: activeStats.shotsOnGoal,
                        },
                        {
                          label: "Stand Tackle:",
                          val: activeStats.standTackle,
                        },
                        {
                          label: "Appearances:",
                          val: activeStats.appearances,
                        },
                        {
                          label: "Goals Scored:",
                          val: activeStats.goalScored,
                        },
                        {
                          label: "Sliding Tackle:",
                          val: activeStats.slidingTackle,
                        },
                        {
                          label: "Fault:",
                          val: activeStats.fault,
                        },
                        {
                          label: "Assists:",
                          val: activeStats.assists,
                        },
                        {
                          label: "Interception:",
                          val: activeStats.interception,
                        },
                        {
                          label: "Punching:",
                          val: activeStats.punching,
                        },
                        {
                          label: "Pass Accurate:",
                          val: activeStats.passAccurate,
                        },
                        {
                          label: "Saves Accurate:",
                          val: activeStats.savesAccurate,
                        },
                        {
                          label: "Handling:",
                          val: activeStats.handling,
                        },
                        {
                          label: "Wrong Pass:",
                          val: activeStats.wrongPass,
                        },
                        {
                          label: "Goals Unsave:",
                          val: activeStats.goalUnsave,
                        },
                        {
                          label: "Reflex:",
                          val: activeStats.reflex,
                        },
                        {
                          label: "Free Kick:",
                          val: activeStats.freeKick,
                        },
                        {
                          label: "Penalties Save:",
                          val: activeStats.penaltiesSaves,
                        },
                        {
                          label: "Aerial Ability:",
                          val: activeStats.aerialAbility,
                        },
                        {
                          label: "Corner Kick:",
                          val: activeStats.cornerKick,
                        },
                        {
                          label: "Red Card:",
                          val: activeStats.redCard,
                        },
                        {
                          label: "Throwing:",
                          val: activeStats.throwing,
                        },
                        {
                          label: "Penalties Taken:",
                          val: activeStats.penaltiesTaken,
                        },
                        {
                          label: "Yellow Card:",
                          val: activeStats.yellowCard,
                        },
                        {
                          label: "Reactions:",
                          val: activeStats.reactions,
                        },
                      ].map(
                        (item, index) => (
                          <div
                            key={`${item.label}-${index}`}
                            className="flex justify-between border-b border-slate-100 py-0.5 pr-2"
                          >
                            <span className="text-slate-500 font-bold uppercase font-orbitron">
                              {item.label}
                            </span>

                            <span className="text-slate-800 font-black font-orbitron">
                              {item.val}
                            </span>
                          </div>
                        ),
                      )}
                    </div>
                  </div>

                  {/* ------------------------------------------------------ */}
                  {/* Diagrams                                                */}
                  {/* ------------------------------------------------------ */}

                  <div className="relative z-10 grid grid-cols-2 gap-8 mt-4 mb-4 shrink-0">
                    {/* Goal Diagram */}
                    <div className="bg-[#121212]/90 border border-slate-200 rounded-3xl overflow-hidden shadow-xl h-48">
                      <div className="bg-slate-100 py-2 px-4 text-center border-b border-slate-200">
                        <span className="text-[10px] font-black text-slate-800 uppercase tracking-widest font-orbitron">
                          {isGK
                            ? "Accurate Save"
                            : "Accurate Shots"}
                        </span>
                      </div>

                      <div className="relative overflow-hidden w-full h-full bg-black">
                        <Image
                          src="/goal-bar.png"
                          alt="Goal"
                          className="w-full h-auto block scale-[1.4] origin-[50%_90%]"
                          width={100}
                          height={100}
                        />

                        {selectedCard.goalMarkers?.map(
                          (marker, index) => (
                            <div
                              key={`goal-marker-${index}`}
                              className="absolute w-6 h-6 -ml-3 -mt-3 flex items-center justify-center drop-shadow-lg"
                              style={{
                                left: `${marker.x}%`,
                                top: `${marker.y}%`,
                              }}
                            >
                              <span className="text-lg leading-none">
                                {isGK
                                  ? "🧤"
                                  : "⚽"}
                              </span>
                            </div>
                          ),
                        )}
                      </div>
                    </div>

                    {/* Pitch Diagram */}
                    <div className="bg-[#121212]/90 border border-slate-200 rounded-3xl overflow-hidden shadow-xl h-48">
                      <div className="bg-slate-100 py-2 px-4 text-center border-b border-slate-200">
                        <span className="text-[10px] font-black text-slate-800 uppercase tracking-widest font-orbitron">
                          {isGK
                            ? "Accurate Saves"
                            : "Accurate Assist"}
                        </span>
                      </div>

                      <div className="relative w-full h-full bg-[#092b15]">
                        <Image
                          src="/formation-field.png"
                          alt="Pitch"
                          className="w-full h-full object-cover"
                          width={100}
                          height={100}
                        />

                        {selectedCard.pitchMarkers?.map(
                          (line, index) => (
                            <svg
                              key={`pitch-marker-${index}`}
                              className="absolute inset-0 w-full h-full pointer-events-none drop-shadow-md"
                            >
                              <defs>
                                <marker
                                  id={`arrowhead-pdf-${index}`}
                                  markerWidth="10"
                                  markerHeight="7"
                                  refX="9"
                                  refY="3.5"
                                  orient="auto"
                                >
                                  <polygon
                                    points="0 0, 10 3.5, 0 7"
                                    fill="black"
                                  />
                                </marker>
                              </defs>

                              <line
                                x1={`${line.x1}%`}
                                y1={`${line.y1}%`}
                                x2={`${line.x2}%`}
                                y2={`${line.y2}%`}
                                stroke="black"
                                strokeWidth="3"
                                markerEnd={`url(#arrowhead-pdf-${index})`}
                              />

                              <foreignObject
                                x={`calc(${line.x1}% - 8px)`}
                                y={`calc(${line.y1}% - 8px)`}
                                width="16"
                                height="16"
                              >
                                <div className="w-full h-full flex items-center justify-center bg-white/20 rounded-full backdrop-blur-sm shadow-sm border border-white/50">
                                  <span className="text-[10px] leading-none drop-shadow-md">
                                    ⚽
                                  </span>
                                </div>
                              </foreignObject>
                            </svg>
                          ),
                        )}
                      </div>
                    </div>
                  </div>

                  {/* ------------------------------------------------------ */}
                  {/* Bottom Section                                         */}
                  {/* ------------------------------------------------------ */}

                  <div className="relative z-10 flex items-center justify-between border-t-2 border-slate-200 pt-4 mt-auto">
                    {/* Radar */}
                    <div className="w-45">
                      <RadarChart
                        stats={radarStats}
                        size={140}
                        color="#0284c7"
                        fillColor="rgba(2, 132, 199, 0.25)"
                        textColor="#475569"
                        gridColor="rgba(0, 0, 0, 0.1)"
                      />
                    </div>

                    {/* Overall */}
                    <div className="text-center flex-1 min-w-0">
                      <div className="text-4xl font-black text-emerald-600 font-orbitron tracking-tighter italic">
                        OVERALL = {overallPercent}%
                      </div>
                    </div>

                    {/* Logo */}
                    <div className="flex flex-col items-center gap-1.5 w-45">
                      <Image
                        src={logo.src}
                        alt="K10 Logo"
                        className="w-10 h-10 object-contain"
                        width={100}
                        height={100}
                      />

                      <div className="text-center leading-none">
                        <div className="text-[10px] font-black tracking-widest text-slate-900 font-orbitron">
                          K10 FOOTBALL
                        </div>

                        <div className="text-[7px] text-slate-500 font-bold uppercase tracking-widest font-orbitron">
                          ANALYSIS CV
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GameReports;
