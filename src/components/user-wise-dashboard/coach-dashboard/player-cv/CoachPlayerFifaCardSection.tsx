/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Image from "next/image";
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useCoachPlayerCv } from "./CoachPlayerCvContext";
import goldCard from "@/assets/cvs/gold-card.png";
import pinkCard from "@/assets/cvs/pink-card.png";
import whiteCard from "@/assets/cvs/white-card.png";
import clubFallback from "@/assets/cvs/club1.png";
import playerFallback from "@/assets/cvs/id/player-short-image.png";
import { getShortForm, getFullWithShortForm, cn } from "@/lib/utils";

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
      return "border-emerald-500/40 bg-emerald-500/10 text-emerald-400";
    case "Excellent":
      return "border-green-500/40 bg-green-500/10 text-green-400";
    case "Good":
      return "border-yellow-500/40 bg-yellow-500/10 text-yellow-400";
    case "Average":
      return "border-red-500/40 bg-red-500/10 text-red-400";
  }
};

const getIndicatorColor = (score: number) => {
  if (score >= 80) return "bg-green-500";
  if (score >= 60) return "bg-yellow-500";
  return "bg-red-500";
};

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

export const CoachPlayerFifaCardSection = () => {
  const { playerData, cvData } = useCoachPlayerCv();

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

  const attrData: Attribute[] =
    Array.isArray(cvData?.positionalCoefficients) && cvData.positionalCoefficients.length > 0
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

  const firstClub = playerData.clubs?.[0];
  const getFifaClubLogo = () => {
    const rawLogo = firstClub?.logo;
    const name = firstClub?.name || "";
    if (
      !rawLogo ||
      typeof rawLogo !== "string" ||
      rawLogo.startsWith("bg-") ||
      rawLogo.includes("wikimedia.org") ||
      rawLogo.includes("wikipedia.org")
    ) {
      if (name.toLowerCase().includes("manchester city") || name.toLowerCase().includes("man city")) {
        return "/Manchester-City-F.C-Transparent-File 1.png";
      }
      return clubFallback;
    }
    return rawLogo;
  };

  const [fifaClubLogo, setFifaClubLogo] = React.useState(getFifaClubLogo);

  return (
    <div className="text-white p-4 lg:p-8 w-full overflow-hidden min-w-0">
      <div className="container mt-10">
        <h2 className="text-2xl sm:text-4xl font-light font-heading text-white text-center mb-8 uppercase tracking-wider">
          Player Profile & FIFA Card
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Section - FIFA Player Card */}
          <div className="flex flex-col items-center justify-center">
            <div className="relative w-[300px] h-[450px] sm:w-[340px] sm:h-[500px] flex flex-col items-center select-none drop-shadow-[0_15px_30px_rgba(0,0,0,0.8)]">
              {/* Card Background Asset */}
              <Image
                src={cardBg}
                alt="FIFA Card Frame"
                fill
                priority
                className="object-contain pointer-events-none"
              />

              {/* Top Left: Overall Rating, Position, Flag, Club Logo */}
              <div className="absolute top-12 left-8 sm:top-14 sm:left-10 flex flex-col items-center gap-1 z-10">
                <span className="text-4xl sm:text-5xl font-black text-white leading-none tracking-tight">
                  {overallRating}
                </span>
                <span className="text-lg sm:text-xl font-black text-white/90 uppercase">
                  {positionShort}
                </span>
                <div className="w-6 h-4 relative mt-1 overflow-hidden rounded-xs border border-black/40">
                  <Image
                    src={getCountryFlagUrl(playerData.birthCountry)}
                    alt={playerData.birthCountry}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="size-6 relative mt-1">
                  <Image
                    src={fifaClubLogo}
                    alt={firstClub?.name || "Club"}
                    fill
                    className="object-contain"
                    onError={() => setFifaClubLogo(clubFallback)}
                  />
                </div>
              </div>

              {/* Center Player Cutout / Photo */}
              <div className="absolute top-12 right-6 sm:top-14 sm:right-8 w-[170px] h-[200px] sm:w-[190px] sm:h-[220px] z-0 overflow-hidden flex items-end justify-center">
                <Image
                  src={cardDisplayImg}
                  alt={playerData.fullName || "Player"}
                  fill
                  unoptimized={
                    typeof cardDisplayImg === "string" &&
                    (cardDisplayImg.startsWith("http") || cardDisplayImg.startsWith("/") || cardDisplayImg.startsWith("data:"))
                  }
                  className={cn(
                    "object-contain object-bottom select-none pointer-events-none transition-all duration-300",
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

              {/* Lower Half: Name & FIFA Stats */}
              <div className="absolute bottom-10 left-0 right-0 flex flex-col items-center px-8 z-10">
                <h3 className="text-xl sm:text-2xl font-black tracking-wider uppercase text-white mb-2 text-center truncate max-w-[240px]">
                  {lastName}
                </h3>

                <div className="w-[85%] h-px bg-white/30 my-1" />

                {/* 6 Core FIFA Stats Grid */}
                <div className="grid grid-cols-2 gap-x-6 gap-y-1 w-full max-w-[220px] text-xs sm:text-sm font-bold text-white">
                  <div className="flex items-center justify-between">
                    <span className="text-white/70">PAC</span>
                    <span className="font-black text-white">{currentStats.pac}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/70">DRI</span>
                    <span className="font-black text-white">{currentStats.dri}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/70">SHO</span>
                    <span className="font-black text-white">{currentStats.sho}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/70">DEF</span>
                    <span className="font-black text-white">{currentStats.def}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/70">PAS</span>
                    <span className="font-black text-white">{currentStats.pas}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/70">PHY</span>
                    <span className="font-black text-white">{currentStats.phy}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Section - Key Positional Attributes */}
          <div className="lg:col-span-2 bg-black/40 border border-white/10 rounded-2xl p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
                <div>
                  <h3 className="text-lg sm:text-xl font-bold uppercase tracking-wider text-white">
                    Key Evaluated Attributes
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Coach ratings across core attributes for {getFullWithShortForm(playerData.position)}
                  </p>
                </div>
                <Badge variant="outline" className="border-primary/40 bg-primary/10 text-primary font-bold">
                  {attrData.length} Evaluated
                </Badge>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
                {attrData.map((attr, idx) => (
                  <div key={idx} className="flex flex-col gap-1.5 bg-white/5 p-3 rounded-xl border border-white/5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-white font-medium">{attr.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white">{attr.score}</span>
                        <Badge variant="outline" className={`text-[10px] py-0 px-2 font-bold ${getBadgeVariant(attr.status)}`}>
                          {attr.status}
                        </Badge>
                      </div>
                    </div>
                    <Progress
                      value={attr.score}
                      className="h-1.5 bg-black/40"
                      indicatorClassName={getIndicatorColor(attr.score)}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-gray-400">
              <span>Position: {playerData.position}</span>
              <span>Overall Rating Index: <strong className="text-primary">{overallRating}/100</strong></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
