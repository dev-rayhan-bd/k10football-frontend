/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  IconSearch,
  IconFilter,
  IconChevronDown,
  IconEye,
  IconDownload,
  IconBell,
  IconLoader2,
  IconChevronLeft,
  IconChevronRight,
} from "@tabler/icons-react";

import { useAppSelector } from "@/hooks/reduxHooks";
import {
  useGetAcademyValidateCvQuery,
  useNotifyCoachToValidateCvMutation,
} from "@/redux/features/academy/academyApi";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// ─── Style Definitions ───────────────────────────────────────────────────────
type CvTier = "Gold" | "Silver" | "Bronze";

function getCvTier(rating: number): CvTier {
  if (rating >= 80) return "Gold";
  if (rating >= 60) return "Silver";
  return "Bronze";
}

const TIER_STYLES: Record<string, { label: string; color: string; border: string; bg: string; glow: string }> = {
  gold: { label: "GOLD", color: "text-[#FBBF24]", border: "border-[#FBBF24]/40", bg: "bg-[#FBBF24]/10", glow: "shadow-[0_0_16px_rgba(251,191,36,0.25)]" },
  silver: { label: "SILVER", color: "text-[#CBD5E1]", border: "border-[#CBD5E1]/40", bg: "bg-[#CBD5E1]/10", glow: "shadow-[0_0_16px_rgba(203,213,225,0.15)]" },
  bronze: { label: "BRONZE", color: "text-[#F97316]", border: "border-[#F97316]/40", bg: "bg-[#F97316]/10", glow: "shadow-[0_0_16px_rgba(249,115,22,0.15)]" },
};

function getPlayerType(position: string): string {
  const p = position.toLowerCase();
  if (p.includes("goalkeeper") || p === "gk") return "Goalkeeper";
  if (p.includes("defender") || p.includes("back") || p.includes("cb") || p.includes("lb") || p.includes("rb")) return "Defender";
  if (p.includes("midfielder") || p.includes("mid") || p.includes("cm") || p.includes("dm") || p.includes("am")) return "Midfielder";
  if (p.includes("forward") || p.includes("striker") || p.includes("winger") || p.includes("cf") || p.includes("lw") || p.includes("rw")) return "Forward";
  return "Field Player";
}

const VALIDATION_STYLES: Record<string, { label: string; color: string; border: string; bg: string }> = {
  green: { label: "VERIFIED", color: "text-[#4ADE80]", border: "border-[#4ADE80]/30", bg: "bg-[#4ADE80]/10" },
  verified: { label: "VERIFIED", color: "text-[#4ADE80]", border: "border-[#4ADE80]/30", bg: "bg-[#4ADE80]/10" },
  yellow: { label: "PENDING", color: "text-[#FBBF24]", border: "border-[#FBBF24]/30", bg: "bg-[#FBBF24]/10" },
  pending: { label: "PENDING", color: "text-[#FBBF24]", border: "border-[#FBBF24]/30", bg: "bg-[#FBBF24]/10" },
  red: { label: "REJECTED", color: "text-[#EF4444]", border: "border-[#EF4444]/30", bg: "bg-[#EF4444]/10" },
  rejected: { label: "REJECTED", color: "text-[#EF4444]", border: "border-[#EF4444]/30", bg: "bg-[#EF4444]/10" },
};

export interface DisplayCvPlayer {
  id: string;
  playerId: string;
  fullName: string;
  birthCountry: string;
  avatar: string;
  rating: number;
  cvTier: string;
  tierLabel: string;
  tierVariant: string;
  type: string;
  position: string;
  validation: string;
  validationLabel: string;
  validationVariant: string;
  coachName: string;
  assignedCoachId?: string;
  cvUrl?: string;
  rawItem?: any;
}

