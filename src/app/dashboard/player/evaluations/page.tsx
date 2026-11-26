"use client";

import { Suspense } from "react";
import PlayerEvaluations from "@/components/user-wise-dashboard/player-dashboard/evaluations/PlayerEvaluations";

const PlayerEvaluationsPage = () => {
  return (
    <Suspense>
      <PlayerEvaluations />
    </Suspense>
  );
};

export default PlayerEvaluationsPage;
