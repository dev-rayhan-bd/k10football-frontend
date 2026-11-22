/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import CMSField from "@/components/shared/CMSField";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { getIndicatorColor, getHexColor } from "./bioConstants";
import { PitchMapCard } from "./PitchMapCard";
import leftLegDefault from "@/assets/cvs/id/left_foot.png";
import rightLegDefault from "@/assets/cvs/id/right_foot.png";

interface PhysicalStatsLanguagesCardProps {
  playerData: any;
  handleUpdate: (field: string, value: any) => void;
  canEditBio: boolean;
}

export const PhysicalStatsLanguagesCard = ({
  playerData,
  handleUpdate,
  canEditBio,
}: PhysicalStatsLanguagesCardProps) => {
  const [leftLegDraft, setLeftLegDraft] = useState<number>(() => playerData.leftLegUsage ?? 50);
  const [rightLegDraft, setRightLegDraft] = useState<number>(() => playerData.rightLegUsage ?? 85);

  useEffect(() => {
    if (typeof playerData.leftLegUsage === "number") {
      setLeftLegDraft(playerData.leftLegUsage);
    }
  }, [playerData.leftLegUsage]);

  useEffect(() => {
    if (typeof playerData.rightLegUsage === "number") {
      setRightLegDraft(playerData.rightLegUsage);
    }
  }, [playerData.rightLegUsage]);

  const commitLeftLeg = (val: number) => {
    if (val !== playerData.leftLegUsage) {
      handleUpdate("leftLegUsage", val);
    }
  };

  const commitRightLeg = (val: number) => {
    if (val !== playerData.rightLegUsage) {
      handleUpdate("rightLegUsage", val);
    }
  };

  const leftLegSrc = playerData.leftLegImage || leftLegDefault;
  const rightLegSrc = playerData.rightLegImage || rightLegDefault;

  return (
    <div className="order-4 xl:order-0 xl:col-start-1 xl:col-span-4 xl:row-start-2 bg-cardBg rounded-2xl xl:rounded-b-3xl xl:rounded-t-none border border-white/10 xl:border-t-0 overflow-hidden w-full min-w-0 flex flex-col space-y-4 sm:space-y-6 h-fit">
      <div className="p-4 sm:p-6 border-t-0 xl:border-t xl:border-white/5 w-full min-w-0">
        <h2 className="text-base sm:text-lg text-center font-heading font-normal mb-4 text-white">
          Physical Stats
        </h2>
        <div className="flex justify-around text-center mb-6 w-full min-w-0">
          <div className="min-w-0">
            <CMSField
              value={playerData.height}
              onUpdate={(val) => handleUpdate("height", val)}
              canEdit={canEditBio}
              isNumeric
              className="text-xl sm:text-2xl font-bold text-primary justify-center min-w-0"
              inputClassName="text-center w-20 sm:w-24 h-8 sm:h-10 bg-gray-900/50 border-gray-700 focus:border-primary transition-all px-2 rounded-lg"
            />
            <div className="text-[10px] sm:text-xs text-gray-400">HEIGHT (cm)</div>
          </div>
          <div className="min-w-0">
            <CMSField
              value={playerData.weight}
              onUpdate={(val) => handleUpdate("weight", val)}
              canEdit={canEditBio}
              isNumeric
              className="text-xl sm:text-2xl font-bold text-primary justify-center min-w-0"
              inputClassName="text-center w-20 sm:w-24 h-8 sm:h-10 bg-gray-900/50 border-gray-700 focus:border-primary transition-all px-2 rounded-lg"
            />
            <div className="text-[10px] sm:text-xs text-gray-400">WEIGHT (kg)</div>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 w-full min-w-0">
          <div className="border border-white/10 bg-white/5 p-4 rounded-xl flex flex-col w-full min-w-0">
            <div className="flex justify-center items-center w-full mb-3 h-12 sm:h-16">
              <Image
                src={leftLegSrc}
                alt="left leg"
                className="object-contain size-12 sm:size-16 drop-shadow-md"
                width={80}
                height={80}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.srcset = "";
                  target.src = typeof leftLegDefault === "string" ? leftLegDefault : leftLegDefault.src;
                }}
              />
            </div>
            <div className="flex justify-between items-center text-xs sm:text-sm mb-2 w-full min-w-0">
              <span className="shrink-0 text-white">Left</span>
              <CMSField
                value={leftLegDraft}
                onUpdate={(val) => {
                  const num = parseInt(String(val)) || 0;
                  setLeftLegDraft(num);
                  commitLeftLeg(num);
                }}
                canEdit={canEditBio}
                type="number"
                editTrigger="doubleClick"
                className="text-primary justify-end w-24 sm:w-32 min-w-0 font-bold"
                inputClassName="text-right h-7 w-16 sm:w-20 bg-gray-900/50 border-gray-700 focus:border-primary transition-all px-2 rounded-md"
              />
            </div>
            {canEditBio ? (
              <div className="relative flex items-center h-2 group w-full">
                <div className="w-full h-1.5 bg-[#333] rounded-full overflow-hidden relative">
                  <div
                    className={cn(
                      "h-full transition-all duration-150 ease-out",
                      getIndicatorColor(leftLegDraft)
                    )}
                    style={{ width: `${leftLegDraft}%` }}
                  />
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={leftLegDraft}
                  onChange={(e) => setLeftLegDraft(parseInt(e.target.value))}
                  onPointerUp={(e) => commitLeftLeg(parseInt((e.target as HTMLInputElement).value))}
                  onTouchEnd={(e) => commitLeftLeg(parseInt((e.target as HTMLInputElement).value))}
                  onKeyUp={(e) => commitLeftLeg(parseInt((e.target as HTMLInputElement).value))}
                  style={{
                    background: `linear-gradient(to right, ${getHexColor(
                      leftLegDraft
                    )} ${leftLegDraft}% , #333 ${
                      leftLegDraft
                    }%)`,
                  }}
                  className="w-full h-4 rounded-full appearance-none cursor-pointer transition-all absolute inset-0 opacity-0 group-hover:opacity-100 accent-primary"
                />
              </div>
            ) : (
              <Progress
                value={leftLegDraft}
                style={{ backgroundColor: "#333" }}
                indicatorClassName="bg-green-500"
              />
            )}
          </div>
          <div className="border border-white/10 bg-white/5 p-4 rounded-xl flex flex-col w-full min-w-0">
            <div className="flex justify-center items-center w-full mb-3 h-12 sm:h-16">
              <Image
                src={rightLegSrc}
                alt="right leg"
                className="object-contain size-12 sm:size-16 drop-shadow-md"
                width={80}
                height={80}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.srcset = "";
                  target.src = typeof rightLegDefault === "string" ? rightLegDefault : rightLegDefault.src;
                }}
              />
            </div>
            <div className="flex justify-between items-center text-xs sm:text-sm mb-1 w-full min-w-0">
              <span className="shrink-0 text-white">Right</span>
              <CMSField
                value={rightLegDraft}
                onUpdate={(val) => {
                  const num = parseInt(String(val)) || 0;
                  setRightLegDraft(num);
                  commitRightLeg(num);
                }}
                canEdit={canEditBio}
                type="number"
                editTrigger="doubleClick"
                className="text-primary justify-end w-24 sm:w-32 min-w-0"
                inputClassName="text-right h-7 w-16 sm:w-20 bg-gray-900/50 border-gray-700 focus:border-primary transition-all px-2 rounded-md"
              />
            </div>
            {canEditBio ? (
              <div className="relative flex items-center h-2 group translate-y-1.25 w-full">
                <div className="w-full h-1.5 bg-[#333] rounded-full overflow-hidden relative">
                  <div
                    className={cn(
                      "h-full transition-all duration-150 ease-out",
                      getIndicatorColor(rightLegDraft)
                    )}
                    style={{ width: `${rightLegDraft}%` }}
                  />
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={rightLegDraft}
                  onChange={(e) => setRightLegDraft(parseInt(e.target.value))}
                  onPointerUp={(e) => commitRightLeg(parseInt((e.target as HTMLInputElement).value))}
                  onTouchEnd={(e) => commitRightLeg(parseInt((e.target as HTMLInputElement).value))}
                  onKeyUp={(e) => commitRightLeg(parseInt((e.target as HTMLInputElement).value))}
                  style={{
                    background: `linear-gradient(to right, ${getHexColor(
                      rightLegDraft
                    )} ${rightLegDraft}%, #333 ${
                      rightLegDraft
                    }%)`,
                  }}
                  className="w-full h-4 rounded-full appearance-none cursor-pointer transition-all absolute inset-0 opacity-0 group-hover:opacity-100 accent-primary"
                />
              </div>
            ) : (
              <Progress
                value={rightLegDraft}
                style={{ backgroundColor: "#333" }}
                indicatorClassName="bg-green-500"
              />
            )}
          </div>
        </div>
      </div>
      <div className="p-4 sm:p-6 border-t border-white/5 w-full min-w-0">
        <h2 className="text-base sm:text-lg text-center font-heading font-normal mb-4 text-white">
          Languages
        </h2>
        <div className="space-y-3 w-full min-w-0">
          {playerData.languages.map((lang: any, idx: number) => (
            <div
              key={idx}
              className="flex justify-between items-center p-2 sm:p-3 bg-black/20 border border-border/50 rounded-lg group hover:bg-black/40 transition-all w-full min-w-0 gap-2"
            >
              <CMSField
                value={lang.name}
                onUpdate={(val) => handleUpdate(`languages.${idx}.name`, val)}
                canEdit={canEditBio}
                className="flex-1 min-w-0 font-medium text-gray-200"
                inputClassName="w-full min-w-0 truncate text-xs sm:text-sm"
              />
              <CMSField
                value={lang.level || "Fluent"}
                onUpdate={(val) => handleUpdate(`languages.${idx}.level`, val)}
                canEdit={canEditBio}
                type="select"
                options={["Native", "Fluent", "Intermediate", "Beginner"]}
                className="w-24 sm:w-32 justify-end shrink-0"
                inputClassName="text-right text-primary font-bold text-[10px] sm:text-sm w-full truncate"
                hideIcon={true}
              />
            </div>
          ))}
        </div>
      </div>
      {/* Position & Futsal Map */}
      <PitchMapCard
        playerData={playerData}
        handleUpdate={handleUpdate}
        canEditBio={canEditBio}
      />
    </div>
  );
};
