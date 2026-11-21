/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React from "react";
import Image from "next/image";
import CMSField from "@/components/shared/CMSField";
import { getFullWithShortForm } from "@/lib/utils";
import { getFlagUrl } from "./bioConstants";
import { EditableImage } from "./EditableImage";
import { PlayerStylesSection } from "./PlayerStylesSection";
import { POSITION_DROPDOWN_OPTIONS } from "@/constants/positionAttributes";

interface PlayerCenterCardProps {
  playerData: any;
  handleUpdate: (field: string, value: any, file?: File) => void;
  canEditBio: boolean;
  canEditEvaluation: boolean;
  editable: boolean;
}

export const PlayerCenterCard = ({
  playerData,
  handleUpdate,
  canEditBio,
  canEditEvaluation,
  editable,
}: PlayerCenterCardProps) => {
  return (
    <div className="order-3 xl:order-0 xl:col-start-5 xl:col-span-4 xl:row-start-1 xl:row-span-2 flex flex-col items-center w-full min-w-0 overflow-hidden">
      {/* Player Name & Flags */}
      <div className="text-center mb-6 sm:mb-8 w-full min-w-0">
        <div className="flex items-center mb-6 sm:mb-8 justify-center w-full min-w-0">
          {playerData.birthCountry && getFlagUrl(playerData.birthCountry) ? (
            <div className="relative w-24 h-16 sm:w-32 sm:h-20 shrink-0">
              <Image
                src={getFlagUrl(playerData.birthCountry)}
                alt="Birth Country"
                width={200}
                height={200}
                className="object-cover rounded shadow-lg border border-border"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.srcset = "";
                  target.src = "/placeholder_img.jpg";
                }}
              />
              {playerData.dualNationality && getFlagUrl(playerData.dualNationality) ? (
                <div className="absolute -bottom-2 -right-2 w-10 h-6 sm:w-12 sm:h-8 border-2 border-white rounded shadow-md overflow-hidden">
                  <Image
                    src={getFlagUrl(playerData.dualNationality)}
                    alt="Dual Nationality"
                    width={200}
                    height={200}
                    className="object-cover rounded shadow-lg border border-border"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.srcset = "";
                      target.src = "/placeholder_img.jpg";
                    }}
                  />
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
        <h1 className="text-xl sm:text-2xl font-bold font-heading mb-2 flex flex-wrap items-center justify-center gap-2 w-full min-w-0">
          <CMSField
            value={playerData.fullName}
            onUpdate={(val) => handleUpdate("fullName", val)}
            canEdit={canEditBio}
            className="text-xl sm:text-2xl font-bold font-heading min-w-0 justify-center"
            inputClassName="text-center w-full min-w-0"
          />
          <span className="text-green-500 shrink-0">[{playerData.age}]</span>
        </h1>
      </div>

      {/* Position Combobox */}
      <div className="mb-6 sm:mb-8 w-full min-w-0 px-2 sm:px-0 flex justify-center">
        <CMSField
          value={getFullWithShortForm(playerData.position)}
          onUpdate={(val) => handleUpdate("position", val)}
          canEdit={canEditBio}
          type="combobox"
          options={POSITION_DROPDOWN_OPTIONS}
          className="flex items-center justify-center gap-2 border border-border px-3 sm:px-4 py-2 rounded hover:bg-gray-900 bg-transparent text-foreground h-auto w-full sm:w-fit max-w-full mx-auto min-w-0"
          inputClassName="w-full text-center sm:text-left text-xs sm:text-sm truncate min-w-0"
        />
      </div>

      {/* Player Image */}
      <div className="relative w-full h-75 sm:h-100 md:h-130.75 mb-6 sm:mb-8 flex items-end justify-center min-w-0 overflow-hidden">
        <EditableImage
          src={playerData.playerImage}
          alt={playerData.fullName}
          className="object-contain w-auto mx-auto h-70 sm:h-95 md:h-125 max-w-full"
          width={800}
          height={1000}
          field="playerImage"
          editable={editable}
          canEditEvaluation={canEditEvaluation}
          onUpdate={handleUpdate}
        />
      </div>

      {/* Player Style Section */}
      <PlayerStylesSection
        playerData={playerData}
        handleUpdate={handleUpdate}
        canEditBio={canEditBio}
      />
    </div>
  );
};
