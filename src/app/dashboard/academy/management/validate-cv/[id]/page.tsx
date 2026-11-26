"use client";

import { useState, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  IconSearch,
  IconBell,
  IconX,
  IconLoader2,
  IconCheck,
  IconArrowLeft,
  IconDownload,
} from "@tabler/icons-react";
import { toast } from "sonner";
import { domPagesToPdf } from "@/lib/pdf/domToPdf";
import ChatAvatar from "@/components/chat/ChatAvatar";
import { useGetAcademyCoachesQuery } from "@/redux/features/academy/academyApi";
import {
  INACTIVE_COACH_STATUSES,
  toAcademyCoachRows,
} from "@/components/user-wise-dashboard/academy-management/academyLists";
import PlayerCvViewPage from "@/components/cvs/player-cv-view/PlayerCvViewPage";
import { useGetPlayerCvByIdQuery } from "@/redux/features/player/playerApi";
import {
  useGetAcademyValidateCvQuery,
  useNotifyCoachToValidateCvMutation,
} from "@/redux/features/academy/academyApi";

// ─── CV Tier (from the backend, never computed here) ───────────────────────
type CvTier = "Gold" | "Silver" | "Bronze";

const toCvTier = (value: unknown): CvTier | null => {
  const upper = String(value || "").toUpperCase();
  if (upper.includes("GOLD")) return "Gold";
  if (upper.includes("SILVER")) return "Silver";
  if (upper.includes("BRONZE")) return "Bronze";
  return null;
};

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

  // The CV of the player in the URL (same request PlayerCvViewPage makes — cached).
  const { data: playerCvResponse } = useGetPlayerCvByIdQuery(playerId, { skip: !playerId });
  const playerCv = playerCvResponse?.data;

  const playerName = playerItem?.player?.name || playerCv?.fullName || "Player CV";
  const tier = toCvTier(playerItem?.cvTier ?? playerItem?.cvTierBadge?.label ?? playerCv?.cvTier);
  const tierStyle = tier ? TIER_STYLES[tier] : null;
  const assignedCoach = playerItem?.coach || "the assigned coach";

  const [notified, setNotified] = useState(false);

  // State for Select & Notify Coach feature
  const [showCoachSelector, setShowCoachSelector] = useState(false);
  const [coachSearch, setCoachSearch] = useState("");
  const [selectedCoachIds, setSelectedCoachIds] = useState<string[]>([]);
  const [isNotifyingCoaches, setIsNotifyingCoaches] = useState(false);

  // Only this academy's coaches (GET /academies/coaches), minus removed/rejected/pending ones.
  const { data: academyCoachesResponse, isLoading: isLoadingCoaches } = useGetAcademyCoachesQuery();
  const academyCoaches = useMemo(
    () =>
      toAcademyCoachRows(academyCoachesResponse?.data)
        .filter((c) => c.coachProfileId && !INACTIVE_COACH_STATUSES.includes(c.status) && c.status !== "PENDING")
        .map((c) => ({ id: c.coachProfileId, name: c.name, role: c.role, avatar: c.avatar })),
    [academyCoachesResponse]
  );

  const filteredCoaches = useMemo(() => {
    const term = coachSearch.toLowerCase();
    return academyCoaches.filter(
      (c) => c.name.toLowerCase().includes(term) || c.role.toLowerCase().includes(term)
    );
  }, [academyCoaches, coachSearch]);

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

  const [isDownloading, setIsDownloading] = useState(false);
  const handleDownloadCv = async () => {
    const content = document.getElementById("validate-cv-content");
    if (!content || isDownloading || !playerCv) {
      toast.error("The CV is still loading. Please try again in a moment.");
      return;
    }
    setIsDownloading(true);
    const toastId = toast.loading("Generating CV PDF...");
    try {
      await domPagesToPdf({
        pages: [content],
        fileName: `CV_${playerName.trim().replace(/\s+/g, "_") || "Player"}.pdf`,
      });
      toast.success("CV PDF downloaded.", { id: toastId });
    } catch {
      toast.error("Failed to generate the CV PDF. Please try again.", { id: toastId });
    } finally {
      setIsDownloading(false);
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
            {tier && tierStyle && (
              <div className={`px-3 sm:px-4 py-1.5 rounded-full text-[10px] sm:text-[11px] font-black uppercase tracking-widest border shrink-0 ${tierStyle.bg} ${tierStyle.border} ${tierStyle.color}`}>
                {tier} CV
              </div>
            )}
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
                                <ChatAvatar src={coach.avatar} name={coach.name} className="size-full" />
                              </div>
                              <div className="min-w-0">
                                <p className="text-[11px] font-black text-white truncate">{coach.name}</p>
                                {coach.role && (
                                  <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest">{coach.role}</p>
                                )}
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
                        <p className="text-center text-[10px] text-white/30 py-4 uppercase font-bold">
                          {isLoadingCoaches
                            ? "Loading coaches..."
                            : academyCoaches.length === 0
                              ? "No coaches in your academy"
                              : "No coaches found"}
                        </p>
                      )}
                    </div>

                    {/* Select options */}
                    <div className="flex gap-2 pt-2 border-t border-white/10">
                      <button
                        onClick={() => setSelectedCoachIds(academyCoaches.map((c) => c.id))}
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

            {/* Download the selected player's CV */}
            <button
              type="button"
              onClick={handleDownloadCv}
              disabled={isDownloading || !playerCv}
              className="flex items-center justify-center gap-2 px-3 sm:px-5 py-2.5 rounded-2xl text-[9px] sm:text-[11px] font-black uppercase tracking-widest transition-all cursor-pointer border bg-white/5 hover:bg-white/10 border-white/10 text-white/70 hover:text-white disabled:opacity-50 disabled:cursor-wait w-full sm:w-auto flex-1 md:flex-none"
            >
              {isDownloading ? <IconLoader2 size={16} className="animate-spin shrink-0" /> : <IconDownload size={16} className="shrink-0" />}
              <span className="truncate">Download CV</span>
            </button>

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

      {/* The selected player's CV — not the logged-in user's. */}
      <div id="validate-cv-content" className="w-full min-w-0">
        <PlayerCvViewPage playerId={playerId} />
      </div>
    </>
  );
};

export default ViewCVDetailsPage;
