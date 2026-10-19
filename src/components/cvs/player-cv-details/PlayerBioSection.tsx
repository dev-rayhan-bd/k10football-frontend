/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import React, { useEffect } from "react";
import { usePlayer } from "@/hooks/usePlayer";
import { usePlayerStats } from "./FullEditablePage";
import { PlayerBadgeSVG } from "./bio-components/PlayerBadgeSVG";
import { PersonalInfoContactCard } from "./bio-components/PersonalInfoContactCard";
import { PhysicalStatsLanguagesCard } from "./bio-components/PhysicalStatsLanguagesCard";
import { PlayerCenterCard } from "./bio-components/PlayerCenterCard";
import { RightColumnBioCard } from "./bio-components/RightColumnBioCard";

const PlayerBioSection = ({ editable = true }: { editable?: boolean }) => {
  const { playerData, handleUpdate, updatePlayerProfile, dispatch } = usePlayer();
  const { setBioRating, role } = usePlayerStats();

  const canEditBio =
    editable && (role === "player" || role === "parent" || role === "coach");
  const canEditEvaluation =
    editable && (role === "player" || role === "parent" || role === "coach");

  useEffect(() => {
    setBioRating(playerData.rating);
  }, [playerData.rating, setBioRating]);

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

        {/* PART 1: Personal Info & Contact (Above Image on mobile, Left Col Top on desktop) */}
        <PersonalInfoContactCard
          playerData={playerData}
          handleUpdate={handleUpdate}
          canEditBio={canEditBio}
        />

        {/* PART 2: Physical, Languages, Map (Below Image on mobile, Left Col Bottom on desktop) */}
        <PhysicalStatsLanguagesCard
          playerData={playerData}
          handleUpdate={handleUpdate}
          canEditBio={canEditBio}
        />

        {/* CENTER COLUMN: Flags, Name, Image, Styles */}
        <PlayerCenterCard
          playerData={playerData}
          handleUpdate={handleUpdate}
          canEditBio={canEditBio}
          canEditEvaluation={canEditEvaluation}
          editable={editable}
        />

        {/* RIGHT COLUMN: Desktop Certificate, Strength Sliders, Career & Season Stats */}
        <RightColumnBioCard
          playerData={playerData}
          handleUpdate={handleUpdate}
          updatePlayerProfile={updatePlayerProfile}
          dispatch={dispatch}
          canEditBio={canEditBio}
          canEditEvaluation={canEditEvaluation}
        />
      </div>
    </div>
  );
};

export default PlayerBioSection;
