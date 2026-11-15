/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Image from "next/image";
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { usePlayerCvView } from "./PlayerCvViewContext";
import goldCard from "@/assets/cvs/gold-card.png";
import pinkCard from "@/assets/cvs/pink-card.png";
import whiteCard from "@/assets/cvs/white-card.png";
import clubFallback from "@/assets/cvs/club1.png";
import playerFallback from "@/assets/cvs/id/player-short-image.png";
import { getFlagUrl } from "../player-cv-details/bio-components/bioConstants";
import { getShortForm, cn } from "@/lib/utils";
import { IconCircleCheck } from "@tabler/icons-react";

interface Attribute {
  name: string;
  score: number;
  status: "Average" | "Good" | "Excellent" | "Outstanding";
}

const getBadgeStatus = (val: number): "Average" | "Good" | "Excellent" | "Outstanding" => {
  if (val >= 90) return "Outstanding";
  if (val >= 80) return "Excellent";
  if (val >= 60) return "Good";
  return "Average";
};

const getBadgeVariant = (status: "Average" | "Good" | "Excellent" | "Outstanding") => {
  switch (status) {
    case "Outstanding":
      return "bg-[#00FF62] text-black border-[#00FF62]";
    case "Excellent":
      return "bg-green-600/20 text-green-400 border-green-500/30";
    case "Good":
      return "bg-yellow-600/20 text-yellow-400 border-yellow-500/30";
    case "Average":
      return "bg-red-600/20 text-red-400 border-red-500/30";
  }
};

const getHexColor = (val: number) => {
  if (val >= 80) return "#22c55e";
  if (val >= 60) return "#eab308";
  return "#ef4444";
};

const getIndicatorColor = (score: number) => {
  if (score >= 80) return "bg-[#22c55e]";
  if (score >= 60) return "bg-[#eab308]";
  return "bg-[#ef4444]";
};

