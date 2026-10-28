"use client";

import React, { Suspense } from "react";
import { useParams, useSearchParams } from "next/navigation";
import ClubPlayerCvPage from "@/components/user-wise-dashboard/club-dashboard/player-cv";
import { Skeleton } from "@/components/ui/skeleton";

const ClubPlayerCvContent = () => {
  const params = useParams();
  const searchParams = useSearchParams();

  const idFromParam = params?.id as string | undefined;
  const idFromQuery = searchParams.get("playerId");
  const playerId = idFromParam || idFromQuery || "";

  return <ClubPlayerCvPage playerId={playerId} />;
};

const ClubPlayerCvPageRoute = () => {
  return (
    <Suspense
      fallback={
        <div className="w-full min-h-[50vh] flex items-center justify-center">
          <Skeleton className="size-10 rounded-full" />
        </div>
      }
    >
      <ClubPlayerCvContent />
    </Suspense>
  );
};

export default ClubPlayerCvPageRoute;

