"use client";

import React, { use } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { CoachPlayerCvContainer } from "@/components/user-wise-dashboard/coach-dashboard/player-cv/CoachPlayerCvContainer";

interface PageProps {
  params: Promise<{ playerId: string }>;
}

const CoachPlayerCvDetailsPage = ({ params }: PageProps) => {
  const resolvedParams = use(params);
  const routeParams = useParams();
  const searchParams = useSearchParams();

  const playerId =
    resolvedParams?.playerId ||
    (routeParams?.playerId as string) ||
    searchParams.get("playerId") ||
    "";

  if (!playerId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] text-center p-6">
        <p className="text-gray-400 text-sm">No player ID provided for evaluation.</p>
      </div>
    );
  }

  return <CoachPlayerCvContainer playerId={playerId} />;
};

export default CoachPlayerCvDetailsPage;