export const ViewPlayerProfile = () => {
  const { playerData, cvData } = usePlayerCvView();

  const overallRating = playerData.rating || 85;
  const cardBg = overallRating >= 80 ? goldCard : overallRating >= 60 ? whiteCard : pinkCard;

  const currentStats = {
    pac: cvData?.fifaCardStats?.pac ?? playerData.strengths.pace ?? 50,
    sho: cvData?.fifaCardStats?.sho ?? playerData.strengths.shooting ?? 50,
    pas: cvData?.fifaCardStats?.pas ?? playerData.strengths.passing ?? 50,
    dri: cvData?.fifaCardStats?.dri ?? playerData.strengths.dribbling ?? 50,
    def: cvData?.fifaCardStats?.def ?? playerData.strengths.defending ?? 50,
    phy: cvData?.fifaCardStats?.phy ?? playerData.strengths.physical ?? 50,
  };

  const attrData: Attribute[] = Array.isArray(cvData?.positionalCoefficients) && cvData.positionalCoefficients.length > 0
    ? cvData.positionalCoefficients.map((p: any) => ({
        name: p.label || p.key || "Skill",
        score: p.score ?? p.value ?? 50,
        status: getBadgeStatus(p.score ?? p.value ?? 50),
      }))
    : (playerData.skillsCategories || [])
        .flatMap((c) => c.skills)
        .slice(0, 12)
        .map((s) => ({
          name: s.name,
          score: s.value,
          status: getBadgeStatus(s.value),
        }));

  const lastName = playerData.fullName?.split(" ").pop()?.toUpperCase() || "PLAYER";
  const positionShort = getShortForm(playerData.position) || "ST";

  const cardImg =
    (typeof playerData.cardImage === "string" && playerData.cardImage.trim()) ||
    (typeof (playerData as any).cardPhoto === "string" && (playerData as any).cardPhoto.trim()) ||
    (typeof (playerData as any).fifaCardStats?.cardImage === "string" && (playerData as any).fifaCardStats.cardImage.trim()) ||
    (typeof (playerData as any).fifaCardStats?.cardPhoto === "string" && (playerData as any).fifaCardStats.cardPhoto.trim()) ||
    "";

  const profileImg =
    (typeof (playerData as any).profileImage === "string" &&
      (playerData as any).profileImage.trim() &&
      !(playerData as any).profileImage.includes("player-short-image") &&
      !(playerData as any).profileImage.includes("player-image")) ||
    (typeof (playerData as any).avatar === "string" &&
      (playerData as any).avatar.trim() &&
      !(playerData as any).avatar.includes("player-short-image") &&
      !(playerData as any).avatar.includes("player-image")) ||
    (typeof playerData.playerImage === "string" &&
      playerData.playerImage.trim() &&
      !playerData.playerImage.includes("player-short-image") &&
      !playerData.playerImage.includes("player-image")) ||
    "";

  const cardDisplayImg = cardImg || profileImg || "/profile_placeholder.jpg";
  const isPlaceholderCard =
    cardDisplayImg === "/profile_placeholder.jpg" ||
    cardDisplayImg === "/profile_placeholder.png" ||
    (typeof cardDisplayImg === "string" && cardDisplayImg.includes("placeholder"));

  const firstClub = playerData.clubs?.[0];
  const clubLogo = firstClub?.logo && !firstClub.logo.startsWith("bg-") ? firstClub.logo : clubFallback;

  return (
    <div className="text-white p-4 lg:p-8 w-full overflow-hidden min-w-0">
      <div className="container mt-10">
        <h2 className="text-3xl font-bold flex items-center justify-center font-heading text-white text-center lg:text-left mb-8">
          PLAYER PROFILE & FIFA CARD
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Section - FIFA Player Card */}
          <div className="lg:col-span-1">
            <div className="bg-[#1a1a1a] rounded-2xl overflow-hidden border border-border">
              <div className="p-4 sm:p-8 flex justify-center">
                <div className="relative w-full max-w-[280px] sm:max-w-[320px] aspect-[450/700] select-none">
                  {/* Card Background Image */}
                  <Image
                    src={cardBg}
                    alt="Card Background"
                    fill
                    className="object-contain pointer-events-none drop-shadow-2xl"
                    priority
                  />

                  {/* Left stats: Rating, Position, Jersey, Flag, Club */}
                  <div className="absolute top-[13.5%] left-[13%] text-black flex flex-col items-center z-20 w-[16%] gap-1 pl-1.5">
                    <span className="text-2xl sm:text-3xl font-extrabold leading-none font-heading tracking-tighter text-gray-950">
                      {overallRating}
                    </span>

                    <span className="bg-black text-white px-1.5 py-0.5 rounded-[3px] text-[8px] sm:text-[9px] font-black tracking-wider uppercase leading-none min-w-7 text-center">
                      {positionShort}
                    </span>

                    <span className="bg-[#E31B23] text-white px-1.5 py-0.5 rounded-[3px] text-[8px] sm:text-[9px] font-black font-mono leading-none tracking-tight min-w-7 text-center">
                      #{playerData.jerseyNumber || 10}
                    </span>

                    <div className="relative w-5.5 sm:w-6.5 h-3.5 sm:h-4.5 rounded-[2px] overflow-hidden border border-black/20 mt-0.5">
                      <Image
                        src={getFlagUrl(playerData.birthCountry)}
                        alt="flag"
                        fill
                        className="object-cover"
                      />
                    </div>

                    <div className="relative size-5.5 sm:size-6.5 mt-0.5">
                      <Image
                        src={clubLogo}
                        alt="club logo"
                        fill
                        className="object-contain"
                      />
                    </div>
                  </div>

                  {/* Player Image */}
                  <div className="absolute top-[12%] right-[11%] w-[58%] h-[40%] flex items-end justify-center z-10 overflow-hidden rounded-t-3xl">
                    <Image
                      src={cardDisplayImg}
                      alt={playerData.fullName || "Player"}
                      fill
                      unoptimized={
                        typeof cardDisplayImg === "string" &&
                        (cardDisplayImg.startsWith("http") || cardDisplayImg.startsWith("/") || cardDisplayImg.startsWith("data:"))
                      }
                      className={cn(
                        "object-contain select-none pointer-events-none transition-all duration-300",
                        isPlaceholderCard && "scale-85 pb-1 opacity-85"
                      )}
                      onError={(e) => {
                        const target = e.currentTarget as HTMLImageElement;
                        target.srcset = "";
                        target.src = "/profile_placeholder.jpg";
                        target.classList.add("scale-85", "pb-1", "opacity-85");
                      }}
                    />
                  </div>

                  {/* Name */}
                  <div className="absolute top-[51%] left-1/2 -translate-x-1/2 w-[85%] text-center pb-1 z-20">
                    <h3 className="text-gray-900 font-heading text-xl sm:text-2xl font-black uppercase tracking-widest truncate">
                      {lastName}
                    </h3>
                  </div>

                  {/* Stats Block */}
                  <div className="absolute top-[59%] left-1/2 -translate-x-1/2 w-[86%] text-black z-20">
                    <div className="flex items-center justify-between gap-2 p-2">
                      <div className="flex-1 flex flex-col gap-1.5">
                        <div className="flex justify-between items-center px-1">
                          <span className="font-extrabold text-base sm:text-lg text-gray-900 leading-none">{currentStats.pac}</span>
                          <span className="font-bold text-xs sm:text-sm text-gray-700 leading-none">PAC</span>
                        </div>
                        <div className="flex justify-between items-center px-1">
                          <span className="font-extrabold text-base sm:text-lg text-gray-900 leading-none">{currentStats.sho}</span>
                          <span className="font-bold text-xs sm:text-sm text-gray-700 leading-none">SHO</span>
                        </div>
                        <div className="flex justify-between items-center px-1">
                          <span className="font-extrabold text-base sm:text-lg text-gray-900 leading-none">{currentStats.pas}</span>
                          <span className="font-bold text-xs sm:text-sm text-gray-700 leading-none">PAS</span>
                        </div>
                      </div>

                      <div className="h-14 border-r-2 border-black/15 mx-1" />

                      <div className="flex-1 flex flex-col gap-1.5">
                        <div className="flex justify-between items-center px-1">
                          <span className="font-extrabold text-base sm:text-lg text-gray-900 leading-none">{currentStats.dri}</span>
                          <span className="font-bold text-xs sm:text-sm text-gray-700 leading-none">DRI</span>
                        </div>
                        <div className="flex justify-between items-center px-1">
                          <span className="font-extrabold text-base sm:text-lg text-gray-900 leading-none">{currentStats.def}</span>
                          <span className="font-bold text-xs sm:text-sm text-gray-700 leading-none">DEF</span>
                        </div>
                        <div className="flex justify-between items-center px-1">
                          <span className="font-extrabold text-base sm:text-lg text-gray-900 leading-none">{currentStats.phy}</span>
                          <span className="font-bold text-xs sm:text-sm text-gray-700 leading-none">PHY</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Performance Circle */}
              <div className="flex justify-center -mt-16 relative z-10">
                <div className="size-28 sm:size-32 rounded-full bg-[#2a2a2a] border-4 border-primary flex items-center justify-center shadow-xl">
                  <span className="text-3xl sm:text-4xl font-bold text-white font-heading">
                    {overallRating}
                  </span>
                </div>
              </div>

              {/* Player Info Summary */}
              <div className="text-center p-4 sm:p-8 space-y-3">
                <h3 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white">
                  {playerData.fullName}
                </h3>
                <div className="flex items-center justify-center gap-2">
                  <span className="text-base text-gray-300 font-bold uppercase tracking-wider">
                    {playerData.birthCountry}
                  </span>
                  <div className="relative w-6 h-4 overflow-hidden rounded-sm border border-border">
                    <Image
                      src={getFlagUrl(playerData.birthCountry)}
                      alt="flag"
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
                <div className="text-lg text-primary font-black uppercase tracking-widest">
                  {playerData.position}
                </div>

                <div className="pt-4 border-t border-white/5">
                  <div className="w-full py-2.5 bg-green-500/10 border border-green-500/20 text-green-500 text-xs font-black uppercase tracking-widest rounded-xl flex items-center gap-2 justify-center">
                    <IconCircleCheck size={16} /> Verified Player CV
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Section - Positional Co-Efficients Table */}
          <div className="lg:col-span-2">
            <div className="space-y-3 sm:space-y-4">
              {attrData.map((attr, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 sm:gap-6 p-3 sm:p-5 bg-[#1a1a1a] border border-border rounded-xl hover:bg-[#222] transition-colors"
                >
                  <div className="flex-1 sm:flex-[1.5] min-w-0">
                    <p className="text-xs sm:text-base font-bold text-gray-200 uppercase tracking-wide truncate">
                      {attr.name}
                    </p>
                  </div>

                  <div className="hidden sm:block flex-2 min-w-0 max-w-xs">
                    <Progress
                      value={attr.score}
                      className="h-2 bg-[#333]"
                      indicatorClassName={getIndicatorColor(attr.score)}
                    />
                  </div>

                  <div className="shrink-0 text-right min-w-8 sm:min-w-20">
                    <span
                      className="text-base sm:text-xl font-black"
                      style={{ color: getHexColor(attr.score) }}
                    >
                      {attr.score}
                    </span>
                  </div>

                  <div className="w-20 sm:w-32 shrink-0">
                    <Badge
                      className={`${getBadgeVariant(attr.status)} border text-[9px] sm:text-xs font-black justify-center w-full py-1 uppercase tracking-wider`}
                    >
                      {attr.status}
                    </Badge>
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
