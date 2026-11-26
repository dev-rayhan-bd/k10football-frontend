"use client";

import { useGetPlayerCvByIdQuery, useGetSharedPlayerCvQuery } from "@/redux/features/player/playerApi";
import { PlayerCvViewProvider } from "./PlayerCvViewContext";
import { ViewPlayerBioSection } from "./ViewPlayerBioSection";
import { ViewClubSection } from "./ViewClubSection";
import { ViewSkillAttributeSection } from "./ViewSkillAttributeSection";
import { ViewPerformanceAnalytics } from "./ViewPerformanceAnalytics";
import { ViewAttributeAnalysis } from "./ViewAttributeAnalysis";
import { ViewMetricsAnalysis } from "./ViewMetricsAnalysis";
import { ViewSportsAnalytics } from "./ViewSportsAnalytics";
import { ViewPlayerProfile } from "./ViewPlayerProfile";
import { ViewDocSection } from "./ViewDocSection";
import { ViewMyImageSection } from "./ViewMyImageSection";
import { ViewMyVideoSection } from "./ViewMyVideoSection";
import { ViewAdditionalNotesSection } from "./ViewAdditionalNotesSection";
import { IconAlertCircle, IconRefresh } from "@tabler/icons-react";
import { Skeleton } from "@/components/ui/skeleton";

interface PlayerCvViewPageProps {
  playerId: string;
  /** "share": public shared link — loads GET /players/share/:playerId. */
  source?: "cv" | "share";
}

const PlayerCvViewSkeleton = () => {
  return (
    <div className="w-full min-w-0 overflow-hidden px-2 sm:px-4 md:px-0 flex flex-col gap-10 py-6 animate-pulse">
      {/* Top Bio Section Skeleton */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 sm:gap-6 w-full min-w-0">
        <div className="xl:col-span-4 flex flex-col gap-4">
          <div className="bg-cardBg rounded-2xl border border-white/10 p-6 flex flex-col gap-4">
            <Skeleton className="h-6 w-40 bg-white/10 rounded-md" />
            <div className="flex flex-col gap-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex justify-between items-center">
                  <Skeleton className="h-4 w-24 bg-white/5 rounded" />
                  <Skeleton className="h-4 w-32 bg-white/10 rounded" />
                </div>
              ))}
            </div>
          </div>
          <div className="bg-cardBg rounded-2xl border border-white/10 p-6 flex flex-col gap-4">
            <Skeleton className="h-6 w-32 bg-white/10 rounded-md" />
            <div className="flex flex-col gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex justify-between items-center">
                  <Skeleton className="h-4 w-20 bg-white/5 rounded" />
                  <Skeleton className="h-4 w-24 bg-white/10 rounded" />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="xl:col-span-4 bg-cardBg rounded-2xl border border-white/10 p-6 flex flex-col items-center justify-between min-h-[500px]">
          <Skeleton className="h-6 w-36 bg-white/10 rounded-md" />
          <Skeleton className="size-48 rounded-full bg-white/5 border border-white/10" />
          <div className="flex flex-col items-center gap-2 w-full">
            <Skeleton className="h-7 w-48 bg-white/10 rounded" />
            <Skeleton className="h-4 w-28 bg-white/5 rounded" />
          </div>
        </div>

        <div className="xl:col-span-4 flex flex-col gap-4">
          <div className="bg-cardBg rounded-2xl border border-white/10 p-6 flex flex-col items-center gap-4">
            <Skeleton className="size-56 rounded-2xl bg-white/10" />
            <Skeleton className="h-5 w-44 bg-white/10 rounded" />
          </div>
        </div>
      </div>

      {/* Clubs Section Skeleton */}
      <div className="w-full p-6 sm:p-10 bg-cardBg rounded-xl border border-white/10 flex flex-col gap-6">
        <Skeleton className="h-8 w-32 mx-auto bg-white/10 rounded" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-black/20 border border-white/10 rounded-xl p-6 flex flex-col items-center gap-3">
              <Skeleton className="size-16 rounded-full bg-white/10" />
              <Skeleton className="h-5 w-28 bg-white/10 rounded" />
              <Skeleton className="h-4 w-20 bg-white/5 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const PlayerCvViewPage = ({ playerId, source = "cv" }: PlayerCvViewPageProps) => {
  // GET /players/:playerId/cv, or the public GET /players/share/:playerId for shared links.
  const cvQuery = useGetPlayerCvByIdQuery(playerId, { skip: !playerId || source === "share" });
  const sharedQuery = useGetSharedPlayerCvQuery(playerId, { skip: !playerId || source !== "share" });
  const { data: playerCvResponse, isLoading, isError, refetch } = source === "share" ? sharedQuery : cvQuery;

  if (isLoading) {
    return <PlayerCvViewSkeleton />;
  }

  if (isError || !playerCvResponse?.data) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center border border-dashed border-destructive/30 rounded-3xl bg-[#0D0D0D] my-8 max-w-2xl mx-auto">
        <div className="size-14 rounded-2xl bg-destructive/10 border border-destructive/20 flex items-center justify-center text-destructive mb-4">
          <IconAlertCircle className="size-7" />
        </div>
        <h2 className="text-xl font-bold text-foreground uppercase italic tracking-tight mb-2">
          Failed to Load Player CV
        </h2>
        <p className="text-muted-foreground text-sm max-w-md mb-6">
          We encountered an error while fetching player CV data. Please verify the player ID or check your connection.
        </p>
        <button
          onClick={() => refetch()}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
        >
          <IconRefresh className="size-4" />
          Retry
        </button>
      </div>
    );
  }

  return (
    <PlayerCvViewProvider apiData={playerCvResponse.data}>
      <div id="player-bio"></div>
      <ViewPlayerBioSection />
      <ViewClubSection />
      <ViewSkillAttributeSection />
      <ViewPerformanceAnalytics />
      <ViewAttributeAnalysis />
      <ViewMetricsAnalysis />
      <ViewSportsAnalytics />
      <ViewPlayerProfile />
      <ViewDocSection />
      <ViewMyImageSection />
      <ViewMyVideoSection />
      <ViewAdditionalNotesSection />
    </PlayerCvViewProvider>
  );
};

export default PlayerCvViewPage;
