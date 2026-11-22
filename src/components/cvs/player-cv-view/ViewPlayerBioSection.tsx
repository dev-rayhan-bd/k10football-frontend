/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from "react";
import { usePlayerCvView } from "./PlayerCvViewContext";
import { PlayerBadgeSVG } from "../player-cv-details/bio-components/PlayerBadgeSVG";
import { PersonalInfoContactCard } from "../player-cv-details/bio-components/PersonalInfoContactCard";
import { PhysicalStatsLanguagesCard } from "../player-cv-details/bio-components/PhysicalStatsLanguagesCard";
import { PlayerCenterCard } from "../player-cv-details/bio-components/PlayerCenterCard";
import { RightColumnBioCard } from "../player-cv-details/bio-components/RightColumnBioCard";

const noop = () => {};
const noopAsync = async () => {};

export const ViewPlayerBioSection = () => {
  const { playerData } = usePlayerCvView();

  return (
    <div className="w-full min-w-0 overflow-hidden px-2 sm:px-4 md:px-0">
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 sm:gap-6 xl:gap-y-0 w-full min-w-0">
        {/* MOBILE ONLY: VERIFIED BADGE */}
        <div className="block xl:hidden order-1 col-span-1 w-full min-w-0">
          <PlayerBadgeSVG
            playerData={playerData}
            className="bg-cardBg rounded-2xl sm:rounded-3xl border border-white/10 overflow-hidden w-full"
          />
        </div>

        {/* LEFT COLUMN TOP: Personal Info & Contact (Read-Only, matches Player Dashboard CV) */}
        <PersonalInfoContactCard
          playerData={playerData}
          handleUpdate={noop}
          canEditBio={false}
        />

        {/* LEFT COLUMN BOTTOM: Physical Stats, Languages & Pitch/Futsal Position Maps (Read-Only) */}
        <PhysicalStatsLanguagesCard
          playerData={playerData}
          handleUpdate={noop}
          canEditBio={false}
        />

        {/* CENTER COLUMN: Flags, Name, Position, Player Image & Player Styles with Icons (Read-Only) */}
        <PlayerCenterCard
          playerData={playerData}
          handleUpdate={noop}
          canEditBio={false}
          canEditEvaluation={false}
          editable={false}
        />

        {/* RIGHT COLUMN: Certificate, Strengths, Market Value, Transfer Status, Accomplishments & Season Stats (Read-Only) */}
        <RightColumnBioCard
          playerData={playerData}
          handleUpdate={noop}
          updatePlayerProfile={noopAsync}
          dispatch={noop}
          canEditBio={false}
          canEditEvaluation={false}
        />
      </div>
    </div>
  );
};
