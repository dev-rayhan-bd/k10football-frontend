/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import React from "react";
import { FileText, Heart, Lock, ShieldCheck } from "lucide-react";
import Image from "next/image";
import clubLogo from "@/assets/cvs/club1.png";
import { useRouter } from "next/navigation";
import { useGetMySubscriptionQuery } from "@/redux/features/subscription/subscriptionApi";
import { useGetMyAcademyHomepageQuery } from "@/redux/features/academy/academyApi";
import { useGetMyGameReportsQuery } from "@/redux/features/player/playerApi";
import { usePlayer } from "@/hooks/usePlayer";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

const RightSideContent = () => {
  const router = useRouter();
  const { cvData } = usePlayer();
  const { data: subscriptionResponse } = useGetMySubscriptionQuery();
  const { data: academyHomepageResponse } = useGetMyAcademyHomepageQuery();
  const { data: gameReportsResponse, isLoading: isGameReportsLoading } = useGetMyGameReportsQuery({ page: 1, limit: 5 });

  const affiliatedAcademy = academyHomepageResponse?.data?.academyInfo;
  const hasActiveSubscription = Boolean(subscriptionResponse?.data?.hasActiveSubscription);

  // Real DB Game Reports (GET /players/me/game-reports with fallback to cvData.recentMatches)
  const apiReports = gameReportsResponse?.data?.reports || [];
  const rawReports =
    apiReports.length > 0
      ? apiReports
      : Array.isArray(cvData?.recentMatches)
        ? cvData.recentMatches
        : [];

  const gameReports = rawReports.slice(0, 3).map((r: any, idx: number) => {
    const rawRating = r.rating ?? r.scoutRating ?? r.playerRating ?? r.rating10;
    const formattedRating =
      typeof rawRating === "number" && !isNaN(rawRating)
        ? Number.isInteger(rawRating)
          ? rawRating.toString()
          : rawRating.toFixed(1)
        : rawRating || "-";
    return {
      id: r._id || r.reportId || r.id || idx,
      opponent:
        r.title ||
        r.report ||
        (r.awayTeam ? `vs ${r.awayTeam}` : r.homeTeam ? `vs ${r.homeTeam}` : "Match Report"),
      rating: formattedRating,
    };
  });

  // Real DB Clubs Interested (from GET /players/me & GET /players/me/cv -> clubsInterested)
  const rawClubsInterested = Array.isArray(cvData?.clubsInterested)
    ? cvData.clubsInterested
    : [];

  const clubsInterested = rawClubsInterested.slice(0, 5).map((item: any, idx: number) => {
    if (typeof item === "string") {
      return {
        id: `${item}-${idx}`,
        name: item,
        subtitle: "Interested in your profile",
        logo: clubLogo,
      };
    }
    const logoCandidate =
      item?.logo ||
      item?.clubLogo ||
      item?.avatar ||
      item?.club?.logo ||
      item?.club?.clubLogo ||
      item?.club?.avatar;

    return {
      id: item?._id || item?.id || item?.clubId || idx,
      name:
        item?.clubName ||
        item?.name ||
        item?.club?.clubName ||
        item?.club?.name ||
        "Club",
      subtitle:
        item?.subtitle ||
        item?.action ||
        item?.status ||
        "Viewed your profile",
      logo:
        typeof logoCandidate === "string" && logoCandidate.trim()
          ? logoCandidate.trim()
          : clubLogo,
    };
  });

  // Real DB Overview Stats
  const profileViews = Number(
    cvData?.overviewStats?.profileViews ?? cvData?.profileViews ?? 0
  );
  const totalLikes = Number(
    cvData?.overviewStats?.totalLikes ?? cvData?.totalLikes ?? 0
  );
  const totalReports = Number(
    gameReportsResponse?.data?.summary?.totalReports ??
      cvData?.overviewStats?.reports ??
      cvData?.totalReports ??
      cvData?.performanceStats?.reports ??
      rawReports.length ??
      0
  );

  const stats = [
    { label: "Profile Views", value: String(profileViews), color: "text-gray-400" },
    { label: "Total Likes", value: String(totalLikes), color: "text-red-500" },
    { label: "Reports", value: String(totalReports), color: "text-green-500" },
  ];

  return (
    <div className="flex flex-col gap-4 sm:gap-6">
      {/* Affiliated Academy Card (if connected) */}
      {affiliatedAcademy && (
        <div className="border border-primary/20 rounded-2xl p-4 sm:p-5 bg-black/40 backdrop-blur-xs shadow-xl flex items-center gap-3.5">
          <div className="size-12 rounded-xl bg-black/60 border border-white/10 p-1.5 flex items-center justify-center shrink-0 overflow-hidden">
            <Image
              src={affiliatedAcademy.logo || clubLogo}
              alt={affiliatedAcademy.name || "Academy"}
              width={48}
              height={48}
              unoptimized={typeof affiliatedAcademy.logo === "string" && affiliatedAcademy.logo.startsWith("http")}
              className="size-full object-contain"
              onError={(e) => {
                const target = e.currentTarget as HTMLImageElement;
                target.src = "/placeholder_img.jpg";
              }}
            />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-[10px] font-bold text-primary uppercase tracking-widest font-orbitron">
              Affiliated Academy
            </span>
            <p className="text-white font-bold text-sm truncate">
              {affiliatedAcademy.name}
            </p>
            <p className="text-gray-400 text-[11px] truncate">
              {affiliatedAcademy.category || affiliatedAcademy.location}
            </p>
          </div>
        </div>
      )}

      {/* Scout & Agent Exposure Card */}
      <div className="border border-white/10 rounded-2xl p-4 sm:p-6 bg-black/40 backdrop-blur-xs shadow-xl">
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5">
            <div
              className={cn(
                "size-8 rounded-lg flex items-center justify-center shrink-0",
                hasActiveSubscription ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-500"
              )}
            >
              {hasActiveSubscription ? <ShieldCheck className="size-4" /> : <Lock className="size-4" />}
            </div>
            <div>
              <h3 className="text-white text-xs sm:text-sm font-heading uppercase">Scout Exposure</h3>
              <p className="text-[10px] text-gray-400">Agent & Club Discovery</p>
            </div>
          </div>
          <span
            className={cn(
              "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase font-orbitron",
              hasActiveSubscription
                ? "bg-green-500/10 text-green-400 border border-green-500/20"
                : "bg-red-500/10 text-red-400 border border-red-500/20"
            )}
          >
            {hasActiveSubscription ? "Active" : "Locked"}
          </span>
        </div>
        <p className="text-[11px] text-gray-400 leading-relaxed mb-3">
          {hasActiveSubscription
            ? "Your profile is active in verified scouting pools, club radars, and agent discovery algorithms."
            : "Profile hidden from scouting algorithms & featured recommendation lists on Free plan."}
        </p>
        {!hasActiveSubscription && (
          <button
            onClick={() => router.push("/dashboard/player/my-subscription")}
            className="w-full py-2 rounded-lg bg-red-600/10 hover:bg-red-600/20 border border-red-600/30 text-red-400 text-[10px] font-bold uppercase tracking-wider font-orbitron transition cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Lock className="size-3" />
            Unlock Scouting Exposure
          </button>
        )}
      </div>

      {/* New Game Reports */}
      <div className="border border-white/10 rounded-2xl p-4 sm:p-6 bg-black/40 backdrop-blur-xs shadow-xl">
        <div className="flex items-center gap-3 mb-4 sm:mb-6">
          <div className="size-9 sm:size-10 bg-red-600 rounded-xl flex items-center justify-center shrink-0">
            <FileText className="size-5 sm:size-6 text-white" />
          </div>
          <h2 className="text-white font-heading text-base sm:text-lg uppercase">New Game Reports</h2>
        </div>

        <div className="flex flex-col gap-3">
          {isGameReportsLoading &&
            Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-12 rounded-xl bg-white/5" />
            ))}
          {!isGameReportsLoading && gameReports.map((report: any) => (
            <div
              key={report.id}
              onClick={() => router.push("/dashboard/player/game-reports")}
              className="border border-white/10 rounded-xl p-3.5 flex items-center justify-between hover:bg-white/5 transition-all cursor-pointer"
            >
              <div className="flex items-center gap-3 min-w-0">
                <FileText className="size-4 text-red-500 shrink-0" />
                <span className="text-gray-300 text-xs sm:text-sm font-medium truncate">
                  {report.opponent}
                </span>
              </div>
              <span className="text-white font-bold text-sm sm:text-base font-orbitron shrink-0 ml-2">
                {report.rating}
              </span>
            </div>
          ))}
          {!isGameReportsLoading && gameReports.length === 0 && (
            <p className="text-gray-500 text-xs italic text-center py-2">
              No recent game reports available.
            </p>
          )}
        </div>
      </div>

      {/* Clubs Interested */}
      <div className="border border-white/10 rounded-2xl p-4 sm:p-6 bg-black/40 backdrop-blur-xs shadow-xl">
        <div className="flex items-center gap-3 mb-4 sm:mb-6">
          <div className="size-9 sm:size-10 bg-red-600 rounded-xl flex items-center justify-center shrink-0">
            <Heart className="size-5 sm:size-6 text-white fill-white" />
          </div>
          <h2 className="text-white font-heading text-base sm:text-lg uppercase">Clubs Interested</h2>
        </div>

        <div className="flex flex-col gap-3">
          {clubsInterested.map((club: any) => (
            <div
              key={club.id}
              className="border border-white/10 rounded-xl p-3.5 flex items-center gap-3 sm:gap-4 hover:bg-white/5 transition-all"
            >
              <Image
                src={club.logo}
                alt={club.name}
                width={48}
                height={48}
                unoptimized={typeof club.logo === "string" && club.logo.startsWith("http")}
                className="size-10 sm:size-12 rounded-full object-contain shrink-0"
              />
              <div className="flex-1 min-w-0">
                <p className="text-white font-semibold text-xs sm:text-sm truncate">{club.name}</p>
                <p className="text-gray-400 text-[10px] sm:text-xs truncate">{club.subtitle}</p>
              </div>
            </div>
          ))}
          {clubsInterested.length === 0 && (
            <p className="text-gray-500 text-xs italic text-center py-2">
              No clubs have expressed interest yet.
            </p>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="border border-white/10 rounded-2xl p-4 sm:p-6 bg-black/40 backdrop-blur-xs shadow-xl">
        <h2 className="text-white text-base sm:text-lg mb-4 font-orbitron uppercase">Overview Stats</h2>
        <div className="grid grid-cols-3 gap-2 text-center">
          {stats.map((s) => (
            <div key={s.label} className="bg-white/5 border border-white/5 p-3 rounded-xl">
              <p className={cn("text-lg sm:text-xl font-bold font-orbitron mb-1", s.color)}>
                {s.value}
              </p>
              <p className="text-[9px] sm:text-[10px] text-gray-400 uppercase tracking-wider">
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RightSideContent;
