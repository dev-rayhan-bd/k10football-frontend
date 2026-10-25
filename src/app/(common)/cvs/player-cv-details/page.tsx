"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import ImageCarousel from "@/components/common/ImageCarousel";
import StartJourneySection from "@/components/common/StartJourneySection";
import FullEditablePage from "@/components/cvs/player-cv-details/FullEditablePage";
import PlayerCvViewPage from "@/components/cvs/player-cv-view/PlayerCvViewPage";

const PlayerCvDetailsContent = () => {
  const searchParams = useSearchParams();
  const playerId = searchParams.get("playerId");

  return (
    <>
      {playerId ? (
        <PlayerCvViewPage playerId={playerId} />
      ) : (
        <FullEditablePage editable={true} />
      )}
      <ImageCarousel />
      <StartJourneySection />
    </>
  );
};

const PlayerCvDetailsPage = () => {
  return (
    <Suspense
      fallback={
        <div className="w-full min-h-[50vh] flex items-center justify-center">
          <div className="size-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        </div>
      }
    >
      <PlayerCvDetailsContent />
    </Suspense>
  );
};

export default PlayerCvDetailsPage;
