/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  IconArrowLeft,
  IconPlus,
  IconSearch,
  IconUsers,
  IconTrophy,
  IconBallFootball,
  IconShirt,
  IconMapPin,
  IconRefresh,
  IconLoader2,
  IconAlertCircle,
  IconShield,
  IconStarFilled,
  IconCheck,
  IconUserCheck,
  IconSparkles,
  IconTrash,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  useGetTeamRosterQuery,
  useAssignCoachToTeamMutation,
  useAssignPlayerToTeamMutation,
  useRemoveCoachFromTeamMutation,
  useRemovePlayerFromTeamMutation,
} from "@/redux/features/academy/academyApi";
import { useGetAllCoachesQuery } from "@/redux/features/coach/coachApi";
import { useGetPlayersQuery } from "@/redux/features/player/playerApi";
import {
  ITeamRosterCoachItem,
  ITeamRosterPlayerItem,
} from "@/types/academy.type";
import { ICoachListItem } from "@/types/coach.type";

interface TeamDetailsProps {
  teamId: string;
}

const formatAgeGroup = (ageGroup?: string) => {
  if (!ageGroup) return "N/A";
  const normalized = ageGroup.trim();
  if (normalized.toLowerCase().startsWith("u") && !isNaN(Number(normalized.slice(1)))) {
    return `Under ${normalized.slice(1)}`;
  }
  return ageGroup;
};

const getCvTierBadge = (tier?: string) => {
  const normalized = (tier || "BRONZE").toUpperCase();
  if (normalized === "GOLD") {
    return "bg-amber-400/10 text-amber-300 border-amber-400/30 shadow-[0_0_12px_rgba(251,191,36,0.15)]";
  }
  if (normalized === "SILVER") {
    return "bg-slate-300/10 text-slate-200 border-slate-300/30 shadow-[0_0_12px_rgba(203,213,225,0.1)]";
  }
  return "bg-orange-600/10 text-orange-400 border-orange-600/30 shadow-[0_0_12px_rgba(234,88,12,0.1)]";
};

const getPositionBadge = (pos?: string) => {
  const p = (pos || "").toLowerCase();
  if (p.includes("forward") || p.includes("st") || p.includes("cf") || p.includes("lw") || p.includes("rw") || p.includes("attacker")) {
    return "bg-rose-500/10 text-rose-400 border-rose-500/25";
  }
  if (p.includes("midfield") || p.includes("cam") || p.includes("cm") || p.includes("cdm") || p.includes("lm") || p.includes("rm")) {
    return "bg-emerald-500/10 text-emerald-400 border-emerald-500/25";
  }
  if (p.includes("defend") || p.includes("cb") || p.includes("lb") || p.includes("rb") || p.includes("lwb") || p.includes("rwb")) {
    return "bg-sky-500/10 text-sky-400 border-sky-500/25";
  }
  if (p.includes("goal") || p.includes("gk") || p.includes("keeper")) {
    return "bg-amber-500/10 text-amber-400 border-amber-500/25";
  }
  return "bg-white/5 text-white/70 border-white/10";
};

