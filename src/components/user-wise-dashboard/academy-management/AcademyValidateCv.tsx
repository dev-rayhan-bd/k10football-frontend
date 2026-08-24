/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import Image from "next/image";

import { useState, useMemo } from "react";
import {
  IconSearch,
  IconFilter,
  IconChevronDown,
  IconEye,
  IconDownload,
} from "@tabler/icons-react";
import { useAppSelector } from "@/lib/hooks/reduxHooks";
import { useRouter } from "next/navigation";

// ─── CV Tier calculation ───────────────────────────────────────────────────
type CvTier = "Gold" | "Silver" | "Bronze";

function getCvTier(rating: number): CvTier {
  if (rating >= 80) return "Gold";
  if (rating >= 60) return "Silver";
  return "Bronze";
}

const TIER_STYLES: Record<CvTier, { label: string; color: string; border: string; bg: string; glow: string }> = {
  Gold: { label: "GOLD", color: "text-[#FBBF24]", border: "border-[#FBBF24]/40", bg: "bg-[#FBBF24]/10", glow: "shadow-[0_0_16px_rgba(251,191,36,0.25)]" },
  Silver: { label: "SILVER", color: "text-[#CBD5E1]", border: "border-[#CBD5E1]/40", bg: "bg-[#CBD5E1]/10", glow: "shadow-[0_0_16px_rgba(203,213,225,0.15)]" },
  Bronze: { label: "BRONZE", color: "text-[#F97316]", border: "border-[#F97316]/40", bg: "bg-[#F97316]/10", glow: "shadow-[0_0_16px_rgba(249,115,22,0.15)]" },
};

// ─── Player type based on position ────────────────────────────────────────
function getPlayerType(position: string): string {
  const p = position.toLowerCase();
  if (p.includes("goalkeeper") || p === "gk") return "Goalkeeper";
  if (p.includes("defender") || p.includes("back") || p.includes("cb") || p.includes("lb") || p.includes("rb")) return "Defender";
  if (p.includes("midfielder") || p.includes("mid") || p.includes("cm") || p.includes("dm") || p.includes("am")) return "Midfielder";
  if (p.includes("forward") || p.includes("striker") || p.includes("winger") || p.includes("cf") || p.includes("lw") || p.includes("rw")) return "Forward";
  return "Field Player";
}

const VALIDATION_BADGE: Record<string, { label: string; color: string; border: string; bg: string }> = {
  verified: { label: "Verified", color: "text-[#4ADE80]", border: "border-[#4ADE80]/30", bg: "bg-[#4ADE80]/10" },
  pending: { label: "Pending", color: "text-[#FBBF24]", border: "border-[#FBBF24]/30", bg: "bg-[#FBBF24]/10" },
};



import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { IconBell } from "@tabler/icons-react";

