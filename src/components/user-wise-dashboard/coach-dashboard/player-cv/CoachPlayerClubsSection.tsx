/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from "react";
import Image from "next/image";
import { useCoachPlayerCv } from "./CoachPlayerCvContext";
import { Info } from "lucide-react";
import { cn } from "@/lib/utils";
import clubFallbackLogo from "@/assets/cvs/club1.png";

interface ClubLogoImageProps {
  logo?: string | any;
  name: string;
  className?: string;
}

const ClubLogoImage = ({ logo, name, className }: ClubLogoImageProps) => {
  const getInitialSrc = () => {
    if (!logo || typeof logo !== "string" || logo.startsWith("bg-") || logo.trim() === "") {
      if (name.toLowerCase().includes("manchester city") || name.toLowerCase().includes("man city")) {
        return "/Manchester-City-F.C-Transparent-File 1.png";
      }
      return clubFallbackLogo;
    }
    // Prevent blocked external Wikipedia/Wikimedia images from breaking
    if (logo.includes("wikimedia.org") || logo.includes("wikipedia.org")) {
      if (name.toLowerCase().includes("manchester city") || name.toLowerCase().includes("man city")) {
        return "/Manchester-City-F.C-Transparent-File 1.png";
      }
      return clubFallbackLogo;
    }
    return logo;
  };

  const [src, setSrc] = React.useState(getInitialSrc);
  const [hasError, setHasError] = React.useState(false);

  return (
    <Image
      src={hasError ? clubFallbackLogo : src}
      alt={name}
      width={80}
      height={80}
      className={className}
      onError={() => {
        setHasError(true);
        setSrc(clubFallbackLogo);
      }}
    />
  );
};

export const CoachPlayerClubsSection = () => {
  const { playerData } = useCoachPlayerCv();
  const clubs = playerData?.clubs || [];
  const clubCount = clubs.length;

  return (
    <div className="w-full px-4 sm:px-6 md:px-10 py-10 bg-cardBg rounded-xl mt-10 min-w-0 overflow-hidden">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 sm:mb-8 gap-4 w-full min-w-0">
        <div className="flex items-center gap-2 order-2 sm:order-1 w-full sm:w-1/3 justify-center sm:justify-start">
          <Info size={14} className="text-gray-400" />
          <span className="text-xs text-gray-400">{clubCount}/6 Clubs</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-light text-center text-foreground font-heading order-1 sm:order-2 w-full sm:w-1/3 uppercase tracking-wider">
          Clubs & History
        </h2>
        <div className="order-3 w-full sm:w-1/3 flex justify-center sm:justify-end" />
      </div>

      <div className="border border-border bg-black/30 rounded-2xl p-4 sm:p-8 w-full min-w-0">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 w-full min-w-0">
          {clubs.map((club) => {
            return (
              <div
                key={club.id}
                className="relative border border-border bg-black/20 rounded-lg p-4 sm:p-6 flex flex-col items-center text-center gap-3 sm:gap-4 transition hover:bg-cardBg w-full min-w-0"
              >
                <div className="shrink-0 relative">
                  <div
                    className={cn(
                      "size-16 sm:size-20 rounded-full border-2 flex items-center justify-center overflow-hidden bg-gray-900",
                      club.color || "border-primary"
                    )}
                  >
                    <ClubLogoImage
                      logo={club.logo}
                      name={club.name}
                      className="object-contain p-2"
                    />
                  </div>
                </div>

                <div className="flex-1 w-full min-w-0 flex flex-col items-center">
                  <span className="text-base sm:text-lg font-semibold text-foreground uppercase leading-tight w-full min-w-0 text-center px-4 truncate">
                    {club.name}
                  </span>
                  <div className="flex items-center justify-center gap-1 text-xs sm:text-sm text-gray-400 mt-1">
                    <span>{club.from}</span>
                    <span>-</span>
                    <span>{club.to}</span>
                  </div>
                  {club.isCurrent && (
                    <span className="mt-2 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                      Current Club
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
