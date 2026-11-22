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
import flagFallback from "@/assets/cvs/flag1.png";
import { getFlagUrl } from "../player-cv-details/bio-components/bioConstants";
import { getShortForm, getFullWithShortForm, cn } from "@/lib/utils";
import { IconCircleCheck } from "@tabler/icons-react";
import {
  POSITION_COEFFICIENTS_CONFIG,
  normalizePositionKey,
  calculatePositionOverall,
} from "@/constants/positionAttributes";

interface Attribute {
  key: string;
  name: string;
  score: number;
  status: "Average" | "Good" | "Excellent";
}

const KEY_ALIASES: Record<string, string[]> = {
  composure: ["composure", "composition"],
  composition: ["composition", "composure"],
  tackling: ["tackling", "standingTackle"],
  standingTackle: ["standingTackle", "tackling"],
  interceptions: ["interceptions", "interception"],
  interception: ["interception", "interceptions"],
};

const getBadgeStatus = (val: number): "Average" | "Good" | "Excellent" => {
  if (val >= 80) return "Excellent";
  if (val >= 60) return "Good";
  return "Average";
};

const getBadgeVariant = (status: "Average" | "Good" | "Excellent") => {
  switch (status) {
    case "Excellent":
      return "bg-green-500/10 text-green-500 border-green-500/50";
    case "Good":
      return "bg-yellow-500/10 text-yellow-500 border-yellow-500/50";
    case "Average":
      return "bg-red-500/10 text-red-500 border-red-500/50";
  }
};

const getHexColor = (val: number) => {
  if (val >= 80) return "#22c55e";
  if (val >= 60) return "#eab308";
  return "#ef4444";
};

const getIndicatorColor = (score: number) => {
  if (score >= 80) return "bg-green-500";
  if (score >= 60) return "bg-yellow-500";
  return "bg-red-500";
};