const AcademyValidateCv = () => {
  const router = useRouter();
  const fallbackPlayers = useAppSelector((state) => state.player.players);

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [tierFilter, setTierFilter] = useState<string>("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [page, setPage] = useState(1);
  const limit = 10;
  const [selectedNotifyPlayer, setSelectedNotifyPlayer] = useState<DisplayCvPlayer | null>(null);
  const [customMessage, setCustomMessage] = useState("Please review and validate player CV profile");

  const [notifyCoach, { isLoading: isNotifying }] = useNotifyCoachToValidateCvMutation();

  const handleOpenNotifyModal = (player: DisplayCvPlayer) => {
    setSelectedNotifyPlayer(player);
    setCustomMessage("Please review and validate player CV profile");
  };

  const handleAutoNotify = async () => {
    if (!selectedNotifyPlayer) return;
    try {
      await notifyCoach({
        playerId: selectedNotifyPlayer.playerId || selectedNotifyPlayer.id,
        message: customMessage.trim() || "Please review and validate player CV profile",
      }).unwrap();
      setSelectedNotifyPlayer(null);
    } catch {
      // Toast notifications handled in onQueryStarted
    }
  };

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // RTK Query: fetch validate CV dashboard data
  const {
    data: apiResponse,
    isLoading,
    isFetching,
  } = useGetAcademyValidateCvQuery({
    searchTerm: debouncedSearch.trim() || undefined,
    cvTier: tierFilter !== "All" ? tierFilter.toUpperCase() : undefined,
    type: typeFilter !== "All" ? typeFilter : undefined,
    page,
    limit,
  });

  const cvData = apiResponse?.data;
  const metrics = cvData?.metrics;
  const apiPlayers = cvData?.players;
  const meta = cvData?.meta;
  const isUsingApi = Boolean(apiResponse?.success !== undefined);

  // Map API players to unified DisplayCvPlayer
  const apiMappedPlayers = useMemo<DisplayCvPlayer[]>(() => {
    if (!apiPlayers) return [];
    return apiPlayers.map((item) => {
      const tierKey = (item.cvTierBadge?.variant || item.cvTier || "bronze").toLowerCase();
      const valKey = (item.validationBadge?.variant || item.validation || "pending").toLowerCase();

      return {
        id: item._id,
        playerId: item.player?._id || item._id,
        fullName: item.player?.name || "Rayhan Shorker",
        birthCountry: item.player?.country || "BANGLADESH",
        avatar: item.player?.avatar || "/ronaldo.png",
        rating: item.rating ?? 50,
        cvTier: (item.cvTier || "BRONZE").toUpperCase(),
        tierLabel: item.cvTierBadge?.label || item.cvTier || "BRONZE",
        tierVariant: tierKey,
        type: item.type || "Forward",
        position: item.position || "Forward",
        validation: (item.validation || "PENDING").toUpperCase(),
        validationLabel: item.validationBadge?.label || item.validation || "PENDING",
        validationVariant: valKey,
        coachName: item.coach || "Unassigned",
        assignedCoachId: item.assignedCoachId,
        cvUrl: item.cvUrl || `/dashboard/academy/management/validate-cv/${item.player?._id || item._id}`,
        rawItem: item,
      };
    });
  }, [apiPlayers]);

  // Map fallback Redux players
  const fallbackMappedPlayers = useMemo<DisplayCvPlayer[]>(() => {
    return fallbackPlayers.map((p) => {
      const tier = getCvTier(p.rating);
      const tierKey = tier.toLowerCase();
      const pType = getPlayerType(p.position);
      const statusKey = p.validationStatus === "verified" ? "verified" : "pending";
      const imgSrc = typeof p.playerImage === "string" ? p.playerImage : p.playerImage?.src || "/ronaldo.png";

      return {
        id: String(p.id),
        playerId: String(p.id),
        fullName: p.fullName || "Player",
        birthCountry: p.birthCountry || "BANGLADESH",
        avatar: imgSrc,
        rating: p.rating ?? 50,
        cvTier: tier.toUpperCase(),
        tierLabel: tier.toUpperCase(),
        tierVariant: tierKey,
        type: pType,
        position: p.position || "Forward",
        validation: p.validationStatus === "verified" ? "VERIFIED" : "PENDING",
        validationLabel: p.validationStatus === "verified" ? "VERIFIED" : "PENDING",
        validationVariant: statusKey,
        coachName: p.coachName || "Unassigned",
        cvUrl: `/dashboard/academy/management/validate-cv/${p.id}`,
      };
    });
  }, [fallbackPlayers]);

  const basePlayers = isUsingApi ? apiMappedPlayers : fallbackMappedPlayers;

  // Dynamic player types list for dropdown filter
  const playerTypes = useMemo(() => {
    const types = new Set(basePlayers.map((p) => p.type || getPlayerType(p.position)));
    return ["All", ...Array.from(types).filter(Boolean)];
  }, [basePlayers]);

  // Filtered players (for instant search and client-side filter fallback)
  const filtered = useMemo(() => {
    return basePlayers.filter((p) => {
      const term = searchTerm.toLowerCase();
      const matchesSearch =
        !term ||
        p.fullName.toLowerCase().includes(term) ||
        p.position.toLowerCase().includes(term) ||
        p.birthCountry.toLowerCase().includes(term) ||
        p.coachName.toLowerCase().includes(term);

      const matchesTier =
        tierFilter === "All" ||
        p.cvTier.toLowerCase() === tierFilter.toLowerCase();

      const matchesType =
        typeFilter === "All" ||
        p.type.toLowerCase() === typeFilter.toLowerCase();

      return matchesSearch && matchesTier && matchesType;
    });
  }, [basePlayers, searchTerm, tierFilter, typeFilter]);

  // Dashboard Stats: prioritize API metrics, fallback to calculated
  const stats = useMemo(() => {
    if (metrics) {
      return {
        total: metrics.totalPlayers,
        gold: metrics.goldCvs,
        silver: metrics.silverCvs,
        bronze: metrics.bronzeCvs,
      };
    }
    const gold = basePlayers.filter((p) => p.cvTier.toUpperCase() === "GOLD").length;
    const silver = basePlayers.filter((p) => p.cvTier.toUpperCase() === "SILVER").length;
    const bronze = basePlayers.filter((p) => p.cvTier.toUpperCase() === "BRONZE").length;
    return { gold, silver, bronze, total: basePlayers.length };
  }, [metrics, basePlayers]);

  // Handle Export All as CSV
  const handleExportAll = () => {
    if (filtered.length === 0) {
      toast.error("No player CVs available to export.");
      return;
    }

    const headers = ["Player Name", "Country", "Rating", "CV Tier", "Type", "Position", "Validation", "Coach"];
    const rows = filtered.map((p) => [
      `"${p.fullName.replace(/"/g, '""')}"`,
      `"${p.birthCountry.replace(/"/g, '""')}"`,
      p.rating,
      `"${p.tierLabel}"`,
      `"${p.type}"`,
      `"${p.position}"`,
      `"${p.validationLabel}"`,
      `"${p.coachName.replace(/"/g, '""')}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Player_CVs_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    toast.success("Player CV library exported successfully!");
  };

  return (
    <div className="flex flex-col gap-6 md:gap-8 w-full max-w-full overflow-x-hidden pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-0">
        <div>
          <h1 className="text-3xl md:text-4xl font-black uppercase text-white font-orbitron tracking-tight leading-none wrap-break-word">
            Validate CV
          </h1>
          <p className="text-white/60 font-bold uppercase tracking-widest text-[9px] md:text-[11px] mt-2">
            Player CV library — view, validate, and notify coaches
          </p>
        </div>

        <button
          onClick={handleExportAll}
          className="w-full md:w-auto justify-center bg-white/5 hover:bg-white/10 border border-white/15 text-white/60 hover:text-white px-6 py-3 rounded-2xl flex items-center gap-2 transition-all font-bold cursor-pointer shrink-0"
        >
          <IconDownload size={18} className="shrink-0" />
          <span className="text-[11px] font-black uppercase tracking-widest truncate">Export All</span>
        </button>
      </div>

      {/* Tier Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
        {[
          { label: "Total Players", value: stats.total, color: "text-white", border: "border-white/15", bg: "bg-white/5" },
          { label: "Gold CVs", value: stats.gold, color: "text-[#FBBF24]", border: "border-[#FBBF24]/30", bg: "bg-[#FBBF24]/5" },
          { label: "Silver CVs", value: stats.silver, color: "text-[#CBD5E1]", border: "border-[#CBD5E1]/30", bg: "bg-[#CBD5E1]/5" },
          { label: "Bronze CVs", value: stats.bronze, color: "text-[#F97316]", border: "border-[#F97316]/30", bg: "bg-[#F97316]/5" },
        ].map(({ label, value, color, border }) => (
          <div key={label} className={`bg-[#111111] rounded-[28px] border ${border} p-6 flex flex-col gap-2 shadow-xl`}>
            <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest leading-none">{label}</p>
            <p className={`text-4xl font-black font-orbitron ${color} leading-none mt-1`}>
              {isLoading ? "-" : value}
            </p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-[#111111] rounded-4xl border border-white/15 p-4 flex flex-col xl:flex-row gap-4 shadow-xl w-full max-w-full">
        <div className="relative flex-1 min-w-0 w-full">
          <IconSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={20} />
          <input
            type="text"
            placeholder="Search by name, position, or country..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white/2 border border-white/15 rounded-2xl py-3 pl-12 pr-10 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-white/25 transition-all"
          />
          {isFetching && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
              <IconLoader2 size={16} className="text-white/40 animate-spin" />
            </div>
          )}
        </div>

        <div className="flex gap-2 sm:gap-3 overflow-x-auto custom-scrollbar pb-2 xl:pb-0 w-full xl:w-auto min-w-0">
          {/* Tier Filter */}
          <div className="relative">
            <IconFilter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
            <select
              value={tierFilter}
              onChange={(e) => {
                setTierFilter(e.target.value);
                setPage(1);
              }}
              className="bg-white/5 border border-white/15 rounded-2xl py-3 pl-9 pr-8 text-[11px] font-bold text-white/60 focus:outline-none focus:border-white/25 transition-all cursor-pointer appearance-none"
            >
              <option value="All" className="bg-[#111111] text-white">All Tiers</option>
              <option value="Gold" className="bg-[#111111] text-white">Gold</option>
              <option value="Silver" className="bg-[#111111] text-white">Silver</option>
              <option value="Bronze" className="bg-[#111111] text-white">Bronze</option>
            </select>
            <IconChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/20 pointer-events-none" />
          </div>

          {/* Type Filter */}
          <div className="relative">
            <select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value);
                setPage(1);
              }}
              className="bg-white/5 border border-white/15 rounded-2xl py-3 px-4 pr-8 text-[11px] font-bold text-white/60 focus:outline-none focus:border-white/25 transition-all cursor-pointer appearance-none"
            >
              {playerTypes.map((t) => (
                <option key={t} value={t} className="bg-[#111111] text-white">
                  {t === "All" ? "All Positions" : t}
                </option>
              ))}
            </select>
            <IconChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/20 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Players Table */}
      <div className="bg-[#111111] rounded-4xl border border-white/15 p-5 md:p-8 flex flex-col gap-6 shadow-2xl min-w-0">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0">
          <div className="flex items-center gap-3">
            <h2 className="text-lg md:text-xl font-black uppercase text-white font-orbitron wrap-break-word">
              Player CVs ({meta?.total ?? filtered.length})
            </h2>
            {isFetching && (
              <span className="text-[10px] uppercase font-bold text-sky-400 bg-sky-400/10 px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
                <IconLoader2 size={12} className="animate-spin" /> Updating...
              </span>
            )}
          </div>
          <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest shrink-0">
            Click &ldquo;View CV&rdquo; to open full profile
          </span>
        </div>

        {/* Loading Skeletons */}
        {isLoading ? (
          <div className="flex flex-col gap-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-16 w-full bg-white/5 rounded-2xl shimmer border border-white/10" />
            ))}
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden lg:block rounded-2xl border border-white/15 overflow-x-auto custom-scrollbar">
              <table className="w-full text-left border-collapse min-w-250">
                <thead>
                  <tr className="border-b border-white/15 bg-white/1">
                    <th className="py-4 px-6 text-[11px] font-black uppercase tracking-widest text-white/80 border-r border-white/15">Player</th>
                    <th className="py-4 px-6 text-[11px] font-black uppercase tracking-widest text-white/80 border-r border-white/15 text-center">Rating</th>
                    <th className="py-4 px-6 text-[11px] font-black uppercase tracking-widest text-white/80 border-r border-white/15 text-center">CV Tier</th>
                    <th className="py-4 px-6 text-[11px] font-black uppercase tracking-widest text-white/80 border-r border-white/15 text-center">Type</th>
                    <th className="py-4 px-6 text-[11px] font-black uppercase tracking-widest text-white/80 border-r border-white/15 text-center">Position</th>
                    <th className="py-4 px-6 text-[11px] font-black uppercase tracking-widest text-white/80 border-r border-white/15 text-center">Validation</th>
                    <th className="py-4 px-6 text-[11px] font-black uppercase tracking-widest text-white/80 border-r border-white/15 text-center">Coach</th>
                    <th className="py-4 px-6 text-[11px] font-black uppercase tracking-widest text-white/80 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p, index) => {
                    const tierStyle = TIER_STYLES[p.tierVariant] || TIER_STYLES.bronze;
                    const vBadge = VALIDATION_STYLES[p.validationVariant] || VALIDATION_STYLES.pending;

                    return (
                      <tr
                        key={p.id}
                        className={`hover:bg-white/2 transition-colors group ${
                          index !== filtered.length - 1 ? "border-b border-white/15" : ""
                        }`}
                      >
                        {/* Player */}
                        <td className="py-4 px-6 border-r border-white/15">
                          <div className="flex items-center gap-3">
                            <div className="size-10 rounded-full overflow-hidden border border-white/15 shrink-0 bg-white/5 relative">
                              <Image
                                fill
                                src={p.avatar}
                                alt={p.fullName}
                                className="object-cover"
                                onError={(e) => {
                                  e.currentTarget.style.display = "none";
                                }}
                              />
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-black text-white whitespace-nowrap truncate">{p.fullName}</p>
                              <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest truncate">{p.birthCountry}</p>
                            </div>
                          </div>
                        </td>

                        {/* Rating */}
                        <td className="py-4 px-6 border-r border-white/15 text-center">
                          <span className={`text-xl font-black font-orbitron ${tierStyle.color}`}>{p.rating}</span>
                        </td>

                        {/* CV Tier */}
                        <td className="py-4 px-6 border-r border-white/15 text-center">
                          <span className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest inline-block border ${tierStyle.bg} ${tierStyle.border} ${tierStyle.color}`}>
                            {p.tierLabel}
                          </span>
                        </td>

                        {/* Type */}
                        <td className="py-4 px-6 border-r border-white/15 text-center">
                          <span className="text-[11px] font-bold text-white/60">{p.type}</span>
                        </td>

                        {/* Position */}
                        <td className="py-4 px-6 border-r border-white/15 text-center">
                          <span className="text-[11px] font-bold text-white/60 whitespace-nowrap">{p.position}</span>
                        </td>

                        {/* Validation */}
                        <td className="py-4 px-6 border-r border-white/15 text-center">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest inline-block border ${vBadge.bg} ${vBadge.border} ${vBadge.color}`}>
                            {p.validationLabel}
                          </span>
                        </td>

                        {/* Coach */}
                        <td className="py-4 px-6 border-r border-white/15 text-center">
                          <span className="text-[11px] font-bold text-white/60 whitespace-nowrap">{p.coachName}</span>
                        </td>

                        {/* Actions */}
                        <td className="py-4 px-6 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleOpenNotifyModal(p)}
                              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-[#FBBF24]/20 hover:border-[#FBBF24]/40 text-[#FBBF24]/80 hover:text-[#FBBF24] transition-all cursor-pointer text-[10px] font-black uppercase tracking-widest whitespace-nowrap"
                            >
                              <IconBell size={14} />
                              Notify
                            </button>
                            <button
                              onClick={() => {
                                router.push(`/dashboard/academy/management/validate-cv/${p.playerId || p.id}`);
                              }}
                              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white/50 hover:text-white transition-all cursor-pointer text-[10px] font-black uppercase tracking-widest whitespace-nowrap"
                            >
                              <IconEye size={14} />
                              View CV
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-white/40 text-sm font-medium">
                        No player CVs match the current filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile/Tablet Card View */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:hidden">
              {filtered.map((p) => {
                const tierStyle = TIER_STYLES[p.tierVariant] || TIER_STYLES.bronze;
                const vBadge = VALIDATION_STYLES[p.validationVariant] || VALIDATION_STYLES.pending;

                return (
                  <div key={p.id} className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col gap-4 relative overflow-hidden">
                    {/* Tier Glow */}
                    <div className={`absolute -top-10 -right-10 size-24 ${tierStyle.bg} blur-2xl rounded-full opacity-50`} />

                    {/* Header: Player Info & Validation */}
                    <div className="flex justify-between items-start relative z-10 gap-2">
                      <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                        <div className="size-10 sm:size-12 rounded-full overflow-hidden border border-white/15 shrink-0 bg-white/5 relative">
                          <Image
                            fill
                            src={p.avatar}
                            alt={p.fullName}
                            className="object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                            }}
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs sm:text-sm font-black text-white truncate">{p.fullName}</p>
                          <p className="text-[9px] sm:text-[10px] font-bold text-white/40 uppercase tracking-widest truncate mt-0.5">
                            {p.birthCountry}
                          </p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-[8px] sm:text-[9px] font-black uppercase tracking-widest border ${vBadge.bg} ${vBadge.border} ${vBadge.color} shrink-0`}>
                        {p.validationLabel}
                      </span>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-x-2 gap-y-3 sm:gap-3 mt-2 bg-black/20 p-2.5 sm:p-3 rounded-xl border border-white/5 relative z-10 min-w-0">
                      <div className="min-w-0">
                        <p className="text-[8px] sm:text-[9px] font-bold text-white/40 uppercase tracking-widest mb-1 truncate">Rating</p>
                        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                          <span className={`text-base sm:text-lg font-black font-orbitron ${tierStyle.color}`}>{p.rating}</span>
                          <span className={`px-1.5 sm:px-2 py-0.5 rounded-full text-[7px] sm:text-[8px] font-black uppercase tracking-widest border ${tierStyle.bg} ${tierStyle.border} ${tierStyle.color} shrink-0`}>
                            {p.tierLabel}
                          </span>
                        </div>
                      </div>
                      <div className="min-w-0">
                        <p className="text-[8px] sm:text-[9px] font-bold text-white/40 uppercase tracking-widest mb-1 truncate">Position</p>
                        <p className="text-[10px] sm:text-xs font-bold text-white/80 truncate" title={p.position}>{p.position}</p>
                      </div>
                      <div className="min-w-0">
                        <p className="text-[8px] sm:text-[9px] font-bold text-white/40 uppercase tracking-widest mb-1 truncate">Type</p>
                        <p className="text-[10px] sm:text-xs font-bold text-white/80 truncate" title={p.type}>{p.type}</p>
                      </div>
                      <div className="min-w-0">
                        <p className="text-[8px] sm:text-[9px] font-bold text-white/40 uppercase tracking-widest mb-1 truncate">Coach</p>
                        <p className="text-[10px] sm:text-xs font-bold text-white/80 truncate" title={p.coachName}>{p.coachName}</p>
                      </div>
                    </div>

                    {/* Action */}
                    <div className="flex gap-2 relative z-10 mt-1">
                      <button
                        onClick={() => handleOpenNotifyModal(p)}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#E31B23]/10 hover:bg-[#E31B23]/20 border border-[#E31B23]/30 text-[#E31B23] transition-all cursor-pointer text-[10px] font-black uppercase tracking-widest"
                      >
                        <IconBell size={14} />
                        Notify
                      </button>
                      <button
                        onClick={() => {
                          router.push(`/dashboard/academy/management/validate-cv/${p.playerId || p.id}`);
                        }}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-white transition-all cursor-pointer text-[10px] font-black uppercase tracking-widest"
                      >
                        <IconEye size={14} />
                        View CV
                      </button>
                    </div>
                  </div>
                );
              })}
              {filtered.length === 0 && (
                <div className="col-span-full py-12 text-center text-white/40 text-sm font-medium border border-white/10 rounded-2xl bg-white/5">
                  No player CVs match the current filters.
                </div>
              )}
            </div>

            {/* Pagination Controls */}
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
          </>
        )}
      </div>

      {/* Notify Coach Modal */}
      <Dialog
        open={!!selectedNotifyPlayer}
        onOpenChange={(open) => !open && !isNotifying && setSelectedNotifyPlayer(null)}
      >
        <DialogContent className="bg-[#111111] border border-white/10 text-white rounded-3xl max-w-sm p-6 flex flex-col gap-4">
          <DialogHeader className="flex flex-row justify-between items-center mb-1 p-0">
            <div className="flex items-center gap-2">
              <span className={`px-2 py-1 rounded border ${selectedNotifyPlayer ? (TIER_STYLES[selectedNotifyPlayer.tierVariant] || TIER_STYLES.bronze).border : ""} ${selectedNotifyPlayer ? (TIER_STYLES[selectedNotifyPlayer.tierVariant] || TIER_STYLES.bronze).bg : ""} ${selectedNotifyPlayer ? (TIER_STYLES[selectedNotifyPlayer.tierVariant] || TIER_STYLES.bronze).color : ""} font-black uppercase text-[10px] whitespace-nowrap`}>
                {selectedNotifyPlayer?.tierLabel || "BRONZE"} CV
              </span>
              <DialogTitle className="text-base sm:text-lg font-black uppercase font-orbitron truncate w-[200px]">
                {selectedNotifyPlayer?.fullName || "Unknown Player"}
              </DialogTitle>
            </div>
          </DialogHeader>

          {/* Message input */}
          <div className="flex flex-col gap-1.5 w-full">
            <label className="text-[10px] font-bold text-white/50 uppercase tracking-wider flex justify-between">
              <span>Notification Message</span>
              <span className="text-white/30 text-[9px]">Editable</span>
            </label>
            <textarea
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              rows={2}
              className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-white/20 resize-none font-medium"
              placeholder="Enter message for the coach..."
            />
          </div>

          <div className="flex flex-col gap-2.5 w-full">
            <button
              onClick={handleAutoNotify}
              disabled={isNotifying}
              className="w-full flex justify-center items-center gap-2 bg-[#E31B23] hover:bg-[#ff2d35] disabled:opacity-50 text-white font-black uppercase text-[10px] py-3.5 rounded-xl shadow-[0_0_15px_rgba(227,27,35,0.3)] transition-all cursor-pointer font-orbitron tracking-wider"
            >
              {isNotifying ? (
                <>
                  <IconLoader2 size={16} className="animate-spin" />
                  Sending Request...
                </>
              ) : (
                <>
                  <IconBell size={16} />
                  Auto Notify ({selectedNotifyPlayer?.coachName && selectedNotifyPlayer.coachName !== "Unassigned" ? selectedNotifyPlayer.coachName : "Assigned Coach"})
                </>
              )}
            </button>

            <button
              onClick={handleAutoNotify}
              disabled={isNotifying}
              className="w-full flex justify-center items-center gap-2 bg-transparent border border-white/10 hover:bg-white/5 disabled:opacity-50 text-white/70 hover:text-white font-black uppercase text-[10px] py-3 rounded-xl transition-all cursor-pointer font-orbitron tracking-wider"
            >
              <IconBell size={16} /> Select & Notify Coach
            </button>
          </div>

          {/* Player Card Preview */}
          <div className="mt-2 relative rounded-3xl overflow-hidden border border-white/10 bg-gradient-to-b from-blue-900/40 to-black aspect-3/4 p-6 flex flex-col justify-end">
            <div
              className={`absolute top-4 left-4 size-12 ${
                selectedNotifyPlayer?.tierVariant === "gold"
                  ? "bg-[#FBBF24] text-black"
                  : selectedNotifyPlayer?.tierVariant === "silver"
                  ? "bg-[#CBD5E1] text-black"
                  : "bg-[#F97316] text-white"
              } rounded-full flex items-center justify-center font-black text-xl shadow-lg font-orbitron`}
            >
              {selectedNotifyPlayer?.rating || 85}
            </div>
            {selectedNotifyPlayer?.avatar && (
              <Image
                src={selectedNotifyPlayer.avatar}
                alt="player"
                width={300}
                height={400}
                className="absolute inset-0 size-full object-cover opacity-60 mix-blend-luminosity"
                onError={(e) => {
                  e.currentTarget.src = "/placeholder_img.jpg";
                }}
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
            <div className="relative z-10 flex flex-col gap-2">
              <span
                className={`px-2 py-0.5 rounded-full ${
                  selectedNotifyPlayer?.validationVariant === "green" || selectedNotifyPlayer?.validation === "VERIFIED"
                    ? "bg-[#4ADE80]"
                    : "bg-[#E31B23]"
                } text-white font-black uppercase text-[8px] w-fit`}
              >
                {selectedNotifyPlayer?.validationLabel || "VERIFIED"}
              </span>
              <h3 className="text-2xl font-black uppercase font-orbitron leading-none text-white truncate">
                {selectedNotifyPlayer?.fullName || "Rayhan Shorker"}
              </h3>
              <p className="text-[#E31B23] text-[10px] font-black uppercase">
                {selectedNotifyPlayer?.position || "Forward (ST)"}
              </p>
              <div className="flex items-center gap-2 text-[9px] font-bold text-white/70 uppercase">
                <span>{selectedNotifyPlayer?.birthCountry || "BANGLADESH"}</span>
                <span>•</span>
                <span>Coach: {selectedNotifyPlayer?.coachName || "Marcus Silva"}</span>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AcademyValidateCv;
