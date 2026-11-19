/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React from "react";
import Image from "next/image";
import CMSField from "@/components/shared/CMSField";
import trofeeIcon from "@/assets/cvs/id/trofeeIcon.png";
import { formatDate } from "@/lib/utils";

interface CareerAndStatsSectionProps {
  playerData: any;
  handleUpdate: (field: string, value: any) => void;
  canEditBio: boolean;
  canEditEvaluation: boolean;
}

export const CareerAndStatsSection = ({
  playerData,
  handleUpdate,
  canEditBio,
  canEditEvaluation,
}: CareerAndStatsSectionProps) => {
  return (
    <>
      {/* Market Value */}
      <div className="p-4 sm:p-6 border-t border-white/5 w-full min-w-0">
        <h2 className="text-base sm:text-lg text-center font-heading font-normal mb-4 text-white">
          Market Value
        </h2>
        <div className="mb-4 w-full min-w-0">
          <CMSField
            value={playerData.marketValue}
            onUpdate={(val) => handleUpdate("marketValue", val)}
            canEdit={canEditBio}
            className="text-2xl sm:text-3xl font-bold text-primary mb-1 justify-center w-full min-w-0"
            inputClassName="text-xl sm:text-3xl font-bold h-10 sm:h-12 text-center w-full min-w-0"
          />
          <p className="text-[10px] sm:text-xs text-center text-gray-400">
            Current Market Value
          </p>
          <CMSField
            value={playerData.marketTrend}
            onUpdate={(val) => handleUpdate("marketTrend", val)}
            canEdit={canEditBio}
            className="text-[10px] sm:text-xs text-primary mt-2 justify-center w-full min-w-0"
            inputClassName="h-7 text-[10px] sm:text-xs text-center w-full min-w-0"
          />
        </div>
      </div>

      {/* Transfer Status */}
      <div className="p-4 sm:p-6 border-t border-white/5 w-full min-w-0">
        <div className="flex justify-between items-center mb-4 w-full min-w-0 gap-2">
          <h2 className="text-base sm:text-lg text-center font-heading font-normal text-white">
            Transfer Status
          </h2>
          <CMSField
            value={playerData.transferStatus || "Available for Loan / Transfer"}
            type="select"
            options={[
              "Available for Loan / Transfer",
              "Available for Loan",
              "Available for Transfer",
              "Under Contract",
              "Free Agent",
            ]}
            onUpdate={(val) => handleUpdate("transferStatus", String(val))}
            canEdit={canEditBio}
            className="text-[10px] sm:text-xs bg-primary text-black px-2.5 py-1 rounded font-bold shrink-0 cursor-pointer"
            inputClassName="text-[10px] sm:text-xs text-white"
          />
        </div>
        <div className="space-y-3 text-xs sm:text-sm w-full min-w-0">
          <div className="flex justify-between items-center w-full min-w-0 gap-2">
            <span className="text-gray-400 shrink-0">Contract Until</span>
            <CMSField
              value={formatDate(playerData.contractUntil)}
              onUpdate={(val) => handleUpdate("contractUntil", val)}
              canEdit={canEditBio}
              className="w-24 sm:w-28 justify-end min-w-0"
              inputClassName="text-right w-full min-w-0 truncate"
            />
          </div>
          <div className="flex justify-between items-center w-full min-w-0 gap-2">
            <span className="text-gray-400 shrink-0">Agent</span>
            <CMSField
              value={playerData.agent}
              onUpdate={(val) => handleUpdate("agent", val)}
              canEdit={canEditBio}
              className="w-24 sm:w-28 justify-end min-w-0"
              inputClassName="text-right w-full min-w-0 truncate"
            />
          </div>
          <div className="flex justify-between items-center w-full min-w-0 gap-2">
            <span className="text-gray-400 shrink-0">Agency</span>
            <CMSField
              value={playerData.agency}
              onUpdate={(val) => handleUpdate("agency", val)}
              canEdit={canEditBio}
              className="w-24 sm:w-28 justify-end min-w-0"
              inputClassName="text-right w-full min-w-0 truncate"
            />
          </div>
        </div>
      </div>

      {/* Accomplishments */}
      <div className="p-4 sm:p-6 border-t border-white/5 w-full min-w-0">
        <h2 className="text-base sm:text-lg text-center font-heading font-normal mb-4 text-white">
          Accomplishments
        </h2>
        <div className="space-y-4 sm:space-y-6 border-l-2 border-green-600 pl-3 sm:pl-4 mt-4 sm:mt-6 w-full min-w-0">
          {playerData.careerHighlights.map((highlight: any, idx: number) => (
            <div
              key={idx}
              className="flex gap-3 sm:gap-4 items-center w-full min-w-0"
            >
              <div className="relative size-8 sm:size-10 shrink-0 flex items-center justify-center">
                <Image
                  src={trofeeIcon}
                  alt="Achievement"
                  width={36}
                  height={36}
                  className="object-contain drop-shadow-md w-full h-full"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.srcset = "";
                    target.src = "/placeholder_img.jpg";
                  }}
                />
              </div>
              <div className="flex flex-col gap-0.5 w-full min-w-0">
                <CMSField
                  value={highlight.year}
                  onUpdate={(val) =>
                    handleUpdate(`careerHighlights.${idx}.year`, val)
                  }
                  canEdit={canEditBio}
                  type="textarea"
                  className="text-[10px] sm:text-xs font-black text-primary/80 tracking-widest leading-relaxed uppercase w-full min-w-0"
                  inputClassName="text-[10px] sm:text-xs font-black min-h-[30px] py-0.5 uppercase w-full min-w-0"
                />
                <CMSField
                  value={highlight.title}
                  onUpdate={(val) =>
                    handleUpdate(`careerHighlights.${idx}.title`, val)
                  }
                  canEdit={canEditBio}
                  type="textarea"
                  className="text-xs sm:text-sm md:text-base text-gray-400 leading-relaxed tracking-tight uppercase w-full min-w-0"
                  inputClassName="text-sm sm:text-base font-black min-h-[40px] py-1 uppercase w-full min-w-0"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Current Season Stats */}
      <div className="p-4 sm:p-6 border-t border-white/5 w-full min-w-0">
        <h2 className="text-base sm:text-lg text-center font-heading font-normal mb-4 sm:mb-6 text-white">
          Current Season Stats
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:gap-4 w-full min-w-0">
          <div className="text-center w-full min-w-0 border border-white/10 bg-white/5 rounded-xl p-2 sm:p-4">
            <CMSField
              value={playerData.seasonStats.matches}
              onUpdate={(val) => handleUpdate("seasonStats.matches", val)}
              canEdit={canEditEvaluation}
              isNumeric
              className="text-xl sm:text-3xl font-bold text-primary justify-center min-w-0"
              inputClassName="text-center w-16 sm:w-24 h-8 sm:h-10 bg-gray-900/50 border-gray-700 focus:border-primary transition-all px-2 rounded-lg"
            />
            <div className="text-[10px] sm:text-xs text-gray-400 mt-1 truncate">
              MATCHES
            </div>
          </div>
          <div className="text-center w-full min-w-0 border border-white/10 bg-white/5 rounded-xl p-2 sm:p-4">
            <CMSField
              value={playerData.seasonStats.goals}
              onUpdate={(val) => handleUpdate("seasonStats.goals", val)}
              canEdit={canEditEvaluation}
              isNumeric
              className="text-xl sm:text-3xl font-bold text-primary justify-center min-w-0"
              inputClassName="text-center w-16 sm:w-24 h-8 sm:h-10 bg-gray-900/50 border-gray-700 focus:border-primary transition-all px-2 rounded-lg"
            />
            <div className="text-[10px] sm:text-xs text-gray-400 mt-1 truncate">
              GOALS
            </div>
          </div>
          <div className="text-center w-full min-w-0 border border-white/10 bg-white/5 rounded-xl p-2 sm:p-4">
            <CMSField
              value={playerData.seasonStats.assists}
              onUpdate={(val) => handleUpdate("seasonStats.assists", val)}
              canEdit={canEditEvaluation}
              isNumeric
              className="text-xl sm:text-3xl font-bold text-primary justify-center min-w-0"
              inputClassName="text-center w-16 sm:w-24 h-8 sm:h-10 bg-gray-900/50 border-gray-700 focus:border-primary transition-all px-2 rounded-lg"
            />
            <div className="text-[10px] sm:text-xs text-gray-400 mt-1 truncate">
              ASSISTS
            </div>
          </div>
          <div className="text-center w-full min-w-0 border border-white/10 bg-white/5 rounded-xl p-2 sm:p-4">
            <CMSField
              value={playerData.seasonStats.avgRating}
              onUpdate={(val) => handleUpdate("seasonStats.avgRating", val)}
              canEdit={canEditEvaluation}
              isNumeric
              className="text-xl sm:text-3xl font-bold text-primary justify-center min-w-0"
              inputClassName="text-center w-16 sm:w-24 h-8 sm:h-10 bg-gray-900/50 border-gray-700 focus:border-primary transition-all px-2 rounded-lg"
            />
            <div className="text-[10px] sm:text-xs text-gray-400 mt-1 truncate">
              AVG RATING
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
