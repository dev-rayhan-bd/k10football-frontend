"use client";

import Image from "next/image";
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useClubPlayerCv } from "./ClubPlayerCvContext";
import goldCard from "@/assets/cvs/gold-card.png";
import pinkCard from "@/assets/cvs/pink-card.png";
import whiteCard from "@/assets/cvs/white-card.png";
import clubFallback from "@/assets/cvs/club1.png";
import playerFallback from "@/assets/cvs/id/player-short-image.png";
import { getFlagUrl } from "@/components/cvs/player-cv-details/bio-components/bioConstants";
import { getShortForm } from "@/lib/utils";
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

export const ClubPlayerProfile = () => {
  const { playerData } = useClubPlayerCv();

  const getCardBg = () => {
    if (playerData.rating >= 80) return goldCard;
    if (playerData.rating >= 60) return pinkCard;
    return whiteCard;
  };

  const getCardTierName = () => {
    if (playerData.rating >= 80) return "GOLD";
    if (playerData.rating >= 60) return "SILVER";
    return "BRONZE";
  };

  const attributes: Attribute[] = [
    { name: "Pace", score: playerData.strengths.pace, status: getBadgeStatus(playerData.strengths.pace) },
    { name: "Shooting", score: playerData.strengths.shooting, status: getBadgeStatus(playerData.strengths.shooting) },
    { name: "Passing", score: playerData.strengths.passing, status: getBadgeStatus(playerData.strengths.passing) },
    { name: "Dribbling", score: playerData.strengths.dribbling, status: getBadgeStatus(playerData.strengths.dribbling) },
    { name: "Defending", score: playerData.strengths.defending, status: getBadgeStatus(playerData.strengths.defending) },
    { name: "Physicality", score: playerData.strengths.physical, status: getBadgeStatus(playerData.strengths.physical) },
  ];

  return (
    <div className="w-full mt-10 min-w-0 overflow-hidden">
      <div className="bg-cardBg border border-border/50 rounded-2xl p-6 sm:p-10 w-full min-w-0">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-4xl font-heading font-light text-foreground uppercase tracking-wider mb-2">
            Player Card & Scouting Profile
          </h2>
          <p className="text-muted-foreground text-xs sm:text-sm max-w-lg mx-auto">
            Official K10 football rating card calibrated against professional scouting criteria.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left: FIFA / FUT style card */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative w-full max-w-[280px] sm:max-w-[320px] aspect-[1/1.55] rounded-3xl overflow-hidden shadow-2xl transition-transform hover:scale-105 duration-300">
              <Image
                src={getCardBg()}
                alt="Card Background"
                fill
                className="object-cover"
                priority
              />

              {/* Card Header (Rating, Position, Flag, Club) */}
              <div className="absolute top-8 left-6 flex flex-col items-center gap-1 z-10">
                <span className="text-3xl sm:text-4xl font-black text-black leading-none tracking-tight">
                  {playerData.rating}
                </span>
                <span className="text-xs sm:text-sm font-black text-black/80 tracking-wider">
                  {getShortForm(playerData.position)}
                </span>
                <div className="relative size-5 rounded-full overflow-hidden border border-black/20 my-1">
                  <Image
                    src={getFlagUrl(playerData.birthCountry)}
                    alt={playerData.birthCountry}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="relative size-5 rounded-full overflow-hidden my-0.5">
                  <Image
                    src={clubFallback}
                    alt="Club"
                    fill
                    className="object-contain"
                  />
                </div>
              </div>

              {/* Player Image cutout */}
              <div className="absolute top-10 right-4 w-44 sm:w-52 aspect-square z-10">
                <Image
                  src={playerData.playerImage || playerFallback}
                  alt={playerData.fullName}
                  fill
                  className="object-contain object-bottom"
                />
              </div>

              {/* Card Footer: Player Name & Stats summary */}
              <div className="absolute bottom-6 inset-x-4 flex flex-col items-center z-10 text-black">
                <h3 className="text-base sm:text-lg font-black uppercase tracking-wider truncate max-w-full mb-2">
                  {playerData.fullName}
                </h3>
                <div className="grid grid-cols-6 gap-1 w-full text-center border-t border-black/20 pt-2">
                  <div>
                    <span className="text-[9px] font-bold block text-black/60">PAC</span>
                    <span className="text-xs font-black">{playerData.strengths.pace}</span>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold block text-black/60">SHO</span>
                    <span className="text-xs font-black">{playerData.strengths.shooting}</span>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold block text-black/60">PAS</span>
                    <span className="text-xs font-black">{playerData.strengths.passing}</span>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold block text-black/60">DRI</span>
                    <span className="text-xs font-black">{playerData.strengths.dribbling}</span>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold block text-black/60">DEF</span>
                    <span className="text-xs font-black">{playerData.strengths.defending}</span>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold block text-black/60">PHY</span>
                    <span className="text-xs font-black">{playerData.strengths.physical}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Attribute ratings detailed list */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Card Rating Grade
              </span>
              <Badge variant="outline" className="border-primary/40 text-primary uppercase font-bold tracking-widest text-xs">
                {getCardTierName()} CARD
              </Badge>
            </div>

            <div className="flex flex-col gap-3">
              {attributes.map((attr, idx) => (
                <div
                  key={idx}
                  className="bg-black/20 border border-white/5 rounded-xl p-3 sm:p-4 flex flex-col gap-2"
                >
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-foreground uppercase tracking-wider">
                      {attr.name}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="font-black text-foreground text-sm">{attr.score}</span>
                      <Badge variant={attr.status === "Outstanding" || attr.status === "Excellent" ? "default" : "secondary"}>
                        {attr.status}
                      </Badge>
                    </div>
                  </div>
                  <Progress
                    value={attr.score}
                    className="h-1.5 bg-black/40"
                    indicatorClassName={
                      attr.score >= 80 ? "bg-primary" : attr.score >= 60 ? "bg-amber-500" : "bg-destructive"
                    }
                  />
                </div>
              ))}
            </div>

            {playerData.isVerifiedByCoach && (
              <div className="mt-2 flex items-center gap-2 text-xs text-primary bg-primary/10 border border-primary/30 p-3 rounded-xl">
                <IconCircleCheck className="size-4 shrink-0" />
                <span>Officially validated and approved by certified academy coach</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