export const TeamDetails = ({ teamId }: TeamDetailsProps) => {
  const router = useRouter();

  // Queries
  const {
    data: rosterResponse,
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useGetTeamRosterQuery(teamId, { skip: !teamId });

  const { data: coachesData, isLoading: isLoadingCoaches } = useGetAllCoachesQuery();
  const { data: playersResponse, isLoading: isLoadingPlayers } = useGetPlayersQuery({});

  // Mutations
  const [assignCoach, { isLoading: isAssigningCoach }] = useAssignCoachToTeamMutation();
  const [assignPlayer, { isLoading: isAssigningPlayer }] = useAssignPlayerToTeamMutation();
  const [removeCoach, { isLoading: isRemovingCoach }] = useRemoveCoachFromTeamMutation();
  const [removePlayer, { isLoading: isRemovingPlayer }] = useRemovePlayerFromTeamMutation();

  // Modals & Search state
  const [isAssignCoachOpen, setIsAssignCoachOpen] = useState(false);
  const [isAssignPlayerOpen, setIsAssignPlayerOpen] = useState(false);
  const [coachToRemove, setCoachToRemove] = useState<ITeamRosterCoachItem | null>(null);
  const [playerToRemove, setPlayerToRemove] = useState<ITeamRosterPlayerItem | null>(null);

  // Coach modal state
  const [selectedCoachId, setSelectedCoachId] = useState<string>("");
  const [selectedRole, setSelectedRole] = useState<string>("ASSISTANT COACH");
  const [coachSearch, setCoachSearch] = useState<string>("");

  // Player modal state
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>("");
  const [playerModalSearch, setPlayerModalSearch] = useState<string>("");

  // Squad table filters
  const [playerTableSearch, setPlayerTableSearch] = useState<string>("");
  const [selectedPositionFilter, setSelectedPositionFilter] = useState<string>("ALL");

  // Roster data
  const rosterData = rosterResponse?.data;
  const team = rosterData?.team;
  const summary = rosterData?.summary;
  const coaches: ITeamRosterCoachItem[] = rosterData?.coaches || [];
  const players: ITeamRosterPlayerItem[] = rosterData?.players || [];

  const coachesList: ICoachListItem[] = coachesData?.data || [];
  const allPlayersList: any[] = playersResponse?.data || [];

  // Filter coaches for assign modal
  const filteredModalCoaches = useMemo(() => {
    return coachesList.filter((c) => {
      const name = c.fullName || (typeof c.userId === "object" ? c.userId?.name : "") || "";
      const email = typeof c.userId === "object" ? c.userId?.email || "" : "";
      const q = coachSearch.toLowerCase();
      return name.toLowerCase().includes(q) || email.toLowerCase().includes(q);
    });
  }, [coachesList, coachSearch]);

  // Filter players for assign modal
  const filteredModalPlayers = useMemo(() => {
    return allPlayersList.filter((p) => {
      const name = p.fullName || p.name || (typeof p.userId === "object" ? p.userId?.name : "") || "";
      const pos = p.primaryPosition || p.position || "";
      const q = playerModalSearch.toLowerCase();
      return name.toLowerCase().includes(q) || pos.toLowerCase().includes(q);
    });
  }, [allPlayersList, playerModalSearch]);

  // Filter squad players in table
  const filteredSquadPlayers = useMemo(() => {
    return players.filter((player) => {
      const matchesSearch = player.name.toLowerCase().includes(playerTableSearch.toLowerCase()) ||
        (player.position && player.position.toLowerCase().includes(playerTableSearch.toLowerCase()));

      if (!matchesSearch) return false;
      if (selectedPositionFilter === "ALL") return true;

      const pos = (player.position || "").toLowerCase();
      if (selectedPositionFilter === "FORWARD") {
        return pos.includes("forward") || pos.includes("st") || pos.includes("cf") || pos.includes("lw") || pos.includes("rw");
      }
      if (selectedPositionFilter === "MIDFIELDER") {
        return pos.includes("midfield") || pos.includes("cam") || pos.includes("cm") || pos.includes("cdm") || pos.includes("lm") || pos.includes("rm");
      }
      if (selectedPositionFilter === "DEFENDER") {
        return pos.includes("defend") || pos.includes("cb") || pos.includes("lb") || pos.includes("rb") || pos.includes("lwb") || pos.includes("rwb");
      }
      if (selectedPositionFilter === "GOALKEEPER") {
        return pos.includes("goal") || pos.includes("gk") || pos.includes("keeper");
      }
      return true;
    });
  }, [players, playerTableSearch, selectedPositionFilter]);

  // Assign Coach Submit
  const onAssignCoachSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCoachId || !team?._id) return;

    try {
      await assignCoach({
        teamId: team._id,
        data: {
          coachId: selectedCoachId,
          role: selectedRole,
        },
      }).unwrap();

      setIsAssignCoachOpen(false);
      setSelectedCoachId("");
      refetch();
    } catch {
      // Toast is handled in academyApi.ts
    }
  };

  // Assign Player Submit
  const onAssignPlayerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlayerId || !team?._id) return;

    try {
      await assignPlayer({
        teamId: team._id,
        data: {
          playerId: selectedPlayerId,
        },
      }).unwrap();

      setIsAssignPlayerOpen(false);
      setSelectedPlayerId("");
      refetch();
    } catch {
      // Toast is handled in academyApi.ts
    }
  };

  const handleConfirmRemoveCoach = async () => {
    if (!coachToRemove || !team?._id) return;
    try {
      await removeCoach({ teamId: team._id, coachId: coachToRemove._id }).unwrap();
      setCoachToRemove(null);
      refetch();
    } catch {
      // Toast is handled in academyApi.ts
    }
  };

  const handleConfirmRemovePlayer = async () => {
    if (!playerToRemove || !team?._id) return;
    try {
      await removePlayer({ teamId: team._id, playerId: playerToRemove._id }).unwrap();
      setPlayerToRemove(null);
      refetch();
    } catch {
      // Toast is handled in academyApi.ts
    }
  };

  // Loading skeleton state
  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 sm:gap-8 pb-12 animate-pulse w-full max-w-full overflow-hidden">
        {/* Top bar skeleton */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="h-9 w-36 bg-white/5 rounded-xl border border-white/10" />
          <div className="h-9 w-28 bg-white/5 rounded-xl border border-white/10" />
        </div>

        {/* Hero Banner skeleton */}
        <div className="h-56 bg-linear-to-r from-white/5 via-white/2 to-white/5 rounded-2xl sm:rounded-3xl border border-white/10 p-6 sm:p-8 flex flex-col justify-between" />

        {/* Metric Cards skeleton */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 sm:h-32 bg-white/5 rounded-2xl sm:rounded-3xl border border-white/10 p-4 sm:p-6" />
          ))}
        </div>

        {/* Coaching staff skeleton */}
        <div className="h-56 sm:h-64 bg-white/5 rounded-2xl sm:rounded-3xl border border-white/10 p-6 sm:p-8" />

        {/* Squad players skeleton */}
        <div className="h-80 sm:h-96 bg-white/5 rounded-2xl sm:rounded-3xl border border-white/10 p-6 sm:p-8" />
      </div>
    );
  }

  // Error state or Team Not Found
  if (isError || !team) {
    return (
      <div className="flex flex-col items-center justify-center py-16 sm:py-20 px-4 sm:px-6 bg-[#111111] rounded-2xl sm:rounded-3xl border border-white/15 text-center max-w-xl mx-auto my-8 sm:my-12 shadow-2xl">
        <div className="size-14 sm:size-16 rounded-2xl bg-[#FF3B30]/10 border border-[#FF3B30]/20 flex items-center justify-center text-[#FF3B30] mb-4 sm:mb-5 shadow-[0_0_20px_rgba(255,59,48,0.2)]">
          <IconAlertCircle className="size-7 sm:size-8" />
        </div>
        <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-white font-orbitron uppercase tracking-tight mb-2">
          Team Details Not Found
        </h2>
        <p className="text-white/60 text-xs sm:text-sm max-w-md mb-6 sm:mb-8">
          We couldn&apos;t load the roster information for team ID: <code className="text-[#00FF85] font-mono text-[11px] sm:text-xs bg-white/5 px-2 py-1 rounded break-all">{teamId}</code>. Please check your connection or return to Teams.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 w-full sm:w-auto">
          <button
            onClick={() => refetch()}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white/10 hover:bg-white/15 border border-white/20 text-xs font-bold uppercase tracking-wider text-white px-5 py-2.5 rounded-xl transition-all cursor-pointer"
          >
            <IconRefresh size={16} />
            <span>Retry</span>
          </button>
          <button
            onClick={() => router.push("/dashboard/academy/analysis/teams")}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#E31B23] hover:bg-[#ff2d35] text-xs font-bold uppercase tracking-wider text-white px-6 py-2.5 rounded-xl transition-all shadow-[0_0_15px_rgba(227,27,35,0.3)] cursor-pointer"
          >
            <IconArrowLeft size={16} />
            <span>Back to Teams</span>
          </button>
        </div>
      </div>
    );
  }

  const isTeamActive = (team.status || "ACTIVE").toUpperCase() === "ACTIVE";
  const coachCapacityPercentage = summary?.maxCoaches ? Math.min(100, Math.round(((summary.coachesCount || 0) / summary.maxCoaches) * 100)) : 0;
  const playerCapacityPercentage = summary?.maxPlayers ? Math.min(100, Math.round(((summary.playersCount || 0) / summary.maxPlayers) * 100)) : 0;
  const canAssignCoach = (summary?.availableCoachSlots ?? 1) > 0;
  const canAssignPlayer = (summary?.availablePlayerSlots ?? 1) > 0;

  return (
    <div className="flex flex-col gap-6 sm:gap-8 pb-16 w-full max-w-full overflow-hidden">
      {/* Top Navigation & Breadcrumbs */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => router.push("/dashboard/academy/analysis/teams")}
            className="flex items-center gap-2 text-white/70 hover:text-white transition-all text-xs font-bold uppercase tracking-wider px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 cursor-pointer shadow-sm shrink-0"
          >
            <IconArrowLeft size={16} />
            <span>Back to Teams</span>
          </button>
          <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-white/40 uppercase tracking-wider min-w-0">
            <span>Teams</span>
            <span>/</span>
            <span className="text-[#00FF85] font-bold truncate max-w-[200px] md:max-w-[320px]">{team.teamName} Roster</span>
          </div>
        </div>

        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="self-end sm:self-auto flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider text-white/70 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl transition-all cursor-pointer disabled:opacity-50"
          title="Refresh roster data"
        >
          <IconRefresh size={15} className={cn(isFetching && "animate-spin text-[#00FF85]")} />
          <span>{isFetching ? "Refreshing..." : "Refresh"}</span>
        </button>
      </div>

      {/* Hero Header Card */}
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-linear-to-br from-[#1A1A1A] via-[#121212] to-[#0A0A0A] border border-white/15 p-5 sm:p-8 lg:p-10 shadow-2xl backdrop-blur-xl">
        {/* Ambient background glow accents */}
        <div className="absolute -top-24 -right-24 size-64 sm:size-80 bg-[#00FF85]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 size-64 sm:size-80 bg-[#E31B23]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 lg:gap-8">
          {/* Left: Academy & Team Profile */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 min-w-0 w-full lg:w-auto">
            {/* Academy Logo */}
            <div className="size-16 sm:size-20 md:size-24 rounded-2xl bg-black/60 border-2 border-white/20 p-2 sm:p-2.5 flex items-center justify-center shrink-0 shadow-[0_0_25px_rgba(0,0,0,0.5)] relative overflow-hidden group">
              {team.academy?.logo ? (
                <Image
                  src={team.academy.logo}
                  alt={team.academy?.name || team.teamName}
                  width={96}
                  height={96}
                  className="size-full object-contain filter drop-shadow-md"
                  unoptimized
                />
              ) : (
                <IconShield className="size-8 sm:size-10 text-[#00FF85]" />
              )}
            </div>

            {/* Team Titles & Meta Badges */}
            <div className="flex flex-col gap-2 min-w-0 w-full sm:w-auto">
              {/* Badges Row */}
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                <span className="px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-widest bg-white/10 text-white/90 border border-white/15">
                  {formatAgeGroup(team.ageGroup)}
                </span>

                <span
                  className={cn(
                    "px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-widest inline-flex items-center gap-1.5 border",
                    isTeamActive
                      ? "bg-[#00FF85]/10 text-[#00FF85] border-[#00FF85]/30 shadow-[0_0_12px_rgba(0,255,133,0.15)]"
                      : "bg-[#FF3B30]/10 text-[#FF3B30] border-[#FF3B30]/30"
                  )}
                >
                  <span
                    className={cn(
                      "size-1.5 rounded-full",
                      isTeamActive ? "bg-[#00FF85] animate-pulse" : "bg-[#FF3B30]"
                    )}
                  />
                  {team.status?.toUpperCase() || (isTeamActive ? "ACTIVE" : "INACTIVE")}
                </span>

                {team.academy?.currentPlan && (
                  <span className="px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-widest bg-amber-400/10 text-amber-300 border border-amber-400/30 flex items-center gap-1 shadow-[0_0_12px_rgba(251,191,36,0.15)]">
                    <IconSparkles size={11} />
                    {team.academy.currentPlan} PLAN
                  </span>
                )}
              </div>

              {/* Team Name Heading */}
              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white font-orbitron uppercase tracking-tight break-words">
                {team.teamName}
              </h1>

              {/* Academy name and location */}
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-white/60">
                <span className="font-semibold text-white/90 truncate max-w-[200px] sm:max-w-none">
                  {team.academy?.name || "Academy Team"}
                </span>
                {(team.academy?.city || team.academy?.country) && (
                  <>
                    <span className="text-white/30 hidden xs:inline">•</span>
                    <span className="flex items-center gap-1 text-white/60 truncate">
                      <IconMapPin size={13} className="text-[#00FF85] shrink-0" />
                      <span>{[team.academy?.city, team.academy?.country].filter(Boolean).join(", ")}</span>
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Right: Quick Action Buttons (Full width on mobile, side-by-side on sm) */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 w-full lg:w-auto shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0 border-white/10">
            <button
              onClick={() => {
                setSelectedCoachId("");
                setSelectedRole("ASSISTANT COACH");
                setCoachSearch("");
                setIsAssignCoachOpen(true);
              }}
              disabled={!canAssignCoach}
              className={cn(
                "w-full sm:w-auto flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-lg",
                canAssignCoach
                  ? "bg-[#00FF85] hover:bg-[#00E577] text-black shadow-[0_0_20px_rgba(0,255,133,0.25)] hover:scale-102"
                  : "bg-white/10 text-white/30 border border-white/10 cursor-not-allowed"
              )}
            >
              <IconPlus size={16} stroke={3} />
              <span>{canAssignCoach ? "Assign Coach" : "Coach Slots Full"}</span>
            </button>

            <button
              onClick={() => {
                setSelectedPlayerId("");
                setPlayerModalSearch("");
                setIsAssignPlayerOpen(true);
              }}
              disabled={!canAssignPlayer}
              className={cn(
                "w-full sm:w-auto flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-lg",
                canAssignPlayer
                  ? "bg-[#E31B23] hover:bg-[#ff2d35] text-white shadow-[0_0_20px_rgba(227,27,35,0.25)] hover:scale-102"
                  : "bg-white/10 text-white/30 border border-white/10 cursor-not-allowed"
              )}
            >
              <IconShirt size={16} />
              <span>{canAssignPlayer ? "Assign Player" : "Player Slots Full"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Roster KPI Summary Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
        {/* Coaches Slot */}
        <div className="bg-[#111111] p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-white/15 hover:border-white/25 transition-all flex flex-col justify-between gap-3 sm:gap-4 group min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[9px] sm:text-[11px] text-white/50 uppercase font-black tracking-wider sm:tracking-widest truncate">
              Coaching Staff
            </span>
            <div className="size-8 sm:size-10 rounded-xl bg-white/5 border border-white/15 flex items-center justify-center text-white/50 group-hover:text-[#00FF85] transition-colors shrink-0">
              <IconTrophy className="size-4 sm:size-5" />
            </div>
          </div>
          <div className="flex flex-col gap-1.5 sm:gap-2 min-w-0">
            <div className="flex items-baseline justify-between gap-1 sm:gap-2">
              <p className="text-lg sm:text-2xl lg:text-3xl font-black text-white font-orbitron leading-none truncate">
                {summary?.coaches || `${coaches.length} / 2`}
              </p>
              <span className="text-[9px] sm:text-[10px] font-bold text-white/40 shrink-0">
                {summary?.availableCoachSlots === 0 ? "Full" : `${summary?.availableCoachSlots ?? 0} left`}
              </span>
            </div>
            {/* Capacity Bar */}
            <div className="w-full h-1 sm:h-1.5 rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full bg-[#00FF85] rounded-full transition-all duration-500"
                style={{ width: `${coachCapacityPercentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* Players Slot */}
        <div className="bg-[#111111] p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-white/15 hover:border-white/25 transition-all flex flex-col justify-between gap-3 sm:gap-4 group min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[9px] sm:text-[11px] text-white/50 uppercase font-black tracking-wider sm:tracking-widest truncate">
              Squad Players
            </span>
            <div className="size-8 sm:size-10 rounded-xl bg-white/5 border border-white/15 flex items-center justify-center text-white/50 group-hover:text-[#E31B23] transition-colors shrink-0">
              <IconShirt className="size-4 sm:size-5" />
            </div>
          </div>
          <div className="flex flex-col gap-1.5 sm:gap-2 min-w-0">
            <div className="flex items-baseline justify-between gap-1 sm:gap-2">
              <p className="text-lg sm:text-2xl lg:text-3xl font-black text-white font-orbitron leading-none truncate">
                {summary?.players || `${players.length} / 18`}
              </p>
              <span className="text-[9px] sm:text-[10px] font-bold text-white/40 shrink-0">
                {summary?.availablePlayerSlots ?? 0} slots left
              </span>
            </div>
            {/* Capacity Bar */}
            <div className="w-full h-1 sm:h-1.5 rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full bg-[#E31B23] rounded-full transition-all duration-500"
                style={{ width: `${playerCapacityPercentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* Total Roster Members */}
        <div className="bg-[#111111] p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-white/15 hover:border-white/25 transition-all flex flex-col justify-between gap-3 sm:gap-4 group min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[9px] sm:text-[11px] text-white/50 uppercase font-black tracking-wider sm:tracking-widest truncate">
              Total Roster
            </span>
            <div className="size-8 sm:size-10 rounded-xl bg-white/5 border border-white/15 flex items-center justify-center text-white/50 group-hover:text-white transition-colors shrink-0">
              <IconBallFootball className="size-4 sm:size-5" />
            </div>
          </div>
          <div className="flex flex-col gap-1 min-w-0">
            <p className="text-lg sm:text-2xl lg:text-3xl font-black text-white font-orbitron leading-none truncate">
              {summary?.totalTeamRoster ?? coaches.length + players.length}
            </p>
            <span className="text-[9px] sm:text-[10px] font-bold text-white/40 uppercase tracking-wider truncate">
              Active Personnel
            </span>
          </div>
        </div>

        {/* Academy Plan & Level */}
        <div className="bg-[#111111] p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-white/15 hover:border-white/25 transition-all flex flex-col justify-between gap-3 sm:gap-4 group min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[9px] sm:text-[11px] text-white/50 uppercase font-black tracking-wider sm:tracking-widest truncate">
              Plan Level
            </span>
            <div className="size-8 sm:size-10 rounded-xl bg-white/5 border border-white/15 flex items-center justify-center text-white/50 group-hover:text-amber-400 transition-colors shrink-0">
              <IconUserCheck className="size-4 sm:size-5" />
            </div>
          </div>
          <div className="flex flex-col gap-1 min-w-0">
            <p className="text-lg sm:text-2xl lg:text-3xl font-black text-amber-400 font-orbitron leading-none truncate">
              {team.academy?.currentPlan || "PREMIUM"}
            </p>
            <span className="text-[9px] sm:text-[10px] font-bold text-white/40 uppercase tracking-wider truncate">
              {team.academy?.name || "Academy Tier"}
            </span>
          </div>
        </div>
      </div>

      {/* Coaches Section */}
      <div className="bg-[#111111] rounded-2xl sm:rounded-3xl border border-white/15 p-5 sm:p-8 flex flex-col gap-5 sm:gap-6 shadow-xl">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 pb-4 border-b border-white/10">
          <div>
            <h2 className="text-lg sm:text-2xl font-black text-white font-orbitron uppercase tracking-tight flex items-center gap-2 sm:gap-2.5">
              <IconTrophy className="text-[#00FF85] size-5 sm:size-6 shrink-0" />
              <span>Coaching Staff</span>
            </h2>
            <p className="text-white/50 text-[11px] sm:text-xs font-semibold uppercase tracking-wider mt-1">
              {coaches.length} of {summary?.maxCoaches || 2} Coaches Assigned • {summary?.availableCoachSlots ?? 0} Slot(s) Available
            </p>
          </div>

          {canAssignCoach && (
            <button
              onClick={() => {
                setSelectedCoachId("");
                setSelectedRole("ASSISTANT COACH");
                setCoachSearch("");
                setIsAssignCoachOpen(true);
              }}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white/5 hover:bg-[#00FF85]/10 border border-white/15 hover:border-[#00FF85]/30 text-white hover:text-[#00FF85] text-xs font-bold uppercase tracking-wider px-4 py-2.5 rounded-xl transition-all cursor-pointer"
            >
              <IconPlus size={15} />
              <span>Assign Coach</span>
            </button>
          )}
        </div>

        {/* Coaches Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
          {coaches.map((coach) => (
            <div
              key={coach._id}
              className="p-4 sm:p-5 rounded-2xl bg-white/2 hover:bg-white/4 border border-white/10 hover:border-white/20 transition-all flex items-center justify-between gap-3 sm:gap-4 group"
            >
              <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                {/* Coach Avatar */}
                <div className="size-12 sm:size-14 rounded-2xl bg-white/5 border border-white/15 overflow-hidden flex items-center justify-center shrink-0 relative shadow-inner">
                  {coach.profileImage ? (
                    <Image
                      src={coach.profileImage}
                      alt={coach.name}
                      width={56}
                      height={56}
                      className="size-full object-cover"
                      unoptimized
                    />
                  ) : (
                    <IconUsers className="size-5 sm:size-6 text-white/40" />
                  )}
                </div>

                {/* Coach Meta */}
                <div className="flex flex-col min-w-0">
                  <span className="text-sm sm:text-base font-bold text-white truncate">
                    {coach.name}
                  </span>

                  <span className="text-[11px] sm:text-xs font-bold text-[#00FF85] uppercase tracking-wider mt-0.5 truncate">
                    {coach.role || "Coach"}
                  </span>

                  <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mt-1.5 sm:mt-2">
                    <span
                      className={cn(
                        "px-2 sm:px-2.5 py-0.5 rounded-full text-[8px] sm:text-[9px] font-black uppercase tracking-widest border",
                        getCvTierBadge(coach.cvType)
                      )}
                    >
                      {coach.cvType || "BRONZE"} TIER
                    </span>
                    <span className="px-2 sm:px-2.5 py-0.5 rounded-full text-[8px] sm:text-[9px] font-black uppercase tracking-widest bg-[#00FF85]/10 text-[#00FF85] border border-[#00FF85]/20">
                      {coach.status || "ACTIVE"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Status Indicator & Remove Action */}
              <div className="shrink-0 flex items-center gap-2.5">
                <span className="size-2 rounded-full bg-[#00FF85] shadow-[0_0_8px_#00FF85]" />
                <button
                  type="button"
                  onClick={() => setCoachToRemove(coach)}
                  className="p-1.5 rounded-lg bg-destructive/10 hover:bg-destructive/20 border border-destructive/20 text-destructive hover:text-destructive transition-all cursor-pointer hover:scale-105"
                  title="Remove coach from team"
                >
                  <IconTrash size={14} />
                </button>
              </div>
            </div>
          ))}

          {/* Empty Coach Slots if capacity allows */}
          {Array.from({ length: summary?.availableCoachSlots ?? Math.max(0, 2 - coaches.length) }).map((_, index) => (
            <div
              key={`empty-coach-slot-${index}`}
              onClick={() => {
                setSelectedCoachId("");
                setSelectedRole(coaches.length === 0 ? "HEAD COACH" : "ASSISTANT COACH");
                setCoachSearch("");
                setIsAssignCoachOpen(true);
              }}
              className="p-4 sm:p-5 rounded-2xl border-2 border-dashed border-white/10 hover:border-[#00FF85]/40 bg-white/[0.01] hover:bg-[#00FF85]/5 transition-all flex items-center justify-between gap-3 sm:gap-4 cursor-pointer group"
            >
              <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                <div className="size-12 sm:size-14 rounded-2xl border border-dashed border-white/20 group-hover:border-[#00FF85]/50 flex items-center justify-center text-white/30 group-hover:text-[#00FF85] transition-colors shrink-0">
                  <IconPlus size={20} />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs sm:text-sm font-bold text-white/60 group-hover:text-white transition-colors truncate">
                    Empty Coach Slot
                  </span>
                  <span className="text-[10px] sm:text-xs text-white/30 uppercase tracking-wider truncate">
                    Click to assign a coach
                  </span>
                </div>
              </div>

              <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-white/40 group-hover:text-[#00FF85] transition-colors border border-white/10 group-hover:border-[#00FF85]/30 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl shrink-0">
                + Assign
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Squad Players Section */}
      <div className="bg-[#111111] rounded-2xl sm:rounded-3xl border border-white/15 p-5 sm:p-8 flex flex-col gap-5 sm:gap-6 shadow-xl">
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-white/10">
          <div>
            <h2 className="text-lg sm:text-2xl font-black text-white font-orbitron uppercase tracking-tight flex items-center gap-2 sm:gap-2.5">
              <IconShirt className="text-[#E31B23] size-5 sm:size-6 shrink-0" />
              <span>Squad Players</span>
            </h2>
            <p className="text-white/50 text-[11px] sm:text-xs font-semibold uppercase tracking-wider mt-1">
              {players.length} of {summary?.maxPlayers || 18} Players Registered • {summary?.availablePlayerSlots ?? 0} Slot(s) Open
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 w-full lg:w-auto">
            {/* Search Input */}
            <div className="relative w-full sm:w-60 lg:w-64">
              <IconSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-white/40" />
              <input
                type="text"
                value={playerTableSearch}
                onChange={(e) => setPlayerTableSearch(e.target.value)}
                placeholder="Search squad players..."
                className="w-full h-10 bg-white/5 border border-white/15 rounded-xl pl-10 pr-4 text-xs font-medium text-white placeholder:text-white/30 focus:outline-none focus:border-[#E31B23]/50 transition-all"
              />
            </div>

            {canAssignPlayer && (
              <button
                onClick={() => {
                  setSelectedPlayerId("");
                  setPlayerModalSearch("");
                  setIsAssignPlayerOpen(true);
                }}
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#E31B23] hover:bg-[#ff2d35] text-white text-xs font-bold uppercase tracking-wider px-4 py-2.5 rounded-xl transition-all cursor-pointer shadow-[0_0_15px_rgba(227,27,35,0.25)] shrink-0"
              >
                <IconPlus size={15} />
                <span>Assign Player</span>
              </button>
            )}
          </div>
        </div>

        {/* Position Filter Pills (Horizontally scrollable on mobile) */}
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1.5 sm:pb-0 scrollbar-none max-w-full">
          {["ALL", "FORWARD", "MIDFIELDER", "DEFENDER", "GOALKEEPER"].map((pos) => {
            const isActive = selectedPositionFilter === pos;
            return (
              <button
                key={pos}
                onClick={() => setSelectedPositionFilter(pos)}
                className={cn(
                  "shrink-0 px-3 sm:px-3.5 py-1.5 rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer border",
                  isActive
                    ? "bg-white text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.2)]"
                    : "bg-white/3 hover:bg-white/8 text-white/60 hover:text-white border-white/10"
                )}
              >
                {pos}
              </button>
            );
          })}
        </div>

        {/* MOBILE SQUAD CARDS VIEW (Under 768px) */}
        <div className="flex flex-col gap-3 md:hidden">
          {filteredSquadPlayers.length === 0 ? (
            <div className="py-10 text-center flex flex-col items-center justify-center gap-3 border border-white/10 rounded-2xl bg-white/2">
              <div className="size-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/30">
                <IconShirt size={18} />
              </div>
              <p className="text-xs font-bold text-white/60">
                {playerTableSearch
                  ? `No squad players found matching "${playerTableSearch}"`
                  : "No players assigned to this roster yet"}
              </p>
            </div>
          ) : (
            filteredSquadPlayers.map((player) => (
              <div
                key={player._id}
                className="p-4 rounded-2xl bg-white/2 border border-white/10 flex flex-col gap-3.5"
              >
                {/* Header: Player Photo, Name, Position */}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="size-11 rounded-xl bg-white/5 border border-white/10 overflow-hidden flex items-center justify-center shrink-0">
                      {player.profileImage ? (
                        <Image
                          src={player.profileImage}
                          alt={player.name}
                          width={44}
                          height={44}
                          className="size-full object-cover"
                          unoptimized
                        />
                      ) : (
                        <IconUsers className="size-5 text-white/40" />
                      )}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-sm font-bold text-white truncate">
                        {player.name}
                      </span>
                      <span className="text-[10px] text-white/40 uppercase tracking-wider">
                        ID: {player._id.slice(-6)}
                      </span>
                    </div>
                  </div>

                  <span
                    className={cn(
                      "px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border shrink-0",
                      getPositionBadge(player.position)
                    )}
                  >
                    {player.position || "Player"}
                  </span>
                </div>

                {/* Stats Matrix Grid */}
                <div className="grid grid-cols-4 gap-2 p-2.5 rounded-xl bg-white/3 border border-white/5 text-center">
                  <div className="flex flex-col">
                    <span className="text-[9px] text-white/40 uppercase font-bold">Rating</span>
                    <span className="inline-flex items-center justify-center gap-0.5 text-xs font-black text-amber-400 font-orbitron mt-0.5">
                      <IconStarFilled size={11} />
                      {player.rating ?? 0}
                    </span>
                  </div>
                  <div className="flex flex-col border-l border-white/5">
                    <span className="text-[9px] text-white/40 uppercase font-bold">Matches</span>
                    <span className="text-xs font-black text-white font-orbitron mt-0.5">
                      {player.matches ?? 0}
                    </span>
                  </div>
                  <div className="flex flex-col border-l border-white/5">
                    <span className="text-[9px] text-white/40 uppercase font-bold">Goals</span>
                    <span className="text-xs font-black text-white font-orbitron mt-0.5">
                      {player.goals ?? 0}
                    </span>
                  </div>
                  <div className="flex flex-col border-l border-white/5">
                    <span className="text-[9px] text-white/40 uppercase font-bold">Assists</span>
                    <span className="text-xs font-black text-white font-orbitron mt-0.5">
                      {player.assists ?? 0}
                    </span>
                  </div>
                </div>

                {/* Footer: CV Tier, Status & Remove Action */}
                <div className="flex items-center justify-between gap-2 pt-2 border-t border-white/5">
                  <span
                    className={cn(
                      "px-2.5 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest border",
                      getCvTierBadge(player.cvType)
                    )}
                  >
                    {player.cvType || "BRONZE"} TIER
                  </span>

                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "px-2.5 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest border",
                        (player.status || "ACTIVE").toUpperCase() === "ACTIVE"
                          ? "bg-[#00FF85]/10 text-[#00FF85] border-[#00FF85]/20"
                          : "bg-[#FF3B30]/10 text-[#FF3B30] border-[#FF3B30]/20"
                      )}
                    >
                      {player.status || "ACTIVE"}
                    </span>
                    <button
                      type="button"
                      onClick={() => setPlayerToRemove(player)}
                      className="p-1.5 rounded-lg bg-destructive/10 hover:bg-destructive/20 border border-destructive/20 text-destructive hover:text-destructive transition-all cursor-pointer"
                      title="Remove player from team"
                    >
                      <IconTrash size={13} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* DESKTOP & TABLET SQUAD PLAYERS TABLE (md: and up) */}
        <div className="hidden md:block w-full overflow-x-auto rounded-2xl border border-white/15">
          <table className="w-full text-left border-collapse min-w-[680px]">
            <thead>
              <tr className="border-b border-white/15 bg-white/2">
                <th className="py-4 px-5 text-[11px] font-black uppercase tracking-widest text-white/40 border-r border-white/15">
                  Player
                </th>
                <th className="py-4 px-4 text-[11px] font-black uppercase tracking-widest text-white/40 border-r border-white/15 text-center">
                  Position
                </th>
                <th className="py-4 px-4 text-[11px] font-black uppercase tracking-widest text-white/40 border-r border-white/15 text-center">
                  Rating
                </th>
                <th className="py-4 px-4 text-[11px] font-black uppercase tracking-widest text-white/40 border-r border-white/15 text-center">
                  Matches
                </th>
                <th className="py-4 px-4 text-[11px] font-black uppercase tracking-widest text-white/40 border-r border-white/15 text-center">
                  Goals
                </th>
                <th className="py-4 px-4 text-[11px] font-black uppercase tracking-widest text-white/40 border-r border-white/15 text-center">
                  Assists
                </th>
                <th className="py-4 px-4 text-[11px] font-black uppercase tracking-widest text-white/40 border-r border-white/15 text-center">
                  CV Tier
                </th>
                <th className="py-4 px-4 text-[11px] font-black uppercase tracking-widest text-white/40 border-r border-white/15 text-center">
                  Status
                </th>
                <th className="py-4 px-4 text-[11px] font-black uppercase tracking-widest text-white/40 text-center">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredSquadPlayers.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="size-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/30">
                        <IconShirt size={22} />
                      </div>
                      <p className="text-sm font-bold text-white/60">
                        {playerTableSearch
                          ? `No squad players found matching "${playerTableSearch}"`
                          : "No players assigned to this team roster yet"}
                      </p>
                      {canAssignPlayer && !playerTableSearch && (
                        <button
                          onClick={() => {
                            setSelectedPlayerId("");
                            setPlayerModalSearch("");
                            setIsAssignPlayerOpen(true);
                          }}
                          className="mt-2 text-xs font-bold uppercase tracking-wider text-[#00FF85] hover:underline cursor-pointer flex items-center gap-1.5"
                        >
                          <IconPlus size={14} />
                          Assign the first player
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredSquadPlayers.map((player) => (
                  <tr
                    key={player._id}
                    className="border-b border-white/10 last:border-b-0 hover:bg-white/2 transition-colors group"
                  >
                    {/* Player Info */}
                    <td className="py-4 px-5 border-r border-white/15">
                      <div className="flex items-center gap-3">
                        <div className="size-10 rounded-xl bg-white/5 border border-white/10 overflow-hidden flex items-center justify-center shrink-0">
                          {player.profileImage ? (
                            <Image
                              src={player.profileImage}
                              alt={player.name}
                              width={40}
                              height={40}
                              className="size-full object-cover"
                              unoptimized
                            />
                          ) : (
                            <IconUsers className="size-5 text-white/40" />
                          )}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-sm font-bold text-white truncate max-w-[150px] lg:max-w-none">
                            {player.name}
                          </span>
                          <span className="text-[10px] font-semibold text-white/40 uppercase tracking-wider">
                            ID: {player._id.slice(-6)}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Position */}
                    <td className="py-4 px-4 border-r border-white/15 text-center">
                      <span
                        className={cn(
                          "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border whitespace-nowrap",
                          getPositionBadge(player.position)
                        )}
                      >
                        {player.position || "Player"}
                      </span>
                    </td>

                    {/* Rating */}
                    <td className="py-4 px-4 border-r border-white/15 text-center">
                      <span className="inline-flex items-center gap-1 text-sm font-black text-amber-400 font-orbitron">
                        <IconStarFilled size={12} className="text-amber-400" />
                        {player.rating ?? 0}
                      </span>
                    </td>

                    {/* Matches */}
                    <td className="py-4 px-4 border-r border-white/15 text-center text-sm font-black text-white font-orbitron">
                      {player.matches ?? 0}
                    </td>

                    {/* Goals */}
                    <td className="py-4 px-4 border-r border-white/15 text-center text-sm font-black text-white font-orbitron">
                      {player.goals ?? 0}
                    </td>

                    {/* Assists */}
                    <td className="py-4 px-4 border-r border-white/15 text-center text-sm font-black text-white font-orbitron">
                      {player.assists ?? 0}
                    </td>

                    {/* CV Tier */}
                    <td className="py-4 px-4 border-r border-white/15 text-center">
                      <span
                        className={cn(
                          "px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border whitespace-nowrap",
                          getCvTierBadge(player.cvType)
                        )}
                      >
                        {player.cvType || "BRONZE"}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-4 px-4 border-r border-white/15 text-center">
                      <span
                        className={cn(
                          "px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border whitespace-nowrap",
                          (player.status || "ACTIVE").toUpperCase() === "ACTIVE"
                            ? "bg-[#00FF85]/10 text-[#00FF85] border-[#00FF85]/20 shadow-[0_0_10px_rgba(0,255,133,0.1)]"
                            : "bg-[#FF3B30]/10 text-[#FF3B30] border-[#FF3B30]/20"
                        )}
                      >
                        {player.status || "ACTIVE"}
                      </span>
                    </td>

                    {/* Action */}
                    <td className="py-4 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => setPlayerToRemove(player)}
                        className="size-8 rounded-lg bg-destructive/10 hover:bg-destructive/20 border border-destructive/20 text-destructive hover:text-destructive inline-flex items-center justify-center transition-all cursor-pointer hover:scale-105"
                        title="Remove player from team"
                      >
                        <IconTrash size={14} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Assign Coach Modal */}
      <Dialog open={isAssignCoachOpen} onOpenChange={setIsAssignCoachOpen}>
        <DialogContent className="bg-[#111111] border border-white/15 text-white rounded-2xl sm:rounded-3xl max-w-lg w-[92vw] sm:w-full p-5 sm:p-8 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl sm:text-2xl font-black uppercase text-white font-orbitron tracking-tight flex items-center gap-2.5 sm:gap-3">
              <IconTrophy className="text-[#00FF85] size-5 sm:size-6 shrink-0" />
              <span className="truncate">Assign Coach to {team.teamName}</span>
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={onAssignCoachSubmit} className="flex flex-col gap-4 sm:gap-5 mt-2">
            {/* Search Input */}
            <div className="relative">
              <IconSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-white/40" />
              <input
                type="text"
                value={coachSearch}
                onChange={(e) => setCoachSearch(e.target.value)}
                placeholder="Search coaches by name or email..."
                className="w-full h-11 bg-white/2 border border-white/10 rounded-xl pl-10 pr-4 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#00FF85]/50 transition-all"
              />
            </div>

            {/* Coach Selection List */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-white/60 uppercase tracking-widest">
                Select Coach {coachesList.length > 0 ? `(${coachesList.length} Available)` : ""}
              </label>

              {isLoadingCoaches ? (
                <div className="py-8 flex flex-col items-center justify-center gap-2 text-white/40">
                  <IconLoader2 className="animate-spin size-6" />
                  <span className="text-xs">Loading coaches...</span>
                </div>
              ) : filteredModalCoaches.length === 0 ? (
                <div className="py-8 text-center text-white/40 text-xs border border-white/5 rounded-xl bg-white/2">
                  No coaches found matching &quot;{coachSearch}&quot;
                </div>
              ) : (
                <div className="max-h-48 sm:max-h-56 overflow-y-auto pr-1 flex flex-col gap-2">
                  {filteredModalCoaches.map((c) => {
                    const isSelected = selectedCoachId === c._id;
                    const coachName = c.fullName || (typeof c.userId === "object" ? c.userId?.name : "") || "Coach";
                    const avatarUrl = c.profileImage || (typeof c.userId === "object" ? c.userId?.avatar : "");
                    const isAlreadyInTeam = coaches.some((existing) => existing._id === c._id);

                    return (
                      <div
                        key={c._id}
                        onClick={() => {
                          if (!isAlreadyInTeam) {
                            setSelectedCoachId(c._id);
                          }
                        }}
                        className={cn(
                          "p-3 rounded-xl border transition-all flex items-center justify-between gap-3",
                          isAlreadyInTeam
                            ? "opacity-50 border-white/5 bg-white/2 cursor-not-allowed"
                            : isSelected
                            ? "border-[#00FF85] bg-[#00FF85]/10 shadow-[0_0_15px_rgba(0,255,133,0.1)] cursor-pointer"
                            : "border-white/10 bg-white/2 hover:border-white/20 hover:bg-white/5 cursor-pointer"
                        )}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="size-10 rounded-full bg-white/10 border border-white/10 overflow-hidden flex items-center justify-center shrink-0">
                            {avatarUrl ? (
                              <Image
                                src={avatarUrl}
                                alt={coachName}
                                width={40}
                                height={40}
                                className="size-full object-cover"
                                unoptimized
                              />
                            ) : (
                              <IconUsers className="size-5 text-white/40" />
                            )}
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="text-sm font-bold text-white truncate">
                              {coachName}
                            </span>
                            <span className="text-[11px] text-white/50 truncate">
                              {c.title || "Coach"} {c.cvTier ? `• ${c.cvTier} Tier` : ""}
                            </span>
                          </div>
                        </div>

                        <div className="shrink-0">
                          {isAlreadyInTeam ? (
                            <span className="text-[9px] font-bold uppercase tracking-wider text-amber-400 bg-amber-400/10 px-2 py-1 rounded-md border border-amber-400/20">
                              In Roster
                            </span>
                          ) : isSelected ? (
                            <div className="size-6 rounded-full bg-[#00FF85] text-black flex items-center justify-center">
                              <IconCheck size={14} stroke={3} />
                            </div>
                          ) : (
                            <div className="size-6 rounded-full border border-white/20" />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Role Selection */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-white/60 uppercase tracking-widest">
                Coaching Role
              </label>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="w-full h-11 bg-white/2 border border-white/10 rounded-xl px-4 text-sm text-white focus:outline-none focus:border-[#00FF85]/50 transition-all cursor-pointer"
              >
                <option value="HEAD COACH" className="bg-[#161616] text-white">HEAD COACH</option>
                <option value="ASSISTANT COACH" className="bg-[#161616] text-white">ASSISTANT COACH</option>
                <option value="FITNESS COACH" className="bg-[#161616] text-white">FITNESS COACH</option>
                <option value="GOALKEEPER COACH" className="bg-[#161616] text-white">GOALKEEPER COACH</option>
              </select>
            </div>

            {/* Buttons */}
            <div className="flex flex-col-reverse sm:flex-row justify-end gap-2.5 sm:gap-3 mt-3 pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={() => setIsAssignCoachOpen(false)}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white text-xs font-bold uppercase tracking-wider transition-all cursor-pointer text-center"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!selectedCoachId || isAssigningCoach}
                className={cn(
                  "w-full sm:w-auto px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2",
                  selectedCoachId && !isAssigningCoach
                    ? "bg-[#00FF85] hover:bg-[#00E577] text-black shadow-[0_0_15px_rgba(0,255,133,0.3)] cursor-pointer"
                    : "bg-white/10 text-white/30 cursor-not-allowed"
                )}
              >
                {isAssigningCoach ? (
                  <>
                    <IconLoader2 className="animate-spin size-4" />
                    <span>Assigning...</span>
                  </>
                ) : (
                  <span>Assign Coach</span>
                )}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Assign Player Modal */}
      <Dialog open={isAssignPlayerOpen} onOpenChange={setIsAssignPlayerOpen}>
        <DialogContent className="bg-[#111111] border border-white/15 text-white rounded-2xl sm:rounded-3xl max-w-lg w-[92vw] sm:w-full p-5 sm:p-8 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl sm:text-2xl font-black uppercase text-white font-orbitron tracking-tight flex items-center gap-2.5 sm:gap-3">
              <IconShirt className="text-[#E31B23] size-5 sm:size-6 shrink-0" />
              <span className="truncate">Assign Player to {team.teamName}</span>
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={onAssignPlayerSubmit} className="flex flex-col gap-4 sm:gap-5 mt-2">
            {/* Search Input */}
            <div className="relative">
              <IconSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-white/40" />
              <input
                type="text"
                value={playerModalSearch}
                onChange={(e) => setPlayerModalSearch(e.target.value)}
                placeholder="Search players by name or position..."
                className="w-full h-11 bg-white/2 border border-white/10 rounded-xl pl-10 pr-4 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#E31B23]/50 transition-all"
              />
            </div>

            {/* Player Selection List */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-white/60 uppercase tracking-widest">
                Select Player {allPlayersList.length > 0 ? `(${allPlayersList.length} Available)` : ""}
              </label>

              {isLoadingPlayers ? (
                <div className="py-8 flex flex-col items-center justify-center gap-2 text-white/40">
                  <IconLoader2 className="animate-spin size-6" />
                  <span className="text-xs">Loading players...</span>
                </div>
              ) : filteredModalPlayers.length === 0 ? (
                <div className="py-8 text-center text-white/40 text-xs border border-white/5 rounded-xl bg-white/2">
                  No players found matching &quot;{playerModalSearch}&quot;
                </div>
              ) : (
                <div className="max-h-48 sm:max-h-56 overflow-y-auto pr-1 flex flex-col gap-2">
                  {filteredModalPlayers.map((p) => {
                    const isSelected = selectedPlayerId === p._id;
                    const playerName = p.fullName || p.name || (typeof p.userId === "object" ? p.userId?.name : "") || "Player";
                    const avatarUrl = p.profileImage || (typeof p.userId === "object" ? p.userId?.avatar : "");
                    const isAlreadyInTeam = players.some((existing) => existing._id === p._id);

                    return (
                      <div
                        key={p._id}
                        onClick={() => {
                          if (!isAlreadyInTeam) {
                            setSelectedPlayerId(p._id);
                          }
                        }}
                        className={cn(
                          "p-3 rounded-xl border transition-all flex items-center justify-between gap-3",
                          isAlreadyInTeam
                            ? "opacity-50 border-white/5 bg-white/2 cursor-not-allowed"
                            : isSelected
                            ? "border-[#E31B23] bg-[#E31B23]/10 shadow-[0_0_15px_rgba(227,27,35,0.15)] cursor-pointer"
                            : "border-white/10 bg-white/2 hover:border-white/20 hover:bg-white/5 cursor-pointer"
                        )}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="size-10 rounded-full bg-white/10 border border-white/10 overflow-hidden flex items-center justify-center shrink-0">
                            {avatarUrl ? (
                              <Image
                                src={avatarUrl}
                                alt={playerName}
                                width={40}
                                height={40}
                                className="size-full object-cover"
                                unoptimized
                              />
                            ) : (
                              <IconUsers className="size-5 text-white/40" />
                            )}
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="text-sm font-bold text-white truncate">
                              {playerName}
                            </span>
                            <span className="text-[11px] text-white/50 truncate">
                              {p.primaryPosition || p.position || "Player"} {p.age ? `• ${p.age} y/o` : ""}
                            </span>
                          </div>
                        </div>

                        <div className="shrink-0">
                          {isAlreadyInTeam ? (
                            <span className="text-[9px] font-bold uppercase tracking-wider text-amber-400 bg-amber-400/10 px-2 py-1 rounded-md border border-amber-400/20">
                              In Squad
                            </span>
                          ) : isSelected ? (
                            <div className="size-6 rounded-full bg-[#E31B23] text-white flex items-center justify-center">
                              <IconCheck size={14} stroke={3} />
                            </div>
                          ) : (
                            <div className="size-6 rounded-full border border-white/20" />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Buttons */}
            <div className="flex flex-col-reverse sm:flex-row justify-end gap-2.5 sm:gap-3 mt-3 pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={() => setIsAssignPlayerOpen(false)}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white text-xs font-bold uppercase tracking-wider transition-all cursor-pointer text-center"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!selectedPlayerId || isAssigningPlayer}
                className={cn(
                  "w-full sm:w-auto px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2",
                  selectedPlayerId && !isAssigningPlayer
                    ? "bg-[#E31B23] hover:bg-[#ff2d35] text-white shadow-[0_0_15px_rgba(227,27,35,0.3)] cursor-pointer"
                    : "bg-white/10 text-white/30 cursor-not-allowed"
                )}
              >
                {isAssigningPlayer ? (
                  <>
                    <IconLoader2 className="animate-spin size-4" />
                    <span>Assigning...</span>
                  </>
                ) : (
                  <span>Assign Player</span>
                )}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      {/* Remove Coach Confirmation Dialog */}
      <Dialog open={Boolean(coachToRemove)} onOpenChange={(open) => !open && setCoachToRemove(null)}>
        <DialogContent className="bg-[#111111] border border-white/10 text-white rounded-3xl max-w-md p-6 sm:p-8">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-full bg-destructive/10 border border-destructive/20 flex items-center justify-center text-destructive shrink-0">
                <IconTrash size={20} />
              </div>
              <div>
                <DialogTitle className="text-xl font-black uppercase text-white font-orbitron tracking-tight">
                  Remove Coach
                </DialogTitle>
                <p className="text-xs text-white/40 font-bold uppercase tracking-widest mt-0.5">
                  Remove from team roster
                </p>
              </div>
            </div>
          </DialogHeader>

          <p className="text-sm text-white/70 mt-2">
            Are you sure you want to remove{" "}
            <span className="font-bold text-white uppercase">{coachToRemove?.name}</span> from {team.teamName}?
          </p>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/5 mt-4">
            <button
              type="button"
              onClick={() => setCoachToRemove(null)}
              disabled={isRemovingCoach}
              className="px-5 py-2.5 rounded-xl border border-white/10 text-white/70 hover:text-white bg-white/5 text-xs font-bold uppercase tracking-wider cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmRemoveCoach}
              disabled={isRemovingCoach}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-destructive hover:bg-destructive/90 text-white text-xs font-bold uppercase tracking-wider cursor-pointer disabled:opacity-50"
            >
              {isRemovingCoach ? (
                <span className="flex items-center gap-2">
                  <IconLoader2 size={14} className="animate-spin" /> Removing...
                </span>
              ) : (
                <span className="flex items-center gap-1.5">
                  <IconTrash size={14} /> Remove Coach
                </span>
              )}
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Remove Player Confirmation Dialog */}
      <Dialog open={Boolean(playerToRemove)} onOpenChange={(open) => !open && setPlayerToRemove(null)}>
        <DialogContent className="bg-[#111111] border border-white/10 text-white rounded-3xl max-w-md p-6 sm:p-8">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-full bg-destructive/10 border border-destructive/20 flex items-center justify-center text-destructive shrink-0">
                <IconTrash size={20} />
              </div>
              <div>
                <DialogTitle className="text-xl font-black uppercase text-white font-orbitron tracking-tight">
                  Remove Player
                </DialogTitle>
                <p className="text-xs text-white/40 font-bold uppercase tracking-widest mt-0.5">
                  Remove from team roster
                </p>
              </div>
            </div>
          </DialogHeader>

          <p className="text-sm text-white/70 mt-2">
            Are you sure you want to remove{" "}
            <span className="font-bold text-white uppercase">{playerToRemove?.name}</span> from {team.teamName}?
          </p>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/5 mt-4">
            <button
              type="button"
              onClick={() => setPlayerToRemove(null)}
              disabled={isRemovingPlayer}
              className="px-5 py-2.5 rounded-xl border border-white/10 text-white/70 hover:text-white bg-white/5 text-xs font-bold uppercase tracking-wider cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmRemovePlayer}
              disabled={isRemovingPlayer}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-destructive hover:bg-destructive/90 text-white text-xs font-bold uppercase tracking-wider cursor-pointer disabled:opacity-50"
            >
              {isRemovingPlayer ? (
                <span className="flex items-center gap-2">
                  <IconLoader2 size={14} className="animate-spin" /> Removing...
                </span>
              ) : (
                <span className="flex items-center gap-1.5">
                  <IconTrash size={14} /> Remove Player
                </span>
              )}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TeamDetails;
