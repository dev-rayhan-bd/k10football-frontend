"use client";

import { use } from "react";
import PlayerCvViewPage from "@/components/cvs/player-cv-view/PlayerCvViewPage";

interface SharedPlayerCvPageProps {
  params: Promise<{ playerId: string }>;
}

// Public shared player CV (link copied from Academy → CVs Library → Share). Works without login.
const SharedPlayerCvPage = ({ params }: SharedPlayerCvPageProps) => {
  const { playerId } = use(params);
  return (
    <div className="mx-auto w-full min-w-0 max-w-7xl px-4 py-8 sm:px-6">
      <PlayerCvViewPage playerId={playerId} source="share" />
    </div>
  );
};

export default SharedPlayerCvPage;
