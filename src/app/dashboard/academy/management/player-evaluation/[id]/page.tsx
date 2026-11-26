import { Suspense } from "react";
import { PlayerEvaluationDetails } from "@/components/user-wise-dashboard/academy-analysis/player-evaluation/PlayerEvaluationDetails";

const PlayerEvaluationDetailsPage = () => {
  return (
    <Suspense>
      <PlayerEvaluationDetails />
    </Suspense>
  );
};

export default PlayerEvaluationDetailsPage;