const AcademyValidateCv = () => {
  const players = useAppSelector((state) => state.player.players);
  const router = useRouter();

  const [searchTerm, setSearchTerm] = useState("");
  const [tierFilter, setTierFilter] = useState<"All" | CvTier>("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [selectedNotifyPlayer, setSelectedNotifyPlayer] = useState<any | null>(null);

  const playerTypes = useMemo(() => {
    const types = new Set(players.map((p) => getPlayerType(p.position)));
    return ["All", ...Array.from(types)];
  }, [players]);

  const filtered = useMemo(() => {
    return players.filter((p) => {
      const tier = getCvTier(p.rating);
      const type = getPlayerType(p.position);
      const term = searchTerm.toLowerCase();
      const matchesSearch = !term || p.fullName.toLowerCase().includes(term) || p.position.toLowerCase().includes(term) || p.birthCountry.toLowerCase().includes(term);
      const matchesTier = tierFilter === "All" || tier === tierFilter;
      const matchesType = typeFilter === "All" || type === typeFilter;
      return matchesSearch && matchesTier && matchesType;
    });
  }, [players, searchTerm, tierFilter, typeFilter]);

  const stats = useMemo(() => {
    const gold = players.filter((p) => getCvTier(p.rating) === "Gold").length;
    const silver = players.filter((p) => getCvTier(p.rating) === "Silver").length;
    const bronze = players.filter((p) => getCvTier(p.rating) === "Bronze").length;
    return { gold, silver, bronze, total: players.length };
  }, [players]);

  return (
    <div className="flex flex-col gap-6 md:gap-8 w-full max-w-full overflow-x-hidden pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-0">
        <div>
          <h1 className="text-3xl md:text-4xl font-black uppercase text-white font-orbitron tracking-tight leading-none wrap-break-word">Validate CV</h1>
          <p className="text-white/60 font-bold uppercase tracking-widest text-[9px] md:text-[11px] mt-2">Player CV library — view, validate, and notify coaches</p>
        </div>
        <button className="w-full md:w-auto justify-center bg-white/5 hover:bg-white/10 border border-white/15 text-white/60 hover:text-white px-6 py-3 rounded-2xl flex items-center gap-2 transition-all font-bold cursor-pointer shrink-0">
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
            <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">{label}</p>
            <p className={`text-4xl font-black font-orbitron ${color}`}>{value}</p>
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
            className="w-full bg-white/2 border border-white/15 rounded-2xl py-3 pl-12 pr-4 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-white/25 transition-all"
          />
        </div>
        <div className="flex gap-2 sm:gap-3 overflow-x-auto custom-scrollbar pb-2 xl:pb-0 w-full xl:w-auto min-w-0">
          {/* Tier Filter */}
          <div className="relative">
            <IconFilter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
            <select
              value={tierFilter}
              onChange={(e) => setTierFilter(e.target.value as "All" | CvTier)}
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
              onChange={(e) => setTypeFilter(e.target.value)}
              className="bg-white/5 border border-white/15 rounded-2xl py-3 px-4 pr-8 text-[11px] font-bold text-white/60 focus:outline-none focus:border-white/25 transition-all cursor-pointer appearance-none"
            >
              {playerTypes.map((t) => (
                <option key={t} value={t} className="bg-[#111111] text-white">{t === "All" ? "All Positions" : t}</option>
              ))}
            </select>
            <IconChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/20 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Players Table */}
      <div className="bg-[#111111] rounded-4xl border border-white/15 p-5 md:p-8 flex flex-col gap-6 shadow-2xl min-w-0">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0">
          <h2 className="text-lg md:text-xl font-black uppercase text-white font-orbitron wrap-break-word">Player CVs ({filtered.length})</h2>
          <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest shrink-0">Click &ldquo;View CV&rdquo; to open full profile</span>
        </div>

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
                const tier = getCvTier(p.rating);
                const tierStyle = TIER_STYLES[tier];
                const pType = getPlayerType(p.position);
                const displayStatus = p.validationStatus === "verified" ? "verified" : "pending";
                const vBadge = VALIDATION_BADGE[displayStatus];
                const imgSrc = typeof p.playerImage === "string" ? p.playerImage : p.playerImage?.src || "/ronaldo.png";

                return (
                  <tr
                    key={p.id}
                    className={`hover:bg-white/2 transition-colors group ${index !== filtered.length - 1 ? "border-b border-white/15" : ""}`}
                  >
                    {/* Player */}
                    <td className="py-4 px-6 border-r border-white/15">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden border border-white/15 shrink-0 bg-white/5">
                          <Image width={20} height={20} src={imgSrc} alt={p.fullName} className="w-full h-full object-cover" onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.srcset = "";
                            target.src = "/placeholder_img.jpg";
                          }} />
                        </div>
                        <div>
                          <p className="text-sm font-black text-white whitespace-nowrap">{p.fullName}</p>
                          <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">{p.birthCountry}</p>
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
                        {tier}
                      </span>
                    </td>

                    {/* Type */}
                    <td className="py-4 px-6 border-r border-white/15 text-center">
                      <span className="text-[11px] font-bold text-white/60">{pType}</span>
                    </td>

                    {/* Position */}
                    <td className="py-4 px-6 border-r border-white/15 text-center">
                      <span className="text-[11px] font-bold text-white/60 whitespace-nowrap">{p.position}</span>
                    </td>

                    {/* Validation */}
                    <td className="py-4 px-6 border-r border-white/15 text-center">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest inline-block border ${vBadge.bg} ${vBadge.border} ${vBadge.color}`}>
                        {vBadge.label}
                      </span>
                    </td>

                    {/* Coach */}
                    <td className="py-4 px-6 border-r border-white/15 text-center">
                      <span className="text-[11px] font-bold text-white/60 whitespace-nowrap">{p.coachName || "Unassigned"}</span>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-6 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedNotifyPlayer(p);
                          }}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-[#FBBF24]/20 hover:border-[#FBBF24]/40 text-[#FBBF24]/80 hover:text-[#FBBF24] transition-all cursor-pointer text-[10px] font-black uppercase tracking-widest whitespace-nowrap"
                        >
                          <IconBell size={14} />
                          Notify
                        </button>
                        <button
                          onClick={() => {
                            router.push(`/dashboard/academy/management/validate-cv/${p.id}`);
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
            const tier = getCvTier(p.rating);
            const tierStyle = TIER_STYLES[tier];
            const pType = getPlayerType(p.position);
            const displayStatus = p.validationStatus === "verified" ? "verified" : "pending";
            const vBadge = VALIDATION_BADGE[displayStatus];
            const imgSrc = typeof p.playerImage === "string" ? p.playerImage : p.playerImage?.src || "/ronaldo.png";

            return (
              <div key={p.id} className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col gap-4 relative overflow-hidden">
                {/* Tier Glow */}
                <div className={`absolute -top-10 -right-10 w-24 h-24 ${tierStyle.bg} blur-2xl rounded-full opacity-50`} />

                {/* Header: Player Info & Validation */}
                <div className="flex justify-between items-start relative z-10 gap-2">
                  <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden border border-white/15 shrink-0 bg-white/5">
                      <Image width={48} height={48} src={imgSrc} alt={p.fullName} className="w-full h-full object-cover" onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.srcset = "";
                        target.src = "/placeholder_img.jpg";
                      }} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm font-black text-white truncate">{p.fullName}</p>
                      <div className="flex items-center gap-2 mt-0.5 min-w-0">
                        <p className="text-[9px] sm:text-[10px] font-bold text-white/40 uppercase tracking-widest truncate">{p.birthCountry}</p>
                      </div>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-[8px] sm:text-[9px] font-black uppercase tracking-widest border ${vBadge.bg} ${vBadge.border} ${vBadge.color} shrink-0`}>
                    {vBadge.label}
                  </span>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-x-2 gap-y-3 sm:gap-3 mt-2 bg-black/20 p-2.5 sm:p-3 rounded-xl border border-white/5 relative z-10 min-w-0">
                  <div className="min-w-0">
                    <p className="text-[8px] sm:text-[9px] font-bold text-white/40 uppercase tracking-widest mb-1 truncate">Rating</p>
                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                      <span className={`text-base sm:text-lg font-black font-orbitron ${tierStyle.color}`}>{p.rating}</span>
                      <span className={`px-1.5 sm:px-2 py-0.5 rounded-full text-[7px] sm:text-[8px] font-black uppercase tracking-widest border ${tierStyle.bg} ${tierStyle.border} ${tierStyle.color} shrink-0`}>
                        {tier}
                      </span>
                    </div>
                  </div>
                  <div className="min-w-0">
                    <p className="text-[8px] sm:text-[9px] font-bold text-white/40 uppercase tracking-widest mb-1 truncate">Position</p>
                    <p className="text-[10px] sm:text-xs font-bold text-white/80 truncate" title={p.position}>{p.position}</p>
                  </div>
                  <div className="min-w-0">
                    <p className="text-[8px] sm:text-[9px] font-bold text-white/40 uppercase tracking-widest mb-1 truncate">Type</p>
                    <p className="text-[10px] sm:text-xs font-bold text-white/80 truncate" title={pType}>{pType}</p>
                  </div>
                  <div className="min-w-0">
                    <p className="text-[8px] sm:text-[9px] font-bold text-white/40 uppercase tracking-widest mb-1 truncate">Coach</p>
                    <p className="text-[10px] sm:text-xs font-bold text-white/80 truncate" title={p.coachName || "Unassigned"}>{p.coachName || "Unassigned"}</p>
                  </div>
                </div>

                {/* Action */}
                <div className="flex gap-2 relative z-10 mt-1">
                  <button
                    onClick={() => {
                      setSelectedNotifyPlayer(p);
                    }}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#E31B23]/10 hover:bg-[#E31B23]/20 border border-[#E31B23]/30 text-[#E31B23] transition-all cursor-pointer text-[10px] font-black uppercase tracking-widest"
                  >
                    <IconBell size={14} />
                    Notify
                  </button>
                  <button
                    onClick={() => {
                      router.push(`/dashboard/academy/management/validate-cv/${p.id}`);
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
      </div>
      
      {/* Notify Coach Modal */}
      <Dialog open={!!selectedNotifyPlayer} onOpenChange={(open) => !open && setSelectedNotifyPlayer(null)}>
        <DialogContent className="bg-[#111111] border border-white/10 text-white rounded-3xl max-w-sm p-6 flex flex-col gap-4">
          <DialogHeader className="flex flex-row justify-between items-center mb-2 p-0">
            <div className="flex items-center gap-2">
              <span className={`px-2 py-1 rounded border ${selectedNotifyPlayer ? TIER_STYLES[getCvTier(selectedNotifyPlayer.rating)].border : ''} ${selectedNotifyPlayer ? TIER_STYLES[getCvTier(selectedNotifyPlayer.rating)].bg : ''} ${selectedNotifyPlayer ? TIER_STYLES[getCvTier(selectedNotifyPlayer.rating)].color : ''} font-black uppercase text-[10px] whitespace-nowrap`}>
                 {selectedNotifyPlayer ? getCvTier(selectedNotifyPlayer.rating) : 'N/A'} CV
              </span>
              <DialogTitle className="text-base sm:text-lg font-black uppercase font-orbitron truncate w-[200px]">
                {selectedNotifyPlayer?.fullName || "Unknown Player"}
              </DialogTitle>
            </div>
          </DialogHeader>
          
          <div className="flex flex-col gap-3 w-full">
            <button className="w-full flex justify-center items-center gap-2 bg-[#E31B23] hover:bg-[#ff2d35] text-white font-black uppercase text-[10px] py-4 rounded-xl shadow-[0_0_15px_rgba(227,27,35,0.3)] transition-all">
              <IconBell size={16} /> Select & Notify Coach
            </button>
            <button className="w-full flex justify-center items-center gap-2 bg-transparent border-2 border-white/10 hover:bg-white/5 text-white/70 hover:text-white font-black uppercase text-[10px] py-4 rounded-xl transition-all">
              <IconBell size={16} /> Auto Notify (Pep Guardiola)
            </button>
          </div>

          {/* Mock Player Card */}
          <div className="mt-2 relative rounded-3xl overflow-hidden border border-white/10 bg-gradient-to-b from-blue-900/40 to-black aspect-[3/4] p-6 flex flex-col justify-end">
            <div className={`absolute top-4 left-4 w-12 h-12 ${selectedNotifyPlayer ? (getCvTier(selectedNotifyPlayer.rating) === 'Gold' ? 'bg-[#FBBF24] text-black' : getCvTier(selectedNotifyPlayer.rating) === 'Silver' ? 'bg-[#CBD5E1] text-black' : 'bg-[#F97316] text-white') : ''} rounded-full flex items-center justify-center font-black text-xl shadow-lg`}>
              {selectedNotifyPlayer?.rating || 88}
            </div>
            <Image 
              src={selectedNotifyPlayer?.playerImage?.src || selectedNotifyPlayer?.playerImage || selectedNotifyPlayer?.avatar || "/placeholder_img.jpg"} 
              alt="player" 
              width={300} 
              height={400} 
              className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-luminosity" 
              onError={(e) => { e.currentTarget.src = "/placeholder_img.jpg"; }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
            <div className="relative z-10 flex flex-col gap-2">
              <span className={`px-2 py-0.5 rounded-full ${selectedNotifyPlayer?.validationStatus === 'verified' ? 'bg-[#4ADE80]' : 'bg-[#E31B23]'} text-white font-black uppercase text-[8px] w-fit`}>
                 {selectedNotifyPlayer?.validationStatus === 'verified' ? 'Verified' : 'Active'}
              </span>
              <h3 className="text-2xl font-black uppercase font-orbitron leading-none text-white">
                {selectedNotifyPlayer?.fullName || "Unknown"}
              </h3>
              <p className="text-[#E31B23] text-[10px] font-black uppercase">
                {selectedNotifyPlayer?.position || "Defensive Midfielder (CDM)"}
              </p>
              <div className="flex items-center gap-2 text-[9px] font-bold text-white/70 uppercase">
                <span>{selectedNotifyPlayer?.age || 24} Years Old</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Image src="https://flagcdn.com/br.svg" alt="country" width={12} height={8} className="object-cover" />
                  {selectedNotifyPlayer?.birthCountry || "Brazil"}
                </span>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AcademyValidateCv;
