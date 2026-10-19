/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React from "react";
import { DesktopCertificateCard } from "./DesktopCertificateCard";
import { StrengthSection } from "./StrengthSection";
import { CareerAndStatsSection } from "./CareerAndStatsSection";

interface RightColumnBioCardProps {
  playerData: any;
  handleUpdate: (field: string, value: any) => void;
  updatePlayerProfile: (data: any) => Promise<any>;
  dispatch: any;
  canEditBio: boolean;
  canEditEvaluation: boolean;
}

export const RightColumnBioCard = ({
  playerData,
  handleUpdate,
  updatePlayerProfile,
  dispatch,
  canEditBio,
  canEditEvaluation,
}: RightColumnBioCardProps) => {
  return (
    <div className="order-5 xl:order-0 xl:col-start-9 xl:col-span-4 xl:row-start-1 xl:row-span-2 space-y-4 sm:space-y-6 bg-cardBg rounded-2xl sm:rounded-3xl w-full min-w-0 overflow-hidden h-fit">
      <DesktopCertificateCard playerData={playerData} />
      <StrengthSection
        playerData={playerData}
        updatePlayerProfile={updatePlayerProfile}
        dispatch={dispatch}
        canEditEvaluation={canEditEvaluation}
      />
      <CareerAndStatsSection
        playerData={playerData}
        handleUpdate={handleUpdate}
        canEditBio={canEditBio}
        canEditEvaluation={canEditEvaluation}
      />
    </div>
  );
};
