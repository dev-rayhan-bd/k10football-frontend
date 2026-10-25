/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from "react";
import Image from "next/image";
import { useCoachPlayerCv } from "./CoachPlayerCvContext";
import { CoachPlayerBadge } from "./CoachPlayerBadge";
import { CoachCertificateCard } from "./CoachCertificateCard";
import { getFullWithShortForm } from "@/lib/utils";
import leftLeg from "@/assets/cvs/id/left_foot.png";
import rightLeg from "@/assets/cvs/id/right_foot.png";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { IconShieldCheck, IconUserCheck } from "@tabler/icons-react";

// Independent flag helper
const COUNTRY_CODES: Record<string, string> = {
  bangladesh: "bd",
  spain: "es",
  france: "fr",
  italy: "it",
  germany: "de",
  england: "gb",
  brazil: "br",
  argentina: "ar",
  portugal: "pt",
  netherlands: "nl",
  belgium: "be",
  nigeria: "ng",
  ghana: "gh",
  senegal: "sn",
  morocco: "ma",
  usa: "us",
  canada: "ca",
  japan: "jp",
  "south korea": "kr",
  australia: "au",
};

const getCountryFlagUrl = (countryName: string) => {
  if (!countryName) return "";
  const code = COUNTRY_CODES[countryName.toLowerCase()] || countryName.slice(0, 2).toLowerCase();
  return `https://flagcdn.com/w160/${code}.png`;
};

