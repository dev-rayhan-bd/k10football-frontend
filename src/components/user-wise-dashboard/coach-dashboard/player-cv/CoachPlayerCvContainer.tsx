/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useGetPlayerCvByIdQuery } from "@/redux/features/player/playerApi";
import { CoachPlayerCvProvider } from "./CoachPlayerCvContext";
import { CoachPlayerBioSection } from "./CoachPlayerBioSection";
import { CoachPlayerClubsSection } from "./CoachPlayerClubsSection";
import { CoachPlayerSkillsSection } from "./CoachPlayerSkillsSection";
import { CoachPlayerPerformanceSection } from "./CoachPlayerPerformanceSection";
import { CoachPlayerAttributesSection } from "./CoachPlayerAttributesSection";
import { CoachPlayerMetricsSection } from "./CoachPlayerMetricsSection";
import { CoachPlayerSportsSection } from "./CoachPlayerSportsSection";
import { CoachPlayerFifaCardSection } from "./CoachPlayerFifaCardSection";
import { CoachPlayerDocSection } from "./CoachPlayerDocSection";
import { CoachPlayerMediaSection } from "./CoachPlayerMediaSection";
import { CoachPlayerNotesSection } from "./CoachPlayerNotesSection";
import {
  IconArrowLeft,
  IconAlertCircle,
  IconRefresh,
  IconShieldCheck,
  IconCheck,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface CoachPlayerCvContainerProps {
  playerId: string;
}

const CoachPlayerCvSkeleton = () => {
  return (
    <div className="flex flex-col gap-8 pb-12 animate-pulse w-full">
      {/* Top bar skeleton */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div className="h-9 w-48 bg-white/10 rounded-xl" />
        <div className="h-10 w-36 bg-white/10 rounded-xl" />
      </div>

      {/* Bio Grid Skeleton */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 w-full">
        <div className="xl:col-span-4 bg-[#111] rounded-2xl border border-white/10 p-6 flex flex-col gap-4">
          <div className="h-6 w-40 bg-white/10 rounded" />
          <div className="flex flex-col gap-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex justify-between items-center">
                <div className="h-4 w-20 bg-white/5 rounded" />
                <div className="h-4 w-28 bg-white/10 rounded" />
              </div>
            ))}
          </div>
        </div>

        <div className="xl:col-span-4 bg-[#111] rounded-2xl border border-white/10 p-6 flex flex-col items-center justify-between min-h-[420px]">
          <div className="h-6 w-44 bg-white/10 rounded" />
          <div className="size-48 rounded-full bg-white/10 border border-white/10" />
          <div className="h-8 w-32 bg-white/10 rounded-lg" />
        </div>

        <div className="xl:col-span-4 bg-[#111] rounded-2xl border border-white/10 p-6 flex flex-col items-center justify-center">
          <div className="size-56 rounded-2xl bg-white/10" />
        </div>
      </div>

      {/* Clubs Skeleton */}
      <div className="p-8 bg-[#111] rounded-2xl border border-white/10 flex flex-col gap-6">
        <div className="h-7 w-32 mx-auto bg-white/10 rounded" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="bg-black/30 border border-white/10 rounded-xl p-6 flex flex-col items-center gap-3"
            >
              <div className="size-16 rounded-full bg-white/10" />
              <div className="h-5 w-28 bg-white/10 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const CoachPlayerCvContainer = ({ playerId }: CoachPlayerCvContainerProps) => {
  const router = useRouter();

  // API Call: GET {{baseUrl}}/players/:playerId/cv
  const {
    data: playerCvResponse,
    isLoading,
    isError,
    refetch,
  } = useGetPlayerCvByIdQuery(playerId, {
    skip: !playerId,
  });

  if (isLoading) {
    return <CoachPlayerCvSkeleton />;
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
          Could not retrieve player profile. Please ensure the player ID is correct and your coach session is active.
        </p>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => router.push("/dashboard/coach/player-cv-validations")}
            className="gap-2"
          >
            <IconArrowLeft className="size-4" />
            Back to Validations
          </Button>
          <Button onClick={() => refetch()} className="gap-2">
            <IconRefresh className="size-4" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  const cv = playerCvResponse.data;
  const isVerified = Boolean(cv.isVerifiedByCoach ?? cv.coachVerification?.isVerified);

  return (
    <CoachPlayerCvProvider apiData={cv}>
      <div className="flex flex-col gap-6 w-full min-w-0">
        {/* Coach Navigation Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/dashboard/coach/player-cv-validations")}
              className="gap-2 border-white/15 bg-white/5 hover:bg-white/10 text-white"
            >
              <IconArrowLeft className="size-4" />
              Back
            </Button>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase tracking-wider text-muted-foreground font-bold">
                  Coach Dashboard &gt; Validations &gt;
                </span>
                <span className="text-xs uppercase tracking-wider text-white font-bold truncate max-w-48 sm:max-w-none">
                  {cv.fullName || "Player"}
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-0.5">
                Player CV Evaluation
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isVerified ? (
              <Badge variant="outline" className="border-green-500/40 bg-green-500/10 text-green-400 py-1.5 px-3 text-xs gap-1.5 font-bold">
                <IconShieldCheck className="size-4" />
                Verified by Coach
              </Badge>
            ) : (
              <Button
                onClick={() => {
                  toast.success(`Validation confirmed for ${cv.fullName || "Player"}`);
                }}
                className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs uppercase tracking-wider shadow-lg"
              >
                <IconCheck className="size-4" />
                Validate Player CV
              </Button>
            )}
          </div>
        </div>

        {/* Coach Child Components */}
        <CoachPlayerBioSection />
        <CoachPlayerClubsSection />
        <CoachPlayerSkillsSection />
        <CoachPlayerPerformanceSection />
        <CoachPlayerAttributesSection />
        <CoachPlayerMetricsSection />
        <CoachPlayerSportsSection />
        <CoachPlayerFifaCardSection />
        <CoachPlayerDocSection />
        <CoachPlayerMediaSection />
        <CoachPlayerNotesSection />
      </div>
    </CoachPlayerCvProvider>
  );
};
