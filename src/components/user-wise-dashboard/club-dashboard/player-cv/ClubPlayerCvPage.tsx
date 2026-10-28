"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useGetPlayerCvByIdQuery } from "@/redux/features/player/playerApi";
import { useToggleScoutingBoardFavouriteMutation } from "@/redux/features/club/clubApi";
import { ClubPlayerCvProvider } from "./ClubPlayerCvContext";
import { ClubPlayerBioSection } from "./ClubPlayerBioSection";
import { ClubClubSection } from "./ClubClubSection";
import { ClubSkillAttributeSection } from "./ClubSkillAttributeSection";
import { ClubPerformanceAnalytics } from "./ClubPerformanceAnalytics";
import { ClubAttributeAnalysis } from "./ClubAttributeAnalysis";
import { ClubMetricsAnalysis } from "./ClubMetricsAnalysis";
import { ClubSportsAnalytics } from "./ClubSportsAnalytics";
import { ClubPlayerProfile } from "./ClubPlayerProfile";
import { ClubDocSection } from "./ClubDocSection";
import { ClubMyImageSection } from "./ClubMyImageSection";
import { ClubMyVideoSection } from "./ClubMyVideoSection";
import { ClubAdditionalNotesSection } from "./ClubAdditionalNotesSection";
import {
  IconArrowLeft,
  IconHeart,
  IconHeartFilled,
  IconShare,
  IconAlertCircle,
  IconRefresh,
} from "@tabler/icons-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface ClubPlayerCvPageProps {
  playerId: string;
}

const ClubPlayerCvSkeleton = () => {
  return (
    <div className="w-full min-w-0 overflow-hidden flex flex-col gap-8 py-4 animate-pulse">
      {/* Top Header Skeleton */}
      <div className="flex items-center justify-between pb-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <Skeleton className="size-10 rounded-xl bg-white/10" />
          <Skeleton className="h-6 w-32 bg-white/10 rounded-md" />
          <Skeleton className="h-6 w-20 bg-white/10 rounded-full" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="size-10 rounded-xl bg-white/10" />
          <Skeleton className="size-10 rounded-xl bg-white/10" />
        </div>
      </div>

      {/* Bio Grid Skeleton */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 w-full">
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
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex justify-between items-center">
                  <Skeleton className="h-4 w-20 bg-white/5 rounded" />
                  <Skeleton className="h-4 w-24 bg-white/10 rounded" />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="xl:col-span-4 bg-cardBg rounded-2xl border border-white/10 p-6 flex flex-col items-center justify-between min-h-[460px]">
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
    </div>
  );
};

export const ClubPlayerCvPage = ({ playerId }: ClubPlayerCvPageProps) => {
  const router = useRouter();

  const {
    data: playerCvResponse,
    isLoading,
    isError,
    refetch,
  } = useGetPlayerCvByIdQuery(playerId, {
    skip: !playerId,
  });

  const [toggleFav, { isLoading: isTogglingFav }] = useToggleScoutingBoardFavouriteMutation();
  const [isFavLocal, setIsFavLocal] = React.useState<boolean | null>(null);

  const cvData = playerCvResponse?.data;
  const isFavourite = isFavLocal !== null ? isFavLocal : Boolean(cvData?.isFavourite);

  const handleToggleFavourite = async () => {
    const nextState = !isFavourite;
    setIsFavLocal(nextState);
    try {
      const res = await toggleFav({
        targetType: "PLAYER",
        targetId: playerId,
      }).unwrap();
      const finalVal = res?.data?.isFavourite ?? nextState;
      setIsFavLocal(finalVal);
      toast.success(
        finalVal
          ? "Player added to scouting favorites"
          : "Player removed from scouting favorites"
      );
    } catch {
      setIsFavLocal(!nextState);
      toast.error("Failed to update favorite status");
    }
  };

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Player profile link copied to clipboard");
    }
  };

  if (isLoading) {
    return <ClubPlayerCvSkeleton />;
  }

  if (isError || !cvData) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center border border-dashed border-destructive/30 rounded-3xl bg-[#0D0D0D] my-8 max-w-2xl mx-auto">
        <div className="size-14 rounded-2xl bg-destructive/10 border border-destructive/20 flex items-center justify-center text-destructive mb-4">
          <IconAlertCircle className="size-7" />
        </div>
        <h2 className="text-xl font-bold text-foreground uppercase italic tracking-tight mb-2">
          Failed to Load Player CV
        </h2>
        <p className="text-muted-foreground text-sm max-w-md mb-6">
          We encountered an error while fetching player CV data for the club dashboard. Please verify the player ID or check your connection.
        </p>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => router.push("/dashboard/club/scouting-board")}
            className="flex items-center gap-2 cursor-pointer"
          >
            <IconArrowLeft className="size-4" />
            Back to Scouting Board
          </Button>
          <Button
            onClick={() => refetch()}
            className="flex items-center gap-2 cursor-pointer"
          >
            <IconRefresh className="size-4" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  const rating = cvData.overallRating ?? 80;
  const tierName = rating >= 80 ? "GOLD" : rating >= 60 ? "SILVER" : "BRONZE";

  return (
    <ClubPlayerCvProvider apiData={cvData} playerId={playerId} initialFavourite={isFavourite}>
      <div className="w-full flex flex-col gap-6 pb-12 min-w-0">
        {/* Dashboard-level top bar for Player CV */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-3 border-b border-white/10">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/dashboard/club/scouting-board")}
              className="size-10 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-muted-foreground hover:text-foreground transition-all cursor-pointer shrink-0"
              title="Back to Scouting Board"
            >
              <IconArrowLeft className="size-5" />
            </button>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-black uppercase text-foreground tracking-tight font-orbitron truncate">
                  {cvData.fullName || "Player Profile"}
                </h1>
                <Badge variant="outline" className="border-primary/40 text-primary uppercase font-bold text-[10px]">
                  {tierName} CV
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Club Dashboard • Scouting Board
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-end">
            <Button
              variant="outline"
              size="icon"
              onClick={handleToggleFavourite}
              disabled={isTogglingFav}
              className="size-10 rounded-xl bg-white/5 border-white/10 hover:bg-white/10 cursor-pointer"
              title={isFavourite ? "Remove from Favorites" : "Add to Favorites"}
            >
              {isFavourite ? (
                <IconHeartFilled className="size-5 text-destructive" />
              ) : (
                <IconHeart className="size-5 text-muted-foreground hover:text-foreground" />
              )}
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={handleShare}
              className="size-10 rounded-xl bg-white/5 border-white/10 hover:bg-white/10 cursor-pointer text-muted-foreground hover:text-foreground"
              title="Share Player Profile"
            >
              <IconShare className="size-5" />
            </Button>
            <Button
              variant="default"
              onClick={() => router.push("/dashboard/club/scouting-board")}
              className="cursor-pointer text-xs font-bold uppercase tracking-wider"
            >
              Back to Board
            </Button>
          </div>
        </div>

        {/* Separated Player CV sections for club */}
        <ClubPlayerBioSection />
        <ClubClubSection />
        <ClubSkillAttributeSection />
        <ClubPerformanceAnalytics />
        <ClubAttributeAnalysis />
        <ClubMetricsAnalysis />
        <ClubSportsAnalytics />
        <ClubPlayerProfile />
        <ClubDocSection />
        <ClubMyImageSection />
        <ClubMyVideoSection />
        <ClubAdditionalNotesSection />
      </div>
    </ClubPlayerCvProvider>
  );
};

export default ClubPlayerCvPage;