export const CoachPlayerBioSection = () => {
  const { playerData } = useCoachPlayerCv();

  return (
    <div className="w-full min-w-0 overflow-hidden px-2 sm:px-4 md:px-0">
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 sm:gap-6 xl:gap-y-0 w-full min-w-0">
        {/* MOBILE ONLY: VERIFIED BADGE */}
        <div className="block xl:hidden order-1 col-span-1 w-full min-w-0">
          <CoachPlayerBadge
            playerData={playerData}
            className="bg-cardBg rounded-2xl sm:rounded-3xl border border-white/10 overflow-hidden w-full"
          />
        </div>

        {/* LEFT COLUMN TOP: Personal Info & Contact */}
        <div className="order-2 xl:order-0 xl:col-start-1 xl:col-span-4 xl:row-start-1 bg-cardBg rounded-2xl xl:rounded-t-3xl xl:rounded-b-none border border-white/10 xl:border-b-0 overflow-hidden w-full min-w-0 flex flex-col gap-4 sm:gap-6 h-fit">
          <div className="p-4 sm:p-6 w-full min-w-0">
            <h2 className="text-base sm:text-lg text-center font-heading font-normal mb-4 text-white">
              Personal Information
            </h2>
            <div className="flex flex-col gap-3 text-xs sm:text-sm w-full min-w-0">
              <div className="flex justify-between items-center gap-2 w-full min-w-0">
                <span className="text-gray-400 shrink-0">Full Name</span>
                <span className="text-white font-medium truncate text-right">
                  {playerData.fullName}
                </span>
              </div>
              <div className="flex justify-between items-center gap-2 w-full min-w-0">
                <span className="text-gray-400 shrink-0">Date of Birth</span>
                <span className="text-white font-medium text-right">{playerData.dob}</span>
              </div>
              <div className="flex justify-between items-center gap-2 w-full min-w-0">
                <span className="text-gray-400 shrink-0">Age</span>
                <span className="text-white font-medium text-right">{playerData.age} Years</span>
              </div>
              <div className="flex justify-between items-center gap-2 w-full min-w-0">
                <span className="text-gray-400 shrink-0">Birth Country</span>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-white">{playerData.birthCountry}</span>
                  <div className="relative size-4 sm:w-5 sm:h-3.5 overflow-hidden rounded-sm border border-border shrink-0">
                    <Image
                      src={getCountryFlagUrl(playerData.birthCountry)}
                      alt={playerData.birthCountry}
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
              </div>
              {playerData.dualNationality && (
                <div className="flex justify-between items-center gap-2 w-full min-w-0">
                  <span className="text-gray-400 shrink-0">Dual Nationality</span>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-white">{playerData.dualNationality}</span>
                    <div className="relative size-4 sm:w-5 sm:h-3.5 overflow-hidden rounded-sm border border-border shrink-0">
                      <Image
                        src={getCountryFlagUrl(playerData.dualNationality)}
                        alt={playerData.dualNationality}
                        fill
                        className="object-cover"
                      />
                    </div>
                  </div>
                </div>
              )}
              <div className="flex justify-between items-center gap-2 w-full min-w-0">
                <span className="text-gray-400 shrink-0">Email</span>
                <span className="text-white font-medium truncate text-right">
                  {playerData.email || "Private (Contact Academy)"}
                </span>
              </div>
              <div className="flex justify-between items-center gap-2 w-full min-w-0">
                <span className="text-gray-400 shrink-0">Phone</span>
                <span className="text-white font-medium text-right">
                  {playerData.phone || "Private"}
                </span>
              </div>
              <div className="flex justify-between items-center gap-2 w-full min-w-0">
                <span className="text-gray-400 shrink-0">Location</span>
                <span className="text-white font-medium truncate text-right">
                  {playerData.location}
                </span>
              </div>
              {playerData.website && (
                <div className="flex justify-between items-center gap-2 w-full min-w-0">
                  <span className="text-gray-400 shrink-0">Website</span>
                  <a
                    href={
                      playerData.website.startsWith("http")
                        ? playerData.website
                        : `https://${playerData.website}`
                    }
                    target="_blank"
                    rel="noreferrer"
                    className="text-primary hover:underline truncate text-right"
                  >
                    {playerData.website}
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* CENTER COLUMN: Hero profile image, name & badge */}
        <div className="order-4 xl:order-0 xl:col-start-5 xl:col-span-4 xl:row-start-1 xl:row-span-2 bg-cardBg rounded-2xl xl:rounded-3xl border border-white/10 overflow-hidden w-full min-w-0 flex flex-col justify-between p-4 sm:p-6 lg:p-8">
          <div className="flex flex-col items-center text-center w-full min-w-0">
            <h1 className="text-2xl sm:text-3xl font-heading font-medium tracking-wide uppercase text-white truncate max-w-full">
              {playerData.fullName}
            </h1>
            <p className="text-xs sm:text-sm text-gray-400 mt-1 uppercase tracking-wider">
              {getFullWithShortForm(playerData.position)}
            </p>

            {/* Coach View Status Pill */}
            <div className="mt-3">
              {playerData.isVerifiedByCoach ? (
                <Badge variant="outline" className="border-green-500/30 bg-green-500/10 text-green-400 gap-1.5 py-1 px-3 text-xs">
                  <IconShieldCheck className="size-3.5" />
                  Coach Verified
                </Badge>
              ) : (
                <Badge variant="outline" className="border-yellow-500/30 bg-yellow-500/10 text-yellow-400 gap-1.5 py-1 px-3 text-xs">
                  <IconUserCheck className="size-3.5" />
                  Pending Validation
                </Badge>
              )}
            </div>

            {/* Profile Avatar / Photo */}
            <div className="relative size-44 sm:size-56 md:size-64 my-6 sm:my-8 rounded-full border-4 border-primary/20 overflow-hidden shadow-2xl bg-black/40">
              <Image
                src={playerData.playerImage || playerData.profileImage}
                alt={playerData.fullName}
                fill
                className="object-cover"
              />
            </div>

            {/* Rating & CV Tier */}
            <div className="flex items-center justify-center gap-6 w-full pt-4 border-t border-white/10">
              <div className="flex flex-col items-center">
                <span className="text-[10px] sm:text-xs text-gray-400 uppercase tracking-widest font-bold">
                  Overall Rating
                </span>
                <span className="text-2xl sm:text-3xl font-heading font-black text-primary">
                  {playerData.rating}
                </span>
              </div>
              <div className="h-8 w-px bg-white/10" />
              <div className="flex flex-col items-center">
                <span className="text-[10px] sm:text-xs text-gray-400 uppercase tracking-widest font-bold">
                  CV Tier
                </span>
                <span className="text-2xl sm:text-3xl font-heading font-black text-yellow-400">
                  {playerData.rawCvData?.cvTier || "BRONZE"}
                </span>
              </div>
              <div className="h-8 w-px bg-white/10" />
              <div className="flex flex-col items-center">
                <span className="text-[10px] sm:text-xs text-gray-400 uppercase tracking-widest font-bold">
                  Jersey No
                </span>
                <span className="text-2xl sm:text-3xl font-heading font-black text-white">
                  #{playerData.jerseyNumber || 10}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN TOP: Desktop Certificate Card */}
        <div className="hidden xl:block order-0 xl:col-start-9 xl:col-span-4 xl:row-start-1 bg-cardBg rounded-t-3xl border border-white/10 border-b-0 overflow-hidden w-full min-w-0">
          <CoachCertificateCard playerData={playerData} />
        </div>

        {/* LEFT COLUMN BOTTOM: Physical Attributes & Foot Dominance */}
        <div className="order-3 xl:order-0 xl:col-start-1 xl:col-span-4 xl:row-start-2 bg-cardBg rounded-2xl xl:rounded-b-3xl xl:rounded-t-none border border-white/10 xl:border-t-0 overflow-hidden w-full min-w-0 flex flex-col gap-4 sm:gap-6 h-fit">
          <div className="p-4 sm:p-6 w-full min-w-0">
            <h2 className="text-base sm:text-lg text-center font-heading font-normal mb-4 text-white">
              Physical & Athletic Profile
            </h2>
            <div className="flex flex-col gap-3 text-xs sm:text-sm w-full min-w-0">
              <div className="flex justify-between items-center gap-2 w-full min-w-0">
                <span className="text-gray-400 shrink-0">Height</span>
                <span className="text-white font-medium text-right">{playerData.height} cm</span>
              </div>
              <div className="flex justify-between items-center gap-2 w-full min-w-0">
                <span className="text-gray-400 shrink-0">Weight</span>
                <span className="text-white font-medium text-right">{playerData.weight} kg</span>
              </div>
              <div className="flex justify-between items-center gap-2 w-full min-w-0">
                <span className="text-gray-400 shrink-0">Preferred Foot</span>
                <span className="text-white font-medium text-right uppercase">
                  {playerData.rawCvData?.preferredFoot || "BOTH"}
                </span>
              </div>

              {/* Foot Dominance Progress */}
              <div className="pt-3 border-t border-white/10 flex flex-col gap-3">
                <div className="flex flex-col gap-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-400 flex items-center gap-1.5">
                      <Image src={leftLeg} alt="Left Foot" width={14} height={14} className="opacity-80" />
                      Left Foot Usage
                    </span>
                    <span className="text-white font-bold">{playerData.leftLegUsage}%</span>
                  </div>
                  <Progress value={playerData.leftLegUsage} className="h-1.5 bg-white/5" indicatorClassName="bg-primary" />
                </div>
                <div className="flex flex-col gap-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-400 flex items-center gap-1.5">
                      <Image src={rightLeg} alt="Right Foot" width={14} height={14} className="opacity-80" />
                      Right Foot Usage
                    </span>
                    <span className="text-white font-bold">{playerData.rightLegUsage}%</span>
                  </div>
                  <Progress value={playerData.rightLegUsage} className="h-1.5 bg-white/5" indicatorClassName="bg-green-500" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN BOTTOM: Contract & Representation Details */}
        <div className="order-5 xl:order-0 xl:col-start-9 xl:col-span-4 xl:row-start-2 bg-cardBg rounded-2xl xl:rounded-b-3xl xl:rounded-t-none border border-white/10 xl:border-t-0 overflow-hidden w-full min-w-0 flex flex-col gap-4 sm:gap-6 h-fit">
          <div className="p-4 sm:p-6 w-full min-w-0">
            <h2 className="text-base sm:text-lg text-center font-heading font-normal mb-4 text-white">
              Status & Representation
            </h2>
            <div className="flex flex-col gap-3 text-xs sm:text-sm w-full min-w-0">
              <div className="flex justify-between items-center gap-2 w-full min-w-0">
                <span className="text-gray-400 shrink-0">Current Club</span>
                <span className="text-white font-medium truncate text-right">
                  {playerData.currentClub}
                </span>
              </div>
              <div className="flex justify-between items-center gap-2 w-full min-w-0">
                <span className="text-gray-400 shrink-0">Transfer Status</span>
                <Badge variant="secondary" className="font-bold text-xs">
                  {playerData.transferStatus}
                </Badge>
              </div>
              <div className="flex justify-between items-center gap-2 w-full min-w-0">
                <span className="text-gray-400 shrink-0">Contract Until</span>
                <span className="text-white font-medium text-right">{playerData.contractUntil}</span>
              </div>
              <div className="flex justify-between items-center gap-2 w-full min-w-0">
                <span className="text-gray-400 shrink-0">Agent / Representative</span>
                <span className="text-white font-medium truncate text-right">
                  {playerData.agent}
                </span>
              </div>
              {playerData.agency && (
                <div className="flex justify-between items-center gap-2 w-full min-w-0">
                  <span className="text-gray-400 shrink-0">Agency</span>
                  <span className="text-white font-medium truncate text-right">
                    {playerData.agency}
                  </span>
                </div>
              )}
              <div className="flex justify-between items-center gap-2 w-full min-w-0">
                <span className="text-gray-400 shrink-0">Market Value</span>
                <span className="text-primary font-bold text-sm text-right">
                  {Number(playerData.marketValue) > 0 ? `€${Number(playerData.marketValue).toLocaleString()}` : "Evaluated by Coach"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
