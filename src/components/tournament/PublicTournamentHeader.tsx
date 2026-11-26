"use client";

import Link from "next/link";
import { IconBallFootball } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { stageLabel } from "./tournament.utils";

interface PublicTournamentHeaderProps {
  tournamentStatus?: string;
  isLive?: boolean;
}

export const getStatusTone = (tournamentStatus?: string, isLive?: boolean) => {
  const status = (tournamentStatus || "").toUpperCase();
  if (isLive) return { tone: "live" as const, label: "LIVE" };
  if (status === "COMPLETED") return { tone: "completed" as const, label: "COMPLETED" };
  if (!status || status === "REGISTRATION") return { tone: "upcoming" as const, label: "REGISTRATION OPEN" };
  return { tone: "upcoming" as const, label: stageLabel(status).toUpperCase() };
};

export const StatusPill = ({ tournamentStatus, isLive }: PublicTournamentHeaderProps) => {
  const { tone, label } = getStatusTone(tournamentStatus, isLive);
  return (
    <span
      className={cn(
        "px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest font-orbitron flex items-center gap-1.5 border",
        tone === "live" && "bg-red-500/10 border-red-500/30 text-red-400",
        tone === "completed" && "bg-[#00FF62]/10 border-[#00FF62]/30 text-[#00FF62]",
        tone === "upcoming" && "bg-amber-500/10 border-amber-500/30 text-amber-400"
      )}
    >
      <span className="relative flex size-2">
        {tone === "live" && <span className="absolute inline-flex size-full rounded-full bg-red-500 animate-ping" />}
        <span
          className={cn(
            "relative inline-flex size-2 rounded-full",
            tone === "live" && "bg-red-500",
            tone === "completed" && "bg-[#00FF62]",
            tone === "upcoming" && "bg-amber-400"
          )}
        />
      </span>
      {label}
    </span>
  );
};

const PublicTournamentHeader = ({ tournamentStatus, isLive }: PublicTournamentHeaderProps) => {
  return (
    <div className="bg-[#0E0E10] border-b border-white/10">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="size-8 rounded-xl bg-[#E31B23] flex items-center justify-center">
            <IconBallFootball size={18} className="text-white" />
          </div>
          <span className="text-sm font-black uppercase tracking-wider text-white font-orbitron">K10 Football</span>
        </Link>
        {(tournamentStatus !== undefined || isLive) && (
          <StatusPill tournamentStatus={tournamentStatus} isLive={isLive} />
        )}
      </div>
    </div>
  );
};

export default PublicTournamentHeader;
