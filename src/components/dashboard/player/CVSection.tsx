'use client'

import React from "react";
import { CheckCircle2, Download, Share2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { usePlayer } from "@/hooks/usePlayer";
import { cn } from "@/lib/utils";

const CVSection = () => {
  const router = useRouter();
  const { playerData, cvData } = usePlayer();

  const rawCompletion =
    cvData?.profileCompletion ??
    (playerData as any)?.profileCompletion ??
    0;
  const profileCompletion = Math.max(0, Math.min(100, Math.round(Number(rawCompletion) || 0)));

  const rawTier = String(
    cvData?.cvTier || (playerData as any)?.cvTier || "BRONZE"
  ).toUpperCase();

  const isGold = rawTier === "GOLD";
  const isSilver = rawTier === "SILVER";

  const tierBadgeLabel = isGold
    ? "GOLD READY"
    : isSilver
      ? "SILVER TIER"
      : `${rawTier} TIER`;

  const tierDescription = isGold
    ? "Your CV meets Gold tier standards and is ready to share with top clubs and agents."
    : isSilver
      ? "Your CV meets Silver tier standards. Complete verification and game reports to reach Gold."
      : "Your CV is currently at Bronze tier. Complete your profile and get coach verification to unlock Gold tier.";

  const hasPersonalInfo = Boolean(
    playerData?.fullName && playerData?.birthCountry && playerData?.position
  );
  const hasPhysicalStats = Boolean(
    Number(playerData?.height) > 0 && Number(playerData?.weight) > 0
  );
  const hasSkillsAttributes = Boolean(
    (cvData?.attributes?.categories && Object.keys(cvData.attributes.categories).length > 0) ||
    (playerData?.skillsCategories && playerData.skillsCategories.length > 0)
  );
  const hasMatchHistory = Boolean(
    (cvData?.recentMatches && cvData.recentMatches.length > 0) ||
    (cvData?.matchSummary?.totalMatches ?? 0) > 0 ||
    (playerData?.clubs && playerData.clubs.length > 0)
  );
  const hasReferences = Boolean(
    cvData?.isVerifiedByCoach ||
    cvData?.coachVerification?.isVerified ||
    playerData?.validationStatus === "verified"
  );

  const sections = [
    { name: "Personal Info", completed: hasPersonalInfo },
    { name: "Physical Stats", completed: hasPhysicalStats },
    { name: "Skills & Attributes", completed: hasSkillsAttributes },
    { name: "Match History", completed: hasMatchHistory },
    { name: "References", completed: hasReferences },
  ];

  const handleShareWithAgent = async () => {
    const playerId = cvData?._id || (playerData as any)?._id || playerData?.id;
    const shareUrl =
      typeof window !== "undefined" && playerId
        ? `${window.location.origin}/cvs/player-cv-details?playerId=${playerId}`
        : typeof window !== "undefined"
          ? `${window.location.origin}/dashboard/player/my-cv`
          : "";
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success("CV share link copied to clipboard!");
    } catch {
      toast.info("Open My CV to share your profile.");
      router.push("/dashboard/player/my-cv");
    }
  };

  return (
    <div className="py-4">
      <div className="mx-auto">
        {/* Main Card */}
        <div className="border border-white/10 rounded-2xl p-4 sm:p-6 md:p-8 bg-black/40 backdrop-blur-xs shadow-xl">
          {/* Title */}
          <h1 className="text-2xl sm:text-3xl font-heading text-white mb-6 uppercase">My CV</h1>

          {/* Tabs/Sections */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-6 md:gap-8 mb-6 sm:mb-8 pb-6 border-b border-white/10">
            {sections.map((section) => (
              <div key={section.name} className="flex items-center gap-2">
                <CheckCircle2
                  className={cn(
                    "size-4 sm:size-5 shrink-0",
                    section.completed ? "text-green-500" : "text-gray-600"
                  )}
                />
                <span className="text-gray-300 text-xs sm:text-sm">{section.name}</span>
              </div>
            ))}
          </div>

          {/* Content Section */}
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-6 lg:gap-8">
            {/* Left - Profile Completion */}
            <div className="border border-white/10 rounded-xl p-5 bg-black/60 min-w-fit">
              <p className="text-gray-400 text-xs sm:text-sm mb-2">Profile Completion</p>
              <p className="text-red-500 text-2xl sm:text-3xl font-bold mb-3 font-orbitron">
                {profileCompletion}%
              </p>
              <div className="w-full sm:w-48 rounded-full h-2 overflow-hidden bg-gray-800">
                <div
                  className="bg-red-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${profileCompletion}%` }}
                />
              </div>
            </div>

            {/* Middle - Dynamic Tier Badge */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2.5 mb-2">
                <div
                  className={cn(
                    "size-2.5 rounded-full animate-pulse",
                    isGold ? "bg-yellow-500" : isSilver ? "bg-slate-300" : "bg-orange-500"
                  )}
                />
                <span
                  className={cn(
                    "font-bold text-xs sm:text-sm tracking-widest font-orbitron",
                    isGold ? "text-yellow-500" : isSilver ? "text-slate-300" : "text-orange-400"
                  )}
                >
                  {tierBadgeLabel}
                </span>
              </div>
              <p className="text-gray-300 text-xs sm:text-sm leading-relaxed">
                {tierDescription}
              </p>
            </div>

            {/* Right - Action Buttons */}
            <div className="flex flex-col sm:flex-row lg:flex-col gap-3 min-w-fit">
              <button
                type="button"
                onClick={() => router.push("/dashboard/player/my-cv")}
                className="px-5 py-2.5 border border-gray-600 text-white rounded-xl hover:border-gray-400 transition flex items-center justify-center gap-2 text-xs font-orbitron uppercase tracking-wider cursor-pointer"
              >
                <Download className="size-4 text-red-500" />
                Download PDF
              </button>
              {/* <button
                type="button"
                onClick={handleShareWithAgent}
                className="px-5 py-2.5 border border-gray-600 text-white rounded-xl hover:border-gray-400 transition flex items-center justify-center gap-2 text-xs font-orbitron uppercase tracking-wider cursor-pointer"
              >
                <Share2 className="size-4 text-red-500" />
                Share with Agent
              </button> */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CVSection;
