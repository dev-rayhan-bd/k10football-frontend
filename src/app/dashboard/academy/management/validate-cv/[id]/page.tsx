"use client";

import Image from "next/image";
import { useState, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  IconSearch,
  IconBell,
  IconX,
  IconLoader2,
  IconCheck,
  IconArrowLeft,
} from "@tabler/icons-react";
import { COACH_POOL } from "@/components/user-wise-dashboard/academy-analysis/TeamDataStore";
import ViewCv from "@/components/user-wise-dashboard/academy-management/ViewCv";
import {
  useGetAcademyValidateCvQuery,
  useNotifyCoachToValidateCvMutation,
} from "@/redux/features/academy/academyApi";

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

const ViewCVDetailsPage = () => {
  const router = useRouter();
  const params = useParams();
  const playerId = (params?.id as string) || "";

  const { data: cvData } = useGetAcademyValidateCvQuery();
  const playerItem = cvData?.data?.players?.find(
    (p) => p._id === playerId || p.player?._id === playerId
  );

  const [notifyCoach, { isLoading: isNotifyingCoach }] = useNotifyCoachToValidateCvMutation();

  const playerName = playerItem?.player?.name || "Player CV";
  const playerRating = playerItem?.rating ?? 80;
  const tier = getCvTier(playerRating);
  const tierStyle = TIER_STYLES[tier];
  const assignedCoach = playerItem?.coach || "the assigned coach";

  const [notified, setNotified] = useState(false);

  // State for Select & Notify Coach feature
  const [showCoachSelector, setShowCoachSelector] = useState(false);
  const [coachSearch, setCoachSearch] = useState("");
  const [selectedCoachIds, setSelectedCoachIds] = useState<string[]>([]);
  const [isNotifyingCoaches, setIsNotifyingCoaches] = useState(false);

  const filteredCoaches = useMemo(() => {
    return COACH_POOL.filter(
      (c) =>
        c.name.toLowerCase().includes(coachSearch.toLowerCase()) ||
        c.role.toLowerCase().includes(coachSearch.toLowerCase())
    );
  }, [coachSearch]);

  const toggleCoachSelection = (coachId: string) => {
    setSelectedCoachIds((prev) =>
      prev.includes(coachId)
        ? prev.filter((id) => id !== coachId)
        : [...prev, coachId]
    );
  };

  const handleNotifySelectedCoaches = async () => {
    if (selectedCoachIds.length === 0) return;
    setIsNotifyingCoaches(true);

    try {
      await notifyCoach({
        playerId: playerItem?.player?._id || playerItem?._id || playerId,
        message: "Please review and validate player CV profile",
      }).unwrap();
      setShowCoachSelector(false);
      setSelectedCoachIds([]);
    } catch {
      // Toast notifications handled in onQueryStarted
    } finally {
      setIsNotifyingCoaches(false);
    }
  };

  const handleNotifyCoach = async () => {
    if (notified) return;
    try {
      await notifyCoach({
        playerId: playerItem?.player?._id || playerItem?._id || playerId,
        message: "Please review and validate player CV profile",
      }).unwrap();
      setNotified(true);
    } catch {
      // Toast notifications handled in onQueryStarted
    }
  };

  const backToManagement = () => {
    router.push("/dashboard/academy/management/validate-cv");
  };

  return (
    <>
      <div className="py-4 sm:py-5">
        <div className="w-full flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-0">
          <div className="flex items-center gap-3 sm:gap-4 w-full md:w-auto">
            <button
              onClick={backToManagement}
              className="size-10 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 hover:text-white transition-all cursor-pointer shrink-0"
            >
              <IconArrowLeft size={18} />
            </button>
            <div className={`px-3 sm:px-4 py-1.5 rounded-full text-[10px] sm:text-[11px] font-black uppercase tracking-widest border shrink-0 ${tierStyle.bg} ${tierStyle.border} ${tierStyle.color}`}>
              {tier} CV
            </div>
            <h2 className="text-lg sm:text-xl font-black uppercase text-white font-orbitron tracking-tight truncate">
              {playerName}
            </h2>
          </div>

          <div className="flex flex-wrap md:flex-nowrap items-center gap-2 sm:gap-3 w-full md:w-auto">
            {/* Select & Notify Coach Button */}
            <div className="relative w-full sm:w-auto flex-1 md:flex-none">
              <button
                onClick={() => setShowCoachSelector(!showCoachSelector)}
                className="flex items-center justify-center gap-2 px-3 sm:px-5 py-2.5 rounded-2xl text-[9px] sm:text-[11px] font-black uppercase tracking-widest transition-all cursor-pointer bg-[#E31B23] hover:bg-[#C2181F] border-[#E31B23]/40 text-white shadow-lg shadow-[#E31B23]/20 w-full"
              >
                <IconBell size={16} className="shrink-0" />
                <span className="truncate">Select & Notify Coach</span>
              </button>

              {showCoachSelector && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowCoachSelector(false)} />
                  <div className="absolute right-0 top-12 w-80 bg-[#0d0d0d] border border-white/15 backdrop-blur-md rounded-2xl p-4 shadow-2xl z-50 flex flex-col gap-3">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-black text-white/50 uppercase tracking-widest">Select Coaches</span>
                      <button
                        onClick={() => setShowCoachSelector(false)}
                        className="text-white/40 hover:text-white"
                      >
                        <IconX size={14} />
                      </button>
                    </div>

                    {/* Search */}
                    <div className="relative">
                      <IconSearch size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                      <input
                        type="text"
                        placeholder="Search coaches..."
                        value={coachSearch}
                        onChange={(e) => setCoachSearch(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-9 pr-4 text-[11px] text-white placeholder:text-white/30 focus:outline-none focus:border-white/20"
                      />
                    </div>

                    {/* Coaches list */}
                    <div className="max-h-60 overflow-y-auto flex flex-col gap-1.5 pr-1">
                      {filteredCoaches.map((coach) => {
                        const isSelected = selectedCoachIds.includes(coach.id);
                        return (
                          <div
                            key={coach.id}
                            onClick={() => toggleCoachSelection(coach.id)}
                            className={`flex items-center justify-between p-2 rounded-xl border transition-all cursor-pointer ${
                              isSelected
                                ? "bg-[#E31B23]/10 border-[#E31B23]/30"
                                : "bg-white/5 border-transparent hover:bg-white/10"
                            }`}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <div className="size-8 rounded-full overflow-hidden bg-white/5 border border-white/10 shrink-0">
                                <Image
                                  width={100}
                                  height={100}
                                  src={coach.avatar}
                                  alt={coach.name}
                                  className="size-full object-cover"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.srcset = "";
                                    target.src = "/placeholder_img.jpg";
                                  }}
                                />
                              </div>
                              <div className="min-w-0">
                                <p className="text-[11px] font-black text-white truncate">{coach.name}</p>
                                <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest">{coach.role}</p>
                              </div>
                            </div>
                            <div
                              className={`size-4 rounded-md border flex items-center justify-center transition-all ${
                                isSelected
                                  ? "bg-[#E31B23] border-[#E31B23] text-white"
                                  : "border-white/20 text-transparent"
                              }`}
                            >
                              <IconCheck size={10} strokeWidth={3} />
                            </div>
                          </div>
                        );
                      })}
                      {filteredCoaches.length === 0 && (
                        <p className="text-center text-[10px] text-white/30 py-4 uppercase font-bold">No coaches found</p>
                      )}
                    </div>

                    {/* Select options */}
                    <div className="flex gap-2 pt-2 border-t border-white/10">
                      <button
                        onClick={() => setSelectedCoachIds(COACH_POOL.map((c) => c.id))}
                        className="flex-1 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[9px] font-black uppercase text-white/60 hover:text-white tracking-widest transition-all min-w-0"
                      >
                        Select All
                      </button>
                      <button
                        onClick={() => setSelectedCoachIds([])}
                        className="flex-1 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[9px] font-black uppercase text-white/60 hover:text-white tracking-widest transition-all min-w-0"
                      >
                        Clear
                      </button>
                    </div>

                    {/* Submit */}
                    <button
                      onClick={handleNotifySelectedCoaches}
                      disabled={selectedCoachIds.length === 0 || isNotifyingCoaches}
                      className="w-full py-2.5 rounded-xl bg-[#E31B23] hover:bg-[#C2181F] border-[#E31B23]/40 text-white text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 shadow-lg shadow-[#E31B23]/20"
                    >
                      {isNotifyingCoaches ? (
                        <>
                          <IconLoader2 size={12} className="animate-spin" /> Sending...
                        </>
                      ) : (
                        <>Notify ({selectedCoachIds.length})</>
                      )}
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Auto Notify Coach Button */}
            <button
              onClick={handleNotifyCoach}
              disabled={isNotifyingCoach || notified}
              className={`flex items-center justify-center gap-2 px-3 sm:px-5 py-2.5 rounded-2xl text-[9px] sm:text-[11px] font-black uppercase tracking-widest transition-all cursor-pointer disabled:cursor-default border w-full sm:w-auto flex-1 md:flex-none ${
                notified
                  ? "bg-[#4ADE80]/10 border-[#4ADE80]/30 text-[#4ADE80]"
                  : "bg-white/5 hover:bg-white/10 border border-white/10 text-white/50 hover:text-white"
              }`}
            >
              {isNotifyingCoach ? (
                <>
                  <IconLoader2 size={16} className="animate-spin shrink-0" /> <span className="truncate">Sending...</span>
                </>
              ) : notified ? (
                <>
                  <IconCheck size={16} className="shrink-0" /> <span className="truncate">Coach Notified</span>
                </>
              ) : (
                <>
                  <IconBell size={16} className="shrink-0" /> <span className="truncate">Auto Notify ({assignedCoach})</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <ViewCv />
    </>
  );
};

export default ViewCVDetailsPage;
