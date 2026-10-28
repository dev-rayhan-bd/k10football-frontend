/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from "react";
import Image from "next/image";
import { useClubPlayerCv } from "./ClubPlayerCvContext";
import { Info } from "lucide-react";
import { cn } from "@/lib/utils";
import clubFallbackLogo from "@/assets/cvs/club1.png";
import { Badge } from "@/components/ui/badge";

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

export const ClubClubSection = () => {
  const { playerData } = useClubPlayerCv();
  const clubs = playerData.clubs || [];

  return (
    <div className="w-full mt-10 min-w-0 overflow-hidden">
      <div className="w-full p-6 sm:p-10 bg-cardBg rounded-xl border border-white/10 flex flex-col items-center">
        <h2 className="text-xl sm:text-3xl font-heading font-medium tracking-wide text-foreground uppercase mb-6 text-center">
          Club Career
        </h2>

        {clubs.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground text-sm">
            No club history available.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-5xl">
            {clubs.map((c, i) => (
              <div
                key={c.id || i}
                className={cn(
                  "p-5 rounded-xl border flex flex-col items-center text-center transition-all",
                  c.isCurrent
                    ? "bg-primary/5 border-primary/30"
                    : "bg-black/20 border-white/5 hover:border-white/15"
                )}
              >
                <div className="relative size-16 mb-3 flex items-center justify-center">
                  <ClubLogoImage logo={c.logo} name={c.name} className="size-16 object-contain" />
                </div>
                <h3 className="text-base font-bold text-foreground truncate max-w-[200px] mb-1">
                  {c.name}
                </h3>
                <span className="text-xs text-muted-foreground mb-3">
                  {c.from} — {c.to}
                </span>
                <Badge variant={c.isCurrent ? "default" : "secondary"}>
                  {c.isCurrent ? "Current Club" : "Past Club"}
                </Badge>
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 flex items-center gap-2 text-xs text-muted-foreground bg-black/20 px-4 py-2 rounded-lg border border-white/5">
          <Info className="size-4 shrink-0 text-primary" />
          <span>
            Scouting note: Career progression verified through official academy registration.
          </span>
        </div>
      </div>
    </div>
  );
};

