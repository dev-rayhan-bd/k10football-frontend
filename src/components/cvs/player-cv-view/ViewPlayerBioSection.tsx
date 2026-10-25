/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from "react";
import Image from "next/image";
import { usePlayerCvView } from "./PlayerCvViewContext";
import { PlayerBadgeSVG } from "../player-cv-details/bio-components/PlayerBadgeSVG";
import { DesktopCertificateCard } from "../player-cv-details/bio-components/DesktopCertificateCard";
import { getFlagUrl } from "../player-cv-details/bio-components/bioConstants";
import { getFullWithShortForm } from "@/lib/utils";
import leftLeg from "@/assets/cvs/id/left_foot.png";
import rightLeg from "@/assets/cvs/id/right_foot.png";
import futsalMap from "@/assets/cvs/id/Futsal Pitch.jpg";
import positionMap from "@/assets/cvs/id/position-map.png";
import { Progress } from "@/components/ui/progress";

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

        {/* LEFT COLUMN TOP: Personal Info & Contact */}
        <div className="order-2 xl:order-0 xl:col-start-1 xl:col-span-4 xl:row-start-1 bg-cardBg rounded-2xl xl:rounded-t-3xl xl:rounded-b-none border border-white/10 xl:border-b-0 overflow-hidden w-full min-w-0 flex flex-col space-y-4 sm:space-y-6 h-fit">
          <div className="p-4 sm:p-6 w-full min-w-0">
            <h2 className="text-base sm:text-lg text-center font-heading font-normal mb-4 text-white">
              Personal Information
            </h2>
            <div className="space-y-3 text-xs sm:text-sm w-full min-w-0">
              <div className="flex justify-between items-center gap-2 w-full min-w-0">
                <span className="text-gray-400 shrink-0">Full Name</span>
                <span className="text-white font-medium truncate text-right">{playerData.fullName}</span>
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
                      src={getFlagUrl(playerData.birthCountry)}
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
                        src={getFlagUrl(playerData.dualNationality)}
                        alt={playerData.dualNationality}
                        fill
                        className="object-cover"
                      />
                    </div>
                  </div>
                </div>
              )}
              <div className="flex justify-between items-center gap-2 w-full min-w-0">
                <span className="text-gray-400 shrink-0">Academy</span>
                <span className="text-white font-medium truncate text-right">{playerData.academyName}</span>
              </div>
              <div className="flex justify-between items-center gap-2 w-full min-w-0">
                <span className="text-gray-400 shrink-0">Coach</span>
                <span className="text-white font-medium truncate text-right">{playerData.coachName}</span>
              </div>
              <div className="flex justify-between items-center gap-2 w-full min-w-0">
                <span className="text-gray-400 shrink-0">Club Managed</span>
                <span className="text-white font-medium truncate text-right">{playerData.clubManaged}</span>
              </div>
              <div className="flex justify-between items-center gap-2 w-full min-w-0">
                <span className="text-gray-400 shrink-0">Coach License</span>
                <span className="text-white font-medium truncate text-right">{playerData.coachLicenseNumber}</span>
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
                <span className="text-white truncate">{playerData.email || "rayhanshorker108@gmail.com"}</span>
              </div>
              <div className="flex items-center gap-2 w-full min-w-0">
                <span className="shrink-0">📞</span>
                <span className="text-white truncate">{playerData.phone || "+351 912 345 678"}</span>
              </div>
              {playerData.website && (
                <div className="flex items-center gap-2 w-full min-w-0">
                  <span className="shrink-0">🌐</span>
                  <span className="text-white truncate">{playerData.website}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* LEFT COLUMN BOTTOM: Physical Stats & Languages */}
        <div className="order-4 xl:order-0 xl:col-start-1 xl:col-span-4 xl:row-start-2 bg-cardBg rounded-2xl xl:rounded-b-3xl xl:rounded-t-none border border-white/10 xl:border-t-0 p-4 sm:p-6 w-full min-w-0 h-fit space-y-4 sm:space-y-6">
          <div className="grid grid-cols-2 gap-4 pb-4 border-b border-white/5">
            <div>
              <span className="text-gray-400 text-xs sm:text-sm block">Height</span>
              <span className="text-white text-base sm:text-lg font-bold">{playerData.height} cm</span>
            </div>
            <div>
              <span className="text-gray-400 text-xs sm:text-sm block">Weight</span>
              <span className="text-white text-base sm:text-lg font-bold">{playerData.weight} kg</span>
            </div>
          </div>

          <div>
            <h3 className="text-xs sm:text-sm font-semibold mb-3 text-white">Foot Dominance</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col items-center p-3 rounded-xl bg-black/20 border border-white/5">
                <div className="relative size-12 mb-2">
                  <Image src={leftLeg} alt="Left Foot" fill className="object-contain" />
                </div>
                <span className="text-xs text-gray-400">Left Foot</span>
                <span className="text-sm font-bold text-primary">{playerData.leftLegUsage}%</span>
              </div>
              <div className="flex flex-col items-center p-3 rounded-xl bg-black/20 border border-white/5">
                <div className="relative size-12 mb-2">
                  <Image src={rightLeg} alt="Right Foot" fill className="object-contain" />
                </div>
                <span className="text-xs text-gray-400">Right Foot</span>
                <span className="text-sm font-bold text-primary">{playerData.rightLegUsage}%</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-xs sm:text-sm font-semibold mb-2 text-white">Languages</h3>
            <div className="flex flex-wrap gap-2">
              {playerData.languages.map((lang, idx) => (
                <div key={idx} className="bg-black/30 border border-white/10 px-3 py-1.5 rounded-full flex items-center gap-2">
                  <span className="text-xs text-white">{lang.name}</span>
                  <span className={`text-[10px] font-bold ${lang.color}`}>({lang.level})</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-xs sm:text-sm font-semibold mb-3 text-white">Positioning Maps</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="relative aspect-video rounded-xl overflow-hidden border border-white/10 bg-black/40">
                <Image src={positionMap} alt="Pitch Map" fill className="object-cover opacity-80" />
                <span className="absolute bottom-1 left-2 text-[10px] font-bold text-white bg-black/60 px-1.5 py-0.5 rounded">Pitch Map</span>
              </div>
              <div className="relative aspect-video rounded-xl overflow-hidden border border-white/10 bg-black/40">
                <Image src={futsalMap} alt="Futsal Map" fill className="object-cover opacity-80" />
                <span className="absolute bottom-1 left-2 text-[10px] font-bold text-white bg-black/60 px-1.5 py-0.5 rounded">Futsal Map</span>
              </div>
            </div>
          </div>
        </div>

        {/* CENTER COLUMN: Flags, Name, Image, Styles */}
        <div className="order-3 xl:order-0 xl:col-start-5 xl:col-span-4 xl:row-start-1 xl:row-span-2 flex flex-col items-center w-full min-w-0 overflow-hidden">
          {/* Flags & Player Name */}
          <div className="text-center mb-6 sm:mb-8 w-full min-w-0">
            <div className="flex items-center mb-6 sm:mb-8 justify-center w-full min-w-0">
              <div className="relative w-24 h-16 sm:w-32 sm:h-20 shrink-0">
                <Image
                  src={getFlagUrl(playerData.birthCountry)}
                  alt="Birth Country"
                  width={200}
                  height={200}
                  className="object-cover rounded shadow-lg border border-border"
                />
                {playerData.dualNationality && (
                  <div className="absolute -bottom-2 -right-2 w-10 h-6 sm:w-12 sm:h-8 border-2 border-white rounded shadow-md overflow-hidden">
                    <Image
                      src={getFlagUrl(playerData.dualNationality)}
                      alt="Dual Nationality"
                      width={200}
                      height={200}
                      className="object-cover rounded shadow-lg border border-border"
                    />
                  </div>
                )}
              </div>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold font-heading mb-2 flex flex-wrap items-center justify-center gap-2 w-full min-w-0">
              <span className="text-white uppercase tracking-tight">{playerData.fullName}</span>
              <span className="text-green-500 shrink-0">[{playerData.age}]</span>
            </h1>
          </div>

          {/* Position Banner */}
          <div className="mb-6 sm:mb-8 w-full min-w-0 px-2 sm:px-0 flex justify-center">
            <div className="bg-primary/10 border border-primary/30 px-6 py-2 rounded-full text-center">
              <span className="text-primary font-bold text-sm tracking-wider uppercase">
                {getFullWithShortForm(playerData.position)}
              </span>
            </div>
          </div>

          {/* Player Main Image */}
          <div className="relative w-full max-w-[280px] sm:max-w-[340px] aspect-3/4 mb-6 sm:mb-8 rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-black/40">
            <Image
              src={playerData.playerImage}
              alt={playerData.fullName}
              fill
              className="object-cover"
            />
          </div>

          {/* Playing Styles */}
          <div className="w-full px-4 sm:px-6">
            <div className="bg-cardBg p-4 rounded-xl border border-white/10 flex flex-wrap justify-center gap-2">
              {playerData.selectedStyleIds.map((style, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 rounded-full text-xs font-semibold bg-white/5 border border-white/10 text-white uppercase tracking-wider"
                >
                  {style.replace(/-/g, " ")}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Desktop Certificate, Strength Sliders, Career & Season Stats */}
        <div className="order-5 xl:order-0 xl:col-start-9 xl:col-span-4 xl:row-start-1 xl:row-span-2 flex flex-col gap-4 sm:gap-6 bg-cardBg rounded-2xl sm:rounded-3xl w-full min-w-0 overflow-hidden h-fit">
          <DesktopCertificateCard playerData={playerData} />

          {/* Strength Sliders */}
          <div className="p-4 sm:p-6 border-t border-white/5">
            <h2 className="text-base sm:text-lg text-center font-heading font-normal mb-4 text-white">
              Player Strengths
            </h2>
            <div className="flex flex-col gap-3">
              {Object.entries(playerData.strengths).map(([key, val]) => (
                <div key={key} className="flex flex-col gap-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-400 capitalize">{key}</span>
                    <span className="text-white font-bold">{val}</span>
                  </div>
                  <Progress
                    value={val}
                    className="h-1.5 bg-[#333]"
                    indicatorClassName={
                      val >= 80 ? "bg-green-500" : val >= 60 ? "bg-yellow-500" : "bg-red-500"
                    }
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Career Accomplishments & Season Stats */}
          <div className="p-4 sm:p-6 border-t border-white/5">
            <h2 className="text-base sm:text-lg text-center font-heading font-normal mb-4 text-white">
              Season Statistics
            </h2>
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="bg-black/20 p-3 rounded-xl border border-white/5 text-center">
                <span className="text-xs text-gray-400 block">Matches</span>
                <span className="text-xl font-bold text-white">{playerData.seasonStats.matches}</span>
              </div>
              <div className="bg-black/20 p-3 rounded-xl border border-white/5 text-center">
                <span className="text-xs text-gray-400 block">Goals</span>
                <span className="text-xl font-bold text-primary">{playerData.seasonStats.goals}</span>
              </div>
              <div className="bg-black/20 p-3 rounded-xl border border-white/5 text-center">
                <span className="text-xs text-gray-400 block">Assists</span>
                <span className="text-xl font-bold text-green-500">{playerData.seasonStats.assists}</span>
              </div>
              <div className="bg-black/20 p-3 rounded-xl border border-white/5 text-center">
                <span className="text-xs text-gray-400 block">Avg Rating</span>
                <span className="text-xl font-bold text-yellow-500">{playerData.seasonStats.avgRating}</span>
              </div>
            </div>

            <h3 className="text-sm font-semibold mb-3 text-white">Career Highlights</h3>
            <div className="flex flex-col gap-2">
              {playerData.careerHighlights.map((h, i) => (
                <div key={i} className="flex items-center gap-3 p-2 rounded-lg bg-black/20 border border-white/5">
                  <div className="relative size-6 shrink-0">
                    <Image src={h.icon} alt="Trophy" fill className="object-contain" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-xs font-bold text-white truncate block">{h.title}</span>
                    <span className="text-[10px] text-gray-400">{h.club} ({h.year})</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
