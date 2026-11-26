"use client";

import Image from "next/image";
import { IconShield } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import type { IBadgePreset } from "@/types/extraEvent.type";
import { initials, resolveBadgeSrc, type TournamentTeam } from "./tournament.utils";

type TProps = {
  team: TournamentTeam;
  presets: IBadgePreset[];
  className?: string;
};

/** Logo url → badge preset → initials (shield icon while the team is still TBD). */
const TournamentTeamBadge = ({ team, presets, className = "size-7" }: TProps) => {
  const src = resolveBadgeSrc(team, presets);

  if (src) {
    return (
      <Image
        src={src}
        alt={team.name}
        width={48}
        height={48}
        unoptimized
        className={cn("shrink-0 rounded-full object-contain", className)}
      />
    );
  }

  if (team.isTbd) {
    return <IconShield className={cn("shrink-0 text-white/20", className)} />;
  }

  return (
    <span
      className={cn(
        "shrink-0 rounded-full bg-white/10 border border-white/15 flex items-center justify-center text-[10px] font-black text-white/70 font-orbitron",
        className
      )}
      title={team.name}
    >
      {initials(team.name)}
    </span>
  );
};

export default TournamentTeamBadge;
