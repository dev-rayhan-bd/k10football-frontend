/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React from "react";
import Image from "next/image";
import CMSField from "@/components/shared/CMSField";
import { ALL_COUNTRIES, getFlagUrl } from "./bioConstants";

interface PersonalInfoContactCardProps {
  playerData: any;
  handleUpdate: (field: string, value: any) => void;
  canEditBio: boolean;
}

export const PersonalInfoContactCard = ({
  playerData,
  handleUpdate,
  canEditBio,
}: PersonalInfoContactCardProps) => {
  return (
    <div className="order-2 xl:order-0 xl:col-start-1 xl:col-span-4 xl:row-start-1 bg-cardBg rounded-2xl xl:rounded-t-3xl xl:rounded-b-none border border-white/10 xl:border-b-0 overflow-hidden w-full min-w-0 flex flex-col space-y-4 sm:space-y-6 h-fit">
      <div className="p-4 sm:p-6 w-full min-w-0">
        <h2 className="text-base sm:text-lg text-center font-heading font-normal mb-4 text-white">
          Personal Information
        </h2>
        <div className="space-y-3 text-xs sm:text-sm w-full min-w-0 uppercase">
          <div className="flex justify-between items-center gap-2 w-full min-w-0">
            <span className="text-gray-400 shrink-0">Full Name</span>
            <CMSField
              value={playerData.fullName}
              onUpdate={(val) => handleUpdate("fullName", val)}
              canEdit={canEditBio}
              className="flex-1 min-w-0 justify-end"
              inputClassName="uppercase text-right w-full min-w-0 truncate"
            />
          </div>
          <div className="flex justify-between items-center gap-2 w-full min-w-0">
            <span className="text-gray-400 shrink-0">Date of Birth</span>
            <CMSField
              value={playerData.dob}
              type="date"
              onUpdate={(val) => {
                handleUpdate("dob", val);
              }}
              canEdit={canEditBio}
              className="flex-1 min-w-0 justify-end"
              inputClassName="uppercase text-right w-full min-w-0 bg-gray-900/50 border-gray-700 focus:border-primary transition-all px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-[10px] sm:text-sm"
            />
          </div>
          <div className="flex justify-between items-center gap-2 w-full min-w-0">
            <span className="text-gray-400 shrink-0">Age</span>
            <div className="flex items-center gap-1 shrink-0">
              <CMSField
                value={playerData.age ?? 0}
                type="number"
                min={1}
                max={100}
                onUpdate={(val) => {
                  const parsed = parseInt(String(val), 10);
                  if (!Number.isNaN(parsed) && parsed > 0) {
                    handleUpdate("age", parsed);
                  }
                }}
                canEdit={canEditBio}
                className="w-16 justify-end"
                inputClassName="text-right w-full text-white"
              />
              <span className="text-gray-400 text-xs sm:text-sm">Years</span>
            </div>
          </div>
          <div className="flex justify-between items-center gap-2 w-full min-w-0">
            <span className="text-gray-400 shrink-0">Birth Country</span>
            <div className="flex items-center gap-2 min-w-0">
              <CMSField
                value={playerData.birthCountry || (canEditBio ? "Select Country" : "-")}
                onUpdate={(val) => handleUpdate("birthCountry", val === "Select Country" ? "" : val)}
                canEdit={canEditBio}
                type="combobox"
                options={ALL_COUNTRIES}
                className="w-auto min-w-24 sm:min-w-32 justify-end"
                inputClassName="uppercase text-right w-full min-w-0 truncate text-[10px] sm:text-sm"
              />
              {playerData.birthCountry && getFlagUrl(playerData.birthCountry) ? (
                <div className="relative w-5 h-3.5 sm:w-6 sm:h-4 overflow-hidden rounded-sm border border-border shrink-0">
                  <Image
                    src={getFlagUrl(playerData.birthCountry)}
                    alt="birth country flag"
                    fill
                    className="object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.srcset = "";
                      target.src = "/placeholder_img.jpg";
                    }}
                  />
                </div>
              ) : null}
            </div>
          </div>
          <div className="flex justify-between items-center gap-2 w-full min-w-0">
            <span className="text-gray-400 shrink-0">Dual Nationality</span>
            <div className="flex items-center gap-2 min-w-0">
              <CMSField
                value={playerData.dualNationality || (canEditBio ? "None" : "-")}
                onUpdate={(val) => handleUpdate("dualNationality", val === "None" ? "" : val)}
                canEdit={canEditBio}
                type="combobox"
                options={ALL_COUNTRIES}
                className="w-auto min-w-24 sm:min-w-32 justify-end"
                inputClassName="uppercase text-right w-full min-w-0 truncate text-[10px] sm:text-sm"
              />
              {playerData.dualNationality && getFlagUrl(playerData.dualNationality) ? (
                <div className="relative w-5 h-3.5 sm:w-6 sm:h-4 overflow-hidden rounded-sm border border-border shrink-0">
                  <Image
                    src={getFlagUrl(playerData.dualNationality)}
                    alt="dual nationality flag"
                    fill
                    className="object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.srcset = "";
                      target.src = "/placeholder_img.jpg";
                    }}
                  />
                </div>
              ) : null}
            </div>
          </div>
          <div className="flex justify-between items-center gap-2 w-full min-w-0">
            <span className="text-gray-400 shrink-0">Academy</span>
            <CMSField
              value={playerData.academyName || "N/A"}
              onUpdate={(val) => handleUpdate("academyName", val)}
              canEdit={canEditBio}
              className="flex-1 min-w-0 justify-end"
              inputClassName="uppercase text-right w-full min-w-0 truncate"
            />
          </div>
          <div className="flex justify-between items-center gap-2 w-full min-w-0">
            <span className="text-gray-400 shrink-0">Coach</span>
            <CMSField
              value={playerData.coachName || "N/A"}
              onUpdate={(val) => handleUpdate("coachName", val)}
              canEdit={canEditBio}
              className="flex-1 min-w-0 justify-end"
              inputClassName="uppercase text-right w-full min-w-0 truncate"
            />
          </div>
          <div className="flex justify-between items-center gap-2 w-full min-w-0">
            <span className="text-gray-400 shrink-0">Club Managed</span>
            <CMSField
              value={playerData.clubManaged || "N/A"}
              onUpdate={(val) => handleUpdate("clubManaged", val)}
              canEdit={canEditBio}
              className="flex-1 min-w-0 justify-end"
              inputClassName="uppercase text-right w-full min-w-0 truncate"
            />
          </div>
        </div>
      </div>
      <div className="p-4 sm:p-6 border-t border-white/5 w-full min-w-0">
        <h2 className="text-base sm:text-lg text-center font-heading font-normal mb-4 text-white">
          Contact
        </h2>
        <div className="space-y-2 text-xs sm:text-sm text-primary w-full min-w-0">
          <div className="flex items-center gap-2 w-full min-w-0">
            <span className="shrink-0">📧</span>
            <CMSField
              value={playerData.email}
              onUpdate={() => {}}
              canEdit={false}
              className="flex-1 min-w-0 cursor-default"
              inputClassName="w-full min-w-0 truncate"
            />
          </div>
          <div className="flex items-center gap-2 w-full min-w-0">
            <span className="shrink-0">📱</span>
            <CMSField
              value={playerData.phone}
              onUpdate={(val) => handleUpdate("phone", val)}
              canEdit={canEditBio}
              className="flex-1 min-w-0"
              inputClassName="w-full min-w-0 truncate"
            />
          </div>
          <div className="flex items-center gap-2 w-full min-w-0">
            <span className="shrink-0">📍</span>
            <CMSField
              value={playerData.location}
              onUpdate={(val) => handleUpdate("location", val)}
              canEdit={canEditBio}
              className="flex-1 min-w-0"
              inputClassName="w-full min-w-0 truncate"
            />
          </div>
          <div className="flex items-center gap-2 w-full min-w-0">
            <span className="shrink-0">🌐</span>
            <CMSField
              value={playerData.website}
              onUpdate={(val) => handleUpdate("website", val)}
              canEdit={canEditBio}
              className="flex-1 min-w-0"
              inputClassName="w-full min-w-0 truncate text-primary hover:underline cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