export const ViewPlayerProfile = () => {
  const { playerData, cvData } = usePlayerCvView();

  const canonicalPosition = normalizePositionKey(playerData.position);
  const positionConfig =
    POSITION_COEFFICIENTS_CONFIG[canonicalPosition] || POSITION_COEFFICIENTS_CONFIG.CM;

  const cvCoeffMap: Record<string, number> = {};
  if (Array.isArray(cvData?.positionalCoefficients)) {
    cvData.positionalCoefficients.forEach((item: any) => {
      const k = item?.key;
      const v =
        typeof item?.score === "number"
          ? item.score
          : typeof item?.value === "number"
            ? item.value
            : undefined;
      if (k && typeof v === "number") {
        cvCoeffMap[k] = v;
      }
    });
  }

  const getAttrValueByKey = (key: string): number => {
    const aliases = KEY_ALIASES[key] || [key];

    for (const alias of aliases) {
      if (typeof cvCoeffMap[alias] === "number") {
        return cvCoeffMap[alias];
      }
    }

    if (playerData.skillsCategories && playerData.skillsCategories.length > 0) {
      for (const cat of playerData.skillsCategories) {
        const match = cat.skills?.find((s) => Boolean(s.key && aliases.includes(s.key)));
        if (match && typeof match.value === "number") {
          return match.value;
        }
      }
    }

    const apiCats = cvData?.attributes?.categories as any;
    if (apiCats) {
      for (const c of Object.values(apiCats)) {
        if (c && typeof c === "object") {
          for (const alias of aliases) {
            if (typeof (c as any)[alias] === "number") {
              return (c as any)[alias];
            }
          }
        }
      }
    }

    return 50;
  };

  const attrData: Attribute[] = positionConfig.map((item) => {
    const score = getAttrValueByKey(item.key);
    return {
      key: item.key,
      name: item.label,
      score,
      status: getBadgeStatus(score),
    };
  });

  const attrScoreMap: Record<string, number> = {};
  attrData.forEach((a) => {
    attrScoreMap[a.key] = a.score;
  });

  const calculatedOverall = calculatePositionOverall(playerData.position, attrScoreMap);
  const overallRating =
    typeof cvData?.positionOverall === "number"
      ? cvData.positionOverall
      : playerData.positionOverall ?? calculatedOverall;

  const cardType = overallRating >= 80 ? "gold" : overallRating >= 60 ? "white" : "pink";
  const cardBg = cardType === "gold" ? goldCard : cardType === "white" ? whiteCard : pinkCard;

  const isGoalkeeper = canonicalPosition === "GK";
  const fifaStats = cvData?.fifaCardStats;

  const currentStats = isGoalkeeper
    ? {
        pac: fifaStats?.pac ?? fifaStats?.diving ?? getAttrValueByKey("shotStopping"),
        sho: fifaStats?.sho ?? fifaStats?.handling ?? getAttrValueByKey("handling"),
        pas: fifaStats?.pas ?? fifaStats?.kicking ?? getAttrValueByKey("distribution"),
        dri: fifaStats?.dri ?? fifaStats?.reflexes ?? getAttrValueByKey("reflexes"),
        def: fifaStats?.def ?? fifaStats?.speed ?? getAttrValueByKey("footwork"),
        phy: fifaStats?.phy ?? fifaStats?.positioning ?? getAttrValueByKey("positioning"),
      }
    : {
        pac: fifaStats?.pac ?? playerData.strengths.pace ?? 50,
        sho: fifaStats?.sho ?? playerData.strengths.shooting ?? 50,
        pas: fifaStats?.pas ?? playerData.strengths.passing ?? 50,
        dri: fifaStats?.dri ?? playerData.strengths.dribbling ?? 50,
        def: fifaStats?.def ?? playerData.strengths.defending ?? 50,
        phy: fifaStats?.phy ?? playerData.strengths.physical ?? 50,
      };

  const statLabels = isGoalkeeper
    ? { pac: "DIV", sho: "HAN", pas: "KIC", dri: "REF", def: "SPD", phy: "POS" }
    : { pac: "PAC", sho: "SHO", pas: "PAS", dri: "DRI", def: "DEF", phy: "PHY" };

  const lastName = playerData.fullName?.split(" ").pop()?.toUpperCase() || "PLAYER";
  const positionShort = getShortForm(playerData.position) || canonicalPosition;

  const getValidImg = (img: any): string => {
    if (typeof img === "string") {
      const trimmed = img.trim();
      if (trimmed && !trimmed.includes("placeholder")) {
        return trimmed;
      }
    }
    return "";
  };

  const cardImg =
    (typeof playerData.cardImage === "string" && playerData.cardImage.trim()) ||
    (typeof (playerData as any).cardPhoto === "string" && (playerData as any).cardPhoto.trim()) ||
    (typeof cvData?.fifaCardStats?.cardImage === "string" && cvData.fifaCardStats.cardImage.trim()) ||
    (typeof cvData?.fifaCardStats?.cardPhoto === "string" && cvData.fifaCardStats.cardPhoto.trim()) ||
    "";

  const profileImg =
    getValidImg(playerData.profileImage) ||
    getValidImg((playerData as any).avatar) ||
    getValidImg(playerData.playerImage) ||
    "";

  const cardDisplayImg =
    (typeof cardImg === "string" && cardImg.trim()) ||
    (typeof profileImg === "string" && profileImg.trim()) ||
    "/profile_placeholder.jpg";
  const isPlaceholderCard =
    cardDisplayImg === "/profile_placeholder.jpg" ||
    cardDisplayImg === "/profile_placeholder.png" ||
    (typeof cardDisplayImg === "string" && cardDisplayImg.includes("placeholder"));

  const firstClub = playerData.clubs?.[0];
  const pAny = playerData as any;
  const currentClubHistory = Array.isArray(pAny?.clubHistory)
    ? pAny.clubHistory.find((c: any) => c?.isCurrent) || pAny.clubHistory[0]
    : null;
  const cvClubHistory = Array.isArray(cvData?.clubHistory)
    ? cvData.clubHistory.find((c: any) => c?.isCurrent) || cvData.clubHistory[0]
    : null;

  const clubLogo =
    (typeof pAny?.clubLogo === "string" && pAny.clubLogo.trim()) ||
    (typeof cvData?.clubLogo === "string" && cvData.clubLogo.trim()) ||
    (typeof pAny?.currentClubLogo === "string" && pAny.currentClubLogo.trim()) ||
    (typeof currentClubHistory?.logoUrl === "string" && currentClubHistory.logoUrl.trim()) ||
    (typeof cvClubHistory?.logoUrl === "string" && cvClubHistory.logoUrl.trim()) ||
    (firstClub?.logo && typeof firstClub.logo === "string" && !firstClub.logo.startsWith("bg-") && firstClub.logo.trim()
      ? firstClub.logo.trim()
      : clubFallback);

  const birthFlagUrl = playerData.birthCountry ? getFlagUrl(playerData.birthCountry) : "";
  const dualFlagUrl = playerData.dualNationality ? getFlagUrl(playerData.dualNationality) : "";
  const flagSrc = birthFlagUrl || flagFallback;

  return (
    <div className="text-white p-4 lg:p-8 w-full overflow-x-clip min-w-0">
      <div className="container mt-10">
        <h2 className="text-3xl font-bold flex items-center justify-center font-heading text-white text-center lg:text-left">
          POSITIONAL CO-EFFICIENTS
        </h2>
      </div>

      <div className="container grid grid-cols-1 lg:grid-cols-3 gap-8 mt-10">
        {/* Left Section - FIFA Player Card */}
        <div className="lg:col-span-1 bg-cardBg h-fit rounded-xl overflow-hidden">
          <div className="aspect-square rounded-t-xl overflow-hidden bg-linear-to-b from-[#2df168] to-[#39493b] flex items-center justify-center">
            <div className="flex justify-center w-full max-w-67.5 mx-auto">
              <div
                className={cn(
                  "relative w-full aspect-270/385 hover:scale-105 transition-all duration-300 z-0 select-none",
                  cardType === "gold"
                    ? "drop-shadow-[0_0_10px_rgba(253,224,71,0.5)] hover:drop-shadow-[0_0_25px_rgba(253,224,71,0.95)]"
                    : cardType === "white"
                      ? "drop-shadow-[0_0_10px_rgba(255,255,255,0.5)] hover:drop-shadow-[0_0_25px_rgba(255,255,255,0.95)]"
                      : "drop-shadow-[0_0_10px_rgba(251,113,133,0.5)] hover:drop-shadow-[0_0_25px_rgba(251,113,133,0.95)]"
                )}
              >
                <Image
                  className="absolute inset-0 w-full h-full object-contain z-0 pointer-events-none"
                  src={cardBg}
                  alt="card background"
                  priority
                />

                {/* Top Left: Rating, Position, Flag, Club */}
                <div className="absolute top-[13.5%] left-[13%] text-black flex flex-col items-center z-20 w-[16%] gap-1 pl-1.5">
                  <span className="text-2xl sm:text-3xl font-extrabold leading-none font-heading tracking-tighter text-gray-950">
                    {overallRating}
                  </span>
                  <span className="bg-black text-white/95 px-1.5 py-0.5 rounded-[3px] text-[8px] sm:text-[9px] font-black tracking-wider uppercase leading-none min-w-7 text-center shadow-xs whitespace-nowrap">
                    {positionShort}
                  </span>
                  <Image
                    width={40}
                    height={28}
                    src={flagSrc}
                    unoptimized={typeof flagSrc === "string" && flagSrc.startsWith("http")}
                    className="w-5.5 sm:w-6.5 h-3.5 sm:h-4.5 object-cover rounded-[2px] shadow-xs"
                    alt="flag"
                  />
                  <Image
                    width={40}
                    height={40}
                    src={clubLogo}
                    unoptimized={typeof clubLogo === "string" && clubLogo.startsWith("http")}
                    className="size-5.5 sm:size-6.5 object-contain"
                    alt="club logo"
                  />
                </div>

                {/* Player Cutout Image */}
                <div className="absolute top-[12%] right-[11%] w-[58%] h-[40%] flex items-end justify-center z-10 overflow-hidden rounded-t-3xl">
                  <Image
                    className={cn(
                      "h-full w-auto object-contain select-none pointer-events-none transition-all duration-300",
                      isPlaceholderCard && "max-h-[85%] max-w-[85%] pb-1 opacity-85"
                    )}
                    width={300}
                    height={400}
                    src={cardDisplayImg}
                    alt={playerData.fullName || "Player"}
                    unoptimized={
                      typeof cardDisplayImg === "string" &&
                      (cardDisplayImg.startsWith("http") || cardDisplayImg.startsWith("/") || cardDisplayImg.startsWith("data:"))
                    }
                    onError={(e) => {
                      const target = e.currentTarget as HTMLImageElement;
                      target.srcset = "";
                      target.src = "/profile_placeholder.jpg";
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
                        <span className="font-bold text-xs sm:text-sm text-gray-700 leading-none">{statLabels.pac}</span>
                      </div>
                      <div className="flex justify-between items-center px-1">
                        <span className="font-extrabold text-base sm:text-lg text-gray-900 leading-none">{currentStats.sho}</span>
                        <span className="font-bold text-xs sm:text-sm text-gray-700 leading-none">{statLabels.sho}</span>
                      </div>
                      <div className="flex justify-between items-center px-1">
                        <span className="font-extrabold text-base sm:text-lg text-gray-900 leading-none">{currentStats.pas}</span>
                        <span className="font-bold text-xs sm:text-sm text-gray-700 leading-none">{statLabels.pas}</span>
                      </div>
                    </div>

                    <div className="h-14 border-r-2 border-black/15 mx-1" />

                    <div className="flex-1 flex flex-col gap-1.5">
                      <div className="flex justify-between items-center px-1">
                        <span className="font-extrabold text-base sm:text-lg text-gray-900 leading-none">{currentStats.dri}</span>
                        <span className="font-bold text-xs sm:text-sm text-gray-700 leading-none">{statLabels.dri}</span>
                      </div>
                      <div className="flex justify-between items-center px-1">
                        <span className="font-extrabold text-base sm:text-lg text-gray-900 leading-none">{currentStats.def}</span>
                        <span className="font-bold text-xs sm:text-sm text-gray-700 leading-none">{statLabels.def}</span>
                      </div>
                      <div className="flex justify-between items-center px-1">
                        <span className="font-extrabold text-base sm:text-lg text-gray-900 leading-none">{currentStats.phy}</span>
                        <span className="font-bold text-xs sm:text-sm text-gray-700 leading-none">{statLabels.phy}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Performance Circle */}
          <div className="flex justify-center -mt-16 relative z-10">
            <div className="size-32 rounded-full bg-[#2a2a2a] border-4 border-primary flex items-center justify-center shadow-xl">
              <span className="text-4xl font-bold text-white font-heading">
                {overallRating}
              </span>
            </div>
          </div>

          {/* Player Info Summary */}
          <div className="text-center p-4 sm:p-8 flex flex-col gap-4">
            <h3 className="text-3xl font-black uppercase tracking-tight text-white">
              {playerData.fullName}
            </h3>
            <div className="flex items-center justify-center gap-2">
              <span className="text-lg text-gray-300 font-bold uppercase tracking-wider">
                {playerData.birthCountry}
              </span>
              <div className="flex items-center gap-2 ml-1">
                {birthFlagUrl && (
                  <Image
                    src={birthFlagUrl}
                    alt="birth country flag"
                    width={40}
                    height={24}
                    unoptimized
                    className="w-8 h-5 object-cover rounded-sm shadow-md"
                  />
                )}
                {dualFlagUrl && (
                  <Image
                    src={dualFlagUrl}
                    alt="dual nationality flag"
                    width={40}
                    height={24}
                    unoptimized
                    className="w-8 h-5 object-cover rounded-sm shadow-md"
                  />
                )}
              </div>
            </div>
            <div className="text-xl sm:text-2xl text-primary/80 font-black uppercase tracking-[0.2em]">
              {getFullWithShortForm(playerData.position)}
            </div>

            {playerData.isVerifiedByCoach && (
              <div className="pt-4 border-t border-white/5">
                <div className="w-full py-2.5 bg-green-500/10 border border-green-500/20 text-green-500 text-xs font-black uppercase tracking-widest rounded-xl flex items-center gap-2 justify-center">
                  <IconCircleCheck size={16} /> CV Verified &amp; Active
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Section - Dynamic Positional Co-Efficients Table */}
        <div className="lg:col-span-2">
          <div className="flex flex-col gap-4">
            {attrData.map((attr, idx) => (
              <div
                key={`${attr.key}-${idx}`}
                className="flex items-center gap-2 sm:gap-6 p-3 sm:p-5 bg-[#1a1a1a] border border-border rounded-lg hover:bg-[#222] transition-colors"
              >
                <div className="flex-1 sm:flex-[1.5] min-w-0">
                  <p className="text-[10px] sm:text-base font-bold text-gray-200 uppercase tracking-wide truncate">
                    {attr.name}
                  </p>
                </div>

                <div className="hidden sm:block flex-2 min-w-0 max-w-xs">
                  <Progress
                    value={attr.score}
                    className="h-2"
                    style={{ backgroundColor: "#333" }}
                    indicatorClassName={getIndicatorColor(attr.score)}
                  />
                </div>

                <div className="shrink-0 text-right min-w-8 sm:min-w-20">
                  <span
                    className="text-base sm:text-xl font-black uppercase"
                    style={{ color: getHexColor(attr.score) }}
                  >
                    {attr.score}
                  </span>
                </div>

                <div className="w-17.5 sm:w-32 shrink-0">
                  <Badge
                    className={`${getBadgeVariant(attr.status)} border text-[8px] sm:text-sm font-black justify-center w-full py-0.5 sm:py-1 uppercase tracking-tighter`}
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
  );
};
